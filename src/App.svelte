<script lang="ts">
  import Plinko from '$lib/components/Plinko/Plinko.svelte';
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import ModalWins from '$lib/components/ModalWins.svelte';

  import { totalProfitHistory } from '$lib/stores/game';

  let totalProfit = $derived($totalProfitHistory);

</script>


<div class="game-container">
  <Plinko />
  <Sidebar />
  {#if totalProfit[totalProfit.length-1] === 450}
    <ModalWins />
  {/if}
</div>

<style lang="scss">
  .game-container {
    margin-top: 11px;
    $self: &;
  }

</style>
