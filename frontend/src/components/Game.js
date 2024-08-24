import React, { useState, useEffect } from 'react';
import './Game.css'; // Import the CSS file

function Game({ user, gameId }) {
    const [board, setBoard] = useState(Array(3).fill('-').map(() => Array(3).fill('-')));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        // Fetch the initial game state
        const fetchGameState = async () => {
            try {
                const response = await fetch(`http://localhost:3001/game/${gameId}`);
                const gameData = await response.json();
                setBoard(gameData.gameBoard); // Initialize the board with the current game state
            } catch (error) {
                console.error('Failed to fetch game state:', error);
            }
        };

        fetchGameState(); // Fetch game state on component mount
    }, [gameId]);

    const makeMove = async (x, y) => {
        if (board[x][y] !== '-' || !isPlayerTurn || status) return; // Prevent invalid moves

        try {
            // Player's move
            const playerResponse = await fetch(`http://localhost:3001/move/${gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    box: x * 3 + y + 1, // Convert (x, y) to box number (1-9)
                    symbol: 'X'
                }),
            });

            const playerData = await playerResponse.json();
            setBoard(playerData.gameBoard);
            setStatus(playerData.gameStatus);

            if (playerData.gameStatus === 0) { // If the game is still unfinished
                setIsPlayerTurn(false);

                // AI's move after player's move
                const aiResponse = await fetch(`http://localhost:3001/get-move/${gameId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        symbol: 'O',
                    }),
                });

                const aiData = await aiResponse.json();
                setBoard(aiData.gameBoard);
                setStatus(aiData.gameStatus);
                setIsPlayerTurn(true); // Player's turn again
            }
        } catch (error) {
            console.error('Error during move:', error);
        }
    };

    const renderCell = (x, y) => (
        <button className="cell-button" onClick={() => makeMove(x, y)}>
            {board[x][y] === '-' ? '' : board[x][y]}
        </button>
    );

    return (
        <div className="game-container">
            <h2>Tic-Tac-Toe</h2>
            <div>
                {board.map((row, x) => (
                    <div key={x} className="board-row">
                        {row.map((cell, y) => (
                            <span key={y}>{renderCell(x, y)}</span>
                        ))}
                    </div>
                ))}
            </div>
            {status !== null && (
                <div className="status">
                    {status === 1 ? 'You won!' : status === 2 ? 'You lost!' : 'It\'s a draw!'}
                </div>
            )}
        </div>
    );
}

export default Game;
