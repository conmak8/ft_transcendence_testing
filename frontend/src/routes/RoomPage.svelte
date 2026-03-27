<script>
  import Sidebar from "../components/Sidebar-room.svelte";
  import Game from "../components/Game.svelte";
</script>

<main>
  <div class="dashboard-layout">
    <Sidebar />
    <Game />
  </div>
</main>

<style>
.dashboard-layout
{
  position: relative;
  min-height: 100vh;
}


</style>