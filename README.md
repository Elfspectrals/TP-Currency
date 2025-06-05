# Jérôme NEUPERT

## Description du projet
Ce site est un convertisseur de devises interactif doté d’une carte mondiale cliquable.  
L’utilisateur peut sélectionner deux pays en cliquant directement sur la carte :  
- Le premier pays sélectionné sera colorié en rouge (Pays 1)  
- Le deuxième pays sélectionné sera colorié en bleu (Pays 2)  

Un champ numérique permet ensuite de saisir un montant dans la devise du Pays 1. Le site calcule automatiquement le taux de change entre la devise du Pays 1 et la devise du Pays 2, puis affiche le résultat sous forme :  



L’interface a été stylisée pour donner une ambiance « agence de voyage », avec un fond dégradé chaleureux, des bordures arrondies et des couleurs rappelant l’aventure.

---

## Fonctionnement technique

1. **Chargement de la carte SVG**  
   - La carte du monde est intégrée via un `<object>` HTML pointant sur un fichier `world.svg`.  
   - Chaque pays est représenté par un `<path>` portant deux attributs principaux :  
     - `id` : identifiant en majuscules, correspondant au code ISO 2 ou 3 lettres (par ex. « FR » pour France).  
     - `name` : nom complet du pays (par ex. « France »).  

2. **Sélection des pays**  
   - Au chargement du SVG, un script parcourt tous les `<path>` et y attache un événement `click`.  
   - Premier clic :  
     - Si aucun pays n’était sélectionné, ce pays devient « Pays 1 » (colorié en rouge).  
     - On récupère via l’API REST Countries la devise ISO (ex. « EUR ») correspondant au pays.  
   - Deuxième clic :  
     - Si « Pays 1 » est déjà choisi et que le clic porte sur un autre pays, celui-ci devient « Pays 2 » (colorié en bleu).  
     - De nouveau, la devise est récupérée via l’API REST Countries.  
   - Si on reclique sur « Pays 1 » ou « Pays 2 » déjà sélectionné, la sélection est annulée et la couleur du pays revient à son état initial.  
   - Si deux pays sont déjà choisis et qu’on clique sur un troisième, on réinitialise tout : le nouveau pays devient « Pays 1 », et il faut à nouveau choisir un second.

3. **Récupération des devises**  
   - La fonction `fetchCurrency(countryId, countryName)` effectue deux tentatives :  
     1. **Par code ISO**  
        Requête GET vers `https://restcountries.com/v3.1/alpha/{countryId}` ; si le code existe, on extrait la clé ISO 4217 depuis `data[0].currencies`.  
     2. **Par nom complet**  
        Requête GET vers `https://restcountries.com/v3.1/name/{countryName}?fullText=true` si la première tentative échoue. On extrait la devise de la même manière.  
   - Si aucune devise n’est trouvée, la sélection du pays reste possible mais la conversion ne sera pas réalisée tant que la devise n’est pas connue.

4. **Saisie du montant et calcul du taux de change**  
   - Un champ `<input type="number" id="amountInput">` permet d’entrer un montant dans la devise du « Pays 1 ».  
   - À chaque nouvelle saisie (événement `input`), la fonction `updateConversion()` est appelée :  
     - Si les deux pays sont sélectionnés et que leurs devises sont connues, on envoie une requête GET à l’API ExchangeRate :  
       ```
       https://v6.exchangerate-api.com/v6/YOUR_API_KEY/pair/{DevisePays1}/{DevisePays2}
       ```  
       pour récupérer le taux (`conversion_rate`).  
     - On calcule alors `montant * conversion_rate` et on affiche le résultat formaté en français, dans un bloc `<div id="conversionResult">` positionné au bas de la page.  
   - Si le champ est vide, si une sélection est manquante ou si les devises ne sont pas disponibles, aucun résultat n’est affiché.

---

## Installation et démarrage

1. **Prérequis**  
   - Un navigateur moderne (Chrome, Firefox, Edge, Safari).  
   - Pas de dépendances serveur, tout fonctionne côté client.

2. **Structure des fichiers**  

/projet-convertisseur
├── index.html
├── style.css
├── script.js
└── world.svg (fichier de la carte)

- **index.html** : page principale, contient le `<object>` pour le SVG et le champ de saisie.  
- **style.css** : styles pour l’aspect « touristic agency ».  
- **script.js** : logique JavaScript de sélection des pays et conversion.  
- **world.svg** : carte vectorielle du monde (source SimpleMaps).

3. **Étapes pour lancer le site**  
- Cloner ou télécharger l’intégralité du dossier.  
- Placer `world.svg` (téléchargé depuis SimpleMaps) à la racine du projet.  
- Ouvrir `index.html` directement dans un navigateur.  
- S’assurer que l’accès Internet est disponible pour appeler les API (REST Countries & ExchangeRate-API).

---

## Utilisation

1. **Sélection des pays**  
- Cliquer sur un premier pays (il devient rouge, et son nom s’affiche dans « Pays 1 »).  
- Cliquer sur un deuxième pays (il devient bleu, et son nom s’affiche dans « Pays 2 »).  

2. **Conversion de devises**  
- Saisir un montant dans le champ « Montant à convertir ».  
- Le résultat s’affiche automatiquement en bas de page sous la forme :  
  ```
  100 USD = 85,50 EUR
  ```  
  (exemple, selon le taux en vigueur).

3. **Réinitialisation / changement**  
- Recliquer sur un pays déjà sélectionné pour l’annuler.  
- Cliquer sur un nouveau pays pour remplacer la sélection.  
- Effacer ou modifier le montant pour recalculer en temps réel.

---

## Crédits

- **SVG Carte du monde**  
Téléchargée depuis :  
https://simplemaps.com/resources/svg-world  
(Merci à SimpleMaps pour la ressource graphique libre d’utilisation.)

- **API REST Countries**  
Documentation et endpoint utilisés :  
https://restcountries.com/

- **API ExchangeRate-API**  
Clé et URL :  
https://www.exchangerate-api.com/

- **Réalisé par**  
- Jérôme NEUPERT  
---