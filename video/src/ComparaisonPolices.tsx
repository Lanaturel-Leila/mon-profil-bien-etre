import React from "react";
import { AbsoluteFill } from "remotion";
import { POLICES, chargerPolices } from "./polices";
import { STYLE_HOOK } from "./components/Hook";

/**
 * Une planche d'essai : la même phrase dans chaque police, pour comparer
 * avec la miniature de référence et choisir la bonne.
 */

export type ComparaisonProps = {
  phrase: string;
  couleurTexte: string;
  taille: number;
  graisse: number;
};

export const comparaisonParDefaut: ComparaisonProps = {
  phrase: "TU TE RÉVEILLES PARFOIS",
  couleurTexte: STYLE_HOOK.couleurTexte,
  taille: 56,
  graisse: 700,
};

export const ComparaisonPolices: React.FC<ComparaisonProps> = ({
  phrase,
  couleurTexte,
  taille,
  graisse,
}) => {
  chargerPolices();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#8E8E8E",
        padding: 40,
        gap: 24,
        justifyContent: "center",
      }}
    >
      {POLICES.map(({ nom }, index) => (
        <div
          key={nom}
          style={{
            backgroundColor: STYLE_HOOK.couleurFond,
            borderRadius: 28,
            padding: "22px 28px",
          }}
        >
          <div
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: 26,
              fontWeight: 600,
              color: "#9A9A9A",
              marginBottom: 10,
            }}
          >
            {index + 1}. {nom}
          </div>
          <div
            style={{
              fontFamily: `"${nom}"`,
              fontSize: taille,
              fontWeight: graisse,
              lineHeight: 1.25,
              color: couleurTexte,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {phrase}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
