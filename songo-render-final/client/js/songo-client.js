/**
 * Songo V2 - Client-side Game Logic & AJAX Communication
 * Handles game rendering, user interaction, and server communication
 * Uses XMLHttpRequest via AjaxManager (NOT fetch)
 */

'use strict';

class SongoClient {
    /**
     * Initialize the Songo game client
     */
    constructor() {
        // AJAX manager for server communication
        this.ajax = new AjaxManager({
            timeout: 10000,
            maxRetries: 2,
            retryDelay: 1000
        });

        // Game session data
        this.roomCode = null;
        this.sessionId = null;
        this.playerNumber = null;
        this.gameState = null;

        // Polling state
        this.statePollId = null;
        this.connectionPollId = null;
        this.opponentConnected = true;

        // UI state
        this.isMyTurn = false;
        this.isProcessing = false;
        this.lastMoveHole = null;

        // Initialize the client
        this._bindEvents();
        this._showScreen('connection');
    }

    // =====================================================
    // EVENT BINDING
    // =====================================================

    /**
     * Bind all DOM event listeners
     */
    _bindEvents() {
        // Connection screen buttons
        document.getElementById('btn-create-room').addEventListener('click', () => this.createRoom());
        document.getElementById('btn-join-room').addEventListener('click', () => this.joinRoom());
        document.getElementById('input-room-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });

        // Auto-uppercase room code input
        document.getElementById('input-room-code').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });

        // Waiting screen
        document.getElementById('btn-cancel-waiting').addEventListener('click', () => this.cancelWaiting());

        // Game screen
        document.getElementById('btn-leave-game').addEventListener('click', () => this.leaveGame());

