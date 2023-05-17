/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game")
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")

const colors = {
    0: "#262830",
    1: "#ff0000",
    2: "#00ff00",
    3: "#0000ff",
    4: "#ffff00",
    5: "#00ffff",
    6: "#FF8000",
    7: "#FF00FF"
}

const board = new Array(10 * 20).fill(false)
const boardColors = new Array(10 * 20).fill(0)
const getBlock = (x, y) => { return { filled: board[y * 10 + x], color: boardColors[y * 10 + x] } }
const setBlock = (x, y, filled, color) => {
    board[y * 10 + x] = filled;
    if (filled) {
        boardColors[y * 10 + x] = color
        return
    }
    boardColors[y * 10 + x] = 0
}

const pieces = [
    {
        color: 4, width: 2, height: 2, blocks: [ // O
            true, true,
            true, true
        ]
    },
    {
        color: 5, width: 4, height: 1, blocks: [ // I
            true, true, true, true
        ]
    },
    {
        color: 6, width: 2, height: 3, blocks: [ // L
            true, false,
            true, false,
            true, true
        ]
    },
    {
        color: 3, width: 2, height: 3, blocks: [ // J
            false, true,
            false, true,
            true, true
        ]
    },
    {
        color: 1, width: 3, height: 2, blocks: [ // Z
            true, true, false,
            false, true, true
        ]
    },
    {
        color: 2, width: 3, height: 2, blocks: [ // S
            false, true, true,
            true, true, false
        ]
    },
    {
        color: 7, width: 3, height: 2, blocks: [ // T
            false, true, false,
            true, true, true
        ]
    }
]
let bag = []
const pullFromBag = () => {
    if (bag.length == 0) {
        bag = structuredClone(pieces)
    }
    let index = Math.floor(Math.random() * bag.length)
    console.log(index)
    bag.splice(index, 1)
    return index
}

const hold = {}
const swapHold = () => {
    if (hold == {}) {
        hold = structuredClone(currentPiece.piece)
        currentPiece.piece = pullFromBag()
    }
    let temp = structuredClone(hold)
    hold = structuredClone(currentPiece.piece)
    currentPiece.piece = structuredClone(temp)

}
const currentPiece = {
    x: 0, y: 0, rotation: 0, piece: structuredClone(pieces[pullFromBag()])
}

const lockPiece = () => {
    iteratePiece((x, y) => {
        if (!currentPiece.piece.blocks[y * currentPiece.piece.width + x]) {
            return
        }
        setBlock(currentPiece.x + x, currentPiece.y + y,
            currentPiece.piece.blocks[y * currentPiece.piece.width + x],
            currentPiece.piece.color)
    })
    currentPiece.x = 0
    currentPiece.y = 0
    currentPiece.rotation = 0
    currentPiece.piece = structuredClone(pieces[pullFromBag()])
}
const collisionCheck = () => {
    let colliding = false
    iteratePiece((x, y) => {
        if ((getBlock(currentPiece.x + x, currentPiece.y + y).filled
            && currentPiece.piece.blocks[y * currentPiece.piece.width + x])
            || currentPiece.y + y >= 20
            || currentPiece.x + x < 0 || currentPiece.x + x >= 10) {
            colliding = true
        }
    })
    return colliding
}
const applyGravity = () => {
    currentPiece.y++
    if (collisionCheck()) {
        currentPiece.y--
        lockPiece()
        return true
    }
    return false
}
const iteratePiece = (callback) => {
    for (let i = 0; i < currentPiece.piece.width; i++) {
        for (let j = 0; j < currentPiece.piece.height; j++) {
            callback(i, j)
        }
    }
}

function rotate() { // thanks chatgpt i didnt want to write this
    const { width, height, blocks } = currentPiece.piece;
    const rotatedBlocks = [];
    for (let i = blocks.length - 1; i >= 0; i--) {
        const row = Math.floor(i / width);
        const col = i % width;

        const newRow = col;
        const newCol = height - 1 - row;
        const newIndex = newRow * height + newCol;

        rotatedBlocks[newIndex] = blocks[i];
    }
    currentPiece.piece.blocks = rotatedBlocks;
    currentPiece.piece.width = height;
    currentPiece.piece.height = width;
}
function counterRotate() {
    rotate()
    rotate()
    rotate()
    // flawless logic dont look into it
}

let gravity = 1
let currentGrav = 0

let interval = setInterval(() => {
    currentGrav += gravity
    if (currentGrav >= 8) {
        applyGravity()
        currentGrav = 0
    }
}, 25)

window.onresize = () => {
    canvas.width = (innerHeight / 2) - 20
    canvas.height = innerHeight - 20
}
window.onresize()

function draw() {
    requestAnimationFrame(draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < canvas.width / 10; x++) {
        for (let y = 0; y < canvas.height / 20; y++) {
            let block = getBlock(x, y)
            ctx.fillStyle = colors[block.color]
            ctx.fillRect(x * canvas.width / 10 + 2, y * canvas.height / 20 + 2, canvas.width / 10 - 4, canvas.height / 20 - 4)
        }
    }

    iteratePiece((x, y) => {
        if (!currentPiece.piece.blocks[y * currentPiece.piece.width + x]) return
        ctx.fillStyle = colors[currentPiece.piece.color]
        ctx.fillRect((currentPiece.x + x) * canvas.width / 10 + 2, (currentPiece.y + y) * canvas.height / 20 + 2, canvas.width / 10 - 4, canvas.height / 20 - 4)
    })
}

requestAnimationFrame(draw)

document.onkeydown = (e) => {
    if (e.key == "w") {
        gravity = 8
    }
    if (e.key == "e") {
        rotate()
        if (collisionCheck()) counterRotate()
    }
    if (e.key == "q") {
        counterRotate()
        if (collisionCheck()) rotate()
    }
    if (e.key == "s") {
        for (let i = 0; i < 20; i++) {
            if (applyGravity()) break
            // ITS FLAWLESS DONT LOOK INTO IT
        }
    }
    let delta = 0
    if (e.key == "d") delta = 1
    else if (e.key == "a") delta = -1
    else return
    currentPiece.x += delta
    if (collisionCheck()) currentPiece.x -= delta
}
document.onkeyup = (e) => {
    if (e.key == "w") {
        gravity = 1
    }
}