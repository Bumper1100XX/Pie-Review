export interface DeviceNode {
  id: string;
  name: string;
  type: 'sniffer' | 'camera' | 'transmitter' | 'host' | 'display';
  model: string;
  status: 'online' | 'offline' | 'calibrating';
  ipAddress: string;
  lastHeartbeat: string;
  channel: number;
  samplingRateHz: number;
  hardwareSetup: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  signalStrength: number; // RSSI in dBm
  csiVariance: number; // 0.00 to 1.00
  activityState: 'No Motion' | 'Fine Motion / Respiration' | 'Activity Detected' | 'Heavy Movement';
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  source: string;
  severity: 'info' | 'warning' | 'alert';
  message: string;
  checked: boolean;
}

export interface DecisionTreeRule {
  id: string;
  label: string;
  parameter: 'csi_variance' | 'rssi' | 'heartbeat_delay' | 'packet_loss';
  operator: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  actionText: string;
  actionType: 'trigger_alert' | 'update_firmware' | 'active_buzzer' | 'led_color' | 'git_commit';
  actionValue: string;
  enabled: boolean;
}

export interface GitCommit {
  hash: string;
  author: string;
  timestamp: string;
  message: string;
  filesChanged: string[];
}
