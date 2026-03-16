<script lang="ts">
	import Button from './Button.svelte';
	export let onClose: () => void;
	export let onCreate: (room: { name: string; entryFee: number; maxPlayers: number }) => void;

	let name = '';
	let entryFee = 0;
	let maxPlayers = 2;

	function handleSubmit()
    {
		if (!name || entryFee < 0 || maxPlayers < 2) return;
		onCreate({ name, entryFee, maxPlayers });
		onClose();
	}
</script>

<div class="modal-overlay">
	<div class="modal">
		<h2>Create Room</h2>
        <form on:submit|preventDefault={handleSubmit}>
            <div class= "input-group">
            <p>ROOM NAME</p>
                <label>
                    <input type="text" bind:value={name} required />
                </label>

                <p>Entry Fee</p>
                <label>
                    <input type="number" bind:value={entryFee} min="0" required />
                </label>

                <p>Max Players</p>
                <label>
                    <input type="number" bind:value={maxPlayers} min="2" max="8" required />
                </label>
                <div class="actions">
                    <Button type="button" variant="cancel" onclick={onClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </div>
            </div>
		</form>
	</div>
</div>

<style>
.modal-overlay
{
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0,0,0,0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal
{
	background: #181a1b;
	padding: 42px 82px;
    /* border: 1px solid #0AEB00;
	box-shadow: 0 4px 32px rgba(0,0,0,0.2); */
    border: 1px solid rgba(10, 235, 0, 0.1);
    background: rgba(15, 19, 20, 0.9);
	/* min-width: 320px;
	max-width: 90vw; */
     backdrop-filter: blur(100px);
}

.modal:hover
{
    border-color: #0AEB00;
    background: rgba(10, 235, 0, 0.02); 
}

label
{
	display: block;
	margin-bottom: 16px;
	color: #fff;
}

input
{
	width: 300px;
	height: 50px;
	padding: 10px;
	font-size: 16px;
	border: 1px solid #0AEB00;
	background-color: #1a1a1a;
	color: white;
}

input:focus
{
	outline: none;
	border-color: #B13BCC;
}

input:-webkit-autofill
{
	background-color: #1a1a1a !important;
	color: white !important;
	-webkit-text-fill-color: white !important;
	-webkit-box-shadow: 0 0 0 1000px #1a1a1a inset !important;
}

/* input.error
{
	border: 2px solid #ff4444;
} */

.input-group
{
    margin-bottom: 4rem;
}

.input-group p
{
    text-align: left;
    color: #B13BCC;
    font-size: 14px;
    font-weight: 800;
    margin: 0 0 8px 13px;
}

.actions
{
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 24px;
}

h2
{
	color: #0AEB00;
	margin-bottom: 24px;
}
</style>