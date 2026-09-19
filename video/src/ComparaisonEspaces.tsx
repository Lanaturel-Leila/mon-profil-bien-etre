import React from "react";
import { AbsoluteFill } from "remotion";
import { Hook, StyleHook } from "./components/Hook";

/**
 * Une planche d'essai : la même accroche avec des espacements différents,
 * pour choisir celui qui claque le plus.
 */

export const VARIANTES: {
  nom: string;
  explication: string;
  style: Partial<StyleHook>;
}[] = [
  {
    nom: "Actuel",
    explication: "interligne 1,3 · lettres +0,5",
    style: {},
  },
  {
    nom: "Serré",
    explication: "lignes rapprochées, lettres collées",
    style: {
      interligne: 1.05,
      espacementLettres: -0.5,
      margeVerticale: 24,
    },
  },
  {
    nom: "Serré et gros",
    explication: "lignes rapprochées, texte plus grand",
    style: {
      interligne: 1.02,
      espacementLettres: -0.5,
      tailleTexte: 66,
      margeVerticale: 22,
      margeHorizontale: 28,
    },
  },
  {
    nom: "Aéré",
    explication: "lignes espacées, lettres écartées",
    style: {
      interligne: 1.5,
      espacementLettres: 2.5,
      margeVerticale: 38,
    },
  },
  {
    nom: "Lettres écartées",
    explication: "lignes serrées, mais lettres au large",
    style: {
      interligne: 1.1,
      espacementLettres: 4,
      margeVerticale: 26,
    },
  },
];

export type ComparaisonEspacesProps = {
  phrase: string;
  /** Le numéro de la variante affichée (1 à 5) */
  variante: number;
};

export const comparaisonEspacesParDefaut: ComparaisonEspacesProps = {
  phrase: "Tu te réveilles parfois avec la mâchoire serrée ?",
  variante: 1,
};

export const ComparaisonEspaces: React.FC<ComparaisonEspacesProps> = ({
  phrase,
  variante,
}) => {
  const choix = VARIANTES[variante - 1] ?? VARIANTES[0];

  return (
    <AbsoluteFill style={{ backgroundColor: "#8E8E8E" }}>
      <Hook texte={phrase} style={{ ...choix.style, position: 8 }} />

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "-apple-system, sans-serif",
          fontSize: 26,
          fontWeight: 700,
          color: "white",
        }}
      >
        {variante}. {choix.nom} — {choix.explication}
      </div>
    </AbsoluteFill>
  );
};

/** Les cinq variantes empilées sur une seule planche. */
export const PlancheEspaces: React.FC<{ phrase: string }> = ({ phrase }) => (
  <AbsoluteFill style={{ backgroundColor: "#8E8E8E" }}>
    {VARIANTES.map((choix, index) => (
      <div
        key={choix.nom}
        style={{
          position: "absolute",
          top: index * 384,
          left: 0,
          right: 0,
          height: 384,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 40,
            fontFamily: "-apple-system, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "white",
          }}
        >
          {index + 1}. {choix.nom} — {choix.explication}
        </div>
        <Hook
          texte={phrase}
          style={{ ...choix.style, position: 14, largeur: 88 }}
        />
      </div>
    ))}
  </AbsoluteFill>
);
