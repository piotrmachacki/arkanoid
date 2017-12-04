enum KeyCodes {
	LEFT = 37,
	RIGHT = 39
}

enum GameState {
	GameOver,
	LifeLoss,
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
	startPosition: {x: number, y: number};

	constructor(public gameElement: HTMLElement, public boardElement: HTMLElement) {
		this.minX = 0;
		this.maxX = boardElement.offsetWidth - gameElement.offsetWidth;
		this.minY = 0;
		this.maxY = boardElement.offsetHeight - gameElement.offsetHeight;
		this.startPosition = {x: gameElement.offsetLeft, y: gameElement.offsetTop};
	}

	moveTo(x: number | boolean = false, y: number | boolean = false) {
		if(x !== false) this.gameElement.style.left = x + 'px';
		if(y !== false) this.gameElement.style.top = y + 'px';
	}

	StartPosition() {
		this.moveTo(this.startPosition.x, this.startPosition.y);
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
	stepX: number = this.step;
	stepY: number = this.step;
	stepMin: number = 1.8;
	stepChange: number = 0.3;
	posX: number;
	posY: number;
	direction: number[] = [1,-1];
	collisionSide: Side;
	bricks: Array<HTMLElement> = [];
	paddleDirection: number;

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
			this.calculateHitAngle();
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

	checkWin() {
		return this.bricks.length ? false : true;
	}

	calculateHitAngle() {
		let ballX: number = this.direction[OffsetType.X];
		let paddleX: number = this.paddleDirection;
		if(paddleX != 0) {
			if(ballX == paddleX) {
				if(this.stepY > this.stepMin) {
					this.stepX += this.stepChange;
					this.stepY -= this.stepChange;
				}
			} else {
				if(this.stepX > this.stepMin) {
					this.stepX -= this.stepChange;
					this.stepY += this.stepChange;
				}
			}
		}
	}

	calculateNewPosition(offsetType: number): number {
		let pos: number;
		if(offsetType == OffsetType.X) pos = this.ballElement.offsetLeft + this.stepX * this.direction[offsetType];
		if(offsetType == OffsetType.Y) pos = this.ballElement.offsetTop + this.stepY * this.direction[offsetType];
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

	checkObstacleCollision(obstacle: HTMLElement): boolean {

		let r1 = this.ballElement;
		let r2 = obstacle;

		let dx = (r1.offsetLeft + r1.offsetWidth / 2) - (r2.offsetLeft + r2.offsetWidth / 2);
		let dy = (r1.offsetTop + r1.offsetHeight / 2) - (r2.offsetTop + r2.offsetHeight / 2);
		let width = (r1.offsetWidth + r2.offsetWidth) / 2;
		let height = (r1.offsetHeight + r2.offsetHeight) / 2;
		let crossWidth = width * dy;
		let crossHeight = height * dx;
		let collision = false;
		
		if(Math.abs(dx) < width && Math.abs(dy) < height) {
			if(crossWidth > crossHeight) {
				this.collisionSide = (crossWidth > (-crossHeight)) ? Side.Bottom : Side.Left;
				collision = true;
			} else {
				this.collisionSide = (crossWidth > -(crossHeight)) ? Side.Right : Side.Top;
				collision = true;
			}
		}

		return collision;

	}

    calculateEdgePosition(side: Side, obstacle: HTMLElement) {
    	switch(side) {
			case Side.Left:
				this.posX = obstacle.offsetLeft - this.ballElement.offsetWidth;
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

    getPosition() {
		return {x: this.posX, y: this.posY};
	}

	StartStep() {
		this.stepX = this.step;
		this.stepY = this.step;
	}

}

class Game {

	intervalTime: number = 10;
	paddle: Paddle;
	ball: Ball;
	keyMap: boolean[] = [];
	ballPosition: any;
	gameInterval: any;
	boardBottomPosition: number;
	life:number = 3;
	messageBox: HTMLElement;
	lifeLoss: HTMLElement;

	constructor(public ballElement: HTMLElement, public paddleElement: HTMLElement, public boardElement: HTMLElement, public brickCollection: HTMLCollection) {
		this.paddle = new Paddle(paddleElement, boardElement);
		this.ball = new Ball(ballElement, paddleElement, boardElement, brickCollection);
		this.boardBottomPosition = boardElement.offsetHeight - ballElement.offsetHeight;
		document.addEventListener('keyup', e => this.keyMap[e.keyCode] = false);
		document.addEventListener('keydown', e => this.keyMap[e.keyCode] = true);
		this.messageBox = <HTMLElement>document.getElementById('message-box');
		this.lifeLoss = <HTMLElement>document.querySelector('.life-loss');
		this.displayMessage();
	}

	start() {
		setTimeout(() => {
			this.hideMessage();
			var self = this;
			var startGame = function(e: any) {
				if(e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) {
					self.run();
					document.removeEventListener('keydown', startGame);
				}
			}
			document.addEventListener('keydown', startGame);
		}, 3000);
	}

	run() {
		this.gameInterval = setInterval(() => {

			this.ball.paddleDirection = 0;
			if(this.keyMap[KeyCodes.LEFT]) {
				this.paddle.moveLeft();
				this.ball.paddleDirection = this.paddle.direction.left;
			}
			if(this.keyMap[KeyCodes.RIGHT]) {
				this.paddle.moveRight();
				this.ball.paddleDirection = this.paddle.direction.right;
			}

			this.ball.move();
			this.checkWinGame();
			this.ballPosition = this.ball.getPosition();
			this.checkLifeLoss();

		}, this.intervalTime);
	}

	displayMessage() {
		this.lifeLoss.textContent = `${this.life}`;
		this.messageBox.classList.add('show');
	}

	hideMessage() {
		this.messageBox.classList.remove('show');
	}

	checkLifeLoss() {
		if(this.ballPosition.y == this.boardBottomPosition) {
			this.life--;
			this.retryGame();
		}
	}

	retryGame() {
		clearInterval(this.gameInterval);
		this.ball.StartPosition();
		this.ball.StartStep();
		this.paddle.StartPosition();
		this.displayMessage();
		(this.life > 0) ? this.start() : this.endGame('Koniec gry');
	}

	endGame(message: string) {
		this.messageBox.querySelector('.message').innerHTML += `<br>${message}`;
	}

	checkWinGame() {
		if(this.ball.checkWin()) {
			clearInterval(this.gameInterval);
			this.endGame('Wygrałeś');
			this.displayMessage();
		}
	}

}

var game = new Game(
	<HTMLElement>document.getElementById("ball"),
	<HTMLElement>document.getElementById("paddle"),
	<HTMLElement>document.getElementById("game-board"),
	<HTMLCollection>document.getElementsByClassName("brick")
);

game.start();