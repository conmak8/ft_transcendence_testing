<script lang="ts">
    export let room;
    import Button from "./Button.svelte";
</script>

<div class="room-card">
  <div class="header-row">
    <h3 class="room-name">{room.name}</h3>
    <p class="fee">Entry Fee: {room.entryFee}</p>
</div>
<Button variant="join" type="button" disabled={room.currentPlayers == room.maxPlayers}>Join</Button>
<div class="players" class:full={room.currentPlayers === room.maxPlayers}> {room.currentPlayers} / {room.maxPlayers} </div>
</div>

<style>
    .room-card
    {
        width:auto;
        padding: 2rem;
        padding-top: 0rem;
        border: 1px solid rgba(10, 235, 0, 0.1);
        background: rgba(15, 19, 20, 0.6);
        color: white;
        margin-bottom: 1rem;
    }

    .room-card:hover
    {
        border-color: #0AEB00;
        /* shadow in the border */
        /* box-shadow: 0 0 12px rgba(10,235,0,0.25); */
    }

    .room-name
    {
        text-align: left;
        color:  #B13BCC;
        font-size: 22px;
        font-weight: 900;
    }

    .players
    {
        text-align: left;
        width: 35px;
        border: 1px solid rgba(10, 235, 0, 0.1);
        background: rgba(15, 19, 20, 0.6);
        padding: 0.7rem;
        
    }

    .header-row
    {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0rem;
    }
    .fee
    {
        font-size: 16px;
        margin-left: 1rem;
        font-weight: 500;
        color: #0AEB00;
    }
    .players.full
    {
        background: #ff4444;
        color: #fff;
        border-color: #ff4444;
    }
</style>