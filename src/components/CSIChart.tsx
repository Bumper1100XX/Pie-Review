import React, { useState, useEffect, useRef } from 'react';
import { Activity, Radio, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { LogEntry } from '../types';

interface CSIChartProps {
  activityLevel: 'No Motion' | 'Fine Motion / Respiration' | 'Activity Detected' | 'Heavy Movement';
  onNewLog: (log: LogEntry) => void;
  selectedChannel: number;
}

export default function CSIChart({ activityLevel, onNewLog, selectedChannel }: CSIChartProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [cameraFeedActive, setCameraFeedActive] = useState(false);
  const [csiFrequency, setCsiFrequency] = useState<number[]>([]);
  const [noiseBaseline, setNoiseBaseline] = useState(0.12);

  const animationRef = useRef<number | null>(null);
  const tickRef = useRef(0);

  // Generate continuous CSI subcarriers data based on activity rate
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      
      // Determine parameters based on motion level
      let frequency = 0.05;
      let noiseScale = 0.05;
      let spikeChance = 0.1;
      let primaryAmp = 0.3;

      switch (activityLevel) {
        case 'No Motion':
          frequency = 0.02;
          noiseScale = 0.03;
          primaryAmp = 0.05;
          break;
        case 'Fine Motion / Respiration':
          frequency = 0.04; // smooth periodic wave imitating breathing
          noiseScale = 0.04;
          primaryAmp = 0.15;
          break;
        case 'Activity Detected':
          frequency = 0.15;
          noiseScale = 0.18;
          primaryAmp = 0.55;
          spikeChance = 0.4;
          break;
        case 'Heavy Movement':
          frequency = 0.28;
          noiseScale = 0.35;
          primaryAmp = 0.85;
          spikeChance = 0.8;
          break;
      }

      // Generate a new series of 24 CSI subcarrier channels (phase and amplitude amplitudes)
      const newFrequencies = Array.from({ length: 24 }, (_, i) => {
        const sinWave = Math.sin((tickRef.current * frequency) + (i * 0.5)) * primaryAmp;
        const randomNoise = (Math.random() - 0.5) * noiseScale;
        const spike = Math.random() < spikeChance ? (Math.random() - 0.5) * 0.2 : 0;
        
        let val = Math.abs(sinWave + randomNoise + spike);
        if (isCalibrating) {
          // Flatten signals during physical calibration filters
          val = val * (0.15 + (1 - (calibrationProgress / 100)) * 0.8);
        }
        return Math.min(Math.max(val, 0.02), 0.98);
      });

      setCsiFrequency(newFrequencies);

      // Log telemetry point every 10 ticks
      if (tickRef.current % 5 === 0) {
        const averageVariance = newFrequencies.reduce((sum, v) => sum + v, 0) / newFrequencies.length;
        const rssiValue = -45 - Math.floor(averageVariance * 25) + Math.floor((Math.random() - 0.5) * 4);
        
        onNewLog({
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          nodeId: 'node_esp32_c6',
          signalStrength: rssiValue,
          csiVariance: Number(averageVariance.toFixed(3)),
          activityState: activityLevel
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, activityLevel, isCalibrating, calibrationProgress, onNewLog]);

  // Handle calibration baseline trigger
  useEffect(() => {
    if (!isCalibrating) return;

    const timer = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          setIsCalibrating(false);
          setNoiseBaseline(0.08); // optimized lower noise background filter
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [isCalibrating]);

  const triggerCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
  };

  return (
    <div id="csi_v_chart" className="bg-[#0b1329] border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col gap-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
              WiFi Promiscuous CSI Radar Feed
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Channel {selectedChannel} • 2.4GHz Wi-Fi 6 Sniffer Spectrum
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerCalibration}
            disabled={isCalibrating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border font-sans transition-all cursor-pointer ${
              isCalibrating
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
            {isCalibrating ? `Calibrating ${calibrationProgress}%` : 'Calibrate Baseline'}
          </button>

          <button
            onClick={() => setCameraFeedActive(!cameraFeedActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border font-sans transition-all cursor-pointer ${
              cameraFeedActive
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            {cameraFeedActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Dual-Modal ESP-CAM
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
            }`}
          >
            {isPlaying ? '● LIVE' : '|| PAUSED'}
          </button>
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[230px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-slate-400">Subcarriers signal phase variance map</span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
              {activityLevel}
            </span>
          </div>

          {/* CSI Signal Waves SVG */}
          <div className="flex-1 w-full relative group">
            <svg viewBox="0 0 500 120" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              {/* Target threshold marker */}
              <line 
                x1="0" 
                y1="36" 
                x2="500" 
                y2="36" 
                stroke="#ef4444" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
                opacity="0.4"
              />
              <text x="5" y="32" fill="#ef4444" fontSize="6px" className="font-mono" opacity="0.8">
                ALARM TRIGGER THRESHOLD (0.70 VARIANCE)
              </text>

              {/* Baseline noise plane */}
              <line 
                x1="0" 
                y1={120 - noiseBaseline * 120} 
                x2="500" 
                y2={120 - noiseBaseline * 120} 
                stroke="#10b981" 
                strokeWidth="0.8" 
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text x="5" y={115 - noiseBaseline * 120} fill="#10b981" fontSize="6px" className="font-mono" opacity="0.8">
                STATIC ROOM FILTER BASELINE
              </text>

              {/* Draw connected lines representing subcarriers vectors */}
              <polyline
                fill="none"
                stroke="url(#csiGradient)"
                strokeWidth="2.2"
                points={csiFrequency
                  .map((val, idx) => {
                    const x = (idx / (csiFrequency.length - 1)) * 500;
                    const y = 120 - val * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Gradient def */}
              <defs>
                <linearGradient id="csiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Subcarrier nodes */}
              {csiFrequency.map((val, idx) => {
                const x = (idx / (csiFrequency.length - 1)) * 500;
                const y = 120 - val * 100;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="2.5"
                    className="fill-slate-900 stroke-cyan-400 stroke-[1.5] transition-all duration-150 hover:r-[4px]"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-900 pt-2">
            <span>Pilot Subcarrier -28</span>
            <span>Center Freq</span>
            <span>Data Subcarrier +28</span>
          </div>
        </div>

        {/* Dual Modal Overlay ESP-CAM Simulation */}
        <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[230px] relative overflow-hidden">
          {cameraFeedActive ? (
            <>
              <div className="flex justify-between items-center mb-2 z-10 w-full">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  ESP32-CAM FEED #1
                </span>
                <span className="text-[9px] font-mono text-slate-400">12 fps • Wide Angle</span>
              </div>

              {/* Simulated skeleton tracking overlaid */}
              <div className="flex-1 w-full bg-slate-950/80 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(6,182,212,0.15),transparent_70%]" />
                
                {/* 3D Wireframe room box */}
                <div className="absolute inset-4 border border-cyan-500/5 rotate-z-3 border-dashed rounded" />

                {/* Simulated Pose skeleton */}
                <svg viewBox="0 0 100 100" className="w-full h-[150px] z-10">
                  {/* Human Skeleton lines reacting to activity state */}
                  {activityLevel !== 'No Motion' && (
                    <g className="stroke-cyan-400 stroke-[1.5] fill-none transition-all duration-300">
                      {/* Head */}
                      <circle cx="50" cy="25" r="4.5" className="fill-cyan-400/20 stroke-cyan-400 stroke-[1.2]" />
                      
                      {/* Core spine */}
                      <line x1="50" y1="29.5" x2="50" y2="55" />

                      {/* Arms */}
                      <line 
                        x1="50" 
                        y1="34" 
                        x2={activityLevel === 'Heavy Movement' ? "32" : "38"} 
                        y2={activityLevel === 'Heavy Movement' ? "26" : "40"} 
                      />
                      <line 
                        x1="50" 
                        y1="34" 
                        x2={activityLevel === 'Heavy Movement' ? "68" : "62"} 
                        y2={activityLevel === 'Heavy Movement' ? "28" : "39"} 
                      />

                      {/* Legs */}
                      <line 
                        x1="50" 
                        y1="55" 
                        x2="40" 
                        y2={activityLevel === 'Heavy Movement' ? "75" : "80"} 
                      />
                      <line 
                        x1="50" 
                        y1="55" 
                        x2="60" 
                        y2={activityLevel === 'Heavy Movement' ? "72" : "80"} 
                      />

                      {/* Keypoint dot highlights */}
                      <circle cx="50" cy="34" r="2" fill="#a855f7" />
                      <circle cx="50" cy="55" r="2" fill="#a855f7" />
                    </g>
                  )}

                  {/* Empty room visual if no motion */}
                  {activityLevel === 'No Motion' && (
                    <text x="50%" y="54%" textAnchor="middle" fill="#475569" fontSize="6px" className="font-mono uppercase font-bold tracking-wider">
                      No Human Target Identified
                    </text>
                  )}
                </svg>

                {/* Scanning overlay effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/40 animate-bounce shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>

              <span className="text-[9px] font-mono text-slate-500 mt-1 text-center font-bold">
                *WiFi DensePose skeleton mapping fusion calibrated active
              </span>
            </>
          ) : (
            <div className="flex-1 w-full flex flex-col justify-center items-center text-center gap-3">
              <EyeOff className="w-10 h-10 text-slate-600 stroke-[1.2]" />
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Dual-Modal Sync Off</h4>
                <p className="text-[10px] text-slate-500 max-w-[180px] leading-relaxed mx-auto mt-1">
                  Connect ESP32-CAM video vectors backchannel to overlay skeletal tracking frames.
                </p>
              </div>
              <button
                onClick={() => setCameraFeedActive(true)}
                className="text-[10px] font-mono tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-md hover:bg-cyan-500/20 hover:text-cyan-300 transition-all cursor-pointer"
              >
                ENABLE DUAL MODAL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
