class Tile {
    // Public instance fields
    row;
    col;
    face;
    isFaceUp;
    size;
    x;
    y;

    constructor(row, col, face, marginedSize) {
        this.row = row;
        this.col = col;
        this.face = face;
        this.isFaceUp = false;
        this.updateSize(marginedSize);
    }

    updateSize(marginedSize) {
        this.size = marginedSize - 2 * Gameboard.margin;
        this.x = this.col * marginedSize + Gameboard.margin;
        this.y = this.row * marginedSize + Gameboard.margin;
    }
}

class Gameboard {
    // Public instance fields
    numRows;
    numCols;
    marginedSize;

    // Private instance fields
    #tileFaces;
    #tiles;

    // Public static fields
    static margin = 8;

    // Private static fields
    static #availableImages;
    static #imgNames = [
        'earth-america',
        'barn-owl',
        'canadian-goose',
        'mushroom-gills',
        'pie-slice',
        'island',
        'carnivorous-plant',
        'spiked-dragon-head',
        'triceratops-head',
        'dimetrodon',
        'plesiosaurus',
        'diplodocus',
        'tortoise',
        'trireme',
        'surfer-van',
        'race-car',
        'space-shuttle',
        'lunar-module',
        'hang-glider',
        'twister',
        'commercial-airplane',
        'cricket',
        'wasp-sting',
        'koala',
        'pig',
        'jellyfish',
        'pinata',
        'parmecia',
        'sheep',
        'pangolin',
        'giant-squid',
        'chicken',
        'pineapple',
        'robot-golem',
        'flatfish',
        'prank-glasses',
        'socks',
        'eyeball',
        'wave-surfer',
        'roller-skate',
        'shark-bite'
    ];

    constructor(level) {
        this.#setBoardSize(level);
        this.#setTileSize();
        canvasDraw.buildCanvas(this.numCols, this.marginedSize);
        this.#selectImages();
        this.#generateTiles();

        // Detects window resize, calculates new (margined) tile size, redraws canvas, redraws tiles
        window.addEventListener('resize', () => {
            this.#setTileSize();
            canvasDraw.buildCanvas(this.numCols, this.marginedSize);
            this.#resizeTiles(this.marginedSize);
        });
    }

    getTile(row, col) {
        return this.#tiles[row][col];
    }

    // Passes all tiles to canvas object to draw the win animation
    clearTilesWin() {
        canvasDraw.drawWin(this.#tiles);
    }

    #setBoardSize(level) {
        switch(level) {
            case 'easy':
                this.numRows = 4;
                this.numCols = 8;
                break;
            case 'medium':
                this.numRows = 5;
                this.numCols = 10;
                break;
            case 'hard':
                this.numRows = 6;
                this.numCols = 12;
                break;
        }
    }

    // Tiles + margins sized such that gameboard will always occupy at maximum 60% of screen height
    #setTileSize() {
        this.marginedSize = Math.floor(0.6 * window.innerHeight / this.numRows);
    }

    // Triggered when window resize event is detected and after new tile size is calculated and canvas resized
    // Updates each tile with new size and xy-coords, redraws on new canvas
    #resizeTiles(newSize) {
        this.marginedSize = newSize;
        for(let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.#tiles[row][col];
                tile.updateSize(this.marginedSize); 
                canvasDraw.toggleShadow(true);
                canvasDraw.drawTile(tile);
            }
        }
    }

    // Selects and shuffles tile faces by selecting images randomly from array of loaded available images
    #selectImages() {
        // Selects random indexes and adds to set (preventing duplicates) until selected indexes equal number of matches
        let chosenIndexes = new Set();
        while(chosenIndexes.size < this.numRows * this.numCols / 2) {
            let randomIndex = Math.floor(Math.random() * Gameboard.#availableImages.length);
            chosenIndexes.add(randomIndex);
        }

        // For each index chosen, add its corresponding image twice to tile faces array
        let chosenImages = [...chosenIndexes].map(index => { return Gameboard.getImage(index) });
        this.#tileFaces = [...chosenImages, ...chosenImages];

        // Shuffle the array using Fisher-Yates method
        for(let i = this.#tileFaces.length - 1; i >= 0; i--) {
            let ind = Math.ceil(Math.random() * i);
            [this.#tileFaces[ind], this.#tileFaces[i]] = [this.#tileFaces[i], this.#tileFaces[ind]];
        }
    }

    // Creates array of all tiles based on Tile constructor, drawing each to canvas
    #generateTiles() {
        this.#tiles = [];
        for(let row = 0; row < this.numRows; row++) {
            this.#tiles[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                let tile = new Tile(row, col, this.#tileFaces.pop(), this.marginedSize);
                this.#tiles[row][col] = tile;
                canvasDraw.toggleShadow(true);
                canvasDraw.drawTile(tile);
            }
        }
    }

    // Called once on window load--first loads all images, then resets the game to build the gameboard
    // Promise chain to force waiting for asynchronous image loading before drawing gameboard
    // Could also be accomplished with static initialization block and no load event listener, but these are not supported in Safari
    static initialize() {
        Gameboard.#getImages().then(game.resetGame).catch(error => { console.log(error) });
    }

    // Getter to allow instances to access total number of available images on parent class
    static getTotalImages() {
        return this.#availableImages.length;
    }

    // Gettter to allow instances to access individual images on parent class
    static getImage(index) {
        return this.#availableImages[index];
    }

    // Called from initialize() function on window load, creates images from png files
    static async #getImages(){
        // Creates an array of promises for each image, each resolves when the image loads
        // If error is thrown for any promise in the images map, it will be caught by the initialize function
        this.#availableImages = await Promise.all(this.#imgNames.map(imgName => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => { resolve(img) };
                img.onerror = () => { reject(`could not load image: ${imgName}.png`) }
                img.src = `images/${imgName}.png`;
            });
        }));
    }
}

