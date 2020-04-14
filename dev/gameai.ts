/// <reference path='knight.ts' />

class GameAI {
    // let the AI choose a move, and update both the knight and the gamestate
    public static moveKnight(king: King, knights: Knight[], gameState: GameState) {
        let t0 = performance.now()

        let strike: [number, [number, number]] = [0, [0, 0]]
        let current: number = 100

        for (const [i, knight] of knights.entries()) {

            for (const action of knight.getMoves()) {
                let instance: GameState = gameState.copy()

                instance.knightPositions[i] = action

                let evaluation: number = this.minimax(instance, king, knights, -Infinity, +Infinity, true, 8)

                if (evaluation <= current) {
                    current = evaluation
                    strike = [i, action]
                }
            }
        }
        knights[strike[0]].setPosition(strike[1])

        gameState.knightPositions[strike[0]] = strike[1]

        let t1 = performance.now()
        
        console.log(`Knight ${strike[0] + 1} took ${Math.round((Number(t1 - t0) + Number.EPSILON) * 100) / 100}ms to move to ${strike[1][0] + 1}, ${strike[1][1] + 1}`)
    }

    protected static minimax(
        instance: GameState,
        king: King,
        knights: Knight[],
        alpha: number,
        beta: number,
        maximizer: boolean,
        depth: number): number {

        if (depth === 0 || instance.getScore()[0] === 100 || instance.getScore()[0] === -100) return instance.getScore()[0]

        if (maximizer) {
            let maxEval: number = -100

            for (const action of king.getMoves(instance.kingPos)) {
                let copy: GameState = instance.copy()

                copy.kingPos = action

                let evaluation: number = this.minimax(copy, king, knights, alpha, beta, false, depth - 1)

                maxEval = Math.max(maxEval, evaluation)

                alpha = Math.max(alpha, evaluation)

                if (beta <= alpha) break
            }
            return maxEval

        } else {
            let minEval: number = 100

            for (const [i, knight] of knights.entries()) {
                for (const action of knight.getMoves(instance.knightPositions[i])) {
                    let copy: GameState = instance.copy()

                    copy.knightPositions[i] = action

                    let evaluation: number = this.minimax(copy, king, knights, alpha, beta, true, depth - 1)

                    minEval = Math.min(minEval, evaluation)

                    beta = Math.min(beta, evaluation)

                    if (beta <= alpha) break
                }
            }
            return minEval
        }
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