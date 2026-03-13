"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Key,
  Database,
  Sliders,
  Shield,
  Save,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [hitlLimit, setHitlLimit] = useState(5);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure pipeline thresholds, API keys, and data sources
        </p>
      </div>

      {/* Demo Mode */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Demo Mode
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              When enabled, pipeline uses pre-loaded data instead of live API calls
            </p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="flex items-center gap-2"
          >
            {demoMode ? (
              <ToggleRight className="w-10 h-10 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Pipeline Thresholds */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          Pipeline Thresholds
        </h3>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">
              AI Confidence Threshold (HITL trigger)
            </label>
            <span className="text-sm font-bold text-blue-400">
              {confidenceThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.6}
            max={0.9}
            step={0.01}
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-600">0.60 (more auto)</span>
            <span className="text-[10px] text-slate-600">0.90 (more human)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">
              Max HITL queue items per day
            </label>
            <span className="text-sm font-bold text-amber-400">{hitlLimit}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={hitlLimit}
            onChange={(e) => setHitlLimit(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            API Keys
          </h3>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-300 transition-colors"
          >
            {showKeys ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {showKeys ? "Hide" : "Show"}
          </button>
        </div>

        <ApiKeyInput label="Anthropic API Key" value="sk-ant-api03-xxxx...xxxx" show={showKeys} />
        <ApiKeyInput label="Polygon RPC URL" value="https://rpc-mumbai.maticvigil.com/v1/xxxx" show={showKeys} />
        <ApiKeyInput label="Agent Private Key" value="0x7a8f...3c2d" show={showKeys} />
        <ApiKeyInput label="Contract Address" value="0x1234...5678" show={showKeys} />
        <ApiKeyInput label="Pinata API Key" value="pin_xxxx...xxxx" show={showKeys} />
      </div>

      {/* Data Sources */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Data Source Configuration
        </h3>

        <SourceConfig name="Reddit" subreddit="r/yourproduct" enabled={true} />
        <SourceConfig name="Twitter/X" handle="@yourproduct" enabled={false} />
        <SourceConfig name="App Store" appId="id1234567890" enabled={true} />
        <SourceConfig name="Google Play" packageId="com.yourproduct" enabled={true} />
        <SourceConfig
          name="Google Sheet (Fallback)"
          sheetId="1abc...xyz"
          enabled={true}
        />
      </div>

      {/* Save */}
      <button className="btn-primary w-full" id="save-settings-btn">
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}

function ApiKeyInput({
  label,
  value,
  show,
}: {
  label: string;
  value: string;
  show: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium mb-1 block">
        {label}
      </label>
      <input
        type={show ? "text" : "password"}
        defaultValue={value}
        className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-400 font-mono focus:outline-none focus:border-purple-500/50 transition-all"
      />
    </div>
  );
}

function SourceConfig({
  name,
  subreddit,
  handle,
  appId,
  packageId,
  sheetId,
  enabled,
}: {
  name: string;
  subreddit?: string;
  handle?: string;
  appId?: string;
  packageId?: string;
  sheetId?: string;
  enabled: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const configValue = subreddit || handle || appId || packageId || sheetId || "";

  return (
    <div className="flex items-center gap-4 py-2">
      <button onClick={() => setIsEnabled(!isEnabled)}>
        {isEnabled ? (
          <ToggleRight className="w-8 h-8 text-emerald-400" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-600" />
        )}
      </button>
      <div className="flex-1">
        <p className={`text-sm font-medium ${isEnabled ? "text-white" : "text-slate-600"}`}>
          {name}
        </p>
        <p className="text-xs text-slate-600 font-mono">{configValue}</p>
      </div>
    </div>
  );
}
