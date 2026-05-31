import React, { useState } from 'react';
import { Cpu, Wifi, HardDrive, Smartphone, Battery, ToggleLeft, ToggleRight, Info, Zap } from 'lucide-react';
import { DeviceNode } from '../types';

interface ConfiguratorProps {
  devices: DeviceNode[];
  onUpdateDeviceChannel: (id: string, chan: number) => void;
  onUpdateDeviceFreq: (id: string, freq: number) => void;
  selectedChannel: number;
}

export default function DeviceConfigurator({
  devices,
  onUpdateDeviceChannel,
  onUpdateDeviceFreq,
  selectedChannel
}: ConfiguratorProps) {
  const [powerBypassEnabled, setPowerBypassEnabled] = useState(true);
  const [activeBuzzerPin, setActiveBuzzerPin] = useState(false);
  const [activeLdrSchmitt, setActiveLdrSchmitt] = useState(true);
  const [activeLedDimmerVal, setActiveLedDimmerVal] = useState(85);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sniffer': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'camera': return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'transmitter': return <HardDrive className="w-4 h-4 text-pink-400" />;
      case 'host': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'display': return <Smartphone className="w-4 h-4 text-amber-400" />;
      default: return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#0b1329] border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
              Node Topology & Hardware Desk Inventory
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Local channel configurations & GPIO output pins mapping
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device nodes grid list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold font-sans text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-2 flex justify-between items-center">
            <span>Sensing Nodes Grid</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
              Standalone passwordless sniffer mode
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700/60 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-100">{device.name}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      device.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : device.status === 'calibrating'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {device.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    {device.model} • {device.hardwareSetup}
                  </p>
                </div>

                <div className="flex flex-col gap-2 bg-slate-950/60 border border-slate-900 rounded-lg p-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500">Node IP:</span>
                    <span className="text-[10px] font-mono text-slate-300">{device.ipAddress}</span>
                  </div>

                  {device.type === 'sniffer' && (
                    <>
                      {/* Interactive channel select */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-500">Wi-Fi Channel:</span>
                        <select
                          value={device.channel}
                          onChange={(e) => onUpdateDeviceChannel(device.id, Number(e.target.value))}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          {[1, 3, 6, 11, 36, 44, 149].map((ch) => (
                            <option key={ch} value={ch}>Channel {ch}</option>
                          ))}
                        </select>
                      </div>

                      {/* Interactive refresh cycles */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-500">Sampling Rate:</span>
                        <select
                          value={device.samplingRateHz}
                          onChange={(e) => onUpdateDeviceFreq(device.id, Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          {[10, 25, 40, 80, 120].map((hz) => (
                            <option key={hz} value={hz}>{hz} Hz</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {device.type === 'camera' && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500">Trigger Mode:</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">CSI-Co-Pilot</span>
                    </div>
                  )}

                  {device.type === 'display' && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 font-medium">Render Link:</span>
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded">
                        Tethered Display Screen
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-1.5 text-[9px] font-mono text-slate-500">
                  <span>Heartbeat Signal</span>
                  <span>{device.lastHeartbeat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic accessory outputs desk layout mapping parameters */}
        <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold font-sans text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center gap-1">
            <Battery className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Accessory Hardware Pin-Out</span>
          </h3>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900 flex flex-col gap-2.5">
            <h4 className="text-[10px] leading-snug font-sans font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-500" />
              Portable Battery Rig
            </h4>
            <div className="text-[10px] leading-relaxed text-slate-400 font-mono">
              3.7V 2000mAh Battery + 4056 Charger circuit hooked with MT3608 Step-up booster, giving stable 5V output to power your ESP32-C6 sniffer standalone.
            </div>

            <div className="flex justify-between items-center border-t border-slate-900 pt-2.5 mt-1">
              <span className="text-[10px] font-mono text-slate-400">Battery Status Mode</span>
              <button
                onClick={() => setPowerBypassEnabled(!powerBypassEnabled)}
                className="cursor-pointer text-slate-400 hover:text-white"
              >
                {powerBypassEnabled ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold font-mono">
                    ONLINE STANDALONE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/80 border border-slate-800 px-2 rounded font-mono">
                    USB LINE POWERED
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 mt-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-1">
              GPIO Pin Controllers
            </span>

            {/* Dark buzzer pin toggling */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Dark sensitive buzzer</span>
                <span className="text-[10px] font-mono text-slate-500">Transistor Trigger (PIN GPIO18)</span>
              </div>
              <button
                onClick={() => setActiveBuzzerPin(!activeBuzzerPin)}
                className="cursor-pointer transition-all duration-200 focus:outline-none"
              >
                {activeBuzzerPin ? (
                  <ToggleRight className="w-8 h-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            {/* Schmitt triggering using LDR input mapping */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Schmitt-Trigger LDR filter</span>
                <span className="text-[10px] font-mono text-slate-500">Static lighting calibration (PIN GPIO4)</span>
              </div>
              <button
                onClick={() => setActiveLdrSchmitt(!activeLdrSchmitt)}
                className="cursor-pointer transition-all duration-200 focus:outline-none"
              >
                {activeLdrSchmitt ? (
                  <ToggleRight className="w-8 h-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            {/* PWM Dimming widget */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">PWM RGB LED Dimmer</span>
                <span className="font-mono text-cyan-400 font-bold">{activeLedDimmerVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeLedDimmerVal}
                onChange={(e) => setActiveLedDimmerVal(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] font-mono text-slate-500 leading-none">
                Adjusts brightness duty cycle on the WS2812 pixel board
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
