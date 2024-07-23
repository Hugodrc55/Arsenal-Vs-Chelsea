        const player1 = document.getElementById('player1');
        const player2 = document.getElementById('player2');
        const ball = document.getElementById('ball');
        const scoreElement = document.getElementById('score');
        const goalAnimation = document.getElementById('goal-animation');
        const winnerMessage = document.getElementById('winner-message');
        let score = [0, 0];
        
        const PLAYER_RADIUS = 20;
        const BALL_RADIUS = 15;
        const PLAYER_MASS = 10;
        const BALL_MASS = 1;
        const FRICTION = 0.98;
        const RESTITUTION = 0.8;
        const WINNING_SCORE = 3;
        const MAX_SPEED = 4;
        const ACCELERATION = 0.4;
        const DECELERATION = 0.2;

        class Entity {
            constructor(element, x, y, radius, mass) {
                this.element = element;
                this.initialPosition = { x, y };
                this.position = { x, y };
                this.velocity = { x: 0, y: 0 };
                this.radius = radius;
                this.mass = mass;
            }

            update() {
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                this.constrainToBounds();
                this.render();
            }

            constrainToBounds() {
                if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= 800) {
                    this.velocity.x *= -RESTITUTION;
                    this.position.x = Math.max(this.radius, Math.min(800 - this.radius, this.position.x));
                }
                if (this.position.y - this.radius <= 0 || this.position.y + this.radius >= 400) {
                    this.velocity.y *= -RESTITUTION;
                    this.position.y = Math.max(this.radius, Math.min(400 - this.radius, this.position.y));
                }
            }

            render() {
                this.element.style.left = `${this.position.x - this.radius}px`;
                this.element.style.top = `${400 - this.position.y - this.radius}px`;
            }

            applyFriction() {
                this.velocity.x *= FRICTION;
                this.velocity.y *= FRICTION;
            }

            reset() {
                this.position = { ...this.initialPosition };
                this.velocity = { x: 0, y: 0 };
            }
        }

        const players = [
            new Entity(player1, 50, 200, PLAYER_RADIUS, PLAYER_MASS),
            new Entity(player2, 750, 200, PLAYER_RADIUS, PLAYER_MASS)
        ];

        const ballEntity = new Entity(ball, 400, 200, BALL_RADIUS, BALL_MASS);
        let ballRotation = 0;

        const keys = {
            player1: { up: false, down: false, left: false, right: false },
            player2: { up: false, down: false, left: false, right: false }
        };

        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'z': keys.player1.up = true; break;
                case 's': keys.player1.down = true; break;
                case 'q': keys.player1.left = true; break;
                case 'd': keys.player1.right = true; break;
                case 'ArrowUp': keys.player2.up = true; break;
                case 'ArrowDown': keys.player2.down = true; break;
                case 'ArrowLeft': keys.player2.left = true; break;
                case 'ArrowRight': keys.player2.right = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'z': keys.player1.up = false; break;
                case 's': keys.player1.down = false; break;
                case 'q': keys.player1.left = false; break;
                case 'd': keys.player1.right = false; break;
                case 'ArrowUp': keys.player2.up = false; break;
                case 'ArrowDown': keys.player2.down = false; break;
                case 'ArrowLeft': keys.player2.left = false; break;
                case 'ArrowRight': keys.player2.right = false; break;
            }
        });

        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Z': keys.player1.up = true; break;
                case 'S': keys.player1.down = true; break;
                case 'Q': keys.player1.left = true; break;
                case 'D': keys.player1.right = true; break;
                case 'ArrowUp': keys.player2.up = true; break;
                case 'ArrowDown': keys.player2.down = true; break;
                case 'ArrowLeft': keys.player2.left = true; break;
                case 'ArrowRight': keys.player2.right = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'Z': keys.player1.up = false; break;
                case 'S': keys.player1.down = false; break;
                case 'Q': keys.player1.left = false; break;
                case 'D': keys.player1.right = false; break;
                case 'ArrowUp': keys.player2.up = false; break;
                case 'ArrowDown': keys.player2.down = false; break;
                case 'ArrowLeft': keys.player2.left = false; break;
                case 'ArrowRight': keys.player2.right = false; break;
            }
        });

        function updatePlayerMovement() {
            players.forEach((player, index) => {
                const playerKeys = index === 0 ? keys.player1 : keys.player2;
                
                if (playerKeys.up) player.velocity.y += ACCELERATION;
                if (playerKeys.down) player.velocity.y -= ACCELERATION;
                if (playerKeys.left) player.velocity.x -= ACCELERATION;
                if (playerKeys.right) player.velocity.x += ACCELERATION;

                if (!playerKeys.up && !playerKeys.down) {
                    player.velocity.y *= 1 - DECELERATION;
                }
                if (!playerKeys.left && !playerKeys.right) {
                    player.velocity.x *= 1 - DECELERATION;
                }

                const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
                if (speed > MAX_SPEED) {
                    const ratio = MAX_SPEED / speed;
                    player.velocity.x *= ratio;
                    player.velocity.y *= ratio;
                }
            });
        }

        function checkCollision(entity1, entity2) {
            const dx = entity1.position.x - entity2.position.x;
            const dy = entity1.position.y - entity2.position.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < entity1.radius + entity2.radius) {
                const collisionNormal = {
                    x: dx / distance,
                    y: dy / distance
                };

                const relativeVelocity = {
                    x: entity1.velocity.x - entity2.velocity.x,
                    y: entity1.velocity.y - entity2.velocity.y
                };

                const velocityAlongNormal = relativeVelocity.x * collisionNormal.x + relativeVelocity.y * collisionNormal.y;

                if (velocityAlongNormal > 0) return;

                const impulseStrength = -(1 + RESTITUTION) * velocityAlongNormal;
                const impulse = impulseStrength / (1 / entity1.mass + 1 / entity2.mass);

                entity1.velocity.x += (impulse * collisionNormal.x) / entity1.mass;
                entity1.velocity.y += (impulse * collisionNormal.y) / entity1.mass;

                entity2.velocity.x -= (impulse * collisionNormal.x) / entity2.mass;
                entity2.velocity.y -= (impulse * collisionNormal.y) / entity2.mass;

                const separationDistance = (entity1.radius + entity2.radius - distance) / 2;
                entity1.position.x += separationDistance * collisionNormal.x;
                entity1.position.y += separationDistance * collisionNormal.y;
                entity2.position.x -= separationDistance * collisionNormal.x;
                entity2.position.y -= separationDistance * collisionNormal.y;
            }
        }

        function checkGoal() {
            if (ballEntity.position.x <= BALL_RADIUS && ballEntity.position.y >= 150 && ballEntity.position.y <= 250) {
                score[1]++;
                showGoalAnimation();
                checkWinner();
                resetPositions();
            } else if (ballEntity.position.x >= 800 - BALL_RADIUS && ballEntity.position.y >= 150 && ballEntity.position.y <= 250) {
                score[0]++;
                showGoalAnimation();
                checkWinner();
                resetPositions();
            }
        }

        function showGoalAnimation() {
            goalAnimation.style.opacity = '1';
            setTimeout(() => {
                goalAnimation.style.opacity = '0';
            }, 1500);
        }

        function resetPositions() {
            players.forEach(player => player.reset());
            ballEntity.reset();
        }

        function updateBallRotation() {
            ballRotation += Math.sqrt(ballEntity.velocity.x * ballEntity.velocity.x + ballEntity.velocity.y * ballEntity.velocity.y) * 2;
            ball.style.transform = `rotate(${ballRotation}deg)`;
        }

        function checkWinner() {
            if (score[0] >= WINNING_SCORE) {
                showWinnerMessage("Arsenal gagne !");
            } else if (score[1] >= WINNING_SCORE) {
                showWinnerMessage("Chelsea gagne !");
            }
        }

        function showWinnerMessage(message) {
            winnerMessage.textContent = message;
            winnerMessage.style.display = 'block';
            setTimeout(() => {
                winnerMessage.style.display = 'none';
                resetGame();
            }, 3000);
        }

        function resetGame() {
            score = [0, 0];
            resetPositions();
        }

        function gameLoop() {
            updatePlayerMovement();
            
            players.forEach(player => {
                player.update();
                player.applyFriction();
                checkCollision(player, ballEntity);
            });

            ballEntity.update();
            ballEntity.applyFriction();
            updateBallRotation();
            checkGoal();

            scoreElement.textContent = `Arsenal ${score[0]} - ${score[1]} Chelsea`;
            requestAnimationFrame(gameLoop);
        }

        gameLoop();