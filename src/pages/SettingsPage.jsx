import { DEFAULT_SETTINGS } from "../constants";

export default function SettingsPage({ settings, setSetting, setSettings, setProjects, onClearProjects, onClearOutputCache }) {
  return (
    <div style={{ animation: "slideUp 0.4s ease", maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.08em" }}>
          CONFIGURATION
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Settings</h2>
      </div>

      <Section title="Separation Model">
        <Row label="Model" desc="AI model used for stem separation">
          <select className="s-select" value={settings.model} onChange={e => setSetting("model", e.target.value)}>
            <option value="htdemucs">htdemucs (recommended)</option>
            <option value="htdemucs_ft">htdemucs_ft (fine-tuned)</option>
            <option value="mdx_extra">mdx_extra</option>
            <option value="mdx_extra_q">mdx_extra_q (lighter)</option>
          </select>
        </Row>
        <Row label="Output Stems" desc="Number of stems to separate into">
          <select className="s-select" value={settings.stems} onChange={e => setSetting("stems", e.target.value)}>
            <option value="4">4 stems (Vocals, Drums, Bass, Other)</option>
            <option value="2">2 stems (Vocals, Accompaniment)</option>
            <option value="6">6 stems (htdemucs only)</option>
          </select>
        </Row>
        <Row label="Mono Mixdown" desc="Convert each stem to mono">
          <Toggle value={settings.mono} onChange={v => setSetting("mono", v)} />
        </Row>
      </Section>

      <Section title="Output Format">
        <Row label="File Format" desc="Output audio format">
          <select className="s-select" value={settings.format} onChange={e => setSetting("format", e.target.value)}>
            <option value="wav">WAV (lossless)</option>
            <option value="flac">FLAC (lossless compressed)</option>
            <option value="mp3">MP3 (lossy)</option>
          </select>
        </Row>
        <Row label="Sample Rate" desc="Output sample rate in Hz">
          <select className="s-select" value={settings.sampleRate} onChange={e => setSetting("sampleRate", e.target.value)}>
            <option value="44100">44,100 Hz (CD quality)</option>
            <option value="48000">48,000 Hz (professional)</option>
            <option value="96000">96,000 Hz (hi-res)</option>
          </select>
        </Row>
        <Row label="Bit Depth" desc="Bit depth for WAV/FLAC output">
          <select className="s-select" value={settings.bitDepth} onChange={e => setSetting("bitDepth", e.target.value)}>
            <option value="16">16-bit</option>
            <option value="24">24-bit (studio)</option>
            <option value="32">32-bit float</option>
          </select>
        </Row>
      </Section>

      <Section title="Waveform Player">
        <Row label="Auto Play" desc="Start playback automatically after separation">
          <Toggle value={settings.autoPlay} onChange={v => setSetting("autoPlay", v)} />
        </Row>
        <Row label="Show Timescale" desc="Display ruler above waveforms">
          <Toggle value={settings.showTimescale} onChange={v => setSetting("showTimescale", v)} />
        </Row>
      </Section>

      <Section title="Backend">
        <Row label="API URL" desc="URL of your running backend server">
          <input
            className="s-input"
            value={settings.apiUrl}
            onChange={e => setSetting("apiUrl", e.target.value)}
            placeholder="http://localhost:8000"
          />
        </Row>
      </Section>

      <Section title="Danger Zone" accent="#ff4757">
        <Row label="Clear Audio Cache" desc="Delete all generated audio files in outputs (projects list is kept)">
          <DangerBtn onClick={() => { if (window.confirm("Delete all cached audio files in outputs?")) onClearOutputCache?.(); }}>
            Clear Cache
          </DangerBtn>
        </Row>
        <Row label="Clear All Projects" desc="Permanently delete all saved project data">
          <DangerBtn onClick={() => { if (window.confirm("Delete all projects?")) (onClearProjects ? onClearProjects() : setProjects([])); }}>
            Clear Projects
          </DangerBtn>
        </Row>
        <Row label="Reset to Defaults" desc="Restore all settings to factory defaults">
          <DangerBtn onClick={() => setSettings(DEFAULT_SETTINGS)}>
            Reset
          </DangerBtn>
        </Row>
      </Section>
    </div>
  );
}

function Section({ title, children, accent = "#00f5d4" }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 3, height: 14, background: accent, borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#ccc", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#444", lineHeight: 1.4 }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0, minWidth: 180 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      className={`s-toggle ${value ? "on" : "off"}`}
      onClick={() => onChange(!value)}
    />
  );
}

function DangerBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)",
        color: "#ff4757", borderRadius: 7, padding: "7px 14px",
        fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
