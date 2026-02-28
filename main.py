import os
import uuid
import json
import subprocess
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, Body, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    import numpy as np
    import librosa
except Exception:
    np = None
    librosa = None

app = FastAPI(title="StemSplit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
PITCH_CACHE_DIR = OUTPUT_DIR / "_pitch_cache"
CONFIG_DIR = Path("config")
PROJECTS_FILE = Path("projects.json")
SETTINGS_FILE = CONFIG_DIR / "settings.json"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
PITCH_CACHE_DIR.mkdir(exist_ok=True)
CONFIG_DIR.mkdir(exist_ok=True)

jobs: dict = {}

STEM_MAP = {
    "vocals": "vocals",
    "drums":  "drums",
    "bass":   "bass",
    "other":  "other",
}


DEFAULT_APP_SETTINGS = {
    "model": "htdemucs",
    "stems": "4",
    "format": "wav",
    "sampleRate": "44100",
    "bitDepth": "24",
    "mono": False,
    "autoPlay": True,
    "showTimescale": True,
    "theme": "dark",
    "apiUrl": "http://localhost:8000",
}


def load_projects() -> list[dict]:
    if not PROJECTS_FILE.exists():
        return []
    try:
        raw = PROJECTS_FILE.read_text(encoding="utf-8")
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []


def save_projects():
    PROJECTS_FILE.write_text(json.dumps(projects, indent=2), encoding="utf-8")


def load_app_settings() -> dict:
    if not SETTINGS_FILE.exists():
        return dict(DEFAULT_APP_SETTINGS)
    try:
        raw = SETTINGS_FILE.read_text(encoding="utf-8")
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return {**DEFAULT_APP_SETTINGS, **parsed}
    except Exception:
        pass
    return dict(DEFAULT_APP_SETTINGS)


def save_app_settings():
    SETTINGS_FILE.write_text(json.dumps(app_settings, indent=2), encoding="utf-8")


projects: list[dict] = load_projects()
app_settings: dict = load_app_settings()


NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
KEY_PROFILE_MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]) if np is not None else None
KEY_PROFILE_MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]) if np is not None else None


def resolve_stems(job_id: str) -> dict[str, Path]:
    stems: dict[str, Path] = {}

    if job_id in jobs:
        for k, v in jobs[job_id].get("stems", {}).items():
            p = Path(v)
            if p.exists():
                stems[k] = p

    if stems:
        return stems

    for ext in ["wav", "mp3", "flac"]:
        for stem_name in ["vocals", "drums", "bass", "other", "no_vocals", "guitar", "piano"]:
            candidates = list((OUTPUT_DIR / job_id).glob(f"**/{stem_name}.{ext}"))
            if candidates:
                key = "other" if stem_name == "no_vocals" else stem_name
                stems[key] = candidates[0]
    return stems


def remove_project_audio(project_id: str):
    # Remove main output folder for the project.
    project_dir = OUTPUT_DIR / str(project_id)
    if project_dir.exists():
        shutil.rmtree(project_dir, ignore_errors=True)

    # Remove pitch-cache files tied to this project.
    if PITCH_CACHE_DIR.exists():
        for cache_file in PITCH_CACHE_DIR.glob(f"{project_id}_*"):
            try:
                cache_file.unlink(missing_ok=True)
            except Exception:
                pass

    # Drop in-memory job entry if present.
    jobs.pop(str(project_id), None)


def clear_all_output_cache() -> dict:
    """
    Clear OUTPUT_DIR contents, but skip any subdirectory whose name
    matches a project ID saved in projects.json so stems remain playable.
    """
    # IDs of projects we must keep
    protected_ids = {str(p.get("id")) for p in projects if p.get("id")}

    removed = {"files": 0, "dirs": 0, "protected": 0}

    if not OUTPUT_DIR.exists():
        return removed

    for child in OUTPUT_DIR.iterdir():
        # Protect job output dirs that belong to saved projects
        if child.is_dir() and child.name in protected_ids:
            removed["protected"] += 1
            continue

        try:
            if child.is_dir():
                shutil.rmtree(child, ignore_errors=True)
                removed["dirs"] += 1
            else:
                child.unlink(missing_ok=True)
                removed["files"] += 1
        except Exception:
            pass

    return removed


