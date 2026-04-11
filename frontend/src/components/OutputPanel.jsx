import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Tag } from "./Tag";
import { Tabs } from "./Tabs";

export function OutputPanel({
  loading,
  open,
  setOpen,
  output,
  outputErr,
  testStatus,
  testCaseInput,
  testCaseOutput,
  containerStyle = {} 
}) {
  const [activeTab, setActiveTab] = useState("Test Case");

  const styles = {
    terminal: {
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      background: "white",
      boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
      zIndex: 10,
      overflow: "hidden",
      ...containerStyle,
    },
    terminalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "12px 16px 0 16px",
      background: "#ffffff",
    },
    terminalBody: {
      minHeight: "200px",
      maxHeight: "400px",
      overflowY: "auto",
      backgroundColor: "#ffffff",
      padding: "0 20px 20px 20px",
    },
    codeBlock: {
      margin: "4px 0 0 0",
      padding: "12px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "0.85rem",
      lineHeight: 1.5,
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      color: "#334155",
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      color: "#64748b",
      letterSpacing: "0.025em",
      marginBottom: "4px",
      display: "block",
    },
    spinner: {
      height: "40px",
      width: "40px",
      borderRadius: "50%",
      border: "3px solid #f1f5f9",
      borderTop: "3px solid #3b82f6",
      animation: "output-panel-spin 1s linear infinite",
    }
  };

  return (
    <div style={styles.terminal}>
      <style>
        {`@keyframes output-panel-spin { to { transform: rotate(360deg); } }`}
      </style>

      <div style={styles.terminalHeader}>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <Tabs 
            tabs={["Test Case", "Console"]} 
            active={activeTab} 
            onChange={setActiveTab} 
            // This injects the colored dot right inside the Test Case tab
            dots={{ "Test Case": testStatus }}
          />
        </div>
        
        <IconButton 
          onClick={() => setOpen(!open)} 
          sx={{ height: "28px", width: "28px", marginBottom: "12px" }}
        >
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </div>

      {open && (
        <div style={styles.terminalBody}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              {/* --- TEST CASE VIEW --- */}
              {activeTab === "Test Case" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* First element at the top: The Tag */}
                  {testStatus && (
                    <div style={{ display: "flex" }}>
                      <Tag text={testStatus} color={testStatus === "Passed" ? "green" : "red"} />
                    </div>
                  )}

                  <div>
                    <span style={styles.label}>Input</span>
                    <pre style={styles.codeBlock}>{testCaseInput || "No input defined"}</pre>
                  </div>

                  {testStatus && (
                    <div>
                      <span style={styles.label}>Your Output</span>
                      <pre style={{ ...styles.codeBlock, color: outputErr ? "#ef4444" : "inherit" }}>
                        {output || (outputErr ? "Error during execution" : "No output")}
                      </pre>
                    </div>
                  )}

                  <div>
                    <span style={styles.label}>Expected Output</span>
                    <pre style={styles.codeBlock}>{testCaseOutput || "No output defined"}</pre>
                  </div>
                </div>
              )}

              {/* --- CONSOLE VIEW --- */}
              {activeTab === "Console" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <span style={styles.label}>Output</span>
                  <pre style={{ 
                    ...styles.codeBlock, 
                    color: outputErr ? "#ef4444" : "inherit",
                    minHeight: "100px" 
                  }}>
                    {output || "No console output."}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}