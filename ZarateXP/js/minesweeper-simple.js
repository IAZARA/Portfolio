// Game variables
const ROWS = 9;
const COLS = 9;
const MINES = 10;

let board = [];
let gameState = 'playing';
let firstClick = true;
let mines = MINES;
let timer = 0;
let timerInterval = null;
let flags = mines;

// Initialize the game
function initMinesweeperGame() {
    console.log('Initializing minesweeper with hardcoded cells...');
    
    // Get elements
    const gameBoard = document.getElementById('gameBoard');
    const mineCountDisplay = document.getElementById('mineCountDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const resetButton = document.getElementById('resetButton');
    const cells = document.querySelectorAll('.cell');
    
    if (!gameBoard || !mineCountDisplay || !timerDisplay || !resetButton) {
        console.error('Required elements not found');
        return;
    }
    
    console.log('Found', cells.length, 'cells');
    
    // Initialize board data
    initBoard();
    
    // Add event listeners to existing cells
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        cell.addEventListener('click', () => handleClick(row, col));
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleRightClick(row, col);
        });
    });
    
    // Add reset button listener
    resetButton.addEventListener('click', resetGame);
    
    // Prevent context menu on game board
    gameBoard.addEventListener('contextmenu', e => e.preventDefault());
    
    console.log('Game initialized successfully!');
}

function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
}

function placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        
        if (!board[r][c].isMine && !(r === excludeRow && c === excludeCol)) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }
    calculateNumbers();
}

function calculateNumbers() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c].isMine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                            if (board[nr][nc].isMine) count++;
                        }
                    }
                }
                board[r][c].neighborMines = count;
            }
        }
    }
}

function handleClick(row, col) {
    if (gameState !== 'playing' || board[row][col].isFlagged) return;
    
    if (firstClick) {
        placeMines(row, col);
        firstClick = false;
        startTimer();
    }
    
    revealCell(row, col);
    updateDisplay();
}

function handleRightClick(row, col) {
    if (gameState !== 'playing' || board[row][col].isRevealed) return;
    
    if (board[row][col].isFlagged) {
        board[row][col].isFlagged = false;
        flags++;
    } else if (flags > 0) {
        board[row][col].isFlagged = true;
        flags--;
    }
    updateDisplay();
}

function revealCell(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;
    
    board[row][col].isRevealed = true;
    
    if (board[row][col].isMine) {
        gameState = 'lost';
        stopTimer();
        revealAllMines();
        return;
    }
    
    if (board[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(row + dr, col + dc);
            }
        }
    }
    
    checkWin();
}

function revealAllMines() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c].isMine) {
                board[r][c].isRevealed = true;
            }
        }
    }
}

function checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c].isRevealed && !board[r][c].isMine) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === (ROWS * COLS) - MINES) {
        gameState = 'won';
        stopTimer();
    }
}

function updateDisplay() {
    const mineCountDisplay = document.getElementById('mineCountDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const cells = document.querySelectorAll('.cell');
    
    if (mineCountDisplay) mineCountDisplay.textContent = String(flags).padStart(3, '0');
    if (timerDisplay) timerDisplay.textContent = String(timer).padStart(3, '0');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellData = board[row][col];
        
        cell.className = 'cell';
        cell.textContent = '';
        
        if (cellData.isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        } else if (cellData.isRevealed) {
            cell.classList.add('revealed');
            if (cellData.isMine) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (cellData.neighborMines > 0) {
                cell.textContent = cellData.neighborMines;
                cell.dataset.value = cellData.neighborMines;
            }
        }
    });
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) timerDisplay.textContent = String(timer).padStart(3, '0');
        if (timer >= 999) stopTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetGame() {
    gameState = 'playing';
    firstClick = true;
    timer = 0;
    flags = mines;
    stopTimer();
    initBoard();
    updateDisplay();
}

console.log('Minesweeper script loaded successfully!');