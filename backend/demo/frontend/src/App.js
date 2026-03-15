import React, { useEffect, useState, useRef } from 'react';
import Editor from './components/Editor';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  // 解析 URL 中的 match_id (/collab/xxx)
  const parseMatchIdFromUrl = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'collab') {
      return pathParts[2];
    }
    return null;
  };

  const setupWebSocket = (matchId) => {
    // 🚩 必须指向 Java 后端 8080 端口
    const wsUrl = `ws://localhost:8080/ws?session=${matchId}`;
    console.log('正在尝试连接 WebSocket:', wsUrl);
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('✅ WebSocket 连接成功，房间 ID:', matchId);
    };

    ws.current.onmessage = (evt) => {
      const rawMessage = evt.data;
      console.log('📩 收到后端原始消息:', rawMessage);

      // 🚩 适配后端：处理 PROBLEM_INFO: 前缀
      if (typeof rawMessage === 'string' && rawMessage.startsWith('PROBLEM_INFO:')) {
        try {
          const jsonString = rawMessage.substring('PROBLEM_INFO:'.length);
          const problemData = JSON.parse(jsonString);
          
          console.log('🚀 题目解析成功:', problemData);
          setProblem(problemData);
          setLoading(false); // 停止加载，显示界面
        } catch (err) {
          console.error('❌ JSON 解析失败:', err);
          setError('题目数据格式错误');
          setLoading(false);
        }
      } else {
        // 处理其他类型的消息（比如实时代码同步、聊天消息等）
        console.log('处理同步消息:', rawMessage);
      }
    };

    ws.current.onclose = (e) => {
      console.log('❌ WebSocket 已关闭:', e.reason);
    };

    ws.current.onerror = (err) => {
      console.error('❌ WebSocket 出错:', err);
      setError('连接后端失败 (Port 8080)，请检查后端是否启动');
      setLoading(false);
    };
  };

  useEffect(() => {
    const matchId = parseMatchIdFromUrl();
    if (!matchId) {
      setError('无效的 URL，未找到 Match ID');
      setLoading(false);
      return;
    }

    setSessionId(matchId);
    setupWebSocket(matchId);

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // --- 视图渲染 ---

  if (loading) return <div className="centered">加载协作会话中...</div>;
  if (error) return <div className="centered error"><h2>错误</h2><p>{error}</p></div>;
  if (!problem) return <div className="centered">未找到题目信息，请确认 Redis 缓存有效。</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>{problem.title}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className={`badge ${problem.difficulty?.toLowerCase() || 'easy'}`}>
            {problem.difficulty || 'Easy'}
          </span>
          <span style={{ color: '#666' }}>Topic: {problem.topic || 'General'}</span>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* 左侧：题目描述 */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h3>题目描述</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
              {problem.body}
            </div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
             Session ID: {sessionId} | Collaborators: {problem.userA} & {problem.userB}
          </div>
        </div>

        {/* 右侧：编辑器组件 */}
        <div style={{ flex: '1.5' }}>
          <Editor sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

export default App;