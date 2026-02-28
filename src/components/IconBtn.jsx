export default function IconBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: "1px solid #1a1a2a",
        color: disabled ? "#222" : "#555",
        borderRadius: 6, width: 27, height: 27,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13, transition: "all 0.12s", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}