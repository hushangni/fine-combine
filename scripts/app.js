const fineApp = {};

// fine app variables
fineApp.gridSize = 4;
fineApp.score = 0;
fineApp.gameOver = false;
fineApp.gameWon = false;
fineApp.winTile = 256;
fineApp.seconds = 0;
fineApp.minutes = 0;
fineApp.finalTimes = $('#finalTime')[0];
fineApp.interval;
fineApp.time = $('#time')[0];

// fine app modals
fineApp.winModal = $('.winner-modal');
fineApp.gameOverModal = $('.game-over-modal');
fineApp.questionModal = $('.question-modal');
fineApp.heartModal = $('.heart-modal');

// fine app containers
fineApp.tileContainer = $('.tile-container')[0];
fineApp.scoreContainer = $('#score')[0];
fineApp.message = $('.message')[0];

const fruitImages = [
    '<img src="assets/kiwi.png" alt="">',
    '<img src="assets/papaya.png" alt="">',
    '<img src="assets/coconut.png" alt="">',
    '<img src="assets/dragonfruit.png" alt="">',
    '<img src="assets/lemon.png" alt="">',
    '<img src="assets/pomegranate.png" alt="">',
    '<img src="assets/watermelon.png" alt="">',
    '<img src="assets/fruitbowl.png" alt="" class="win-image">'
];
fineApp.tileImgs = fruitImages;

// sounds
const thinDing = $('#thinDing')[0]; // win sound
const pop = $('#pop')[0]; // doesn't work when it is hosted on github (on FireFox only);

const tweeter = $('#tweeter')[0]; // tweet sound
const blop = $('#blop')[0]; // match sound
const squish = $('#squish')[0]; // juice sound
const thud = $('#thud')[0]; // lose sound

/////////////// KEYBOARD INPUT HANDLER ///////////////
class KeyboardInput {
    // create keyboard input listener
    constructor() {
        this.events = {};
    }

    // creating own events function
    on(event, callback) {
        if(!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // creating ability to produce our own events
    produceEvent(event, info) {
        let callbacks = this.events[event];

        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(info);
            });
        }
    }

    // listen for key codes, and trigger move based on which
    // key is pressed
    listen() {
        const keyCodes = {
            38: 0,// up
            39: 1,// right
            40: 2,// down
            37: 3// left
        }

        $(document).on("keydown", function(e) {
            let key = keyCodes[e.which];

            if (key !== undefined) {
                e.preventDefault();
                fineApp.keyListen.produceEvent("move", key);
            }
        });

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
        fineApp.grid.cells[tile.x][tile.y] = tile;
    },

    // remove tile from grid
    popTile(tile) {
        fineApp.grid.cells[tile.x][tile.y] = null;
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

    // this is the money maker
    move(direction) {
        // dont do anything if its over

        if (fineApp.gameOver || fineApp.gameOver) return;

        let cell, tile;

        let coordinate = fineApp.getCoordinates(direction);
        let routes = fineApp.travelRoutes(coordinate);
        let moved = false;

        fineApp.grid.prepareTiles();

        routes.x.forEach(function(x) {
            routes.y.forEach(function(y) {
                cell = {x: x, y: y};
                tile = fineApp.grid.cellValue(cell);

                if (tile) {
                    const positions = fineApp.mostFar(cell, coordinate);
                    const next = fineApp.grid.cellValue(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next, tile.value * 2);

                        merged.mergedFrom = [tile, next];
                        blop.play();
                        fineApp.grid.pushTile(merged);
                        fineApp.grid.popTile(tile);


                        // converge the 2 tiles positions
                        tile.updatePosition(positions.next);


                        // the end tile
                        if (merged.value === fineApp.winTile) {
                            fineApp.gameWon = true;
                        }
                    } else {
                        fineApp.grid.moveTile(tile, positions.mostFar);
                    }

                    if (!fineApp.samePositions(cell, tile)) {
                        moved = true;
                        // tile moved to original
                    }
                }
            });
        });

        if (moved) {
            fineApp.grid.addRandomTile();

            if (fineApp.movesAvailable().length == 0) {
                fineApp.gameOver = true; // game over!
            }
            fineApp.updateBoard();
        }
    }
};

