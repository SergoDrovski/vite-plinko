<script lang="ts">
  // import logo from '$lib/assets/logo.svg';
  import Balance from '$lib/components/Balance.svelte';
  import Plinko from '$lib/components/Plinko/Plinko.svelte';
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import { setBalanceFromLocalStorage, writeBalanceToLocalStorage } from '$lib/utils/game';

  // $effect(() => {
  //   setBalanceFromLocalStorage();
  // });
</script>

<!--<svelte:window onbeforeunload={writeBalanceToLocalStorage} />-->

<div class="game-container">
  <Plinko />
  <Sidebar />
</div>

<style lang="scss">
  .game-container {
    margin-top: 11px;
    $self: &;
  }

</style>
