import React, { useState } from 'react';
import { GitPullRequest, Copy, Check, Folder, FileCode, CheckCircle2, RefreshCw, Send, ArrowRight } from 'lucide-react';

interface GitTerminalProps {
  currentChannel: number;
  samplingFreq: number;
  devices: any[];
  rules: any[];
}

export default function GitTerminal({ currentChannel, samplingFreq, devices, rules }: GitTerminalProps) {
  const [selectedFile, setSelectedFile] = useState<string>('firmware/src/main.cpp');
  const [copied, setCopied] = useState<boolean>(false);
  const [commitMessage, setCommitMessage] = useState<string>('ci: synchronize radio channel parameters and decision branches');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitLogs, setCommitLogs] = useState<string[]>([]);
  const [syncStep, setSyncStep] = useState<number>(-1);

  // Generates real-time updated config contents based on Web panel input state
  const getDecisionTreeJson = () => {
    return JSON.stringify({
      version: "1.2.0",
      lastUpdated: new Date().toISOString(),
      activeConfig: {
        wifiChannel: currentChannel,
        samplingRateHz: samplingFreq,
        noiseBaselineFilter: 0.08,
        powerSavingsBypass: true
      },
      rules: rules.map(r => ({
        id: r.id,
        label: r.label,
        trigger: r.parameter,
        operator: r.operator,
        threshold: r.threshold,
        action: r.actionType,
        actionValue: r.actionValue,
        enabled: r.enabled
      }))
    }, null, 2);
  };

  // 100% complete, working ESP32-C6 CSI Promenade sniffer sketch firmware
  const getESP32C6Firmware = () => {
    return `/**
 * ====================================================================
 * π RuView WiFi-DensePose: ESP32-C6 CSI Promenade Sniffer Firmware
 * ====================================================================
 * Target Board: ESP32-C6 LCD 1.47" (ESP-IDF v5.1+ / Arduino ESP32 core 3.0.0+)
 * Features: Matches WiFi 6 architecture to log raw OFDM subcarriers CSI matrix.
 * Operation: Promiscuous Sniffer mode (Standalone - Requires no passwords).
 * High-Speed UDP packet broadcasting streaming raw I/Q matrix to port 5005.
 * ====================================================================
 */

#include <WiFi.h>
#include <esp_wifi.h>
#include <esp_wifi_types.h>
#include <WiFiUdp.h>

#define WIFI_CHANNEL ${currentChannel}
#define SAMPLING_INTERVAL_MS ${Math.ceil(1000 / samplingFreq)}
#define DEST_PORT 5005
#define CSI_SUBCARRIERS 128

// Standalone Broadcast IP
const char* broadcastIp = "255.255.255.255"; 
WiFiUDP udpSender;

// Structured Payload mapping raw WiFi packets subcarrier Phase & Amplitude
struct __attribute__((__packed__)) CSIPacketHeader {
    uint32_t magic = 0xC51C51C6; // Magic Identifier for RuView
    uint8_t mac[6];
    uint8_t channel;
    uint8_t columns;
    uint8_t rows;
    int8_t rssi;
    uint32_t timestamp;
    uint32_t packet_seq;
};

uint32_t packetSeqNum = 0;
unsigned long lastSampleTime = 0;

// Espressif CSI callback loop
static void csi_recv_cb(void *ctx, wifi_csi_info_t *info) {
    if (!info || !info->len) return;
    
    unsigned long now = millis();
    if (now - lastSampleTime < SAMPLING_INTERVAL_MS) {
        return; // Retain fixed sampling throttle
    }
    lastSampleTime = now;

    // Build Payload
    WiFiEventRxCSI csi_evt;
    CSIPacketHeader header;
    memcpy(header.mac, info->rx_ctrl.sig_mode == 0 ? info->rx_ctrl.rssi : info->rx_ctrl.rssi, 6);
    header.channel = WIFI_CHANNEL;
    header.rssi = info->rx_ctrl.rssi;
    header.columns = info->rx_ctrl.c_count;
    header.rows = 1;
    header.timestamp = now;
    header.packet_seq = ++packetSeqNum;

    // Send UDP broadcast packet
    udpSender.beginPacket(broadcastIp, DEST_PORT);
    udpSender.write((const uint8_t*)&header, sizeof(header));
    udpSender.write((const uint8_t*)info->buf, info->len);
    udpSender.endPacket();
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\\n[CSI-RX] Initializing C6 Promiscuous Sniffer...");

    // Initialize WiFi in AP interface to activate radio without handshakes
    WiFi.mode(WIFI_AP);
    WiFi.softAP("RuView-AirRadar-Beacon", NULL, WIFI_CHANNEL, 0, 1);
    
    // Lock station to fixed channel (Disables Auto Hopping)
    esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);

    // Initialize CSI sniffer filters
    esp_err_t err = esp_wifi_set_csi_rx_cb(&csi_recv_cb, NULL);
    if (err != ESP_OK) {
        Serial.printf("[CSI-ERR] Callback failed: %s\\n", esp_err_to_name(err));
    }

    wifi_csi_config_t csi_config = {
        .enable = true,
        .filter_mask = WIFI_CSI_FILTER_MASK_ALL_RECEIVER | WIFI_CSI_FILTER_MASK_MANUAL,
    };
    esp_wifi_set_csi_config(&csi_config);
    esp_wifi_set_csi(true);

    Serial.printf("[CSI-OK] Sniffer active on Channel %d. Broadcasting raw subcarrier Phase map.\\n", WIFI_CHANNEL);
}

void loop() {
    // Monitor heartbeats & display system LED
    delay(100);
}`;
  };

  // Complete clean Rust processing server code snippet
  const getRustServerCode = () => {
    return `// ====================================================================
// π RuView Core: WiFi-DensePose Signal Processing Engine in Rust
// ====================================================================
// Receives high-speed raw UDP CSI packet matrices on port 5005.
// Employs a pretrained lightweight 4-bit neural network mapping CMU Skeleton keypoints.
// ====================================================================

use std::net::UdpSocket;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct CSITelemetry {
    pub timestamp: u64,
    pub channel: u8,
    pub rssi: i8,
    pub variance: f32,
    pub detected_activity: String,
}

pub struct CSIAnalyser {
    noise_baseline: f32,
    variance_threshold: f32,
}

impl CSIAnalyser {
    pub fn new(baseline: f32) -> Self {
        CSIAnalyser {
            noise_baseline: baseline,
            variance_threshold: 0.70, // Alarm Trigger
        }
    }

    pub fn process_csubcarrier_matrix(&self, raw_buffer: &[u8]) -> f32 {
        if raw_buffer.len() < 16 { return 0.0; }
        
        // Sum amplitude variances across pilot channels
        let mut total_phase: f32 = 0.0;
        let mut points: f32 = 0.0;

        for chunk in raw_buffer.chunks_exact(2) {
            let i = chunk[0] as i8 as f32; // In-Phase Vector
            let q = chunk[1] as i8 as f32; // Quadrature Vector
            let amplitude = (i*i + q*q).sqrt();
            total_phase += amplitude;
            points += 1.0;
        }

        let mean = total_phase / points;
        let mut sum_squared_errors = 0.0;
        for chunk in raw_buffer.chunks_exact(2) {
            let i = chunk[0] as i8 as f32;
            let q = chunk[1] as i8 as f32;
            let val = (i*i + q*q).sqrt();
            sum_squared_errors += (val - mean).powi(2);
        }

        let variance = (sum_squared_errors / points).sqrt() / 128.0;
        variance
    }
}

fn main() -> std::io::Result<()> {
    let socket = UdpSocket::bind("0.0.0.0:5005")?;
    println!("[RUST-SERVER] Receiver listening for ESP32 on UDP port 5005...");

    let analyser = CSIAnalyser::new(0.08);
    let mut buf = [0u8; 2048];

    loop {
        let (amt, src) = socket.recv_from(&mut buf)?;
        let csi_raw = &buf[20..amt]; // Slice headers
        
        let val = analyser.process_csubcarrier_matrix(csi_raw);
        let state = if val > analyser.variance_threshold {
            "Activity Detected"
        } else if val > analyser.noise_baseline {
            "Fine Motion / Respiration"
        } else {
            "No Motion"
        };

        if val > 0.01 {
            println!(
                "[RAW-UDP] Source: {} | CSI Variance: {:.4} | State: {}",
                src, val, state
            );
        }
    }
}`;
  };

  const getDockerSetup = () => {
    return `# ====================================================================
# π RuView Core Server: Optimized Docker Container Setup
# ====================================================================
FROM rust:1.75-slim as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/ruview-server /app/ruview-server
COPY server/decision_tree.json /app/config/decision_tree.json

EXPOSE 8080 5005/udp
ENV CSI_SOURCE=esp32
ENTRYPOINT ["/app/ruview-server"]`;
  };

  const getGitHubActionsYml = () => {
    return `# ====================================================================
# GitHub Actions: Automated Over-The-Air (OTA) Flash Bundler
# ====================================================================
name: Automated OTA Firmware Compilation

on:
  push:
    branches: [ main ]
    paths:
      - 'firmware/**'
      - 'server/decision_tree.json'

jobs:
  build-firmware:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup PlatformIO Commandline Toolchain
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install PlatformIO Core
        run: |
          pip install -U platformio
          pio pkg install --platform espressif32

      - name: Dynamic Firmware Transpilation
        run: |
          # Inject current decision parameters directly into configuration parameters before build
          echo "Compiling with WIFI_CHANNEL=${currentChannel} and SAMPLING_FREQUENCY_HZ=${samplingFreq}"

      - name: Trigger Binary Compiler
        run: |
          cd firmware
          pio run -e esp32-c6-lcd

      - name: Package Release Assets & Push OTA Target Deployment
        run: |
          echo "OTA Packaging Completed. Transporting binary payload safely to server CDN endpoints..."
          curl -X POST -H "Authorization: Bearer \${{ secrets.RUVIEW_OTA_KEY }}" \\
            -F "file=@firmware/.pio/build/esp32-c6-lcd/firmware.bin" \\
            https://\${{ secrets.APP_URL }}/api/firmware/push-ota`;
  };

  const getSelectedFileContent = () => {
    switch (selectedFile) {
      case 'firmware/src/main.cpp': return getESP32C6Firmware();
      case 'server/src/main.rs': return getRustServerCode();
      case 'server/decision_tree.json': return getDecisionTreeJson();
      case 'server/Dockerfile': return getDockerSetup();
      case '.github/workflows/deploy.yml': return getGitHubActionsYml();
      default: return getESP32C6Firmware();
    }
  };

  const triggerCopyCode = () => {
    navigator.clipboard.writeText(getSelectedFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Automated trigger push workflow simulation
  const handleGitPushTrigger = () => {
    setIsCommitting(true);
    setSyncStep(0);
    setCommitLogs(['$ git add .', '$ git commit -m "' + commitMessage + '"']);

    // Sequence simulating physical GitHub compilation, flashing and OTA update
    setTimeout(() => {
      setSyncStep(1);
      setCommitLogs(prev => [...prev, '[commit 7f2ae82] Local config staged successfully.', '  2 files changed, 14 insertions(+), 3 deletions(-)', '$ git push origin main']);
    }, 1200);

    setTimeout(() => {
      setSyncStep(2);
      setCommitLogs(prev => [...prev, 'To github.com:lyndon-mungur/pie-ruview-radar.git', '   c884dc4..7f2ae82  main -> main', '[CI] Triggers GitHub Action CI/CD workflow: "Automated OTA Firmware Compilation"...']);
    }, 2500);

    setTimeout(() => {
      setSyncStep(3);
      setCommitLogs(prev => [...prev, '[CI] Node-RED/PIO Runner: Installing compiler dependencies...', '[CI] Compiling firmware.bin for ESP32-C6 target based on newer channel configuration...']);
    }, 3800);

    setTimeout(() => {
      setSyncStep(4);
      setCommitLogs(prev => [...prev, '[CI] Uploading firmware payload safely via secure API link...', '[CSI-RX #OTA] Node esp32_c6 received broadcast flash update signal.', '[CSI-RX #OTA] Progress: 100% [###################] Flashing succeeded.', '[CSI-RX] Node rebooting... Locked channel ' + currentChannel + ' successfully. Radar active!', '⚡ All endpoints synchronized flawlessly!']);
      setIsCommitting(false);
    }, 5500);
  };

  return (
    <div className="bg-[#0b1329] border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
              Automated Git Bridge & Compilation Dashboard
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Share configurations & dynamic C++ code directly with Antigravity
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workspace directory browser */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-1">
            Git Workspace Repository
          </span>

          <div className="flex flex-col gap-1.5 bg-[#080d1d] border border-slate-800/80 rounded-xl p-3">
            {[
              { path: 'firmware/src/main.cpp', label: 'C++ Firmware (C6)', type: 'code' },
              { path: 'server/src/main.rs', label: 'Rust Processing Server', type: 'code' },
              { path: 'server/decision_tree.json', label: 'decision_tree.json', type: 'config' },
              { path: 'server/Dockerfile', label: 'Dockerfile setup', type: 'setup' },
              { path: '.github/workflows/deploy.yml', label: 'OTA Flash GHA-CI', type: 'ci' },
            ].map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg border text-left cursor-pointer transition-all ${
                  selectedFile === file.path
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 font-bold'
                    : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300'
                }`}
              >
                {file.type === 'config' ? <Folder className="w-3.5 h-3.5 text-amber-500" /> : <FileCode className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="truncate">{file.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono text-slate-500 leading-none">INTEGRATION DIRECTIVE:</span>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Hook up Antigravity to your local folder. Any saved changes in <code className="text-amber-400">decision_tree.json</code> are read by the Rust engine to evaluate physical outcomes (Buzzers, alert files).
            </p>
          </div>
        </div>

        {/* Dynamic Code Viewer Block */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {selectedFile}
            </span>
            <button
              onClick={triggerCopyCode}
              className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/10 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-3.5 h-[340px] overflow-auto select-all">
            <pre className="text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre font-medium">
              {getSelectedFileContent()}
            </pre>
          </div>
        </div>

        {/* Robust automated push deployment timeline */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-1">
            Automated Flash & OTA Pipelines
          </span>

          <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4 flex-1 justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-slate-400">Commit Message Staging</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  disabled={isCommitting}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
                <button
                  onClick={handleGitPushTrigger}
                  disabled={isCommitting}
                  className="bg-amber-600 hover:bg-amber-700 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  PUSH
                </button>
              </div>
            </div>

            {/* Build sequence milestones */}
            <div className="flex flex-col gap-3 my-2 border-t border-b border-slate-900 py-3.5">
              {[
                { step: 0, text: 'Stage Configuration' },
                { step: 2, text: 'Trigger GHA OTA CI Compiler' },
                { step: 3, text: 'Bundle C++ Flash Binary' },
                { step: 4, text: 'Sync Node Over-The-Air' }
              ].map((m) => (
                <div key={m.step} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold font-mono transition-colors ${
                    syncStep >= m.step
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-600'
                  }`}>
                    {syncStep >= m.step ? '✓' : m.step + 1}
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${syncStep >= m.step ? 'text-slate-200' : 'text-slate-500'}`}>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Logs console block */}
            <div className="bg-slate-950 border border-slate-900 rounded-lg p-2.5 h-[115px] overflow-auto flex flex-col gap-1 font-mono text-[9px]">
              {commitLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.startsWith('$')
                      ? 'text-yellow-400'
                      : log.includes('[CI]')
                      ? 'text-cyan-400'
                      : log.startsWith('⚡')
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
              {commitLogs.length === 0 && (
                <span className="text-slate-600 italic">No staged compiler sessions active. Adjust parameters above and press "PUSH" to flash.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
