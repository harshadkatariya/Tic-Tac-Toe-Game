const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { GAME_STATUS } = require('./constants')
const { checkGame, aiMove, setGame } = require('./game-logic')
const  cors = require('cors')
const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())
app.get('/', async (req,res)=>{
    res.json({message:'hello'}) 
});

app.post(`/signin`, async (req, res) => {
    const { name, email } = req.body
    console.log("req", req.body);

    if (!name || !email ) {
        res.status(400).json({
            error: "Invalid input"
        })
        return
    }

    const user = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true, name: true, email: true }
    });
    console.log("user",user);

    if (user != null) {
        if (user.email === process.env.SYSTEM_EMAIL) {
            res.status(401).json({
                error: "Email is already in use."
            })
            return
        }
        res.json(user)
        return
    }

    const result = await prisma.user.create({
        data: {
            name,
            email
        },
    })
    console.log("result", result)
    res.json(result)
})

app.get(`/game/:gameId`, async (req, res) => {
    const { gameId } = req.params
    
    const result = await prisma.game.findUnique({
        where: { id: gameId },
        select: { id: true, status: true, userId: true, moves: true },
    })

    if(result === null) {
        res.status(400).json({ error: `Game with ID ${id} does not exist in the database` })
        return
    }

    const game = setGame(result.moves);
    result.gameBoard = game
    delete result.moves

    res.json(result)
})

app.post(`/game`, async (req, res) => {
    const { userId } = req.body
    
    try {

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { id: true, name: true, email: true }
        }); 

        if(user == null) {
            res.status(400).json({
                error:  `User with ID ${userId} does not exist in the database`
            })
        }

        const result = await prisma.game.create({
            data: {
                status: GAME_STATUS.UNFINISHED,
                user: {
                    connect: { id: userId }
                }
            },
        })
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: `Someting went wrong` })
    }
})

app.post('/move/:gameId', async (req, res) => {
    const { gameId } = req.params
    const { userId, box, symbol } = req.body

    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include : {
                moves: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                }
            }
        })

        if(game == null) {
            res.status(400).json({ error: `Game with ID ${gameId} does not exist in the database` })
            return
        }

        if(game.userId != userId) {
            res.status(400).json({ error: `Game with ID ${gameId} does not exist in the database for user with ID ${userId}` })
            return
        }

        if(game.status != GAME_STATUS.UNFINISHED) {
            res.status(400).json({ error: `Game is finished` })
            return
        }

        let isValid = true

        if(box < 1 || box > 9) {
            isValid = false
        }

        if(game.moves.some(move => move.box == box)) {
            isValid = false
        }

        if(game.moves.length && game.moves[0].userId == userId) {
            isValid = false
        }

        if(!isValid) {
            res.status(400).json({ error: `Invalid Move` })
            return
        }

        const move = await prisma.move.create({
            data: {
                box,
                symbol,
                game: {
                    connect: { id: gameId }
                },
                user: {
                    connect: { id: Number(userId) }
                }
            }
        })

        game.moves.splice(0, 0, move);

        const gameBoard = setGame(game.moves)

        const gameStatus = checkGame(gameBoard, symbol)

        if(gameStatus != GAME_STATUS.UNFINISHED) {
            await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: gameStatus
                }
            })
        }

        res.json({gameStatus, gameBoard});
    } catch (error) {
        res.status(500).json({ error: `Someting went wrong` })
    }
})

app.post('/get-move/:gameId', async (req, res) => {
    const { gameId } = req.params
    const { userId, symbol } = req.body

    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include : {
                moves: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                }
            }
        })

        if(game == null) {
            res.status(400).json({ error: `Game with ID ${gameId} does not exist in the database` })
            return
        }

        if(game.userId != userId) {
            res.status(400).json({ error: `Game with ID ${gameId} does not exist in the database for user with ID ${userId}` })
            return
        }

        if(game.status != GAME_STATUS.UNFINISHED) {
            res.status(400).json({ error: `Game is finished` })
            return
        }

        let isValid = true

        if(game.moves.length && game.moves[0].userId != userId) {
            isValid = false
        }

        if(!isValid) {
            res.status(400).json({ error: `Invalid Move` })
            return
        }

        const systemUser = await prisma.user.findFirst({
            where: { email: `${process.env.SYS_EMAIL}` },
            select: { id: true, name: true, email: true }
        });
        
        const nextMove = aiMove(game.moves);

        const move = await prisma.move.create({
            data: {
                box: nextMove,
                symbol,
                game: {
                    connect: { id: gameId }
                },
                user: {
                    connect: { id: systemUser.id }
                }
            }
        })

        game.moves.splice(0, 0, move)

        const gameBoard = setGame(game.moves)

        const gameStatus = checkGame(gameBoard, symbol)

        if(gameStatus != GAME_STATUS.UNFINISHED) {
            await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: gameStatus
                }
            })
        }

        res.json({nextMove, gameStatus, gameBoard});
    } catch (error) {
        res.status(500).json({ error: `Something went wrong` })
    }
})

const server = app.listen(3001, () =>
    console.log(`
🚀 Server ready at: http://localhost:3001`),
)