const game = (function() {

    // Private variables
    let numTries;
    let numMatches;
    let guess;
    let board;
    const reset = document.getElementById('reset-btn');
    const levelRadios = document.querySelectorAll('input[name="level"]');
    let triesDisplay = document.getElementById('tries-display');

    reset.addEventListener('click', resetGame);
    levelRadios.forEach(radio => {
        radio.addEventListener('change', resetGame);
    });

    return {
        resetGame,
        clicked
    }

    // Called from initialize function (after image load) on window load or any time the reset button is clicked
    function resetGame() {

        // Instantiates new instance of Gameboard based on level
        let level = document.querySelector('input[name="level"]:checked').value;
        board = new Gameboard(level);

        // Resets initial guess, tries, and matches counters and corresponding DOM elements
        guess = null;
        numTries = numMatches = 0;
        triesDisplay.innerText = numTries;
    }

    // Accepts click event, determines which tile was clicked and passes it to private flip logic function
    function clicked(event) {
        if(event.offsetY < board.marginedSize * board.numRows) {
            let row = Math.floor(event.offsetY / board.marginedSize);
            let col = Math.floor(event.offsetX / board.marginedSize);
            let tile = board.getTile(row, col);
            if(!tile.isFaceUp) _flipLogic(tile);
        }
    }

    // Accepts tile that was clicked
    function _flipLogic(tile) {
        tile.isFaceUp = true;
        canvasDraw.drawTile(tile);
        
        // If guess variable already contains a tile (another tile was flipped), check if it matches the clicked tile
        // Otherwise, assign the clicked tile to the guess variable
        if(guess) {
            if(guess.face === tile.face) {
                numMatches++; // Match found, increment match count
                // If all matches found, cue win animation
                if(numMatches >= board.numRows * board.numCols / 2) board.clearTilesWin(); 
            } else {
                let temp = guess; // Remember the first clicked tile for timeout before resetting guess variable
                // In one second, flip both cards back over since they did not match
                setTimeout(() => {
                    tile.isFaceUp = temp.isFaceUp = false;
                    canvasDraw.drawTile(tile);
                    canvasDraw.drawTile(temp);
                }, 1000);
            }
            triesDisplay.innerText = ++numTries; // Increment tries and update display, whether or not tiles matched
            guess = null; // Reset guess variable for next match attempt
        } else guess = tile;
    };
})();

const canvasDraw = (function() {

    // Private variables
    const canvas = document.getElementById('board-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.addEventListener('click', game.clicked);

    return {
        buildCanvas,
        toggleShadow,
        drawTile,
        drawWin
    };

    // Once board size has been defined, set canvas width to fit all tiles
    function buildCanvas(cols, marginedSize) {
        let width = cols * marginedSize + 10; // Extra width to account for shadow X offset
        // No height calculation, height is fixed

        // The following resizes the canvas to account for higher pixel densities
        // Withtout these steps, canvas appears blurry on retina displays
        const dpr = window.devicePixelRatio; // Ratio of physical pixels to virtual pixels, DPR = 2 for retina displays, 1 for standard
        
        // Sets the canvas size to total number of physical pixels in desired virtual width/height
        canvas.width = width * dpr;
        canvas.height = 0.8 * window.innerHeight * dpr; // Extend canvas to bottom of view for tile drop animation

        // Sets the canvas element size to desired width/height of virtual pixels (CSS accounts for DPR, Canvas does not)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${0.8 * window.innerHeight}px`;
        document.getElementById('toolbar-div').style.width = `${width}px`; // Toolbar should line up with canvas

        // Scales the context to fill element size
        ctx.scale(dpr, dpr);
    };

    function drawTile(tile) {
        const radius = Math.floor(tile.size / 10);
        let color = tile.isFaceUp ? [58, 75, 91] : [125, 156, 184];

        // Draws rectangle with rounded corners. roundRect() method not supported in Firefox
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.beginPath();
        ctx.moveTo(tile.x, tile.y);
        ctx.arcTo(tile.x + tile.size, tile.y, tile.x + tile.size, tile.y + tile.size, radius);
        ctx.arcTo(tile.x + tile.size, tile.y + tile.size, tile.x, tile.y + tile.size, radius);
        ctx.arcTo(tile.x, tile.y + tile.size, tile.x, tile.y, radius);
        ctx.arcTo(tile.x, tile.y, tile.x + tile.size, tile.y, radius);
        ctx.fill();

        toggleShadow(false);
        if(tile.isFaceUp) ctx.drawImage(tile.face, tile.x, tile.y, tile.size, tile.size);
    };

    // Shadow only drawn when tiles first drawn (otherwise they layer)
    function toggleShadow(shadowOn) {
        ctx.shadowColor = shadowOn ? 'rgb(106, 126, 142)' : 'transparent';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = ctx.shadowOffsetY = 12;
    }

    // Called when game has been won, cues animation
    function drawWin(tiles) {
        requestAnimationFrame(() => { _dropTiles(tiles) })
    };

    // Animation to drop tiles when game is won. Each row drops after a delay
    function _dropTiles(tiles, t = 0) {
        let accel = 0.01;
        let delay = 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < tiles.length; i++) {
            let row = tiles[tiles.length - 1 - i]; // Starting with last row
            let newRowY = row[0].y + accel * (t - delay * i) ** 2; // Modified equation of linear motion
            for(let tile of row) {
                if(t >= delay * i) tile.y = newRowY;
                toggleShadow(true);
                drawTile(tile);    
            }
        }
        if(tiles[0][0].y < screen.height) requestAnimationFrame(() => { _dropTiles(tiles, ++t) });
    };
})();

window.addEventListener('load', Gameboard.initialize);