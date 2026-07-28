import React from "react";
import { chargerPolices } from "../polices";
import { MODELE } from "../modele";

/**
 * L'accroche : bloc blanc arrondi, texte rose en capitales.
 *
 * Le style vient du modèle (src/modele.ts) : c'est là qu'on change les
 * couleurs, la police ou la place du bloc, pas ici.
 */

export type StyleHook = {
  /** Nom d'une police de src/polices.ts */
  police: string;
  couleurFond: string;
  couleurTexte: string;
  /** Position du haut du bloc, en % de la hauteur de l'image */
  position: number;
  /** Largeur du bloc, en % de la largeur de l'image */
  largeur: number;
  tailleTexte: number;
  arrondi: number;
  /** Espace entre deux lignes */
  interligne: number;
  /** Espace entre les lettres, en pixels */
  espacementLettres: number;
  /** Marges intérieures du bloc, en pixels */
  margeVerticale: number;
  margeHorizontale: number;
  graisse: number;
};

export const STYLE_HOOK: StyleHook = {
  police: MODELE.hook.police,
  couleurFond: MODELE.hook.couleurFond,
  couleurTexte: MODELE.hook.couleurTexte,
  position: MODELE.hook.positionDebout,
  largeur: MODELE.hook.largeur,
  tailleTexte: MODELE.hook.tailleTexte,
  arrondi: MODELE.hook.arrondi,
  interligne: MODELE.hook.interligne,
  espacementLettres: MODELE.hook.espacementLettres,
  margeVerticale: MODELE.hook.margeVerticale,
  margeHorizontale: MODELE.hook.margeHorizontale,
  graisse: 700,
};

export const Hook: React.FC<{ texte: string; style?: Partial<StyleHook> }> = ({
  texte,
  style,
}) => {
  const s = { ...STYLE_HOOK, ...style };
  chargerPolices();

  return (
    <div
      style={{
        position: "absolute",
        top: `${s.position}%`,
        left: `${(100 - s.largeur) / 2}%`,
        width: `${s.largeur}%`,
        backgroundColor: s.couleurFond,
        borderRadius: s.arrondi,
        padding: `${s.margeVerticale}px ${s.margeHorizontale}px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: `"${s.police}", -apple-system, sans-serif`,
          fontSize: s.tailleTexte,
          fontWeight: s.graisse,
          lineHeight: s.interligne,
          letterSpacing: s.espacementLettres,
          color: s.couleurTexte,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {texte}
      </div>
    </div>
  );
};
