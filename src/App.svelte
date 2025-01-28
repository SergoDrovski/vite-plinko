<script lang="ts">
  // import logo from '$lib/assets/logo.svg';
  import Balance from '$lib/components/Balance.svelte';
  import Plinko from '$lib/components/Plinko/Plinko.svelte';
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import { setBalanceFromLocalStorage, writeBalanceToLocalStorage } from '$lib/utils/game';

  $effect(() => {
    setBalanceFromLocalStorage();
  });
</script>

<svelte:window onbeforeunload={writeBalanceToLocalStorage} />

<div class="relative flex  w-full flex-col">

  <div class="flex-1 px-5">
    <div class="mx-auto mt-5 min-w-[300px] max-w-xl drop-shadow-xl md:mt-10 lg:max-w-7xl">
      <div class="flex flex-col-reverse overflow-hidden rounded-lg lg:w-full lg:flex-row">
        <div class="flex-1">
          <Plinko />

        </div>
      </div>
    </div>
  </div>

  <div class="mt-10">
    <Balance />
  </div>

  <div class="mt-10">
    <Sidebar />
  </div>
</div>

<style>
  :global(body) {
    @apply bg-gray-800;
  }
</style>
