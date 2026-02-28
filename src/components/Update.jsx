import React from "react";

export default function UpdateDialog({ open, onClose, version, notes }) {
  const handleUpdate = () => {
    console.log("Updating to version:", version);
  };

  if (!open) return null;

  return (
    <>
      <div className="ud-overlay" onClick={onClose}>
        <div className="ud-card" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="ud-header">
            <div className="ud-badge">UPDATE</div>
            <h2 className="ud-title">New version available</h2>
            <p className="ud-subtitle">A new version is ready to install</p>
            <button className="ud-close" onClick={onClose}>×</button>
          </div>

          {/* Version pill */}
          <div className="ud-version-row">
            <span className="ud-version-label">VERSION</span>
            <span className="ud-version-pill">{version}</span>
          </div>

          {/* Release notes */}
          <div className="ud-notes-label">RELEASE NOTES</div>
          <div className="ud-notes-box">{notes}</div>

          {/* Actions */}
          <div className="ud-actions">
            <button className="ud-btn-cancel" onClick={onClose}>Later</button>
            <button className="ud-btn-update" onClick={handleUpdate}>
              <span className="ud-btn-icon">↑</span> Update Now
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .ud-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: ud-fade 0.2s ease-out;
          font-family: 'DM Sans', sans-serif;
        }

        .ud-card {
          background: #0e0e1c;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 28px;
          width: 460px;
          max-width: calc(100vw - 32px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,212,0.06);
          animation: ud-slide 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }

        .ud-header {
          margin-bottom: 22px;
          padding-right: 28px;
        }

        .ud-badge {
          display: inline-block;
          background: rgba(0,245,212,0.1);
          border: 1px solid rgba(0,245,212,0.25);
          color: #00f5d4;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          padding: 3px 9px;
          border-radius: 100px;
          margin-bottom: 12px;
        }

        .ud-title {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 600;
          color: #e8e8f0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .ud-subtitle {
          margin: 0;
          font-size: 13px;
          color: #4a4a6a;
          line-height: 1.5;
        }

        .ud-close {
          position: absolute;
          top: 22px;
          right: 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #555;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          transition: all 0.15s;
        }
        .ud-close:hover {
          background: rgba(255,255,255,0.08);
          color: #aaa;
        }

        .ud-version-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(0,245,212,0.04);
          border: 1px solid rgba(0,245,212,0.12);
          border-radius: 10px;
        }

        .ud-version-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #555581;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }

        .ud-version-pill {
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          font-weight: 500;
          color: #00f5d4;
          letter-spacing: 0.02em;
        }

        .ud-notes-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #47476e;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .ud-notes-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 16px;
          min-height: 100px;
          max-height: 220px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.7;
          color: #7a7a9a;
          white-space: pre-line;
          margin-bottom: 24px;
          font-family: 'DM Mono', monospace;
        }

        .ud-notes-box::-webkit-scrollbar { width: 4px; }
        .ud-notes-box::-webkit-scrollbar-track { background: transparent; }
        .ud-notes-box::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 4px; }

        .ud-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .ud-btn-cancel {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #555;
          padding: 9px 20px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .ud-btn-cancel:hover {
          background: rgba(255,255,255,0.04);
          color: #888;
        }

        .ud-btn-update {
          background: linear-gradient(135deg, #00f5d4, #a29bfe);
          border: none;
          color: #07070f;
          padding: 9px 22px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: opacity 0.15s, transform 0.15s;
        }
        .ud-btn-update:hover  { opacity: 0.9; transform: translateY(-1px); }
        .ud-btn-update:active { transform: translateY(0); }

        .ud-btn-icon {
          font-size: 15px;
          line-height: 1;
        }

        @keyframes ud-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ud-slide {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        @media (max-width: 520px) {
          .ud-card { padding: 20px; }
          .ud-title { font-size: 19px; }
          .ud-actions { flex-direction: column-reverse; }
          .ud-btn-cancel, .ud-btn-update { width: 100%; justify-content: center; padding: 12px; }
        }
      `}</style>
    </>
  );
}