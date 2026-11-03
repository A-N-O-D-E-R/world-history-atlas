# 14: Cliopatria et trous de données

**What to build:** Les périodes sans OHM sont couvertes par Cliopatria quand il existe, chaque Snapshot affichant sa Fiabilité ; les trous restants sont signalés.

**Blocked by:** 13 (Toutes les frontières OHM)

**Status:** done

- [x] Extraction Cliopatria filtrée `Type=POLITY`
- [x] Fiabilité par Source (OHM moyenne, Cliopatria approximative), surchargeable avec note
- [x] Périodes sans données : « données indisponibles » visible
- [x] Test de bout en bout B : sélectionner l'Empire romain, aller en 117, Snapshot disponible affiché

Notes : 313 Snapshots Cliopatria (2 polygones invalides écartés), retenus seulement là où OHM ne couvre pas la même Entité. Rattachement par nom pour les QID erronés de Cliopatria (Kingdom of France → Q207162, Roman Empire → Q12544…). Agrégats « (Nom) » (polité + vassaux) préférés aux polygones simples.
