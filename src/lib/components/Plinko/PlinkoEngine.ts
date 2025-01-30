import { binPayouts } from '$lib/constants/game';
import {
  rowCount,
  winRecords,
  riskLevel,
  betAmount,
  balance,
  betAmountOfExistingBalls,
  totalProfitHistory,
} from '$lib/stores/game';
import type { RiskLevel, RowCount } from '$lib/types/game';
import { getRandomBetween } from '$lib/utils/numbers';
import Matter, { type IBodyDefinition } from 'matter-js';
import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

type BallFrictionsByRowCount = {
  friction: NonNullable<IBodyDefinition['friction']>;
  frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
};

/**
 * Engine for rendering the Plinko game using [matter-js](https://brm.io/matter-js/).
 *
 * The engine will read/write data to Svelte stores during game state changes.
 */
class PlinkoEngine {
  /**
   * The canvas element to render the game to.
   */
  private canvas: HTMLCanvasElement;

  /**
   * A cache value of the {@link betAmount} store for faster access.
   */
  private betAmount: number;
  /**
   * A cache value of the {@link rowCount} store for faster access.
   */
  private rowCount: RowCount;
  /**
   * A cache value of the {@link riskLevel} store for faster access.
   */
  private riskLevel: RiskLevel;

  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;

  /**
   * Every pin of the game.
   */
  private pins: Matter.Body[] = [];
  /**
   * Walls are invisible, slanted "guard rails" at the left and right sides of the
   * pin triangle. It prevents balls from falling outside the pin triangle and not
   * hitting a bin.
   */
  private walls: Matter.Body[] = [];
  /**
   * "Sensor" is an invisible body at the bottom of the canvas. It detects whether
   * a ball arrives at the bottom and enters a bin.
   */
  private sensor: Matter.Body;

  private ball: Matter.Body | null;

  /**
   * The x-coordinates of every pin's center in the last row. Useful for calculating
   * which bin a ball falls into.
   */
  private pinsLastRowXCoords: number[] = [];

  static WIDTH = 536;
  static HEIGHT = 558;

  private static PADDING_X = 62;
  private static PADDING_TOP = 100;
  private static PADDING_BOTTOM = 28;

  private static PIN_CATEGORY = 0x0001;
  private static BALL_CATEGORY = 0x0002;

  /**
   * Параметры трения, которые должны быть применены к корпусу шара.
   *
   * Более высокое трение приводит к более концентрированному распределению в центре. Эти цифры
   * получены методом проб и ошибок, чтобы приблизить фактическую взвешенную выплату по ячейкам к
   * ожидаемой выплате по ячейкам.
   */
  private static ballFrictions: BallFrictionsByRowCount = {
    friction: 0.5,
    frictionAirByRowCount: {
      8: 0.028, //8: 0.0395,
      9: 0.041,
      10: 0.038,
      11: 0.0355,
      12: 0.0414,
      13: 0.0437,
      14: 0.0401,
      15: 0.0418,
      16: 0.0364,
    },
  };

  public ballOffset: number[] = [274, 260, 269, 268, 267, 270, 271, 275, 274];

  public mapsBallOffset: number[][] = [
    [0, 7, 4, 4, 8],
    [3, 3, 6, 2, 0],
    [6, 2, 6, 3, 1],
    [2, 7, 3, 5, 7],
    [8, 6, 5, 6, 3],
    [8, 4, 4, 8, 1],
    [1, 2, 3, 5, 7],
    [7, 6, 5, 7, 3],
    [2, 3, 5, 6, 8],
    [8, 4, 1, 4, 0],
    [1, 6, 2, 5, 6],
  ];

  public currentIndexMapBallOffset: number;

  public dropCount: number = 5;

