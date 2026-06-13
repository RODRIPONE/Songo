/**
 * Songo Game Logic - Server-side implementation
 * Cameroonian variant of Oware/Mancala
 * 
 * Board layout:
 *   Top row (Player 2): holes 7-13 (right to left from P2 perspective)
 *   Bottom row (Player 1): holes 0-6 (left to right from P1 perspective)
 * 
 * Distribution direction:
 *   Player 1: left-to-right on bottom (0->6), then right-to-left on top (13->7)
 *   Player 2: right-to-left on top (13->7), then left-to-right on bottom (0->6)
 */

'use strict';

// The distribution order for each player (counterclockwise)
// Player 1: bottom L->R, then top R->L
// Player 2: top R->L, then bottom L->R
const DISTRIBUTION_ORDER = {
    1: [0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7],
    2: [13, 12, 11, 10, 9, 8, 7, 0, 1, 2, 3, 4, 5, 6]
};

// Player-owned holes
const PLAYER_HOLES = {
    1: [0, 1, 2, 3, 4, 5, 6],
    2: [7, 8, 9, 10, 11, 12, 13]
};

/**
 * Create initial board state: 5 seeds per hole, 14 holes total
 * @returns {number[]} Array of 14 elements, each = 5
 */
function createInitialBoard() {
    return new Array(14).fill(5);
}

/**
 * Validate that a move is legal for the given player
 * @param {number[]} board - Current board state
 * @param {number} holeIndex - The hole the player wants to pick from
 * @param {number} player - 1 or 2
 * @returns {{valid: boolean, reason: string}}
 */
function validateMove(board, holeIndex, player) {
    // Check hole index bounds
    if (holeIndex < 0 || holeIndex > 13) {
        return { valid: false, reason: 'Index de trou invalide' };
    }

    // Check that the hole belongs to the player
    if (!PLAYER_HOLES[player].includes(holeIndex)) {
        return { valid: false, reason: 'Ce trou ne vous appartient pas' };
    }

    // Check that the hole has seeds
    if (board[holeIndex] === 0) {
        return { valid: false, reason: 'Ce trou est vide' };
    }

    // Feeding rule: if opponent has no seeds, player must play a move that feeds them
    const opponent = player === 1 ? 2 : 1;
    const opponentHoles = PLAYER_HOLES[opponent];
    const opponentHasSeeds = opponentHoles.some(h => board[h] > 0);

    if (!opponentHasSeeds) {
        // Check if THIS specific move can feed the opponent
        const seedCount = board[holeIndex];
        const order = DISTRIBUTION_ORDER[player];
        const startIdx = order.indexOf(holeIndex);
        let feedsOpponent = false;

        for (let i = 1; i <= seedCount; i++) {
            const targetHole = order[(startIdx + i) % 14];
            if (opponentHoles.includes(targetHole)) {
                feedsOpponent = true;
                break;
            }
        }

        if (!feedsOpponent) {
            // Check if ANY other move can feed
            let anyMoveCanFeed = false;
            for (const h of PLAYER_HOLES[player]) {
                if (board[h] > 0) {
                    const sc = board[h];
                    const ord = DISTRIBUTION_ORDER[player];
                    const si = ord.indexOf(h);
                    for (let i = 1; i <= sc; i++) {
                        const th = ord[(si + i) % 14];
                        if (opponentHoles.includes(th)) {
                            anyMoveCanFeed = true;
                            break;
                        }
                    }
                    if (anyMoveCanFeed) break;
                }
            }

            if (anyMoveCanFeed) {
                return { valid: false, reason: 'Vous devez nourrir votre adversaire (donner au moins une graine)' };
            }
            // If no move can feed, this move is allowed (game will end after)
        }
    }

    return { valid: true, reason: '' };
}

/**
 * Check if the player can feed the opponent with any of their moves
 * @param {number[]} board - Current board state
 * @param {number} player - 1 or 2
 * @returns {boolean}
 */
