const fineApp = {};

/* STEPS
1. Have a Grid, that can check it's cells
2. Have a Tile class that has position values
3. Update HTML with new tiles
4. Keep track of time as score
*/

// gridSize times gridSized board
fineApp.gridSize = 4;
fineApp.score = 0;
fineApp.gameOver = false;
fineApp.gameWon = false;
fineApp.tileContainer = $('.tile-container')[0];
fineApp.scoreContainer = $('#score')[0];
fineApp.message = $('.message')[0];

class KeyboardInput {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if(!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    produceEvent(event, info) {
        let callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(info);
            });
        }
    }

    listen() {
        const keyCodes = {
            38: "up",
            39: "right",
            40: "down",
            37: "left"
        }

        $(document).on("keydown", function(e) {
            let key = keyCodes[e.which];

            if (key !== undefined) {
                e.preventDefault();
                console.log(key);
                fineApp.keyListen.produceEvent("move", key);
            }

            if (e.which === 32) {
                this.restart.bind(this)(e);
            }
        });

    }

    restart(e) {
        e.preventDefault();
        this.produceEvent("restart");
    }

}

/////////////// TILE ///////////////
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

/////////////// GRID ///////////////
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

    // returns true if there are any empty cells
    thereAreEmptyCells() {
        return !!fineApp.grid.emptyCells().length;
    },

    //cehcks if a cell is empty
    cellIsEmpty(cell) {
        return !fineApp.grid.cellValue(cell);
    },

    // returns the cell's value
    cellValue(cell) {
        if(this.inBounds(cell)) {
            return this.cells[cell.x][cell.y];
        } else {
            return null;
        }
    },

    // returns if a position is within bounds of grid
    inBounds(position) {
        if (position.x >= 0 && position.x < fineApp.gridSize && position.y >= 0 && position.y < fineApp.gridSize) {
            return true;
        } else {
            return false;
        }
    },

    // add tile to grid
    pushTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    },

    // remove tile from grid
    popTile(tile) {
        this.cells[tile.x][tile.y] = null;
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
    },

    // save all tile positions, remove merge
    prepareTiles() {
        fineApp.grid.cells.forEach(function(col) {
            col.forEach(function(cell) {
                if (cell) {
                    cell.mergedFrom = null;
                    cell.savePosition();
                }
            });
        });
    },

    // move tiles
    moveTile(tile, cell) {
        fineApp.grid.cells[tile.x][tile.y] = null;
        fineApp.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    },

    // come back to this
    move(direction) {
        let cell, tile;
    }


};

// TRAVELS
fineApp.getCoordinates = direction => {
    const coordinates = {
        up: {x: 0, y: -1},
        right: { x: 1, y: 0 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 }
    };
    return coordinates[direction];
}

// returns the route to take for moving tiles
fineApp.travelRoutes = coordinates => {
    let routes = {
        x: [],
        y: []
    };

    for(let i = 0; i < fineApp.gridSize; i++) {
        routes.x.push(i);
        routes.y.push(i);
    }

    if (coordinates.x === 1) {
        routes.x = routes.x.reverse();
    }

    if (coordinates.y === 1) {
        routes.y = routes.y.reverse();
    }

    return routes;
}

// finds farthest position
fineApp.mostFar(cell, coordinate) {
    let prev;

    // keep moving until you hit another cell, or you are out of bounds
    do {
        prev = cell;
        cell = {
            x: prev.x + coordinate.x,
            y: prev.y + coordinate.y
        };
    } while (fineApp.withinBounds(cell) && fineApp.cellIsEmpty(cell));

    return {
        mostFar: prev,
        next: cell // used to check if we need to merge
    };
};

// return movesAvailable
fineApp.movesAvailable() {
    return fineApp.grid.emptyCells() || fineApp.tileMatchesLeft();
}

fineApp.tileMatchesLeft() {

}

/////////////// HTML ///////////////

// add tile on to the HTML STUFF
fineApp.addTileToBoard = tile => {
    const item = $('<div></div>');
    const itemPosition = tile.prevPosition || {x: tile.x, y: tile.y};
    const positionClass = fineApp.positionClass(itemPosition);

    let classes = ['tile', `tile-${tile.value}`, positionClass];
    item.addClass(classes.join(" "));
    console.log(item);

    // put in the proper image content we want for now its a number
    // REPALCE IWTH COOL IMAGES LATER
    item.text(tile.value);

    // handles previous position of tile first
    if (tile.prevPosition) {
        // if there is previous position, handle
        window.requestAnimationFrame(function() {
            classes[2] = fineApp.positionClass({x: tile.x, y: tile.y});
            item.addClass(classes.join(" "));
        });
    // handles the tiles that were merged
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        item.addClass(classes.join(" "));

        tile.mergedFrom.forEach( function(merged) {
            // recursively add tiles to board
            fineApp.addTileToBoard(merged);
        });
    } else {
        classes.push("tile-new");
        item.addClass(classes.join(" "));
    }

    // append the tile to tile container on HTML
    fineApp.tileContainer.append(item[0]);
}

// update board
fineApp.updateBoard = () => {
    window.requestAnimationFrame(function() {
        $('.tile-container').empty();

        fineApp.grid.cells.forEach(function(col) {
            col.forEach(function (cell) {
                if (cell) {
                    fineApp.addTileToBoard(cell);
                }
            });
        });

        // update score/time?
        // update over
        // update win
    });
}

// returns position class for the tile
fineApp.positionClass = position => {
    return `tile-position-${position.x+1}-${position.y+1}`;
}



/////////////// KEYBOARD INPUT LISTENER ///////////////

// initialize
fineApp.init = () => {
    // reset game
    fineApp.score = 0;
    fineApp.gameOver = false;
    fineApp.gameWon = false;

    // build empty grid
    fineApp.grid.buildGrid();
    console.log(`building grid`);

    fineApp.keyListen = new KeyboardInput();
    fineApp.keyListen.listen();


    // add starting tiles to board

    fineApp.grid.addStartTiles();
    console.log("start/reseting game");
}


$(function() {
    console.log("ready");
    fineApp.init();

})