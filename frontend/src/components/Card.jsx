import React from "react";

export function Card({ title, badge, children, style = {}, className = "" }) {
  const baseStyle = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1.5rem",
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  };

  const mergedStyle = { ...baseStyle, ...style };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1.1rem",
  };

  const titleStyle = {
    fontSize: "0.8rem",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    color: "#64748b",
    margin: 0,
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  };

  const badgeStyle = {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    borderRadius: "20px",
    padding: "0.2rem 0.65rem",
    fontSize: "0.7rem",
    fontWeight: 600,
  };

  return (
    <div style={mergedStyle} className={className}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        {badge && <span style={badgeStyle}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}