function canFeed(board, player) {
    const opponent = player === 1 ? 2 : 1;
    const opponentHoles = PLAYER_HOLES[opponent];
    const hasOpponentSeeds = opponentHoles.some(h => board[h] > 0);

    // If opponent has seeds, feeding is not a constraint
    if (hasOpponentSeeds) {
        return true;
    }

    // Opponent has no seeds - check if any of our moves can reach opponent holes
    const myHoles = PLAYER_HOLES[player];
    for (const hole of myHoles) {
        if (board[hole] === 0) continue;
        const seedCount = board[hole];
        const order = DISTRIBUTION_ORDER[player];
        const startIdx = order.indexOf(hole);

        for (let i = 1; i <= seedCount; i++) {
            const targetHole = order[(startIdx + i) % 14];
            if (opponentHoles.includes(targetHole)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Distribute seeds from a hole according to the player's direction
 * @param {number[]} board - Current board state (will be modified in place)
 * @param {number} holeIndex - The hole to pick seeds from
 * @param {number} player - 1 or 2
 * @returns {{board: number[], lastHole: number, seedsDistributed: number}}
 */
function distributeSeeds(board, holeIndex, player) {
    const seedsToDistribute = board[holeIndex];
    board[holeIndex] = 0;

    const order = DISTRIBUTION_ORDER[player];
    const startIdx = order.indexOf(holeIndex);

    let lastHole = holeIndex;

    for (let i = 1; i <= seedsToDistribute; i++) {
        const targetIdx = (startIdx + i) % 14;
        const targetHole = order[targetIdx];
        board[targetHole]++;
        lastHole = targetHole;
    }

    return {
        board: board,
        lastHole: lastHole,
        seedsDistributed: seedsToDistribute
    };
}

/**
 * Capture seeds from opponent's holes based on where the last seed landed.
 * Includes chain capture and the safety rule (cannot leave opponent with 0 seeds).
 * 
 * Preceding holes in Oware context:
 *   - P1 lands in P2's top row: preceding = holes with higher index (toward 13)
 *   - P2 lands in P1's bottom row: preceding = holes with lower index (toward 0)
 * 
 * @param {number[]} board - Current board state (will be modified)
 * @param {number} lastHole - Where the last seed was placed
 * @param {number} player - The player who made the move
 * @returns {{board: number[], captured: number, capturedHoles: number[]}}
 */
function captureSeeds(board, lastHole, player) {
    const opponent = player === 1 ? 2 : 1;
    const opponentHoles = PLAYER_HOLES[opponent];

    // Can only capture if last seed landed in opponent's territory
    if (!opponentHoles.includes(lastHole)) {
        return { board: board, captured: 0, capturedHoles: [] };
    }

    // Determine preceding holes to check for chain capture
    let holesToCheck = [];

    if (player === 1) {
        // P1 lands on P2's top row (7-13)
        // P1 distributes: 0,1,2,3,4,5,6,13,12,11,10,9,8,7
        // On top row, P1 goes 13->7, so "preceding" = holes encountered before landing hole
        // i.e., holes with index GREATER than lastHole in range 7-13
        for (let h = lastHole + 1; h <= 13; h++) {
            holesToCheck.push(h);
        }
    } else {
        // P2 lands on P1's bottom row (0-6)
        // P2 distributes: 13,12,11,10,9,8,7,0,1,2,3,4,5,6
        // On bottom row, P2 goes 0->6, so "preceding" = holes encountered before landing hole
        // i.e., holes with index LESS than lastHole in range 0-6
        for (let h = lastHole - 1; h >= 0; h--) {
            holesToCheck.push(h);
        }
    }

    // Build the capture list
    let capturedHoles = [];
    let captured = 0;

    // Check landing hole first
    if (board[lastHole] === 2 || board[lastHole] === 3) {
        capturedHoles.push(lastHole);
        captured += board[lastHole];

        // Chain capture through preceding opponent holes
        for (const hole of holesToCheck) {
            if (board[hole] === 2 || board[hole] === 3) {
                capturedHoles.push(hole);
                captured += board[hole];
            } else {
                // Chain breaks when a hole doesn't have 2 or 3 seeds
                break;
            }
        }
    }

    if (capturedHoles.length === 0) {
        return { board: board, captured: 0, capturedHoles: [] };
    }

    // Safety rule: if capturing would leave opponent with NO seeds, forfeit capture
    // This prevents the game from becoming unplayable
    const opponentSeedsAfterCapture = opponentHoles.reduce((sum, h) => {
        return sum + (capturedHoles.includes(h) ? 0 : board[h]);
    }, 0);

    if (opponentSeedsAfterCapture === 0) {
        // Cannot capture - would leave opponent with nothing
        return { board: board, captured: 0, capturedHoles: [] };
    }

    // Execute the capture: set captured holes to 0
    for (const hole of capturedHoles) {
        board[hole] = 0;
    }

    return { board: board, captured: captured, capturedHoles: capturedHoles };
}

/**
 * Alias for captureSeeds (backward compatibility)
 */
const executeCapture = captureSeeds;

/**
 * Check if the game is over (general check)
 * @param {number[]} board - Current board state
 * @param {Object} scores - Player scores object
 * @returns {{gameOver: boolean, winner: null|1|2|'draw', reason: string}}
 */
function checkGameOver(board, scores) {
    // Game ends when a player cannot move (all their holes are empty)
    const player1Seeds = PLAYER_HOLES[1].reduce((sum, h) => sum + board[h], 0);
    const player2Seeds = PLAYER_HOLES[2].reduce((sum, h) => sum + board[h], 0);

    // If only one seed remains on the board, game ends
    const totalSeeds = board.reduce((sum, v) => sum + v, 0);
    if (totalSeeds <= 1) {
        const finalScores = { ...scores };
        if (player1Seeds > 0) finalScores[1] += player1Seeds;
        if (player2Seeds > 0) finalScores[2] += player2Seeds;

        if (finalScores[1] > finalScores[2]) {
            return { gameOver: true, winner: 1, reason: 'Plus assez de graines en jeu' };
        } else if (finalScores[2] > finalScores[1]) {
            return { gameOver: true, winner: 2, reason: 'Plus assez de graines en jeu' };
        } else {
            return { gameOver: true, winner: 'draw', reason: 'Plus assez de graines en jeu' };
        }
    }

    // Check if player 1 cannot move
    if (player1Seeds === 0) {
        const finalScores = { ...scores };
        finalScores[2] += player2Seeds;
        if (finalScores[1] > finalScores[2]) {
            return { gameOver: true, winner: 1, reason: 'Le Joueur 1 ne peut plus jouer' };
        } else if (finalScores[2] > finalScores[1]) {
            return { gameOver: true, winner: 2, reason: 'Le Joueur 1 ne peut plus jouer' };
        } else {
            return { gameOver: true, winner: 'draw', reason: 'Le Joueur 1 ne peut plus jouer' };
        }
    }

    // Check if player 2 cannot move
    if (player2Seeds === 0) {
        const finalScores = { ...scores };
        finalScores[1] += player1Seeds;
        if (finalScores[1] > finalScores[2]) {
            return { gameOver: true, winner: 1, reason: 'Le Joueur 2 ne peut plus jouer' };
        } else if (finalScores[2] > finalScores[1]) {
            return { gameOver: true, winner: 2, reason: 'Le Joueur 2 ne peut plus jouer' };
        } else {
            return { gameOver: true, winner: 'draw', reason: 'Le Joueur 2 ne peut plus jouer' };
        }
    }

    return { gameOver: false, winner: null, reason: '' };
}

/**
 * Check if the game is over from the perspective of the next player
 * @param {number[]} board - Current board state
 * @param {Object} scores - Player scores
 * @param {number} nextPlayer - The player whose turn it is next
 * @returns {{gameOver: boolean, winner: null|1|2|'draw', reason: string}}
 */
function checkGameOverForPlayer(board, scores, nextPlayer) {
    const opponent = nextPlayer === 1 ? 2 : 1;
    const nextPlayerSeeds = PLAYER_HOLES[nextPlayer].reduce((sum, h) => sum + board[h], 0);
    const opponentSeeds = PLAYER_HOLES[opponent].reduce((sum, h) => sum + board[h], 0);

    // If next player has no seeds, game over
    if (nextPlayerSeeds === 0) {
        const finalScores = { ...scores };
        finalScores[opponent] += opponentSeeds;
        if (finalScores[nextPlayer] > finalScores[opponent]) {
            return { gameOver: true, winner: nextPlayer, reason: `Le Joueur ${nextPlayer} ne peut plus jouer` };
        } else if (finalScores[opponent] > finalScores[nextPlayer]) {
            return { gameOver: true, winner: opponent, reason: `Le Joueur ${nextPlayer} ne peut plus jouer` };
        } else {
            return { gameOver: true, winner: 'draw', reason: `Le Joueur ${nextPlayer} ne peut plus jouer` };
        }
    }

    // If opponent has no seeds and next player cannot feed
    if (opponentSeeds === 0 && !canFeed(board, nextPlayer)) {
        const finalScores = { ...scores };
        finalScores[nextPlayer] += nextPlayerSeeds;
        if (finalScores[nextPlayer] > finalScores[opponent]) {
            return { gameOver: true, winner: nextPlayer, reason: 'Impossible de nourrir l\'adversaire' };
        } else if (finalScores[opponent] > finalScores[nextPlayer]) {
            return { gameOver: true, winner: opponent, reason: 'Impossible de nourrir l\'adversaire' };
        } else {
            return { gameOver: true, winner: 'draw', reason: 'Impossible de nourrir l\'adversaire' };
        }
    }

    // Only one seed left on the board
    const totalSeeds = board.reduce((sum, v) => sum + v, 0);
    if (totalSeeds <= 1) {
        const finalScores = { ...scores };
        finalScores[1] += PLAYER_HOLES[1].reduce((sum, h) => sum + board[h], 0);
        finalScores[2] += PLAYER_HOLES[2].reduce((sum, h) => sum + board[h], 0);
        if (finalScores[1] > finalScores[2]) {
            return { gameOver: true, winner: 1, reason: 'Plus assez de graines en jeu' };
        } else if (finalScores[2] > finalScores[1]) {
            return { gameOver: true, winner: 2, reason: 'Plus assez de graines en jeu' };
        } else {
            return { gameOver: true, winner: 'draw', reason: 'Plus assez de graines en jeu' };
        }
    }

    return { gameOver: false, winner: null, reason: '' };
}

/**
 * Execute a complete move: validate, distribute, capture, check game over
 * @param {Object} gameState - The current game state
 * @param {number} holeIndex - The hole to play from
 * @param {number} player - The player making the move
 * @returns {{success: boolean, gameState: Object, message: string}}
 */
function executeMove(gameState, holeIndex, player) {
    // Make a deep copy of the board to work with
    const board = [...gameState.board];
    const scores = { ...gameState.scores };

    // Validate the move
    const validation = validateMove(board, holeIndex, player);
    if (!validation.valid) {
        return { success: false, gameState: gameState, message: validation.reason };
    }

    // Distribute seeds
    const distribution = distributeSeeds(board, holeIndex, player);

    // Capture seeds
    const capture = captureSeeds(board, distribution.lastHole, player);
    scores[player] += capture.captured;

    // Check game over for the next player
    const nextPlayer = player === 1 ? 2 : 1;
    const gameOverCheck = checkGameOverForPlayer(board, scores, nextPlayer);

    // Build the move record
    const moveRecord = {
        player: player,
        holeIndex: holeIndex,
        seedsDistributed: distribution.seedsDistributed,
        captured: capture.captured,
        capturedHoles: capture.capturedHoles,
        lastHole: distribution.lastHole,
        timestamp: Date.now()
    };

    // Build the updated game state
    const newGameState = {
        ...gameState,
        board: board,
        scores: scores,
        currentPlayer: gameOverCheck.gameOver ? player : nextPlayer,
        moveHistory: [...gameState.moveHistory, moveRecord],
        gameStatus: gameOverCheck.gameOver ? 'finished' : 'playing',
        winner: gameOverCheck.gameOver ? gameOverCheck.winner : null,
        gameOverReason: gameOverCheck.gameOver ? gameOverCheck.reason : null
    };

    return {
        success: true,
        gameState: newGameState,
        message: capture.captured > 0 
            ? `${capture.captured} graine(s) capturée(s) !` 
            : 'Coup joué'
    };
}

/**
 * Create a new game state
 * @param {string} roomCode - The room code
 * @returns {Object} Initial game state
 */
function createGameState(roomCode) {
    return {
        roomCode: roomCode,
        board: createInitialBoard(),
        currentPlayer: 1,
        scores: { 1: 0, 2: 0 },
        players: { 1: null, 2: null },
        moveHistory: [],
        gameStatus: 'waiting',
        winner: null,
        gameOverReason: null
    };
}

/**
 * Get a safe version of game state to send to clients
 * Removes sensitive player session info
 * @param {Object} gameState - The full game state
 * @returns {Object} Safe game state for client
 */
function getSafeGameState(gameState) {
    return {
        roomCode: gameState.roomCode,
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        scores: gameState.scores,
        moveHistory: gameState.moveHistory,
        gameStatus: gameState.gameStatus,
        winner: gameState.winner,
        gameOverReason: gameState.gameOverReason,
        playersConnected: {
            1: gameState.players[1] !== null,
            2: gameState.players[2] !== null
        }
    };
}

// Export all functions
module.exports = {
    createInitialBoard,
    validateMove,
    distributeSeeds,
    captureSeeds,
    executeCapture,
    canFeed,
    checkGameOver,
    checkGameOverForPlayer,
    executeMove,
    createGameState,
    getSafeGameState,
    PLAYER_HOLES,
    DISTRIBUTION_ORDER
};
