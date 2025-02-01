<script lang="ts">
  import { plinkoEngine } from '$lib/stores/game';
  import type { Action } from 'svelte/action';
  import BinsRow from './BinsRow.svelte';
  import LastWins from './LastWins.svelte';
  import PlinkoEngine from './PlinkoEngine';

  const { WIDTH, HEIGHT } = PlinkoEngine;

  let { currency } = $props();

  const initPlinko: Action<HTMLCanvasElement> = (node) => {
    $plinkoEngine = new PlinkoEngine(node);
    $plinkoEngine.start();

    return {
      destroy: () => {
        $plinkoEngine?.stop();
      },
    };
  };
</script>

<div class="game-plinko">
  <div class="game-plinko__container" style:max-width={`${WIDTH}px`}>
    <div class="game-plinko__wrapper" style:aspect-ratio={`${WIDTH} / ${HEIGHT}`}>
      <canvas use:initPlinko width={WIDTH} height={HEIGHT} class="game-plinko__canvas">
      </canvas>
    </div>
    <BinsRow />
  </div>
  <LastWins currency="{currency}"/>
</div>

<style lang="scss">
  .game-plinko {
    $self: &;

    &__container {
      margin-inline: auto;
    }

    &__wrapper {
      position: relative;
      width: 100%;
    }

    &__canvas {
      position: absolute;
      width: 100%;
      height: 100%;
      inset: 0;
    }
  }
</style>
