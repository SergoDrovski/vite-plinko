<script lang="ts">
  import { autoBetIntervalMs } from '$lib/constants/game';
  import {
    balance,
    betAmount,
    plinkoEngine,
  } from '$lib/stores/game';
  import { BetMode, RiskLevel } from '$lib/types/game';
  import type { FormEventHandler } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  let betMode: BetMode = $state(BetMode.MANUAL);

  /**
   * When `betMode` is `AUTO`, the number of bets to be placed. Zero means infinite bets.
   */
  let autoBetInput = $state(0);

  /**
   * Number of auto bets remaining when `betMode` is `AUTO`.
   *
   * - `number`: Finite count of how many bets left. It decrements from `autoBetInput` to 0.
   * - `null`: For infinite bets (i.e. `autoBetInput` is 0).
   */
  let autoBetsLeft: number | null = $state(null);

  let autoBetInterval: ReturnType<typeof setInterval> | null = $state(null);

  let isBetAmountNegative = $derived($betAmount < 0);
  let isBetExceedBalance = $derived($betAmount > $balance);
  let isAutoBetInputNegative = $derived(autoBetInput < 0);

  let isDropBallDisabled = $derived(
    $plinkoEngine === null || isBetAmountNegative || isBetExceedBalance || isAutoBetInputNegative,
  );

  const handleBetAmountFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
    const parsedValue = parseFloat(e.currentTarget.value.trim());
    if (isNaN(parsedValue)) {
      $betAmount = -1; // If input field is empty, this forces re-render so its value resets to 0
      $betAmount = 0;
    } else {
      $betAmount = parsedValue;
    }
  };

  let balanceFormatted = $derived(
          $balance.toLocaleString('ru-RU'),
  );

  let betAmountFormatted = $derived(
          $betAmount.toLocaleString('ru-RU'),
  );

  function resetAutoBetInterval() {
    if (autoBetInterval !== null) {
      clearInterval(autoBetInterval);
      autoBetInterval = null;
    }
  }

  function autoBetDropBall() {
    if (isBetExceedBalance) {
      resetAutoBetInterval();
      return;
    }

    // Infinite mode
    if (autoBetsLeft === null) {
      $plinkoEngine?.dropBall();
      return;
    }

    // Finite mode
    if (autoBetsLeft > 0) {
      $plinkoEngine?.dropBall();
      autoBetsLeft -= 1;
    }
    if (autoBetsLeft === 0 && autoBetInterval !== null) {
      resetAutoBetInterval();
      return;
    }
  }

  function handleBetClick() {
    //debugger
    if (betMode === BetMode.MANUAL) {
      $plinkoEngine?.dropBall();
    } else if (autoBetInterval === null) {
      autoBetsLeft = autoBetInput === 0 ? null : autoBetInput;
      autoBetInterval = setInterval(autoBetDropBall, autoBetIntervalMs);
    } else if (autoBetInterval !== null) {
      resetAutoBetInterval();
    }
  }

</script>

<div class="control-game">
  <button
      onclick={handleBetClick}
      disabled={isDropBallDisabled}
      class='control-game__play'
  > Giocare </button>

  <div class="control-game__pricing">
    <div class="control-game__bet-amount">
      <div class="control-game__balance">
        <span class="control-game__title">Scommessa</span>
        <span class="control-game__amount"> {$betAmount}
          <span class="control-game__currency">€</span>
        </span>
      </div>
    </div>

    <div class="control-game__balance">
      <span class="control-game__title">Equilibrio</span>
      <span class="control-game__amount">
          {balanceFormatted}
            <span class="control-game__currency">€</span>
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

      &.bg-transparent {
        background-color: transparent;
      }

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
