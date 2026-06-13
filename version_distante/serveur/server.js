/**
 * SONGO V2 - Serveur avec persistance MySQL
 *
 * Changements par rapport à la version originale :
 *   - Remplacement du stockage en mémoire (Map) par MySQL
 *   - Ajout du module mysql2 pour la connexion à la base de données
 *   - Toutes les routes API restent identiques (même URL, même format de réponse)
 *
 * Pour lancer :
 *   cd version_distante/serveur/
 *   npm install mysql2
 *   node server.js
 */

'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { v4: uuidv4 } = require('uuid');
const mysql      = require('mysql2/promise');

const gameLogic  = require('./game-logic');

const app  = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// Connexion MySQL
// =====================================================
const dbConfig = {
    host     : 'localhost',
    user     : 'root',        // utilisateur phpMyAdmin par défaut sur XAMPP
    password : '',            // mot de passe vide par défaut sur XAMPP
    database : 'songo_db',
    waitForConnections : true,
    connectionLimit    : 10,
    queueLimit         : 0
};

let db; // pool de connexions global

async function connectDB() {
    try {
        db = await mysql.createPool(dbConfig);
        // Test rapide de la connexion
        await db.query('SELECT 1');
        console.log('  [DB] Connexion MySQL réussie → songo_db');
    } catch (err) {
        console.error('  [DB] ERREUR connexion MySQL :', err.message);
        console.error('  → Vérifiez que XAMPP MySQL est démarré');
        process.exit(1);
    }
}

// =====================================================
// Middleware
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// =====================================================
// Fichiers statiques
// =====================================================
const clientPath = path.join(__dirname, '..', 'client');
const ajaxPath   = path.join(__dirname, '..', 'ajax');
app.use(express.static(clientPath));
app.use('/ajax', express.static(ajaxPath));

// =====================================================
// Utilitaires
// =====================================================
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
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
// Helpers base de données
// =====================================================

/** Récupère un salon complet par son code */
async function getSalonByCode(code) {
    const [rows] = await db.query(
        'SELECT * FROM salons WHERE code_salon = ?',
        [code.toUpperCase().trim()]
    );
    if (rows.length === 0) return null;
    const salon = rows[0];
    // MySQL retourne JSON en string → parser
    salon.plateau = typeof salon.plateau === 'string'
        ? JSON.parse(salon.plateau)
        : salon.plateau;
    return salon;
}

/** Récupère une session joueur par son UUID */
async function getSession(sessionId) {
    const [rows] = await db.query(
        'SELECT sj.*, s.code_salon FROM sessions_joueurs sj ' +
        'JOIN salons s ON s.id = sj.salon_id ' +
        'WHERE sj.session_id = ?',
        [sessionId]
    );
    return rows.length > 0 ? rows[0] : null;
}

/** Met à jour l'activité d'une session */
async function touchSession(sessionId) {
    await db.query(
        'UPDATE sessions_joueurs SET derniere_activite = NOW() WHERE session_id = ?',
        [sessionId]
    );
}

/** Reconstruit un gameState compatible avec game-logic à partir d'une ligne salon */
async function buildGameState(salon) {
    const [sessions] = await db.query(
        'SELECT * FROM sessions_joueurs WHERE salon_id = ?',
        [salon.id]
    );
    const [coups] = await db.query(
        'SELECT * FROM coups WHERE salon_id = ? ORDER BY numero_coup ASC',
        [salon.id]
    );

    const players = { 1: null, 2: null };
    sessions.forEach(s => { players[s.numero_joueur] = s.session_id; });

    const moveHistory = coups.map(c => ({
        player      : c.numero_joueur,
        holeIndex   : c.index_trou,
        seedsDistributed : c.graines_ramassees,
        captured    : c.graines_capturees,
        timestamp   : new Date(c.joue_le).getTime()
    }));

    return {
        roomCode      : salon.code_salon,
        board         : salon.plateau,
        currentPlayer : salon.joueur_actuel,
        scores        : { 1: salon.score_j1, 2: salon.score_j2 },
        players,
        moveHistory,
        gameStatus    : salon.statut === 'attente'   ? 'waiting'
                      : salon.statut === 'en_cours'  ? 'playing'
                      : 'finished',
        winner        : salon.joueur_gagnant,
        gameOverReason: salon.raison_fin
    };
}

