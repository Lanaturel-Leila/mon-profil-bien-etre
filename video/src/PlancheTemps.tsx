import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";

/**
 * La vue d'ensemble : toute la vidéo en vignettes, avec les secondes écrites
 * dessus. Ça sert à repérer les moments dont on parle — « coupe entre 12 et
 * 18 s » — sans avoir à ouvrir un logiciel de montage.
 *
 * Les vignettes sont extraites au préalable par scripts/planche.mjs : lire
 * directement dans une vidéo 4K vingt fois de suite est bien trop lent.
 */

export type Vignette = {
  /** Nom du fichier image, dans public/planche/ */
  image: string;
  seconde: number;
};

export type PlancheTempsProps = {
  vignettes: Vignette[];
  colonnes: number;
};

export const plancheTempsParDefaut: PlancheTempsProps = {
  vignettes: [],
  colonnes: 4,
};

export const PlancheTemps: React.FC<PlancheTempsProps> = ({
  vignettes,
  colonnes,
}) => {
  const { width } = useVideoConfig();
  const largeurVignette = width / colonnes;

  if (vignettes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1b1b1b",
          color: "white",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "-apple-system, sans-serif",
          fontSize: 40,
          textAlign: "center",
          padding: 60,
        }}
      >
        Lance d'abord : npm run planche -- ma-video.mov
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1b1b1b",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {vignettes.map(({ image, seconde }) => (
        <div
          key={image}
          style={{
            width: largeurVignette,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(`planche/${image}`)}
            style={{ width: "100%", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 12,
              backgroundColor: "rgba(0,0,0,0.72)",
              color: "white",
              fontFamily: "-apple-system, sans-serif",
              fontSize: Math.round(largeurVignette / 11),
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 10,
            }}
          >
            {seconde.toFixed(1)} s
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
