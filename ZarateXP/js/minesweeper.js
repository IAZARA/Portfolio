// ============== BUSCAMINAS WINDOWS XP AUTÉNTICO ==============

class MinesweeperGame {
    constructor() {
        this.width = 9;
        this.height = 9;
        this.mineCount = 10;
        this.board = [];
        this.gameState = 'playing'; // playing, won, lost
        this.firstClick = true;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameField = null;
        this.faceButton = null;
        this.face = null;
        this.mineCounterElements = {};
        this.timerElements = {};
        
        // Bind methods
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellRightClick = this.handleCellRightClick.bind(this);
        this.handleFaceClick = this.handleFaceClick.bind(this);
        this.handleCellMouseDown = this.handleCellMouseDown.bind(this);
        this.handleCellMouseUp = this.handleCellMouseUp.bind(this);
        this.handleCellMouseEnter = this.handleCellMouseEnter.bind(this);
        this.handleCellMouseLeave = this.handleCellMouseLeave.bind(this);
    }
    
    init() {
        this.gameField = document.getElementById('game-field');
        this.faceButton = document.getElementById('face-btn');
        this.face = document.getElementById('face');
        
        // Elementos del contador de minas
        this.mineCounterElements = {
            hundreds: document.getElementById('mine-hundreds'),
            tens: document.getElementById('mine-tens'),
            ones: document.getElementById('mine-ones')
        };
        
        // Elementos del temporizador
        this.timerElements = {
            hundreds: document.getElementById('timer-hundreds'),
            tens: document.getElementById('timer-tens'),
            ones: document.getElementById('timer-ones')
        };
        
        // Event listeners
        this.faceButton.addEventListener('click', this.handleFaceClick);
        
        // Prevenir menú contextual en toda la ventana
        document.getElementById('minesweeper-window').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        this.initGame();
    }
    
    initGame() {
        this.gameState = 'playing';
        this.firstClick = true;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        
        // Limpiar temporizador
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Actualizar UI
        this.updateFace('happy');
        this.updateMineCounter();
        this.updateTimer();
        
        // Inicializar tablero
        this.initBoard();
        this.renderBoard();
    }
    