// =====================================================
// POST /api/create-room
// =====================================================
app.post('/api/create-room', async (req, res) => {
    try {
        // Générer un code unique (vérification en base)
        let roomCode;
        let exists = true;
        while (exists) {
            roomCode = generateRoomCode();
            const [rows] = await db.query(
                'SELECT id FROM salons WHERE code_salon = ?', [roomCode]
            );
            exists = rows.length > 0;
        }

        const sessionId  = uuidv4();
        const plateau    = JSON.stringify(gameLogic.createInitialBoard());

        // Insérer le salon
        const [result] = await db.query(
            'INSERT INTO salons (code_salon, plateau, statut) VALUES (?, ?, ?)',
            [roomCode, plateau, 'attente']
        );
        const salonId = result.insertId;

        // Insérer la session du Joueur 1
        await db.query(
            'INSERT INTO sessions_joueurs (session_id, salon_id, numero_joueur) VALUES (?, ?, 1)',
            [sessionId, salonId]
        );

        res.json(formatResponse(true, 'Salon créé avec succès', {
            roomCode,
            playerNumber : 1,
            sessionId
        }));

    } catch (err) {
        console.error('create-room error:', err);
        res.status(500).json(formatResponse(false, 'Erreur lors de la création du salon', null));
    }
});

// =====================================================
// POST /api/join-room
// =====================================================
app.post('/api/join-room', async (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode']);
        if (!validation.valid) {
            return res.status(400).json(formatResponse(false, `Champs manquants: ${validation.missing.join(', ')}`, null));
        }

        const salon = await getSalonByCode(req.body.roomCode);
        if (!salon) {
            return res.status(404).json(formatResponse(false, 'Salon introuvable. Vérifiez le code.', null));
        }
        if (salon.statut === 'terminee') {
            return res.status(403).json(formatResponse(false, 'Cette partie est terminée', null));
        }

        // Vérifier les places disponibles
        const [sessions] = await db.query(
            'SELECT numero_joueur FROM sessions_joueurs WHERE salon_id = ?',
            [salon.id]
        );
        const occupiedSlots = sessions.map(s => s.numero_joueur);
        if (occupiedSlots.includes(1) && occupiedSlots.includes(2)) {
            return res.status(403).json(formatResponse(false, 'Ce salon est complet', null));
        }

        const playerNumber = occupiedSlots.includes(1) ? 2 : 1;
        const sessionId    = uuidv4();

        await db.query(
            'INSERT INTO sessions_joueurs (session_id, salon_id, numero_joueur) VALUES (?, ?, ?)',
            [sessionId, salon.id, playerNumber]
        );

        // Si les 2 joueurs sont là → démarrer la partie
        const newOccupied = [...occupiedSlots, playerNumber];
        let gameStatus = salon.statut;
        if (newOccupied.includes(1) && newOccupied.includes(2)) {
            await db.query(
                'UPDATE salons SET statut = ? WHERE id = ?',
                ['en_cours', salon.id]
            );
            gameStatus = 'playing';
        }

        res.json(formatResponse(true, `Vous êtes le Joueur ${playerNumber}`, {
            roomCode     : salon.code_salon,
            playerNumber,
            sessionId,
            gameStatus
        }));

    } catch (err) {
        console.error('join-room error:', err);
        res.status(500).json(formatResponse(false, 'Erreur lors de la connexion', null));
    }
});

