import React, { useState, useEffect, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Tag } from "./Tag";
import { Tabs } from "./Tabs";
import { ChatPanel } from "./ChatPanel";

export function OutputPanel({
  loading,
  open,
  setOpen,
  output,
  outputErr,
  testStatus,
  testCaseInput,
  testCaseOutput,
  user,
  messages,
  sendMessage,
  containerStyle = {} 
}) {
  const [activeTab, setActiveTab] = useState("Test Case");
  const [unreadCount, setUnreadCount] = useState(0);
  const processedMessageCount = useRef(messages.length);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (!open) setOpen(true);
  };

  useEffect(() => {
    if (messages.length > processedMessageCount.current) {
      const lastMessage = messages[messages.length - 1];
      
      if (activeTab !== "Chat" && lastMessage?.username !== user?.username) {
        setUnreadCount(prev => prev + 1);
      }
      
      processedMessageCount.current = messages.length;
    }
  }, [messages, activeTab, user?.username]);

  useEffect(() => {
    if (activeTab === "Chat") {
      setUnreadCount(0);
      processedMessageCount.current = messages.length;
    }
  }, [activeTab, messages.length]);

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
      alignItems: "center",
      padding: "6px 16px",
      background: "#ffffff",
      cursor: "pointer",
      userSelect: "none",
    },
    terminalBody: {
      height: "350px",
      boxSizing: "border-box",
      overflowY: activeTab === "Chat" ? "hidden" : "auto",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      padding: activeTab === "Chat" ? "0" : "0 20px 20px 20px",
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

      <div style={styles.terminalHeader} onClick={() => setOpen(!open)}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
          <div onClick={(e) => e.stopPropagation()}>
            <Tabs 
              tabs={["Test Case", "Console", "Chat"]} 
              active={activeTab} 
              onChange={handleTabChange} 
              dots={{ 
                  "Test Case": testStatus,
                  "Chat": unreadCount > 0 ? "New" : null 
              }}
            />
          </div>
        </div>
        
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }} 
          sx={{ height: "28px", width: "28px", }}
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
              {activeTab === "Test Case" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "12px" }}>
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

              {activeTab === "Console" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", paddingTop: "12px" }}>
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

              {activeTab === "Chat" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <ChatPanel 
                      user={user}
                      messages={messages}
                      sendMessage={sendMessage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}