/**
 * SONGO - Jeu Traditionnel Camerounais
 * Version Locale - Logique complète du jeu
 * 
 * Architecture modulaire :
 * - SongoBoard    : gestion de l'état du plateau
 * - SongoGame     : logique du jeu (coups, captures, tours)
 * - SongoUI       : rendu et interactions DOM
 * - SongoHistory  : historique des coups
 * - SongoStorage  : sauvegarde/chargement localStorage
 */

// =============================================
// SongoBoard - Gestion du plateau
// =============================================
class SongoBoard {
    constructor() {
        this.HOLES_PER_ROW = 7;
        this.TOTAL_HOLES = 14;
        this.SEEDS_PER_HOLE = 5;
        this.holes = [];
    }

    /** Initialise le plateau avec 5 graines par trou */
    init() {
        this.holes = new Array(this.TOTAL_HOLES).fill(this.SEEDS_PER_HOLE);
    }

    /** Retourne les indices des trous du joueur */
    getPlayerHoles(player) {
        if (player === 1) return Array.from({ length: 7 }, (_, i) => i);
        return Array.from({ length: 7 }, (_, i) => i + 7);
    }

    /** Retourne le nombre total de graines sur le plateau */
    getTotalSeeds() {
        return this.holes.reduce((sum, s) => sum + s, 0);
    }

    /** Retourne le nombre de graines dans les trous d'un joueur */
    getPlayerSeeds(player) {
        return this.getPlayerHoles(player).reduce((sum, i) => sum + this.holes[i], 0);
    }

    /** Clone le plateau */
    clone() {
        const b = new SongoBoard();
        b.holes = [...this.holes];
        return b;
    }

    /** Serialise le plateau */
    serialize() {
        return [...this.holes];
    }

    /** Deserialise le plateau */
    deserialize(data) {
        this.holes = [...data];
    }
}

// =============================================
// SongoGame - Logique du jeu
// =============================================
class SongoGame {
    constructor() {
        this.board = new SongoBoard();
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.moveHistory = [];
        this.gameStatus = 'playing'; // 'playing' | 'finished'
        this.winner = null;
        this.moveCount = 0;
    }

    /** Initialise une nouvelle partie */
    init() {
        this.board.init();
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.moveHistory = [];
        this.gameStatus = 'playing';
        this.winner = null;
        this.moveCount = 0;
    }

    /**
     * Valide un coup
     * @param {number} holeIndex - index du trou choisi
     * @param {number} player - joueur actuel (1 ou 2)
     * @returns {object} { valid: boolean, reason: string }
     */
    validateMove(holeIndex, player) {
        if (this.gameStatus !== 'playing') {
            return { valid: false, reason: 'La partie est terminée.' };
        }
        if (player !== this.currentPlayer) {
            return { valid: false, reason: 'Ce n\'est pas votre tour.' };
        }
        const playerHoles = this.board.getPlayerHoles(player);
        if (!playerHoles.includes(holeIndex)) {
            return { valid: false, reason: 'Vous devez choisir un trou de votre camp.' };
        }
        if (this.board.holes[holeIndex] === 0) {
            return { valid: false, reason: 'Ce trou est vide.' };
        }
        // Vérifier la règle d'alimentation
        const opponent = player === 1 ? 2 : 1;
        const simResult = this.simulateMove(holeIndex, player);
        if (simResult.opponentSeedsAfter === 0 && this.board.getPlayerSeeds(opponent) > 0) {
            // Le joueur doit nourrir l'adversaire
            // Vérifier s'il existe un autre coup qui nourrit
            const feedingMove = this.findFeedingMove(player);
            if (feedingMove !== -1 && feedingMove !== holeIndex) {
                return { valid: false, reason: 'Vous devez jouer un coup qui donne au moins une graine à l\'adversaire.' };
            }
        }
        return { valid: true, reason: '' };
    }

