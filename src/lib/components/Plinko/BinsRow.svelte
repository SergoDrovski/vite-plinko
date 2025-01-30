<script lang="ts">
  import { binColorsByRowCount, binPayouts } from '$lib/constants/game';
  import { plinkoEngine, riskLevel, rowCount, winRecords } from '$lib/stores/game';
  import { isAnimationOn } from '$lib/stores/settings';
  import type { Action } from 'svelte/action';

  /**
   * Bounce animations for each bin, which is played when a ball falls into the bin.
   */
  let binAnimations: Animation[] = $state([]);

  let colors: string[] = [
    '#D80027',
    '#3652B5',
    '#318EFB',
    '#4BD0C0',
    '#31DC6B',
    '#4BD0C0',
    '#318EFB',
    '#3652B5',
    '#D80027',
  ];

  // NOTE: Not using $effect because it'll play animation if we toggle on animation in settings
  winRecords.subscribe((value) => {
    if (value.length) {
      const lastWinBinIndex = value[value.length - 1].binIndex;
      playAnimation(lastWinBinIndex);
    }
  });

  const initAnimation: Action<HTMLDivElement> = (node) => {
    const bounceAnimation = node.animate(
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(30%)' },
        { transform: 'translateY(0)' },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      },
    );
    bounceAnimation.pause(); // Don't run the animation immediately
    binAnimations.push(bounceAnimation);
  };

  function playAnimation(binIndex: number) {
    if (!$isAnimationOn) {
      return;
    }

    const animation = binAnimations[binIndex];

    // Always reset animation before playing. Safari has a weird behavior where
    // the animation will not play the second time if it's not cancelled.
    animation.cancel();

    animation.play();
  }
</script>

<!-- Фиксация высоты в мобильном устройстве: от 10 пикселей при ширине видового экрана 370 пикселей до 16 пикселей при ширине видового экрана 600 пикселей -->
<div class="bins-row">
  {#if $plinkoEngine}
    <div class="bins-row__wrapper" style:width={`${($plinkoEngine.binsWidthPercentage ?? 0) * 100}%`}>
      {#each binPayouts[$rowCount][$riskLevel] as payout, binIndex}
        <div
          use:initAnimation
          class="bins-row__item"
        >
          <span class="bins-row__text">{payout}</span>
          <svg class="bins-row__svg" viewBox="0 0 27 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="{colors[binIndex]}" d="M0.75 5.31301C0.75 2.08877 3.75666 -0.292551 6.8952 0.445928L10.0644 1.19163C12.3239 1.72328 14.676 1.72328 16.9356 1.19163L20.1048 0.44593C23.2433 -0.29255 26.25 2.08877 26.25 5.31301V9C26.25 11.7614 24.0114 14 21.25 14H5.75C2.98858 14 0.75 11.7614 0.75 9V5.31301Z"/>
          </svg>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .bins-row {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 16px;

    $self: &;
    &__wrapper {
      display: flex;
      gap: 1%;
    }

    &__item {
      position: relative;
      color: hsla(0, 0%, 100%, 1);
      font-weight: 700;
      font-size: 11px;
      line-height: 1;
      border-radius: 0.125rem;
      justify-content: center;
      align-items: center;
      flex: 1 1 0;
      min-width: 0;
      display: flex;
    }

    &__text {
      position: absolute;
      bottom: 2px;
    }
  }
</style>
