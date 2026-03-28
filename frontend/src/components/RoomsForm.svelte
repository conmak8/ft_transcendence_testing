<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import GameRoom from './GameRoom.svelte';
  import { ws } from '../stores/websocket.svelte.js';
  import { authStore } from '../stores/authStore';

  let isExpanded = $state(false);
  let rooms: any[] = $state([]);
  let loadingRooms = $state(false);
  let showCreateForm = $state(false);
  let newRoomName = $state('');
  let newRoomPlayers = $state(2);

  function togglePanel() {
    isExpanded = !isExpanded;
    if (isExpanded && rooms.length === 0) {
      fetchRooms();
    }
  }

  async function fetchRooms() {
    loadingRooms = true;
    try {
      const res = await fetch('/api/rooms');
      rooms = await res.json();
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      loadingRooms = false;
    }
  }

  function handleCreate() {
    if (newRoomName.trim()) {
      ws.createRoom(newRoomName.trim(), newRoomPlayers);
      newRoomName = '';
      newRoomPlayers = 2;
      showCreateForm = false;
    }
  }

  function handleLeaveRoom() {
    ws.leaveRoom();
    fetchRooms();
  }

  const currentUserId = $derived($authStore.userId);
</script>

<!-- GameRoom overlay when in a room -->
{#if ws.currentRoom}
  <GameRoom
    room={ws.currentRoom}
    players={ws.players}
    messages={ws.messages}
    gameActive={ws.gameActive}
    gameState={ws.gameState}
    gameEndResult={ws.gameEndResult}
    {currentUserId}
    onleave={handleLeaveRoom}
    onready={() => ws.toggleReady()}
    onchat={(content: string) => ws.sendChat(content)}
    ongameInput={(dir: string) => ws.sendGameInput(dir)}
    ondismissResults={() => { ws.gameEndResult = null; }}
  />
{/if}

<aside class="rooms-drawer" class:expanded={isExpanded}>
  <Button
    type="button"
    variant="expand-trigger-right"
    onclick={togglePanel}
    ariaExpanded={isExpanded}
    ariaLabel={isExpanded ? 'Close rooms panel' : 'Open rooms panel'}
  >
    ROOMS
  </Button>

  {#if isExpanded}
    <div class="rooms-panel">
      <div class="panel-header">
        <h2>Rooms</h2>
        <div class="header-actions">
          <button class="create-btn" onclick={() => showCreateForm = !showCreateForm}>
            {showCreateForm ? 'Cancel' : '+ New'}
          </button>
          <button class="refresh-btn" onclick={fetchRooms}>↺</button>
        </div>
      </div>

      {#if showCreateForm}
        <div class="create-form">
          <input
            type="text"
            placeholder="Room name..."
            bind:value={newRoomName}
            maxlength="50"
          />
          <select bind:value={newRoomPlayers}>
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
          <button class="create-submit" onclick={handleCreate} disabled={!newRoomName.trim()}>
            Create
          </button>
        </div>
      {/if}

      <div class="rooms-list">
        {#if loadingRooms}
          <div class="status-msg">Loading rooms...</div>
        {:else if rooms.length === 0}
          <div class="status-msg">No rooms available</div>
        {:else}
          {#each rooms as room}
            <div class="room-card" class:in-game={room.status === 'IN_GAME'}>
              <div class="room-info">
                <span class="room-name">{room.name}</span>
                <span class="room-meta">
                  {room.player_count}/{room.max_players}
                  <span class="status-badge" class:waiting={room.status === 'WAITING'}>
                    {room.status}
                  </span>
                </span>
              </div>
              <button
                class="join-btn"
                onclick={() => ws.joinRoom(room.id)}
                disabled={room.status === 'IN_GAME' || room.player_count >= room.max_players}
              >
                {#if room.status === 'IN_GAME'}In Game
                {:else if room.player_count >= room.max_players}Full
                {:else}Join{/if}
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</aside>

<style>
  .rooms-drawer {
    position: fixed;
    right: 0;
    top: 100px;
    bottom: 60px;
    width: 50px;
    overflow: hidden;
    transition: width 0.3s ease;
  }

  .rooms-drawer.expanded {
    width: max(320px, 33.333vw);
  }

  .rooms-panel {
    margin-right: 55px;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(10, 235, 0, 0.1);
    background: rgba(15, 19, 20, 0.6);
    backdrop-filter: blur(10px);
    padding: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rooms-panel:hover {
    border-color: #0AEB00;
    background: rgba(10, 235, 0, 0.02);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  h2 {
    margin: 0;
    color: #0AEB00;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .create-btn {
    background: #B13BCC;
    color: #fff;
    border: none;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .refresh-btn {
    background: #333;
    color: #0AEB00;
    border: 1px solid #0AEB00;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    border-radius: 4px;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #222;
    border: 1px solid #B13BCC;
    border-radius: 6px;
  }

  .create-form input,
  .create-form select {
    padding: 0.4rem;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .create-submit {
    background: #0AEB00;
    color: #000;
    border: none;
    padding: 0.4rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
  }

  .create-submit:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }

  .rooms-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-msg {
    text-align: center;
    padding: 1.5rem;
    color: #666;
  }

  .room-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #222;
    border: 1px solid #333;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
  }

  .room-card.in-game {
    opacity: 0.6;
    border-color: #B13BCC;
  }

  .room-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .room-name {
    font-weight: bold;
    color: #fff;
    font-size: 0.9rem;
  }

  .room-meta {
    font-size: 0.8rem;
    color: #888;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .status-badge {
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-size: 0.75rem;
    background: #B13BCC;
  }

  .status-badge.waiting {
    background: #0AEB00;
    color: #000;
  }

  .join-btn {
    background: #0AEB00;
    color: #000;
    border: none;
    padding: 0.4rem 0.8rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .join-btn:hover:not(:disabled) {
    background: #09c700;
  }

  .join-btn:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }
</style>
