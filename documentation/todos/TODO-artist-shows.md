# Artist Shows

> **État** : feature live sur `dev`
> **Dernière revue** : 2026-04-22

---

## But

`Shows` est la surface artiste pour préparer un live ou une répétition.

Le modèle actuel est simple :

- un `show`
- une ou plusieurs `sections` (sets)
- des `items` dans chaque section
- un item est soit une `version`, soit une `playlist`

Le module `shows` est séparé du module `programs` :

- `programs` = timeline company / contract workspace
- `shows` = préparation artiste perso / platform-scoped

---

## État actuel

### Accès

- Route liste : `/app/shows`
- Route détail : `/app/shows/:id`
- Menu `Shows` visible seulement si le plan autorise la feature
- Guard actif : `requireShowsAccessGuard`

### Backend

La stack backend `apps/backend/src/shows/` est en place :

- CRUD show
- CRUD section
- add / remove item
- reorder sections
- reorder items dans une section
- move item entre sections
- duplicate show
- mark show played
- mark section played
- convert section -> playlist

### Frontend

La feature `apps/frontend-webapp/src/app/features/shows/` est en place :

- page liste de shows
- page détail routée
- panneau latéral de détail
- création de show via popover
- création de section via popover
- settings popover show
- settings popover section
- DnD depuis music library et playlists
- reorder des sections
- reorder des items
- move des items entre sections

---

## Fonctionnement actuel

### Liste des shows

La page liste affiche :

- nom
- description
- nombre de sections
- nombre total de tracks
- durée totale
- ratings agrégés
- duplicate
- delete

### Détail d’un show

Le détail permet :

- rename du show
- édition description
- édition couleur
- target de durée globale
- planning global
- critères par axe (`mastery`, `energy`, `effort`, `quality`)
- duplicate
- delete
- mark played

### Sections

Chaque section permet :

- rename
- description
- target de section
- startAt
- critères par axe
- mark section played
- convert to playlist
- remove section si le show en a plus d’une

### Items

Chaque section accepte :

- drop d’une track depuis la music library
- drop d’une playlist
- reorder interne des items
- move d’un item vers une autre section

Cas validés :

- une section vide accepte bien le drop
- un item peut être déplacé d’un set à un autre

Il n’existe pas encore de bouton dédié “split set”.
Le split se fait aujourd’hui en :

1. créant une nouvelle section
2. déplaçant les items voulus vers cette section

### Ratings / duration

Le show et les sections affichent :

- moyennes par axe
- sparkline par axe
- targets de durée
- fill %
- état visuel under / near / over
- out-of-range tint sur les critères d’axe

---

## Notes produit

- Un show a toujours au moins une section.
- Une playlist ajoutée dans un show reste un item `playlist` côté UI.
- Les séries agrégées sont recalculées côté backend.
- Les mutations frontend rechargent la vue autoritaire après écriture.
- `Show` n’est pas `Program`.

---

## TODO réel

### Priorité haute

- Ajouter des tests frontend sur `ShowsStateService`
- Ajouter des tests frontend sur les mutation services
- Ajouter des tests frontend sur `DropzoneListContainer`
- Ajouter une doc frontend courte pour `shows` (state, DnD, composants)

### Priorité moyenne

- Extraire les helpers restants de `show-detail` pour alléger le container
- Continuer le découpage du détail si le composant regrossit
- Mutualiser davantage le formatage de durée / ratings quand c’est réellement partagé
- Ajouter une action explicite “split section” si le besoin UX revient souvent

### À préparer plus tard

- Bridge `Program -> Artist Show`
- warnings de préparation sur le show
- contexte `company_assignment` vs `personal`
- deep-link artiste depuis une publication manager
- partage / export read-only

---

## Fichiers clés

- Frontend routes : [app.routes.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/routing/app.routes.ts)
- Liste : [shows-page.component.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/shows/shows-page/shows-page.component.ts)
- Détail : [show-detail.component.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/shows/show-detail/show-detail.component.ts)
- Section : [show-section.component.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/shows/show-section/show-section.component.ts)
- API frontend : [shows-api.service.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/shows/services/shows-api.service.ts)
- State frontend : [shows-state.service.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/frontend-webapp/src/app/features/shows/services/shows-state.service.ts)
- Controller backend : [show.controller.ts](/Users/hugo/WebstormProjects/SH3PHERD/apps/backend/src/shows/api/show.controller.ts)
- Doc backend détaillée : [sh3-shows.md](/Users/hugo/WebstormProjects/SH3PHERD/apps/backend/documentation/sh3-shows.md)