    /**
     * Trouve un coup qui nourrit l'adversaire
     * @param {number} player
     * @returns {number} index du trou ou -1
     */
    findFeedingMove(player) {
        const playerHoles = this.board.getPlayerHoles(player);
        const opponent = player === 1 ? 2 : 1;
        for (const hole of playerHoles) {
            if (this.board.holes[hole] === 0) continue;
            const sim = this.simulateMove(hole, player);
            if (sim.opponentSeedsAfter > 0) return hole;
        }
        return -1;
    }

    /**
     * Simule un coup sans modifier l'état
     * @param {number} holeIndex
     * @param {number} player
     * @returns {object} résultat de la simulation
     */
    simulateMove(holeIndex, player) {
        const simBoard = this.board.clone();
        const seeds = simBoard.holes[holeIndex];
        simBoard.holes[holeIndex] = 0;

        let current = holeIndex;
        const order = this.getDistributionOrder(player);
        const startIdx = order.indexOf(holeIndex);

        let seedsToDistribute = seeds;
        for (let i = 1; i <= seedsToDistribute; i++) {
            const nextIdx = (startIdx + i) % order.length;
            current = order[nextIdx];
            // Sauter le trou de départ si on fait le tour complet
            if (current === holeIndex && i < seedsToDistribute) {
                seedsToDistribute++;
                continue;
            }
            simBoard.holes[current]++;
        }

        // Calculer les captures
        const captures = this.calculateCaptures(simBoard, current, player);
        for (const c of captures) {
            simBoard.holes[c] = 0;
        }

        const opponent = player === 1 ? 2 : 1;
        return {
            lastHole: current,
            captures: captures,
            opponentSeedsAfter: simBoard.getPlayerSeeds(opponent)
        };
    }

    /**
     * Retourne l'ordre de distribution (sens antihoraire)
     * Joueur 1 : 0→1→2→3→4→5→6→13→12→11→10→9→8→7→0...
     * Joueur 2 : 13→12→11→10→9→8→7→0→1→2→3→4→5→6→13...
     */
    getDistributionOrder(player) {
        if (player === 1) {
            return [0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7];
        } else {
            return [13, 12, 11, 10, 9, 8, 7, 0, 1, 2, 3, 4, 5, 6];
        }
    }

    /**
     * Exécute un coup complet
     * @param {number} holeIndex
     * @returns {object} résultat du coup
     */
    makeMove(holeIndex) {
        const player = this.currentPlayer;
        const validation = this.validateMove(holeIndex, player);
        if (!validation.valid) {
            return { success: false, reason: validation.reason };
        }

        const seeds = this.board.holes[holeIndex];
        this.board.holes[holeIndex] = 0;

        const order = this.getDistributionOrder(player);
        const startIdx = order.indexOf(holeIndex);
        const distributionPath = [holeIndex];
        let current = holeIndex;
        let seedsToDistribute = seeds;

        for (let i = 1; i <= seedsToDistribute; i++) {
            const nextIdx = (startIdx + i) % order.length;
            current = order[nextIdx];
            if (current === holeIndex && i < seedsToDistribute) {
                seedsToDistribute++;
                distributionPath.push(current);
                continue;
            }
            this.board.holes[current]++;
            distributionPath.push(current);
        }

        // Captures
        const captures = this.calculateCaptures(this.board, current, player);
        let capturedCount = 0;
        for (const c of captures) {
            capturedCount += this.board.holes[c];
            this.board.holes[c] = 0;
        }
        this.scores[player] += capturedCount;

        // Enregistrer le coup
        this.moveCount++;
        const moveRecord = {
            moveNumber: this.moveCount,
            player: player,
            holeIndex: holeIndex,
            seedsDistributed: seeds,
            captures: captures,
            capturedCount: capturedCount,
            distributionPath: distributionPath,
            lastHole: current
        };
        this.moveHistory.push(moveRecord);

        // Vérifier fin de partie
        if (this.checkGameOver()) {
            this.gameStatus = 'finished';
            this.determineWinner();
        } else {
            this.switchTurn();
        }

        return {
            success: true,
            distributionPath: distributionPath,
            captures: captures,
            capturedCount: capturedCount,
            lastHole: current,
            moveRecord: moveRecord
        };
    }

