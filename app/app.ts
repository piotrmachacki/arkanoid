enum KeyCodes {
	LEFT = 37,
	RIGHT = 39
}

enum GameState {
	GameOver,
	Running
}

enum Direction {
	None = 0,
	Left = -1,
	Right = 1,
	Top = -1,
	Bottom = 1
}

class GameElement {

	step: number = 1;
	directionX: number = 1;
	directionY: number = -1;

	constructor(public gameElement: HTMLElement, public boardElement: HTMLElement) {
		
	}

	calculateX(directionX: Direction = Direction.None): number {
		let minLeft: number = 0;
		let maxLeft: number = this.boardElement.offsetWidth - this.gameElement.offsetWidth;
		if(directionX) {
			this.directionX = directionX;
		} else if(this.gameElement.offsetLeft <= minLeft || this.gameElement.offsetLeft >= maxLeft) {
			this.directionX *= -1;
		}
		let left: number = this.gameElement.offsetLeft + this.step * this.directionX;
		left = (left>maxLeft) ? maxLeft : left;
		left = (left<minLeft) ? minLeft : left;
		return left;
	}

	calculateY(directionY: Direction = Direction.None): number {
		let minTop: number = 0;
		let maxTop: number = this.boardElement.offsetHeight - this.gameElement.offsetHeight;
		if(directionY) {
			this.directionY = directionY;
		} else if(this.gameElement.offsetTop <= minTop || this.gameElement.offsetTop >= maxTop) {
			this.directionY *= -1;
		}
		let top: number = this.gameElement.offsetTop + this.step * this.directionY;
		top = (top>maxTop) ? maxTop : top;
		top = (top<minTop) ? minTop : top;
		return top;
	}

	moveTo(x: number | boolean = false, y: number | boolean = false) {
		if(x !== false) this.gameElement.style.left = x + 'px';
		if(y !== false) this.gameElement.style.top = y + 'px';
	}

}

class Ball extends GameElement {

	step: number = 3;

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		super(ballElement, boardElement);
	}

	move() {
		this.moveTo(this.calculateX(), this.calculateY());
	}

}

class Paddle extends GameElement {

	step: number = 4;

	constructor(public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		super(paddleElement, boardElement);
	}

	moveLeft() {
		this.moveTo(this.calculateX(Direction.Left));
	}

	moveRight() {
		this.moveTo(this.calculateX(Direction.Right));
	}

}

class Game {

	intervalTime: number = 10;
	paddle: Paddle;
	ball: Ball;
	keyMap: Array<boolean> = [];

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		this.paddle = new Paddle(this.paddleElement, this.boardElement);
		this.ball = new Ball(this.ballElement, this.paddleElement, this.boardElement);
	}

	run() {
		document.addEventListener('keyup', e => this.keyMap[e.keyCode] = false );
		document.addEventListener('keydown', e => this.keyMap[e.keyCode] = true );

		setInterval(() => {

			if(this.keyMap[KeyCodes.LEFT]) this.paddle.moveLeft();
			if(this.keyMap[KeyCodes.RIGHT]) this.paddle.moveRight();

			this.ball.move();

		}, this.intervalTime);
	}

}

var game = new Game(
	<HTMLElement>document.getElementById("ball"),
	<HTMLElement>document.getElementById("paddle"),
	<HTMLElement>document.getElementById("game-board")
);

game.run();