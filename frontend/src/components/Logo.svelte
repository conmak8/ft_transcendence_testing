<!-- <script>
    let size= 10;
</script>

<div class="logo">
    <div class="sq1"></div>
<div class="sq3"></div>    <div class="sq2"></div>
    <div class="sq3"></div>
    <div class="sq4"></div>
</div>

<style>
    .sq1
    {
        width:10px;
        height:10px;
        background: rgb(255, 255, 255);
        left: 10px;
    }

    .sq2
    {
        position: relative;
        width:10px;
        height:10px;
        background: rgb(131, 43, 43);
        left: 10px;
        top: -10px;
    }
      .sq3
    {
        position: relative;
        width:10px;
        height:10px;
        background: rgb(219, 122, 122);
        left: 20px;
        top: -20px;
    }
        .sq4
    {
        position: relative;
        width:10px;
        height:10px;
        background: rgb(87, 49, 49);
        left: 20px;
        top: -40px;
    }
</style> -->

<script>
  let { size = 15, onclick = null } = $props();

  const grid = [
    0, 0, 1, 1, 1, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 1, 0, 1, 0, 1, 0,
    1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
  ];

const colors = [
  "rgba(0,0,0)",
  "rgba(14,14,14)",
  "rgba(28,28,28)",
  "rgba(43,43,43)",
  "rgba(57,57,57)",
  "rgba(71,71,71)",
  "rgba(85,85,85)",
  "rgba(99,99,99)",
  "rgba(113,113,113)",
  "rgba(128,128,128)",
  "rgba(142,142,142)",
  "rgba(156,156,156)",
  "rgba(170,170,170)",
  "rgba(184,184,184)",
  "rgba(198,198,198)",
  "rgba(213,213,213)",
  "rgba(227,227,227)",
  "rgba(241,241,241)",
  "rgba(255,255,255)"
];

  function getColor(index, isLit)
  {
    if (!isLit) return 'transparent)';
    const col = index % 10;
    const colorIndex = Math.round(col * (colors.length - 1) / 9);
    return colors[colorIndex];
  }
</script>

{#if onclick}
  <button class="logo" type="button" style="--sq: {size}px" {onclick}>
    {#each grid as cell, i}
      <span class="sq" style="background: {getColor(i, cell)}"></span>
    {/each}
  </button>
{:else}
  <div class="logo" style="--sq: {size}px">
    {#each grid as cell, i}
      <span class="sq" style="background: {getColor(i, cell)}"></span>
    {/each}
  </div>
{/if}

<style>
  .logo
  {
    display: grid;
    grid-template-columns: repeat(10, var(--sq));
    grid-template-rows: repeat(3, var(--sq));
    gap: 1px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .sq
  {
    width: var(--sq);
    height: var(--sq);
    display: block;
    transition: all 0.3s ease;
  }

  .logo:hover .sq
  {
    filter: brightness(10);
    transform: scale(1);
  }
</style>