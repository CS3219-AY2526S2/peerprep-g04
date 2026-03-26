import React from "react";

export function Tag({ text, selected = false, onClick }) {
  const [isHover, setIsHover] = React.useState(false);

  const style = {
    background: selected
      ? isHover
        ? "#dbeafe"
        : "#eff6ff"
      : isHover
      ? "#f1f5f9"
      : "#f8faff",

    border: `1.5px solid ${
      selected ? "#2563eb" : isHover ? "#cbd5e1" : "#e2e8f0"
    }`,

    borderRadius: "8px",
    padding: "0.35rem 0.75rem",
    fontSize: "0.75rem",
    fontFamily: "'DM Sans', sans-serif",

    color: selected ? "#1d4ed8" : isHover ? "#1e293b" : "#64748b",

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