# Home Music Widget

> **État** : à faire
> **Contexte** : dashboard home / grid widgets

---

## But

Ajouter un widget music sur l’accueil qui offre un accès rapide à un morceau choisi dans la librairie.

Le widget visé :

- format rectangle dans la grille home
- player simplifié
- bouton `play / pause`
- nom du track
- bouton `repeat`
- bouton pour choisir / changer la version depuis la music library
- barre de lecture qui suit le contour du widget en couleur `primary`

---

## Intégration actuelle

Le dashboard home utilise `angular-gridster2`.

Fichiers actuels :

- [widget-grid.component.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/home-dashboard/widget-grid/widget-grid.component.ts)
- [widget-grid.component.html](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/home-dashboard/widget-grid/widget-grid.component.html)

Le player audio global existe déjà :

- [audio-player.service.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/musicLibrary/audio-player/audio-player.service.ts)

Conclusion :

- ne pas recréer un moteur audio
- réutiliser `AudioPlayerService`
- le widget est surtout une surface UI + config

---

## Décision d’architecture

### 1. Réutiliser le player global

Le widget doit piloter `AudioPlayerService` :

- lecture
- pause
- loop mode
- position
- durée
- track courant

### 2. Ajouter une config par widget

Le dashboard ne doit plus seulement stocker `component`.

Faire évoluer `WidgetItem` vers quelque chose comme :

```ts
export interface WidgetItem extends GridsterItem {
  component: any;
  inputs?: Record<string, unknown>;
}
```

Puis brancher les `inputs` dans `ngComponentOutlet`.

### 3. Première version simple pour le picker

Pour le MVP :

- bouton `Choose track`
- navigation vers la page `musicLibrary`
- flow de sélection d’une version
- retour vers le home avec sauvegarde de `selectedVersionId`

Ne pas faire un picker inline complexe dès la première version.

---

## UX cible

### Contenu

- titre du widget
- nom du morceau
- optionnel : artiste / label de version en secondaire
- contrôle play / pause
- contrôle repeat
- bouton de sélection

### Barre de progression

La progression doit suivre le contour du widget.

Implémentation conseillée :

- `svg rect`
- `stroke`
- `stroke-dasharray`
- `stroke-dashoffset`

La progression = `position / duration`.

Le service audio ne gère pas ce rendu. Il expose juste les données.

### États

- `empty` : aucun morceau sélectionné
- `ready` : morceau sélectionné, pas en lecture
- `playing`
- `paused`
- `loading`

---

## TODO

### Phase 1 — Base widget

- [ ] Créer `home-music-widget.component.ts`
- [ ] Créer son template et son style
- [ ] Ajouter le widget dans la grille home
- [ ] Définir une taille de base adaptée dans Gridster

### Phase 2 — Brancher la config widget

- [ ] Étendre `WidgetItem` avec `inputs`
- [ ] Passer les `inputs` au `ngComponentOutlet`
- [ ] Prévoir une config minimale `selectedVersionId`
- [ ] Prévoir un mode vide si aucune version n’est choisie

### Phase 3 — Brancher le player

- [ ] Injecter `AudioPlayerService` dans le widget
- [ ] Mapper la version sélectionnée vers un `TPlayableTrack`
- [ ] Implémenter `play / pause`
- [ ] Implémenter `repeat`
- [ ] Afficher le nom du track courant

### Phase 4 — Progression contour

- [ ] Créer un contour SVG progressif
- [ ] Binder le progress ratio sur la longueur du contour
- [ ] Utiliser la couleur `primary`
- [ ] Gérer les cas `duration = 0` ou `track non prêt`

### Phase 5 — Choix du morceau

- [ ] Ajouter un bouton `Choose track`
- [ ] Définir le flow depuis `musicLibrary`
- [ ] Permettre de sélectionner une version de la librairie
- [ ] Sauvegarder la version choisie dans la config du widget

### Phase 6 — Persist / polish

- [ ] Persister la config du widget dans le dashboard
- [ ] Gérer le cas où la version n’existe plus
- [ ] Ajouter empty / loading / error states propres
- [ ] Vérifier le responsive du widget

---

## MVP recommandé

Pour aller vite, le MVP devrait être :

- widget visible dans la grille
- un seul track configurable
- play / pause
- repeat
- nom du morceau
- contour progressif
- bouton pour aller choisir une version

À repousser après :

- picker inline
- multi-track queue
- waveform miniature
- édition avancée du widget
- plusieurs presets de widgets music

---

## Fichiers probables

- `apps/frontend-webapp/src/app/features/home-dashboard/home-music-widget/`
- `apps/frontend-webapp/src/app/features/home-dashboard/widget-grid/widget-grid.component.ts`
- `apps/frontend-webapp/src/app/features/home-dashboard/widget-grid/widget-grid.component.html`
- `apps/frontend-webapp/src/app/features/musicLibrary/audio-player/audio-player.service.ts`
