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
var OffsetType;
(function (OffsetType) {
    OffsetType[OffsetType["X"] = 0] = "X";
    OffsetType[OffsetType["Y"] = 1] = "Y";
})(OffsetType || (OffsetType = {}));
var GameElement = /** @class */ (function () {
    function GameElement(gameElement, boardElement) {
        this.gameElement = gameElement;
        this.boardElement = boardElement;
        this.step = 1;
        this.direction = [1, -1];
    }
    GameElement.prototype.getElementOffset = function (element, offsetType) {
        var el = { size: 0, offset: 0 };
        if (offsetType == OffsetType.X) {
            el.size = element.offsetWidth;
            el.offset = element.offsetLeft;
        }
        if (offsetType == OffsetType.Y) {
            el.size = element.offsetHeight;
            el.offset = element.offsetTop;
        }
        ;
        return el;
    };
    GameElement.prototype.calculatePosition = function (offsetType, direction) {
        if (direction === void 0) { direction = Direction.None; }
        var boardElement = this.getElementOffset(this.boardElement, offsetType);
        var gameElement = this.getElementOffset(this.gameElement, offsetType);
        var minPos = 0;
        var maxPos = boardElement['size'] - gameElement['size'];
        if (direction) {
            this.direction[offsetType] = direction;
        }
        else if (gameElement['offset'] <= minPos || gameElement['offset'] >= maxPos) {
            this.direction[offsetType] *= -1;
        }
        var pos = gameElement['offset'] + this.step * this.direction[offsetType];
        pos = (pos > maxPos) ? maxPos : pos;
        pos = (pos < minPos) ? minPos : pos;
        return pos;
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
        this.moveTo(this.calculatePosition(OffsetType.X), this.calculatePosition(OffsetType.Y));
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
        this.moveTo(this.calculatePosition(OffsetType.X, Direction.Left), this.paddleElement.offsetTop);
    };
    Paddle.prototype.moveRight = function () {
        this.moveTo(this.calculatePosition(OffsetType.X, Direction.Right), this.paddleElement.offsetTop);
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