// =====================================================
// GET /api/game-state
// =====================================================
app.get('/api/game-state', async (req, res) => {
    try {
        const { roomCode, sessionId } = req.query;
        if (!roomCode) {
            return res.status(400).json(formatResponse(false, 'Code salon requis', null));
        }

        const salon = await getSalonByCode(roomCode);
        if (!salon) {
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));
        }

        // Mettre à jour l'activité
        if (sessionId) await touchSession(sessionId);

        const gameState = await buildGameState(salon);
        const safeState = gameLogic.getSafeGameState(gameState);

        // Numéro du joueur courant
        let playerNumber = null;
        if (sessionId) {
            const session = await getSession(sessionId);
            if (session && session.code_salon === salon.code_salon) {
                playerNumber = session.numero_joueur;
            }
        }
        safeState.yourPlayerNumber = playerNumber;

        // Adversaire connecté ? (actif dans les 15 dernières secondes)
        if (playerNumber) {
            const opponentNum = playerNumber === 1 ? 2 : 1;
            const [oppSessions] = await db.query(
                'SELECT derniere_activite FROM sessions_joueurs WHERE salon_id = ? AND numero_joueur = ?',
                [salon.id, opponentNum]
            );
            if (oppSessions.length > 0) {
                const lastActivity = new Date(oppSessions[0].derniere_activite).getTime();
                safeState.opponentConnected = (Date.now() - lastActivity) < 15000;
            } else {
                safeState.opponentConnected = false;
            }
        }

        res.json(formatResponse(true, 'État du jeu récupéré', safeState));

    } catch (err) {
        console.error('game-state error:', err);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// =====================================================
// POST /api/make-move
// =====================================================
app.post('/api/make-move', async (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode', 'sessionId', 'holeIndex']);
        if (!validation.valid) {
            return res.status(400).json(formatResponse(false, `Champs manquants: ${validation.missing.join(', ')}`, null));
        }

        const { roomCode, sessionId, holeIndex } = req.body;

        const salon = await getSalonByCode(roomCode);
        if (!salon) {
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));
        }

        const session = await getSession(sessionId);
        if (!session || session.code_salon !== salon.code_salon) {
            return res.status(403).json(formatResponse(false, 'Session invalide', null));
        }

        if (salon.statut !== 'en_cours') {
            return res.status(403).json(formatResponse(false, 'La partie est terminée', null));
        }

        if (salon.joueur_actuel !== session.numero_joueur) {
            return res.status(403).json(formatResponse(false, "Ce n'est pas votre tour", null));
        }

        const holeIdx = parseInt(holeIndex, 10);
        if (isNaN(holeIdx)) {
            return res.status(400).json(formatResponse(false, 'Index de trou invalide', null));
        }

        // Exécuter le coup via game-logic (identique à avant)
        const gameState = await buildGameState(salon);
        const result    = gameLogic.executeMove(gameState, holeIdx, session.numero_joueur);

        if (!result.success) {
            return res.status(400).json(formatResponse(false, result.message, null));
        }

        const gs         = result.gameState;
        const lastMove   = gs.moveHistory[gs.moveHistory.length - 1];
        const newStatut  = gs.gameStatus === 'finished' ? 'terminee' : 'en_cours';

        // Sauvegarder le nouvel état du salon
        await db.query(
            `UPDATE salons SET
                plateau         = ?,
                joueur_actuel   = ?,
                score_j1        = ?,
                score_j2        = ?,
                nb_coups        = nb_coups + 1,
                statut          = ?,
                joueur_gagnant  = ?,
                raison_fin      = ?
            WHERE id = ?`,
            [
                JSON.stringify(gs.board),
                gs.currentPlayer,
                gs.scores[1],
                gs.scores[2],
                newStatut,
                gs.winner  || null,
                gs.gameOverReason || null,
                salon.id
            ]
        );

        // Enregistrer le coup dans l'historique
        await db.query(
            `INSERT INTO coups
                (salon_id, numero_coup, numero_joueur, index_trou, graines_ramassees, graines_capturees, plateau_apres)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                salon.id,
                gs.moveHistory.length,
                session.numero_joueur,
                holeIdx,
                lastMove.seedsDistributed,
                lastMove.captured,
                JSON.stringify(gs.board)
            ]
        );

        await touchSession(sessionId);

        const safeState = gameLogic.getSafeGameState(gs);
        safeState.yourPlayerNumber = session.numero_joueur;
        safeState.moveResult = {
            captured : lastMove.captured,
            message  : result.message
        };

        res.json(formatResponse(true, result.message, safeState));

    } catch (err) {
        console.error('make-move error:', err);
        res.status(500).json(formatResponse(false, 'Erreur lors du coup', null));
    }
});

// =====================================================
// GET /api/check-connection
// =====================================================
app.get('/api/check-connection', async (req, res) => {
    try {
        const { roomCode, sessionId } = req.query;
        if (!roomCode || !sessionId) {
            return res.status(400).json(formatResponse(false, 'Paramètres requis', null));
        }

        const salon = await getSalonByCode(roomCode);
        if (!salon) {
            return res.status(404).json(formatResponse(false, 'Salon introuvable', null));
        }

        const session = await getSession(sessionId);
        if (!session || session.code_salon !== salon.code_salon) {
            return res.status(403).json(formatResponse(false, 'Session invalide', null));
        }

        await touchSession(sessionId);

        const opponentNum = session.numero_joueur === 1 ? 2 : 1;
        const [oppRows]   = await db.query(
            'SELECT derniere_activite FROM sessions_joueurs WHERE salon_id = ? AND numero_joueur = ?',
            [salon.id, opponentNum]
        );

        let opponentConnected = false;
        if (oppRows.length > 0) {
            const lastActivity = new Date(oppRows[0].derniere_activite).getTime();
            opponentConnected  = (Date.now() - lastActivity) < 15000;
        }

        res.json(formatResponse(true, 'Vérification de connexion', {
            opponentConnected,
            gameStatus : salon.statut === 'en_cours' ? 'playing'
                       : salon.statut === 'attente'  ? 'waiting'
                       : 'finished'
        }));

    } catch (err) {
        console.error('check-connection error:', err);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// =====================================================
// POST /api/leave-room
// =====================================================
app.post('/api/leave-room', async (req, res) => {
    try {
        const validation = validateRequest(req.body, ['roomCode', 'sessionId']);
        if (!validation.valid) {
            return res.status(400).json(formatResponse(false, 'Champs manquants', null));
        }

        const { roomCode, sessionId } = req.body;
        const salon   = await getSalonByCode(roomCode);
        if (!salon) {
            return res.json(formatResponse(true, 'Salon déjà supprimé', null));
        }

        const session = await getSession(sessionId);
        if (!session || session.code_salon !== salon.code_salon) {
            return res.status(403).json(formatResponse(false, 'Session invalide', null));
        }

        // Supprimer la session du joueur
        await db.query('DELETE FROM sessions_joueurs WHERE session_id = ?', [sessionId]);

        // Si la partie était en cours → l'adversaire gagne par abandon
        if (salon.statut === 'en_cours') {
            const opponentNum = session.numero_joueur === 1 ? 2 : 1;
            const [oppRows]   = await db.query(
                'SELECT id FROM sessions_joueurs WHERE salon_id = ? AND numero_joueur = ?',
                [salon.id, opponentNum]
            );
            if (oppRows.length > 0) {
                await db.query(
                    `UPDATE salons SET statut = 'terminee', joueur_gagnant = ?, raison_fin = ? WHERE id = ?`,
                    [opponentNum, `Le Joueur ${session.numero_joueur} s'est déconnecté`, salon.id]
                );
            }
        }

        // Si plus aucun joueur → marquer la partie comme terminée
        const [remaining] = await db.query(
            'SELECT id FROM sessions_joueurs WHERE salon_id = ?', [salon.id]
        );
        if (remaining.length === 0) {
            await db.query(
                `UPDATE salons SET statut = 'terminee' WHERE id = ?`, [salon.id]
            );
        }

        res.json(formatResponse(true, 'Vous avez quitté le salon', null));

    } catch (err) {
        console.error('leave-room error:', err);
        res.status(500).json(formatResponse(false, 'Erreur', null));
    }
});

// =====================================================
// SPA Fallback
// =====================================================
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api') && !req.url.includes('.')) {
        res.sendFile(path.join(clientPath, 'html', 'index.html'));
    } else {
        res.status(404).send('Not found');
    }
});

// =====================================================
// Nettoyage automatique (parties inactives > 2h)
// =====================================================
setInterval(async () => {
    try {
        await db.query(
            `UPDATE salons SET statut = 'terminee'
             WHERE statut != 'terminee'
             AND mis_a_jour_le < DATE_SUB(NOW(), INTERVAL 2 HOUR)`
        );
    } catch (err) {
        console.error('[Cleanup] Erreur:', err.message);
    }
}, 10 * 60 * 1000); // toutes les 10 minutes

// =====================================================
// Démarrage du serveur
// =====================================================
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('');
        console.log('  ========================================');
        console.log('     SONGO V2 - Serveur MySQL');
        console.log('  ========================================');
        console.log(`     Port    : ${PORT}`);
        console.log(`     URL     : http://localhost:${PORT}`);
        console.log(`     Base DB : songo_db (MySQL)`);
        console.log('  ========================================');
        console.log('');
        console.log('  Ouvrez http://localhost:3000 dans 2 navigateurs');
        console.log('');
    });
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));
