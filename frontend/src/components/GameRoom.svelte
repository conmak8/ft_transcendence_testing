<script lang="ts">
  import { ws } from '../stores/websocket.svelte.js';

  let {
    room,
    players = [],
    messages = [],
    gameActive = false,
    gameState = null,
    gameEndResult = null,
    currentUserId = null,
    onleave,
    onready,
    onchat,
    ongameInput,
    ondismissResults,
  } = $props();

  let chatInput = $state('');
  let messagesEl: HTMLElement;
  let showInvite = $state(false);

  $effect(() => {
    messages.length;
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  function handleSendChat() {
    if (chatInput.trim()) {
      onchat?.(chatInput.trim());
      chatInput = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  function handleKick(targetId: string) {
    ws.kickPlayer(room.id, targetId);
  }

  const currentPlayer = $derived(players.find((p: any) => p.id == currentUserId));
  const isReady = $derived(currentPlayer?.is_ready ?? false);
  const allReady = $derived(players.length > 0 && players.every((p: any) => p.is_ready));
  const isWinner = $derived(gameEndResult && gameEndResult.winner_id == currentUserId);
  const isCreator = $derived(String(room?.creator_id) === String(currentUserId));
</script>

<div class="game-room-overlay">
  <div class="game-room">
    <div class="room-header">
      <div class="room-title">
        <h2>{room.name}</h2>
        {#if isCreator}<span class="operator-badge">Operator</span>{/if}
      </div>
      <div class="header-actions">
        {#if isCreator}
          <button class="invite-btn" onclick={() => showInvite = !showInvite}>
            {showInvite ? 'Cancel' : '+ Invite'}
          </button>
        {/if}
        <button class="leave-btn" onclick={onleave}>Leave Room</button>
      </div>
    </div>

    {#if showInvite && isCreator}
      <div class="invite-bar">
        <span class="invite-label">Send invite link or username to a friend:</span>
        <input
          class="invite-input"
          type="text"
          readonly
          value={`Room: ${room.name} — Join via the Rooms panel`}
          onclick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    {/if}

    <div class="room-content">
      <!-- Players panel -->
      <div class="players-panel">
        <h3>Players ({players.length}/{room.max_players})</h3>
        <div class="player-slots">
          {#each Array(room.max_players) as _, i}
            {@const player = players.find((p: any) => p.slot === i + 1)}
            <div class="player-slot" class:filled={player} class:ready={player?.is_ready}>
              {#if player}
                <div class="player-info">
                  <span class="player-name">{player.username}</span>
                  {#if String(player.id) === String(room.creator_id)}
                    <span class="op-icon" title="Operator">★</span>
                  {/if}
                </div>
                <div class="slot-right">
                  <span class="ready-status">{player.is_ready ? '✓ Ready' : 'Not Ready'}</span>
                  {#if isCreator && String(player.id) !== String(currentUserId) && !gameActive}
                    <button class="kick-btn" onclick={() => handleKick(player.id)} title="Kick">✕</button>
                  {/if}
                </div>
              {:else}
                <span class="empty-slot">Slot {i + 1} - Empty</span>
              {/if}
            </div>
          {/each}
        </div>

        {#if !gameActive}
          <button class="ready-btn" class:ready={isReady} onclick={onready}>
            {isReady ? 'Cancel Ready' : 'Ready Up'}
          </button>

          {#if allReady && players.length === room.max_players}
            <div class="starting">Game Starting...</div>
          {:else if players.length < room.max_players}
            <div class="waiting">Waiting for more players...</div>
          {:else}
            <div class="waiting">Waiting for all players to ready...</div>
          {/if}
        {/if}
      </div>

      <!-- Game panel -->
      <div class="game-panel">
        {#if gameEndResult}
          <div class="game-results">
            <h2 class="result-title" class:winner={isWinner}>
              {isWinner ? 'YOU WON!' : 'GAME OVER'}
            </h2>
            <div class="scores-list">
              {#each Object.entries(gameEndResult.scores) as [slot, score]}
                {@const player = players.find((p: any) => p.slot == slot)}
                <div class="score-row" class:winner-row={gameEndResult.winner_id == player?.id}>
                  <span class="score-player">{player?.username || `Player ${slot}`}</span>
                  <span class="score-value">{score} pts</span>
                </div>
              {/each}
            </div>
            <p class="play-again-hint">Ready up to play again!</p>
            <button class="play-again-btn" onclick={ondismissResults}>OK</button>
          </div>
        {:else if gameActive}
          <div class="game-placeholder">
            <p>Game in progress...</p>
          </div>
        {:else}
          <div class="game-placeholder">
            <div class="snake-icon">🐍</div>
            <p>Waiting for game to start...</p>
            <p class="hint">All players must be ready</p>
          </div>
        {/if}
      </div>

      <!-- Chat panel -->
      <div class="chat-panel">
        <h3>Room Chat</h3>
        <div class="messages" bind:this={messagesEl}>
          {#each messages as msg}
            <div class="message">
              <span class="sender">{msg.sender?.username ?? 'Unknown'}:</span>
              <span class="content">{msg.content}</span>
            </div>
          {/each}
        </div>
        <div class="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            bind:value={chatInput}
            onkeydown={handleKeydown}
          />
          <button onclick={handleSendChat}>Send</button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .game-room-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .game-room {
    background: #1a1a1a;
    border: 2px solid #0AEB00;
    border-radius: 8px;
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .room-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .room-header h2 {
    color: #0AEB00;
    margin: 0;
  }

  .operator-badge {
    background: #B13BCC;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .invite-btn {
    background: #1a4a1a;
    color: #0AEB00;
    border: 1px solid #0AEB00;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .invite-btn:hover { background: #0AEB00; color: #000; }

  .invite-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #1a2a1a;
    border: 1px solid rgba(10, 235, 0, 0.3);
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .invite-label { color: #888; font-size: 0.8rem; white-space: nowrap; }

  .invite-input {
    flex: 1;
    background: #222;
    border: 1px solid #333;
    color: #aaa;
    padding: 0.3rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    cursor: text;
  }

  .leave-btn {
    background: #333;
    color: #ff4444;
    border: 1px solid #ff4444;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
  }

  .leave-btn:hover {
    background: #ff4444;
    color: #fff;
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .op-icon {
    color: #B13BCC;
    font-size: 0.75rem;
    title: "Operator";
  }

  .slot-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .kick-btn {
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
  }

  .kick-btn:hover { background: #ff4444; color: #fff; }

  .room-content {
    display: grid;
    grid-template-columns: 220px 1fr 280px;
    gap: 1rem;
    flex: 1;
    min-height: 0;
  }

  .players-panel, .chat-panel {
    background: #222;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .players-panel h3, .chat-panel h3 {
    color: #0AEB00;
    margin: 0 0 1rem 0;
  }

  .player-slots {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .player-slot {
    background: #333;
    padding: 0.75rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 3px solid transparent;
  }

  .player-slot.filled { border-left-color: #B13BCC; }
  .player-slot.ready { border-left-color: #0AEB00; }

  .player-name { font-weight: bold; }
  .ready-status { font-size: 0.8rem; color: #888; }
  .player-slot.ready .ready-status { color: #0AEB00; }
  .empty-slot { color: #666; font-style: italic; }

  .ready-btn {
    margin-top: 1rem;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: bold;
    background: #0AEB00;
    color: #000;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .ready-btn.ready { background: #ff4444; color: #fff; }

  .waiting, .starting {
    margin-top: 0.5rem;
    text-align: center;
    color: #888;
    font-size: 0.9rem;
  }

  .starting {
    color: #0AEB00;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .game-panel {
    background: #111;
    border: 2px solid #0AEB00;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .game-placeholder {
    text-align: center;
    color: #666;
  }

  .snake-icon { font-size: 4rem; margin-bottom: 1rem; }
  .hint { font-size: 0.9rem; color: #444; }

  .game-results {
    text-align: center;
    padding: 2rem;
  }

  .result-title {
    font-size: 2rem;
    color: #ff4444;
    margin-bottom: 1.5rem;
    letter-spacing: 3px;
  }

  .result-title.winner { color: #0AEB00; }

  .scores-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .score-row {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.5rem 1rem;
    background: #222;
    border-radius: 4px;
  }

  .score-row.winner-row { border: 1px solid #0AEB00; }
  .score-player { font-weight: bold; color: #B13BCC; }
  .score-value { color: #fff; }

  .play-again-hint { color: #888; margin-bottom: 1rem; }

  .play-again-btn {
    background: #0AEB00;
    color: #000;
    border: none;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-right: 0.5rem;
  }

  .message { font-size: 0.9rem; }
  .sender { color: #B13BCC; font-weight: bold; }
  .content { color: #fff; }

  .chat-input {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .chat-input input {
    flex: 1;
    padding: 0.5rem;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    border-radius: 4px;
  }

  .chat-input button {
    background: #0AEB00;
    color: #000;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
  }
</style>
