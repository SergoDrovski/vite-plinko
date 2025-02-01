<script lang="ts">
  import {
    balance,
    betAmount,
    plinkoEngine,
  } from '$lib/stores/game';
  import { BetMode } from '$lib/types/game';

  let { lang } = $props();

  let betMode: BetMode = $state(BetMode.MANUAL);

  /**
   * When `betMode` is `AUTO`, the number of bets to be placed. Zero means infinite bets.
   */

  /**
   * Number of auto bets remaining when `betMode` is `AUTO`.
   *
   * - `number`: Finite count of how many bets left. It decrements from `autoBetInput` to 0.
   * - `null`: For infinite bets (i.e. `autoBetInput` is 0).
   */

  let isDropBallDisabled = $derived(
    $plinkoEngine === null,
  );

  let balanceFormatted = $derived(
    $balance.toLocaleString('ru-RU'),
  );

  function handleBetClick() {
    //debugger
    if (betMode === BetMode.MANUAL) {
      $plinkoEngine?.dropBall();
    }
  }

</script>

<div class="control-game">
  <button
      onclick={handleBetClick}
      disabled={isDropBallDisabled}
      class='control-game__play'
  >{lang?.playBtn ?? 'Play'}</button>

  <div class="control-game__pricing">
    <div class="control-game__bet-amount">
      <div class="control-game__balance">
        <span class="control-game__title">{lang?.bet ?? 'bet'}</span>
        <span class="control-game__amount"> {$betAmount}
          <span class="control-game__currency">{lang?.currency ?? '€'}</span>
        </span>
      </div>
    </div>

    <div class="control-game__balance">
      <span class="control-game__title">{lang?.balance ?? 'Balance'}</span>
      <span class="control-game__amount">
          {balanceFormatted}
            <span class="control-game__currency">{lang?.currency ?? '€'}</span>
      </span>
    </div>
  </div>
</div>

<style lang="scss">
  .control-game {
    margin-top: 10px;
    $self: &;

    &__play {
      position: relative;
      width: 100%;
      background-color: hsla(324, 100%, 44%, 1);
      color: hsla(0, 0%, 100%, 1);
      font-family: 'Montserrat', sans-serif;
      font-size: 21px;
      font-weight: 700;
      padding: 10px 16px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      outline: none;
      -webkit-tap-highlight-color: transparent; /* Remove highlight on mobile */
      user-select: none; /* Disable text selection */

      &:hover {
        background-color: hsl(324deg 94.73% 35.05%);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
      }

      &:active {
        background-color: hsl(324deg 94.73% 35.05%);
        transform: translateY(2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:focus {
        outline: none;
      }
    }

    &__pricing {
      display: flex;
      margin-top: 10px;
      gap: 10px;
      justify-content: space-around;

    }

    &__bet-amount {
      display: flex;
      width: 100%;
    }

    &__balance {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      font-family: 'Geologica', sans-serif;

      padding: 8px 10px;
      border-radius: 14px;

      background-color: hsla(0, 0%, 100%, 0.05);

      #{$self}__title {
        font-size: 10px;
        line-height: 1;
      }
      #{$self}__amount {
        line-height: 1;
        font-weight: 900;
        font-size: 14px;
      }
    }
  }
</style>
