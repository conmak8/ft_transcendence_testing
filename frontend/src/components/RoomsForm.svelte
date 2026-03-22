<script lang="ts">
    // import { onMount } from 'svelte';
    // import { getAllRooms } from '../services/roomService.svelte.ts';
    import { roomState, send } from '../stores/roomStore.svelte';
    // import { connect } from '../stores/roomStore.svelte';
    // import { authStore } from '../stores/authStore';

    
    import RoomCard from './Roomcard.svelte';
    import Button from './Button.svelte';
    import CreateRoomForm from './CreateRoomForm.svelte';


    let isExpanded = $state(true);
    let showCreateModal = $state(false);
    // let allRooms = $state<Room[]>([]);


    // 1. Add Filter States
    let searchQuery = $state('');
    let sortType = $state<'players' | 'fee'>('players');

    // 2. Create a derived filtered list
    let filteredRooms = $derived(
        roomState.rooms
            .filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortType === 'players') return b.currentPlayers - a.currentPlayers;
                if (sortType === 'fee') return b.buy_in_amount - a.buy_in_amount;
                return 0;
            })
    );

    function handleJoin(roomId: string)
    {
        send('room:join', { room_id: Number(roomId) });
    }

    function handleCreate(roomData: { name: string; entryFee: number; maxPlayers: number }) {
        showCreateModal = !showCreateModal;
        const backendRoomData = {
            name: roomData.name,
            max_players: roomData.maxPlayers,
            buy_in_amount: roomData.entryFee,
            time_limit_seconds: null,
            win_condition: 'SCORE',
            status: 'WAITING',
            is_permanent: false
        };
        // Return a promise that resolves with the new room id
      return new Promise((resolve) => {
        function onRoomCreated(event: any) {
            // Access through event.detail
            const room = event.detail?.room;
            if (room && room.id) {
                window.removeEventListener('room:created', onRoomCreated);
                showCreateModal = false; // Close modal here
                resolve(room.id);
            }
        }
            window.addEventListener('room:created', onRoomCreated);
            send('room:create', backendRoomData);
        });
    }

    function togglePanel()
    {
        isExpanded = !isExpanded;
    }

</script>



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
    
    {#if showCreateModal}
    <CreateRoomForm 
            onClose={() => showCreateModal = false}
            onCreate={handleCreate} 
        />
    {/if}

    {#if isExpanded}
    <div class="rooms-panel">
        <div class="rooms-header">
            <h2>Rooms : <span class="room-count"> {roomState.rooms.length}</span></h2>
                <Button variant="create" type="button" onclick={() => showCreateModal = true}>+</Button>
         </div>
        <div class="filter-toolbar">
            <input 
                type="text" 
                placeholder="Search..." 
                bind:value={searchQuery}
                class="search-input"
            />
            <select bind:value={sortType} class="sort-select">
                <option value="players">Players</option>
                <option value="fee">Entry Fee</option>
            </select>
        </div>
        {#each filteredRooms as room (room.id)}
             <RoomCard {room} onJoin={() => handleJoin(room.id)} />
        {:else}
            <p class="no-rooms">No rooms found...</p>
        {/each}
    </div>
    {/if}
</aside>

<style>

    .room-count
    {
        /* background: #0ceb00; */
        /* border: 0.4px solid #B13BCC; */
        color: #fff;
        /* color: #0ceb00; */
        padding: 2px 10px;
        font-size: 1.4em;
        /* margin-left: 8px; */
        font-weight: bold;
    }
    .rooms-drawer
    {
        position: fixed;
        right: 0;
        top: 100px;
        bottom: 60px;
        width: 50px;
        overflow: hidden;
        transition: width 0.3s ease;
    }

    .rooms-drawer.expanded
    {
        width: max(320px, calc(33.333vw/1.5));
    }

    .rooms-panel
    {
        margin-right: 55px;
        height: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(10, 235, 0, 0.1);
        background: rgba(15, 19, 20, 0.6);
        backdrop-filter: blur(10px);
        padding: 36px;
        overflow-y: auto;
    }

    .rooms-panel:hover
    {
        border-color: #0AEB00;
        background: rgba(10, 235, 0, 0.02);
    }

    .rooms-header
    {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
    }

    h2
    {
        /* margin: 0 0 14px; */
        color: #0AEB00;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: left;
    }


    /* Custom scrollbar maybe not work for Firefox */
    .rooms-panel::-webkit-scrollbar
    {
        width: 12px;
    }

    .rooms-panel::-webkit-scrollbar-thumb
    {
        background: #B13BCC;
    }

    .rooms-panel::-webkit-scrollbar-track
    {
        background: rgba(30, 157, 189, 0.3);
        /* background: rgba(0, 0, 0, 0.3); */
    }



    .filter-toolbar
    {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
    }

    .search-input, .sort-select
    {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(10, 235, 0, 0.3);
        color: #0AEB00;
        padding: 6px 10px;
        outline: none;
    }

    .search-input
    {
        flex: 1;
    }

    .search-input:focus, .sort-select:focus
    {
        border-color: #0AEB00;
        /* box-shadow: 0 0 5px rgba(10, 235, 0, 0.5); */
    }

    .sort-select option
    {
        background: #0F1314;
        color: #0AEB00;
    }

    .no-rooms
    {
        color: #666;
        font-style: italic;
        text-align: center;
        margin-top: 20px;
    }
</style>
