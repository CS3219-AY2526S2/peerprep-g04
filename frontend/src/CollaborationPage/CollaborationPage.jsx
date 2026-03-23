import { useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useLocation } from "react-router";

export function CollaborationPage() {
  const editorRef = useRef(null);
  const location = useLocation();

  const match_id = location.state?.match_id;
  
  // if (!match_id) {
  //   console.error("No match_id found");
  //   return;
  // }
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Init Yjs
    const ydoc = new Y.Doc();
    const room = `match-${match_id}`;

    // P2P connection using webrtc
    const provider = new WebrtcProvider(room, ydoc, 
        { signaling: [import.meta.env.VITE_SIGNALING_URL || "ws://localhost:1234"] } // Connect to our own backend signaling server
    ); // Change roomname to some unique ID from matching service
    const yText = ydoc.getText("monaco"); // use key "monaco" and bind to editor

    // Bind yjs to monaco
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    ); // shared data for each room
  }

  return (
    <Editor
      height="100vh"
      width="100vw"
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
}

export default CollaborationPage;
