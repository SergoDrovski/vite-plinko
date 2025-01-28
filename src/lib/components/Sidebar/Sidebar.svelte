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

  <div class="control-game__amount">
    <div class="control-game__bet-amount">
      <button
            disabled={autoBetInterval !== null}
            onclick={(event) => {
              debugger
            const num = event.target.dataset.drop ? parseFloat(event.target.dataset.drop) : 10;
            const rate = $betAmount - num;
            //console.log(event);
          $betAmount = rate >= 1 ? rate : 1;
        }}
              class="touch-manipulation bg-slate-600 px-4 font-bold diagonal-fractions text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:[&:not(:disabled)]:bg-slate-500 active:[&:not(:disabled)]:bg-slate-400"
              data-drop="45"
      >
        -
      </button>
      <div class="control-game__balance">
        <span class="control-game__title">Scommessa</span>
        <span class="control-game__amount"> {$betAmount}
          <span class="control-game__currency">€</span>
        </span>
      </div>
      <button
          disabled={autoBetInterval !== null}
          onclick={(event) => {
            debugger
            const num = event.target.dataset.raise ? parseFloat(event.target.dataset.raise) : 10;
            const rate = $betAmount + num;
            $betAmount = rate >= 1 ? rate : 1;
        }}
              class="relative touch-manipulation rounded-r-md bg-slate-600 px-4 text-sm font-bold text-white transition-colors after:absolute after:left-0 after:inline-block after:h-1/2 after:w-[2px] after:bg-slate-800 after:content-[''] disabled:cursor-not-allowed disabled:opacity-50 hover:[&:not(:disabled)]:bg-slate-500 active:[&:not(:disabled)]:bg-slate-400"
              data-raise="45"
      >
        +
      </button>
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

    &__amount {
      display: flex;
      margin-top: 10px;
      gap: 10px;
      justify-content: space-around;
    }

    &__bet-amount {
      display: flex;
    }

    &__balance {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 125px;
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
