"use strict";
class GameObject extends HTMLElement {
    constructor() {
        super();
        this.pos = [0, 0];
        this.targetPos = [0, 0];
        this.speed = [5, 5];
        this.direction = 1;
        this.moving = false;
        document.body.appendChild(this);
    }
    update() {
        this.moving = false;
        for (let i = 0; i < 2; i++) {
            if (Math.abs(this.targetPos[i] - this.pos[i]) <= this.speed[i])
                this.pos[i] = this.targetPos[i];
            else
                this.moving = true;
        }
        if (this.pos[0] > this.targetPos[0])
            this.pos[0] -= this.speed[0];
        else if (this.pos[0] < this.targetPos[0])
            this.pos[0] += this.speed[0];
        else if (this.pos[1] > this.targetPos[1])
            this.pos[1] -= this.speed[1];
        else if (this.pos[1] < this.targetPos[1])
            this.pos[1] += this.speed[1];
        this.style.width = `${this.width}px`;
        this.style.height = `${this.height}px`;
        this.style.backgroundSize = `${this.width}px ${this.height}px`;
        this.style.transform = `translate(${this.pos[0]}px, ${this.pos[1]}px) scale(${this.direction}, 1)`;
    }
}
class ChessPiece extends GameObject {
    constructor() {
        super();
        this.width = Board.getInstance().getTileSize();
        this.height = Board.getInstance().getTileSize();
    }
    setPosition(pos) {
        this.boardPosition = pos;
        this.targetPos = Board.getInstance().boardToScreenPos(this.boardPosition);
    }
    initPosition(pos) {
        this.setPosition(pos);
        this.pos = Board.getInstance().boardToScreenPos(this.boardPosition);
    }
}
class Tile extends ChessPiece {
    constructor() {
        super();
        this.width = Board.getInstance().getTileSize();
        this.height = Board.getInstance().getTileSize();
        this.style.backgroundColor = 'white';
    }
    setColor(color) {
        this.style.backgroundColor = color;
    }
    update() {
        super.update();
    }
    getMoves() {
        let moves = [];
        return moves;
    }
}
window.customElements.define('tile-component', Tile);
class Board {
    constructor() {
        this.BOARD_SIZE = 12;
        this.tileSize = 100;
        let smallestSide = Math.min(window.innerWidth, window.innerHeight);
        this.tileSize = Math.floor(smallestSide / this.BOARD_SIZE);
    }
    static getInstance() {
        if (Board.instance == null) {
            Board.instance = new Board();
            for (let i = 0; i < Board.getInstance().getSize(); i++) {
                for (let j = 0; j < Board.getInstance().getSize(); j++) {
                    let t = new Tile();
                    t.setColor((i + j) % 2 == 0 ? '#ffffff' : '#000000');
                    t.initPosition([i, j]);
                    t.update();
                }
            }
        }
        return Board.instance;
    }
    legalPosition(pos) {
        return (pos[0] >= 0) && (pos[1] >= 0) && (pos[0] < this.BOARD_SIZE) && (pos[1] < this.BOARD_SIZE);
    }
    getSize() {
        return this.BOARD_SIZE;
    }
    getTileSize() {
        return this.tileSize;
    }
    boardToScreenPos(boardPos) {
        return [boardPos[0] * this.tileSize, boardPos[1] * this.tileSize];
    }
    screenToBoardPos(screenPos) {
        return [Math.floor(screenPos[0] / this.tileSize), Math.floor(screenPos[1] / this.tileSize)];
    }
    static samePosition(a, b) {
        return (a[0] === b[0]) && (a[1] === b[1]);
    }
}
class GameState {
    constructor(kingPos, knightPositions) {
        this.kingPos = kingPos;
        this.knightPositions = knightPositions;
    }
    getScore() {
        for (let z of this.knightPositions) {
            if (Board.samePosition(z, this.kingPos))
                return [-100, true];
        }
        if (this.kingPos[1] === 0)
            return [100, true];
        return [-this.kingPos[1], false];
    }
    copy() {
        const knightPosCopy = Object.assign([], this.knightPositions);
        return new GameState(this.kingPos, knightPosCopy);
    }
}
class Game {
    constructor() {
        this.knights = [];
        this.gameOver = false;
        this.KNIGHTS = 3;
        this.playerTurn = true;
        Board.getInstance();
        this.king = new King();
        this.king.initPosition([Math.floor(Board.getInstance().getSize() / 2), Board.getInstance().getSize() - 1]);
        let knightPos = [];
        for (let c = 0; c < this.KNIGHTS; c++) {
            let z = new Knight();
            let pos = [Math.floor((c / this.KNIGHTS) * Board.getInstance().getSize()), 0];
            z.initPosition(pos);
            knightPos.push(pos);
            this.knights.push(z);
        }
        this.gameState = new GameState(this.king.boardPosition, knightPos);
        window.addEventListener('click', (e) => this.onWindowClick(e));
        window.addEventListener('touchend', (e) => this.onTouchStart(e));
        this.gameLoop();
    }
    onTouchStart(e) {
        let touchobj = e.changedTouches[0];
        this.playerMove(touchobj.clientX, touchobj.clientY);
    }
    onWindowClick(e) {
        this.playerMove(e.x, e.y);
    }
    playerMove(x, y) {
        let boardPos = Board.getInstance().screenToBoardPos([x, y]);
        let moving = false;
        for (let go of this.knights) {
            if (go.moving)
                moving = true;
        }
        if (this.playerTurn && !moving && !this.gameOver) {
            let legalMoves = this.king.getMoves();
            for (let m of legalMoves) {
                if (Board.samePosition(m, boardPos)) {
                    this.king.setPosition(boardPos);
                    this.gameState.kingPos = boardPos;
                    this.playerTurn = false;
                    if (this.gameState.getScore()[1]) {
                        console.log(`YOU WIN? THAT'S IMPOSSIBLE!`);
                        this.gameOver = true;
                        location.reload();
                    }
                }
            }
        }
        else
            console.log(`GETTING IMPATIENT ARE WE?`);
    }
    gameLoop() {
        this.king.update();
        for (let go of this.knights)
            go.update();
        if (!this.playerTurn && !this.king.moving) {
            console.log(`YOUR TURN, KING!`);
            GameAI.moveKnight(this.king, this.knights, this.gameState);
            this.playerTurn = true;
        }
        if (!this.king.moving) {
            if (this.gameState.getScore()[1]) {
                console.log(`YOU LOSE! AGAIN!`);
                this.gameOver = true;
                location.reload();
            }
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}
console.log(`LET THE GAME BEGIN.`);
window.addEventListener('load', () => new Game());
class Knight extends ChessPiece {
    getMoves(from = this.boardPosition) {
        let moves = [];
        for (let i = -2; i < 3; i++) {
            for (let j = -2; j < 3; j++) {
                if ((Math.abs(i) === Math.abs(j)) || (i === 0) || (j === 0))
                    continue;
                let newPos = [from[0] + i, from[1] + j];
                if (Board.getInstance().legalPosition(newPos))
                    moves.push(newPos);
            }
        }
        return moves;
    }
}
window.customElements.define('knight-component', Knight);
class GameAI {
    static moveKnight(king, knights, gameState) {
        let t0 = performance.now();
        let strike = [0, [0, 0]];
        let current = 100;
        for (const [i, knight] of knights.entries()) {
            for (const action of knight.getMoves()) {
                let instance = gameState.copy();
                instance.knightPositions[i] = action;
                let evaluation = this.minimax(instance, king, knights, -Infinity, +Infinity, true, 8);
                if (evaluation <= current) {
                    current = evaluation;
                    strike = [i, action];
                }
            }
        }
        knights[strike[0]].setPosition(strike[1]);
        gameState.knightPositions[strike[0]] = strike[1];
        let t1 = performance.now();
        console.log(`Knight ${strike[0] + 1} took ${Math.round((Number(t1 - t0) + Number.EPSILON) * 100) / 100}ms to move to ${strike[1][0] + 1}, ${strike[1][1] + 1}`);
    }
    static minimax(instance, king, knights, alpha, beta, maximizer, depth) {
        if (depth === 0 || instance.getScore()[0] === 100 || instance.getScore()[0] === -100)
            return instance.getScore()[0];
        if (maximizer) {
            let maxEval = -100;
            for (const action of king.getMoves(instance.kingPos)) {
                let copy = instance.copy();
                copy.kingPos = action;
                let evaluation = this.minimax(copy, king, knights, alpha, beta, false, depth - 1);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha)
                    break;
            }
            return maxEval;
        }
        else {
            let minEval = 100;
            for (const [i, knight] of knights.entries()) {
                for (const action of knight.getMoves(instance.knightPositions[i])) {
                    let copy = instance.copy();
                    copy.knightPositions[i] = action;
                    let evaluation = this.minimax(copy, king, knights, alpha, beta, true, depth - 1);
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha)
                        break;
                }
            }
            return minEval;
        }
    }
}
class King extends ChessPiece {
    getMoves(from = this.boardPosition) {
        let moves = [];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if ((i === 0) && (j === 0))
                    continue;
                let newPos = [from[0] + i, from[1] + j];
                if (Board.getInstance().legalPosition(newPos))
                    moves.push(newPos);
            }
        }
        return moves;
    }
}
window.customElements.define('king-component', King);
//# sourceMappingURL=main.js.map