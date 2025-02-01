<script lang="ts">
  import Plinko from '$lib/components/Plinko/Plinko.svelte';
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import ModalWins from '$lib/components/ModalWins.svelte';

  import {totalProfitHistory} from '$lib/stores/game';

  const modal = document.querySelector('.game-modal') as HTMLElement;

  const str = document.querySelector('#APP_DATA')?.textContent;
  let appProps: any;

  try {
    appProps = JSON.parse(str);
  } catch (e) {
    appProps = {};
  }

  totalProfitHistory.subscribe((total) => {
    if(modal && total[total.length-1] === 450) {
      setTimeout(()=>{modal.style.display = 'block';}, 500);
    }
    return total;
  });

</script>


<div class="game-container">
  <Plinko currency="{appProps.currency}"/>
  <Sidebar lang="{appProps}"/>
</div>

<style lang="scss">
  .game-container {
    margin-top: 11px;
    $self: &;
  }

</style>
