enum KeyCodes {
	LEFT = 37,
	RIGHT = 39
}

enum GameState {
	GameOver,
	lifeLoss,
	Running
}

enum OffsetType {
	X,
	Y
}

enum Side {
	None,
	Left,
	Top,
	Right, 
	Bottom
}

class GameElement {

	step: number = 1;
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;

	constructor(public gameElement: HTMLElement, public boardElement: HTMLElement) {
		this.minX = 0;
		this.maxX = this.boardElement.offsetWidth - this.gameElement.offsetWidth;
		this.minY = 0;
		this.maxY = this.boardElement.offsetHeight - this.gameElement.offsetHeight;
	}

	moveTo(x: number | boolean = false, y: number | boolean = false) {
		if(x !== false) this.gameElement.style.left = x + 'px';
		if(y !== false) this.gameElement.style.top = y + 'px';
	}

}

class Paddle extends GameElement {

	step: number = 4;
	direction: {left: number, right: number} = {left: -1, right: 1};

	constructor(public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		super(paddleElement, boardElement);
	}

	calculatePosition(direction: number): number {
		let left: number = this.gameElement.offsetLeft + this.step * direction;
		left = (left>this.maxX) ? this.maxX : left;
		left = (left<this.minX) ? this.minX : left;
		return left;
	}

	moveLeft() {
		this.moveTo(this.calculatePosition(this.direction.left));
	}

	moveRight() {
		this.moveTo(this.calculatePosition(this.direction.right));
	}

}

class Ball extends GameElement {

	step: number = 3;
	posX: number;
	posY: number;
	direction: number[] = [1,-1];
	collisionSide: Side;
	bricks: Array<HTMLElement> = [];

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement, public brickCollection: HTMLCollection) {
		super(ballElement, boardElement);
		this.posX = ballElement.offsetLeft;
		this.posY = ballElement.offsetTop;
		this.collisionSide = Side.None;
		for(let i = 0; i < brickCollection.length; i++) {
			this.bricks.push(<HTMLElement>brickCollection[i]);
		}
	}

	move() {
		
		this.posX = this.calculateNewPosition(OffsetType.X);
		this.posY = this.calculateNewPosition(OffsetType.Y);

		this.checkGameBoardCollision();

		if(this.checkObstacleCollision(this.paddleElement)) {
			this.calculateEdgePosition(this.collisionSide, this.paddleElement);
			this.flipDirection();
		}

		for(let i = 0; i < this.bricks.length; i++) {
			let brick = this.bricks[i];
			if(this.checkObstacleCollision(brick)) {
				this.calculateEdgePosition(this.collisionSide, brick);
				this.flipDirection();
				brick.style.visibility = 'hidden';
				this.bricks.splice(i, 1);
			}
		}

		this.moveTo(this.posX, this.posY);
	}

	calculateNewPosition(offsetType: number): number {
		let pos: number;
		if(offsetType == OffsetType.X) pos = this.ballElement.offsetLeft + this.step * this.direction[offsetType];
		if(offsetType == OffsetType.Y) pos = this.ballElement.offsetTop + this.step * this.direction[offsetType];
		return pos;
	}

	checkGameBoardCollision() {;
		if(this.ballElement.offsetLeft < this.minX) {
			this.posX = this.minX;
			this.collisionSide = Side.Left;
			this.flipDirection();
		}
		if(this.ballElement.offsetLeft > this.maxX) {
			this.posX = this.maxX;
			this.collisionSide = Side.Right;
			this.flipDirection();
		}
		if(this.ballElement.offsetTop < this.minY) {
			this.posY = this.minY;
			this.collisionSide = Side.Top;
			this.flipDirection();
		}
		if(this.ballElement.offsetTop > this.maxY) {
			this.posY = this.maxY;
			this.collisionSide = Side.Bottom;
			this.flipDirection();
		}
	}

	checkObstacleCollision(obstacle: HTMLElement) {
		var w = 0.5 * (this.ballElement.offsetWidth + obstacle.offsetWidth);
		var h = 0.5 * (this.ballElement.offsetHeight + obstacle.offsetHeight);
		var dx = (this.ballElement.offsetLeft + this.ballElement.offsetWidth/2) - (obstacle.offsetLeft + obstacle.offsetWidth/2);
		var dy = (this.ballElement.offsetTop + this.ballElement.offsetHeight/2) - (obstacle.offsetTop + obstacle.offsetHeight/2);

		if(Math.abs(dx) < w && Math.abs(dy) < h) {
			var wy = w * dy;
			var hx = h * dx;
			if(wy > hx) {
				if(wy > -hx) {
					this.collisionSide = Side.Bottom
				} else {
					this.collisionSide = Side.Left
				}
				return true;
			} else {
				if(wy > -hx) {
					this.collisionSide = Side.Right
				} else {
					this.collisionSide = Side.Top
				}
				return true;
			}
		} else {
			this.collisionSide = Side.None;
			return false;
		}
	}

    calculateEdgePosition(side: Side, obstacle: HTMLElement) {
    	switch(side) {
			case Side.Left:
				this.posX = obstacle.offsetLeft + this.ballElement.offsetWidth;
				break;
			case Side.Right:
				this.posX = obstacle.offsetLeft + obstacle.offsetWidth;
				break;
			case Side.Top:
				this.posY = obstacle.offsetTop - this.ballElement.offsetHeight;
				break;
			case Side.Bottom:
				this.posY = obstacle.offsetTop + obstacle.offsetHeight;
				break;
		}
    }

    flipDirection() {
    	if(this.collisionSide == Side.Left || this.collisionSide == Side.Right) this.direction[OffsetType.X] *= -1;
    	if(this.collisionSide == Side.Top || this.collisionSide == Side.Bottom) this.direction[OffsetType.Y] *= -1;
    }

    // getPosition() {
	// 	return {x: this.posX, y: this.posY};
	// }

}

class Game {

	intervalTime: number = 10;
	paddle: Paddle;
	ball: Ball;
	keyMap: boolean[] = [];

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement, public brickCollection: HTMLCollection) {
		this.paddle = new Paddle(paddleElement, boardElement);
		this.ball = new Ball(ballElement, paddleElement, boardElement, brickCollection);
	}

	run() {
		document.addEventListener('keyup', e => this.keyMap[e.keyCode] = false);
		document.addEventListener('keydown', e => this.keyMap[e.keyCode] = true);

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
	<HTMLElement>document.getElementById("game-board"),
	<HTMLCollection>document.getElementsByClassName("brick")
);

game.run();