# Documentation Utilisateur — Songo

> Variante camerounaise de l'Oware/Mancala — Guide complet du joueur

---

## Table des matières

1. [Présentation du jeu et histoire du Songo](#1-présentation-du-jeu-et-histoire-du-songo)
2. [Explication des règles](#2-explication-des-règles)
3. [Jouer en Version 1 (locale)](#3-jouer-en-version-1-locale)
4. [Jouer en Version 2 (distribuée)](#4-jouer-en-version-2-distribuée)
5. [Description de l'interface](#5-description-de-linterface)
6. [Conseils et stratégies](#6-conseils-et-stratégies)
7. [Résolution des problèmes courants](#7-résolution-des-problèmes-courants)
8. [Foire aux questions (FAQ)](#8-foire-aux-questions-faq)

---

## 1. Présentation du jeu et histoire du Songo

### 1.1 Qu'est-ce que le Songo ?

Le Songo est un jeu de société traditionnel africain appartenant à la grande famille des jeux de Mancala, considérés comme parmi les plus anciens jeux de stratégie au monde. Le terme « Mancala » provient de l'arabe « naqala » qui signifie « déplacer », reflétant le principe fondamental de ces jeux : déplacer des graines ou des pierres d'un trou à un autre selon des règles précises. Le Songo est la variante camerounaise de cette famille, pratiqué principalement dans les régions du Cameroun où il constitue un véritable patrimoine culturel vivant.

Le plateau de Songo se compose de 14 trous répartis en deux rangées de 7, chaque trou contenant initialement 5 graines, soit un total de 70 graines. Cette configuration distingue le Songo de nombreuses autres variantes de Mancala qui utilisent généralement 12 trous et 48 graines (4 par trou). Les 14 trous du Songo offrent un espace de jeu plus vaste et des possibilités stratégiques plus riches, rendant les parties plus longues et plus profondes tactiquement.

L'objectif du jeu est simple : capturer plus de graines que son adversaire. Cependant, la simplicité apparente des règles masque une profondeur stratégique remarquable. Chaque coup modifie l'ensemble du plateau, et les conséquences d'un choix peuvent se répercuter sur de nombreux tours. Le Songo est un jeu d'anticipation, de calcul et de patience, où le meilleur stratège l'emporte.

### 1.2 Histoire et origines

Les jeux de Mancala trouvent leurs origines dans l'Afrique antique, avec des traces archéologiques remontant à plus de 3 000 ans. Des fouilles en Éthiopie et au Soudan ont révélé des plateaux gravés dans la pierre, attestant de la pratique de ces jeux depuis la haute Antiquité. Au fil des siècles, les jeux de Mancala se sont diffusés à travers tout le continent africain, puis vers le Moyen-Orient, l'Asie du Sud-Est et les Caraïbes par les routes commerciales et les diasporas.

Le Songo, variante spécifiquement camerounaise, s'est développé dans le contexte culturel des communautés du Cameroun, où il est traditionnellement joué sur des plateaux sculptés dans le bois, creusés directement dans la terre ou tracés sur le sol. Les graines utilisées sont souvent des graines naturelles comme les graines de Caïlcédrat ou les graines d'Adzom, qui sont petites, lisses et parfaitement adaptées au jeu. Le Songo occupe une place importante dans la vie sociale camerounaise : il est pratiqué dans les cours, les marchés, les lieux de rencontre, et constitue un vecteur de transmission culturelle entre les générations.

Le jeu est souvent accompagné de chants, de proverbes et de rituels sociaux qui renforcent les liens communautaires. Les parties peuvent durer plusieurs heures et attirent des spectateurs qui commentent les coups et encouragent les joueurs. Le Songo n'est pas qu'un divertissement : il développe la concentration, la capacité de calcul mental et la pensée stratégique, des qualités très valorisées dans la tradition camerounaise.

### 1.3 Le Songo à l'ère numérique

Cette version numérique du Songo propose deux modes de jeu distincts pour s'adapter à tous les contextes. La Version 1 (locale) permet à deux joueurs de s'affronter sur le même appareil, idéal pour les parties en face-à-face. La Version 2 (distribuée) permet à deux joueurs de s'affronter à distance via Internet, chacun sur son propre appareil. Les deux versions partagent les mêmes règles et le même souci de fidélité à la tradition, tout en exploitant les possibilités offertes par le numérique : animations fluides, sauvegarde automatique, vérification automatique des règles, et accessibilité accrue.

---

## 2. Explication des règles

### 2.1 Matériel et mise en place

Le Songo se joue sur un plateau composé de deux rangées de 7 trous chacune, soit 14 trous au total. Au début de la partie, chaque trou contient exactement 5 graines, pour un total de 70 graines sur le plateau. La rangée inférieure (trous 1 à 7) appartient au Joueur 1, et la rangée supérieure (trous 8 à 14) appartient au Joueur 2. Le Joueur 1 commence toujours la partie.

```
     CAMP DU JOUEUR 2
  ┌────┬────┬────┬────┬────┬────┬────┐
  │ 5  │ 5  │ 5  │ 5  │ 5  │ 5  │ 5  │  Trous 7-13
  └────┴────┴────┴────┴────┴────┴────┘
  ┌────┬────┬────┬────┬────┬────┬────┐
  │ 5  │ 5  │ 5  │ 5  │ 5  │ 5  │ 5  │  Trous 0-6
  └────┴────┴────┴────┴────┴────┴────┘
     CAMP DU JOUEUR 1
```

Les graines sont des éléments neutres qui n'appartiennent à aucun joueur tant qu'elles sont sur le plateau. Elles ne deviennent la propriété d'un joueur que lorsqu'elles sont capturées. Il n'y a pas de grenier ou de réserve dans le Songo camerounais, contrairement à d'autres variantes de Mancala.

### 2.2 Déroulement d'un tour

À son tour de jeu, un joueur doit obligatoirement choisir l'un des trous de son propre camp qui contient au moins une graine. Il ramasse alors toutes les graines présentes dans ce trou et les distribue une par une dans les trous suivants, dans le sens antihoraire. Le sens antihoraire signifie que le jeu se déroule dans la direction opposée aux aiguilles d'une montre.

**Pour le Joueur 1** : La distribution commence par la rangée du bas, de gauche à droite (trou 0 → 1 → 2 → 3 → 4 → 5 → 6), puis continue sur la rangée du haut, de droite à gauche (trou 13 → 12 → 11 → 10 → 9 → 8 → 7), puis revient sur la rangée du bas si nécessaire.

**Pour le Joueur 2** : La distribution commence par la rangée du haut, de droite à gauche (trou 13 → 12 → 11 → 10 → 9 → 8 → 7), puis continue sur la rangée du bas, de gauche à droite (trou 0 → 1 → 2 → 3 → 4 → 5 → 6), puis revient sur la rangée du haut si nécessaire.

**Exemple concret** : Le Joueur 1 choisit le trou n°2 qui contient 5 graines. Il dépose une graine dans le trou 3, une dans le trou 4, une dans le trou 5, une dans le trou 6, et la dernière dans le trou 13 (premier trou de la rangée du haut dans le sens de distribution). Le trou de départ (trou 2) est maintenant vide.

```
AVANT :   [5] [5] [5] [5] [5] [5] [5]    (rangée du bas, trous 0-6)
           [5] [5] [5] [5] [5] [5] [5]    (rangée du haut, trous 7-13)

Le Joueur 1 joue le trou 2 :

APRÈS :   [5] [5] [0] [6] [6] [6] [6]    (trou 2 vide, trous 3-6 +1)
           [6] [5] [5] [5] [5] [5] [5]    (trou 13 +1)
```

### 2.3 La capture des graines

La capture est le mécanisme central qui permet de marquer des points. Après avoir distribué toutes les graines, le joueur vérifie si la dernière graine déposée se trouve dans le camp adverse (la rangée de l'adversaire). Si c'est le cas et que le trou où la dernière graine a été déposée contient alors exactement 2 ou 3 graines (en comptant la graine qui vient d'y être déposée), le joueur capture toutes les graines de ce trou.

**Capture en chaîne** : Après avoir capturé le trou où la dernière graine est tombée, le joueur vérifie les trous précédents dans le camp adverse (dans le sens inverse de la distribution). Si un trou précédent contient également 2 ou 3 graines, il est capturé. La chaîne continue tant que les trous consécutifs contiennent 2 ou 3 graines. Dès qu'un trou contient un nombre différent (1, 4, 5, etc.), la chaîne est brisée et la capture s'arrête.

**Exemple de capture simple** : Le Joueur 1 dépose sa dernière graine dans le trou 10 du camp adverse. Ce trou contient maintenant 2 graines. Le Joueur 1 capture ces 2 graines.

**Exemple de capture en chaîne** : Le Joueur 1 dépose sa dernière graine dans le trou 9 du camp adverse. Le trou 9 contient 3 graines (capture). Le trou précédent (10) contient 2 graines (capture). Le trou encore avant (11) contient 4 graines (pas de capture, la chaîne s'arrête). Total : 5 graines capturées.

```
Distribution du Joueur 1, dernière graine au trou 9 :

Camp adverse (Joueur 2) :
  Trou 7 : 1 graine   ← Pas dans la chaîne (arrêt avant)
  Trou 8 : 4 graines  ← Pas dans la chaîne (arrêt avant)
  Trou 9 : 3 graines  ← CAPTURÉ (dernier trou)
  Trou 10 : 2 graines ← CAPTURÉ (chaîne)
  Trou 11 : 4 graines ← Chaîne brisée (ni 2 ni 3)
  Trou 12 : 5 graines ← Non concerné
  Trou 13 : 5 graines ← Non concerné

Résultat : 3 + 2 = 5 graines capturées par le Joueur 1
```

### 2.4 La règle de sécurité

Il existe une règle fondamentale de sécurité : un joueur ne peut jamais capturer des graines si cela laisserait l'adversaire sans aucune graine dans son camp. Cette règle est essentielle car elle garantit que l'adversaire pourra toujours jouer au tour suivant. Si une capture (même en chaîne) aboutirait à vider complètement le camp adverse, la capture entière est annulée et le joueur ne capture rien pour ce coup.

**Exemple** : Le Joueur 1 a la possibilité de capturer les trous 8, 9 et 10 du camp adverse. Mais après cette capture, le Joueur 2 n'aurait plus aucune graine dans son camp (les autres trous de son camp sont déjà vides). La capture est donc annulée et le Joueur 1 ne capture rien.

### 2.5 La règle d'alimentation

Si, au début de son tour, un joueur constate que l'adversaire n'a plus aucune graine dans son camp (tous les trous adverses sont vides), il doit obligatoirement jouer un coup qui dépose au moins une graine dans le camp adverse. Cette règle, appelée « règle d'alimentation », garantit que le jeu peut se poursuivre.

Si le joueur a un coup qui nourrit l'adversaire, il doit le jouer (ou un autre coup qui nourrit également). S'il tente de jouer un coup qui ne nourrit pas l'adversaire alors qu'un coup alternatif le ferait, le jeu refuse le coup et affiche un message d'erreur. Si aucun des coups possibles ne peut nourrir l'adversaire, le joueur peut jouer n'importe quel coup et la partie se termine après ce coup.

**Exemple** : Le Joueur 1 doit jouer. Le camp du Joueur 2 est complètement vide. Le Joueur 1 choisit le trou 0 qui contient 3 graines. Après distribution, les graines atterrissent dans les trous 1, 2 et 3 — tous dans le camp du Joueur 1. L'adversaire n'est pas nourri. Si le trou 4 du Joueur 1 contient 8 graines, la distribution atteindrait le camp adverse. Le Joueur 1 doit donc jouer le trou 4 (ou un autre trou qui nourrit).

### 2.6 Fin de partie

La partie se termine dans l'une des situations suivantes :

1. **Un joueur ne peut plus jouer** : Tous les trous du joueur dont c'est le tour sont vides. L'adversaire récupère alors toutes les graines restantes sur le plateau et les ajoute à son score.

2. **Il ne reste qu'une seule graine ou moins** : Le jeu ne peut plus se poursuivre de manière significative. Les graines restantes sur le plateau sont attribuées au joueur dans le camp duquel elles se trouvent.

3. **Impossible de nourrir l'adversaire** : Le joueur dont c'est le tour ne peut effectuer aucun coup qui donne des graines à l'adversaire. Les graines restantes dans chaque camp sont attribuées à leur propriétaire.

**Détermination du gagnant** : Le joueur ayant capturé le plus de graines est déclaré vainqueur. Puisqu'il y a 70 graines au total, il faut en capturer au moins 36 pour gagner. En cas d'égalité parfaite (35-35), la partie est déclarée nulle.

---

## 3. Jouer en Version 1 (locale)

### 3.1 Démarrage

La Version 1 du Songo est conçue pour être jouée localement par deux joueurs sur le même appareil. Pour commencer, ouvrez simplement le fichier `index.html` situé dans le dossier `version_locale/html/` de votre navigateur web. Aucune installation ni connexion Internet n'est nécessaire — tout fonctionne entièrement dans le navigateur.

Au lancement, le plateau s'affiche avec les 14 trous remplis de 5 graines chacun. Le message « C'est au Joueur 1 de jouer – choisissez un trou dans votre rangée. » s'affiche dans la zone de message. Les trous du joueur actif sont visuellement mis en surbrillance (état actif), tandis que les trous de l'adversaire et les trous vides sont estompés (état inactif).

### 3.2 Jouer un coup

Pour jouer un coup, le joueur dont c'est le tour clique sur l'un des trous de sa rangée qui contient des graines. Le jeu procède alors aux étapes suivantes :

1. **Validation** : Le jeu vérifie que le trou appartient au joueur actif, qu'il n'est pas vide, et que le coup respecte la règle d'alimentation. Si le coup est invalide, un message d'erreur rouge s'affiche temporairement.

2. **Animation de distribution** : Si les animations sont activées, les graines sont distribuées visuellement trou par trou avec un effet de surbrillance. La vitesse dépend du paramètre choisi (lent, normal, rapide).

3. **Capture** : Si des graines sont capturées, les trous concernés sont brièvement mis en surbrillance avec un effet visuel de capture. Les graines disparaissent du plateau et le score est mis à jour.

4. **Changement de tour** : L'indicateur de tour bascule vers l'autre joueur. Le message est mis à jour. Les trous actifs/inactifs sont recalculés.

Si la partie est terminée après le coup, une modale de fin de partie s'affiche avec les scores finaux et le nom du gagnant.

### 3.3 Sauvegarder et charger une partie

Le jeu offre la possibilité de sauvegarder l'état complet d'une partie en cours pour la reprendre plus tard. Cliquez sur le bouton **« Sauvegarder »** pour enregistrer la partie dans la mémoire de votre navigateur (localStorage). Un message de confirmation s'affiche. La sauvegarde inclut l'état du plateau, les scores, l'historique des coups et les paramètres.

Pour charger une partie précédemment sauvegardée, cliquez sur le bouton **« Charger »**. Si une sauvegarde existe, la partie est restaurée exactement dans l'état où elle avait été sauvegardée, y compris l'historique des coups. Si aucune sauvegarde n'existe, un message d'erreur s'affiche.

**Note importante** : La sauvegarde est stockée localement dans votre navigateur. Si vous effacez les données de navigation ou utilisez un autre navigateur, la sauvegarde sera perdue. Il n'y a qu'un seul emplacement de sauvegarde ; chaque nouvelle sauvegarde écrase la précédente.

### 3.4 Paramètres

Cliquez sur l'icône ⚙ (engrenage) en haut à droite pour accéder aux paramètres :

- **Animations** : Cochez ou décochez pour activer/désactiver les animations de distribution et de capture. Si les animations sont désactivées, les coups sont exécutés instantanément.
- **Vitesse de distribution** : Choisissez entre Lente (200 ms par trou), Normale (100 ms) ou Rapide (50 ms). La vitesse n'affecte que les animations, pas la logique du jeu.
- **Noms des joueurs** : Saisissez les noms personnalisés des joueurs (maximum 20 caractères). Ces noms remplacent « Joueur 1 » et « Joueur 2 » dans l'interface et l'historique.

### 3.5 Autres fonctionnalités

- **Nouvelle Partie** : Réinitialise le plateau et commence une nouvelle partie. L'historique est effacé.
- **Reprendre** : Réinitialise également la partie (identique à Nouvelle Partie dans la version actuelle).
- **Thème** : Cliquez sur l'icône ☀/☽ pour basculer entre le thème clair et le thème sombre. Le choix est mémorisé.
- **Aide** : Cliquez sur l'icône ⓘ pour afficher un résumé des règles dans une fenêtre modale.
- **Historique** : La section en bas de page affiche la liste de tous les coups joués. Cliquez sur « Effacer » pour vider l'historique.

---

## 4. Jouer en Version 2 (distribuée)

### 4.1 Prérequis

La Version 2 du Songo nécessite un serveur Node.js en cours d'exécution. Pour lancer le serveur :

1. Assurez-vous que Node.js est installé sur votre machine (version 14 ou supérieure).
2. Ouvrez un terminal dans le dossier `version_distante/`.
3. Exécutez la commande `npm install` pour installer les dépendances (Express, CORS, UUID).
4. Exécutez la commande `npm start` pour démarrer le serveur.
5. Le serveur démarre sur le port 3000 par défaut (configurable via la variable d'environnement `PORT`).

Une fois le serveur démarré, chaque joueur ouvre son navigateur à l'adresse `http://localhost:3000` (ou l'adresse IP du serveur si les joueurs sont sur des machines différentes). Une connexion Internet n'est pas strictement nécessaire si les joueurs sont sur le même réseau local.

### 4.2 Créer un salon

Le premier joueur (celui qui souhaite créer la partie) clique sur le bouton **« Créer un salon »** sur l'écran de connexion. Le serveur génère alors un code de salon unique de 6 caractères alphanumériques (par exemple : « ABC123 »). Ce code s'affiche en grand sur l'écran d'attente. Le joueur est automatiquement assigné comme Joueur 1.

L'écran d'attente affiche une animation de chargement et le message « En attente de l'adversaire ». Le joueur doit communiquer le code du salon à son adversaire par le moyen de son choix (message, oral, etc.). Le joueur peut annuler la création du salon en cliquant sur le bouton **« Annuler »**.

### 4.3 Rejoindre un salon

Le second joueur saisit le code du salon dans le champ prévu à cet effet (par exemple : « ABC123 ») et clique sur le bouton **« Rejoindre un salon »**. Le code est insensible à la casse (abc123 et ABC123 sont équivalents). Si le code est valide et que le salon n'est pas complet, le joueur est assigné comme Joueur 2 et la partie démarre immédiatement.

**Erreurs possibles** :
- « Salon introuvable » : Le code saisi ne correspond à aucun salon actif. Vérifiez le code et réessayez.
- « Ce salon est complet » : Deux joueurs sont déjà connectés au salon. Vous devez créer un nouveau salon.
- « Cette partie est terminée » : La partie associée au salon est déjà finie.

### 4.4 Jouer en ligne

Une fois les deux joueurs connectés, l'écran de jeu s'affiche. L'interface est similaire à la Version 1 avec quelques différences importantes :

- **Tour restreint** : Vous ne pouvez jouer que lorsque c'est votre tour. Les trous de votre camp sont actifs (cliquables) uniquement quand c'est votre tour de jeu. Quand c'est le tour de l'adversaire, tous les trous sont désactivés.
- **Synchronisation** : L'état du jeu est actualisé automatiquement toutes les 2 secondes via le polling. Vous n'avez pas besoin de rafraîchir la page.
- **Connexion de l'adversaire** : La présence de votre adversaire est vérifiée toutes les 5 secondes. Si l'adversaire est détecté comme déconnecté, un avertissement s'affiche.

Pour jouer un coup, cliquez simplement sur l'un des trous de votre camp qui contient des graines. Le coup est envoyé au serveur pour validation et exécution. Si le coup est valide, le plateau est mis à jour. Si le coup est invalide, un message d'erreur s'affiche.

### 4.5 Gestion de la déconnexion

Si votre adversaire se déconnecte (fermeture du navigateur, perte de connexion, etc.), un overlay d'avertissement s'affiche avec le message « Adversaire déconnecté » et une animation d'attente. Vous avez deux options :

- **Attendre** : Laissez l'overlay affiché. Si votre adversaire se reconnecte (en rouvrant la page et en rejoignant le même salon), la partie reprend automatiquement.
- **Quitter** : Cliquez sur « Quitter la partie » pour déclarer forfait de l'adversaire. Vous êtes déclaré gagnant par forfait.

Si vous fermez accidentellement votre navigateur, vous pouvez rouvrir la page et rejoindre le salon avec le même code. Cependant, votre session précédente sera perdue et vous devrez rejoindre le salon comme un nouveau joueur. Si votre place est toujours disponible, vous pourrez reprendre la partie.

### 4.6 Fin de partie en ligne

Lorsque la partie se termine (conditions de fin normales ou déconnexion), l'écran de fin de partie s'affiche avec :
- Le résultat (Victoire, Défaite ou Match nul)
- Les scores finaux des deux joueurs
- La raison de la fin de partie

Vous pouvez ensuite :
- **Nouvelle partie** : Créer un nouveau salon pour rejouer.
- **Retour au menu** : Retourner à l'écran de connexion.

---

## 5. Description de l'interface

### 5.1 Le plateau de jeu

Le plateau est l'élément central de l'interface. Il occupe la majeure partie de l'écran et représente les 14 trous disposés en deux rangées de 7. Chaque trou est un élément cliquable qui affiche visuellement les graines qu'il contient. Le nombre de graines peut également être affiché sous forme numérique dans certains modes.

**Rangée du haut (Camp du Joueur 2)** : Les trous 7 à 13 sont affichés de droite à gauche (le trou 13 est à gauche, le trou 7 est à droite), correspondant à la perspective du Joueur 2 assis en face. Cette disposition respecte la tradition du jeu en face-à-face.

**Rangée du bas (Camp du Joueur 1)** : Les trous 0 à 6 sont affichés de gauche à droite, correspondant à la perspective du Joueur 1.

**Ligne de front** : Une ligne de séparation visuelle entre les deux rangées, souvent décorée de motifs traditionnels, indique la frontière entre les deux camps.

**États visuels des trous** :
- **Actif** : Le trou est cliquable, visuellement mis en évidence (couleur vive, bordure). Cela indique que le trou appartient au joueur actif et contient des graines.
- **Inactif** : Le trou est estompé (opacité réduite, couleur grisée). Cela indique que le trou n'est pas jouable (appartient à l'adversaire ou est vide).
- **Sélectionné** : Le trou est brièvement mis en surbrillance pendant l'animation de distribution pour indiquer le point de départ.
- **Dépôt de graine** : Un effet visuel bref (flash) se produit sur chaque trou recevant une graine pendant l'animation.
- **Capture** : Les trous capturés sont mis en surbrillance avec un effet spécial avant que les graines ne disparaissent.

### 5.2 Les scores

Les scores des deux joueurs sont affichés de manière proéminente, généralement au-dessus et au-dessous du plateau ou sur les côtés. Chaque score indique :

- **Le nom du joueur** : Par défaut « Joueur 1 » et « Joueur 2 », personnalisable dans les paramètres (V1).
- **Le nombre de graines capturées** : Ce nombre augmente chaque fois que le joueur capture des graines. Il est mis à jour immédiatement après chaque coup.
- **L'unité** : « graines capturées » pour préciser ce que représente le nombre.

Le score est le seul indicateur de progression vers la victoire. Le premier joueur à atteindre 36 graines capturées est mathématiquement assuré de gagner (puisqu'il ne reste que 34 graines maximum pour l'adversaire).

### 5.3 Les indicateurs de tour

Chaque joueur dispose d'un indicateur de tour qui montre son état actuel :

- **« À vous de jouer »** (vert/actif) : C'est le tour de ce joueur. Il doit choisir un trou dans sa rangée.
- **« En attente »** (gris/inactif) : C'est le tour de l'adversaire. Ce joueur doit patienter.
- **« Partie terminée »** : La partie est finie. Plus aucun coup ne peut être joué.

L'indicateur de tour est essentiel pour savoir à qui c'est le tour, particulièrement en Version 1 où les deux joueurs partagent le même écran.

### 5.4 La zone de message

La zone de message, située sous le plateau, affiche des informations contextuelles :

- **Message informatif** (bordure standard) : Messages normaux comme « C'est au Joueur 1 de jouer », « Partie sauvegardée avec succès ! », « Partie chargée ».
- **Message d'erreur** (bordure rouge) : Messages d'erreur comme « Ce trou est vide », « Ce n'est pas votre tour », « Vous devez jouer un coup qui donne au moins une graine à l'adversaire ».

Les messages d'erreur sont temporaires et disparaissent après 2,5 secondes, remplacés par le message d'information standard.

### 5.5 Les boutons d'action (V1)

La Version 1 propose quatre boutons d'action sous le plateau :

| Bouton | Icône | Fonction |
|--------|-------|----------|
| Nouvelle Partie | ✿ | Réinitialise le plateau et commence une nouvelle partie |
| Reprendre | ↻ | Redémarre la partie en cours |
| Sauvegarder | 💾 | Sauvegarde l'état actuel dans le navigateur |
| Charger | 📂 | Charge la dernière sauvegarde |

### 5.6 Les boutons d'en-tête (V1)

En haut à droite de l'écran, trois boutons d'icône sont disponibles :

| Bouton | Icône | Fonction |
|--------|-------|----------|
| Thème | ☀/☽ | Bascule entre thème clair et sombre |
| Aide | ⓘ | Affiche les règles du jeu dans une modale |
| Paramètres | ⚙ | Ouvre les paramètres (animations, vitesse, noms) |

### 5.7 L'écran de connexion (V2)

L'écran de connexion de la Version 2 comporte :

- **Le titre « SONGO »** et le sous-titre « Version Distribuée »
- **Le bouton « Créer un salon »** : Pour initialiser une nouvelle partie
- **Le champ de saisie du code** : Pour entrer le code d'un salon existant
- **Le bouton « Rejoindre un salon »** : Pour rejoindre une partie en cours
- **Le texte informatif** : « Variante camerounaise de l'Oware/Mancala »

### 5.8 L'historique des coups (V1)

La section d'historique, en bas de page, affiche la liste chronologique de tous les coups joués. Chaque entrée indique :

- **Le numéro du coup** : « Coup #1 », « Coup #2 », etc.
- **Le nom du joueur** : Qui a joué le coup
- **Le trou joué** : Quel trou a été choisi
- **Les captures** : Le nombre de graines capturées, le cas échéant (ex : « +3 graines »)

L'historique défile automatiquement vers le bas pour afficher le dernier coup. Le bouton « Effacer » permet de vider l'historique (sans affecter la partie en cours).

---

## 6. Conseils et stratégies

### 6.1 Stratégies de base

**Contrôler le nombre de graines par trou** : Le cœur de la stratégie du Songo réside dans la gestion du nombre de graines dans chaque trou. Rappelez-vous que seuls les trous contenant 2 ou 3 graines peuvent être capturés. Un trou contenant 1 graine est sûr (impossible à capturer), un trou en contenant 4 ou plus est également sûr. Privilégiez les configurations où vos trous contiennent 1, 4 ou plus de graines, et essayez de créer des situations où les trous adverses contiennent 2 ou 3 graines au moment où votre dernière graine y tombe.

**L'art du calcul** : Avant de jouer un coup, prenez le temps de calculer mentalement où votre dernière graine atterrira. Comptez le nombre de graines dans le trou choisi et suivez mentalement la distribution. Si la dernière graine tombe dans un trou adverse contenant 1 ou 2 graines (avant votre dépôt), vous déclencherez une capture. Ce calcul est la compétence fondamentale du Songo.

**Préserver ses graines** : En début de partie, évitez de vider vos trous trop rapidement. Un camp avec de nombreux trous vides est vulnérable car l'adversaire peut plus facilement viser vos trous restants. Essayez de maintenir un équilibre entre les trous de votre camp, en évitant les concentrations excessives qui attirent l'attention.

### 6.2 Stratégies intermédiaires

**Le grand tour** : Les trous contenant beaucoup de graines (12 ou plus) permettent de faire un tour complet du plateau. Ces « grands coups » sont extrêmement puissants car ils déposent une graine dans chaque trou du plateau, modifiant profondément l'équilibre du jeu. Utilisez-les avec parcimonie et calculez soigneusement leur résultat.

**La chaîne de capture** : La capture en chaîne est le moyen le plus efficace de prendre beaucoup de graines en un seul coup. Pour créer une chaîne, il faut que plusieurs trous adverses consécutifs contiennent 2 ou 3 graines. Vous pouvez préparer cette situation en distribuant stratégiquement vos graines pour amener les trous adverses au nombre souhaité. Par exemple, si un trou adverse contient 1 graine, déposer une graine supplémentaire le met à 2 (capturable).

**Le blocage** : Une stratégie défensive consiste à s'arranger pour que l'adversaire ne puisse pas capturer vos graines. Si vous pouvez faire en sorte que vos trous contiennent 1 ou 4+ graines au moment où l'adversaire termine sa distribution, il ne pourra rien capturer. Cette stratégie est particulièrement efficace en milieu de partie.

**L'alimentation forcée** : Si l'adversaire n'a plus de graines dans son camp, vous êtes obligé de le « nourrir ». Utilisez cette contrainte à votre avantage : choisissez le coup qui nourrit l'adversaire tout en vous plaçant dans une position favorable pour le coup suivant. Évitez de donner trop de graines à l'adversaire d'un seul coup.

### 6.3 Stratégies avancées

**La anticipation à plusieurs coups** : Les meilleurs joueurs de Songo pensent plusieurs coups à l'avance. Chaque coup modifie le plateau, il faut donc anticiper les réponses possibles de l'adversaire et préparer des enchaînements. Par exemple, vous pouvez délibérément laisser une capture facile à l'adversaire pour le forcer à vider un trou stratégique, puis exploiter cette ouverture au tour suivant.

**Le comptage des graines** : En fin de partie, quand il reste peu de graines sur le plateau, le comptage précis devient crucial. Vous devez connaître exactement combien de graines chaque joueur a capturées et combien il en reste sur le plateau. Si vous avez 34 graines et qu'il en reste 6 sur le plateau, vous savez que vous devez en capturer au moins 2 pour gagner.

**La gestion de la vitesse** : En début de partie, les coups sont rapides car il y a beaucoup de graines. En fin de partie, les coups sont lents car il y a peu de graines et chaque erreur est coûteuse. Adaptez votre rythme de réflexion en conséquence : jouez rapidement les coups évidents en début de partie, et prenez votre temps pour les décisions critiques en fin de partie.

**Le sacrifice calculé** : Parfois, il est stratégique de laisser l'adversaire capturer quelques graines si cela vous permet de mettre en place une capture plus importante au tour suivant. Ce type de sacrifice calculé est la marque des joueurs expérimentés.

### 6.4 Erreurs courantes à éviter

- **Jouer trop vite** : Ne cliquez pas sur le premier trou disponible sans réfléchir. Chaque coup est important et une erreur peut coûter la partie.
- **Ignorer la règle d'alimentation** : Oublier que vous devez nourrir l'adversaire quand son camp est vide peut vous faire perdre un tour précieux.
- **Se focaliser sur les captures immédiates** : Une capture qui vide votre camp ou qui laisse l'adversaire dans une position forte n'est pas toujours le meilleur choix.
- **Sous-estimer les grands coups** : Les trous avec beaucoup de graines changent radicalement le plateau. Ne les jouez pas sans calcul approfondi.
- **Ne pas compter les graines adverses** : Ignorer le score de l'adversaire peut vous faire rater le moment critique où il faut accélérer ou se défendre.

---

## 7. Résolution des problèmes courants

### 7.1 Le jeu ne se charge pas

**Symptôme** : La page s'affiche mais le plateau ne se charge pas, ou la page reste blanche.

**Solutions** :
- Vérifiez que vous utilisez un navigateur moderne (Chrome, Firefox, Edge, Safari — version récente).
- Assurez-vous que JavaScript est activé dans les paramètres de votre navigateur.
- Videz le cache du navigateur et rechargez la page (Ctrl+F5 ou Cmd+Shift+R).
- Essayez un autre navigateur pour déterminer si le problème est spécifique.
- Vérifiez la console du navigateur (F12 → Console) pour les messages d'erreur.

### 7.2 Les coups ne fonctionnent pas

**Symptôme** : Je clique sur un trou mais rien ne se passe.

**Solutions** :
- Vérifiez que c'est bien votre tour de jeu. Les trous de l'adversaire sont désactivés.
- Assurez-vous que le trou choisi contient des graines (un trou vide ne peut pas être joué).
- Si une animation est en cours, attendez qu'elle se termine avant de cliquer.
- En Version 2, vérifiez que vous êtes connecté au serveur (le message d'état doit indiquer « En cours »).
- Vérifiez le message d'information : si le jeu refuse votre coup, il affiche la raison (trou vide, tour incorrect, règle d'alimentation).

### 7.3 La sauvegarde ne fonctionne pas (V1)

**Symptôme** : Le message « Erreur lors de la sauvegarde » s'affiche.

**Solutions** :
- Vérifiez que le stockage local n'est pas désactivé dans les paramètres du navigateur.
- Vérifiez que le stockage local n'est pas plein (les données du navigateur peuvent être limitées).
- Essayez de libérer de l'espace en supprimant les données d'autres sites.
- Vérifiez que vous n'êtes pas en mode de navigation privée, qui peut limiter le stockage local.
- Certains navigateurs bloquent le stockage local si les cookies sont désactivés. Activez les cookies.

### 7.4 Impossible de rejoindre un salon (V2)

**Symptôme** : Le message « Salon introuvable » s'affiche alors que le code est correct.

**Solutions** :
- Vérifiez que le serveur est bien en cours d'exécution et que vous accédez à la bonne adresse.
- Vérifiez que le code saisi correspond exactement à celui affiché par le créateur (insensible à la casse).
- Le salon a peut-être expiré (les salons inactifs sont supprimés après 2 heures). Demandez au créateur de recréer un salon.
- Vérifiez que vous êtes sur le même serveur que le créateur (même adresse IP et port).
- Rafraîchissez la page et réessayez.

### 7.5 L'adversaire est indiqué comme déconnecté (V2)

**Symptôme** : L'overlay « Adversaire déconnecté » s'affiche alors que l'adversaire est toujours là.

**Solutions** :
- L'adversaire a peut-être un problème de connexion temporaire. Attendez quelques secondes.
- L'adversaire a peut-être changé d'onglet ou réduit la fenêtre, ce qui peut ralentir le polling.
- Vérifiez votre propre connexion Internet.
- Si le problème persiste, l'adversaire peut quitter la page et rejoindre le salon à nouveau.
- Le seuil de déconnexion est de 15 secondes d'inactivité. Les réseaux lents peuvent déclencher de fausses alertes.

### 7.6 Le serveur ne démarre pas (V2)

**Symptôme** : La commande `npm start` génère une erreur.

**Solutions** :
- Vérifiez que Node.js est installé (`node --version` doit retourner v14 ou supérieur).
- Exécutez `npm install` dans le dossier `version_distante/` pour installer les dépendances.
- Vérifiez que le port 3000 n'est pas déjà utilisé par une autre application.
- Si le port est occupé, changez-le avec la variable d'environnement : `PORT=8080 npm start`.
- Sur Linux/Mac, les ports en dessous de 1024 nécessitent des privilèges administrateur.
- Consultez les messages d'erreur dans le terminal pour des informations détaillées.

### 7.7 Les animations sont saccadées

**Symptôme** : Les animations de distribution des graines sont lentes ou saccadées.

**Solutions** :
- Passez à une vitesse d'animation plus rapide dans les paramètres (Rapide au lieu de Normale).
- Désactivez les animations si votre appareil est lent.
- Fermez les autres onglets et applications qui consomment des ressources.
- Essayez un autre navigateur (Chrome est généralement le plus performant pour les animations).
- Réduisez la taille de la fenêtre du navigateur pour diminuer la charge de rendu.

---

## 8. Foire aux questions (FAQ)

### Q1 : Combien de joueurs peuvent jouer au Songo ?

Le Songo se joue strictement à deux joueurs. En Version 1, les deux joueurs partagent le même écran. En Version 2, chaque joueur utilise son propre appareil et se connecte au même salon de jeu. Il n'existe pas de mode solo contre l'ordinateur dans la version actuelle.

### Q2 : Combien de temps dure une partie ?

La durée d'une partie varie considérablement en fonction du niveau des joueurs et de leurs styles de jeu. Une partie entre joueurs débutants peut durer 10 à 15 minutes, tandis qu'une partie entre joueurs expérimentés, qui calculent chaque coup, peut durer 30 minutes à une heure. La sauvegarde (V1) permet de reprendre une partie interrompue.

### Q3 : Le Joueur 1 a-t-il un avantage ?

Le Joueur 1 joue en premier, ce qui lui confère un léger avantage théorique dans les jeux de Mancala. Cependant, cet avantage est minimal au Songo grâce à la configuration à 14 trous et 5 graines, qui offre suffisamment de profondeur pour compenser. Dans la pratique, le meilleur stratège gagne indépendamment de qui commence.

### Q4 : Peut-on jouer au Songo hors ligne ?

Oui, la Version 1 fonctionne entièrement hors ligne. Ouvrez simplement le fichier `index.html` dans votre navigateur. Aucune connexion Internet ni installation de serveur n'est nécessaire. La Version 2, en revanche, nécessite un serveur en cours d'exécution, mais les joueurs peuvent être sur le même réseau local sans accès Internet.

### Q5 : Que se passe-t-il si je ferme le navigateur en cours de partie ?

**Version 1** : Si vous n'avez pas sauvegardé, la partie est perdue. Si vous avez sauvegardé, vous pouvez la recharger au prochain lancement. Pensez à sauvegarder régulièrement !

**Version 2** : Votre session est perdue et votre adversaire sera averti de votre déconnexion. Si vous rouvrez la page rapidement et rejoignez le même salon, vous pourrez éventuellement reprendre la partie si votre place n'a pas été prise. Sinon, l'adversaire sera déclaré gagnant par forfait.

### Q6 : Peut-on personnaliser les noms des joueurs ?

Oui, en Version 1. Cliquez sur l'icône ⚙ (Paramètres) et saisissez les noms souhaités (maximum 20 caractères). Ces noms apparaissent dans les scores, les indicateurs de tour et l'historique. En Version 2, les noms sont fixes (« Joueur 1 » et « Joueur 2 ») et ne sont pas personnalisables dans la version actuelle.

### Q7 : Pourquoi ne puis-je pas jouer un coup alors que c'est mon tour ?

Plusieurs raisons possibles :
- Le trou choisi est vide (il ne contient aucune graine).
- Le trou choisi appartient à l'adversaire (vous ne pouvez jouer que dans votre rangée).
- La règle d'alimentation vous oblige à jouer un autre trou qui nourrit l'adversaire.
- En Version 2, votre tour n'est pas encore arrivé (le serveur n'a pas encore mis à jour l'état).

### Q8 : Comment fonctionne la capture en chaîne ?

La capture en chaîne se produit lorsque plusieurs trous consécutifs du camp adverse contiennent 2 ou 3 graines à l'endroit où votre dernière graine atterrit. La capture commence par le trou d'atterrissage et remonte les trous précédents dans le camp adverse. La chaîne s'arrête dès qu'un trou ne contient ni 2 ni 3 graines. Tous les trous capturés dans la chaîne sont vidés et les graines sont ajoutées à votre score.

### Q9 : Que signifie « Vous devez nourrir votre adversaire » ?

Ce message apparaît lorsque l'adversaire n'a plus aucune graine dans son camp et que le coup que vous tentez de jouer ne dépose aucune graine dans le camp adverse. Vous devez choisir un autre trou qui, après distribution, déposera au moins une graine chez l'adversaire. Si aucun de vos coups ne peut nourrir l'adversaire, n'importe quel coup est autorisé et la partie se termine ensuite.

### Q10 : Le Songo est-il identique à l'Oware ?

Le Songo est une variante camerounaise de l'Oware, qui appartient lui-même à la famille des Mancala. Les principales différences avec l'Oware standard sont : le nombre de trous (14 au lieu de 12), le nombre de graines initiales (5 au lieu de 4), et certaines variations dans les règles de capture et de fin de partie. L'esprit du jeu est le même, mais la configuration camerounaise offre des possibilités stratégiques différentes.

### Q11 : Est-il possible de jouer à plus de deux ?

Non, le Songo est strictement un jeu à deux joueurs. Le plateau est divisé en deux camps et les règles sont conçues pour l'affrontement entre deux adversaires. Il n'existe pas de variante à trois ou quatre joueurs dans la tradition camerounaise.

### Q12 : Comment puis-je améliorer mon niveau ?

La pratique est le meilleur moyen de progresser au Songo. Voici quelques conseils :
- Jouez régulièrement pour développer votre intuition du nombre de graines.
- Calculez systématiquement le trou d'arrivée de votre dernière graine avant de jouer.
- Observez les coups de joueurs expérimentés et essayez de comprendre leur logique.
- En fin de partie, pratiquez le comptage précis des graines restantes.
- Étudiez les captures en chaîne : apprenez à les créer et à les anticiper.
- Expérimentez différentes stratégies (offensive, défensive, équilibrée) pour trouver votre style.

### Q13 : Peut-on jouer au Songo sur mobile ?

Oui, l'interface du Songo est conçue pour être responsive et s'adapter aux écrans de taille réduite. Sur mobile, les trous sont plus petits mais restent cliquables. En Version 2, deux joueurs peuvent s'affronter depuis leurs téléphones respectifs en se connectant au même serveur. Pour une expérience optimale, il est recommandé d'utiliser un appareil avec un écran d'au moins 5 pouces.

### Q14 : Les règles du Songo varient-elles selon les régions du Cameroun ?

Oui, comme pour de nombreux jeux traditionnels, il existe des variantes locales du Songo au Cameroun. Certaines régions jouent avec des règles légèrement différentes concernant les captures, la fin de partie ou le nombre de graines. Les règles implémentées dans cette version numérique correspondent à la variante la plus couramment pratiquée et la plus documentée.

### Q15 : Où puis-je trouver un adversaire en ligne ?

La Version 2 permet de jouer à distance, mais elle ne dispose pas de système de matchmaking automatique. Vous devez communiquer le code du salon à votre adversaire par vos propres moyens (message, e-mail, etc.). Pour trouver des adversaires, vous pouvez rejoindre des communautés de joueurs de Mancala en ligne, des forums de jeux de société africains, ou simplement inviter vos amis à jouer.

---

*Document généré pour le projet Songo — Version 1.0*