        // Game over screen
        document.getElementById('btn-play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('btn-back-menu').addEventListener('click', () => this.backToMenu());

        // Disconnect overlay
        document.getElementById('btn-quit-disconnected').addEventListener('click', () => this.leaveGame());

        // Error overlay
        document.getElementById('btn-error-close').addEventListener('click', () => {
            this._hideError();
        });

        // Hole click events (using event delegation)
        document.querySelector('.board').addEventListener('click', (e) => {
            const hole = e.target.closest('.hole');
            if (hole) {
                const holeIndex = parseInt(hole.dataset.hole, 10);
                this._handleHoleClick(holeIndex);
            }
        });

        // Handle page unload - notify server
        window.addEventListener('beforeunload', () => {
            if (this.roomCode && this.sessionId) {
                this._notifyLeave();
            }
        });

        // Handle visibility change - pause/resume polling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._pausePolling();
            } else {
                this._resumePolling();
            }
        });
    }

    // =====================================================
    // SCREEN MANAGEMENT
    // =====================================================

    /**
     * Show a specific screen and hide all others
     * @param {string} screenName - Screen to show: 'connection', 'waiting', 'game', 'gameover'
     */
    _showScreen(screenName) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(`screen-${screenName}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Hide overlays when changing screens
        this._hideDisconnect();
        this._hideError();
    }

    // =====================================================
    // ROOM MANAGEMENT (AJAX CALLS)
    // =====================================================

    /**
     * Create a new game room via AJAX POST
     */
    createRoom() {
        const btn = document.getElementById('btn-create-room');
        btn.disabled = true;
        btn.textContent = 'Création...';

        this.ajax.post('/api/create-room', {}, (success, data, message) => {
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-icon">🏠</span> Créer un salon';

            if (success && data) {
                this.roomCode = data.roomCode;
                this.sessionId = data.sessionId;
                this.playerNumber = data.playerNumber;

                // Show waiting screen
                document.getElementById('display-room-code').textContent = this.roomCode;
                document.getElementById('display-player-number').textContent = `Joueur ${this.playerNumber}`;
                this._showScreen('waiting');

                // Start polling for opponent
                this._startWaitingPoll();
            } else {
                this._showError(message || 'Impossible de créer le salon');
            }
        });
    }

    /**
     * Join an existing room via AJAX POST
     */
    joinRoom() {
        const roomCode = document.getElementById('input-room-code').value.trim();
        if (!roomCode) {
            this._showError('Veuillez entrer un code de salon');
            return;
        }

        if (roomCode.length < 4) {
            this._showError('Le code doit contenir au moins 4 caractères');
            return;
        }

        const btn = document.getElementById('btn-join-room');
        btn.disabled = true;
        btn.textContent = 'Connexion...';

        this.ajax.post('/api/join-room', { roomCode: roomCode }, (success, data, message) => {
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-icon">🚪</span> Rejoindre un salon';

            if (success && data) {
                this.roomCode = data.roomCode;
                this.sessionId = data.sessionId;
                this.playerNumber = data.playerNumber;

                if (data.gameStatus === 'playing') {
                    // Game is ready, go to game screen
                    this._showScreen('game');
                    this._updateGameDisplay();
                    this._startGamePoll();
                } else {
                    // Still waiting
                    document.getElementById('display-room-code').textContent = this.roomCode;
                    document.getElementById('display-player-number').textContent = `Joueur ${this.playerNumber}`;
                    this._showScreen('waiting');
                    this._startWaitingPoll();
                }
            } else {
                this._showError(message || 'Impossible de rejoindre le salon');
            }
        });
    }

    /**
     * Cancel waiting and leave the room
     */
    cancelWaiting() {
        this._stopAllPolling();

        if (this.roomCode && this.sessionId) {
            this.ajax.post('/api/leave-room', {
                roomCode: this.roomCode,
                sessionId: this.sessionId
            }, (success, data, message) => {
                // Ignore response, just go back to connection screen
            });
        }

        this._resetState();
        this._showScreen('connection');
    }

    /**
     * Leave the current game
     */
    leaveGame() {
        this._stopAllPolling();

        if (this.roomCode && this.sessionId) {
            this.ajax.post('/api/leave-room', {
                roomCode: this.roomCode,
                sessionId: this.sessionId
            }, () => {});
        }

        this._resetState();
        this._showScreen('connection');
    }

    /**
     * Notify server of leave (synchronous for beforeunload)
     */
    _notifyLeave() {
        if (this.roomCode && this.sessionId) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/leave-room', false); // synchronous
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({
                    roomCode: this.roomCode,
                    sessionId: this.sessionId
                }));
            } catch (e) {
                // Ignore errors on page unload
            }
        }
    }

    /**
     * Play again - go back to connection screen
     */
    playAgain() {
        this._resetState();
        this._showScreen('connection');
    }

    /**
     * Back to main menu
     */
    backToMenu() {
        this._resetState();
        this._showScreen('connection');
    }

    // =====================================================
    // GAME ACTIONS (AJAX CALLS)
    // =====================================================

    /**
     * Send a move to the server via AJAX POST
     * @param {number} holeIndex - The hole to pick seeds from
     */
    sendMove(holeIndex) {
        if (this.isProcessing) return;
        if (!this.isMyTurn) {
            this._showGameMessage("Ce n'est pas votre tour", 'warning');
            return;
        }

        this.isProcessing = true;
        this.lastMoveHole = holeIndex;

        this.ajax.post('/api/make-move', {
            roomCode: this.roomCode,
            sessionId: this.sessionId,
            holeIndex: holeIndex
        }, (success, data, message) => {
            this.isProcessing = false;

            if (success && data) {
                this.gameState = data;
                this._updateGameDisplay();

                if (data.moveResult && data.moveResult.captured > 0) {
                    this._showGameMessage(data.moveResult.message, 'success');
                    this._animateCapture(data.moveResult);
                } else if (data.moveResult) {
                    this._showGameMessage(data.moveResult.message, 'info');
                }

                // Check if game ended
                if (data.gameStatus === 'finished') {
                    this._handleGameOver(data);
                }
            } else {
                this._showGameMessage(message || 'Coup invalide', 'error');
            }
        });
    }

    /**
     * Poll the game state from the server via AJAX GET
     */
    pollState() {
        if (!this.roomCode || !this.sessionId) return;

        const url = AjaxManager.buildUrl('/api/game-state', {
            roomCode: this.roomCode,
            sessionId: this.sessionId
        });

        this.ajax.get(url, (success, data, message) => {
            if (success && data) {
                const previousState = this.gameState;
                this.gameState = data;

                // Check for opponent's move (board changed)
                if (previousState && previousState.board) {
                    const boardChanged = previousState.board.some((val, idx) => val !== data.board[idx]);
                    if (boardChanged) {
                        this._showGameMessage("L'adversaire a joué", 'info');
                    }
                }

                this._updateGameDisplay();

                // Check game status changes
                if (data.gameStatus === 'finished' && (!previousState || previousState.gameStatus !== 'finished')) {
                    this._handleGameOver(data);
                }

                // Check opponent connection
                if (data.opponentConnected === false) {
                    this._showDisconnect();
                } else {
                    this._hideDisconnect();
                }
            }
        });
    }

    /**
     * Check if the opponent is still connected via AJAX GET
     */
    checkConnection() {
        if (!this.roomCode || !this.sessionId) return;

        const url = AjaxManager.buildUrl('/api/check-connection', {
            roomCode: this.roomCode,
            sessionId: this.sessionId
        });

        this.ajax.get(url, (success, data, message) => {
            if (success && data) {
                if (data.opponentConnected) {
                    this._hideDisconnect();
                } else {
                    this._showDisconnect();
                }

                // If game ended due to disconnect
                if (data.gameStatus === 'finished') {
                    this.pollState(); // Get final state
                }
            }
        });
    }

    // =====================================================
    // POLLING MANAGEMENT
    // =====================================================

    /**
     * Start polling while waiting for opponent
     */
    _startWaitingPoll() {
        const url = AjaxManager.buildUrl('/api/game-state', {
            roomCode: this.roomCode,
            sessionId: this.sessionId
        });

        this.statePollId = this.ajax.poll(url, 2000, (success, data, message) => {
            if (success && data) {
                this.gameState = data;

                // Check if opponent joined
                if (data.gameStatus === 'playing') {
                    this._stopAllPolling();
                    this._showScreen('game');
                    this._updateGameDisplay();
                    this._startGamePoll();
                }

                // Check if both players are connected
                if (data.playersConnected && data.playersConnected[1] && data.playersConnected[2]) {
                    this._stopAllPolling();
                    this._showScreen('game');
                    this._updateGameDisplay();
                    this._startGamePoll();
                }
            }
        }, 'waiting-poll');
    }

    /**
     * Start game state polling (every 1 second)
     */
    _startGamePoll() {
        // Poll game state every 1 second
        this.statePollId = this.ajax.poll(
            AjaxManager.buildUrl('/api/game-state', {
                roomCode: this.roomCode,
                sessionId: this.sessionId
            }),
            1000,
            (success, data, message) => {
                if (success && data) {
                    const previousState = this.gameState;
                    this.gameState = data;

                    // Detect opponent move
                    if (previousState && previousState.board) {
                        const boardChanged = previousState.board.some((val, idx) => val !== data.board[idx]);
                        if (boardChanged && previousState.currentPlayer !== this.playerNumber) {
                            this._showGameMessage("L'adversaire a joué", 'info');
                        }
                    }

                    this._updateGameDisplay();

                    // Game ended
                    if (data.gameStatus === 'finished') {
                        this._stopAllPolling();
                        this._handleGameOver(data);
                    }

                    // Opponent connection
                    if (data.opponentConnected === false) {
                        this._showDisconnect();
                    } else {
                        this._hideDisconnect();
                    }
                }
            },
            'game-state-poll'
        );

        // Poll connection status every 5 seconds
        this.connectionPollId = this.ajax.poll(
            AjaxManager.buildUrl('/api/check-connection', {
                roomCode: this.roomCode,
                sessionId: this.sessionId
            }),
            5000,
            (success, data, message) => {
                if (success && data) {
                    if (data.opponentConnected) {
                        this._hideDisconnect();
                    } else {
                        this._showDisconnect();
                    }
                }
            },
            'connection-poll'
        );
    }

    /**
     * Stop all polling
     */
    _stopAllPolling() {
        this.ajax.stopAllPolls();
        this.statePollId = null;
        this.connectionPollId = null;
    }

    /**
     * Pause polling (when tab is hidden)
     */
    _pausePolling() {
        // Reduce polling frequency instead of stopping completely
        this.ajax.stopPoll('game-state-poll');
        this.ajax.stopPoll('connection-poll');

        // Start slow poll (5 seconds)
        if (this.roomCode && this.sessionId) {
            this.statePollId = this.ajax.poll(
                AjaxManager.buildUrl('/api/game-state', {
                    roomCode: this.roomCode,
                    sessionId: this.sessionId
                }),
                5000,
                (success, data, message) => {
                    if (success && data) {
                        this.gameState = data;
                        this._updateGameDisplay();
                        if (data.gameStatus === 'finished') {
                            this._stopAllPolling();
                        }
                    }
                },
                'slow-state-poll'
            );
        }
    }

    /**
     * Resume polling (when tab becomes visible)
     */
    _resumePolling() {
        this.ajax.stopPoll('slow-state-poll');

        if (this.roomCode && this.sessionId) {
            // Immediately poll once
            this.pollState();

            // Resume normal polling if in game
            const gameScreen = document.getElementById('screen-game');
            if (gameScreen.classList.contains('active')) {
                this._startGamePoll();
            }
        }
    }

    // =====================================================
    // UI RENDERING
    // =====================================================

    /**
     * Update the entire game display based on current game state
     */
    _updateGameDisplay() {
        if (!this.gameState) return;

        // Update board holes
        this._updateBoard();

        // Update scores
        this._updateScores();

        // Update turn indicators
        this._updateTurnIndicators();

        // Update top bar
        this._updateTopBar();

        // Update clickable holes
        this._updateClickableHoles();
    }

    /**
     * Update the board hole displays with current seed counts
     */
    _updateBoard() {
        const holes = document.querySelectorAll('.hole');
        holes.forEach(hole => {
            const holeIndex = parseInt(hole.dataset.hole, 10);
            const seedCount = this.gameState.board[holeIndex];

            const countSpan = hole.querySelector('.seed-count');
            if (countSpan) {
                countSpan.textContent = seedCount;
            }

            // Visual feedback: holes with 0 seeds are dimmer
            if (seedCount === 0) {
                hole.style.opacity = '0.5';
            } else {
                hole.style.opacity = '1';
            }
        });
    }

    /**
     * Update player score displays
     */
    _updateScores() {
        const scoreP1 = document.getElementById('score-player-1');
        const scoreP2 = document.getElementById('score-player-2');

        if (scoreP1) scoreP1.textContent = this.gameState.scores[1];
        if (scoreP2) scoreP2.textContent = this.gameState.scores[2];
    }

    /**
     * Update turn indicators to show whose turn it is
     */
    _updateTurnIndicators() {
        const indicator1 = document.getElementById('turn-indicator-1');
        const indicator2 = document.getElementById('turn-indicator-2');

        if (indicator1) {
            indicator1.classList.toggle('active', this.gameState.currentPlayer === 1);
        }
        if (indicator2) {
            indicator2.classList.toggle('active', this.gameState.currentPlayer === 2);
        }

        this.isMyTurn = this.gameState.currentPlayer === this.playerNumber;
    }

    /**
     * Update the top bar information
     */
    _updateTopBar() {
        // Room code
        const roomCodeEl = document.getElementById('game-room-code');
        if (roomCodeEl) roomCodeEl.textContent = this.roomCode;

        // Player label
        const playerLabelEl = document.getElementById('game-player-label');
        if (playerLabelEl) playerLabelEl.textContent = `Joueur ${this.playerNumber}`;

        // Game status
        const statusEl = document.getElementById('game-status');
        if (statusEl) {
            statusEl.classList.remove('your-turn', 'opponent-turn', 'finished');

            if (this.gameState.gameStatus === 'finished') {
                statusEl.textContent = 'Terminée';
                statusEl.classList.add('finished');
            } else if (this.isMyTurn) {
                statusEl.textContent = 'Votre tour';
                statusEl.classList.add('your-turn');
            } else {
                statusEl.textContent = "Tour de l'adversaire";
                statusEl.classList.add('opponent-turn');
            }
        }
    }

    /**
     * Update which holes are clickable based on player and turn
     */
    _updateClickableHoles() {
        const holes = document.querySelectorAll('.hole');
        holes.forEach(hole => {
            const holeIndex = parseInt(hole.dataset.hole, 10);

            // Remove all interactivity classes
            hole.classList.remove('clickable', 'highlighted');
            hole.removeAttribute('tabindex');
            hole.removeAttribute('role');
            hole.removeAttribute('aria-label');

            if (this.gameState.gameStatus !== 'playing') return;
            if (!this.isMyTurn) return;

            // Player 1 owns holes 0-6, Player 2 owns holes 7-13
            const isMyHole = this.playerNumber === 1
                ? holeIndex >= 0 && holeIndex <= 6
                : holeIndex >= 7 && holeIndex <= 13;

            if (isMyHole && this.gameState.board[holeIndex] > 0) {
                hole.classList.add('clickable');
                hole.classList.add('highlighted');
                hole.setAttribute('tabindex', '0');
                hole.setAttribute('role', 'button');
                hole.setAttribute('aria-label', `Trou ${holeIndex}: ${this.gameState.board[holeIndex]} graines`);
            }
        });
    }

    // =====================================================
    // USER INTERACTION
    // =====================================================

    /**
     * Handle a click on a game board hole
     * @param {number} holeIndex - The clicked hole index
     */
    _handleHoleClick(holeIndex) {
        if (this.gameState && this.gameState.gameStatus !== 'playing') {
            this._showGameMessage('La partie est terminée', 'warning');
            return;
        }

        if (!this.isMyTurn) {
            this._showGameMessage("Ce n'est pas votre tour", 'warning');
            return;
        }

        if (this.isProcessing) {
            this._showGameMessage('Traitement en cours...', 'info');
            return;
        }

        // Check if it's the player's hole
        const isMyHole = this.playerNumber === 1
            ? holeIndex >= 0 && holeIndex <= 6
            : holeIndex >= 7 && holeIndex <= 13;

        if (!isMyHole) {
            this._showGameMessage('Ce trou ne vous appartient pas', 'warning');
            return;
        }

        // Check if hole has seeds
        if (this.gameState.board[holeIndex] === 0) {
            this._showGameMessage('Ce trou est vide', 'warning');
            return;
        }

        // Send the move to the server
        this.sendMove(holeIndex);
    }

    // =====================================================
    // ANIMATIONS
    // =====================================================

    /**
     * Animate a capture event
     * @param {Object} moveResult - The result of the move
     */
    _animateCapture(moveResult) {
        if (!moveResult) return;

        // Flash the captured holes
        if (this.gameState && this.gameState.moveHistory) {
            const lastMove = this.gameState.moveHistory[this.gameState.moveHistory.length - 1];
            if (lastMove && lastMove.capturedHoles) {
                lastMove.capturedHoles.forEach(holeIndex => {
                    const holeEl = document.querySelector(`.hole[data-hole="${holeIndex}"]`);
                    if (holeEl) {
                        holeEl.classList.add('captured');
                        setTimeout(() => {
                            holeEl.classList.remove('captured');
                        }, 600);
                    }
                });
            }
        }
    }

    // =====================================================
    // GAME OVER HANDLING
    // =====================================================

    /**
     * Handle game over state
     * @param {Object} gameState - The final game state
     */
    _handleGameOver(gameState) {
        this._stopAllPolling();

        const titleEl = document.getElementById('gameover-title');
        const resultEl = document.getElementById('gameover-result');
        const scoresEl = document.getElementById('gameover-scores');
        const reasonEl = document.getElementById('gameover-reason');

        // Determine result for this player
        let resultText = '';
        let resultClass = '';

        if (gameState.winner === this.playerNumber) {
            resultText = 'Vous avez gagné ! 🎉';
            resultClass = 'win';
        } else if (gameState.winner === 'draw') {
            resultText = 'Match nul ! 🤝';
            resultClass = 'draw';
        } else if (gameState.winner !== null) {
            resultText = 'Vous avez perdu 😔';
            resultClass = 'lose';
        } else {
            resultText = 'Partie terminée';
            resultClass = 'draw';
        }

        titleEl.textContent = 'Partie terminée';
        resultEl.textContent = resultText;
        resultEl.className = `gameover-result ${resultClass}`;

        // Display final scores
        scoresEl.innerHTML = `
            <div class="score-entry">
                <span class="score-value">${gameState.scores[1]}</span>
                <span class="score-name">Joueur 1</span>
            </div>
            <div class="score-entry">
                <span class="score-value">${gameState.scores[2]}</span>
                <span class="score-name">Joueur 2</span>
            </div>
        `;

        // Display game over reason
        reasonEl.textContent = gameState.gameOverReason || '';

        this._showScreen('gameover');
    }

    // =====================================================
    // DISCONNECT HANDLING
    // =====================================================

    /**
     * Show the disconnect overlay
     */
    _showDisconnect() {
        if (this.opponentConnected === false) return; // Already showing
        this.opponentConnected = false;
        document.getElementById('disconnect-overlay').classList.remove('hidden');
    }

    /**
     * Hide the disconnect overlay
     */
    _hideDisconnect() {
        if (this.opponentConnected === true) return; // Already hidden
        this.opponentConnected = true;
        document.getElementById('disconnect-overlay').classList.add('hidden');
    }

    /**
     * Handle disconnect detection
     */
    handleDisconnect() {
        this._showDisconnect();
    }

    // =====================================================
    // MESSAGES
    // =====================================================

    /**
     * Show a game message
     * @param {string} text - Message text
     * @param {string} type - Message type: 'info', 'success', 'warning', 'error'
     */
    _showGameMessage(text, type = 'info') {
        const messageEl = document.getElementById('game-message');
        const textEl = document.getElementById('game-message-text');

        if (!messageEl || !textEl) return;

        textEl.textContent = text;
        messageEl.className = `game-message ${type}`;
        messageEl.classList.remove('hidden');

        // Auto-hide after 3 seconds
        clearTimeout(this._messageTimeout);
        this._messageTimeout = setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }

    // =====================================================
    // ERROR HANDLING
    // =====================================================

    /**
     * Show an error overlay
     * @param {string} message - Error message
     */
    _showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-overlay').classList.remove('hidden');
    }

    /**
     * Hide the error overlay
     */
    _hideError() {
        document.getElementById('error-overlay').classList.add('hidden');
    }

    // =====================================================
    // STATE MANAGEMENT
    // =====================================================

    /**
     * Reset all client state
     */
    _resetState() {
        this.roomCode = null;
        this.sessionId = null;
        this.playerNumber = null;
        this.gameState = null;
        this.isMyTurn = false;
        this.isProcessing = false;
        this.lastMoveHole = null;
        this.opponentConnected = true;

        // Reset input
        const input = document.getElementById('input-room-code');
        if (input) input.value = '';

        // Hide overlays
        this._hideDisconnect();
        this._hideError();

        // Reset game message
        const messageEl = document.getElementById('game-message');
        if (messageEl) messageEl.classList.add('hidden');
    }
}

// =====================================================
// INITIALIZE ON DOM READY
// =====================================================

let songoClient;

document.addEventListener('DOMContentLoaded', () => {
    songoClient = new SongoClient();
});
