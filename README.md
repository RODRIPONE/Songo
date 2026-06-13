# SONGO - Jeu Traditionnel Camerounais
## Projet complet : Version Locale (V1) + Version Distribuée (V2)

---

## Structure du projet

```
songo/
├── version_locale/              # Version 1 : jeu local (2 joueurs, même machine)
│   ├── html/index.html          # Page principale
│   ├── css/style.css            # Feuille de style
│   └── js/songo.js              # Logique du jeu
│
├── version_distante/            # Version 2 : jeu distribué (2 joueurs distants)
│   ├── client/
│   │   ├── html/index.html      # Interface client
│   │   ├── css/style.css        # Style client
│   │   └── js/songo-client.js   # Logique client + AJAX
│   ├── serveur/
│   │   ├── server.js            # Serveur Express
│   │   ├── game-logic.js        # Logique de jeu côté serveur
│   │   └── package.json         # Dépendances serveur
│   ├── ajax/
│   │   └── ajax-manager.js      # Module de communication AJAX
│   └── api/
│       └── api-routes.js        # Routes API REST
│
├── documentation/               # Diagrammes UML + documentation
│   ├── diagramme-cas-utilisation.png
│   ├── diagramme-classes.png
│   ├── diagramme-sequence-locale.png
│   ├── diagramme-sequence-distante.png
│   ├── diagramme-activite.png
│   ├── architecture-v1.png
│   ├── architecture-v2.png
│   ├── modele-donnees.png
│   ├── documentation-technique.md
│   └── documentation-utilisateur.md
│
├── rapports/
│   └── rapport-songo.pdf        # Rapport complet (24 pages)
│
└── README.md                    # Ce fichier
```

---

## Version 1 : Jeu Local

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)

### Installation & Exécution
```bash
# Aucune installation nécessaire !
# Ouvrez simplement le fichier dans votre navigateur :

# Méthode 1 : Double-clic
Ouvrir version_locale/html/index.html dans votre navigateur

# Méthode 2 : Ligne de commande
open version_locale/html/index.html          # macOS
xdg-open version_locale/html/index.html      # Linux
start version_locale/html/index.html         # Windows
```

### Fonctionnalités
- Plateau interactif 14 trous, 70 graines
- Distribution antihoraire des graines
- Captures simples et en chaîne
- Règle d'alimentation et règle de sécurité
- Calcul automatique des scores
- Détection de fin de partie
- Historique des coups
- Sauvegarde/chargement (localStorage)
- Thème clair/sombre
- Animations de distribution et capture

---

## Version 2 : Jeu Distribué

### Prérequis
- **Node.js** version 14 ou supérieure
- **npm** (installé avec Node.js)
- Un navigateur web moderne

### Installation & Exécution

```bash
# 1. Accéder au dossier de la version distante
cd version_distante/serveur/

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
node server.js

# 4. Le serveur démarre sur http://localhost:3000
# 5. Ouvrir http://localhost:3000 dans DEUX navigateurs différents
#    (ou deux onglets en navigation privée)
```

### Mode de jeu
1. **Joueur 1** : Cliquez sur "Créer une partie" → notez le code du salon
2. **Joueur 2** : Entrez le code du salon → cliquez sur "Rejoindre"
3. Jouez à tour de rôle, le plateau se met à jour automatiquement

### API du serveur (endpoints AJAX)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/create-room` | Créer un salon de jeu |
| POST | `/api/join-room` | Rejoindre un salon |
| GET | `/api/game-state?roomCode=XXX` | Obtenir l'état du jeu |
| POST | `/api/make-move` | Jouer un coup |
| GET | `/api/check-connection?roomCode=XXX` | Vérifier la connexion |
| POST | `/api/leave-room` | Quitter le salon |

---

## Règles du Songo

### Plateau
- 14 trous (7 par joueur), 70 graines (5 par trou au départ)
- Rangée basse = Joueur 1, Rangée haute = Joueur 2

### Déroulement
1. Le Joueur 1 commence
2. Choisir un trou de votre camp (non vide)
3. Ramasser toutes les graines et les distribuer une par une, sens antihoraire
4. Le trou de départ est sauté si on fait le tour complet

### Capture
- Si la dernière graine tombe dans un trou adverse contenant 2 ou 3 graines → capture
- Capture en chaîne : les trous précédents avec 2 ou 3 graines sont aussi capturés
- Règle de sécurité : on ne peut pas capturer toutes les graines adverses

### Fin de partie
- Un joueur ne peut plus jouer (tous ses trous vides)
- Il ne reste qu'une seule graine sur le plateau
- Le joueur avec le plus de graines capturées gagne

---

## Technologies utilisées

| Version | Technologies |
|---------|-------------|
| V1 Locale | HTML5, CSS3, JavaScript |
| V2 Distribuée | HTML5, CSS3, JavaScript, AJAX (XMLHttpRequest), Node.js, Express |

---

## Auteur
Projet académique - Jeu traditionnel camerounais Songo
# PR_songo
# Songo
