# Documentation Technique — Songo

> Variante camerounaise de l'Oware/Mancala — Architecture V1 (locale) & V2 (distribuée)

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Descriptions des modules](#2-descriptions-des-modules)
3. [Documentation de l'API V2](#3-documentation-de-lapi-v2)
4. [Structures de données](#4-structures-de-données)
5. [Implémentation des règles du jeu](#5-implémentation-des-règles-du-jeu)
6. [Descriptions des algorithmes](#6-descriptions-des-algorithmes)
7. [Options de configuration](#7-options-de-configuration)
8. [Gestion des erreurs](#8-gestion-des-erreurs)
9. [Considérations de sécurité](#9-considérations-de-sécurité)
10. [Considérations de performance](#10-considérations-de-performance)

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Architecture V1 — Version Locale (3 couches)

La version locale du jeu Songo repose sur une architecture monolithique en trois couches, entièrement exécutée côté client dans le navigateur. Cette architecture a été conçue pour fonctionner sans aucune dépendance serveur, offrant ainsi une expérience de jeu hors-ligne complète. Les trois couches sont strictement séparées selon le principe de séparation des responsabilités, ce qui facilite la maintenance et l'évolution du code.

**Couche Métier (Business Logic)** : Cette couche est le cœur du jeu. Elle contient les classes `SongoBoard` et `SongoGame` qui encapsulent respectivement la gestion du plateau et la logique complète du jeu (validation des coups, distribution des graines, calcul des captures, détection de fin de partie). Toute la logique métier est indépendante de l'interface utilisateur et peut être testée unitairement de manière isolée. La classe `SongoBoard` maintient l'état des 14 trous (7 par joueur) et fournit des méthodes de consultation, de clonage et de sérialisation. La classe `SongoGame` orchestre le déroulement d'une partie complète.

**Couche Présentation (UI)** : La classe `SongoUI` gère l'ensemble du rendu visuel et des interactions avec l'utilisateur. Elle est responsable de la construction dynamique du plateau dans le DOM, de l'affichage des graines, des scores, des indicateurs de tour, des messages d'information et d'erreur, ainsi que des animations de distribution et de capture. Elle écoute les événements de clic et de clavier sur les trous et les transmet à la couche métier après validation. Cette couche gère également les modales (aide, paramètres, fin de partie) et le changement de thème clair/sombre.

**Couche Persistance (Storage)** : La classe `SongoStorage` assure la sauvegarde et le chargement de l'état du jeu via l'API `localStorage` du navigateur. Elle sérialise l'état complet du jeu (plateau, scores, historique, paramètres) au format JSON. La classe `SongoHistory` complète cette couche en gérant l'affichage de l'historique des coups dans l'interface, permettant au joueur de revoir le déroulement de la partie.

Le flux de données en V1 suit un chemin unidirectionnel : l'utilisateur interagit avec la couche Présentation, qui sollicite la couche Métier pour valider et exécuter l'action, puis met à jour l'affichage à partir du nouvel état retourné. La persistance est optionnelle et déclenchée manuellement par l'utilisateur.

```
┌─────────────────────────────────────────────┐
│              Navigateur (Client)            │
│                                             │
│  ┌─────────────┐  ┌─────────────────────┐  │
│  │  SongoUI    │←→│  SongoGame          │  │
│  │ (Présentation)│ │  + SongoBoard      │  │
│  │             │  │  (Logique métier)    │  │
│  └──────┬──────┘  └──────────┬──────────┘  │
│         │                    │              │
│  ┌──────▼──────┐  ┌─────────▼───────────┐  │
│  │ SongoHistory│  │  SongoStorage       │  │
│  │ (Historique)│  │  (Persistance)      │  │
│  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.2 Architecture V2 — Version Distribuée (Client-Serveur)

La version distribuée introduit une architecture client-serveur complète, permettant à deux joueurs de s'affronter à distance via un réseau. Le serveur, construit avec Node.js et Express, centralise toute la logique de jeu et la gestion des sessions, tandis que le client se concentre exclusivement sur l'interface et la communication AJAX. Cette séparation stricte garantit l'intégrité du jeu : aucun joueur ne peut tricher en modifiant l'état local.

**Serveur (Node.js/Express)** : Le serveur expose une API REST sur le préfixe `/api` et sert les fichiers statiques du client. Il maintient en mémoire l'ensemble des salons de jeu (`gameRooms`), les sessions des joueurs (`playerSessions`), et délègue la logique métier au module `game-logic.js`. Le fichier `server.js` configure les middleware (CORS, parsing JSON, logging), les routes statiques, l'API et la gestion gracieuse de l'arrêt. Le fichier `api-routes.js` définit les 6 endpoints REST. Le fichier `game-logic.js` contient toute la logique pure du jeu (validation, distribution, capture, fin de partie).

**Client (Navigateur)** : Le client utilise la classe `SongoClient` pour gérer la communication avec le serveur via la classe `AjaxManager`, un wrapper autour de `XMLHttpRequest` (et non `fetch`, par exigence technique). Le client gère quatre écrans distincts : connexion, attente, jeu et fin de partie. Il utilise un mécanisme de polling pour maintenir l'état synchronisé avec le serveur et détecter la déconnexion de l'adversaire.

**Communication** : Toute la communication repose sur des requêtes AJAX (GET et POST) avec des réponses JSON standardisées. Le client interroge régulièrement le serveur (polling) pour obtenir l'état du jeu et vérifier la connexion de l'adversaire. Aucune technologie WebSocket n'est utilisée, conformément aux choix architecturaux du projet.

```
┌──────────────────────┐         ┌──────────────────────┐
│   Client Joueur 1    │  HTTP   │   Client Joueur 2    │
│  ┌────────────────┐  │  AJAX   │  ┌────────────────┐  │
│  │  SongoClient   │  │◄───────►│  │  SongoClient   │  │
│  │  + AjaxManager │  │         │  │  + AjaxManager │  │
│  └───────┬────────┘  │         │  └───────┬────────┘  │
└──────────┼───────────┘         └──────────┼───────────┘
           │                                │
           └────────────┬───────────────────┘
                        │  HTTP (JSON)
                        ▼
           ┌────────────────────────┐
           │   Serveur Express      │
           │  ┌──────────────────┐  │
           │  │   api-routes.js  │  │
           │  │   (6 endpoints)  │  │
           │  └────────┬─────────┘  │
           │           │             │
           │  ┌────────▼─────────┐  │
           │  │  game-logic.js   │  │
           │  │  (Logique pure)  │  │
           │  └──────────────────┘  │
           │                        │
           │  gameRooms (Map)       │
           │  playerSessions (Map)  │
           └────────────────────────┘
```

---

## 2. Descriptions des modules

### 2.1 SongoBoard (V1)

Le module `SongoBoard` est responsable de la gestion de l'état du plateau de jeu. Il maintient un tableau de 14 éléments représentant les 14 trous du plateau, chacun contenant un nombre entier de graines. En début de partie, chaque trou est initialisé avec 5 graines, soit un total de 70 graines sur le plateau.

**Constantes** : `HOLES_PER_ROW = 7`, `TOTAL_HOLES = 14`, `SEEDS_PER_HOLE = 5`. Ces constantes définissent la géométrie fixe du plateau et pourraient être paramétrées pour supporter d'autres variantes de Mancala.

**Méthodes principales** :

| Méthode | Description |
|---------|-------------|
| `init()` | Initialise le plateau avec 5 graines par trou |
| `getPlayerHoles(player)` | Retourne les indices [0-6] pour J1 ou [7-13] pour J2 |
| `getTotalSeeds()` | Somme de toutes les graines sur le plateau |
| `getPlayerSeeds(player)` | Somme des graines dans les trous d'un joueur |
| `clone()` | Crée une copie profonde du plateau pour la simulation |
| `serialize()` / `deserialize(data)` | Conversion vers/depuis un tableau simple |

Le plateau utilise une numérotation séquentielle : les trous 0 à 6 appartiennent au Joueur 1 (rangée du bas), les trous 7 à 13 appartiennent au Joueur 2 (rangée du haut). Cette convention est partagée entre V1 et V2, assurant la cohérence de la logique de jeu.

### 2.2 SongoGame (V1)

Le module `SongoGame` encapsule la logique complète du jeu. Il utilise une instance de `SongoBoard` et maintient l'état global de la partie : joueur courant, scores, historique des coups, statut et gagnant. Ce module est le cœur du jeu en version locale et implémente toutes les règles du Songo.

**Méthodes principales** :

| Méthode | Description |
|---------|-------------|
| `init()` | Réinitialise une nouvelle partie |
| `validateMove(holeIndex, player)` | Valide un coup selon les règles |
| `makeMove(holeIndex)` | Exécute un coup complet (distribution + capture + vérification fin) |
| `simulateMove(holeIndex, player)` | Simule un coup sans modifier l'état réel |
| `calculateCaptures(board, lastHole, player)` | Calcule les captures selon la règle des 2-3 graines |
| `findFeedingMove(player)` | Trouve un coup qui nourrit l'adversaire |
| `getDistributionOrder(player)` | Retourne l'ordre antihoraire de distribution |
| `checkGameOver()` | Vérifie si la partie est terminée |
| `determineWinner()` | Détermine le gagnant ou le match nul |
| `serialize()` / `deserialize(data)` | Sérialisation complète de l'état |

**Ordre de distribution** : Le Songo suit un mouvement antihoraire. Pour le Joueur 1, l'ordre est `[0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7]` (gauche vers la droite sur la rangée du bas, puis droite vers la gauche sur la rangée du haut). Pour le Joueur 2, l'ordre est inversé : `[13, 12, 11, 10, 9, 8, 7, 0, 1, 2, 3, 4, 5, 6]`. Le trou de départ est toujours sauté lors d'un tour complet.

### 2.3 SongoUI (V1)

Le module `SongoUI` est le contrôleur principal de l'interface utilisateur en version locale. Il orchestre l'ensemble des interactions entre l'utilisateur, la logique de jeu et l'affichage. Il crée et gère les instances de `SongoGame`, `SongoHistory` et `SongoStorage`.

**Responsabilités** :

- **Construction du plateau** : `buildBoard()` crée dynamiquement les 14 éléments de trou dans le DOM avec leurs attributs d'accessibilité (`role="button"`, `aria-label`, `tabIndex`).
- **Rendu du plateau** : `renderBoard()` met à jour l'affichage des graines dans chaque trou, l'état actif/inactif des trous et le compteur de graines restantes.
- **Gestion des interactions** : `handleHoleClick(holeIndex)` valide et exécute le coup, déclenche les animations et met à jour l'affichage.
- **Animations** : `animateMove(holeIndex)` simule visuellement la distribution des graines trou par trou ; `animateCapture(captures)` met en évidence les trous capturés. Les vitesses sont configurables (lent : 200ms, normal : 100ms, rapide : 50ms).
- **Gestion des modales** : Aide (règles du jeu), paramètres (animations, vitesse, noms des joueurs), fin de partie (scores, gagnant).
- **Thème** : Basculement entre thème clair et sombre avec persistance dans `localStorage`.

### 2.4 SongoHistory (V1)

Le module `SongoHistory` gère l'affichage de l'historique des coups dans l'interface. Il reçoit un identifiant de conteneur DOM et ajoute dynamiquement les entrées au fur et à mesure que les coups sont joués. Chaque entrée affiche le numéro du coup, le nom du joueur, le trou joué et le nombre de graines capturées.

**Méthodes** :

| Méthode | Description |
|---------|-------------|
| `addMove(moveRecord, playerNames)` | Ajoute une entrée pour un coup joué |
| `clear()` | Efface l'historique affiché |
| `rebuild(historyData, playerNames)` | Reconstruit l'historique à partir de données sérialisées (utile après chargement) |

L'historique défile automatiquement vers le bas à chaque ajout pour toujours afficher le coup le plus récent. Le message « Aucun coup joué » est affiché par défaut et supprimé dès le premier coup.

### 2.5 SongoStorage (V1)

Le module `SongoStorage` assure la persistance de l'état du jeu via l'API `localStorage` du navigateur. Il permet de sauvegarder une partie en cours et de la recharger ultérieurement, y compris après la fermeture du navigateur.

**Format de sauvegarde** :

```json
{
  "version": 1,
  "timestamp": 1700000000000,
  "gameState": {
    "holes": [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    "currentPlayer": 1,
    "scores": { "1": 0, "2": 0 },
    "moveHistory": [],
    "gameStatus": "playing",
    "winner": null,
    "moveCount": 0
  },
  "settings": {
    "animation": true,
    "speed": "normal"
  }
}
```

**Méthodes** :

| Méthode | Description |
|---------|-------------|
| `save(gameState, settings)` | Sérialise et sauvegarde l'état |
| `load()` | Charge et désérialise l'état sauvegardé |
| `hasSave()` | Vérifie l'existence d'une sauvegarde |
| `clearSave()` | Supprime la sauvegarde |

### 2.6 SongoClient (V2)

Le module `SongoClient` est le contrôleur principal de la version distribuée. Il gère la communication avec le serveur, le rendu du plateau de jeu, les interactions utilisateur et la synchronisation de l'état entre les deux joueurs. Il utilise une instance de `AjaxManager` pour toutes les communications réseau.

**Écrans gérés** :

1. **Écran de connexion** (`screen-connection`) : Permet de créer un salon ou de rejoindre un salon existant via un code.
2. **Écran d'attente** (`screen-waiting`) : Affiche le code du salon et attend la connexion du second joueur avec une animation de chargement.
3. **Écran de jeu** (`screen-game`) : Affiche le plateau, les scores, les indicateurs de tour et les messages de jeu.
4. **Écran de fin de partie** (`screen-gameover`) : Affiche le résultat, les scores finaux et propose de rejouer ou de retourner au menu.

**Mécanismes de polling** : Le client maintient deux boucles de polling :
- `statePollId` : Interroge `/api/game-state` toutes les 2 secondes pour obtenir l'état actualisé du jeu.
- `connectionPollId` : Interroge `/api/check-connection` toutes les 5 secondes pour vérifier la présence de l'adversaire.

**Gestion de la déconnexion** : Si l'adversaire est détecté comme déconnecté (aucune activité depuis plus de 15 secondes), un overlay d'avertissement s'affiche avec une animation d'attente. Le joueur peut choisir d'attendre la reconnexion ou de quitter la partie.

### 2.7 AjaxManager (V2)

Le module `AjaxManager` est un utilitaire de communication réseau encapsulant `XMLHttpRequest`. Il fournit des méthodes pour les requêtes GET et POST avec gestion automatique des retry, des timeouts et du parsing JSON. Ce module est utilisé tant par le client navigateur que potentiellement par d'autres composants nécessitant une communication HTTP.

**Configuration** :

| Paramètre | Valeur par défaut | Description |
|-----------|-------------------|-------------|
| `timeout` | 10000 ms | Délai d'attente maximum par requête |
| `maxRetries` | 2 | Nombre maximum de tentatives en cas d'échec |
| `retryDelay` | 1000 ms | Délai entre les tentatives |

**Méthodes principales** :

| Méthode | Description |
|---------|-------------|
| `get(url, callback, options)` | Requête GET avec retry automatique |
| `post(url, data, callback, options)` | Requête POST avec corps JSON et retry |
| `poll(url, interval, callback, pollId)` | Démarre un polling périodique |
| `stopPoll(pollId)` | Arrête un polling spécifique |
| `stopAllPolls()` | Arrête tous les polling actifs |
| `abort()` | Annule toutes les requêtes en cours et arrête les polling |
| `buildUrl(baseUrl, params)` | Construction d'URL avec paramètres de requête (méthode statique) |

**Format de callback** : Toutes les méthodes utilisent un callback `function(success, data, message)` où `success` est un booléen indiquant le succès de l'opération, `data` contient la charge utile de la réponse, et `message` fournit un message lisible.

**En-têtes personnalisés** : Chaque requête inclut l'en-tête `X-Requested-With: XMLHttpRequest` pour identifier les requêtes AJAX côté serveur. Les requêtes POST incluent `Content-Type: application/json;charset=UTF-8`.

### 2.8 GameLogic (V2)

Le module `GameLogic` (fichier `game-logic.js`) contient l'ensemble de la logique pure du jeu côté serveur. Il s'agit du module le plus critique de la V2 car il garantit l'intégrité des règles et empêche toute tricherie. Ce module est sans état (stateless) : chaque fonction prend l'état du jeu en paramètre et retourne un nouvel état.

**Constantes exportées** :

- `DISTRIBUTION_ORDER` : Ordre de distribution pour chaque joueur (identique à V1)
- `PLAYER_HOLES` : Trous appartenant à chaque joueur

**Fonctions principales** :

| Fonction | Description |
|----------|-------------|
| `createInitialBoard()` | Crée un plateau initial (14 × 5) |
| `validateMove(board, holeIndex, player)` | Valide un coup (appartenance, trou vide, règle d'alimentation) |
| `distributeSeeds(board, holeIndex, player)` | Distribue les graines et retourne le dernier trou |
| `captureSeeds(board, lastHole, player)` | Calcule et exécute les captures (2-3 graines, chaîne, sécurité) |
| `canFeed(board, player)` | Vérifie si un joueur peut nourrir son adversaire |
| `checkGameOver(board, scores)` | Vérifie la fin de partie (graines épuisées) |
| `checkGameOverForPlayer(board, scores, nextPlayer)` | Vérifie la fin pour le prochain joueur |
| `executeMove(gameState, holeIndex, player)` | Exécute un coup complet (valider → distribuer → capturer → vérifier fin) |
| `createGameState(roomCode)` | Crée un état de jeu initial pour un salon |
| `getSafeGameState(gameState)` | Retourne un état filtré (sans IDs de session) pour le client |

---

## 3. Documentation de l'API V2

L'API REST de la version distribuée est accessible sous le préfixe `/api`. Toutes les réponses suivent un format JSON standardisé. Les endpoints utilisent les méthodes HTTP GET (pour les lectures) et POST (pour les actions modifiant l'état).

### 3.1 Format de réponse standard

Chaque réponse de l'API suit cette structure :

```json
{
  "success": true,
  "message": "Description lisible de l'opération",
  "data": { },
  "timestamp": 1700000000000
}
```

En cas d'erreur :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "data": null,
  "timestamp": 1700000000000
}
```

Les codes HTTP utilisés sont : `200` (succès), `400` (requête invalide), `403` (interdit), `404` (introuvable), `500` (erreur interne).

---

### 3.2 POST /api/create-room

Crée un nouveau salon de jeu. Le joueur qui crée le salon devient automatiquement le Joueur 1. Un code de salon unique de 6 caractères alphanumériques est généré, et un identifiant de session UUID est attribué au créateur.

**Requête** :

```
POST /api/create-room
Content-Type: application/json
```

Aucun corps requis.

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "Salon créé avec succès",
  "data": {
    "roomCode": "ABC123",
    "playerNumber": 1,
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": 1700000000000
}
```

**Réponse en erreur (500)** :

```json
{
  "success": false,
  "message": "Erreur lors de la création du salon",
  "data": null,
  "timestamp": 1700000000000
}
```

**Effets de bord** : Le salon est ajouté à la Map `gameRooms`, la session du joueur est enregistrée dans `playerSessions`, et un nettoyage des salons inactifs est déclenché.

---

### 3.3 POST /api/join-room

Permet à un joueur de rejoindre un salon existant. Le joueur reçoit automatiquement le numéro de joueur disponible (1 ou 2). Si les deux joueurs sont connectés, la partie démarre automatiquement (le statut passe de `waiting` à `playing`).

**Requête** :

```
POST /api/join-room
Content-Type: application/json

{
  "roomCode": "ABC123"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `roomCode` | string | Oui | Code du salon à rejoindre (insensible à la casse) |

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "Vous êtes le Joueur 2",
  "data": {
    "roomCode": "ABC123",
    "playerNumber": 2,
    "sessionId": "660e8400-e29b-41d4-a716-446655440001",
    "gameStatus": "playing"
  },
  "timestamp": 1700000000000
}
```

**Réponses en erreur** :

| Code | Message | Condition |
|------|---------|-----------|
| 400 | Champs manquants: roomCode | Champ manquant |
| 404 | Salon introuvable. Vérifiez le code. | Code invalide |
| 403 | Ce salon est complet | 2 joueurs déjà connectés |
| 403 | Cette partie est terminée | Partie finie |

---

### 3.4 GET /api/game-state

Récupère l'état actuel du jeu pour un salon donné. Cet endpoint est appelé régulièrement par le client (polling) pour maintenir l'affichage synchronisé. Il inclut également des informations sur la connexion de l'adversaire.

**Requête** :

```
GET /api/game-state?roomCode=ABC123&sessionId=550e8400-...
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `roomCode` | string | Oui | Code du salon |
| `sessionId` | string | Non | Identifiant de session (active le suivi de présence) |

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "État du jeu récupéré",
  "data": {
    "roomCode": "ABC123",
    "board": [5, 5, 4, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5],
    "currentPlayer": 2,
    "scores": { "1": 0, "2": 2 },
    "moveHistory": [
      {
        "player": 1,
        "holeIndex": 2,
        "seedsDistributed": 5,
        "captured": 2,
        "capturedHoles": [9],
        "lastHole": 9,
        "timestamp": 1700000000000
      }
    ],
    "gameStatus": "playing",
    "winner": null,
    "gameOverReason": null,
    "playersConnected": { "1": true, "2": true },
    "yourPlayerNumber": 1,
    "opponentConnected": true
  },
  "timestamp": 1700000000000
}
```

**Note** : Le champ `yourPlayerNumber` n'est présent que si un `sessionId` valide est fourni. Le champ `opponentConnected` indique si l'adversaire a eu une activité dans les 15 dernières secondes.

---

### 3.5 POST /api/make-move

Exécute un coup pour le joueur dont c'est le tour. Le serveur valide le coup, distribue les graines, calcule les captures, vérifie la fin de partie et met à jour l'état du salon. C'est l'endpoint le plus complexe car il implique toute la logique de jeu.

**Requête** :

```
POST /api/make-move
Content-Type: application/json

{
  "roomCode": "ABC123",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "holeIndex": 2
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `roomCode` | string | Oui | Code du salon |
| `sessionId` | string | Oui | Identifiant de session du joueur |
| `holeIndex` | number | Oui | Index du trou à jouer (0-13) |

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "2 graine(s) capturée(s) !",
  "data": {
    "roomCode": "ABC123",
    "board": [5, 5, 0, 6, 6, 6, 5, 5, 5, 0, 5, 5, 5, 5],
    "currentPlayer": 2,
    "scores": { "1": 2, "2": 0 },
    "moveHistory": [ "..." ],
    "gameStatus": "playing",
    "winner": null,
    "gameOverReason": null,
    "playersConnected": { "1": true, "2": true },
    "yourPlayerNumber": 1,
    "moveResult": {
      "captured": 2,
      "message": "2 graine(s) capturée(s) !"
    }
  },
  "timestamp": 1700000000000
}
```

**Réponses en erreur** :

| Code | Message | Condition |
|------|---------|-----------|
| 400 | Champs manquants | Paramètres requis absents |
| 400 | Index de trou invalide | holeIndex non numérique |
| 400 | Ce trou est vide | Trou choisi sans graines |
| 400 | Vous devez nourrir votre adversaire | Règle d'alimentation non respectée |
| 403 | Session invalide | sessionId non reconnu |
| 403 | Ce n'est pas votre tour | Pas le tour du joueur |
| 403 | La partie est terminée | Partie finie |
| 404 | Salon introuvable | Code salon invalide |

---

### 3.6 GET /api/check-connection

Vérifie si l'adversaire est toujours connecté. Cet endpoint est appelé périodiquement par le client pour détecter les déconnexions. Un joueur est considéré comme déconnecté si aucune activité n'a été enregistrée depuis plus de 15 secondes.

**Requête** :

```
GET /api/check-connection?roomCode=ABC123&sessionId=550e8400-...
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `roomCode` | string | Oui | Code du salon |
| `sessionId` | string | Oui | Identifiant de session |

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "Vérification de connexion",
  "data": {
    "opponentConnected": true,
    "gameStatus": "playing"
  },
  "timestamp": 1700000000000
}
```

---

### 3.7 POST /api/leave-room

Gère la déconnexion voluntary d'un joueur. Si la partie est en cours, l'autre joueur est déclaré gagnant par forfait. Si les deux joueurs ont quitté, le salon est supprimé de la mémoire.

**Requête** :

```
POST /api/leave-room
Content-Type: application/json

{
  "roomCode": "ABC123",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `roomCode` | string | Oui | Code du salon |
| `sessionId` | string | Oui | Identifiant de session |

**Réponse en succès (200)** :

```json
{
  "success": true,
  "message": "Vous avez quitté le salon",
  "data": null,
  "timestamp": 1700000000000
}
```

**Effets de bord** : Le joueur est retiré du salon. Si la partie était en cours, l'adversaire est déclaré gagnant. Si les deux joueurs sont partis, le salon est supprimé. La session du joueur est supprimée de `playerSessions`.

---

## 4. Structures de données

### 4.1 GameState (V2 — Serveur)

L'état du jeu est la structure de données centrale du serveur. Elle est stockée dans la Map `gameRooms` avec le code du salon comme clé.

```typescript
interface GameState {
  roomCode: string;           // Code unique du salon (6 caractères)
  board: number[];            // Tableau de 14 entiers (graines par trou)
  currentPlayer: 1 | 2;      // Joueur dont c'est le tour
  scores: {                   // Scores des joueurs
    1: number;
    2: number;
  };
  players: {                  // Sessions des joueurs (null si absent)
    1: string | null;         // UUID du Joueur 1
    2: string | null;         // UUID du Joueur 2
  };
  moveHistory: MoveRecord[];  // Historique complet des coups
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: 1 | 2 | 'draw' | null;
  gameOverReason: string | null;
}
```

**Cycle de vie** : Un `GameState` est créé lors de l'appel à `createGameState(roomCode)` avec le statut `waiting`. Il passe à `playing` lorsque les deux joueurs sont connectés. Il passe à `finished` lorsqu'un gagnant est déterminé ou qu'un joueur se déconnecte.

**Stockage** : Les états sont maintenus en mémoire (Map JavaScript). Il n'y a pas de persistance sur disque ; les salons sont perdus en cas de redémarrage du serveur. Le nettoyage automatique supprime les salons inactifs depuis plus de 2 heures.

### 4.2 MoveRecord (V2)

Chaque coup joué est enregistré dans un objet `MoveRecord` qui est ajouté à l'historique du `GameState`.

```typescript
interface MoveRecord {
  player: 1 | 2;              // Joueur qui a joué le coup
  holeIndex: number;          // Index du trou choisi (0-13)
  seedsDistributed: number;   // Nombre de graines distribuées
  captured: number;           // Nombre total de graines capturées
  capturedHoles: number[];    // Indices des trous capturés
  lastHole: number;           // Dernier trou de la distribution
  timestamp: number;          // Horodatage Unix en millisecondes
}
```

Ce structure permet de reconstituer l'intégralité d'une partie et est utilisée côté client pour l'affichage de l'historique et l'analyse des coups.

### 4.3 RoomState (V2 — Safe)

Le `RoomState` est la version sécurisée du `GameState` envoyée aux clients. Les informations sensibles (identifiants de session UUID) sont remplacées par des indicateurs booléens de connexion.

```typescript
interface RoomState {
  roomCode: string;
  board: number[];
  currentPlayer: 1 | 2;
  scores: { 1: number; 2: number };
  moveHistory: MoveRecord[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: 1 | 2 | 'draw' | null;
  gameOverReason: string | null;
  playersConnected: {        // Indicateurs de connexion (remplace les UUID)
    1: boolean;
    2: boolean;
  };
  yourPlayerNumber?: 1 | 2;  // Uniquement si sessionId fourni
  opponentConnected?: boolean; // Uniquement si sessionId fourni
  moveResult?: {              // Uniquement après un make-move
    captured: number;
    message: string;
  };
}
```

### 4.4 SessionData (V2 — Serveur)

Les données de session associent un identifiant de session UUID à un salon et un numéro de joueur. Elles sont stockées dans la Map `playerSessions`.

```typescript
interface SessionData {
  roomCode: string;          // Code du salon rejoint
  playerNumber: 1 | 2;      // Numéro du joueur dans le salon
  lastActivity: number;      // Horodatage de la dernière activité (ms)
}
```

**Utilisation** : Le `lastActivity` est mis à jour à chaque appel API du joueur. Il sert à détecter les déconnexions : un joueur est considéré déconnecté si `Date.now() - lastActivity > 15000` (15 secondes). Cette valeur est choisie pour tolérer les latences réseau tout en détectant rapidement les déconnexions réelles.

### 4.5 GameState V1 (Sérialisation locale)

En version locale, l'état du jeu est sérialisé différemment pour le stockage dans `localStorage` :

```typescript
interface LocalGameState {
  holes: number[];            // État du plateau (14 trous)
  currentPlayer: 1 | 2;
  scores: { 1: number; 2: number };
  moveHistory: LocalMoveRecord[];
  gameStatus: 'playing' | 'finished';
  winner: 1 | 2 | 'draw' | null;
  moveCount: number;
}

interface LocalMoveRecord {
  moveNumber: number;
  player: 1 | 2;
  holeIndex: number;
  seedsDistributed: number;
  captures: number[];         // Indices des trous capturés
  capturedCount: number;
  distributionPath: number[]; // Chemin complet de distribution
  lastHole: number;
}
```

La différence principale avec la V2 est la présence du champ `distributionPath` qui enregistre le chemin complet de distribution pour les animations, et le champ `moveNumber` pour la numérotation séquentielle des coups.

---

## 5. Implémentation des règles du jeu

### 5.1 Configuration du plateau

Le plateau du Songo comporte 14 trous répartis en deux rangées de 7. Chaque trou est initialement rempli de 5 graines, pour un total de 70 graines. La rangée du bas (trous 0 à 6) appartient au Joueur 1, la rangée du haut (trous 7 à 13) appartient au Joueur 2. Cette configuration est identique à la variante camerounaise traditionnelle de l'Oware, qui se distingue des autres variantes de Mancala par son nombre de trous (14 au lieu de 12) et de graines initiales (5 au lieu de 4).

### 5.2 Distribution des graines

Lorsqu'un joueur choisit un trou, il ramasse toutes les graines qu'il contient et les distribue une par une dans les trous suivants, dans le sens antihoraire. L'ordre de distribution est prédéfini pour chaque joueur :

- **Joueur 1** : les graines sont déposées de gauche à droite sur la rangée du bas (0→6), puis de droite à gauche sur la rangée du haut (13→7), puis le cycle recommence.
- **Joueur 2** : les graines sont déposées de droite à gauche sur la rangée du haut (13→7), puis de gauche à droite sur la rangée du bas (0→6), puis le cycle recommence.

**Règle du saut du trou de départ** : Si le nombre de graines distribuées est suffisant pour faire un tour complet du plateau (14 trous ou plus), le trou de départ est sauté. Cela signifie qu'un trou ne peut jamais recevoir de graine de lui-même lors de sa propre distribution. En V1, cette règle est implémentée par l'incrémentation dynamique du compteur `seedsToDistribute`, tandis qu'en V2, la distribution suit l'ordre cyclique sans traitement spécial du trou de départ (le trou est simplement incrémenté comme les autres).

### 5.3 Capture des graines

La capture constitue le mécanisme central du Songo. Après la distribution, si la dernière graine tombe dans un trou du camp adverse contenant alors exactement 2 ou 3 graines (graine posée comprise), le joueur capture les graines de ce trou. La capture peut s'étendre en chaîne aux trous précédents du camp adverse qui contiennent également 2 ou 3 graines.

**Procédure de capture en chaîne** : En partant du trou où la dernière graine a été déposée, le jeu remonte les trous précédents dans le camp adverse (dans le sens inverse de la distribution). Chaque trou contenant 2 ou 3 graines est capturé. La chaîne s'arrête dès qu'un trou contient un nombre de graines différent de 2 ou 3.

**Direction de remontée** :
- Si le Joueur 1 atterrit sur la rangée du Joueur 2 (trous 7-13), la remontée se fait vers les indices croissants (7→13).
- Si le Joueur 2 atterrit sur la rangée du Joueur 1 (trous 0-6), la remontée se fait vers les indices décroissants (6→0).

**Règle de sécurité** : Il est interdit de capturer des graines si cela laisserait l'adversaire sans aucune graine dans son camp. Dans ce cas, la capture entière est annulée et le joueur ne capture rien. Cette règle est essentielle pour maintenir le jeu jouable et éviter les situations de blocage prématuré. L'implémentation vérifie cette condition avant d'exécuter la capture : si `opponentSeedsAfterCapture === 0`, la capture est refusée.

### 5.4 Règle d'alimentation

Si l'adversaire n'a plus aucune graine dans son camp après un coup (ce qui n'est pas dû à une capture, mais à l'état naturel du plateau), le joueur dont c'est le tour doit jouer un coup qui donne au moins une graine à l'adversaire. Cette règle, appelée « règle d'alimentation », garantit que l'adversaire puisse toujours jouer.

**Implémentation** : La fonction `validateMove` vérifie d'abord si l'adversaire a des graines. Si ce n'est pas le cas, elle simule le coup proposé pour vérifier s'il dépose au moins une graine dans le camp adverse. Si ce n'est pas le cas, elle vérifie s'il existe un autre coup qui le ferait (fonction `findFeedingMove` / `canFeed`). Si un coup alternatif existe, le coup proposé est refusé. Si aucun coup ne peut nourrir l'adversaire, le coup est autorisé mais la partie se termine après son exécution.

### 5.5 Conditions de fin de partie

La partie se termine dans les cas suivants :

1. **Un joueur ne peut plus jouer** : Tous les trous du joueur actif sont vides. L'adversaire récupère alors toutes les graines restantes sur le plateau.
2. **Il ne reste qu'une seule graine ou aucune** : Le jeu ne peut plus se poursuivre de manière significative. Les graines restantes sont attribuées au joueur qui les possède.
3. **Impossible de nourrir l'adversaire** : Si le joueur dont c'est le tour ne peut effectuer aucun coup qui donne des graines à l'adversaire, la partie s'arrête. Les graines restantes dans chaque camp sont attribuées à leur propriétaire.
4. **Déconnexion d'un joueur (V2 uniquement)** : Si un joueur quitte volontairement la partie, son adversaire est déclaré gagnant par forfait.

**Détermination du gagnant** : Le joueur ayant capturé le plus de graines est déclaré vainqueur. En cas d'égalité, la partie est déclarée nulle (« draw »). Le seuil de victoire est de 36 graines (plus de la moitié des 70 graines initiales).

---

## 6. Descriptions des algorithmes

### 6.1 Algorithme de distribution

L'algorithme de distribution est le mécanisme fondamental du jeu. Il prend en entrée l'état du plateau, l'index du trou choisi et le numéro du joueur, et retourne le plateau modifié ainsi que le dernier trou atteint.

```
FONCTION distributeSeeds(plateau, trouDepart, joueur) :
    graines ← plateau[trouDepart]
    plateau[trouDepart] ← 0
    ordre ← DISTRIBUTION_ORDER[joueur]
    indexDepart ← ordre.indexOf(trouDepart)
    dernierTrou ← trouDepart

    POUR i DE 1 À graines :
        indexCible ← (indexDepart + i) MOD 14
        trouCible ← ordre[indexCible]
        plateau[trouCible] ← plateau[trouCible] + 1
        dernierTrou ← trouCible

    RETOURNER { plateau, dernierTrou, graines }
```

**Complexité** : O(k) où k est le nombre de graines distribuées (au maximum 70 au début de partie, décroissant au fil de la partie). La distribution ne saute pas le trou de départ en V2, alors qu'en V1, le compteur est incrémenté dynamiquement si le trou de départ est rencontré.

### 6.2 Algorithme de capture

L'algorithme de capture détermine les graines à capturer après une distribution. Il vérifie la condition des 2-3 graines, procède à la capture en chaîne et applique la règle de sécurité.

```
FONCTION captureSeeds(plateau, dernierTrou, joueur) :
    adversaire ← joueur opposé
    trousAdversaire ← PLAYER_HOLES[adversaire]

    SI dernierTrou n'appartient PAS à adversaire :
        RETOURNER { plateau, capturées: 0, trousCapturés: [] }

    trousAVérifier ← déterminer trous précédents selon direction

    trousCapturés ← []
    grainesCapturées ← 0

    // Vérifier le trou d'atterrissage
    SI plateau[dernierTrou] == 2 OU plateau[dernierTrou] == 3 :
        trousCapturés.ajouter(dernierTrou)
        grainesCapturées ← grainesCapturées + plateau[dernierTrou]

        // Capture en chaîne
        POUR CHAQUE trou DANS trousAVérifier :
            SI plateau[trou] == 2 OU plateau[trou] == 3 :
                trousCapturés.ajouter(trou)
                grainesCapturées ← grainesCapturées + plateau[trou]
            SINON :
                BREAK  // La chaîne est cassée

    SI trousCapturés est vide :
        RETOURNER { plateau, capturées: 0, trousCapturés: [] }

    // Règle de sécurité
    grainesAdversaireRestantes ← somme graines adversaire hors trous capturés
    SI grainesAdversaireRestantes == 0 :
        RETOURNER { plateau, capturées: 0, trousCapturés: [] }  // Capture annulée

    // Exécuter la capture
    POUR CHAQUE trou DANS trousCapturés :
        plateau[trou] ← 0

    RETOURNER { plateau, grainesCapturées, trousCapturés }
```

**Complexité** : O(n) où n est la taille de la rangée adverse (au maximum 7 trous à vérifier pour la chaîne). La vérification de sécurité est O(7) pour calculer les graines restantes de l'adversaire.

### 6.3 Algorithme de validation des coups

La validation d'un coup est un processus multi-étapes qui garantit le respect de toutes les règles du jeu. En V2, cette validation est effectuée côté serveur pour empêcher la tricherie.

```
FONCTION validateMove(plateau, trouIndex, joueur) :
    // 1. Vérification des bornes
    SI trouIndex < 0 OU trouIndex > 13 :
        RETOURNER { valide: false, raison: "Index invalide" }

    // 2. Vérification d'appartenance
    SI trouIndex n'appartient PAS au joueur :
        RETOURNER { valide: false, raison: "Trou adverse" }

    // 3. Vérification de trou non vide
    SI plateau[trouIndex] == 0 :
        RETOURNER { valide: false, raison: "Trou vide" }

    // 4. Règle d'alimentation
    SI adversaire n'a aucune graine :
        SIMULER la distribution pour ce coup
        SI la distribution ne dépose AUCUNE graine chez l'adversaire :
            VÉRIFIER si un autre coup pourrait nourrir l'adversaire
            SI un autre coup peut nourrir :
                RETOURNER { valide: false, raison: "Doit nourrir l'adversaire" }
            SINON :
                RETOURNER { valide: true }  // Aucun coup ne peut nourrir, celui-ci est autorisé

    RETOURNER { valide: true }
```

**Complexité** : Dans le pire cas (vérification de la règle d'alimentation), l'algorithme simule jusqu'à 7 coups (un par trou du joueur), chacun nécessitant O(k) pour la distribution, soit O(7 × k) ≈ O(k).

### 6.4 Algorithme de détection de fin de partie

La détection de fin de partie vérifie plusieurs conditions après chaque coup. L'algorithme `checkGameOverForPlayer` est utilisé en V2 pour vérifier si le prochain joueur peut effectivement jouer.

```
FONCTION checkGameOverForPlayer(plateau, scores, prochainJoueur) :
    grainesProchain ← somme graines du prochain joueur
    grainesAdversaire ← somme graines de l'adversaire

    // 1. Le prochain joueur n'a plus de graines
    SI grainesProchain == 0 :
        scores[adversaire] += grainesAdversaire
        RETOURNER déterminerGagnant(scores)

    // 2. L'adversaire n'a plus de graines et le prochain ne peut pas nourrir
    SI grainesAdversaire == 0 ET NON canFeed(plateau, prochainJoueur) :
        scores[prochainJoueur] += grainesProchain
        RETOURNER déterminerGagnant(scores)

    // 3. Une seule graine ou moins sur le plateau
    SI somme totale du plateau <= 1 :
        attribuer graines restantes aux propriétaires
        RETOURNER déterminerGagnant(scores)

    RETOURNER { finDePartie: false }
```

### 6.5 Algorithme de génération de codes de salon

Les codes de salon sont des chaînes alphanumériques de 6 caractères, composées de lettres majuscules (A-Z) et de chiffres (0-9), offrant 36^6 ≈ 2,18 milliards de combinaisons possibles.

```
FONCTION generateRoomCode() :
    caractères ← "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    RÉPÉTER :
        code ← ""
        POUR i DE 1 À 6 :
            code += caractères[aléatoire(0, 35)]
    TANT QUE gameRooms.contient(code)
    RETOURNER code
```

L'algorithme garantit l'unicité en vérifiant l'existence du code dans la Map `gameRooms` avant de le retourner. En pratique, les collisions sont extrêmement rares grâce à l'espace de combinaisons très vaste.

---

## 7. Options de configuration

### 7.1 Configuration du serveur (V2)

Le serveur Express accepte les variables d'environnement suivantes :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | 3000 | Port d'écoute du serveur |

**Dépendances** (définies dans `package.json`) :

| Package | Version | Rôle |
|---------|---------|------|
| `express` | ^4.18.2 / ^5.2.1 | Framework HTTP |
| `cors` | ^2.8.5 / ^2.8.6 | Gestion du Cross-Origin Resource Sharing |
| `uuid` | ^9.0.0 / ^14.0.0 | Génération d'identifiants uniques (UUID v4) |
| `body-parser` | ^1.20.2 / ^2.2.2 | Parsing des corps de requête |

**Nettoyage automatique** : Le serveur exécute un nettoyage des salons inactifs toutes les 10 minutes (`setInterval`). Un salon est considéré inactif si aucun de ses joueurs n'a eu d'activité dans les 2 dernières heures. Le nettoyage est également déclenché lors de la création d'un nouveau salon.

### 7.2 Configuration du client (V1)

**Paramètres du jeu** :

| Paramètre | Défaut | Options | Description |
|-----------|--------|---------|-------------|
| `animation` | `true` | `true` / `false` | Active les animations de distribution et capture |
| `speed` | `"normal"` | `"slow"` / `"normal"` / `"fast"` | Vitesse des animations (200ms / 100ms / 50ms) |

**Noms des joueurs** : Personnalisables via les paramètres (maximum 20 caractères). Par défaut : « Joueur 1 » et « Joueur 2 ».

**Thème** : Clair (`light`) ou sombre (`dark`), persisté dans `localStorage` sous la clé `songo_theme`.

### 7.3 Configuration de l'AjaxManager (V2)

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `timeout` | 10000 ms | Délai d'attente maximum par requête |
| `maxRetries` | 2 | Tentatives de retry en cas d'échec |
| `retryDelay` | 1000 ms | Délai entre les tentatives de retry |

**Intervals de polling** :

| Polling | Interval | Endpoint | Description |
|---------|----------|----------|-------------|
| État du jeu | 2000 ms | `/api/game-state` | Synchronisation de l'état |
| Connexion adversaire | 5000 ms | `/api/check-connection` | Détection de déconnexion |

### 7.4 Constantes du jeu (V1 & V2)

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `HOLES_PER_ROW` | 7 | Trous par rangée |
| `TOTAL_HOLES` | 14 | Total des trous |
| `SEEDS_PER_HOLE` | 5 | Graines initiales par trou |
| `TOTAL_SEEDS` | 70 | Total des graines |
| `CAPTURE_CONDITIONS` | 2, 3 | Nombre de graines déclenchant une capture |
| `INACTIVITY_TIMEOUT` | 15000 ms | Seuil de déconnexion (V2) |
| `ROOM_EXPIRY` | 7200000 ms (2h) | Durée de vie max d'un salon inactif (V2) |
| `CLEANUP_INTERVAL` | 600000 ms (10 min) | Fréquence de nettoyage (V2) |
| `ROOM_CODE_LENGTH` | 6 | Longueur du code de salon (V2) |

---

## 8. Gestion des erreurs

### 8.1 Erreurs côté serveur (V2)

Le serveur implémente une gestion d'erreurs à plusieurs niveaux :

**Validation des entrées** : Chaque endpoint vérifie la présence des champs requis via la fonction `validateRequest`. En cas de champ manquant, une réponse 400 est retournée avec la liste des champs absents. Les codes de salon sont normalisés (majuscules, trim) avant utilisation.

**Erreurs métier** : Les erreurs liées à la logique du jeu (coup invalide, tour incorrect, salon plein, etc.) retournent des codes HTTP 400 ou 403 avec un message explicite en français. Ces erreurs sont prévisibles et font partie du fonctionnement normal du jeu.

**Erreurs internes** : Les exceptions imprévues sont interceptées par un bloc `try-catch` dans chaque endpoint et par le middleware d'erreur global d'Express. Elles retournent un code 500 avec un message générique. L'erreur complète est loguée dans la console du serveur pour le débogage.

**Middleware d'erreur global** :

```javascript
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        data: null,
        timestamp: Date.now()
    });
});
```

### 8.2 Erreurs côté client (V2)

**Erreurs réseau** : L'`AjaxManager` gère trois types d'erreurs réseau :
- `onerror` : Erreur de connexion (serveur injoignable, DNS, etc.)
- `ontimeout` : Délai d'attente dépassé
- Erreurs HTTP (codes 4xx, 5xx)

Chaque erreur déclenche un mécanisme de retry automatique (jusqu'à `maxRetries` tentatives) avec un délai de `retryDelay` entre chaque tentative. Si toutes les tentatives échouent, le callback est appelé avec `success = false` et un message d'erreur approprié.

**Erreurs de parsing** : Si la réponse du serveur n'est pas du JSON valide, une erreur de parsing est loguée dans la console et le callback reçoit `success = false` avec le message « Erreur de parsing de la réponse ».

**Overlay d'erreur** : Le client affiche un overlay d'erreur modale avec un message descriptif pour les erreurs critiques. L'utilisateur peut fermer l'overlay et réessayer.

### 8.3 Erreurs côté client (V1)

**Erreurs de sauvegarde** : Si `localStorage` n'est pas disponible ou plein, la méthode `save()` retourne `false` et un message d'erreur est affiché à l'utilisateur. La méthode `load()` retourne `null` en cas d'erreur de parsing ou d'absence de sauvegarde.

**Erreurs de validation** : Les coups invalides sont signalés par un message temporaire affiché pendant 2,5 secondes avec une bordure de couleur d'erreur. Les messages possibles sont : « Ce n'est pas votre tour », « Vous devez choisir un trou de votre camp », « Ce trou est vide », « Vous devez jouer un coup qui donne au moins une graine à l'adversaire ».

### 8.4 Codes d'erreur API (V2)

| Code HTTP | Condition | Message type |
|-----------|-----------|-------------|
| 400 | Champ manquant | « Champs manquants: roomCode, sessionId » |
| 400 | Index invalide | « Index de trou invalide » |
| 400 | Coup invalide | « Ce trou est vide » / « Vous devez nourrir votre adversaire » |
| 403 | Session invalide | « Session invalide » |
| 403 | Pas son tour | « Ce n'est pas votre tour » |
| 403 | Partie terminée | « La partie est terminée » |
| 403 | Salon complet | « Ce salon est complet » |
| 404 | Salon introuvable | « Salon introuvable » |
| 500 | Erreur interne | « Erreur interne du serveur » |

---

## 9. Considérations de sécurité

### 9.1 Validation côté serveur

La sécurité du jeu repose sur le principe fondamental que le serveur est l'autorité de confiance. Toute la logique de validation et d'exécution des coups est effectuée côté serveur dans `game-logic.js`. Le client ne fait qu'envoyer une intention de coup (`holeIndex`) et le serveur décide si le coup est valide et l'exécute. Cela empêche toute modification côté client (par exemple via la console du navigateur) de contourner les règles du jeu.

**Vérifications côté serveur** :
- Le coup provient d'un trou appartenant au joueur (vérification d'appartenance)
- Le joueur dont c'est le tour est celui qui effectue le coup (vérification de session + tour)
- Le trou choisi contient des graines (vérification d'état)
- La règle d'alimentation est respectée (vérification contextuelle)
- La partie est toujours en cours (vérification de statut)

### 9.2 Gestion des sessions

Les sessions utilisent des UUID v4 (128 bits, générés aléatoirement) comme identifiants. Chaque session associe un joueur à un salon et un numéro de joueur. Le `sessionId` est généré par le serveur et transmis au client lors de la création ou la jonction d'un salon. Il doit être inclus dans chaque requête ultérieure pour authentifier le joueur.

**Limitations actuelles** :
- Les sessions sont stockées en mémoire et perdues au redémarrage du serveur.
- Il n'y a pas de mécanisme d'expiration automatique des sessions (sauf le nettoyage des salons inactifs).
- Un `sessionId` volé pourrait permettre à un attaquant de se faire passer pour le joueur.

### 9.3 Filtrage des données sensibles

La fonction `getSafeGameState` supprime les UUID des joueurs avant d'envoyer l'état au client. Au lieu des identifiants de session, seuls des indicateurs booléens de connexion sont transmis (`playersConnected`). Cela empêche un joueur d'obtenir l'identifiant de session de son adversaire et de jouer à sa place.

### 9.4 Protection CORS

Le middleware `cors` est activé pour permettre le développement local (le client et le serveur peuvent être sur des ports différents). En production, il serait nécessaire de configurer CORS pour restreindre les origines autorisées.

### 9.5 Limites de sécurité actuelles

- **Absence d'authentification** : Il n'y a pas de système de compte utilisateur. N'importe qui peut créer ou rejoindre un salon avec le code.
- **Absence de rate limiting** : L'API n'est pas protégée contre les attaques par déni de service. Un client malveillant pourrait inonder le serveur de requêtes.
- **Absence de HTTPS** : La configuration par défaut utilise HTTP, ce qui expose les identifiants de session en clair sur le réseau.
- **Injection de données** : Bien que `express.json()` ne parse que le corps JSON, il n'y a pas de validation de type approfondie au-delà de la vérification des champs requis.
- **Stockage en mémoire** : Les données de jeu sont perdues en cas de crash du serveur. Un mécanisme de persistance (base de données, fichier) serait nécessaire pour un déploiement en production.

### 9.6 Recommandations pour la production

1. **Ajouter l'authentification** : Système de comptes utilisateurs avec mots de passe hachés (bcrypt) et tokens JWT.
2. **Configurer CORS** : Restreindre les origines autorisées au domaine de production.
3. **Activer HTTPS** : Utiliser un certificat TLS (Let's Encrypt) et rediriger HTTP vers HTTPS.
4. **Ajouter le rate limiting** : Utiliser `express-rate-limit` pour limiter le nombre de requêtes par adresse IP.
5. **Valider les entrées** : Utiliser une bibliothèque comme `joi` ou `zod` pour valider le type et le format de chaque champ.
6. **Persister les données** : Remplacer le stockage en mémoire par une base de données (Redis pour les sessions, PostgreSQL/MongoDB pour l'historique).
7. **Sanitiser les sorties** : S'assurer qu'aucune donnée sensible n'est incluse dans les réponses API.

---

## 10. Considérations de performance

### 10.1 Performance du serveur

**Mémoire** : Chaque salon occupe environ 1 à 2 Ko en mémoire (état du plateau, historique, sessions). Le serveur peut théoriquement gérer des milliers de salons simultanés. Le nettoyage automatique toutes les 10 minutes prévient l'accumulation de salons inactifs. La Map `gameRooms` et la Map `playerSessions` offrent un accès en O(1) par clé, ce qui est optimal pour les opérations fréquentes.

**CPU** : Les opérations de jeu (validation, distribution, capture) ont une complexité linéaire en fonction du nombre de graines distribuées, avec un maximum de 70 itérations. La validation de la règle d'alimentation nécessite au maximum 7 simulations de coups. Ces opérations sont négligeables en termes de charge CPU.

**Réseau** : Le polling génère un trafic constant même en l'absence d'action. Avec un intervalle de 2 secondes pour l'état du jeu et 5 secondes pour la connexion, chaque client génère environ 0,7 requête par seconde. Pour N parties actives (2N clients), cela représente 1,4N requêtes par seconde. L'utilisation de WebSocket réduirait ce trafic en ne poussant les mises à jour que lorsqu'elles se produisent.

### 10.2 Performance du client

**Rendu DOM** : La méthode `renderBoard` parcourt les 14 trous et met à jour les éléments DOM. En V1, la création et la suppression d'éléments `seed` pour chaque trou peuvent être coûteuses si le nombre de graines est élevé. L'approche actuelle supprime et recrée tous les éléments `.seed` à chaque rendu. Une optimisation possible serait de comparer l'état précédent avec le nouvel état et de ne modifier que les trous ayant changé.

**Animations** : Les animations de distribution utilisent des `setTimeout` et des promesses pour créer des délais séquentiels. Pendant l'animation, le drapeau `animating` bloque toute interaction utilisateur, empêchant les états incohérents. Les vitesses configurables (50-200ms par trou) permettent d'adapter le rendu à la puissance de l'appareil.

**Polling** : Le client maintient deux boucles de polling actives pendant toute la durée de la partie. Cela consomme des ressources réseau et CPU même en l'absence d'activité. Les requêtes de polling sont légères (réponse JSON d'environ 500 octets) mais leur fréquence peut être réduite pour les appareils à faible bande passante.

### 10.3 Optimisations possibles

1. **Remplacer le polling par WebSocket** : Éliminer les requêtes inutiles en ne poussant les mises à jour que lorsqu'un coup est joué ou qu'un événement se produit. Cela réduirait la latence perçue et le trafic réseau de manière significative.

2. **Rendu incrémental** : Ne mettre à jour que les trous modifiés au lieu de reconstruire l'ensemble du plateau. Garder une copie de l'état précédent et comparer avec le nouvel état pour déterminer les différences.

3. **Compression des réponses** : Activer la compression gzip sur le serveur Express (`compression` middleware) pour réduire la taille des réponses JSON, notamment pour l'historique des coups qui croît au fil de la partie.

4. **Mise en cache côté client** : Éviter de redessiner le plateau si l'état n'a pas changé depuis la dernière requête de polling. Comparer les numéros de tour ou les horodatages.

5. **Pagination de l'historique** : Ne pas envoyer l'historique complet des coups à chaque requête de polling. Envoyer uniquement les coups depuis la dernière vérification, ou limiter l'historique aux N derniers coups.

6. **Base de données** : Remplacer le stockage en mémoire par Redis pour les sessions et les états de jeu, permettant une meilleure scalabilité et une persistance entre les redémarrages.

7. **Lazy loading des ressources** : Charger les fichiers CSS et JavaScript de manière asynchrone pour améliorer le temps de chargement initial de la page.

---

*Document généré pour le projet Songo — Version 1.0*
