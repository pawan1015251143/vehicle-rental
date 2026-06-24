import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchChats, getOrCreateChat, fetchMessages, addMessage, setActiveChat } from '../../redux/slices/chatSlice';
import { connectSocket, getSocket, disconnectSocket } from '../../services/socket';
import Loader from '../../components/common/Loader';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { chats, activeChat, messages, loading } = useSelector((state) => state.chat);
  const { user, token } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    if (token) {
      socketRef.current = connectSocket(token);

      socketRef.current.on('new-message', (data) => {
        dispatch(addMessage(data.message));
      });

      socketRef.current.on('user-typing', () => setTyping(true));
      socketRef.current.on('user-stop-typing', () => setTyping(false));
    }

    return () => {
      disconnectSocket();
    };
  }, [token, dispatch]);

  // Fetch chats
  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Handle direct chat from vehicle page
  useEffect(() => {
    if (location.state?.participantId) {
      dispatch(getOrCreateChat({ participantId: location.state.participantId }));
    }
  }, [location.state, dispatch]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat?._id) {
      dispatch(fetchMessages(activeChat._id));
      const socket = getSocket();
      if (socket) {
        socket.emit('join-chat', activeChat._id);
      }
    }
  }, [activeChat?._id, dispatch]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send-message', {
        chatId: activeChat._id,
        content: message.trim(),
      });
      socket.emit('stop-typing', activeChat._id);
    }
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeChat) {
      socket.emit('typing', activeChat._id);
      setTimeout(() => socket.emit('stop-typing', activeChat._id), 2000);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat?.participants?.find((p) => p._id !== user?._id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="bg-white rounded-xl shadow-md border flex h-[600px]">
        {/* Chat List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <Loader size="sm" />
            ) : chats.length > 0 ? (
              chats.map((chat) => {
                const other = getOtherParticipant(chat);
                return (
                  <button
                    key={chat._id}
                    onClick={() => dispatch(setActiveChat(chat))}
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                      activeChat?._id === chat._id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
                        {other?.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{other?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{other?.role}</p>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                <FiMessageSquare className="text-3xl mx-auto mb-2 text-gray-300" />
                No conversations yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {getOtherParticipant(activeChat)?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{getOtherParticipant(activeChat)?.name}</p>
                  {typing && <p className="text-xs text-green-500">typing...</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
                  return (
                    <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" disabled={!message.trim()} className="btn-primary px-4">
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageSquare className="text-5xl mx-auto mb-3" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
