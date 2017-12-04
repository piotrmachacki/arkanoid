var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["LEFT"] = 37] = "LEFT";
    KeyCodes[KeyCodes["RIGHT"] = 39] = "RIGHT";
})(KeyCodes || (KeyCodes = {}));
var GameState;
(function (GameState) {
    GameState[GameState["GameOver"] = 0] = "GameOver";
    GameState[GameState["LifeLoss"] = 1] = "LifeLoss";
    GameState[GameState["Running"] = 2] = "Running";
})(GameState || (GameState = {}));
var OffsetType;
(function (OffsetType) {
    OffsetType[OffsetType["X"] = 0] = "X";
    OffsetType[OffsetType["Y"] = 1] = "Y";
})(OffsetType || (OffsetType = {}));
var Side;
(function (Side) {
    Side[Side["None"] = 0] = "None";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Right"] = 3] = "Right";
    Side[Side["Bottom"] = 4] = "Bottom";
})(Side || (Side = {}));
var GameElement = /** @class */ (function () {
    function GameElement(gameElement, boardElement) {
        this.gameElement = gameElement;
        this.boardElement = boardElement;
        this.step = 1;
        this.minX = 0;
        this.maxX = boardElement.offsetWidth - gameElement.offsetWidth;
        this.minY = 0;
        this.maxY = boardElement.offsetHeight - gameElement.offsetHeight;
        this.startPosition = { x: gameElement.offsetLeft, y: gameElement.offsetTop };
    }
    GameElement.prototype.moveTo = function (x, y) {
        if (x === void 0) { x = false; }
        if (y === void 0) { y = false; }
        if (x !== false)
            this.gameElement.style.left = x + 'px';
        if (y !== false)
            this.gameElement.style.top = y + 'px';
    };
    GameElement.prototype.StartPosition = function () {
        this.moveTo(this.startPosition.x, this.startPosition.y);
    };
    return GameElement;
}());
var Paddle = /** @class */ (function (_super) {
    __extends(Paddle, _super);
    function Paddle(paddleElement, boardElement) {
        var _this = _super.call(this, paddleElement, boardElement) || this;
        _this.paddleElement = paddleElement;
        _this.boardElement = boardElement;
        _this.step = 4;
        _this.direction = { left: -1, right: 1 };
        return _this;
    }
    Paddle.prototype.calculatePosition = function (direction) {
        var left = this.gameElement.offsetLeft + this.step * direction;
        left = (left > this.maxX) ? this.maxX : left;
        left = (left < this.minX) ? this.minX : left;
        return left;
    };
    Paddle.prototype.moveLeft = function () {
        this.moveTo(this.calculatePosition(this.direction.left));
    };
    Paddle.prototype.moveRight = function () {
        this.moveTo(this.calculatePosition(this.direction.right));
    };
    return Paddle;
}(GameElement));
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball(ballElement, paddleElement, boardElement, brickCollection) {
        var _this = _super.call(this, ballElement, boardElement) || this;
        _this.ballElement = ballElement;
        _this.paddleElement = paddleElement;
        _this.boardElement = boardElement;
        _this.brickCollection = brickCollection;
        _this.step = 3;
        _this.stepX = _this.step;
        _this.stepY = _this.step;
        _this.stepMin = 1.8;
        _this.stepChange = 0.3;
        _this.direction = [1, -1];
        _this.bricks = [];
        _this.posX = ballElement.offsetLeft;
        _this.posY = ballElement.offsetTop;
        _this.collisionSide = Side.None;
        for (var i = 0; i < brickCollection.length; i++) {
            _this.bricks.push(brickCollection[i]);
        }
        return _this;
    }
    Ball.prototype.move = function () {
        this.posX = this.calculateNewPosition(OffsetType.X);
        this.posY = this.calculateNewPosition(OffsetType.Y);
        this.checkGameBoardCollision();
        if (this.checkObstacleCollision(this.paddleElement)) {
            this.calculateHitAngle();
            this.calculateEdgePosition(this.collisionSide, this.paddleElement);
            this.flipDirection();
        }
        for (var i = 0; i < this.bricks.length; i++) {
            var brick = this.bricks[i];
            if (this.checkObstacleCollision(brick)) {
                this.calculateEdgePosition(this.collisionSide, brick);
                this.flipDirection();
                brick.style.visibility = 'hidden';
                this.bricks.splice(i, 1);
            }
        }
        this.moveTo(this.posX, this.posY);
    };
    Ball.prototype.checkWin = function () {
        return this.bricks.length ? false : true;
    };
    Ball.prototype.calculateHitAngle = function () {
        var ballX = this.direction[OffsetType.X];
        var paddleX = this.paddleDirection;
        if (paddleX != 0) {
            if (ballX == paddleX) {
                if (this.stepY > this.stepMin) {
                    this.stepX += this.stepChange;
                    this.stepY -= this.stepChange;
                }
            }
            else {
                if (this.stepX > this.stepMin) {
                    this.stepX -= this.stepChange;
                    this.stepY += this.stepChange;
                }
            }
        }
    };
    Ball.prototype.calculateNewPosition = function (offsetType) {
        var pos;
        if (offsetType == OffsetType.X)
            pos = this.ballElement.offsetLeft + this.stepX * this.direction[offsetType];
        if (offsetType == OffsetType.Y)
            pos = this.ballElement.offsetTop + this.stepY * this.direction[offsetType];
        return pos;
    };
    Ball.prototype.checkGameBoardCollision = function () {
        ;
        if (this.ballElement.offsetLeft < this.minX) {
            this.posX = this.minX;
            this.collisionSide = Side.Left;
            this.flipDirection();
        }
        if (this.ballElement.offsetLeft > this.maxX) {
            this.posX = this.maxX;
            this.collisionSide = Side.Right;
            this.flipDirection();
        }
        if (this.ballElement.offsetTop < this.minY) {
            this.posY = this.minY;
            this.collisionSide = Side.Top;
            this.flipDirection();
        }
        if (this.ballElement.offsetTop > this.maxY) {
            this.posY = this.maxY;
            this.collisionSide = Side.Bottom;
            this.flipDirection();
        }
    };
    Ball.prototype.checkObstacleCollision = function (obstacle) {
        var r1 = this.ballElement;
        var r2 = obstacle;
        var dx = (r1.offsetLeft + r1.offsetWidth / 2) - (r2.offsetLeft + r2.offsetWidth / 2);
        var dy = (r1.offsetTop + r1.offsetHeight / 2) - (r2.offsetTop + r2.offsetHeight / 2);
        var width = (r1.offsetWidth + r2.offsetWidth) / 2;
        var height = (r1.offsetHeight + r2.offsetHeight) / 2;
        var crossWidth = width * dy;
        var crossHeight = height * dx;
        var collision = false;
        if (Math.abs(dx) < width && Math.abs(dy) < height) {
            if (crossWidth > crossHeight) {
                this.collisionSide = (crossWidth > (-crossHeight)) ? Side.Bottom : Side.Left;
                collision = true;
            }
            else {
                this.collisionSide = (crossWidth > -(crossHeight)) ? Side.Right : Side.Top;
                collision = true;
            }
        }
        return collision;
    };
    Ball.prototype.calculateEdgePosition = function (side, obstacle) {
        switch (side) {
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
    };
    Ball.prototype.flipDirection = function () {
        if (this.collisionSide == Side.Left || this.collisionSide == Side.Right)
            this.direction[OffsetType.X] *= -1;
        if (this.collisionSide == Side.Top || this.collisionSide == Side.Bottom)
            this.direction[OffsetType.Y] *= -1;
    };
    Ball.prototype.getPosition = function () {
        return { x: this.posX, y: this.posY };
    };
    Ball.prototype.StartStep = function () {
        this.stepX = this.step;
        this.stepY = this.step;
    };
    return Ball;
}(GameElement));
var Game = /** @class */ (function () {
    function Game(ballElement, paddleElement, boardElement, brickCollection) {
        var _this = this;
        this.ballElement = ballElement;
        this.paddleElement = paddleElement;
        this.boardElement = boardElement;
        this.brickCollection = brickCollection;
        this.intervalTime = 10;
        this.keyMap = [];
        this.life = 3;
        this.paddle = new Paddle(paddleElement, boardElement);
        this.ball = new Ball(ballElement, paddleElement, boardElement, brickCollection);
        this.boardBottomPosition = boardElement.offsetHeight - ballElement.offsetHeight;
        document.addEventListener('keyup', function (e) { return _this.keyMap[e.keyCode] = false; });
        document.addEventListener('keydown', function (e) { return _this.keyMap[e.keyCode] = true; });
        this.messageBox = document.getElementById('message-box');
        this.lifeLoss = document.querySelector('.life-loss');
        this.displayMessage();
    }
    Game.prototype.start = function () {
        var _this = this;
        setTimeout(function () {
            _this.hideMessage();
            var self = _this;
            var startGame = function (e) {
                if (e.keyCode === KeyCodes.LEFT || e.keyCode === KeyCodes.RIGHT) {
                    self.run();
                    document.removeEventListener('keydown', startGame);
                }
            };
            document.addEventListener('keydown', startGame);
        }, 3000);
    };
    Game.prototype.run = function () {
        var _this = this;
        this.gameInterval = setInterval(function () {
            _this.ball.paddleDirection = 0;
            if (_this.keyMap[KeyCodes.LEFT]) {
                _this.paddle.moveLeft();
                _this.ball.paddleDirection = _this.paddle.direction.left;
            }
            if (_this.keyMap[KeyCodes.RIGHT]) {
                _this.paddle.moveRight();
                _this.ball.paddleDirection = _this.paddle.direction.right;
            }
            _this.ball.move();
            _this.checkWinGame();
            _this.ballPosition = _this.ball.getPosition();
            _this.checkLifeLoss();
        }, this.intervalTime);
    };
    Game.prototype.displayMessage = function () {
        this.lifeLoss.textContent = "" + this.life;
        this.messageBox.classList.add('show');
    };
    Game.prototype.hideMessage = function () {
        this.messageBox.classList.remove('show');
    };
    Game.prototype.checkLifeLoss = function () {
        if (this.ballPosition.y == this.boardBottomPosition) {
            this.life--;
            this.retryGame();
        }
    };
    Game.prototype.retryGame = function () {
        clearInterval(this.gameInterval);
        this.ball.StartPosition();
        this.ball.StartStep();
        this.paddle.StartPosition();
        this.displayMessage();
        (this.life > 0) ? this.start() : this.endGame('Koniec gry');
    };
    Game.prototype.endGame = function (message) {
        this.messageBox.querySelector('.message').innerHTML += "<br>" + message;
    };
    Game.prototype.checkWinGame = function () {
        if (this.ball.checkWin()) {
            clearInterval(this.gameInterval);
            this.endGame('Wygrałeś');
            this.displayMessage();
        }
    };
    return Game;
}());
var game = new Game(document.getElementById("ball"), document.getElementById("paddle"), document.getElementById("game-board"), document.getElementsByClassName("brick"));
game.start();

//# sourceMappingURL=app.js.map
