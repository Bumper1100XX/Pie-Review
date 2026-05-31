import React, { useState, useCallback } from 'react';
import { Radio, RefreshCw, Layers, ShieldAlert, Cpu, GitBranch, Github, ExternalLink, CheckCircle2 } from 'lucide-react';
import { DeviceNode, LogEntry, SystemAlert, DecisionTreeRule } from './types';
import CSIChart from './components/CSIChart';
import StatusMonitor from './components/StatusMonitor';
import DeviceConfigurator from './components/DeviceConfigurator';
import DecisionTreeManager from './components/DecisionTreeManager';
import GitTerminal from './components/GitTerminal';

export default function App() {
  const [activityLevel, setActivityLevel] = useState<'No Motion' | 'Fine Motion / Respiration' | 'Activity Detected' | 'Heavy Movement'>('Fine Motion / Respiration');
  const [selectedChannel, setSelectedChannel] = useState<number>(6);
  const [selectedFreq, setSelectedFreq] = useState<number>(40);

  // Initial devices desk state
  const [devices, setDevices] = useState<DeviceNode[]>([
    {
      id: 'node_esp32_c6',
      name: 'ESP32-C6 Sniffer Node',
      type: 'sniffer',
      model: 'ESP32-C6-LCD-1.47',
      status: 'online',
      ipAddress: '192.168.4.15',
      lastHeartbeat: new Date().toLocaleTimeString(),
      channel: 6,
      samplingRateHz: 40,
      hardwareSetup: 'Standalone LiPo Mode + MT3608 Booster'
    },
    {
      id: 'node_esp32_cam1',
      name: 'ESP32-CAM Dual-Modal Vision',
      type: 'camera',
      model: 'OV2640 Lens Cam',
      status: 'online',
      ipAddress: '192.168.4.18',
      lastHeartbeat: new Date().toLocaleTimeString(),
      channel: 6,
      samplingRateHz: 12,
      hardwareSetup: 'Dual-Modal Skelton overlay calibration'
    },
    {
      id: 'beacon_router',
      name: 'TP-Link Radar Transmitter',
      type: 'transmitter',
      model: 'WR841N v14 AP',
      status: 'online',
      ipAddress: '192.168.4.1',
      lastHeartbeat: 'Static AP Beacon',
      channel: 6,
      samplingRateHz: 0,
      hardwareSetup: 'Offline Sandbox Wi-Fi Hotspot'
    },
    {
      id: 'host_laptop',
      name: 'Local CSI Observatory Server',
      type: 'host',
      model: 'Docker Host Laptop',
      status: 'online',
      ipAddress: '192.168.4.120',
      lastHeartbeat: new Date().toLocaleTimeString(),
      channel: 0,
      samplingRateHz: 0,
      hardwareSetup: 'Ruvnet WiFi-DensePose Processing Engine'
    },
    {
      id: 'unused_phone_display',
      name: 'Handheld Radar Monitor',
      type: 'display',
      model: 'Spare Android Screen',
      status: 'online',
      ipAddress: '192.168.4.22',
      lastHeartbeat: new Date().toLocaleTimeString(),
      channel: 0,
      samplingRateHz: 0,
      hardwareSetup: 'Observer Interface Panel View log'
    }
  ]);

  // Predefined active decision branches matrix
  const [rules, setRules] = useState<DecisionTreeRule[]>([
    {
      id: 'rule_presence',
      label: 'Drywall Human Motion Alert',
      parameter: 'csi_variance',
      operator: 'greater_than',
      threshold: 0.50,
      actionText: 'Status Notification log: "Drywall human movement detected"',
      actionType: 'trigger_alert',
      actionValue: 'Drywall human movement detected',
      enabled: true
    },
    {
      id: 'rule_dropout',
      label: 'Drop Connection Alarm',
      parameter: 'rssi',
      operator: 'less_than',
      threshold: -72,
      actionText: 'RGB LED set color values: Solid Amber RSSI warning',
      actionType: 'led_color',
      actionValue: 'Solid Amber',
      enabled: true
    },
    {
      id: 'rule_watchdog',
      label: 'Watchdog Ping Triggered',
      parameter: 'heartbeat_delay',
      operator: 'greater_than',
      threshold: 30,
      actionText: 'Triggers OTA automated download of binary compilation: Safe Recovery Core',
      actionType: 'update_firmware',
      actionValue: 'Safe Recovery Core',
      enabled: false
    }
  ]);

  // Initial logged UDP frames telemetry stream
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), nodeId: 'node_esp32_c6', signalStrength: -48, csiVariance: 0.12, activityState: 'No Motion' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), nodeId: 'node_esp32_c6', signalStrength: -46, csiVariance: 0.14, activityState: 'Fine Motion / Respiration' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), nodeId: 'node_esp32_c6', signalStrength: -52, csiVariance: 0.48, activityState: 'Activity Detected' }
  ]);

  // System warning notifications
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert_initial',
      timestamp: new Date().toLocaleTimeString(),
      source: 'ESP32-C6 Sniffer Node',
      severity: 'info',
      message: 'Promiscuous mode sniffer connected on default Channel 6.',
      checked: false
    }
  ]);

  // Dynamic pipeline linking live simulated signals back into our ruling system matrix
  const handleNewLog = useCallback((newLog: LogEntry) => {
    setLogs((prev) => [newLog, ...prev]);

    // Check rules on every incoming frame
    rules.forEach((rule) => {
      if (!rule.enabled) return;

      let triggered = false;
      let actualVal = 0;
      let text = '';

      if (rule.parameter === 'csi_variance') {
        actualVal = newLog.csiVariance;
        triggered = rule.operator === 'greater_than' ? actualVal > rule.threshold : actualVal < rule.threshold;
        text = `CSI variation (${actualVal}) violates rule: must be < ${rule.threshold}.`;
      } else if (rule.parameter === 'rssi') {
        actualVal = newLog.signalStrength;
        triggered = rule.operator === 'less_than' ? actualVal < rule.threshold : actualVal > rule.threshold;
        text = `Node RSSI strength drops below warning limit (${actualVal} dBm < ${rule.threshold} dBm).`;
      }

      if (triggered) {
        // Look up if a duplicates warning from the same rule is already active
        setAlerts((currentAlerts) => {
          const duplicate = currentAlerts.find(
            (a) => a.message.includes(rule.label) && !a.checked
          );
          if (duplicate) return currentAlerts;

          return [
            {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toLocaleTimeString(),
              source: newLog.nodeId === 'node_esp32_c6' ? 'ESP32-C6' : 'System',
              severity: rule.actionType === 'trigger_alert' ? 'alert' : 'warning',
              message: `[VIO-RULE] '${rule.label}' Fired • ${rule.actionValue}`,
              checked: false
            },
            ...currentAlerts
          ];
        });
      }
    });
  }, [rules]);

  // Device channel updating propagates triggers
  const handleUpdateDeviceChannel = (id: string, chan: number) => {
    setDevices((current) =>
      current.map((dev) => (dev.id === id ? { ...dev, channel: chan } : dev))
    );
    if (id === 'node_esp32_c6') {
      setSelectedChannel(chan);
      setAlerts((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          source: 'System HubConfig',
          severity: 'info',
          message: `Staged channel update: Locked sniffer receiver to Channel ${chan}.`,
          checked: false
        },
        ...prev
      ]);
    }
  };

  const handleUpdateDeviceFreq = (id: string, freq: number) => {
    setDevices((current) =>
      current.map((dev) => (dev.id === id ? { ...dev, samplingRateHz: freq } : dev))
    );
    if (id === 'node_esp32_c6') {
      setSelectedFreq(freq);
    }
  };

  // Rule matrix adjusters
  const handleAddRule = (newRule: DecisionTreeRule) => {
    setRules((prev) => [...prev, newRule]);
    setAlerts((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        source: 'Decision Config',
        severity: 'info',
        message: `Staged decision tree node added: "${newRule.label}"`,
        checked: false
      },
      ...prev
    ]);
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRuleValue = (id: string, val: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, threshold: val } : r))
    );
  };

  // Resolve warning rows
  const handleCheckAlert = (id: string) => {
    setAlerts((current) =>
      current.map((a) => (a.id === id ? { ...a, checked: true } : a))
    );
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 p-4 md:p-8 flex flex-col gap-8 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Visual Navigation Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <Radio className="w-7 h-7" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#060a16] animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#060a16]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              π RuView <span className="text-xs font-mono font-medium py-1 px-2.5 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 uppercase tracking-widest leading-none">WiFi DENSEPOSE RADER</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Ambient Channel State Information (CSI) 2.4GHz Snooping Sandbox Control Plane
            </p>
          </div>
        </div>

        {/* Global telemetry pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0b1329] border border-slate-850 py-1.5 px-3 rounded-xl flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-black text-slate-500 leading-none">PRIMARY DOCKER BRIDGE:</span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">192.168.4.120:5005 UDP</span>
            </div>
          </div>

          <div className="bg-[#0b1329] border border-slate-850 py-1.5 px-3 rounded-xl flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-black text-slate-500 leading-none">STAGED COMMIT BASELINE:</span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">server/decision_tree.json</span>
            </div>
          </div>

          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="p-3 bg-slate-900/60 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="Open Remote GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Container Blocks Grid */}
      <main className="flex flex-col gap-8">
        
        {/* Row 1: High Fidelity CSI Signal Chart & Pose Skeleton Overlay */}
        <section aria-labelledby="csi_v_chart">
          <CSIChart 
            activityLevel={activityLevel} 
            onNewLog={handleNewLog} 
            selectedChannel={selectedChannel}
          />
        </section>

        {/* Row 2: Status Monitors, Data Logs Table and simulated Activity Trigger Nodes */}
        <section aria-label="System status panels">
          <StatusMonitor 
            logs={logs}
            alerts={alerts}
            onCheckAlert={handleCheckAlert}
            onClearAllAlerts={handleClearAllAlerts}
            activityLevel={activityLevel}
            onActivityLevelChange={setActivityLevel}
          />
        </section>

        {/* Row 3: Physical Device nodes mapping parameters */}
        <section aria-label="Device configuration manager">
          <DeviceConfigurator 
            devices={devices}
            onUpdateDeviceChannel={handleUpdateDeviceChannel}
            onUpdateDeviceFreq={handleUpdateDeviceFreq}
            selectedChannel={selectedChannel}
          />
        </section>

        {/* Row 4: Rule Matrix & Git Compile Flasher Blocks */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8" aria-label="Interactive rule engines and deployment bridges">
          <DecisionTreeManager 
            rules={rules}
            onAddRule={handleAddRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onUpdateRuleValue={handleUpdateRuleValue}
          />
          <GitTerminal 
            currentChannel={selectedChannel}
            samplingFreq={selectedFreq}
            devices={devices}
            rules={rules}
          />
        </section>

      </main>

      {/* Humble Footer */}
      <footer className="border-t border-slate-900/80 pt-6 pb-2 text-center text-xs text-slate-500 font-mono flex flex-col md:flex-row md:items-center justify-between gap-4">
        <span>π RuView Ambient Home Sentry System • Offline Sandbox Mode • 2026</span>
        <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded border border-slate-900 leading-none font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Antigravity Sync Port ready
        </span>
      </footer>

    </div>
  );
}
