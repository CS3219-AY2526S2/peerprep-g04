import React from "react";

export function Tabs({ tabs, active, onChange, dots = {} }) {
  const styles = {
    tabRow: {
      display: "flex",
      borderBottom: "1px solid #e2e8f0",
      marginBottom: "12px",
    },
    tab: {
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: "0.8rem",
      fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      color: "#64748b",
      letterSpacing: "0.02em",
      display: "flex",
      alignItems: "center",
      gap: "6px", // Space between text and dot
    },
    activeTab: {
      color: "#111827",
      borderBottom: "2px solid #2563eb",
    },
    dot: (status) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: status === "Passed" ? "#16a34a" : "#ef4444",
    })
  };

  return (
    <div>
      <div style={styles.tabRow}>
        {tabs.map(tab => (
          <div
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              ...styles.tab,
              ...(active === tab ? styles.activeTab : {})
            }}
          >
            {tab}
            {dots[tab] && (
              <div style={styles.dot(dots[tab])} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}