/////////////// TRAVELS AND COORDIANTES///////////////
// fineApp.getCoordinates(direction)
// returns the direction in x, y to move based on key press
fineApp.getCoordinates = direction => {
    const coordinates = {
        0: {x: 0, y: -1},
        1: { x: 1, y: 0 },
        2: { x: 0, y: 1 },
        3: { x: -1, y: 0 }
        //  38: 0,// up
        // 39: 1,// right
        // 40: 2,// down
        // 37: 3// left
    };
    return coordinates[direction];
}

// fineApp.travelRoutes(coordinates)
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

    // forces route to travel from the furthest
    if (coordinates.x === 1) {
        routes.x = routes.x.reverse();
    }

    if (coordinates.y === 1) {
        routes.y = routes.y.reverse();
    }

    return routes;
};

// fineApp.mostFar(cell, coordinate)
// finds farthest position for tile to go to
fineApp.mostFar = (cell, coordinate) => {
    let prev;

    // keep moving until you hit another cell, or you are out of bounds
    do {
        prev = cell;
        cell = {
            x: prev.x + coordinate.x,
            y: prev.y + coordinate.y
        };
    } while (fineApp.grid.inBounds(cell) && fineApp.grid.cellIsEmpty(cell));

    return {
        mostFar: prev,
        next: cell // used to check if we need to merge
    };
};

// fineApp.movesAvailable()
// returns all the moves available currently
fineApp.movesAvailable = () => {
    return fineApp.grid.emptyCells();
}

// fineApp.samePositions(firstPos, secondPos)
// returns if positoins are equal:
fineApp.samePositions = (firstPos, secondPos) => {
    return firstPos.x === secondPos.x && firstPos.y === secondPos.y;
}

// fineApp.positionClass(position)
// returns position class for the tile
fineApp.positionClass = position => {
    return `tile-position-${position.x + 1}-${position.y + 1}`;
};

/////////////// UPDATING HTML FUNCTIONS ///////////////

