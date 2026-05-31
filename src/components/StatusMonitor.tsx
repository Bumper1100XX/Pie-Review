import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, Sliders, BellDot } from 'lucide-react';
import { LogEntry, SystemAlert } from '../types';

interface StatusMonitorProps {
  logs: LogEntry[];
  alerts: SystemAlert[];
  onCheckAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  activityLevel: 'No Motion' | 'Fine Motion / Respiration' | 'Activity Detected' | 'Heavy Movement';
  onActivityLevelChange: (level: 'No Motion' | 'Fine Motion / Respiration' | 'Activity Detected' | 'Heavy Movement') => void;
}

export default function StatusMonitor({
  logs,
  alerts,
  onCheckAlert,
  onClearAllAlerts,
  activityLevel,
  onActivityLevelChange
}: StatusMonitorProps) {
  const currentLogs = logs.slice(0, 7); // Display latest 7 logs

  // Helper styles for state
  const getStateColor = (state: string) => {
    switch (state) {
      case 'No Motion': return 'text-slate-400 bg-slate-900 border-slate-800';
      case 'Fine Motion / Respiration': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Activity Detected': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Heavy Movement': return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400';
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'alert': return 'border-rose-500/25 bg-rose-500/10 text-rose-450';
      case 'warning': return 'border-amber-500/25 bg-amber-500/10 text-amber-400';
      default: return 'border-blue-500/25 bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      {/* Target Motion Simulator Slider */}
      <div className="bg-[#0b1329] border border-slate-850 p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 font-sans">
                Target Motion Simulator
              </h2>
              <p className="text-xs text-slate-400 font-mono">Mock movement patterns to fire rules</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2 mb-4">
            Since we are in a testing sandbox, use this controls group to simulate body movements behind walls. This updates CSI phase variance telemetry in real time!
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              { id: 'No Motion', label: 'Standing Still / Empty Room', desc: 'Minimal ambient static phase fluctuation', val: '0.05 Variance' },
              { id: 'Fine Motion / Respiration', label: 'Breathing / Tiny Twitches', desc: 'Periodic chest ripples (Rhythm tracking)', val: '0.15 Variance' },
              { id: 'Activity Detected', label: 'Human Walking / Walking in Room', desc: 'Distinct peaks passing obstacles/drywalls', val: '0.55 Variance' },
              { id: 'Heavy Movement', label: 'Pacing / Rapid Movements', desc: 'Full-spectrum deep scattering signals', val: '0.85 Variance' }
            ].map((state) => (
              <button
                key={state.id}
                onClick={() => onActivityLevelChange(state.id as any)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 justify-between ${
                  activityLevel === state.id
                    ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/30 text-slate-350'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold font-sans">{state.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 rounded ${
                    activityLevel === state.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {state.val}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans mt-0.5">{state.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Alerts Logger */}
      <div className="bg-[#0b1329] border border-slate-850 p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-450">
                <BellDot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100 font-sans">
                  Real-Time Alerts Log
                </h2>
                <p className="text-xs text-slate-400 font-mono">Active evaluator flags</p>
              </div>
            </div>

            {alerts.length > 0 && (
              <button
                onClick={onClearAllAlerts}
                className="text-[10px] font-mono text-slate-500 hover:text-rose-400 border border-slate-800 bg-slate-900/40 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-800 transition-all"
              >
                Clear Logs
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 justify-between transition-opacity ${getSeverityStyle(
                  alert.severity
                )} ${alert.checked ? 'opacity-40' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">{alert.message}</span>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5 block flex items-center gap-1.5">
                        {alert.source} • {alert.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onCheckAlert(alert.id)}
                    className="p-1 rounded bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-emerald-450 cursor-pointer border border-slate-900/50 transition-colors"
                    title="Acknowledge Alert"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${alert.checked ? 'text-emerald-400' : ''}`} />
                  </button>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2 stroke-[1.2] animate-bounce" />
                <span className="text-xs font-bold font-sans text-slate-200">System Secure & Clean</span>
                <span className="text-[10px] font-mono text-slate-500 mt-1 max-w-[200px]">
                  All WiFi nodes online. No threshold violations staged.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Telemetry DataFrame Logs Table */}
      <div className="bg-[#0b1329] border border-slate-850 p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 font-sans">
                Wi-Fi Subcarriers Dataframe Log
              </h2>
              <p className="text-xs text-slate-400 font-mono">Live UDP packet logger</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-900/80 p-2 text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider border-b border-slate-950">
              <span className="col-span-3">TIME</span>
              <span className="col-span-3 text-right">RSSI</span>
              <span className="col-span-3 text-right">VARIANCE</span>
              <span className="col-span-3 text-right">STATE</span>
            </div>

            <div className="max-h-[260px] overflow-y-auto flex flex-col">
              {currentLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 p-2 text-[10px] font-mono text-slate-300 border-b border-slate-900/40 hover:bg-slate-900/40 transition-colors align-center"
                >
                  <span className="col-span-3 text-slate-500">{log.timestamp}</span>
                  <span className="col-span-3 text-right font-bold text-slate-400">{log.signalStrength} dBm</span>
                  <span className="col-span-3 text-right font-bold text-cyan-400">{log.csiVariance}</span>
                  <span className="col-span-3 text-right font-semibold truncate pl-1">
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold ${getStateColor(log.activityState)}`}>
                      {log.activityState === 'Fine Motion / Respiration' ? 'Respir' : log.activityState === 'Activity Detected' ? 'Motion' : log.activityState === 'Heavy Movement' ? 'Heavy' : 'Static'}
                    </span>
                  </span>
                </div>
              ))}

              {currentLogs.length === 0 && (
                <div className="text-center py-10 text-[10px] text-slate-600 font-mono italic">
                  Listening for UDP broadcast streams...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
