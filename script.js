import { Grid } from "./grid.js";
import { Tile } from "./tile.js";

const gameBoard = document.getElementById('game-board')
const grid = new Grid(gameBoard)

document.addEventListener('dblclick', (e) => {e.preventDefault();})

let hammer = new Hammer(document.querySelector('body'))
hammer.get('swipe').set({direction: Hammer.DIRECTION_ALL})

hammer.on('swipedown', handleInput)
hammer.on('swipeup', handleInput)
hammer.on('swipeleft', handleInput)
hammer.on('swiperight', handleInput)


grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

setupInputOnce()

function setupInputOnce() {
    window.addEventListener("keydown", handleInput, {once: true});
}

async function handleInput(e) {
    switch (e.key ? e.key : e.type) {
        case "ArrowUp":
        case "swipeup":
            if (!canMoveUp()) {
                setupInputOnce();
                return;
            }
            await moveUp();
            break
        case "ArrowDown":
        case "swipedown":
            if (!canMoveDown()) {
                setupInputOnce();
                return;
            }
            await moveDown();
            break
        case "ArrowLeft":
        case "swipeleft":
            if (!canMoveLeft()) {
                setupInputOnce();
                return;
            }
            await moveLeft();
            break
        case "ArrowRight":
        case "swiperight":
            if (!canMoveRight()) {
                setupInputOnce();
                return;
            }
            await moveRight();
            break
        default:
            setupInputOnce()
            return
    }

    const newTile = new Tile(gameBoard)
    grid.getRandomEmptyCell().linkTile(newTile);

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        await newTile.waitForAnimationEnd()
        alert('Проиграла) Перезагрузи страницу чтобы заново начать')
    }

    setupInputOnce()
}

async function moveUp() {
    await slideTiles(grid.cellsGroupedByColumns)
}

async function moveDown() {
    await slideTiles(grid.cellsGroupedByReversedColumns)
}

async function moveLeft() {
    await slideTiles(grid.cellsGroupedByRows)
}

async function moveRight() {
    await slideTiles(grid.cellsGroupedByReversedRows)
}


async function slideTiles(groupedCells) {
    const promises = []

    groupedCells.forEach(group => slideTilesInGroup(group, promises))

    await Promise.all(promises);

    grid.cells.forEach(cell => {
        cell.hasTileForMerge() && cell.mergeTiles()
    })
}

function slideTilesInGroup(group, promises) {
    for (let i = 1; i < group.length; i++) {
        if (group[i].isEmpty()) {
            continue
        }

        const cellWithTile = group[i]

        let targetCell;
        let j = i - 1;

        while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
            targetCell = group[j];
            j--;
        }

        if (!targetCell) {
            continue
        }

        promises.push(cellWithTile.linkedTile.waitForTransitionEnd())

        if (targetCell.isEmpty()) {
            targetCell.linkTile(cellWithTile.linkedTile);
        } else {
            targetCell.linkTileForMerge(cellWithTile.linkedTile);
        }

        cellWithTile.unlinkTile()
    }
}

function canMoveUp() {
    return canMove(grid.cellsGroupedByColumns)
}

function canMoveDown() {
    return canMove(grid.cellsGroupedByReversedColumns)
}

function canMoveLeft() {
    return canMove(grid.cellsGroupedByRows)
}

function canMoveRight() {
    return canMove(grid.cellsGroupedByReversedRows)
}

function canMove(groupedCells) {
    return groupedCells.some(group => canMoveInGroup(group))
}

function canMoveInGroup(group) {
    return group.some((cell, index) => {
        if (index === 0) {
            return false
        }

        if (cell.isEmpty()) {
            return false
        }

        const targetCell = group[index - 1];
        return targetCell.canAccept(cell.linkedTile)
    })
}

const modal = document.querySelector('.modal')
const modalWrapper = document.querySelector('.modal--wrapper')
const modalButton = document.querySelector('.modal--wrapper button')

modalButton.addEventListener('click', e => {
    modalWrapper.classList.add('hidden')
}, {once: true})

setTimeout(() => {
    modalWrapper.classList.remove('hidden')
    modal.classList.remove('hidden')
    setTimeout(() => {
        modalButton.classList.remove('hidden')
    }, 1000)
}, 2000)