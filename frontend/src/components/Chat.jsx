import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { getAuthToken } from '../utils/auth';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingStatus, setTypingStatus] = useState('');
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUser(decodedToken);

    socket.emit('user-joined', decodedToken.userId);

    // Listen once
    socket.off('receive-message');
    socket.on('receive-message', (data) => {
      console.log('Received message:', data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on('online-users', (userIds) => {
      console.log('Online users:', userIds);
      setOnlineUsers(userIds);
    });
    

    socket.off('typing');
    socket.on('typing', (data) => {
      setTypingStatus(`${data.from} is typing...`);
      setTimeout(() => setTypingStatus(''), 3000);
    });

    return () => {
      // No disconnect here! Let socket persist
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const messageData = {
      from: user.userId,
      message: input,
    };

    socket.emit('send-message', messageData);
    // setMessages((prev) => [...prev, messageData]);
    setInput('');
  };

  const handleTyping = () => {
    if (user) {
      socket.emit('typing', { from: user.userId });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Global Chat</h2>
      
      <div style={{ marginBottom: 10 }}>
  <strong>Online Users:</strong>
  <ul>
    {onlineUsers?.map((uid) => (
      <li key={uid}>
        {uid === user?.userId ? `${uid} (You)` : uid}
      </li>
    ))}
  </ul>
</div>
      <div style={{ border: '1px solid gray', padding: 10, height: 300, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.from === user?.userId ? 'You' : msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {typingStatus && <div style={{ color: 'gray' }}>{typingStatus}</div>}

      


      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
        style={{ width: '70%', marginRight: 10 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
