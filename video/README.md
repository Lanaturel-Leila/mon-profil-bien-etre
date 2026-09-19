# 🎬 Montage vidéo (Remotion)

Ce dossier sert à **monter des vidéos** : mettre des extraits bout à bout,
couper ce qui dépasse, ajouter des textes et une musique.

Le montage est décrit dans un fichier (`src/clips.ts`), donc on peut le
modifier ensemble, revenir en arrière, et refaire la vidéo autant de fois qu'on
veut. Les fichiers d'origine ne sont jamais abîmés.

Le site du quiz (`../index.html`) n'est pas touché : ce dossier vit à part.

## 1. Installer (une seule fois)

```bash
cd video
npm install
```

## 2. Poser les vidéos

Mets tes fichiers (`.mp4`, `.mov`…) dans :

```
video/public/clips/
```

Et la musique, si tu en veux une, dans `video/public/audio/`.

## 3. Écrire le montage

Ouvre `src/clips.ts` et liste les extraits dans l'ordre :

```ts
export const clips: Clip[] = [
  { fichier: "ma-video.mp4", debut: 0,  fin: 12 },
  { fichier: "ma-video.mp4", debut: 30, fin: 45, texte: "Le passage important" },
];
```

- **fichier** : le nom exact du fichier posé dans `public/clips/`
- **debut** : la seconde où l'extrait commence (0 = tout au début)
- **fin** : la seconde où on coupe — si tu ne mets rien, ça va jusqu'au bout
- **texte** : la phrase incrustée en bas de l'image (facultatif)

Un même fichier peut servir plusieurs fois : c'est comme ça qu'on coupe les
temps morts au milieu d'une vidéo.

Pour changer l'ordre du montage, déplace simplement les blocs `{ … }`.

La durée totale et le format de la vidéo se calculent tout seuls : rien à
tenir à jour.

### Astuce : laisser l'ordinateur repérer les blancs

Si tu ne sais pas où couper, cette commande écoute la vidéo, repère les
silences et propose un montage qui ne garde que les moments où ça parle :

```bash
npm run blancs -- ma-video.mp4
```

Elle affiche une liste toute faite à recopier dans `src/clips.ts`. Elle ne
modifie rien toute seule : c'est une proposition, à relire dans le studio.

Deux réglages si le résultat coupe trop ou pas assez :

```bash
npm run blancs -- ma-video.mp4 --duree=1.2   # ignore les silences courts
npm run blancs -- ma-video.mp4 --seuil=-45   # plus tolérant si la pièce est bruyante
npm run blancs -- ma-video.mp4 --marge=0.4   # garde plus d'air autour des phrases
```

### Astuce : savoir ce qui est dit, et quand

```bash
npm run transcrire -- ma-video.mov
```

Transcrit la parole avec les minutages, pour écrire les sous-titres et repérer
les passages à couper. Le premier lancement télécharge Whisper et son modèle
(quelques centaines de Mo), c'est long une fois puis rapide.

## 4. Regarder et fabriquer la vidéo

```bash
npm run studio     # aperçu en direct dans le navigateur (http://localhost:3000)
npm run dev        # exactement la même chose (nom utilisé par certains guides)
npm run render     # fabrique out/montage.mp4
```

Les fichiers finis arrivent dans `out/` (dossier ignoré par git, c'est normal).

## Le modèle (l'identité visuelle)

Tout ce qui doit rester pareil d'une vidéo à l'autre est dans **`src/modele.ts`**,
et nulle part ailleurs. Changer une valeur là-bas la change partout, dans la
miniature comme dans la vidéo.

| | Valeur | D'où ça vient |
| --- | --- | --- |
| Police de l'accroche | Baloo 2 | choisie sur la planche de comparaison |
| Fond du bloc | `#FCFCFC` | relevé au pixel sur la miniature de référence |
| Texte | `#F08DA8` | idem |
| Largeur du bloc | 86 % | idem |
| Hauteur du bloc | 4,5 % debout / 21,6 % assise | selon où se trouve le visage |
| Zoom par défaut | avant, 9 % | |
| Fondu entre extraits | 10 images | |

Pour voir les polices côte à côte :

```bash
npx remotion still ComparaisonPolices out/polices.png
```

## Les réglages

Ils sont dans `montageParDefaut`, en haut de `src/Montage.tsx` — et modifiables
en direct dans le studio (panneau **Props**, à droite) :

| Réglage | À quoi ça sert |
| --- | --- |
| `format` | `"auto"` garde le format de la première vidéo, sans rien recadrer. Sinon `"vertical"` (Reel), `"carre"` ou `"horizontal"` |
| `musique` | Nom d'un fichier de `public/audio/` (vide = pas de musique) |
| `volumeMusique` | 0 = muet, 1 = fort. 0.15 par défaut, pour rester derrière la voix |
| `sonDesClips` | Garder le son d'origine des extraits |

La longueur du fondu entre deux extraits est réglée par `DUREE_FONDU`, juste
au-dessus, en images (30 images = 1 seconde).

## Ce qu'il y a dans le dossier

| Fichier | À quoi ça sert |
| --- | --- |
| `src/clips.ts` | **La liste de montage** — le fichier qu'on modifie le plus |
| `src/Montage.tsx` | L'assemblage : les coupes, les fondus, la musique |
| `src/Root.tsx` | Les formats disponibles |
| `src/components/TexteIncruste.tsx` | Le style du texte incrusté |
| `scripts/blancs.mjs` | L'outil qui repère les silences et propose des coupes |
| `public/clips/` | Les vidéos |
| `public/audio/` | Les musiques |

## Bon à savoir

- **Formats mélangés** : si les extraits n'ont pas tous la même forme, ils sont
  recadrés pour remplir le cadre de la vidéo finale.
- **Nom de fichier mal écrit** : le studio affiche un message qui dit lequel —
  il n'y a pas de coupe silencieuse au mauvais endroit.
- **Vidéos lourdes et git** : au-delà de 100 Mo par fichier, GitHub refuse
  l'envoi. Si les rushes sont gros, on trouvera une autre façon de se les
  passer.
- **Technique** : `remotion.config.ts` réutilise un Chromium déjà installé s'il
  en trouve un (utile en conteneur). Sur Mac ou PC, Remotion télécharge son
  navigateur tout seul au premier rendu : il n'y a rien à faire.