def get_sample_rate(path: Path) -> int:
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=sample_rate",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(path),
        ]
        out = subprocess.check_output(cmd, text=True).strip()
        return int(out)
    except Exception:
        return 44100


def pitch_cache_path(job_id: str, stem_name: str, semitones: float) -> Path:
    sem_key = f"{semitones:+.2f}".replace(".", "_").replace("+", "p").replace("-", "m")
    return PITCH_CACHE_DIR / f"{job_id}_{stem_name}_{sem_key}.wav"


def ensure_pitch_shifted(src_path: Path, dst_path: Path, semitones: float):
    if dst_path.exists() and dst_path.stat().st_mtime >= src_path.stat().st_mtime:
        return

    ratio = 2 ** (semitones / 12.0)
    sr = get_sample_rate(src_path)
    tempo = 1.0 / ratio
    cmd = [
        "ffmpeg", "-y",
        "-i", str(src_path),
        "-vn",
        "-af", f"asetrate={sr}*{ratio},aresample={sr},atempo={tempo}",
        str(dst_path),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def analyze_bpm_and_key(job_id: str) -> dict:
    if librosa is None or np is None:
        raise HTTPException(501, "librosa is not installed on backend")

    stems = resolve_stems(job_id)
    if not stems:
        raise HTTPException(404, "No stems found for analysis")

    bpm_src = stems.get("drums") or stems.get("other") or stems.get("vocals") or next(iter(stems.values()))
    key_src = stems.get("other") or stems.get("vocals") or next(iter(stems.values()))

    y_bpm, sr_bpm = librosa.load(str(bpm_src), sr=22050, mono=True, duration=180)
    tempo, _ = librosa.beat.beat_track(y=y_bpm, sr=sr_bpm)
    bpm = int(round(float(tempo))) if tempo is not None else None

    y_key, sr_key = librosa.load(str(key_src), sr=22050, mono=True, duration=180)
    chroma = librosa.feature.chroma_cqt(y=y_key, sr=sr_key)
    chroma_mean = np.mean(chroma, axis=1)
    if np.sum(chroma_mean) == 0:
        key = None
    else:
        chroma_mean = chroma_mean / np.sum(chroma_mean)
        major_scores = [float(np.corrcoef(chroma_mean, np.roll(KEY_PROFILE_MAJOR, i))[0, 1]) for i in range(12)]
        minor_scores = [float(np.corrcoef(chroma_mean, np.roll(KEY_PROFILE_MINOR, i))[0, 1]) for i in range(12)]
        best_major = int(np.argmax(major_scores))
        best_minor = int(np.argmax(minor_scores))
        if major_scores[best_major] >= minor_scores[best_minor]:
            key = f"{NOTE_NAMES[best_major]} major"
        else:
            key = f"{NOTE_NAMES[best_minor]} minor"

    return {
        "bpm": bpm,
        "key": key,
        "bpm_source": bpm_src.name,
        "key_source": key_src.name,
    }


def run_demucs(job_id: str, input_path: Path, sep_settings: Optional[dict] = None):
    """Run Demucs in a subprocess and update job status."""
    out_base = OUTPUT_DIR / job_id
    out_base.mkdir(parents=True, exist_ok=True)

    jobs[job_id]["status"] = "processing"
    if jobs[job_id].get("progress", 0) < 15:
        jobs[job_id]["progress"] = 5

    try:
        sep_settings = sep_settings or jobs.get(job_id, {}).get("settings", {})
        cmd = [
            "python", "-m", "demucs",
            "--two-stems", "",
            "-n", "htdemucs",
            "-o", str(out_base),
            "--mp3", 
            str(input_path),
        ]

        cmd = [
            "python", "-m", "demucs",
            "-n", "htdemucs",
            "-o", str(out_base),
            str(input_path),
        ]

        jobs[job_id]["progress"] = 10

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        progress = 10
        for line in proc.stdout:
            line = line.strip()
            if "%" in line:
                try:
                    pct = int(line.split("%")[0].strip().split()[-1])
                    progress = 10 + int(pct * 0.8)
                    jobs[job_id]["progress"] = progress
                except Exception:
                    pass

        proc.wait()
        if proc.returncode != 0:
            raise RuntimeError("Demucs exited with non-zero code")

        jobs[job_id]["progress"] = 90

        song_name = input_path.stem
        stem_dir = out_base / "htdemucs" / song_name
        if not stem_dir.exists():
            candidates = list((out_base / "htdemucs").iterdir())
            if candidates:
                stem_dir = candidates[0]
            else:
                raise FileNotFoundError(f"Could not find stem directory in {out_base}")

        stems = {}
        for stem_name in ["vocals", "drums", "bass", "other"]:
            for ext in ["wav", "mp3", "flac"]:
                p = stem_dir / f"{stem_name}.{ext}"
                if p.exists():
                    stems[stem_name] = str(p)
                    break

        if not stems:
            raise FileNotFoundError("No stem files found after separation")

        jobs[job_id]["stems"] = stems
        jobs[job_id]["status"] = "done"
        jobs[job_id]["progress"] = 100

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
    finally:
        try:
            input_path.unlink(missing_ok=True)
        except Exception:
            pass

@app.post("/api/separate")
async def separate(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Accept an audio file, kick off Demucs, return a job_id."""
    if not file.filename:
        raise HTTPException(400, "No filename")

    suffix = Path(file.filename).suffix or ".wav"
    job_id = str(uuid.uuid4())
    input_path = UPLOAD_DIR / f"{job_id}{suffix}"

    contents = await file.read()
    input_path.write_bytes(contents)

    jobs[job_id] = {
        "status": "queued",
        "progress": 0,
        "stems": {},
        "error": None,
        "filename": file.filename,
        "settings": {
            "model": "htdemucs",
            "stems": 4,
            "format": "wav",
            "sample_rate": 44100,
            "bit_depth": 24,
        },
    }

    background_tasks.add_task(run_demucs, job_id, input_path, jobs[job_id]["settings"])
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
def get_status(job_id: str):
    """Poll the status of a separation job."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    return {
        "status": job["status"],  
        "progress": job["progress"],
        "error": job.get("error"),
        "stems": list(job.get("stems", {}).keys()),
    }


@app.get("/api/stem/{job_id}/{stem_name}")
def download_stem(job_id: str, stem_name: str, semitones: float = 0.0):
    """Stream a single stem file."""
    stems = resolve_stems(job_id)
    path = stems.get(stem_name)

    if path is None and stem_name == "other":
        path = stems.get("no_vocals")

    if path is None or not path.exists():
        raise HTTPException(404, f"Stem '{stem_name}' not found")

    if abs(semitones) > 0.01:
        semitones = max(-12.0, min(12.0, semitones))
        shifted_path = pitch_cache_path(job_id, stem_name, semitones)
        try:
            ensure_pitch_shifted(path, shifted_path, semitones)
            path = shifted_path
        except Exception:
            # Fail soft to original stem if ffmpeg transform is unavailable.
            pass

    media_type = "audio/wav" if path.suffix == ".wav" else "audio/mpeg"
    return FileResponse(
        path,
        media_type=media_type,
        filename=f"{stem_name}{path.suffix}",
        headers={"Accept-Ranges": "bytes"},
    )


@app.get("/api/analyze/{job_id}")
def analyze_job(job_id: str):
    if job_id in jobs:
        job = jobs[job_id]
        if job.get("analysis"):
            return job["analysis"]

    analysis = analyze_bpm_and_key(job_id)
    if job_id in jobs:
        jobs[job_id]["analysis"] = analysis
    return analysis


@app.get("/api/jobs")
def list_jobs():
    """Debug: list all jobs."""
    return {jid: {k: v for k, v in j.items() if k != "stems"} for jid, j in jobs.items()}


@app.get("/api/projects")
def list_projects():
    return projects


@app.post("/api/projects")
def create_project(body: dict = Body(...)):
    if not isinstance(body, dict):
        raise HTTPException(400, "Invalid project payload")
    project = dict(body)
    if not project.get("id"):
        project["id"] = str(uuid.uuid4())

    projects[:] = [project, *[p for p in projects if str(p.get("id")) != str(project["id"])]]
    save_projects()
    return project


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    before = len(projects)
    projects[:] = [p for p in projects if str(p.get("id")) != str(project_id)]
    if len(projects) == before:
        raise HTTPException(404, "Project not found")
    remove_project_audio(project_id)
    save_projects()
    return {"ok": True}


@app.delete("/api/projects")
def clear_projects():
    for p in projects:
        pid = str(p.get("id", ""))
        if pid:
            remove_project_audio(pid)
    projects.clear()
    save_projects()
    return {"ok": True}


@app.delete("/api/cache/outputs")
def clear_outputs_cache():
    removed = clear_all_output_cache()
    return {"ok": True, "removed": removed, "projects_kept": len(projects)}


@app.get("/api/settings")
def get_settings():
    return app_settings


@app.put("/api/settings")
def update_settings(body: dict = Body(...)):
    if not isinstance(body, dict):
        raise HTTPException(400, "Invalid settings payload")
    app_settings.update(body)
    save_app_settings()
    return app_settings


@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/youtube/search")
def youtube_search(q: str, limit: int = 12):
    """
    Proxy YouTube search via yt-dlp so the browser avoids CORS.
    Returns a list of video metadata objects.
    """
    if not q.strip():
        return {"items": []}
    try:
        cmd = [
            "yt-dlp",
            f"ytsearch{limit}:{q}",
            "--dump-json",
            "--no-download",
            "--no-playlist",
            "--quiet",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        items = []
        for line in result.stdout.strip().splitlines():
            if not line:
                continue
            try:
                v = json.loads(line)
                items.append({
                    "id":        v.get("id"),
                    "title":     v.get("title"),
                    "channel":   v.get("uploader") or v.get("channel", ""),
                    "duration":  v.get("duration_string") or _fmt_duration(v.get("duration")),
                    "thumbnail": _best_thumb(v.get("thumbnails")),
                    "url":       v.get("webpage_url"),
                })
            except json.JSONDecodeError:
                continue
        return {"items": items}
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "YouTube search timed out")
    except Exception as e:
        raise HTTPException(500, f"YouTube search failed: {e}")


def _fmt_duration(secs):
    if not secs:
        return None
    secs = int(secs)
    m, s = divmod(secs, 60)
    h, m = divmod(m, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def _best_thumb(thumbnails):
    if not thumbnails:
        return None
    best = max(thumbnails, key=lambda t: (t.get("width") or 0) * (t.get("height") or 0))
    return best.get("url")


@app.post("/api/youtube/separate")
async def youtube_separate(background_tasks: BackgroundTasks, body: dict = Body(...)):
    """
    Download a YouTube video as audio via yt-dlp, then run Demucs on it.
    Body: { "video_id": "...", "title": "..." }
    Returns: { "job_id": "..." }  — same as /api/separate
    """
    video_id = body.get("video_id", "").strip()
    title    = body.get("title", video_id).strip()
    if not video_id:
        raise HTTPException(400, "video_id is required")

    job_id     = str(uuid.uuid4())
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)[:60]
    out_path   = UPLOAD_DIR / f"{job_id}_{safe_title}.wav"

    jobs[job_id] = {
        "status":   "downloading",
        "progress": 0,
        "stems":    {},
        "error":    None,
        "filename": f"{safe_title}.wav",
        "settings": {
            "model":       body.get("model", "htdemucs"),
            "stems":       body.get("stems", 4),
            "format":      body.get("format", "wav"),
            "sample_rate": int(body.get("sampleRate", 44100)),
            "bit_depth":   int(body.get("bitDepth", 24)),
        },
    }

    background_tasks.add_task(_download_and_separate, job_id, video_id, out_path)
    return {"job_id": job_id}


def _download_and_separate(job_id: str, video_id: str, out_path: Path):
    """Background task: yt-dlp download → Demucs separation."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        jobs[job_id]["status"]   = "downloading"
        jobs[job_id]["progress"] = 5

        dl_cmd = [
            "yt-dlp",
            "--extract-audio",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "--output", str(out_path),
            "--no-playlist",
            "--quiet",
            url,
        ]
        dl = subprocess.run(dl_cmd, capture_output=True, text=True, timeout=120)
        if dl.returncode != 0:
            err_text = (dl.stderr or dl.stdout or "unknown error").strip()
            raise RuntimeError(f"yt-dlp failed: {err_text[:500]}")

        actual_path = out_path
        if not actual_path.exists():
            candidates = list(UPLOAD_DIR.glob(f"{out_path.stem}*"))
            if not candidates:
                raise FileNotFoundError("Downloaded file not found")
            actual_path = candidates[0]

        jobs[job_id]["progress"] = 20

        sep_settings = jobs[job_id].get("settings", {})
        run_demucs(job_id, actual_path, sep_settings)

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(e)
        try:
            out_path.unlink(missing_ok=True)
        except Exception:
            pass
