
<div class="game-modal">
    <div class="container">
        <div class="game-modal__header">
            <img
                    class="game-modal__logo"
                    src="src/img/logotype.webp"
                    width="87"
                    height="35"
                    alt="Plinko"
            />
            <img
                    class="game-modal__img"
                    src="src/img/game-modal-mega-win-img.svg"
                    width="235"
                    height="84"
                    alt="Mega win"
            />
        </div>
        <p class="game-modal__title">Congratulazioni!</p>
        <p class="game-modal__subtitle">
            La tua vincita:<br/><span>€450 + 250 giri gratuiti</span>
        </p>
        <p class="game-modal__description">
            Clicca sul pulsante “Giocare” per riscattare la tua vincita.
        </p>
        <a href="#" class="game-modal__button button">Giocare </a>
    </div>
</div>


<style lang="scss">
  .game-modal {
    display: block;
    position: fixed;
    width: 295px;
    height: 372px;
    top: calc(50% - 186px);
    background-color: rgba(18, 20, 78, 1);
    z-index: 1000;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-radius: 14px;

    .container {
      display: flex;
      align-items: center;
      flex-direction: column;
      position: relative;
      padding: 0 30px;
      height: 372px;
      background-image: url(/src/img/game-modal-bg.webp);
      background-repeat: no-repeat;
      background-size: contain;
    }

    &__header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 15px;
    }

    &__logo {
      width: 87px;
      height: 35px;
    }
    &__img {
      width: 235px;
      height: 84px;
      margin-top: 3px;
    }

    &__content {
      max-width: 275px;
      text-align: end;
      margin-left: auto;
    }
    &__title {
      margin-bottom: 20px;
      font-size: 28px;
      line-height: 28px;
      font-weight: 700;
      color: #fff;
    }

    &__subtitle {
      text-align: center;
      line-height: 21px;
      font-weight: 300;
      font-size: 14px;
      color: #fff;
      margin-bottom: 20px;
      span {
        font-size: 18px;
        line-height: 18px;
        font-weight: 700;
      }
    }

    &__description {
      text-align: center;
      margin-bottom: 15px;
      line-height: 21px;
      font-weight: 400;
      font-size: 14px;
      color: #fff;
    }

    &__button {
      margin-top: 0;
      width: 87px;
    }
  }
</style>
