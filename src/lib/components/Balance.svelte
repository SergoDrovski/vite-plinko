<script lang="ts">
  import { balance } from '$lib/stores/game';
  let balanceFormatted = $derived(
    $balance.toLocaleString('ru-RU'),
  );
</script>


<div class="balance-game">
  <span class="balance-game__title">Balance</span>
  <span class="balance-game__amount">
      {balanceFormatted}
    <span class="balance-game__currency">€</span>
  </span>

</div>


<style lang="scss">
  .balance-game {
    display: flex;
    flex-direction: column;
    width: 125px;
    font-family: 'Geologica', sans-serif;

    padding: 8px 10px;
    border-radius: 14px;

    background-color: hsla(0, 0%, 100%, 0.05);

    &__title {
      font-size: 10px;
      line-height: 1;
    }
    &__amount {
      line-height: 1;
      font-weight: 900;
      font-size: 14px;
    }
  }
</style>
