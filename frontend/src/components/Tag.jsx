import React from "react";

export function Tag({ text, selected = false, onClick, color }) {
  const [isHover, setIsHover] = React.useState(false);

  const palette = color || {
    bg: "#f8faff",
    bgHover: "#f1f5f9",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    text: "#64748b",
    textHover: "#1e293b",
    selectedBg: 'lightblue',
  };

  const style = {
    background: selected
      ? palette.selectedBg
      : isHover
      ? palette.bgHover
      : palette.bg,

    border: `1.5px solid ${
      selected ? palette.border : isHover ? palette.borderHover : palette.border
    }`,

    borderRadius: "8px",
    padding: "0.35rem 0.75rem",
    fontSize: "0.75rem",
    fontFamily: "'DM Sans', sans-serif",

    color: selected
      ? palette.text
      : isHover
      ? palette.textHover
      : palette.text,

    fontWeight: selected ? 600 : 500,
    cursor: onClick ? "pointer" : "default",

    transform: isHover ? "translateY(-1px)" : "none",
    transition: "all 0.18s ease",
  };

  return (
    <span
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {text}
    </span>
  );
}