  /**
   * Creates the engine and the game's layout.
   *
   * @param canvas The canvas element to render the game to.
   *
   * @remarks Этот конструктор не запускает рендеринг и физический движок.
   * Вызовите метод `start`, чтобы запустить движок.
   */
  constructor(canvas: HTMLCanvasElement) {
    //debugger
    this.canvas = canvas;
    this.currentIndexMapBallOffset = Math.floor(Math.random() * 10);

    this.betAmount = get(betAmount);
    this.rowCount = get(rowCount);
    this.riskLevel = get(riskLevel);
    betAmount.subscribe((value) => (this.betAmount = value));
    rowCount.subscribe((value) => this.updateRowCount(value));
    riskLevel.subscribe((value) => (this.riskLevel = value));

    this.engine = Matter.Engine.create({
      timing: {
        timeScale: 1,
      },
    });
    this.render = Matter.Render.create({
      engine: this.engine,
      canvas: this.canvas,
      options: {
        width: PlinkoEngine.WIDTH,
        height: PlinkoEngine.HEIGHT,
        background: '#00000000',
        wireframes: false,
      },
    });
    this.runner = Matter.Runner.create();

    // Создаем статичную лунку
    const hole = Matter.Bodies.circle(268, 30, 20, {
      isStatic: true,
      render: {
        fillStyle: "black",
        strokeStyle: 'rgba(182,182,182,0.45)',
        lineWidth: 20,
      },
    });

    Matter.Composite.add(this.engine.world, hole);

    this.placePinsAndWalls();

   this.ball = this.renderBall(0.1, 268, { isStatic: true });
   Matter.Composite.add(this.engine.world, this.ball);
   this.animateDrawBall(this.ball, 0.1, 0.5, 0.008);

    this.sensor = Matter.Bodies.rectangle(
      this.canvas.width / 2,
      this.canvas.height,
      this.canvas.width,
      10,
      {
        isSensor: true,
        isStatic: true,
        render: {
          visible: false,
        },
      },
    );
    Matter.Composite.add(this.engine.world, [this.sensor]);
    Matter.Events.on(this.engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA === this.sensor) {
          this.handleBallEnterBin(bodyB);
        } else if (bodyB === this.sensor) {
          this.handleBallEnterBin(bodyA);
        }
      });
    });
  }

  /**
   * Рендерит игру и запускает физический движок.
   */
  start() {
    Matter.Render.run(this.render); // Renders the scene to canvas
    Matter.Runner.run(this.runner, this.engine); // Starts the simulation in physics engine
  }

  /**
   * Останавливает (приостанавливает) рендеринг и физический движок.
   */
  stop() {
    Matter.Render.stop(this.render);
    Matter.Runner.stop(this.runner);
  }

  /**
   * Сбрасывает новый шар сверху со случайным смещением по горизонтали и вычитает остаток.
   * {
   *     0: 274,
   *     1: 260,
   *     2: 269,
   *     3: 268,
   *     4: 267,
   *     5: 270,
   *     6: 271,
   *     7: 275,
   *     8: 274,
   * }
   *
   * [4, 4, 3, 5, 8]
   * [0, 2, 3, 3, 6]
   * [1, 2, 3, 6, 6]
   * [2, 3, 5, 7, 7]
   * [3, 5, 6, 6, 8]
   * [1, 2, 3, 5, 7]
   * [3, 5, 6, 7, 7]
   * [2, 3, 5, 6, 8]
   * [0, 1, 4, 4, 8]
   * [1, 2, 5, 6, 6]
   */
  dropBall() {
    if(this.dropCount <= 0) return
    Matter.Composite.remove(this.engine.world, this.ball);
    const ball = this.renderBall();
    Matter.Composite.add(this.engine.world, ball);

    betAmountOfExistingBalls.update((value) => ({ ...value, [ball.id]: this.betAmount }));
    balance.update((balance) => balance - this.betAmount);
    this.dropCount--;
    if(this.dropCount <= 0) return

    this.ball = this.renderBall(0.1, 268, { isStatic: true });
    Matter.Composite.add(this.engine.world, this.ball);
    this.animateDrawBall(this.ball, 0.1, 0.5, 0.008);
  }

  renderBall(textureScale?: number, positionX?: number, options?: IBodyDefinition) {
    //debugger
    let ballOffsetRangeX: number;
    if(positionX) {
      ballOffsetRangeX = positionX
    } else {
      const mapBallOffset = this.mapsBallOffset[this.currentIndexMapBallOffset];
      ballOffsetRangeX = this.ballOffset[mapBallOffset[this.dropCount-1]];
    }
    if(!textureScale) {
      textureScale = 0.5;
    }
    const ballRadius = this.pinRadius * 2 + 7;
    const { friction, frictionAirByRowCount } = PlinkoEngine.ballFrictions;

    return Matter.Bodies.circle(
        ballOffsetRangeX,
        30,
        ballRadius,
        {
          restitution: 0.8, // Bounciness
          friction,
          frictionAir: frictionAirByRowCount[this.rowCount],
          collisionFilter: {
            category: PlinkoEngine.BALL_CATEGORY,
            mask: PlinkoEngine.PIN_CATEGORY, // Collide with pins only, but not other balls
          },
          render: {
            fillStyle: '#ff0000',
            sprite: {
              texture: 'src/img/ball-drop.png', // Путь к изображению
              xScale: textureScale,
              yScale: textureScale
            }
          },
          ...options
        },
    );
  }

  animateDrawBall(ball, scale, maxScale, animationSpeed) {
    function animate() {
      if (scale < maxScale) {
        scale = scale + animationSpeed;
        ball.render.sprite.xScale = scale;
        ball.render.sprite.yScale = scale;
        requestAnimationFrame(animate);
      }
    }
    animate();
  }

  /**
   * Общая ширина всех ячеек в процентах от ширины полотна.
   */
  get binsWidthPercentage(): number {
    const lastPinX = this.pinsLastRowXCoords[this.pinsLastRowXCoords.length - 1];
    return (lastPinX - this.pinsLastRowXCoords[0]) / PlinkoEngine.WIDTH;
  }

  /**
   * Возвращает расстояние по горизонтали между центральными точками каждого штифта.
   */
  private get pinDistanceX(): number {
    const lastRowPinCount = 3 + this.rowCount - 1;
    return (this.canvas.width - PlinkoEngine.PADDING_X * 2) / (lastRowPinCount - 1);
  }

  private get pinRadius(): number {
    return (18 - this.rowCount) / 2;
  }

  /**
   * Обновляет игру новым количеством рядов.
   *
   * Ничего не делает, если количество новых строк равно текущему количеству.
   */
  private updateRowCount(rowCount: RowCount) {
    if (rowCount === this.rowCount) {
      return;
    }

    this.removeAllBalls();

    this.rowCount = rowCount;
    this.placePinsAndWalls();
  }

  /**
   * Вызывается, когда мяч попадает в невидимый датчик внизу.
   */
  private handleBallEnterBin(ball: Matter.Body) {
    const binIndex = this.pinsLastRowXCoords.findLastIndex((pinX) => pinX < ball.position.x);
    if (binIndex !== -1 && binIndex < this.pinsLastRowXCoords.length - 1) {
      const betAmount = get(betAmountOfExistingBalls)[ball.id] ?? 0;
      const multiplier = binPayouts[this.rowCount][this.riskLevel][binIndex];
      const payoutValue = betAmount * multiplier;
      const profit = payoutValue - betAmount;

      winRecords.update((records) => [
        ...records,
        {
          id: uuidv4(),
          betAmount,
          rowCount: this.rowCount,
          binIndex,
          payout: {
            multiplier,
            value: payoutValue,
          },
          profit,
        },
      ]);
      totalProfitHistory.update((history) => {
        const lastTotalProfit = history.slice(-1)[0];
        return [...history, lastTotalProfit + profit];
      });
      balance.update((balance) => balance + payoutValue);
    }

    Matter.Composite.remove(this.engine.world, ball);
    betAmountOfExistingBalls.update((value) => {
      const newValue = { ...value };
      delete newValue[ball.id];
      return newValue;
    });
  }

  /**
   * Рендерит штифты и стены. Предыдущие штифты удаляются перед рендерингом новых.
   */
  private placePinsAndWalls() {
    const { PADDING_X, PADDING_TOP, PADDING_BOTTOM, PIN_CATEGORY, BALL_CATEGORY } = PlinkoEngine;

    if (this.pins.length > 0) {
      Matter.Composite.remove(this.engine.world, this.pins);
      this.pins = [];
    }
    if (this.pinsLastRowXCoords.length > 0) {
      this.pinsLastRowXCoords = [];
    }
    if (this.walls.length > 0) {
      Matter.Composite.remove(this.engine.world, this.walls);
      this.walls = [];
    }

    for (let row = 0; row < this.rowCount; ++row) {
      const rowY =
        PADDING_TOP +
        ((this.canvas.height - PADDING_TOP - PADDING_BOTTOM) / (this.rowCount - 1)) * row;

      /** Расстояние по горизонтали между левой/правой границей полотна и первым/последним штифтом ряда */
      const rowPaddingX = PADDING_X + ((this.rowCount - 1 - row) * this.pinDistanceX) / 2;

      for (let col = 0; col < 3 + row; ++col) {
        const colX = rowPaddingX + ((this.canvas.width - rowPaddingX * 2) / (3 + row - 1)) * col;
        const pin = Matter.Bodies.circle(colX, rowY, this.pinRadius, {
          isStatic: true,
          render: {
            fillStyle: '#ffffff',
            lineWidth: 5,
            strokeStyle: 'rgb(182,182,182)',
          },
          collisionFilter: {
            category: PIN_CATEGORY,
            mask: BALL_CATEGORY, // Collide with balls
          },
        });
        this.pins.push(pin);

        if (row === this.rowCount - 1) {
          this.pinsLastRowXCoords.push(colX);
        }
      }
    }
    Matter.Composite.add(this.engine.world, this.pins);

    const firstPinX = this.pins[0].position.x;
    const leftWallAngle = Math.atan2(
      firstPinX - this.pinsLastRowXCoords[0],
      this.canvas.height - PADDING_TOP - PADDING_BOTTOM,
    );
    const leftWallX =
      firstPinX - (firstPinX - this.pinsLastRowXCoords[0]) / 2 - this.pinDistanceX * 0.25;

    const leftWall = Matter.Bodies.rectangle(
      leftWallX,
      this.canvas.height / 2,
      10,
      this.canvas.height,
      {
        isStatic: true,
        angle: leftWallAngle,
        render: { visible: false },
      },
    );
    const rightWall = Matter.Bodies.rectangle(
      this.canvas.width - leftWallX,
      this.canvas.height / 2,
      10,
      this.canvas.height,
      {
        isStatic: true,
        angle: -leftWallAngle,
        render: { visible: false },
      },
    );
    this.walls.push(leftWall, rightWall);
    Matter.Composite.add(this.engine.world, this.walls);
  }

  private removeAllBalls() {
    Matter.Composite.allBodies(this.engine.world).forEach((body) => {
      if (body.collisionFilter.category === PlinkoEngine.BALL_CATEGORY) {
        Matter.Composite.remove(this.engine.world, body);
      }
    });
    betAmountOfExistingBalls.set({});
  }
}

export default PlinkoEngine;
