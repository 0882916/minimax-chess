/// <reference path='knight.ts' />

class GameAI {
    // let the AI choose a move, and update both the
    // knight and the gamestate

    public static moveKnight(king: King, knights: Knight[], gameState: GameState) {
        let t0 = performance.now()

        // TODO: remove random move, amnd replace with AI move

        // RANDOM MOVE - START ------------------

        console.log(king) // only to avoid error: 'king' is declared but its value is never read.

        // choose knight to move
        let i: number = Math.floor(Math.random() * Math.floor(knights.length))

        let legalMoves: [number, number][] = knights[i].getMoves()

        console.log(legalMoves)

        let j: number = Math.floor(Math.random() * Math.floor(legalMoves.length))

        knights[i].setPosition(legalMoves[j])
        gameState.knightPositions[i] = legalMoves[j]

        // RANDOM MOVE - END   ------------------

        let t1 = performance.now()
        console.log(`AI move took ${(t1 - t0)} milliseconds.`)
    }
}