import React, { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';
import apiService from './services/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      if (user) {
        setLoading(true);
        try {
          const data = await apiService.getUsers();
          if (data.success && data.users) {
            // Filter out current user
            const filteredUsers = data.users.filter(u => u.id !== user.id);
            setUsers(filteredUsers);
          }
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
        setLoading(false);
      }
    }
    fetchUsers();
  }, [user]);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedUserId) {
        try {
          const data = await apiService.getConversation(selectedUserId);
          if (data.success && data.messages) {
            setMessages(data.messages);
          }
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        }
      }
    }
    fetchMessages();
  }, [selectedUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const data = await apiService.createMessage({
        receiver_id: selectedUserId,
        message: newMessage,
        sender_id: user.id
      });
      if (data.success) {
        setNewMessage('');
        // Refresh messages
        const conversationData = await apiService.getConversation(selectedUserId);
        if (conversationData.success && conversationData.messages) {
          setMessages(conversationData.messages);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await apiService.markMessageAsRead(messageId);
      // Refresh messages
      const data = await apiService.getConversation(selectedUserId);
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Notifications & Messaging</h2>
      {/* Select recipient */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Select User to Message</h3>
        {loading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : (
          <select className="border rounded px-2 py-1 w-full max-w-md" value={selectedUserId || ''} onChange={e => setSelectedUserId(e.target.value)}>
            <option value="">Select user</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        )}
      </div>
      {/* Conversation view */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Conversation</h3>
        <div className="bg-white border rounded shadow p-4 min-h-[200px]">
          {loading ? (
            <div className="text-gray-500">Loading messages...</div>
          ) : (
            <ul>
              {messages.map(msg => (
                <li key={msg.id} className={`mb-2 ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}> 
                  <span className={`inline-block px-3 py-2 rounded ${msg.sender_id === user.id ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.message}</span>
                  <span className="ml-2 text-xs text-gray-500">{msg.created_at}</span>
                  {!msg.read && msg.receiver_id === user.id && (
                    <button className="ml-2 text-xs text-blue-600 underline" onClick={() => markAsRead(msg.id)}>Mark as Read</button>
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
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!selectedUserId}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={!selectedUserId}>Send</button>
        </form>
      </div>
    </div>
  );
} 