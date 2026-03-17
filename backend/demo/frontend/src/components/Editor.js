import React, { useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

export default function CollaborativeEditor({ sessionId, wsRef }) { 
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const docRef = useRef(null);
  const bindingRef = useRef(null);
  

  const lastSavedCode = useRef(''); 

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    docRef.current = ydoc; 

    const provider = new WebrtcProvider(sessionId, ydoc, {
      signaling: ['ws://localhost:4444'] 
    });
    providerRef.current = provider;

    const yText = ydoc.getText("monaco");
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
    bindingRef.current = binding;
  }

  // send code to backend every 5 seconds if there are changes
  useEffect(() => {
    const timer = setInterval(() => {
      if (docRef.current && wsRef && wsRef.current?.readyState === WebSocket.OPEN) {
        
        const currentCode = docRef.current.getText("monaco").toString();

        if (currentCode !== lastSavedCode.current) {
          const payload = {
            type: "CODE_SAVE",
            code: currentCode
          };
          
          wsRef.current.send(JSON.stringify(payload));
          lastSavedCode.current = currentCode;
        
        }
      }
    }, 5000);

    return () => clearInterval(timer); 
  }, [wsRef]); 


  useEffect(() => {
    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (docRef.current) docRef.current.destroy();
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height="85vh"
        width="100%"
        theme="vs-dark"
        defaultLanguage="java"
        onMount={handleEditorDidMount}
        options={{ minimap: { enabled: false }, fontSize: 15, wordWrap: "on" }}
      />
    </div>
  );
}