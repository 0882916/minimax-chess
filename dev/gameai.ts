/// <reference path='knight.ts' />

class GameAI {
    // let the AI choose a move, and update both the
    // knight and the gamestate

    public static moveKnight(king: King, knights: Knight[], gameState: GameState) {
        let t0 = performance.now()

        let gameStateCopy = gameState.copy()

        let kingPosCopy = king.getMoves(gameStateCopy.kingPos)

        // TODO: remove random move, amnd replace with AI move



        let t1 = performance.now()
        console.log(`AI move took: ${Math.round((Number(t1 - t0) + Number.EPSILON) * 100) / 100}ms.`)
    }
}
        // // RANDOM MOVE - START ------------------

        // // choose knight to move
        // let i: number = Math.floor(Math.random() * Math.floor(knights.length))

        // let legalMoves: [number, number][] = knights[i].getMoves()

        // console.log(legalMoves)

        // let j: number = Math.floor(Math.random() * Math.floor(legalMoves.length))

        // knights[i].setPosition(legalMoves[j])
        // gameState.knightPositions[i] = legalMoves[j]

        // // RANDOM MOVE - END   ------------------