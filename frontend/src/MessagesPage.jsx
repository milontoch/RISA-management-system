import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

export default function MessagesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [conversation, setConversation] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [sendStatus, setSendStatus] = useState(null);

  // Fetch all users for recipient selection
  useEffect(() => {
    setLoadingUsers(true);
    setError(null);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setUsers(data.users.filter(u => u.id !== user?.id));
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      })
      .catch(() => setError('Failed to fetch users'))
      .finally(() => setLoadingUsers(false));
  }, [user]);

  // Fetch conversation with selected user
  useEffect(() => {
    if (!selectedUserId) {
      setConversation([]);
      return;
    }
    setLoadingMessages(true);
    setError(null);
    fetch(`/api/messages/conversation?user_id=${selectedUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setConversation(data.data);
        } else {
          setError(data.message || 'Failed to fetch messages');
        }
      })
      .catch(() => setError('Failed to fetch messages'))
      .finally(() => setLoadingMessages(false));
  }, [selectedUserId]);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendStatus(null);
    if (!messageInput.trim() || !selectedUserId) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: selectedUserId, message: messageInput })
    });
    const data = await res.json();
    if (data.success) {
      setSendStatus({ type: 'success', message: 'Message sent!' });
      setMessageInput('');
      // Refetch conversation
      fetch(`/api/messages/conversation?user_id=${selectedUserId}`)
        .then(res => res.json())
        .then(data => setConversation(data.data || []));
    } else {
      setSendStatus({ type: 'error', message: data.message || 'Failed to send message.' });
    }
  };

  // Mark a message as read
  const handleMarkAsRead = async (messageId) => {
    await fetch('/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: messageId })
    });
    // Refetch conversation
    fetch(`/api/messages/conversation?user_id=${selectedUserId}`)
      .then(res => res.json())
      .then(data => setConversation(data.data || []));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Notifications & Messaging</h2>
      {/* Select recipient */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Select User to Message</h3>
        {loadingUsers ? (
          <div className="text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <select className="border rounded px-2 py-1 w-full max-w-md" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            <option value="">Select user</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        )}
      </div>
      {/* Conversation view */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Conversation</h3>
        <div className="bg-white border rounded shadow p-4 min-h-[200px]">
          {loadingMessages ? (
            <div className="text-gray-500">Loading messages...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : conversation.length === 0 ? (
            <div className="text-gray-500">No messages yet.</div>
          ) : (
            <ul>
              {conversation.map(msg => (
                <li key={msg.id} className={`mb-2 ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}> 
                  <span className={`inline-block px-3 py-2 rounded ${msg.sender_id === user.id ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.message}</span>
                  <span className="ml-2 text-xs text-gray-500">{msg.created_at}</span>
                  {!msg.read && msg.receiver_id === user.id && (
                    <button className="ml-2 text-xs text-blue-600 underline" onClick={() => handleMarkAsRead(msg.id)}>Mark as Read</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Send message form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Send Message</h3>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            disabled={!selectedUserId}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={!selectedUserId}>Send</button>
        </form>
        {sendStatus && (
          <div className={`mt-2 ${sendStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{sendStatus.message}</div>
        )}
      </div>
    </div>
  );
} 