    /**
     * Calcule les captures possibles après distribution
     * @param {SongoBoard} board - plateau (peut être un clone)
     * @param {number} lastHole - dernier trou de la distribution
     * @param {number} player - joueur qui a joué
     * @returns {number[]} indices des trous capturés
     */
    calculateCaptures(board, lastHole, player) {
        const opponent = player === 1 ? 2 : 1;
        const opponentHoles = board.getPlayerHoles(opponent);
        const captures = [];

        // La capture n'a lieu que si la dernière graine tombe dans le camp adverse
        if (!opponentHoles.includes(lastHole)) return captures;

        // Vérifier si le trou a 2 ou 3 graines
        if (board.holes[lastHole] !== 2 && board.holes[lastHole] !== 3) return captures;

        // Règle de sécurité : ne pas capturer toutes les graines adverses
        const order = this.getDistributionOrder(player);
        const lastIdx = order.indexOf(lastHole);

        // Remonter en arrière dans le camp adverse
        for (let i = lastIdx; i >= 0; i--) {
            const hole = order[i];
            if (!opponentHoles.includes(hole)) break;
            if (board.holes[hole] === 2 || board.holes[hole] === 3) {
                // Vérifier que la capture ne laisserait pas l'adversaire sans graines
                const testBoard = board.clone();
                for (const c of captures) testBoard.holes[c] = 0;
                testBoard.holes[hole] = 0;
                if (testBoard.getPlayerSeeds(opponent) > 0) {
                    captures.push(hole);
                } else {
                    // Si capturer ce trou laisse l'adversaire à sec, on arrête
                    break;
                }
            } else {
                break;
            }
        }

        return captures;
    }

    /** Change le tour */
    switchTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    /** Vérifie si la partie est terminée */
    checkGameOver() {
        // Plus de graines chez le joueur actif
        if (this.board.getPlayerSeeds(this.currentPlayer) === 0) {
            // Le joueur adverse récupère les graines restantes
            const other = this.currentPlayer === 1 ? 2 : 1;
            for (let i = 0; i < 14; i++) {
                this.scores[other] += this.board.holes[i];
                this.board.holes[i] = 0;
            }
            return true;
        }
        // Seulement 1 graine sur le plateau
        if (this.board.getTotalSeeds() <= 1) {
            for (let i = 0; i < 14; i++) {
                if (this.board.holes[i] > 0) {
                    this.scores[this.currentPlayer] += this.board.holes[i];
                    this.board.holes[i] = 0;
                }
            }
            return true;
        }
        return false;
    }

    /** Détermine le gagnant */
    determineWinner() {
        if (this.scores[1] > this.scores[2]) {
            this.winner = 1;
        } else if (this.scores[2] > this.scores[1]) {
            this.winner = 2;
        } else {
            this.winner = 'draw';
        }
    }

    /** Vérifie si un joueur peut nourrir l'adversaire */
    canFeed(player) {
        return this.findFeedingMove(player) !== -1;
    }

    /** Serialise l'état du jeu */
    serialize() {
        return {
            holes: this.board.serialize(),
            currentPlayer: this.currentPlayer,
            scores: { ...this.scores },
            moveHistory: this.moveHistory.map(m => ({ ...m })),
            gameStatus: this.gameStatus,
            winner: this.winner,
            moveCount: this.moveCount
        };
    }

    /** Deserialise l'état du jeu */
    deserialize(data) {
        this.board.deserialize(data.holes);
        this.currentPlayer = data.currentPlayer;
        this.scores = { ...data.scores };
        this.moveHistory = data.moveHistory.map(m => ({ ...m }));
        this.gameStatus = data.gameStatus;
        this.winner = data.winner;
        this.moveCount = data.moveCount;
    }
}

