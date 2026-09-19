/**
 * ═══════════════════════════════════════════════════════════
 *  LE MODÈLE — l'identité visuelle, à un seul endroit
 * ═══════════════════════════════════════════════════════════
 *
 * C'est le gabarit réutilisé pour toutes les vidéos : les couleurs, la
 * police, la place de l'accroche, le rythme du montage.
 *
 * Changer une valeur ici la change partout — miniature et vidéo.
 * Les listes de montage (src/clips.ts) ne touchent jamais à ça.
 *
 * Les couleurs et les proportions ont été relevées au pixel près sur la
 * miniature de référence (IMG_2034), pas choisies à l'œil.
 */

import type { NomFiltre } from "./filtres";

export const MODELE = {
  /** L'accroche : le bloc blanc à lettres roses */
  hook: {
    /** Police retenue. Fichiers dans public/polices/, liste dans src/polices.ts */
    police: "Baloo 2",
    /** Fond du bloc : blanc très légèrement cassé */
    couleurFond: "#FCFCFC",
    /** Rose des lettres */
    couleurTexte: "#F08DA8",
    /** Largeur du bloc, en % de la largeur de l'image */
    largeur: 86,
    tailleTexte: 66,
    arrondi: 40,

    // Réglage « serré et gros » : lignes rapprochées et texte grand, pour que
    // l'accroche forme un bloc compact qui se lit d'un coup.
    /** Espace entre deux lignes. 1 = lignes collées, 1.5 = très aéré. */
    interligne: 1.02,
    /** Espace entre les lettres, en pixels. Négatif = lettres resserrées. */
    espacementLettres: -0.5,
    /** Marge entre le texte et le bord du bloc, en pixels */
    margeVerticale: 22,
    margeHorizontale: 28,

    /**
     * Hauteur du bloc, en % depuis le haut du cadre.
     * Ça dépend d'où se trouve le visage — il ne faut jamais le couvrir.
     */
    positionDebout: 4.5, // cadrage debout : le visage est haut
    positionAssise: 21.6, // cadrage assis : valeur de la référence
  },

  /** Le rythme du montage */
  montage: {
    fps: 30,
    /** Fondu entre deux extraits, en images (30 images = 1 seconde) */
    fondu: 10,
    /** Zoom lent par défaut : on se rapproche de 9 % sur la durée de l'extrait */
    zoom: "avant" as const,
    intensiteZoom: 0.09,
    /**
     * Le filtre appliqué à l'image, à choisir dans src/filtres.ts.
     * Il s'applique tout seul à chaque vidéo — rien à refaire à la main.
     */
    filtre: "aucun" as NomFiltre,
    /** Le son d'origine est conservé */
    sonDesClips: true,
    /** Musique de fond posée sous la voix (0 = muet, 1 = fort) */
    volumeMusique: 0.15,
  },
} as const;
