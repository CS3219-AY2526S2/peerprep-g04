import React from "react";

export function Tabs({ tabs, active, onChange }) {
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
          </div>
        ))}
      </div>
    </div>
  );
}

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
  },
  activeTab: {
    color: "#111827",
    borderBottom: "2px solid #2563eb",
  },
};