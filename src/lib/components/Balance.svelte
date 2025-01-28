<script lang="ts">
  import { balance } from '$lib/stores/game';
  let balanceFormatted = $derived(
    $balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
</script>

<div class="flex overflow-hidden rounded-md">
  <div
    class="flex gap-2 bg-slate-900 px-3 py-2 text-sm font-semibold tabular-nums text-white sm:text-base"
  >
    <span class="select-none text-gray-500">$</span>
    <span class="min-w-16 text-right">
      {balanceFormatted}
    </span>
  </div>
</div>
