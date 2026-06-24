import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChats = createAsyncThunk('chat/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/chats');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
  }
});

export const getOrCreateChat = createAsyncThunk('chat/getOrCreate', async ({ participantId, bookingId }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/chats', { participantId, bookingId });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return { chatId, messages: data.messages };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => { state.activeChat = action.payload; },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.activeChat = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => { state.loading = true; })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.chats;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.activeChat = action.payload.chat;
        // Add to chats list if not exists
        const exists = state.chats.find((c) => c._id === action.payload.chat._id);
        if (!exists) state.chats.unshift(action.payload.chat);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      });
  },
});

export const { setActiveChat, addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
