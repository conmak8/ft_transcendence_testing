<script lang="ts">
    export let room;
    import Button from "./Button.svelte";
    
    const isFull = room.currentPlayers === room.maxPlayers;
    const fillPercent = (room.currentPlayers / room.maxPlayers) * 100;
</script>

<div class="room-card" class:full={isFull}>
    <h3 class="room-name">{room.name}</h3>
    <div class="fee-container">
        <span class="fee">💰 {room.entryFee}</span>
    </div>
    <hr class="line" /> 

    <div class="room-body">
        <div class="players">
            <div class="player-bar">
                <div class="player-fill" style="width:{fillPercent}%"></div>
            </div>
            
            <span class="player-count">
                {#if isFull}
                FULL
                {:else}
                {room.currentPlayers} / {room.maxPlayers} Players
                {/if}
            </span>
        </div>
        <Button variant="join" type="button" disabled={isFull}>{isFull ? "Full" : "Join"}</Button>
    </div>
</div>

<style>
    .room-card
    {
        padding: 1.4rem;
        border: 1px solid rgba(10, 235, 0, 0.1);
        background: rgba(15, 19, 20, 0.6);
        margin-bottom: 2rem;
    }

    .room-card:hover
    {
        border-color: #0AEB00;
    }

    .room-name
    {
        color:  #B13BCC;
        font-size: 20px;
        font-weight: 800;
        text-align: left;
        margin: 0;
    }

    .line
    {
        border: none;
        border-top: 1.5px solid #b13bcc77;
        width: 100%;
    }

    .fee-container
    {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }
    .fee 
    {
        color: #c8eb00;
        font-size: 14px;
        font-weight: 600;
    }
    
    .room-body
    {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .players
    {
       width: 40%;
        
    }

    .player-bar
    {
        height: 6px;
        background: rgba(255,255,255,0.08);
        margin-top: 16px;
    }

    .player-fill
    {
        height: 100%;
        background: #0AEB00;
        transition: width 0.3s ease;
    }

   .player-count
    {
        font-size: 13px;
        color: #ccc;
    }

    .room-card.full .player-fill
    {
        background: #ff4444;
    }

    .room-card.full .player-count
    {
        color: #ff4444;
    }
</style>