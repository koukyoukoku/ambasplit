export const BASE_URL = "http://localhost:8000";

export const TRACKS = [
  { id: "vocals", label: "Vocals", color: "#00f5d4", bg: "rgba(0,245,212,0.07)" },
  { id: "drums",  label: "Drums",  color: "#ff6b6b", bg: "rgba(255,107,107,0.07)" },
  { id: "bass",   label: "Bass",   color: "#ffd166", bg: "rgba(255,209,102,0.07)" },
  { id: "other",  label: "Other",  color: "#a29bfe", bg: "rgba(162,155,254,0.07)" },
];

export const PROCESSING_STEPS = [
  "Queueing job...",
  "Loading model weights...",
  "Analyzing frequency spectrum...",
  "Isolating vocal harmonics...",
  "Extracting drum transients...",
  "Separating bass frequencies...",
  "Processing remaining instruments...",
  "Encoding output stems...",
  "Almost done...",
];

export const ZOOM_LEVELS = [128, 256, 512, 1024, 2048, 4096, 8192];

export const DEFAULT_SETTINGS = {
  model:         "htdemucs",
  stems:         "4",
  format:        "wav",
  sampleRate:    "44100",
  bitDepth:      "24",
  mono:          false,
  autoPlay:      true,
  showTimescale: true,
  theme:         "dark",
  apiUrl:        BASE_URL,
};

export const NAV_ITEMS = [
  { label: "Separate", key: "separate" },
  { label: "Projects", key: "projects" },
  { label: "Settings", key: "settings" },
];