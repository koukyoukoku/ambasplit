import { useState, useCallback, useEffect } from "react";
import { PROCESSING_STEPS } from "../constants";

export function useSeparation({ apiUrl, settings, onDone }) {
  const [phase, setPhase]           = useState("upload");
  const [fileName, setFileName]     = useState("");
  const [jobId, setJobId]           = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [stepIdx, setStepIdx]       = useState(0);
  const [jobError, setJobError]     = useState(null);
  const [stemKeys, setStemKeys]     = useState([]);
  const [sourceType, setSourceType] = useState("file");

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    setSourceType("file");
    setJobError(null);
    setPhase("processing");
    setJobProgress(0);
    setStepIdx(0);
    setStemKeys([]);

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${apiUrl}/api/separate`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { job_id } = await res.json();
      setJobId(job_id);
    } catch (e) {
      setJobError(e.message);
      setPhase("upload");
    }
  }, [apiUrl]);

  const handleYoutube = useCallback(async ({ id, title }) => {
    if (!id) return;
    setFileName(title || id);
    setSourceType("youtube");
    setJobError(null);
    setPhase("processing");
    setJobProgress(0);
    setStepIdx(0);
    setStemKeys([]);

    try {
      const res = await fetch(`${apiUrl}/api/youtube/separate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: id, title }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { job_id } = await res.json();
      setJobId(job_id);
    } catch (e) {
      setJobError(e.message);
      setPhase("upload");
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!jobId || (phase !== "processing")) return;
    const iv = setInterval(async () => {
      try {
        const res  = await fetch(`${apiUrl}/api/status/${jobId}`);
        const data = await res.json();
        const progress = data.progress ?? 0;
        setJobProgress(progress);
        setStepIdx(Math.min(
          Math.floor((progress / 100) * PROCESSING_STEPS.length),
          PROCESSING_STEPS.length - 1
        ));

        if (data.status === "downloading") return;

        if (data.status === "done") {
          clearInterval(iv);
          const keys = data.stems || [];
          setStemKeys(keys);
          setPhase("done");
          onDone?.({ jobId, fileName, stemKeys: keys });
        }
        if (data.status === "error") {
          clearInterval(iv);
          setJobError(data.error || "Separation failed");
          setPhase("upload");
        }
      } catch (e) { console.error(e); }
    }, 800);
    return () => clearInterval(iv);
  }, [jobId, phase, apiUrl]);

  const openProject = useCallback(({ id, name, stemKeys: keys }) => {
    setJobId(id);
    setFileName(name);
    setStemKeys(keys || []);
    setPhase("done");
    setJobProgress(100);
    setJobError(null);
  }, []);

  const reset = useCallback(() => {
    setPhase("upload");
    setJobId(null);
    setFileName("");
    setJobProgress(0);
    setStepIdx(0);
    setJobError(null);
    setStemKeys([]);
    setSourceType("file");
  }, []);

  return {
    phase, fileName, jobId, jobProgress, stepIdx, jobError,
    stemKeys, sourceType,
    handleFile, handleYoutube, openProject, reset,
  };
}