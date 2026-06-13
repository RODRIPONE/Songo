# Songo V2 — Déploiement sur Render.com

## Structure du repo (importante pour Render)

```
songo/                        ← racine du repo GitHub
├── server.js                 ← point d'entrée (Render cherche ici)
├── game-logic.js             ← logique de jeu
├── package.json              ← scripts start/build
├── render.yaml               ← config automatique Render (optionnel)
├── .gitignore
├── client/
│   ├── html/index.html       ← interface du jeu
│   ├── css/style.css
│   └── js/songo-client.js
├── ajax/
│   └── ajax-manager.js
└── version_locale/           ← version standalone (hors ligne)
    ├── html/index.html
    ├── css/style.css
    └── js/songo.js
```

---

## 🚀 Déploiement sur Render — Étape par étape

### Étape 1 : Préparer le repo GitHub

```bash
# Si tu n'as pas encore initialisé le repo
git init
git add .
git commit -m "feat: songo v2 - prêt pour render"
git branch -M main
git remote add origin https://github.com/rodri237/songo.git
git push -u origin main
```

> ⚠️ **Important** : Le `package.json` et `server.js` doivent être **à la racine** du repo, pas dans un sous-dossier.

### Étape 2 : Créer le service sur Render

1. Va sur **https://render.com** → Se connecter avec GitHub
2. Clique sur **"New +"** → **"Web Service"**
3. Connecte ton repo GitHub **songo**
4. Configure le service :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | songo-v2 |
| **Region** | Frankfurt (EU) ou Oregon (US) |
| **Branch** | main |
| **Root Directory** | *(laisser vide)* |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Dans **"Environment Variables"**, ajoute :

| Clé | Valeur |
|-----|--------|
| `NODE_ENV` | `production` |

> `PORT` est automatiquement injecté par Render, **ne pas le définir manuellement**.

6. Clique **"Create Web Service"** ✅

### Étape 3 : Vérifier le déploiement

Render va :
1. Cloner ton repo
2. Exécuter `npm install`
3. Lancer `npm start` → `node server.js`
4. Exposer l'app sur une URL du type : `https://songo-v2.onrender.com`

Pour vérifier que tout fonctionne :
```
https://songo-v2.onrender.com/api/health
```
Réponse attendue :
```json
{ "success": true, "message": "Songo V2 opérationnel", "data": { "rooms": 0, "players": 0 } }
```

---

## 🔧 Variables d'environnement

| Variable | Description | Valeur |
|----------|-------------|--------|
| `PORT` | Port d'écoute | **Automatique** (Render l'injecte) |
| `NODE_ENV` | Environnement | `production` |

---

## ⚠️ Comportement sur Render Free

- **Sleep après 15 min d'inactivité** : le service s'endort si personne ne joue. La première requête après le sleep prend ~30 secondes (wake up). C'est normal sur le plan gratuit.
- **Rooms perdues au redémarrage** : les parties en cours sont en mémoire (RAM). Si Render redémarre le service, toutes les rooms sont effacées. C'est une limitation du stockage in-memory.
- **Solution pour éviter le sleep** : utilise [UptimeRobot](https://uptimerobot.com) (gratuit) pour pinger `/api/health` toutes les 10 minutes.

---

## 🔄 Mettre à jour le code

```bash
# Modifier les fichiers localement, puis :
git add .
git commit -m "fix: description du changement"
git push origin main
# Render redéploie automatiquement !
```

---

## 🧪 Tester en local avant de déployer

```bash
npm install
npm start
# Ouvrir http://localhost:3000 dans 2 onglets/navigateurs
```

---

## 📡 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Vérifier que le serveur tourne |
| POST | `/api/create-room` | Créer un salon de jeu |
| POST | `/api/join-room` | Rejoindre un salon (code requis) |
| GET | `/api/game-state` | État actuel du jeu |
| POST | `/api/make-move` | Jouer un coup |
| GET | `/api/check-connection` | Vérifier si l'adversaire est connecté |
| POST | `/api/leave-room` | Quitter le salon |

---

## 🐛 Problèmes fréquents

### "Cannot find module './game-logic'"
→ Vérifie que `game-logic.js` est bien à la **racine** du repo (même niveau que `server.js`)

### Build échoue avec "missing script: start"
→ Vérifie que ton `package.json` contient `"start": "node server.js"`

### L'app charge mais les requêtes API échouent (CORS)
→ Le CORS est déjà configuré (`app.use(cors())`). Si problème, vérifie l'URL utilisée côté client.

### Render affiche "Port not bound" dans les logs
→ Render exige que le serveur écoute sur `process.env.PORT`. Le code le fait déjà : `const PORT = process.env.PORT || 3000`

---

## Auteur

**Rodri** — ENSPY, Université de Yaoundé I 🇨🇲  
GitHub : https://github.com/rodri237
# Songo_Render
