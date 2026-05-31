import React, { useState } from 'react';
import { GitBranch, Plus, Trash2, CheckCircle2, AlertTriangle, Play, HelpCircle, Code } from 'lucide-react';
import { DecisionTreeRule } from '../types';

interface DecisionTreeProps {
  rules: DecisionTreeRule[];
  onAddRule: (rule: DecisionTreeRule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onUpdateRuleValue: (id: string, val: number) => void;
}

export default function DecisionTreeManager({
  rules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onUpdateRuleValue
}: DecisionTreeProps) {
  const [newRuleParam, setNewRuleParam] = useState<'csi_variance' | 'rssi' | 'heartbeat_delay' | 'packet_loss'>('csi_variance');
  const [newRuleOperator, setNewRuleOperator] = useState<'greater_than' | 'less_than' | 'equals'>('greater_than');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(0.6);
  const [newRuleAction, setNewRuleAction] = useState<'trigger_alert' | 'update_firmware' | 'active_buzzer' | 'led_color' | 'git_commit'>('trigger_alert');
  const [newRuleValue, setNewRuleValue] = useState<string>('Drywall Human Target presence identified');
  const [newRuleLabel, setNewRuleLabel] = useState<string>('Drywall Motion Alert');

  const handleCreateRule = () => {
    if (!newRuleLabel.trim()) return;
    
    // Auto-generate some detailed action text
    let actionDesc = '';
    switch (newRuleAction) {
      case 'trigger_alert':
        actionDesc = `Status Notification log: "${newRuleValue}"`;
        break;
      case 'update_firmware':
        actionDesc = `Triggers OTA automated download of binary compilation: ${newRuleValue}`;
        break;
      case 'active_buzzer':
        actionDesc = `Flashes Buzzer on custom output GPIO pin for ${newRuleValue} seconds`;
        break;
      case 'led_color':
        actionDesc = `RGB LED set color values: ${newRuleValue}`;
        break;
      case 'git_commit':
        actionDesc = `Automated Git Commit config with memo: "${newRuleValue}"`;
        break;
    }

    onAddRule({
      id: Math.random().toString(36).substr(2, 9),
      label: newRuleLabel,
      parameter: newRuleParam,
      operator: newRuleOperator,
      threshold: Number(newRuleThreshold),
      actionText: actionDesc,
      actionType: newRuleAction,
      actionValue: newRuleValue,
      enabled: true
    });

    setNewRuleLabel('');
    setNewRuleValue('');
  };

  return (
    <div className="bg-[#0b1329] border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
              Rule-Based Decision Tree Engine
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Saved in <code className="text-amber-400">server/decision_tree.json</code> for Git sync
            </p>
          </div>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-[10px] text-slate-400 font-mono items-center gap-1.5 px-3 py-1">
          <Code className="w-3.5 h-3.5 text-purple-400" />
          Antigravity Editable Schema
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Creator Form */}
        <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4 self-start">
          <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-widest border-b border-slate-900 pb-2">
            Build Branch Node
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Rule Label</label>
            <input
              type="text"
              value={newRuleLabel}
              onChange={(e) => setNewRuleLabel(e.target.value)}
              placeholder="e.g., Drywall Motion Alarm"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-sans text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Telemetry Input</label>
              <select
                value={newRuleParam}
                onChange={(e) => setNewRuleParam(e.target.value as any)}
                className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none"
              >
                <option value="csi_variance">CSI Phase Variance</option>
                <option value="rssi">Node RSSI Strength</option>
                <option value="heartbeat_delay">Offline Seconds</option>
                <option value="packet_loss">UDP Packet Loss %</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Operator</label>
              <select
                value={newRuleOperator}
                onChange={(e) => setNewRuleOperator(e.target.value as any)}
                className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none"
              >
                <option value="greater_than">&gt; Greater Than</option>
                <option value="less_than">&lt; Less Than</option>
                <option value="equals">== Equal To</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Threshold Trigger Value</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                value={newRuleThreshold}
                onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] font-mono text-slate-500">
                {newRuleParam === 'csi_variance' ? 'Float' : newRuleParam === 'rssi' ? 'dBm' : 'Val'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Response Target Action</label>
            <select
              value={newRuleAction}
              onChange={(e) => setNewRuleAction(e.target.value as any)}
              className="px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none"
            >
              <option value="trigger_alert">Alert Status Log</option>
              <option value="update_firmware">Automatic OTA FW Update</option>
              <option value="active_buzzer">Trigger Dark Buzzer PIN</option>
              <option value="led_color">Flash RGB LED Beacon</option>
              <option value="git_commit">Automated Git Commit Update</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Value Parameter</label>
            <input
              type="text"
              value={newRuleValue}
              onChange={(e) => setNewRuleValue(e.target.value)}
              placeholder="e.g., 5 seconds, #FF0000, or alert label"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-sans text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleCreateRule}
            className="w-full mt-2 cursor-pointer flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-medium font-sans shadow-md shadow-purple-900/10 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Branch Logic Node
          </button>
        </div>

        {/* Tree flow visualization lists */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#080d1d] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-sans text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-2 flex justify-between items-center">
                <span>Active Evaluators Matrix</span>
                <span className="text-[10px] text-slate-500 font-mono lower-case">JSON parsed live from repo template</span>
              </h3>

              <div className="flex flex-col gap-3 mt-4 max-h-[280px] overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                      rule.enabled
                        ? 'bg-slate-950 border-slate-850 hover:bg-slate-900/80'
                        : 'bg-slate-950/40 border-slate-900/85 opacity-55'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Interactive toggle block */}
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors border ${
                          rule.enabled
                            ? 'bg-purple-500/25 border-purple-500/40 text-purple-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        {rule.enabled ? '✓' : ''}
                      </button>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 font-sans">{rule.label}</span>
                          <span className="text-[9px] font-mono font-bold bg-slate-900 text-purple-400 border border-slate-800/60 px-1.5 py-0.5 rounded">
                            {rule.parameter.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 leading-relaxed">
                          IF <code className="text-pink-400">{rule.parameter}</code>{' '}
                          {rule.operator === 'greater_than' ? '>' : rule.operator === 'less_than' ? '<' : '=='}{' '}
                          <code className="text-amber-400 font-bold">{rule.threshold}</code>{' '}
                          THEN <span className="text-cyan-400">{rule.actionText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end border-t border-slate-900 md:border-t-0 pt-2 md:pt-0">
                      {rule.parameter === 'csi_variance' && (
                        <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                          <span className="text-slate-500">Value:</span>
                          <input
                            type="number"
                            step="0.05"
                            value={rule.threshold}
                            onChange={(e) => onUpdateRuleValue(rule.id, Number(e.target.value))}
                            className="bg-transparent border-0 w-11 focus:outline-none text-amber-400 text-center font-bold font-mono"
                          />
                        </div>
                      )}
                      
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 bg-slate-900/60 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Delete branch rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {rules.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 border border-dashed border-slate-800/65 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mb-2 stroke-[1.2]" />
                    <p className="text-xs font-sans">No decision branch rules loaded.</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-1 max-w-[280px]">
                      Build branches using the form to configure trigger conditions and pipeline outputs.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Schema synchronized in local runtime state
              </span>
              <span className="bg-purple-950/40 text-purple-400 font-bold px-2 py-0.5 rounded text-[9px] border border-purple-900/35">
                MUTABLE BY GIT COMMIT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
