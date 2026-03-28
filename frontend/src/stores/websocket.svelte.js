/**
 * WebSocket Store - Svelte 5 Runes
 */
import { get } from 'svelte/store';
import { authStore } from './authStore.ts';

// Connection state
let socket = $state(null);
let connected = $state(false);
let authenticated = $state(false);

// Room state
let currentRoom = $state(null);
let players = $state([]);
let messages = $state([]);

// Global chat state
let globalMessages = $state([]);
let roomInvite = $state(null); // pending invite notification

// Game state
let gameActive = $state(false);
let gameState = $state(null);
let gameId = $state(null);
let gameEndResult = $state(null);

// Reconnect state (plain vars, not reactive)
let shouldReconnect = false;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 1000;

// Event handlers
let onGameStart = $state(null);
let onGameStateUpdate = $state(null);
let onGameEnd = $state(null);

export function connect() {
  if (socket) return;
  shouldReconnect = true;
  reconnectAttempts = 0;
  _connect();
}

function _connect() {
  if (socket) return;

  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('🔌 WS Connected');
    connected = true;
    reconnectAttempts = 0;

    const currentToken = get(authStore).sessionToken;
    if (currentToken) {
      send('auth', { token: currentToken });
    }
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    } catch (err) {
      console.error('❌ WS onmessage error:', err);
    }
  };

  socket.onclose = () => {
    console.log('🔌 WS Disconnected');
    connected = false;
    authenticated = false;
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = (err) => {
    console.error('🔌 WS Error:', err);
  };
}

function scheduleReconnect() {
  if (!shouldReconnect) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('🔌 WS: Max reconnect attempts reached');
    return;
  }

  const delay = RECONNECT_BASE_DELAY * Math.pow(2, Math.min(reconnectAttempts, 5));
  reconnectAttempts++;
  console.log(`🔌 WS: Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

  reconnectTimer = setTimeout(() => {
    const currentToken = get(authStore).sessionToken;
    if (currentToken && shouldReconnect) {
      _connect();
    }
  }, delay);
}

export function disconnect() {
  shouldReconnect = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
  currentRoom = null;
  players = [];
  messages = [];
  gameActive = false;
  gameState = null;
  gameId = null;
  gameEndResult = null;
}

export function send(event, data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  } else {
    console.warn('WS not connected, cannot send:', event);
  }
}

function handleMessage(msg) {
  const { event, data } = msg;
  console.log('📥 WS:', event, data);

  switch (event) {
    case 'auth:success':
      authenticated = true;
      send('chat:history', { room_id: null });
      rejoinRoomIfNeeded();
      break;

    case 'auth:error':
      authenticated = false;
      console.error('WS Auth failed:', data.error);
      break;

    case 'room:created':
    case 'room:joined':
      currentRoom = data.room;
      players = data.players;
      messages = [];
      gameEndResult = null;
      send('chat:history', { room_id: data.room.id });
      break;

    case 'room:error':
      console.error('Room error:', data.error);
      break;

    case 'room:left':
      currentRoom = null;
      players = [];
      messages = [];
      gameActive = false;
      gameState = null;
      gameEndResult = null;
      break;

    case 'room:player_joined':
      players = [...players, { ...data.user, slot: data.slot, is_ready: false }];
      break;

    case 'room:player_left':
      players = players.filter(p => p.id !== data.user_id);
      break;

    case 'room:player_ready':
      players = players.map(p =>
        p.id == data.user_id ? { ...p, is_ready: data.is_ready } : p
      );
      break;

    case 'chat:message':
      if (data.room_id === null) {
        globalMessages = [...globalMessages, data];
      } else {
        messages = [...messages, data];
      }
      break;

    case 'chat:history':
      if (data.room_id === null) {
        globalMessages = data.messages || [];
      } else {
        messages = data.messages || [];
      }
      break;

    case 'game:start':
      gameActive = true;
      gameEndResult = null;
      gameId = data.game_id;
      gameState = data.initial_state;
      onGameStart?.(data);
      break;

    case 'game:state':
      gameState = data;
      onGameStateUpdate?.(data);
      break;

    case 'game:end':
      gameActive = false;
      gameEndResult = data;
      players = players.map(p => ({ ...p, is_ready: false }));
      onGameEnd?.(data);
      break;

    case 'room:kicked':
      currentRoom = null;
      players = [];
      messages = [];
      gameActive = false;
      gameState = null;
      gameEndResult = null;
      console.warn('You were kicked from the room:', data.reason);
      break;

    case 'room:invite_received':
      roomInvite = data;
      break;

    case 'error':
      console.error('WS Error:', data.error);
      break;
  }
}

function rejoinRoomIfNeeded() {
  if (currentRoom) {
    console.log('🔌 WS: Rejoining room', currentRoom.id);
    send('room:join', { room_id: currentRoom.id });
  }
}

export const ws = {
  get connected() { return connected; },
  get authenticated() { return authenticated; },
  connect,
  disconnect,
  send,

  get currentRoom() { return currentRoom; },
  get players() { return players; },
  get messages() { return messages; },

  createRoom(name, maxPlayers = 2) {
    send('room:create', { name, max_players: maxPlayers });
  },
  joinRoom(roomId) {
    send('room:join', { room_id: roomId });
  },
  leaveRoom() {
    if (currentRoom) send('room:leave', { room_id: currentRoom.id });
  },
  toggleReady() {
    if (currentRoom) send('room:ready', { room_id: currentRoom.id });
  },
  sendChat(content, roomId = null) {
    send('chat:send', { room_id: roomId ?? currentRoom?.id ?? null, content });
  },

  get gameActive() { return gameActive; },
  get gameState() { return gameState; },
  get gameId() { return gameId; },
  get gameEndResult() { return gameEndResult; },
  set gameEndResult(val) { gameEndResult = val; },
  sendGameInput(direction) {
    send('game:input', { direction });
  },

  set onGameStart(fn) { onGameStart = fn; },
  set onGameState(fn) { onGameStateUpdate = fn; },
  set onGameEnd(fn) { onGameEnd = fn; },

  get globalMessages() { return globalMessages; },
  get roomInvite() { return roomInvite; },
  set roomInvite(val) { roomInvite = val; },
  kickPlayer(roomId, targetUserId) {
    send('room:kick', { room_id: roomId, target_user_id: targetUserId });
  },
  inviteToRoom(roomId, targetUserId) {
    send('room:invite', { room_id: roomId, target_user_id: targetUserId });
  },
};
