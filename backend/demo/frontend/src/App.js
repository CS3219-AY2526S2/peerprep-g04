import React, { useEffect, useState, useRef } from 'react';
import Editor from './components/Editor';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  const parseMatchIdFromUrl = () => {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'collab') {
      return pathParts[2];
    }
    return null;
  };

  const setupWebSocket = (matchId) => {
    const wsUrl = `ws://localhost:8080/ws?session=${matchId}`;
    console.log('trying to connect to WebSocket:', wsUrl);
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected:', matchId);
    };

    ws.current.onmessage = (evt) => {
      const rawMessage = evt.data;
      console.log(rawMessage);


      if (typeof rawMessage === 'string' && rawMessage.startsWith('PROBLEM_INFO:')) {
        try {
          const jsonString = rawMessage.substring('PROBLEM_INFO:'.length);
          const problemData = JSON.parse(jsonString);
          
          console.log('🚀 success:', problemData);
          setProblem(problemData);
          setLoading(false); 
        } catch (err) {
          console.error('❌ JSON resolution error:', err);
          setError('question info format error');
          setLoading(false);
        }
      } else {
        // 处理其他类型的消息（比如实时代码同步、聊天消息等）
        console.log(rawMessage);
      }
    };

    ws.current.onclose = (e) => {
      console.log('❌ WebSocket closeed:', e.reason);
    };

    ws.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setError('fail to connect to port 8080');
      setLoading(false);
    };
  };

  useEffect(() => {
    const matchId = parseMatchIdFromUrl();
    if (!matchId) {
      setError('invalid URL, Match ID no found');
      setLoading(false);
      return;
    }

    setSessionId(matchId);
    setupWebSocket(matchId);

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);


  if (loading) return <div className="centered">loading ...</div>;
  if (error) return <div className="centered error"><h2>error</h2><p>{error}</p></div>;
  if (!problem) return <div className="centered">could not retrieve problem information from Redis cache.</div>;

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
        {/* qn description */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h3>question description</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
              {problem.body}
            </div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
             Session ID: {sessionId} | Collaborators: {problem.userA} & {problem.userB}
          </div>
        </div>

        {/* editor */}
        <div style={{ flex: '1.5' }}>
          <Editor sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

export default App;