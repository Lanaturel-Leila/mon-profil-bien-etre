import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FILTRES, LISTE_FILTRES } from "./filtres";

/**
 * Une planche d'essai : la même image avec chaque filtre, pour choisir
 * celui qui deviendra le filtre du modèle.
 *
 * L'image est extraite au préalable dans public/apercu/image.jpg.
 */

export type PlancheFiltresProps = {
  image: string;
  colonnes: number;
};

export const plancheFiltresParDefaut: PlancheFiltresProps = {
  image: "apercu/image.jpg",
  colonnes: 2,
};

export const PlancheFiltres: React.FC<PlancheFiltresProps> = ({
  image,
  colonnes,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#1b1b1b",
      flexDirection: "row",
      flexWrap: "wrap",
    }}
  >
    {LISTE_FILTRES.map((nom, index) => (
      <div
        key={nom}
        style={{
          width: `${100 / colonnes}%`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            display: "block",
            filter: FILTRES[nom].css,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 16,
            right: 14,
            backgroundColor: "rgba(0,0,0,0.74)",
            color: "white",
            fontFamily: "-apple-system, sans-serif",
            padding: "10px 14px",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800 }}>
            {index + 1}. {nom}
          </div>
          <div style={{ fontSize: 22, opacity: 0.82, marginTop: 2 }}>
            {FILTRES[nom].description}
          </div>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
