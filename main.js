class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.grew = false;
    }

    move() {
        this.direction = this.nextDirection;
        const head = { x: this.position[0].x + this.direction.x, y: this.position[0].y + this.direction.y };
        this.position.unshift(head);
        if (!this.grew) {
            this.position.pop();
        }
        this.grew = false;
    }

    grow() {
        this.grew = true;
    }

    checkCollision(width, height) {
        const head = this.position[0];
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            return true;
        }
        return this.position.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = 20;
        this.canvas.width = this.canvas.height = this.gridSize * this.tileCount;

        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameOver = false;

        this.bindEvents();
        this.updateHighScore();
        this.gameLoop();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.snake.direction.y !== 1) {
                        this.snake.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                    if (this.snake.direction.y !== -1) {
                        this.snake.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                    if (this.snake.direction.x !== 1) {
                        this.snake.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                    if (this.snake.direction.x !== -1) {
                        this.snake.nextDirection = { x: 1, y: 0 };
                    }
                    break;
                case ' ':
                    if (this.gameOver) {
                        this.restart();
                    }
                    break;
            }
        });
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.position.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update() {
        if (this.gameOver) return;

        this.snake.move();

        if (this.snake.checkCollision(this.tileCount, this.tileCount)) {
            this.handleGameOver();
            return;
        }

        if (this.snake.position[0].x === this.food.x && this.snake.position[0].y === this.food.y) {
            this.snake.grow();
            this.food = this.generateFood();
            this.score += 10;
            this.updateScore();
        }
    }

    draw() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.position.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#e74c3c' : '#e67e22';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    gameLoop() {
        this.update();
        this.draw();
        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), 100);
    }

    handleGameOver() {
        this.gameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
        document.getElementById('gameOver').classList.remove('hidden');
    }

    restart() {
        this.snake.reset();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
        document.getElementById('gameOver').classList.add('hidden');
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    updateHighScore() {
        document.getElementById('highScoreValue').textContent = this.highScore;
    }
}

window.onload = () => new Game();