    initBoard() {
        this.board = [];
        for (let y = 0; y < this.height; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.board[y][x] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    isQuestionMark: false,
                    neighborMines: 0,
                    x: x,
                    y: y
                };
            }
        }
    }
    
    placeMines(excludeX, excludeY) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mineCount) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            // No colocar mina en la primera celda clickeada ni en celdas ya minadas
            if ((x === excludeX && y === excludeY) || this.board[y][x].isMine) {
                continue;
            }
            
            this.board[y][x].isMine = true;
            minesPlaced++;
        }
        
        // Calcular números
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.board[y][x].isMine) {
                    this.board[y][x].neighborMines = this.countNeighborMines(x, y);
                }
            }
        }
    }
    
    countNeighborMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    if (this.board[ny][nx].isMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    renderBoard() {
        this.gameField.innerHTML = '';
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Event listeners
                cell.addEventListener('click', this.handleCellClick);
                cell.addEventListener('contextmenu', this.handleCellRightClick);
                cell.addEventListener('mousedown', this.handleCellMouseDown);
                cell.addEventListener('mouseup', this.handleCellMouseUp);
                cell.addEventListener('mouseenter', this.handleCellMouseEnter);
                cell.addEventListener('mouseleave', this.handleCellMouseLeave);
                
                this.gameField.appendChild(cell);
                this.updateCell(x, y);
            }
        }
    }
    
    updateCell(x, y) {
        const cell = this.gameField.children[y * this.width + x];
        const cellData = this.board[y][x];
        
        // Limpiar clases
        cell.className = 'cell';
        cell.innerHTML = '';
        
        if (cellData.isFlagged) {
            cell.classList.add('flagged');
            const flag = document.createElement('div');
            flag.className = 'flag-icon';
            cell.appendChild(flag);
        } else if (cellData.isQuestionMark) {
            const question = document.createElement('div');
            question.className = 'question-icon';
            question.textContent = '?';
            cell.appendChild(question);
        } else if (cellData.isRevealed) {
            cell.classList.add('revealed');
            
            if (cellData.isMine) {
                cell.classList.add('mine');
                const mine = document.createElement('div');
                mine.className = 'mine-icon';
                cell.appendChild(mine);
            } else if (cellData.neighborMines > 0) {
                cell.classList.add(`number-${cellData.neighborMines}`);
                cell.textContent = cellData.neighborMines;
            }
        }
    }
    
    handleCellClick(e) {
        if (this.gameState !== 'playing') return;
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const cell = this.board[y][x];
        
        if (cell.isFlagged || cell.isQuestionMark) return;
        
        // Primer clic: colocar minas
        if (this.firstClick) {
            this.placeMines(x, y);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealCell(x, y);
        this.updateFace('happy');
        
        // Verificar condiciones de victoria/derrota
        this.checkGameState();
    }
    
    handleCellRightClick(e) {
        e.preventDefault();
        
        if (this.gameState !== 'playing') return;
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const cell = this.board[y][x];
        
        if (cell.isRevealed) return;
        
        // Ciclo: normal -> bandera -> interrogación -> normal
        if (!cell.isFlagged && !cell.isQuestionMark) {
            cell.isFlagged = true;
            this.flagCount++;
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.isQuestionMark = true;
            this.flagCount--;
        } else if (cell.isQuestionMark) {
            cell.isQuestionMark = false;
        }
        
        this.updateCell(x, y);
        this.updateMineCounter();
    }
    
    handleCellMouseDown(e) {
        if (this.gameState !== 'playing') return;
        if (e.button === 2) return; // Botón derecho
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const cell = this.board[y][x];
        
        if (!cell.isFlagged && !cell.isQuestionMark && !cell.isRevealed) {
            this.updateFace('scared');
        }
    }
    
    handleCellMouseUp(e) {
        if (this.gameState !== 'playing') return;
        this.updateFace('happy');
    }
    
    handleCellMouseEnter(e) {
        if (this.gameState !== 'playing') return;
        // Agregar efecto hover si es necesario
    }
    
    handleCellMouseLeave(e) {
        if (this.gameState !== 'playing') return;
        this.updateFace('happy');
    }
    
    revealCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        
        const cell = this.board[y][x];
        if (cell.isRevealed || cell.isFlagged || cell.isQuestionMark) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        if (cell.isMine) {
            this.gameState = 'lost';
            this.updateFace('dead');
            this.revealAllMines();
            this.stopTimer();
            return;
        }
        
        this.updateCell(x, y);
        
        // Si no hay minas vecinas, revelar celdas adyacentes
        if (cell.neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    this.revealCell(x + dx, y + dy);
                }
            }
        }
    }
    
    revealAllMines() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.board[y][x];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isRevealed = true;
                    this.updateCell(x, y);
                }
                // Marcar banderas incorrectas
                if (cell.isFlagged && !cell.isMine) {
                    const cellElement = this.gameField.children[y * this.width + x];
                    cellElement.classList.add('mine-wrong');
                }
            }
        }
    }
    
    checkGameState() {
        if (this.gameState !== 'playing') return;
        
        // Victoria: todas las celdas no-mina reveladas
        const totalCells = this.width * this.height;
        const nonMineCells = totalCells - this.mineCount;
        
        if (this.revealedCount === nonMineCells) {
            this.gameState = 'won';
            this.updateFace('win');
            this.stopTimer();
            
            // Colocar banderas automáticamente en las minas restantes
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.board[y][x];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        this.flagCount++;
                        this.updateCell(x, y);
                    }
                }
            }
            this.updateMineCounter();
        }
    }
    
    handleFaceClick() {
        this.initGame();
    }
    
    updateFace(state) {
        this.face.className = `face face-${state}`;
    }
    
    updateMineCounter() {
        const remaining = this.mineCount - this.flagCount;
        const displayValue = Math.max(-99, Math.min(999, remaining));
        
        const hundreds = Math.floor(Math.abs(displayValue) / 100);
        const tens = Math.floor((Math.abs(displayValue) % 100) / 10);
        const ones = Math.abs(displayValue) % 10;
        
        this.mineCounterElements.hundreds.textContent = displayValue < 0 ? '-' : hundreds;
        this.mineCounterElements.tens.textContent = displayValue < 0 && Math.abs(displayValue) < 100 ? '-' : tens;
        this.mineCounterElements.ones.textContent = ones;
    }
    
    updateTimer() {
        const displayValue = Math.min(999, this.timer);
        
        const hundreds = Math.floor(displayValue / 100);
        const tens = Math.floor((displayValue % 100) / 10);
        const ones = displayValue % 10;
        
        this.timerElements.hundreds.textContent = hundreds;
        this.timerElements.tens.textContent = tens;
        this.timerElements.ones.textContent = ones;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
            
            if (this.timer >= 999) {
                this.stopTimer();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

// Hacer la clase disponible globalmente
window.MinesweeperGame = MinesweeperGame;

// Auto-inicializar si ya está cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('minesweeper-window')) {
        const game = new MinesweeperGame();
        game.init();
    }
});