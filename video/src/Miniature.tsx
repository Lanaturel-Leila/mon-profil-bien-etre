import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { Hook, STYLE_HOOK } from "./components/Hook";

export type MiniatureProps = {
  /** Le fichier vidéo dans lequel on prend l'image */
  fichier: string;
  /** À quelle seconde de la vidéo on prend l'image */
  temps: number;
  /** L'accroche affichée dans le bloc blanc */
  hook: string;
  couleurFond: string;
  couleurTexte: string;
  /** Position du haut du bloc, en % de la hauteur */
  position: number;
  tailleTexte: number;
  interligne: number;
  espacementLettres: number;
  margeVerticale: number;
};

export const miniatureParDefaut: MiniatureProps = {
  fichier: "video-1.mov",
  temps: 4,
  hook: "TON ACCROCHE ICI",
  couleurFond: STYLE_HOOK.couleurFond,
  couleurTexte: STYLE_HOOK.couleurTexte,
  position: STYLE_HOOK.position,
  tailleTexte: STYLE_HOOK.tailleTexte,
  interligne: STYLE_HOOK.interligne,
  espacementLettres: STYLE_HOOK.espacementLettres,
  margeVerticale: STYLE_HOOK.margeVerticale,
};

export const Miniature: React.FC<MiniatureProps> = ({
  fichier,
  temps,
  hook,
  couleurFond,
  couleurTexte,
  position,
  tailleTexte,
  interligne,
  espacementLettres,
  margeVerticale,
}) => {
  // On compte en images de la composition, pas en images de la vidéo :
  // une image fixe ne tourne pas au même rythme qu'un montage.
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`clips/${fichier}`)}
        trimBefore={Math.round(temps * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Hook
        texte={hook}
        style={{
          couleurFond,
          couleurTexte,
          position,
          tailleTexte,
          interligne,
          espacementLettres,
          margeVerticale,
        }}
      />
    </AbsoluteFill>
  );
};
