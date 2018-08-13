const fineApp = {};

// gridSize times gridSized board
fineApp.gridSize = 4;
fineApp.score = 0;

class Tile {
    constructor(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
        this.prevPosition = null;
        this.mergedFrom = null;
    }

    // saves previous position
    savePosition() {
        this.prevPosition = {
            x: this.x,
            y: this.y
        }
    }

    // updates position
    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }
}

// creating a grid that we will push on to the real board with
fineApp.grid = {
    size: fineApp.gridSize,
    cells: [],
    // buildling grid cells
    buildGrid() {
        for (let i = 0; i < fineApp.grid.size; i++) {
            // create empty rows for each row in cell
            fineApp.grid.cells[i] = [];

            for (let j = 0; j < fineApp.grid.size; j++) {
                // fill each row with column number of null spaces
                fineApp.grid.cells[i].push(null);
            }
        }
    },// results in: an empty board of nulls
    // [
    // [null, null, null, null],
    // [null, null, null, null],
    // [null, null, null, null],
    // [null, null, null, null]
    // ]

    // returns array of objects with [row][col] index
    // of all positions on grid that are empty (or null)
    emptyCells() {
        let cells = [];
        // loops each row
        for (let i = 0; i < fineApp.grid.size; i++) {
            // loops each item in row
            for (let j = 0; j < fineApp.grid.size; j++) {
                if (!fineApp.grid.cells[i][j]) {
                    // pushes index of empty cell into cells array
                    cells.push({
                        x: i,
                        y: j,
                    });
                }
            }
        }
        // array of objects with [row][column] indexing for all cells that are still null
        return cells;
    },

    // returns  a random empty cell
    // if there is any empty cells
    randomEmptyCell() {
        let cells = fineApp.grid.emptyCells();
        // if there are empty cells, return a random one
        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
    },

    thereAreEmptyCells() {
        return !!fineApp.grid.emptyCells().length;
    },

    // add tile to grid
    pushTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    },

    // add a random tile to grid
    addRandomTile() {
        if (fineApp.grid.emptyCells()) {
            // generate either a 2 or a 4 each time,
            // generate mostly 2s though, only a 4 once in a while
            const value = Math.random() < 0.9 ? 2 : 4;
            // create new tile with a random empty cell coordiante for it to go in
            const tile = new Tile(fineApp.grid.randomEmptyCell(), value);

            fineApp.grid.pushTile(tile);
        }
    },

    // add the starting 2 tiles on to the grid
    addStartTiles() {
        for (let i = 0; i < 2; i++) {
            fineApp.grid.addRandomTile();
        }
    }
};



// initialize
fineApp.init = () => {
    // reset game
    fineApp.score = 0;
    fineApp.gameOver = false;
    fineApp.gameWon = false;

    // build empty grid
    fineApp.grid.buildGrid();
    console.log(`building grid`);

    // add starting tiles to board
    fineApp.grid.addStartTiles();
    console.log("start/reseting game");
}


$(function() {
    console.log("ready");
    fineApp.init();

})