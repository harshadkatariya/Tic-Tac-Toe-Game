const { GAME_STATUS } = require('./constants')

const checkGame = function (game, symbol) {

    function checkWinner(symbol) {
        for (let i = 0; i < 3; i++) {
            if (game[i][0] === symbol && game[i][1] === symbol && game[i][2] === symbol) return true
            if (game[0][i] === symbol && game[1][i] === symbol && game[2][i] === symbol) return true
        }
        
        if (game[0][0] === symbol && game[1][1] === symbol && game[2][2] === symbol) return true
        if (game[0][2] === symbol && game[1][1] === symbol && game[2][0] === symbol) return true
        return false
    }

    if (checkWinner(symbol)) return GAME_STATUS.WON

    for (let row of game) {
        if (row.includes('-')) return GAME_STATUS.UNFINISHED
    }

    return GAME_STATUS.DRAW
}

const setGame = function (moves) {
    const game = [['-', '-', '-'],
            ['-', '-', '-'],
            ['-', '-', '-']]

    if(!moves) {
        return game
    }

    for(let move of moves) {
        const i = Math.floor((move.box-1) / 3)
        const j = (move.box-1) % 3

        game[i][j] = move.symbol
    }

    return game
}

const getAvailableBoxes = function (moves) {
    const allBoxes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    
    const occupiedBoxes = new Set(moves.map(move => move.box))
    
    const availableBoxes = allBoxes.filter(box => !occupiedBoxes.has(box))
    
    return availableBoxes
}

const aiMove = function (moves) {
    const availableBoxes = getAvailableBoxes(moves)

    if (availableBoxes.length === 0) {
        throw new Error("No available moves")
    }
    
    const randomIndex = Math.floor(Math.random() * availableBoxes.length)
    const selectedBox = availableBoxes[randomIndex]
    
    return selectedBox
}

module.exports = {checkGame, aiMove, setGame}
