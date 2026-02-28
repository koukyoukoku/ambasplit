import { useState, useEffect, useRef, useCallback } from "react";
import WaveformPlaylist from "waveform-playlist";
import EventEmitter from "eventemitter3";
import { TRACKS, ZOOM_LEVELS } from "../constants";

const TRACK_META = Object.fromEntries(TRACKS.map((t) => [t.id, t]));
const FALLBACK_COLORS = ["#00f5d4", "#ff6b6b", "#ffd166", "#a29bfe", "#70a1ff", "#7bed9f"];

export function usePlaylist({ jobId, active, settings, stemKeys = [] }) {
  const containerRef = useRef(null);
  const eeRef        = useRef(null);
  const playlistRef  = useRef(null);
  const isPlayingRef = useRef(false);

  const [isLoading, setIsLoading]     = useState(false);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [zoomLevel, setZoomLevel]     = useState(1024);
  const [pitchSemitones, setPitchSemitones] = useState(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!active || !jobId || !containerRef.current) return;

    if (eeRef.current) eeRef.current.removeAllListeners();
    containerRef.current.innerHTML = "";
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const ee = new EventEmitter();
    eeRef.current = ee;

    const playlist = WaveformPlaylist({
      container: containerRef.current,
      samplesPerPixel: 8192,
      mono: settings.mono,
      waveHeight: 77,
      state: "cursor",
      timescale: settings.showTimescale,
      controls: { show: true, width: 220 },
      colors: {
        waveOutlineColor: "rgba(255,255,255,0.12)",
        timeColor: "#444",
        fadeColor: "transparent",
      },
      zoomLevels: ZOOM_LEVELS,
    }, ee);

    playlistRef.current = playlist;

    ee.on("timeupdate", (t) => setCurrentTime(t));
    ee.on("audiorenderingfinished", (type) => {
      if (type === "buffer") setIsLoading(false);
    });
    ee.on("finished", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    const sourceStemKeys = stemKeys.length > 0 ? stemKeys : TRACKS.map((t) => t.id);
    const normalizedStemKeys = sourceStemKeys
      .map((key) => (key === "no_vocals" ? "other" : key))
      .filter((key, idx, arr) => arr.indexOf(key) === idx);

    playlist
      .load(normalizedStemKeys.map((stemKey, idx) => {
        const meta = TRACK_META[stemKey];
        const color = meta?.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
        const label = meta?.label || stemKey.replace(/_/g, " ");
        const pitchQuery = pitchSemitones ? `?semitones=${encodeURIComponent(pitchSemitones)}` : "";

        return {
          src: `${settings.apiUrl}/api/stem/${jobId}/${stemKey}${pitchQuery}`,
          name: label,
          gain: 1.0,
          muted: false,
          soloed: false,
          waveOutlineColor: color,
        };
      }))
      .then(() => {
        const t = playlist.tracks;
        if (t?.length > 0) setDuration(t[0].endTime || 0);
        setIsLoading(false);
        if (settings.autoPlay || isPlayingRef.current) {
          ee.emit("play");
          setIsPlaying(true);
        }
      })
      .catch(err => {
        console.error("Playlist load error:", err);
        setIsLoading(false);
      });

    return () => {
      try { ee.emit("stop"); } catch {}
      ee.removeAllListeners();
      if (containerRef.current) containerRef.current.innerHTML = "";
      playlistRef.current = null;
      eeRef.current = null;
    };
  }, [active, jobId, settings, stemKeys, pitchSemitones]);

  const handlePlayPause = useCallback(() => {
    const ee = eeRef.current;
    if (!ee || isLoading) return;
    if (isPlaying) { ee.emit("pause"); setIsPlaying(false); }
    else           { ee.emit("play");  setIsPlaying(true); }
  }, [isPlaying, isLoading]);

  const handleStop = useCallback(() => {
    const ee = eeRef.current;
    if (!ee) return;
    ee.emit("stop");
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleZoom = useCallback((direction) => {
    const ee = eeRef.current;
    if (!ee) return;
    setZoomLevel(prev => {
      const idx = ZOOM_LEVELS.indexOf(prev);
      if (direction === "in"  && idx > 0)                      { ee.emit("zoomin");  return ZOOM_LEVELS[idx - 1]; }
      if (direction === "out" && idx < ZOOM_LEVELS.length - 1) { ee.emit("zoomout"); return ZOOM_LEVELS[idx + 1]; }
      return prev;
    });
  }, []);

  const destroy = useCallback(() => {
    if (eeRef.current) {
      try { eeRef.current.emit("stop"); } catch {}
      eeRef.current.removeAllListeners();
    }
    if (containerRef.current) containerRef.current.innerHTML = "";
    playlistRef.current = null;
    eeRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(false);
  }, []);

  const handleSetPitch = useCallback((semitones) => {
    const value = Number.isFinite(semitones) ? semitones : 0;
    setPitchSemitones(Math.max(-12, Math.min(12, value)));
  }, []);

  return {
    containerRef,
    isLoading, isPlaying, currentTime, duration, zoomLevel,
    pitchSemitones,
    handlePlayPause, handleStop, handleZoom, destroy, handleSetPitch,
  };
}
