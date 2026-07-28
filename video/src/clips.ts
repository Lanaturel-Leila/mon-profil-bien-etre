/**
 * ═══════════════════════════════════════════════════════════
 *  LA LISTE DE MONTAGE — c'est ici qu'on monte la vidéo
 * ═══════════════════════════════════════════════════════════
 *
 * Pour chaque extrait :
 * - fichier   : le nom du fichier posé dans video/public/clips/
 * - debut     : à quelle seconde on commence (0 = tout au début)
 * - fin       : à quelle seconde on coupe (rien = jusqu'au bout)
 * - texte     : le sous-titre incrusté en bas de l'image (facultatif)
 * - zoom      : "avant" (on se rapproche), "arriere" (on recule), rien = fixe
 * - intensite : la force du zoom. 0.08 = 8 %, très doux. 0.2 = bien marqué.
 */

export type Clip = {
  fichier: string;
  debut?: number;
  fin?: number;
  texte?: string;
  zoom?: "avant" | "arriere";
  intensite?: number;
};

export const clips: Clip[] = [
  // Vidéo d'origine : 9,1 s.
  //   0 → 1,7 s   elle entre dans le champ  → coupé
  //   1,8 → 6,3 s elle parle                → gardé
  //   6,3 → 9,1 s elle ressort du champ     → coupé
  {
    fichier: "video-1.mov",
    debut: 1.8,
    fin: 6.3,
    zoom: "avant",
    intensite: 0.09,
  },
];
