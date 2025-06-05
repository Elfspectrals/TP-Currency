# Jérôme NEUPERT

## Description du projet
Ce site est un convertisseur de devises interactif doté d’une carte mondiale cliquable.  
L’utilisateur peut sélectionner deux pays en cliquant directement sur la carte :  
- Le premier pays sélectionné sera colorié en rouge (Pays 1)  
- Le deuxième pays sélectionné sera colorié en bleu (Pays 2)  

Un champ numérique permet ensuite de saisir un montant dans la devise du Pays 1. Le site calcule automatiquement le taux de change entre la devise du Pays 1 et la devise du Pays 2, puis affiche le résultat sous forme :  



L’interface a été stylisée pour donner une ambiance « agence de voyage », avec un fond dégradé chaleureux, des bordures arrondies et des couleurs rappelant l’aventure.

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