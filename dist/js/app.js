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
    GameState[GameState["Running"] = 1] = "Running";
})(GameState || (GameState = {}));
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Left"] = -1] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Top"] = -1] = "Top";
    Direction[Direction["Bottom"] = 1] = "Bottom";
})(Direction || (Direction = {}));
var GameElement = /** @class */ (function () {
    function GameElement(gameElement, boardElement) {
        this.gameElement = gameElement;
        this.boardElement = boardElement;
        this.step = 1;
        this.directionX = 1;
        this.directionY = -1;
    }
    GameElement.prototype.calculateX = function (directionX) {
        if (directionX === void 0) { directionX = Direction.None; }
        var minLeft = 0;
        var maxLeft = this.boardElement.offsetWidth - this.gameElement.offsetWidth;
        if (directionX) {
            this.directionX = directionX;
        }
        else if (this.gameElement.offsetLeft <= minLeft || this.gameElement.offsetLeft >= maxLeft) {
            this.directionX *= -1;
        }
        var left = this.gameElement.offsetLeft + this.step * this.directionX;
        left = (left > maxLeft) ? maxLeft : left;
        left = (left < minLeft) ? minLeft : left;
        return left;
    };
    GameElement.prototype.calculateY = function (directionY) {
        if (directionY === void 0) { directionY = Direction.None; }
        var minTop = 0;
        var maxTop = this.boardElement.offsetHeight - this.gameElement.offsetHeight;
        if (directionY) {
            this.directionY = directionY;
        }
        else if (this.gameElement.offsetTop <= minTop || this.gameElement.offsetTop >= maxTop) {
            this.directionY *= -1;
        }
        var top = this.gameElement.offsetTop + this.step * this.directionY;
        top = (top > maxTop) ? maxTop : top;
        top = (top < minTop) ? minTop : top;
        return top;
    };
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
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball(ballElement, paddleElement, boardElement) {
        var _this = _super.call(this, ballElement, boardElement) || this;
        _this.ballElement = ballElement;
        _this.paddleElement = paddleElement;
        _this.boardElement = boardElement;
        _this.step = 3;
        return _this;
    }
    Ball.prototype.move = function () {
        this.moveTo(this.calculateX(), this.calculateY());
    };
    return Ball;
}(GameElement));
var Paddle = /** @class */ (function (_super) {
    __extends(Paddle, _super);
    function Paddle(paddleElement, boardElement) {
        var _this = _super.call(this, paddleElement, boardElement) || this;
        _this.paddleElement = paddleElement;
        _this.boardElement = boardElement;
        _this.step = 4;
        return _this;
    }
    Paddle.prototype.moveLeft = function () {
        this.moveTo(this.calculateX(Direction.Left));
    };
    Paddle.prototype.moveRight = function () {
        this.moveTo(this.calculateX(Direction.Right));
    };
    return Paddle;
}(GameElement));
var Game = /** @class */ (function () {
    function Game(ballElement, paddleElement, boardElement) {
        this.ballElement = ballElement;
        this.paddleElement = paddleElement;
        this.boardElement = boardElement;
        this.intervalTime = 10;
        this.keyMap = [];
        this.paddle = new Paddle(this.paddleElement, this.boardElement);
        this.ball = new Ball(this.ballElement, this.paddleElement, this.boardElement);
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
var game = new Game(document.getElementById("ball"), document.getElementById("paddle"), document.getElementById("game-board"));
game.run();

//# sourceMappingURL=app.js.map
