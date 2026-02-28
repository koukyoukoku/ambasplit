export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07070f; overflow-x: hidden; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  ::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
  ::-webkit-scrollbar-thumb { background: #00f5d4; border-radius: 4px; }

  input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: #1e1e2e; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 11px; height: 11px; border-radius: 50%; background: currentColor; cursor: pointer; }

  .drop-zone { transition: all 0.25s; }
  .drop-zone:hover { border-color: rgba(0,245,212,0.5) !important; background: rgba(0,245,212,0.03) !important; }
  .drop-zone:hover .dz-icon { transform: translateY(-5px) scale(1.06); }
  .dz-icon { transition: transform 0.3s ease; display: block; }

  .nav-item { transition: all 0.15s; }
  .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #e0e0e0 !important; }

  .project-row { transition: background 0.12s; }
  .project-row:hover { background: rgba(255,255,255,0.04) !important; }

  .s-input {
    background: #0e0e1c; border: 1px solid #1a1a2e; color: #ccc;
    border-radius: 7px; padding: 7px 11px; font-size: 13px;
    font-family: 'DM Mono', monospace; outline: none;
    transition: border-color 0.15s; width: 100%;
  }
  .s-input:focus { border-color: rgba(0,245,212,0.4); }

  .s-select {
    background: #0e0e1c; border: 1px solid #1a1a2e; color: #ccc;
    border-radius: 7px; padding: 7px 11px; font-size: 13px;
    font-family: 'DM Mono', monospace; outline: none;
    cursor: pointer; width: 100%;
  }
  .s-select:focus { border-color: rgba(0,245,212,0.4); }

  .s-toggle {
    width: 38px; height: 20px; border-radius: 10px; border: none;
    cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .s-toggle::after {
    content: ''; position: absolute; top: 3px; left: 3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: white; transition: transform 0.2s;
  }
  .s-toggle.on  { background: #00f5d4; }
  .s-toggle.off { background: #2a2a3a; }
  .s-toggle.on::after { transform: translateX(18px); }

  .playlist { background: transparent !important; }
  .playlist .playlist-tracks { overflow-x: auto !important; }
  .playlist .time {
    background: #0a0a14 !important; border-bottom: 1px solid #151525 !important;
    color: #444 !important; font-family: 'DM Mono', monospace !important;
    font-size: 10px !important; height: 26px !important; line-height: 26px !important;
  }
  .playlist .track {
    background: rgba(255,255,255,0.015) !important;
    border-top: 1px solid rgba(255,255,255,0.04) !important;
    border-bottom: none !important;
  }
  .playlist .track:last-child { border-bottom: 1px solid rgba(255,255,255,0.04) !important; }
  .playlist .controls {
    background: #0c0c17 !important;
    border-right: 1px solid rgba(255,255,255,0.06) !important;
    padding: 14px 16px !important;
    display: flex !important; flex-direction: column !important;
    justify-content: center !important; gap: 9px !important; min-height: 148px !important;
  }
  .playlist .controls .track-header {
    font-family: 'DM Sans', sans-serif !important; font-size: 17px !important;
    font-weight: 600 !important; color: #d8d8e8 !important;
    white-space: nowrap !important; overflow: hidden !important;
    text-overflow: ellipsis !important; line-height: 1.3 !important;
  }
  .playlist .controls .volume-wrapper,
  .playlist .controls .channel-volume-wrapper {
    display: flex !important; align-items: center !important; gap: 6px !important;
  }
  .playlist .controls .volume-wrapper label,
  .playlist .controls .channel-volume-wrapper label {
    font-family: 'DM Mono', monospace !important; font-size: 9px !important;
    color: #444 !important; text-transform: uppercase !important;
    letter-spacing: 0.07em !important; min-width: 12px !important;
  }
  .playlist .controls input[type=range] { width: 88px !important; accent-color: #00f5d4 !important; }
  .playlist .controls .btn-mute,
  .playlist .controls .btn-solo {
    background: transparent !important; border: 1px solid #1e1e2e !important;
    color: #444 !important; border-radius: 5px !important; padding: 3px 9px !important;
    font-size: 10px !important; font-weight: 700 !important;
    font-family: 'DM Mono', monospace !important; cursor: pointer !important;
    transition: all 0.12s !important; text-transform: uppercase !important;
  }
  .playlist .controls .btn-mute:hover { border-color: #ff4757 !important; color: #ff4757 !important; }
  .playlist .controls .btn-solo:hover { border-color: #ffd166 !important; color: #ffd166 !important; }
  .playlist .controls .btn-mute.active { background: rgba(255,71,87,0.12) !important; border-color: #ff4757 !important; color: #ff4757 !important; }
  .playlist .controls .btn-solo.active { background: rgba(255,209,102,0.12) !important; border-color: #ffd166 !important; color: #ffd166 !important; }
  .playlist .controls .btn-group { display: flex !important; gap: 4px !important; }
  .playlist .waveform { background: transparent !important; }
  .playlist .waveform canvas { display: block !important; }
  .playlist .cursor { background: rgba(255,255,255,0.65) !important; width: 2px !important; }
  .playlist .waveform .progress { background: rgba(255,255,255,0.025) !important; }
`;