import { FileUpload, Search } from "@mui/icons-material";

export default function ViewToggle({ view, setView }) {
  return (
    <div style={{
      display: "flex",
      borderRadius: "100px",
      backgroundColor: "#2c344e80",
      position: "relative",
      width: 140,
      height: 32,
      margin: "0 auto",
      marginBottom: 24,
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "50%", height: "100%",
        backgroundColor: "#00f5d4",
        borderRadius: 40,
        transition: "transform 0.3s ease",
        transform: view === "upload" ? "translateX(0)" : "translateX(100%)",
        pointerEvents: "none",
      }} />
      <div
        onClick={() => setView("upload")}
        style={{
          flex: 1,
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1, cursor: "pointer",
        }}
      >
        <FileUpload style={{ color: view === "upload" ? "white" : "#FFFFFF80", fontSize: 20 }} />
      </div>
      <div
        onClick={() => setView("search")}
        style={{
          flex: 1,
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1, cursor: "pointer",
        }}
      >
        <Search style={{ color: view === "search" ? "white" : "#FFFFFF80", fontSize: 20 }} />
      </div>
    </div>
  );
}