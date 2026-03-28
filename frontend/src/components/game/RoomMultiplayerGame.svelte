<script lang="ts">
  import { roomState } from '../../stores/roomStore.svelte';

  const hasGameState = $derived(!!roomState.gameState);
  const players = $derived(roomState.currentRoomPlayers ?? []);
  const gameStatus = $derived(roomState.gameStatus ?? 'idle');
</script>

<div class="room-game-shell">
  <div class="room-game-header">
    <h2>Room Match</h2>
    <p>Status: <strong>{gameStatus}</strong></p>
  </div>

  {#if !roomState.currentRoom}
    <div class="room-game-empty">
      <p>No active room selected.</p>
    </div>
  {:else}
    <div class="room-game-layout">
      <aside class="room-game-sidebar">
        <h3>Players</h3>
        <ul>
          {#each players as player}
            <li>
              <span>{player.username}</span>
              <span>slot {player.slot}</span>
              <span>{player.is_ready ? 'ready' : 'not ready'}</span>
            </li>
          {/each}
        </ul>
      </aside>

      <section class="room-game-stage">
        {#if hasGameState}
          <div class="room-game-placeholder">
            <p>Backend multiplayer state is connected ✅</p>
            <p>TODO: Render </p>
          </div>
        {:else}
          <div class="room-game-placeholder">
            <p>Waiting for game state...</p>
            <p>Join, ready up, and start the match.</p>
          </div>
        {/if}
      </section>
    </div>
  {/if}
</div>

<style>
  .room-game-shell {
    position: fixed;
    top: 100px;
    bottom: 60px;
    left: 10px;
    width: calc(100vw - 490px);
    background: rgb(15, 19, 20);
    border: 1px solid rgba(10, 235, 0, 0.1);
    display: flex;
    flex-direction: column;
    padding: 24px;
    box-sizing: border-box;
    gap: 16px;
  }

  .room-game-header h2,
  .room-game-header p {
    margin: 0;
  }

  .room-game-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 20px;
    min-height: 0;
    flex: 1;
  }

  .room-game-sidebar {
    border: 1px solid rgba(10, 235, 0, 0.1);
    padding: 16px;
    overflow: auto;
  }

  .room-game-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .room-game-stage {
    border: 1px solid rgba(10, 235, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  .room-game-placeholder {
    text-align: center;
    opacity: 0.9;
  }
</style>