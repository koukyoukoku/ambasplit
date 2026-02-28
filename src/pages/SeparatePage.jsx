import { useEffect, useRef, useState } from "react";
import { TRACKS, PROCESSING_STEPS } from "../constants";
import { useSeparation } from "../hooks/useSeparation";
import { usePlaylist } from "../hooks/usePlaylist";
import { HorizontalSplit, Download } from "@mui/icons-material";
import Upload from "../components/Upload";
import SearchYt from "../components/Search";
import ViewToggle from "../components/ViewToggle";


export default function SeparatePage({
  settings,
  active,
  onNewProject,
  topBarProps,
  openProjectRequest,
}) {
  const [view, setView] = useState("upload");
  const [analysis, setAnalysis] = useState({
    bpm: null,
    key: null,
    analyzing: false,
  });
  const [metronomeOn, setMetronomeOn] = useState(false);
  const currentTimeRef = useRef(0);
  const metroCtxRef = useRef(null);
  const metroTimerRef = useRef(null);
  const metroIntervalRef = useRef(null);

  const {
    phase,
    fileName,
    jobId,
    jobProgress,
    stepIdx,
    jobError,
    stemKeys,
    sourceType,
    handleFile,
    handleYoutube,
    reset,
    openProject,
  } = useSeparation({
    apiUrl: settings.apiUrl,
    settings,
    onDone: ({ jobId: id, fileName: name, stemKeys: doneStemKeys }) => {
      onNewProject?.({
        id,
        name,
        date: new Date().toISOString().slice(0, 10),
        duration: "--:--",
        model: settings.model,
        stems: Number(settings.stems),
        format: settings.format,
        sampleRate: settings.sampleRate,
        bitDepth: settings.bitDepth,
        stemKeys: doneStemKeys,
        size: "--",
      });
    },
  });

  const {
    containerRef,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    zoomLevel,
    pitchSemitones,
    handlePlayPause,
    handleStop,
    handleZoom,
    handleSetPitch,
    destroy,
  } = usePlaylist({
    jobId,
    active: phase === "done" && active,
    settings,
    stemKeys,
  });

  useEffect(() => {
    if (!active || phase !== "done") {
      destroy();
    }
  }, [active, phase, destroy]);

  useEffect(() => {
    if (phase === "done") return;
    setMetronomeOn(false);
    handleSetPitch(0);
  }, [phase, handleSetPitch]);

  useEffect(() => {
    if (!openProjectRequest?.id) return;
    openProject({
      id: openProjectRequest.id,
      name: openProjectRequest.name,
      stemKeys: openProjectRequest.stemKeys,
    });
  }, [openProjectRequest, openProject]);

  useEffect(() => {
    if (!active || phase !== "done") return;
    const onKeyDown = (e) => {
      if (e.code !== "Space") return;
      const tag = e.target?.tagName;
      const isTyping =
        e.target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON";
      if (isTyping) return;
      e.preventDefault();
      handlePlayPause();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, phase, handlePlayPause]);

  useEffect(() => {
    if (!topBarProps) return;
    if (!active) {
      topBarProps({});
      return;
    }
    topBarProps({
      phase,
      fileName,
      currentTime,
      duration,
      zoomLevel,
      isLoading,
      isPlaying,
      onPlayPause: handlePlayPause,
      onStop: handleStop,
      onZoom: handleZoom,
      onExport: () => {},
      onNew: () => {
        destroy();
        reset();
      },
    });
  }, [
    active,
    topBarProps,
    phase,
    fileName,
    currentTime,
    duration,
    zoomLevel,
    isLoading,
    isPlaying,
    handlePlayPause,
    handleStop,
    handleZoom,
    destroy,
    reset,
  ]);

  const isDownloading =
    jobProgress < 20 && sourceType === "youtube" && phase === "processing";

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (phase !== "done" || !jobId || !settings?.apiUrl) return;
    let cancelled = false;
    const run = async () => {
      setAnalysis((prev) => ({ ...prev, analyzing: true }));
      try {
        const res = await fetch(`${settings.apiUrl}/api/analyze/${jobId}`);
        if (!res.ok) throw new Error("failed to fetch stem");
        const data = await res.json();
        if (!cancelled) {
          setAnalysis((prev) => ({
            ...prev,
            bpm: data?.bpm ?? null,
            key: data?.key ?? null,
            analyzing: false,
          }));
        }
      } catch {
        if (!cancelled) {
          setAnalysis((prev) => ({ ...prev, bpm: null, key: null, analyzing: false }));
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [phase, jobId, settings]);

  useEffect(() => {
    const clearMetro = () => {
      if (metroTimerRef.current) {
        clearTimeout(metroTimerRef.current);
        metroTimerRef.current = null;
      }
      if (metroIntervalRef.current) {
        clearInterval(metroIntervalRef.current);
        metroIntervalRef.current = null;
      }
      if (metroCtxRef.current) {
        try { metroCtxRef.current.close(); } catch {}
        metroCtxRef.current = null;
      }
    };

    if (!metronomeOn || !analysis.bpm || !isPlaying || !active || phase !== "done") {
      clearMetro();
      return clearMetro;
    }

    const ac = new (window.AudioContext || window.webkitAudioContext)();
    metroCtxRef.current = ac;
    const beatMs = (60 / analysis.bpm) * 1000;
    const beatSec = 60 / analysis.bpm;
    const tick = () => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.value = 1200;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ac.destination);
      const t = ac.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.start(t);
      osc.stop(t + 0.065);
    };

    const offsetSec = currentTimeRef.current % beatSec;
    const firstDelay = Math.max(0, (beatSec - offsetSec) * 1000);
    metroTimerRef.current = setTimeout(() => {
      tick();
      metroIntervalRef.current = setInterval(tick, beatMs);
    }, firstDelay);

    return () => {
      clearMetro();
    };
  }, [metronomeOn, analysis.bpm, isPlaying, active, phase]);

  return (
    <div style={{ flex: 1 }}>
      {phase === "upload" && (
        <>
          <ViewToggle view={view} setView={setView} />
          {view === "upload" && (
            <Upload onFile={handleFile} jobError={jobError} />
          )}
          {view === "search" && (
            <SearchYt
              onSelectTrack={({ id, title }) => handleYoutube({ id, title })}
            />
          )}
        </>
      )}
      {phase === "processing" && (
        <div
          style={{
            animation: "slideUp 0.4s ease",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div
              style={{
                fontSize: 44,
                marginBottom: 14,
                animation: "pulse 2s infinite",
              }}
            >
              {isDownloading ? (
                <Download sx={{ fontSize: 50, color: "#ffd166" }} />
              ) : (
                <HorizontalSplit sx={{ fontSize: 50, color: "#00f5d4" }} />
              )}
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 400, marginBottom: 7 }}>
              {isDownloading ? "Downloading from YouTube" : "Separating audio"}
            </h2>
            <p
              style={{
                color: "#3a3a4e",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fileName}
            </p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                background: "#0e0e1c",
                borderRadius: 100,
                height: 5,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${jobProgress}%`,
                  background: isDownloading
                    ? "linear-gradient(90deg, #ffd166, #ff6b6b)"
                    : "linear-gradient(90deg, #00f5d4, #a29bfe)",
                  borderRadius: 100,
                  transition: "width 0.3s ease",
                  boxShadow: isDownloading
                    ? "0 0 10px rgba(255,209,102,0.4)"
                    : "0 0 10px rgba(0,245,212,0.4)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#3a3a4e",
              }}
            >
              <span
                style={{
                  color: isDownloading ? "#ffd166" : "#00f5d4",
                  fontFamily: "'DM Mono', monospace",
                  animation: "pulse 1.8s infinite",
                }}
              >
                {isDownloading
                  ? "Fetching audio stream..."
                  : PROCESSING_STEPS[stepIdx]}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>
                {jobProgress}%
              </span>
            </div>
          </div>
          {!isDownloading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TRACKS.map((t, i) => {
                const done = jobProgress / 100 > (i + 1) / TRACKS.length;
                const isActive =
                  Math.floor((jobProgress / 100) * TRACKS.length) === i;
                return (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 14px",
                      background: done ? t.bg : "rgba(255,255,255,0.01)",
                      border: `1px solid ${isActive ? t.color + "44" : "#0e0e1c"}`,
                      borderRadius: 9,
                      transition: "all 0.4s",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: done ? t.color : "#2a2a3a",
                        flex: 1,
                      }}
                    >
                      {t.label.toUpperCase()}
                    </span>
                    {isActive && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: `2px solid ${t.color}`,
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                    )}
                    {done && (
                      <span style={{ color: t.color, fontSize: 12 }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {isDownloading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Connecting to YouTube", done: jobProgress >= 5 },
                { label: "Downloading audio stream", done: jobProgress >= 12 },
                { label: "Converting to WAV", done: jobProgress >= 18 },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    background: step.done
                      ? "rgba(255,209,102,0.06)"
                      : "rgba(255,255,255,0.01)",
                    border: `1px solid ${step.done ? "rgba(255,209,102,0.2)" : "#0e0e1c"}`,
                    borderRadius: 9,
                    transition: "all 0.4s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: step.done ? "#ffd166" : "#2a2a3a",
                      flex: 1,
                    }}
                  >
                    {step.label.toUpperCase()}
                  </span>
                  {step.done ? (
                    <span style={{ color: "#ffd166", fontSize: 12 }}>✓</span>
                  ) : (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid #ffd16644",
                        borderTopColor: "#ffd166",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {phase === "done" && (
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div
            ref={containerRef}
            onWheel={(e) => {
              e.preventDefault();
              handleZoom(e.deltaY < 0 ? "in" : "out");
            }}
            style={{
              background: "#09091380",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 14,
              overflow: "hidden",
              minHeight: isLoading ? 200 : "auto",
            }}
          />
          {isLoading && (
            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                color: "#2dffdc",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                animation: "pulse 1.5s infinite",
              }}
            >
              Decoding audio buffers...
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Model", val: settings.model },
              { label: "BPM", val: analysis.analyzing ? "Analyzing..." : (analysis.bpm ? `${analysis.bpm}` : "--") },
              { label: "Key", val: analysis.analyzing ? "Analyzing..." : (analysis.key || "--") }
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  minWidth: 100,
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 9,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "#3fdbc6",
                    fontFamily: "'DM Mono', monospace",
                    marginBottom: 4,
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#999" }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => handleSetPitch(pitchSemitones - 1)}
              style={{ background: "transparent", border: "1px solid #1a1a2e", color: "#bbb", borderRadius: 7, padding: "7px 12px", fontSize: 12, cursor: "pointer" }}
            >
              Pitch -
            </button>
            <div style={{ border: "1px solid #1a1a2e", borderRadius: 7, padding: "7px 12px", fontSize: 12, color: "#ddd" }}>
              Pitch: {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} st
            </div>
            <button
              onClick={() => handleSetPitch(pitchSemitones + 1)}
              style={{ background: "transparent", border: "1px solid #1a1a2e", color: "#bbb", borderRadius: 7, padding: "7px 12px", fontSize: 12, cursor: "pointer" }}
            >
              Pitch +
            </button>
            <button
              onClick={() => setMetronomeOn((v) => !v)}
              disabled={!analysis.bpm}
              style={{
                background: metronomeOn ? "rgba(0,245,212,0.12)" : "transparent",
                border: "1px solid rgba(0,245,212,0.35)",
                color: analysis.bpm ? "#00f5d4" : "#555",
                borderRadius: 7,
                padding: "7px 12px",
                fontSize: 12,
                cursor: analysis.bpm ? "pointer" : "not-allowed",
              }}
            >
              {metronomeOn ? "Metronome: ON" : "Metronome: OFF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
