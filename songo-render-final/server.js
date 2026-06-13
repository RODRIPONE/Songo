/**
 * Songo V2 - Main Server
 * VERSION RENDER.COM - Adapté pour hébergement cloud
 *
 * Structure attendue (racine du repo GitHub) :
 *   server.js          ← ce fichier
 *   game-logic.js      ← logique de jeu
 *   package.json
 *   client/
 *     html/index.html
 *     css/style.css
 *     js/songo-client.js
 *   ajax/
 *     ajax-manager.js
 *
 * Render config :
 *   Build command : npm install
 *   Start command : npm start
 *   Port          : automatique via process.env.PORT
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

// game-logic.js est maintenant dans le même dossier (racine)
const gameLogic = require('./game-logic');

const app  = express();
const PORT = process.env.PORT || 3000;  // Render injecte PORT automatiquement

// =====================================================
// In-memory storage
// (les rooms sont perdues à chaque redémarrage du service,
//  c'est normal sur Render free tier)
// =====================================================
const gameRooms     = new Map();
const playerSessions = new Map();

// =====================================================
// Middleware
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// =====================================================
// Static File Serving
// IMPORTANT : __dirname pointe vers la racine du repo sur Render
// =====================================================
const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath));

const ajaxPath = path.join(__dirname, 'ajax');
app.use('/ajax', express.static(ajaxPath));

// =====================================================
// Fonctions utilitaires
// =====================================================
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    while (gameRooms.has(code)) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return code;
}

function formatResponse(success, message, data) {
    return { success, message, data, timestamp: Date.now() };
}

function validateRequest(body, requiredFields) {
    const missing = requiredFields.filter(f => !body || body[f] === undefined || body[f] === null);
    return { valid: missing.length === 0, missing };
}

// =====================================================
// API Routes
// =====================================================

// Health check (utile pour Render pour vérifier que le service tourne)
app.get('/api/health', (req, res) => {
    res.json(formatResponse(true, 'Songo V2 opérationnel', {
        rooms:   gameRooms.size,
        players: playerSessions.size,
        uptime:  process.uptime()
    }));
});

// POST /api/create-room
app.post('/api/create-room', (req, res) => {
    try {
        const roomCode   = generateRoomCode();
        const sessionId  = uuidv4();
        const gameState  = gameLogic.createGameState(roomCode);
        gameState.players[1] = sessionId;
        gameState.gameStatus  = 'waiting';
        gameRooms.set(roomCode, gameState);
        playerSessions.set(sessionId, {
            roomCode, playerNumber: 1, lastActivity: Date.now()
        });
        res.json(formatResponse(true, 'Salon créé avec succès', {
            roomCode, playerNumber: 1, sessionId
        }));
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json(formatResponse(false, 'Erreur lors de la création du salon', null));
    }
});

// POST /api/join-room
app.post('/api/join-room', (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode']);
        if (!validation.valid) {
            return res.status(400).json(formatResponse(false, `Champs manquants: ${validation.missing.join(', ')}`, null));
        }
        const roomCodeUpper = req.body.roomCode.toUpperCase().trim();
        const gameState     = gameRooms.get(roomCodeUpper);

        if (!gameState)
            return res.status(404).json(formatResponse(false, 'Salon introuvable. Vérifiez le code.', null));
        if (gameState.players[1] !== null && gameState.players[2] !== null)
            return res.status(403).json(formatResponse(false, 'Ce salon est complet', null));
        if (gameState.gameStatus === 'finished')
            return res.status(403).json(formatResponse(false, 'Cette partie est terminée', null));

        const sessionId    = uuidv4();
        const playerNumber = gameState.players[1] === null ? 1 : 2;
        gameState.players[playerNumber] = sessionId;
        playerSessions.set(sessionId, {
            roomCode: roomCodeUpper, playerNumber, lastActivity: Date.now()
        });
        if (gameState.players[1] !== null && gameState.players[2] !== null) {
            gameState.gameStatus = 'playing';
        }
        res.json(formatResponse(true, `Vous êtes le Joueur ${playerNumber}`, {
            roomCode: roomCodeUpper, playerNumber, sessionId,
            gameStatus: gameState.gameStatus
        }));
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json(formatResponse(false, 'Erreur lors de la connexion', null));
    }
});

// GET /api/game-state
app.get('/api/game-state', (req, res) => {
    try {
        const { roomCode, sessionId } = req.query;
        if (!roomCode)
            return res.status(400).json(formatResponse(false, 'Code salon requis', null));

        const roomCodeUpper = roomCode.toUpperCase().trim();
        const gameState     = gameRooms.get(roomCodeUpper);
        if (!gameState)
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));

        if (sessionId) {
            const session = playerSessions.get(sessionId);
            if (session) session.lastActivity = Date.now();
        }

        let playerNumber = null;
        if (sessionId) {
            const session = playerSessions.get(sessionId);
            if (session && session.roomCode === roomCodeUpper)
                playerNumber = session.playerNumber;
        }

        const safeState = gameLogic.getSafeGameState(gameState);
        safeState.yourPlayerNumber = playerNumber;

        if (playerNumber) {
            const opponentNumber    = playerNumber === 1 ? 2 : 1;
            const opponentSessionId = gameState.players[opponentNumber];
            if (opponentSessionId) {
                const opponentSession = playerSessions.get(opponentSessionId);
                safeState.opponentConnected = opponentSession &&
                    (Date.now() - opponentSession.lastActivity) < 15000;
            } else {
                safeState.opponentConnected = false;
            }
        }

        res.json(formatResponse(true, 'État du jeu récupéré', safeState));
    } catch (error) {
        console.error('Error getting game state:', error);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// POST /api/make-move
app.post('/api/make-move', (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode', 'sessionId', 'holeIndex']);
        if (!validation.valid)
            return res.status(400).json(formatResponse(false, `Champs manquants: ${validation.missing.join(', ')}`, null));

        const { sessionId, holeIndex } = req.body;
        const roomCodeUpper = req.body.roomCode.toUpperCase().trim();
        const gameState     = gameRooms.get(roomCodeUpper);
        if (!gameState)
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));

        const session = playerSessions.get(sessionId);
        if (!session || session.roomCode !== roomCodeUpper)
            return res.status(403).json(formatResponse(false, 'Session invalide', null));

        const playerNumber = session.playerNumber;
        if (gameState.currentPlayer !== playerNumber)
            return res.status(403).json(formatResponse(false, "Ce n'est pas votre tour", null));
        if (gameState.gameStatus !== 'playing')
            return res.status(403).json(formatResponse(false, 'La partie est terminée', null));

        const holeIdx = parseInt(holeIndex, 10);
        if (isNaN(holeIdx))
            return res.status(400).json(formatResponse(false, 'Index de trou invalide', null));

        const result = gameLogic.executeMove(gameState, holeIdx, playerNumber);
        if (!result.success)
            return res.status(400).json(formatResponse(false, result.message, null));

        gameRooms.set(roomCodeUpper, result.gameState);
        session.lastActivity = Date.now();

        const safeState = gameLogic.getSafeGameState(result.gameState);
        safeState.yourPlayerNumber = playerNumber;
        safeState.moveResult = {
            captured: result.gameState.moveHistory[result.gameState.moveHistory.length - 1].captured,
            message:  result.message
        };
        res.json(formatResponse(true, result.message, safeState));
    } catch (error) {
        console.error('Error making move:', error);
        res.status(500).json(formatResponse(false, 'Erreur lors du coup', null));
    }
});

// GET /api/check-connection
app.get('/api/check-connection', (req, res) => {
    try {
        const { roomCode, sessionId } = req.query;
        if (!roomCode || !sessionId)
            return res.status(400).json(formatResponse(false, 'Paramètres requis', null));

        const roomCodeUpper = roomCode.toUpperCase().trim();
        const gameState     = gameRooms.get(roomCodeUpper);
        if (!gameState)
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));

        const session = playerSessions.get(sessionId);
        if (!session || session.roomCode !== roomCodeUpper)
            return res.status(403).json(formatResponse(false, 'Session invalide', null));

        const playerNumber      = session.playerNumber;
        const opponentNumber    = playerNumber === 1 ? 2 : 1;
        session.lastActivity    = Date.now();
        const opponentSessionId = gameState.players[opponentNumber];
        let opponentConnected   = false;
        if (opponentSessionId) {
            const opponentSession = playerSessions.get(opponentSessionId);
            opponentConnected = opponentSession &&
                (Date.now() - opponentSession.lastActivity) < 15000;
        }
        res.json(formatResponse(true, 'Vérification de connexion', {
            opponentConnected, gameStatus: gameState.gameStatus
        }));
    } catch (error) {
        console.error('Error checking connection:', error);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// POST /api/leave-room
app.post('/api/leave-room', (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode', 'sessionId']);
        if (!validation.valid)
            return res.status(400).json(formatResponse(false, 'Champs manquants', null));

        const roomCodeUpper = req.body.roomCode.toUpperCase().trim();
        const { sessionId } = req.body;
        const gameState     = gameRooms.get(roomCodeUpper);
        if (!gameState)
            return res.json(formatResponse(true, 'Salon déjà supprimé', null));

        const session = playerSessions.get(sessionId);
        if (!session || session.roomCode !== roomCodeUpper)
            return res.status(403).json(formatResponse(false, 'Session invalide', null));

        const playerNumber = session.playerNumber;
        gameState.players[playerNumber] = null;
        playerSessions.delete(sessionId);

        if (gameState.gameStatus === 'playing') {
            const opponentNumber = playerNumber === 1 ? 2 : 1;
            if (gameState.players[opponentNumber] !== null) {
                gameState.gameStatus  = 'finished';
                gameState.winner      = opponentNumber;
                gameState.gameOverReason = `Le Joueur ${playerNumber} s'est déconnecté`;
            }
        }
        if (gameState.players[1] === null && gameState.players[2] === null)
            gameRooms.delete(roomCodeUpper);

        res.json(formatResponse(true, 'Vous avez quitté le salon', null));
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// =====================================================
// SPA Fallback - toujours servir index.html pour les routes non-API
// =====================================================
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api') && !req.url.includes('.')) {
        res.sendFile(path.join(clientPath, 'html', 'index.html'));
    } else {
        res.status(404).send('Not found');
    }
});

// =====================================================
// Global Error Handler
// =====================================================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json(formatResponse(false, 'Erreur interne du serveur', null));
});

// =====================================================
// Nettoyage périodique des rooms inactives (2h)
// =====================================================
setInterval(() => {
    const now       = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    for (const [roomCode, gameState] of gameRooms.entries()) {
        let hasActive = false;
        for (const n of [1, 2]) {
            const sid = gameState.players[n];
            if (sid) {
                const s = playerSessions.get(sid);
                if (s && (now - s.lastActivity) < TWO_HOURS) { hasActive = true; break; }
            }
        }
        if (!hasActive) {
            for (const n of [1, 2]) {
                const sid = gameState.players[n];
                if (sid) playerSessions.delete(sid);
            }
            gameRooms.delete(roomCode);
        }
    }
}, 10 * 60 * 1000);

// =====================================================
// Démarrage du serveur
// =====================================================
const server = app.listen(PORT, () => {
    console.log('');
    console.log('  ========================================');
    console.log('     SONGO V2 - Serveur Démarré');
    console.log('  ========================================');
    console.log(`     Port  : ${PORT}`);
    console.log(`     Env   : ${process.env.NODE_ENV || 'development'}`);
    console.log('     Mode  : Distribution (AJAX)');
    console.log('  ========================================');
    console.log('');
});

// Gestion propre de l'arrêt (important pour Render)
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
