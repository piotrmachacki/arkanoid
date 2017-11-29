enum KeyCodes {
	LEFT = 37,
	RIGHT = 39
}

enum GameState {
	GameOver,
	lifeLoss,
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

enum Side {
	None,
	Left,
	Top,
	Right, 
	Bottom
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
	posX: number;
	posY: number;
	collisionSide: Side;

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		super(ballElement, boardElement);
		this.posX = ballElement.offsetLeft;
		this.posY = ballElement.offsetTop;
		this.collisionSide = Side.None;
	}

	move() {
		
		this.posX = this.calculateNewPosition(OffsetType.X);
		this.posY = this.calculateNewPosition(OffsetType.Y);

		this.checkGameBoardCollision();

		if(this.checkObstacleCollision(this.paddleElement)) {
			this.calculateEdgePosition(this.collisionSide, this.paddleElement);
			this.flipDirection();
		}

		this.moveTo(this.posX, this.posY);
	}

	calculateNewPosition(offsetType: OffsetType) {
		let pos: number;
		if(offsetType == OffsetType.X) pos = this.ballElement.offsetLeft + this.step * this.direction[offsetType];
		if(offsetType == OffsetType.Y) pos = this.ballElement.offsetTop + this.step * this.direction[offsetType];
		return pos;
	}

	checkGameBoardCollision() {
		let minX: number = 0;
		let maxX: number = this.boardElement.offsetWidth - this.ballElement.offsetWidth;
		let minY: number = 0;
		let maxY: number = this.boardElement.offsetHeight - this.ballElement.offsetHeight;
		if(this.ballElement.offsetLeft < minX) {
			this.posX = minX;
			this.collisionSide = Side.Left;
			this.flipDirection();
		}
		if(this.ballElement.offsetLeft > maxX) {
			this.posX = maxX;
			this.collisionSide = Side.Right;
			this.flipDirection();
		}
		if(this.ballElement.offsetTop < minY) {
			this.posY = minY;
			this.collisionSide = Side.Top;
			this.flipDirection();
		}
		if(this.ballElement.offsetTop > maxY) {
			this.posY = maxY;
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
	keyMap: boolean[] = [];

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement) {
		this.paddle = new Paddle(this.paddleElement, this.boardElement);
		this.ball = new Ball(this.ballElement, this.paddleElement, this.boardElement);
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
	<HTMLElement>document.getElementById("game-board")
);

game.run();