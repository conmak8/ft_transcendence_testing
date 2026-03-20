<script>
  import FriendsForm from "../components/FriendsForm.svelte";
  import RoomsForm from "../components/RoomsForm.svelte";
  import ChatForm from "../components/ChatForm.svelte";


  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from "../stores/authStore";
  import { connect, roomState } from "../stores/roomStore.svelte";

  onMount(() => {
    const session = get(authStore);
    
    // Connect only if we have a token and aren't already connected
    if (session.sessionToken && !roomState.isConnected)
    {
      connect(session.sessionToken);
      console.log("Connecting with token:", session.sessionToken);
    }
  });
</script>

<main>
  <div class="dashboard-layout">

    <!-- {#if !roomState.isAuthenticated}
      <div class="connection-overlay">Connecting to server...
        {!roomState.isConnected ? 'Connecting...' : 'Authenticating...'}
      </div>
    {/if} -->

    <ChatForm />
    <FriendsForm />
    <RoomsForm />
  </div>
</main>

<style>
.dashboard-layout {
  position: relative;
  min-height: 100vh;
}


.connection-overlay
{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  z-index: 2000;
  letter-spacing: 1px;
  font-weight: bold;
  text-shadow: 0 2px 8px #000;
}
</style>
