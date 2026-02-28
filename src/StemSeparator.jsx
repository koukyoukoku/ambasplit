import { useState, useRef, useCallback, useEffect } from "react";
import { GLOBAL_STYLES }  from "./globalStyles";
import { DEFAULT_SETTINGS } from "./constants";
import Sidebar            from "./components/Sidebar";
import TopBar             from "./components/Topbar";
import SeparatePage       from "./pages/SeparatePage";
import ProjectsPage       from "./pages/ProjectsPage";
import SettingsPage       from "./pages/SettingsPage";

export default function StemSeparator() {
  const [activeNav, setActiveNav]           = useState("separate");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [projects, setProjects]             = useState([]);
  const [projectSearch, setProjectSearch]   = useState("");
  const [projectToOpen, setProjectToOpen]   = useState(null);

  const [settings, setSettings]             = useState(DEFAULT_SETTINGS);
  const [settingsSaved, setSettingsSaved]   = useState(false);

  const separateTopBarRef = useRef(null);
  const [separateTopBarProps, setSeparateTopBarProps] = useState({});

  const setSetting = useCallback((key, val) =>
    setSettings(prev => ({ ...prev, [key]: val })), []);

  const handleSaveSettings = () => {
    (async () => {
      try {
        const res = await fetch(`${settings.apiUrl}/api/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error(`Failed to save settings (${res.status})`);
        const saved = await res.json();
        setSettings(prev => ({ ...prev, ...saved }));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
    })();
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${DEFAULT_SETTINGS.apiUrl}/api/settings`);
        if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
        const data = await res.json();
        if (data && typeof data === "object") {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    })();
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${settings.apiUrl}/api/projects`);
      if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, [settings.apiUrl]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleNewProject = useCallback(async (project) => {
    try {
      const res = await fetch(`${settings.apiUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error(`Failed to save project (${res.status})`);
      const saved = await res.json();
      setProjects(prev => [saved, ...prev.filter(p => String(p.id) !== String(saved.id))]);
    } catch (err) {
      console.error("Failed to save project:", err);
      setProjects(prev => [project, ...prev]);
    }
  }, [settings.apiUrl]);

  const handleDeleteProject = useCallback(async (projectId) => {
    try {
      const res = await fetch(`${settings.apiUrl}/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete project (${res.status})`);
      setProjects(prev => prev.filter(p => String(p.id) !== String(projectId)));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  }, [settings.apiUrl]);

  const handleClearProjects = useCallback(async () => {
    try {
      const res = await fetch(`${settings.apiUrl}/api/projects`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to clear projects (${res.status})`);
      setProjects([]);
    } catch (err) {
      console.error("Failed to clear projects:", err);
      setProjects([]);
    }
  }, [settings.apiUrl]);

  const handleClearOutputCache = useCallback(async () => {
    try {
      const res = await fetch(`${settings.apiUrl}/api/cache/outputs`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to clear output cache (${res.status})`);
    } catch (err) {
      console.error("Failed to clear output cache:", err);
    }
  }, [settings.apiUrl]);

  const handleOpenProject = useCallback((project) => {
    if (!project?.id) return;
    setProjectToOpen({
      id: project.id,
      name: project.name,
      stemKeys: project.stemKeys,
      ts: Date.now(),
    });
    setActiveNav("separate");
  }, []);

  useEffect(() => {
    if (activeNav !== "separate") {
      separateTopBarProps.onStop?.();
    }
  }, [activeNav, separateTopBarProps]);

  const SW = sidebarCollapsed ? 64 : 220;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#07070f", color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div style={{
        marginLeft: SW, flex: 1, minHeight: "100vh",
        transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <TopBar
          activeNav={activeNav}
          phase={separateTopBarProps.phase}
          fileName={separateTopBarProps.fileName}
          currentTime={separateTopBarProps.currentTime}
          duration={separateTopBarProps.duration}
          zoomLevel={separateTopBarProps.zoomLevel}
          isLoading={separateTopBarProps.isLoading}
          isPlaying={separateTopBarProps.isPlaying}
          onPlayPause={separateTopBarProps.onPlayPause}
          onStop={separateTopBarProps.onStop}
          onZoom={separateTopBarProps.onZoom}
          onExport={separateTopBarProps.onExport}
          onNew={separateTopBarProps.onNew}
          projectSearch={projectSearch}
          setProjectSearch={setProjectSearch}
          settingsSaved={settingsSaved}
          onSaveSettings={handleSaveSettings}
        />

        <main style={{ flex: 1, padding: "36px 28px 48px", overflow: "auto" }}>
          {activeNav === "separate" && (
            <SeparatePage
              settings={settings}
              active={activeNav === "separate"}
              onNewProject={handleNewProject}
              topBarProps={setSeparateTopBarProps}
              openProjectRequest={projectToOpen}
            />
          )}

          {activeNav === "projects" && (
            <ProjectsPage
              projects={projects}
              onDeleteProject={handleDeleteProject}
              onOpenProject={handleOpenProject}
              search={projectSearch}
              onNewProject={() => setActiveNav("separate")}
            />
          )}

          {activeNav === "settings" && (
            <SettingsPage
              settings={settings}
              setSetting={setSetting}
              setSettings={setSettings}
              setProjects={setProjects}
              onClearProjects={handleClearProjects}
              onClearOutputCache={handleClearOutputCache}
            />
          )}
        </main>
      </div>
    </div>
  );
}
