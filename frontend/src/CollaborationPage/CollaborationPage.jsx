import { useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

export function CollaborationPage() {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Init Yjs
    const ydoc = new Y.Doc();

    // P2P connection using webrtc
    const provider = new WebrtcProvider("roomname", ydoc, 
        //{ signaling: ["ws://localhost:4444"] } // Connect to our own backend signaling server
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