// =============================================
// SongoHistory - Historique des coups
// =============================================
class SongoHistory {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /** Ajoute un coup à l'historique */
    addMove(moveRecord, playerNames) {
        // Supprimer le message "Aucun coup"
        const emptyMsg = this.container.querySelector('.history-empty');
        if (emptyMsg) emptyMsg.remove();

        const pName = playerNames[moveRecord.player] || `Joueur ${moveRecord.player}`;
        const holeNum = moveRecord.holeIndex + 1;
        const captured = moveRecord.capturedCount > 0
            ? ` (+${moveRecord.capturedCount} graine${moveRecord.capturedCount > 1 ? 's' : ''})`
            : '';

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-move">Coup #${moveRecord.moveNumber} - ${pName}</span>
            <span class="history-detail">Trou ${holeNum}${captured}</span>
        `;
        this.container.appendChild(item);
        this.container.scrollTop = this.container.scrollHeight;
    }

    /** Efface l'historique */
    clear() {
        this.container.innerHTML = '<p class="history-empty">Aucun coup joué</p>';
    }

    /** Reconstruit l'historique à partir des données */
    rebuild(historyData, playerNames) {
        this.clear();
        for (const move of historyData) {
            this.addMove(move, playerNames);
        }
    }
}

// =============================================
// SongoStorage - Sauvegarde locale
// =============================================
class SongoStorage {
    constructor(key = 'songo_save') {
        this.key = key;
    }

    /** Sauvegarde l'état du jeu */
    save(gameState, settings = {}) {
        const data = {
            version: 1,
            timestamp: Date.now(),
            gameState: gameState,
            settings: settings
        };
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erreur de sauvegarde:', e);
            return false;
        }
    }

    /** Charge l'état du jeu */
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('Erreur de chargement:', e);
            return null;
        }
    }

    /** Vérifie si une sauvegarde existe */
    hasSave() {
        return localStorage.getItem(this.key) !== null;
    }

    /** Supprime la sauvegarde */
    clearSave() {
        localStorage.removeItem(this.key);
    }
}

// =============================================
// SongoUI - Interface utilisateur
// =============================================
class SongoUI {
    constructor() {
        this.game = new SongoGame();
        this.history = new SongoHistory('history-list');
        this.storage = new SongoStorage();
        this.playerNames = { 1: 'Joueur 1', 2: 'Joueur 2' };
        this.animating = false;
        this.settings = {
            animation: true,
            speed: 'normal'
        };

        this.speedMs = { slow: 200, normal: 100, fast: 50 };
        this.bindElements();
        this.bindEvents();
        this.initNewGame();
    }

    /** Récupère les références DOM */
    bindElements() {
        this.els = {
            topRow: document.getElementById('top-row'),
            bottomRow: document.getElementById('bottom-row'),
            scoreP1: document.getElementById('score-p1'),
            scoreP2: document.getElementById('score-p2'),
            turnP1: document.getElementById('turn-p1'),
            turnP2: document.getElementById('turn-p2'),
            seedsRemaining: document.getElementById('seeds-remaining'),
            gameMessage: document.getElementById('game-message'),
            messageBox: document.getElementById('message-box'),
            btnNewGame: document.getElementById('btn-new-game'),
            btnRestart: document.getElementById('btn-restart'),
            btnSave: document.getElementById('btn-save'),
            btnLoad: document.getElementById('btn-load'),
            btnTheme: document.getElementById('btn-theme'),
            btnHelp: document.getElementById('btn-help'),
            btnSettings: document.getElementById('btn-settings'),
            btnClearHistory: document.getElementById('btn-clear-history'),
            modalHelp: document.getElementById('modal-help'),
            modalGameover: document.getElementById('modal-gameover'),
            modalSettings: document.getElementById('modal-settings'),
            closeHelp: document.getElementById('close-help'),
            closeSettings: document.getElementById('close-settings'),
            gameoverTitle: document.getElementById('gameover-title'),
            gameoverMessage: document.getElementById('gameover-message'),
            gameoverIcon: document.getElementById('gameover-icon'),
            finalScoreP1: document.getElementById('final-score-p1'),
            finalScoreP2: document.getElementById('final-score-p2'),
            btnPlayAgain: document.getElementById('btn-play-again'),
            settingAnimation: document.getElementById('setting-animation'),
            settingSpeed: document.getElementById('setting-speed'),
            settingNameP1: document.getElementById('setting-name-p1'),
            settingNameP2: document.getElementById('setting-name-p2')
        };
    }

    /** Attache les événements */
    bindEvents() {
        this.els.btnNewGame.addEventListener('click', () => this.initNewGame());
        this.els.btnRestart.addEventListener('click', () => this.restartGame());
        this.els.btnSave.addEventListener('click', () => this.saveGame());
        this.els.btnLoad.addEventListener('click', () => this.loadGame());
        this.els.btnTheme.addEventListener('click', () => this.toggleTheme());
        this.els.btnHelp.addEventListener('click', () => this.els.modalHelp.hidden = false);
        this.els.btnSettings.addEventListener('click', () => this.els.modalSettings.hidden = false);
        this.els.btnClearHistory.addEventListener('click', () => this.history.clear());
        this.els.closeHelp.addEventListener('click', () => this.els.modalHelp.hidden = true);
        this.els.closeSettings.addEventListener('click', () => {
            this.applySettings();
            this.els.modalSettings.hidden = true;
        });
        this.els.btnPlayAgain.addEventListener('click', () => {
            this.els.modalGameover.hidden = true;
            this.initNewGame();
        });

        // Fermer modales en cliquant à l'extérieur
        [this.els.modalHelp, this.els.modalGameover, this.els.modalSettings].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.hidden = true;
            });
        });

        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem('songo_theme');
        if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    }

    /** Initialise une nouvelle partie */
    initNewGame() {
        this.game.init();
        this.history.clear();
        this.buildBoard();
        this.renderBoard();
        this.updateScores();
        this.updateTurnIndicator();
        this.updateMessage(`C'est au ${this.playerNames[1]} de jouer – choisissez un trou dans votre rangée.`);
        this.els.modalGameover.hidden = true;
    }

