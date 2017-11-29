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
    GameState[GameState["lifeLoss"] = 1] = "lifeLoss";
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
        this.maxX = this.boardElement.offsetWidth - this.gameElement.offsetWidth;
        this.minY = 0;
        this.maxY = this.boardElement.offsetHeight - this.gameElement.offsetHeight;
    }
    GameElement.prototype.moveTo = function (x, y) {
        if (x === void 0) { x = false; }
        if (y === void 0) { y = false; }
        if (x !== false)
            this.gameElement.style.left = x + 'px';
        if (y !== false)
            this.gameElement.style.top = y + 'px';
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
    Ball.prototype.calculateNewPosition = function (offsetType) {
        var pos;
        if (offsetType == OffsetType.X)
            pos = this.ballElement.offsetLeft + this.step * this.direction[offsetType];
        if (offsetType == OffsetType.Y)
            pos = this.ballElement.offsetTop + this.step * this.direction[offsetType];
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
        var w = 0.5 * (this.ballElement.offsetWidth + obstacle.offsetWidth);
        var h = 0.5 * (this.ballElement.offsetHeight + obstacle.offsetHeight);
        var dx = (this.ballElement.offsetLeft + this.ballElement.offsetWidth / 2) - (obstacle.offsetLeft + obstacle.offsetWidth / 2);
        var dy = (this.ballElement.offsetTop + this.ballElement.offsetHeight / 2) - (obstacle.offsetTop + obstacle.offsetHeight / 2);
        if (Math.abs(dx) < w && Math.abs(dy) < h) {
            var wy = w * dy;
            var hx = h * dx;
            if (wy > hx) {
                if (wy > -hx) {
                    this.collisionSide = Side.Bottom;
                }
                else {
                    this.collisionSide = Side.Left;
                }
                return true;
            }
            else {
                if (wy > -hx) {
                    this.collisionSide = Side.Right;
                }
                else {
                    this.collisionSide = Side.Top;
                }
                return true;
            }
        }
        else {
            this.collisionSide = Side.None;
            return false;
        }
    };
    Ball.prototype.calculateEdgePosition = function (side, obstacle) {
        switch (side) {
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
    };
    Ball.prototype.flipDirection = function () {
        if (this.collisionSide == Side.Left || this.collisionSide == Side.Right)
            this.direction[OffsetType.X] *= -1;
        if (this.collisionSide == Side.Top || this.collisionSide == Side.Bottom)
            this.direction[OffsetType.Y] *= -1;
    };
    return Ball;
}(GameElement));
var Game = /** @class */ (function () {
    function Game(ballElement, paddleElement, boardElement, brickCollection) {
        this.ballElement = ballElement;
        this.paddleElement = paddleElement;
        this.boardElement = boardElement;
        this.brickCollection = brickCollection;
        this.intervalTime = 10;
        this.keyMap = [];
        this.paddle = new Paddle(paddleElement, boardElement);
        this.ball = new Ball(ballElement, paddleElement, boardElement, brickCollection);
    }
    Game.prototype.run = function () {
        var _this = this;
        document.addEventListener('keyup', function (e) { return _this.keyMap[e.keyCode] = false; });
        document.addEventListener('keydown', function (e) { return _this.keyMap[e.keyCode] = true; });
        setInterval(function () {
            if (_this.keyMap[KeyCodes.LEFT])
                _this.paddle.moveLeft();
            if (_this.keyMap[KeyCodes.RIGHT])
                _this.paddle.moveRight();
            _this.ball.move();
        }, this.intervalTime);
    };
    return Game;
}());
var game = new Game(document.getElementById("ball"), document.getElementById("paddle"), document.getElementById("game-board"), document.getElementsByClassName("brick"));
game.run();

//# sourceMappingURL=app.js.map
