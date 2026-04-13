import React from "react";

export function Tag({ text, selected = false, onClick, color, onDelete }) {
  const [isHover, setIsHover] = React.useState(false);

  const themes = {
    green: {
      bg: "#dcfce7",
      bgHover: "#bbf7d0",
      border: "#86efac",
      borderHover: "#4ade80",
      text: "#166534",
      textHover: "#14532d",
      selectedBg: "#86efac",
    },
    yellow: {
      bg: "#fef3c7",
      bgHover: "#fde68a",
      border: "#fcd34d",
      borderHover: "#f59e0b",
      text: "#92400e",
      textHover: "#78350f",
      selectedBg: "#fcd34d",
    },
    red: {
      bg: "#fee2e2",
      bgHover: "#fecaca",
      border: "#fca5a5",
      borderHover: "#ef4444",
      text: "#991b1b",
      textHover: "#7f1d1d",
      selectedBg: "#fca5a5",
    },
  };

  const palette = themes[color] || {
    bg: "#f8faff",
    bgHover: "#f1f5f9",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    text: "#64748b",
    textHover: "#1e293b",
    selectedBg: 'lightblue',
  };

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        background: selected ? palette.selectedBg : isHover ? palette.bgHover : palette.bg,
        border: `1.5px solid ${isHover || selected ? palette.borderHover : palette.border}`,
        borderRadius: "8px",
        padding: "0.35rem 0.4rem",
        fontSize: "0.75rem",
        fontFamily: "'DM Sans', sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: isHover || selected ? palette.textHover : palette.text,
        fontWeight: selected ? 600 : 500,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
      }}
    >
      {text}
      {onDelete && (
        <span 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ cursor: "pointer", fontWeight: "bold", opacity: 0.6 }}
        >
          ×
        </span>
      )}
    </span>
  );
}