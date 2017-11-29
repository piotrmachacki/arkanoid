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

enum OffsetType {
	X,
	Y
}

class GameElement {

	step: number = 1;
	direction: number[] = [1,-1];

	constructor(public gameElement: HTMLElement, public boardElement: HTMLElement) {
		
	}

	getElementOffset(element: HTMLElement, offsetType: OffsetType) {
		let el = {size:0, offset:0};
		if(offsetType == OffsetType.X) {
			el.size = element.offsetWidth;
			el.offset = element.offsetLeft;
		}
		if(offsetType == OffsetType.Y) {
			el.size = element.offsetHeight;
			el.offset = element.offsetTop;
		};
		return el;
	}

	calculatePosition(offsetType: OffsetType, direction: Direction = Direction.None) {
		let boardElement = this.getElementOffset(this.boardElement, offsetType);
		let gameElement = this.getElementOffset(this.gameElement, offsetType);

		let minPos: number = 0;
		let maxPos: number = boardElement['size'] - gameElement['size'];
		if(direction) {
			this.direction[offsetType] = direction;
		} else if(gameElement['offset'] <= minPos || gameElement['offset'] >= maxPos) {
			this.direction[offsetType] *= -1;
		}
		let pos: number = gameElement['offset'] + this.step * this.direction[offsetType];
		pos = (pos>maxPos) ? maxPos : pos;
		pos = (pos<minPos) ? minPos : pos;
		return pos;

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
		this.moveTo(this.calculatePosition(OffsetType.X), this.calculatePosition(OffsetType.Y));
	}

}

class Paddle extends GameElement {

	step: number = 4;

	constructor(public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		super(paddleElement, boardElement);
	}

	moveLeft() {
		this.moveTo(this.calculatePosition(OffsetType.X, Direction.Left), this.paddleElement.offsetTop);
	}

	moveRight() {
		this.moveTo(this.calculatePosition(OffsetType.X, Direction.Right), this.paddleElement.offsetTop);
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