// fineApp.addTileToBoard(tile)
// add the tile to the actual HTML game board
fineApp.addTileToBoard = tile => {
    const item = $('<div></div>');
    const itemPosition = tile.prevPosition || {x: tile.x, y: tile.y};
    const positionClass = fineApp.positionClass(itemPosition);

    let classes = ['tile', `tile-${tile.value}`, positionClass];
    item.addClass(classes.join(" "));

    switch (tile.value) {
        case 2:
            item.html(fineApp.tileImgs[0]);
            break;
        case 4:
            item.html(fineApp.tileImgs[1]);
            break;
        case 8:
            item.html(fineApp.tileImgs[2]);
            break;
        case 16:
            item.html(fineApp.tileImgs[3]);
            break;
        case 32:
            item.html(fineApp.tileImgs[4]);
            break;
        case 64:
            item.html(fineApp.tileImgs[5]);
            break;
        case 128:
            item.html(fineApp.tileImgs[6]);
            break;
        case 256:
            item.html(fineApp.tileImgs[7]);
            break;
        default:
            item.text(tile.value);
    }

    // handles previous position of tile first
    if (tile.prevPosition) {
        // if there is previous position, handle
        // requestnimationFrame better browser optimizaiton/support
        // animations in active tabs stop, better battery life
        // more battery friendly > setInterval()
        // animate all classes added
        window.requestAnimationFrame(function() {
            item.removeClass(classes[2]);
            // SHOUTOUT TO ZOE CODES for saving my life by realizing i need to handle this area rppropriately
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
};

// fineApp.updateBoard()
// updates the current board and opens win/game over modals
fineApp.updateBoard = () => {
    window.requestAnimationFrame(function() {
        // clear the fcking container so all the tiles that have been turned null dissapear
        fineApp.clearContainer(fineApp.tileContainer);

        fineApp.grid.cells.forEach(function(col) {
            col.forEach(function (cell) {
                // if cell is not null, add to board
                if (cell) {
                    fineApp.addTileToBoard(cell);
                }
            });
        });
        // update win
        if (fineApp.gameWon) {
            thinDing.play();
            // Allow user to tweet their final score
            $('#tweet').attr({
                href: 'https://twitter.com/intent/tweet?text="I just got Juicy in ' + fineApp.minutes +  'm ' +  fineApp.seconds + "s" + ' with @shangniwho_\'s 🍑 Juicy Jostle! Think you can get Juicy faster? 💪 bit.ly/2AHKG5O"',
                target: '_blank'
            }).addClass('').text('tweet your score!');

            fineApp.winnerModalOpen();
            console.log("you won!");
        }

        // update game over
        if (fineApp.gameOver) {
            thud.play();
            fineApp.gameOverModalOpen();
            console.log("game over!");
        }

    });
};

// fineApp.clearContainer(container);
// clear out a HTML container
fineApp.clearContainer = container => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

// fineApp.startTimer();
// starts timing for the game
fineApp.startTimer = () => {
    fineApp.interval = setInterval(function () {
        fineApp.seconds++;

        fineApp.time.innerHTML = fineApp.minutes + "m " + fineApp.seconds + "s";
        if (fineApp.seconds == 60) {
            fineApp.minutes++;
            fineApp.seconds = 0;
        }

        if (fineApp.minutes == 60) {
            alert("You have taken 1 hour to play this game! Ridiculous!");
        }
    }, 750);
}

// fineApp.winModalOpen();
// opens winner modal upon win
fineApp.winnerModalOpen = () => {
    const finalTime = fineApp.time.textContent;
    fineApp.finalTimes.innerHTML = finalTime;
    clearInterval(fineApp.interval);
    setTimeout(function () {
        fineApp.winModal[0].classList.add("show");
    }, 600);
}

// fineApp.gameOverModalOpen();
// opens game over modal upon win
fineApp.gameOverModalOpen = () => {
    clearInterval(fineApp.interval);
    setTimeout(function () {
        fineApp.gameOverModal[0].classList.add("show");
    }, 600);
}

// fineApp.restart();
// restarts game when the restart button is clicked
fineApp.restart = () => {
    fineApp.seconds = 0;
    fineApp.minutes = 0;
    fineApp.time.innerHTML = fineApp.minutes + "m " + fineApp.seconds + "s";
    clearInterval(fineApp.interval);
    fineApp.gameWon = false;
    fineApp.gameOver = false;
    fineApp.startTimer();
    fineApp.grid.buildGrid();
    fineApp.grid.addStartTiles();
    fineApp.updateBoard();
}

// initialize
fineApp.init = () => {
    // reset game
    fineApp.gameOver = false;
    fineApp.gameWon = false;

    // build empty grid
    fineApp.grid.buildGrid();
    console.log(`building grid`);
    fineApp.grid.addStartTiles();

    fineApp.keyListen = new KeyboardInput();
    fineApp.keyListen.listen();
    fineApp.updateBoard();
    fineApp.startTimer();

    // event listeners
    $('.juicy-button').on('mouseover', function () {
        squish.play();
    })
    $('.fa-sync-alt').on('mousedown', function () {
        squish.play();
    })
    $('.tweet-line').on('mouseover', function () {
        tweeter.play();
    });

    $('.fa-question').on('click', function (e) {
        fineApp.questionModal.addClass('show');
    });

    $('.fa-heart').on('click', function (e) {
        fineApp.heartModal.addClass('show');
    });

    $('.fa-sync-alt').on('click', fineApp.restart);

    $('.index-times').on('click', function () {
        fineApp.questionModal[0].classList.remove('show');
        fineApp.heartModal[0].classList.remove('show');
    })


    $('.fa-times').on('click', function () {
        fineApp.winModal[0].classList.remove('show');
        fineApp.gameOverModal[0].classList.remove('show');
        fineApp.questionModal[0].classList.remove('show');
        fineApp.heartModal[0].classList.remove('show');
    });
    fineApp.keyListen.on("move", fineApp.grid.move.bind(this));

    // add starting tiles to board
    console.log("start/reseting game");
}

// document.ready
$(function() {
    console.log("ready");
    fineApp.init();

    const pressed = [];
    const secretCode = 'winner';
    window.addEventListener('keyup', (e) => {
        pressed.push(e.key);
        pressed.splice(-secretCode.length - 1, pressed.length - secretCode);
        console.log(pressed);
        if (pressed.join('').includes(secretCode)) {
            console.log('DING DING!');
            fineApp.gameWon = true;
        }
    });

})
