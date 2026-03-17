import React, { useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

export default function CollaborativeEditor({ sessionId }) {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const docRef = useRef(null);
  const bindingRef = useRef(null);

  // 当 Monaco Editor 加载完毕时触发
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // 1. 初始化 Yjs 文档
    const ydoc = new Y.Doc();
    docRef.current = ydoc;

    // 2. 配置 WebRTC Provider 建立 P2P 连接
    // 这里的 roomname 直接使用你从 URL 解析出来传进来的 sessionId
    const provider = new WebrtcProvider(sessionId, ydoc, {
      // 如果你本地没有跑 Node.js 的信令服务器 (默认 4444)，
      // 你可以把下面这行注释掉，它会自动回退连接到 Yjs 的公共测试信令服务器，方便你快速测试。
      signaling: ['ws://localhost:4444'] 
    });
    providerRef.current = provider;

    // 3. 将 Yjs 的共享文本与 Monaco Editor 的数据模型绑定
    const yText = ydoc.getText("monaco");
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
    bindingRef.current = binding;

    console.log(`✅ Yjs/WebRTC Editor connected to room: ${sessionId}`);
  }

  // 组件卸载时（比如用户离开页面），必须清理连接，否则会导致“幽灵光标”和内存泄漏
  useEffect(() => {
    return () => {
      console.log('Cleaning up Yjs and WebRTC connections...');
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (docRef.current) docRef.current.destroy();
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height="85vh" // 稍微留点边距，不要占满 100vh 导致页面滚动
        width="100%"
        theme="vs-dark"
        defaultLanguage="java" // 可以根据你的后端配置成 java, python, javascript 等
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false }, // 关掉右侧的代码缩略图，让协作空间更大
          fontSize: 15,
          wordWrap: "on", // 自动换行
        }}
      />
    </div>
  );
}