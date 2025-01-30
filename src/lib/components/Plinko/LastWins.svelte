<script lang="ts">
  import { binColorsByRowCount } from '$lib/constants/game';
  import { winRecords } from '$lib/stores/game';

  type Props = {
    /**
     * Number of last wins to display.
     */
    winCount?: number;
  };

  let { winCount = 4 }: Props = $props();

  let lastWins = $derived($winRecords.slice(-winCount).toReversed());
</script>

<!-- Clamps in mobile:
      - Width: From 1.5rem at 340px viewport width to 2rem at 620px viewport width
      - Font size: From 8px at 340px viewport width to 10px at 620px viewport width
 -->
<div class="last-wins">
    {#if lastWins.length === 0}
        <span class="last-wins__amount-item wins-visible">+0 €</span>
    {/if}
    {#each lastWins as {profit}, index}
        <span class="last-wins__amount-item
                    {index === lastWins.length - 1 ? 'wins-visible' : '' }"
        >+{profit} €</span>
    {/each}
</div>

<style lang="scss">
  .last-wins {
    $self: &;
    margin-top: 30px;
    width: 100%;
    height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    font-size: 24px;
    font-weight: bold;
    color: white;
    background-image: url(/src/img/bg-last-wins.webp);
    background-size: cover;
    background-repeat: no-repeat;
    background-color: #112A4E;
    border-radius: 14px;
    position: relative;
    text-decoration: none;
    font-family: Arial, sans-serif;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 14px;
      padding: 1px; /* Толщина границы */
      background: linear-gradient(90deg, #C100AD, #4DC1C8);
      -webkit-mask:
              linear-gradient(white, white) content-box,
              linear-gradient(white, white);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    &__amount-item {
      transition: top 0.6s ease-out;
      position: absolute;
      line-height: 1;
      font-weight: 900;
      font-size: 26px;
      top: -25px;

      &.wins-visible {
        top: 10px;
        animation: test 0.6s ease-in-out;
      }
    }
  }

  @keyframes test {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(0, 8px);
    }
  }
</style>