    /** Redémarre la partie en cours (reprendre) */
    restartGame() {
        this.initNewGame();
    }

    /** Construit les trous du plateau dans le DOM */
    buildBoard() {
        this.els.topRow.innerHTML = '';
        this.els.bottomRow.innerHTML = '';

        // Rangée du haut : trous 7 à 13 (affichés de droite à gauche, donc 13,12,...,7)
        for (let i = 13; i >= 7; i--) {
            const hole = this.createHoleElement(i, 2);
            this.els.topRow.appendChild(hole);
        }

        // Rangée du bas : trous 0 à 6
        for (let i = 0; i <= 6; i++) {
            const hole = this.createHoleElement(i, 1);
            this.els.bottomRow.appendChild(hole);
        }
    }

    /**
     * Crée un élément trou
     * @param {number} index - index du trou
     * @param {number} player - joueur propriétaire
     */
    createHoleElement(index, player) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.index = index;
        hole.dataset.player = player;
        hole.setAttribute('role', 'button');
        hole.setAttribute('aria-label', `Trou ${index + 1} - ${this.playerNames[player]}`);
        hole.tabIndex = 0;

        const indexLabel = document.createElement('span');
        indexLabel.className = 'hole-index';
        indexLabel.textContent = index + 1;
        hole.appendChild(indexLabel);

