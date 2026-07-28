import React from "react";
import { Composition, Still } from "remotion";
import { Montage, montageParDefaut, calculerMetadata, FPS } from "./Montage";
import { Miniature, miniatureParDefaut } from "./Miniature";
import {
  ComparaisonPolices,
  comparaisonParDefaut,
} from "./ComparaisonPolices";
import {
  PlancheEspaces,
  comparaisonEspacesParDefaut,
} from "./ComparaisonEspaces";
import { PlancheTemps, plancheTempsParDefaut } from "./PlancheTemps";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        Le montage. Le format et la durée sont calculés à partir des vidéos :
        par défaut, la vidéo finale garde le format du premier extrait.
      */}
      <Composition
        id="Montage"
        component={Montage}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={montageParDefaut}
        calculateMetadata={calculerMetadata}
      />

      {/* Le même montage, recadré en vertical pour un Reel */}
      <Composition
        id="MontageVertical"
        component={Montage}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ ...montageParDefaut, format: "vertical" }}
        calculateMetadata={calculerMetadata}
      />

      {/* L'image de couverture, avec le titre sur fond rose */}
      <Still
        id="Miniature"
        component={Miniature}
        width={1080}
        height={1920}
        defaultProps={miniatureParDefaut}
      />

      {/* La vue d'ensemble d'une vidéo, en vignettes datées */}
      <Still
        id="PlancheTemps"
        component={PlancheTemps}
        width={1200}
        height={2133}
        defaultProps={plancheTempsParDefaut}
      />

      {/* La planche d'essai des espacements */}
      <Still
        id="PlancheEspaces"
        component={PlancheEspaces}
        width={1080}
        height={1920}
        defaultProps={{
          phrase: comparaisonEspacesParDefaut.phrase,
        }}
      />

      {/* La planche d'essai des polices */}
      <Still
        id="ComparaisonPolices"
        component={ComparaisonPolices}
        width={1080}
        height={1500}
        defaultProps={comparaisonParDefaut}
      />
    </>
  );
};
