<script lang="ts">
    import { roomState, send } from "../stores/roomStore.svelte";
    import Button from "../components/Button.svelte";
    
    function handleLeaveRoom()
    {
        if (roomState.currentRoomId)
        {
            // we send the ID as a Number to match backend expectations
            send('room:leave', { room_id: Number(roomState.currentRoomId) });
        }
    }
</script>

<main>
<div class="room">
        <h1>Room: {roomState.currentRoom?.name || 'Loading...'}</h1>
        
        <div class="players-list">
            {#each roomState.currentRoomPlayers as player}
                <p>{player.username} (Slot {player.slot})</p>
            {/each}
        </div>

        <Button onclick={handleLeaveRoom} variant="reset">Leave Room</Button>
    </div>
</main>

<style>
    .room
    {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color :beige;
    }

</style>