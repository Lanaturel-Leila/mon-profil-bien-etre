/**
 * Les filtres d'image — l'équivalent des « effets » d'une appli de montage,
 * mais appliqués tout seuls, à l'identique, sur chaque vidéo.
 *
 * Ce sont des filtres CSS : ils s'appliquent à l'image sans jamais toucher
 * au fichier d'origine.
 */

export type NomFiltre =
  | "aucun"
  | "lumineux"
  | "doux"
  | "chaud"
  | "net"
  | "pastel";

export const FILTRES: Record<NomFiltre, { css: string; description: string }> = {
  aucun: {
    css: "none",
    description: "l'image telle qu'elle sort de la caméra",
  },
  lumineux: {
    css: "brightness(1.07) contrast(1.05) saturate(1.06)",
    description: "un peu plus clair et vif, sans excès",
  },
  doux: {
    css: "brightness(1.09) contrast(0.94) saturate(0.94)",
    description: "clair et adouci, peau apaisée",
  },
  chaud: {
    css: "sepia(0.14) saturate(1.14) brightness(1.04)",
    description: "réchauffé, lumière dorée",
  },
  net: {
    css: "contrast(1.14) saturate(1.1) brightness(1.02)",
    description: "plus contrasté, ça claque à l'écran",
  },
  pastel: {
    css: "saturate(0.82) brightness(1.11) contrast(0.93)",
    description: "couleurs atténuées, ambiance douce",
  },
};

export const LISTE_FILTRES = Object.keys(FILTRES) as NomFiltre[];