        hole.addEventListener('click', () => this.handleHoleClick(index));
        hole.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleHoleClick(index);
            }
        });

        return hole;
    }

    /** Gère le clic sur un trou */
    async handleHoleClick(holeIndex) {
        if (this.animating) return;
        if (this.game.gameStatus !== 'playing') return;

        const player = this.game.currentPlayer;
        const validation = this.game.validateMove(holeIndex, player);

        if (!validation.valid) {
            this.showMessage(validation.reason, 'error');
            return;
        }

        // Exécuter le coup avec animation
        if (this.settings.animation) {
            await this.animateMove(holeIndex);
        }

        const result = this.game.makeMove(holeIndex);

        if (result.success) {
            this.renderBoard();
            this.updateScores();
            this.updateTurnIndicator();

            // Animation de capture
            if (result.captures.length > 0 && this.settings.animation) {
                this.animateCapture(result.captures);
            }

            // Ajouter à l'historique
            this.history.addMove(result.moveRecord, this.playerNames);

            // Message
            if (this.game.gameStatus === 'finished') {
                this.showGameOver();
            } else {
                const pName = this.playerNames[this.game.currentPlayer];
                this.updateMessage(`C'est au ${pName} de jouer – choisissez un trou dans votre rangée.`);
            }
        }
    }

    /** Anime la distribution des graines */
    async animateMove(holeIndex) {
        this.animating = true;
        const speed = this.speedMs[this.settings.speed];
        const seeds = this.game.board.holes[holeIndex];
        const order = this.game.getDistributionOrder(this.game.currentPlayer);
        const startIdx = order.indexOf(holeIndex);

        // Vider le trou de départ visuellement
        const startHole = this.getHoleElement(holeIndex);
        if (startHole) {
            startHole.classList.add('selected');
        }

        let seedsToDistribute = seeds;
        let current = holeIndex;

        for (let i = 1; i <= seedsToDistribute; i++) {
            const nextIdx = (startIdx + i) % order.length;
            current = order[nextIdx];
            if (current === holeIndex && i < seedsToDistribute) {
                seedsToDistribute++;
                continue;
            }
            const holeEl = this.getHoleElement(current);
            if (holeEl) {
                holeEl.classList.add('seed-drop');
                setTimeout(() => holeEl.classList.remove('seed-drop'), 200);
            }
            await this.delay(speed);
        }

        if (startHole) startHole.classList.remove('selected');
        this.animating = false;
    }

    /** Anime la capture de graines */
    animateCapture(captures) {
        for (const holeIdx of captures) {
            const holeEl = this.getHoleElement(holeIdx);
            if (holeEl) {
                holeEl.classList.add('capturing');
                setTimeout(() => holeEl.classList.remove('capturing'), 500);
            }
        }
    }

    /** Retourne l'élément DOM d'un trou */
    getHoleElement(index) {
        return document.querySelector(`.hole[data-index="${index}"]`);
    }

    /** Met à jour le rendu du plateau */
    renderBoard() {
        for (let i = 0; i < 14; i++) {
            const holeEl = this.getHoleElement(i);
            if (!holeEl) continue;

            // Supprimer les graines existantes
            const existingSeeds = holeEl.querySelectorAll('.seed');
            existingSeeds.forEach(s => s.remove());

            // Ajouter les graines
            const count = this.game.board.holes[i];
            for (let s = 0; s < count; s++) {
                const seed = document.createElement('div');
                seed.className = 'seed';
                holeEl.appendChild(seed);
            }

            // Mettre à jour l'accessibilité
            holeEl.setAttribute('aria-label',
                `Trou ${i + 1} - ${count} graine${count > 1 ? 's' : ''}`);

            // Mettre à jour l'état actif/inactif
            const holePlayer = parseInt(holeEl.dataset.player);
            if (this.game.gameStatus === 'playing' && holePlayer === this.game.currentPlayer && count > 0) {
                holeEl.classList.remove('disabled');
            } else {
                holeEl.classList.add('disabled');
            }
        }

        // Mettre à jour le compteur de graines
        const total = this.game.board.getTotalSeeds();
        this.els.seedsRemaining.textContent = `${total} graine${total > 1 ? 's' : ''} en jeu`;
    }

    /** Met à jour les scores */
    updateScores() {
        this.els.scoreP1.textContent = this.game.scores[1];
        this.els.scoreP2.textContent = this.game.scores[2];
    }

    /** Met à jour l'indicateur de tour */
    updateTurnIndicator() {
        if (this.game.gameStatus !== 'playing') {
            this.els.turnP1.className = 'turn-indicator inactive';
            this.els.turnP2.className = 'turn-indicator inactive';
            this.els.turnP1.querySelector('.turn-text').textContent = 'Partie terminée';
            this.els.turnP2.querySelector('.turn-text').textContent = 'Partie terminée';
            return;
        }

        if (this.game.currentPlayer === 1) {
            this.els.turnP1.className = 'turn-indicator active';
            this.els.turnP2.className = 'turn-indicator inactive';
            this.els.turnP1.querySelector('.turn-text').textContent = 'À vous de jouer';
            this.els.turnP2.querySelector('.turn-text').textContent = 'En attente';
        } else {
            this.els.turnP1.className = 'turn-indicator inactive';
            this.els.turnP2.className = 'turn-indicator active';
            this.els.turnP1.querySelector('.turn-text').textContent = 'En attente';
            this.els.turnP2.querySelector('.turn-text').textContent = 'À vous de jouer';
        }
    }

    /** Met à jour le message */
    updateMessage(text, type = 'info') {
        this.els.gameMessage.textContent = text;
        this.els.messageBox.style.borderColor = type === 'error'
            ? 'var(--accent-secondary)'
            : 'var(--message-border)';
    }

    /** Affiche un message temporaire */
    showMessage(text, type = 'info') {
        this.updateMessage(text, type);
        setTimeout(() => {
            if (this.game.gameStatus === 'playing') {
                const pName = this.playerNames[this.game.currentPlayer];
                this.updateMessage(`C'est au ${pName} de jouer – choisissez un trou dans votre rangée.`);
            }
        }, 2500);
    }

    /** Affiche la fin de partie */
    showGameOver() {
        const p1Name = this.playerNames[1];
        const p2Name = this.playerNames[2];

        if (this.game.winner === 'draw') {
            this.els.gameoverIcon.textContent = '🤝';
            this.els.gameoverTitle.textContent = 'Match nul !';
            this.els.gameoverMessage.textContent = `${p1Name} et ${p2Name} ont capturé le même nombre de graines.`;
        } else {
            const winnerName = this.playerNames[this.game.winner];
            this.els.gameoverIcon.textContent = '🏆';
            this.els.gameoverTitle.textContent = `${winnerName} gagne !`;
            this.els.gameoverMessage.textContent = `${winnerName} remporte la partie avec ${this.game.scores[this.game.winner]} graines capturées.`;
        }

        this.els.finalScoreP1.textContent = this.game.scores[1];
        this.els.finalScoreP2.textContent = this.game.scores[2];
        this.els.modalGameover.hidden = false;
        this.updateMessage('La partie est terminée.');
    }

    /** Sauvegarde la partie */
    saveGame() {
        const success = this.storage.save(this.game.serialize(), this.settings);
        if (success) {
            this.showMessage('Partie sauvegardée avec succès !');
        } else {
            this.showMessage('Erreur lors de la sauvegarde.', 'error');
        }
    }

    /** Charge une partie sauvegardée */
    loadGame() {
        const data = this.storage.load();
        if (!data) {
            this.showMessage('Aucune sauvegarde trouvée.', 'error');
            return;
        }
        this.game.deserialize(data.gameState);
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
        }
        this.buildBoard();
        this.renderBoard();
        this.updateScores();
        this.updateTurnIndicator();
        this.history.rebuild(this.game.moveHistory, this.playerNames);
        this.els.modalGameover.hidden = true;

        if (this.game.gameStatus === 'finished') {
            this.showGameOver();
        } else {
            const pName = this.playerNames[this.game.currentPlayer];
            this.updateMessage(`Partie chargée. C'est au ${pName} de jouer.`);
        }
    }

    /** Bascule le thème */
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('songo_theme', next);
    }

    /** Applique les paramètres */
    applySettings() {
        this.settings.animation = this.els.settingAnimation.checked;
        this.settings.speed = this.els.settingSpeed.value;

        const name1 = this.els.settingNameP1.value.trim();
        const name2 = this.els.settingNameP2.value.trim();
        if (name1) this.playerNames[1] = name1;
        if (name2) this.playerNames[2] = name2;

        this.updateTurnIndicator();
        this.renderBoard();
    }

    /** Utilitaire : délai */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// =============================================
// Initialisation
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    window.songoUI = new SongoUI();
});
