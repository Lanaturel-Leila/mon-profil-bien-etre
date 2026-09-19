import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { parseMedia } from "@remotion/media-parser";
import { clips as clipsParDefaut, Clip } from "./clips";
import { TexteIncruste } from "./components/TexteIncruste";
import { Hook } from "./components/Hook";
import { MODELE } from "./modele";
import { FILTRES, NomFiltre } from "./filtres";

// Le rythme vient du modèle : voir src/modele.ts
export const FPS = MODELE.montage.fps;
/** Longueur du fondu entre deux extraits, en images (30 images = 1 seconde). */
export const DUREE_FONDU = MODELE.montage.fondu;

export type Format = "auto" | "vertical" | "carre" | "horizontal";

export type MontageProps = {
  clips: Clip[];
  /**
   * "auto" garde le format de ta première vidéo (rien n'est recadré).
   * Les autres valeurs recadrent pour remplir le cadre choisi.
   */
  format: Format;
  /** Nom d'un fichier posé dans video/public/audio/ (vide = pas de musique) */
  musique: string;
  volumeMusique: number;
  /** Garder le son d'origine des extraits */
  sonDesClips: boolean;
  /** Le filtre d'image appliqué à tous les extraits */
  filtre: NomFiltre;
  /** L'accroche affichée en haut de l'image (vide = pas d'accroche) */
  hook: string;
  /** Combien de secondes elle reste à l'écran. 0 = toute la vidéo. */
  dureeHook: number;
  /**
   * Hauteur du bloc, en % depuis le haut. À régler selon le cadrage :
   * assise, 21,6 % tombe bien ; debout, il faut monter vers 4 ou 5 %
   * pour ne pas couvrir le visage.
   */
  hookPosition: number;
  hookTaille: number;
  /** Rempli automatiquement : la durée de chaque extrait, en images */
  dureesEnFrames?: number[];
};

export const montageParDefaut: MontageProps = {
  clips: clipsParDefaut,
  format: "auto",
  musique: "",
  volumeMusique: MODELE.montage.volumeMusique,
  sonDesClips: MODELE.montage.sonDesClips,
  filtre: MODELE.montage.filtre,
  hook: "",
  dureeHook: 0,
  hookPosition: MODELE.hook.positionDebout,
  hookTaille: MODELE.hook.tailleTexte,
};

const CADRES: Record<Exclude<Format, "auto">, { width: number; height: number }> =
  {
    vertical: { width: 1080, height: 1920 },
    carre: { width: 1080, height: 1080 },
    horizontal: { width: 1920, height: 1080 },
  };

/** Les encodeurs vidéo n'acceptent que des dimensions paires. */
const arrondirPair = (valeur: number) => Math.max(2, Math.round(valeur / 2) * 2);

type InfosClip = { duree: number; largeur: number | null; hauteur: number | null };

/** Lit un extrait : sa durée en images, et ses dimensions. */
const lireClip = async (clip: Clip): Promise<InfosClip> => {
  const debut = clip.debut ?? 0;
  const chemin = staticFile(`clips/${clip.fichier}`);

  let infos;
  try {
    infos = await parseMedia({
      src: chemin,
      fields: { durationInSeconds: true, dimensions: true },
    });
  } catch (erreur) {
    throw new Error(
      `Je n'arrive pas à lire la vidéo "clips/${clip.fichier}". ` +
        `Vérifie que le fichier est bien dans video/public/clips/ et que le nom ` +
        `est écrit exactement pareil dans src/clips.ts (majuscules et extension ` +
        `comprises). Détail : ${String(erreur)}`,
    );
  }

  const largeur = infos.dimensions?.width ?? null;
  const hauteur = infos.dimensions?.height ?? null;

  // Si la fin est indiquée, pas besoin de connaître la durée du fichier.
  if (clip.fin !== undefined) {
    return {
      duree: Math.max(1, Math.round((clip.fin - debut) * FPS)),
      largeur,
      hauteur,
    };
  }

  // Certains fichiers ne déclarent pas leur durée : on relit alors le fichier
  // en entier (plus lent, mais fiable).
  const dureeDuFichier =
    infos.durationInSeconds ??
    (await parseMedia({ src: chemin, fields: { slowDurationInSeconds: true } }))
      .slowDurationInSeconds;

  if (dureeDuFichier <= debut) {
    throw new Error(
      `Le clip "${clip.fichier}" dure ${dureeDuFichier.toFixed(1)} s, ` +
        `mais tu demandes de commencer à ${debut} s. Baisse la valeur "debut".`,
    );
  }

  return {
    duree: Math.max(1, Math.round((dureeDuFichier - debut) * FPS)),
    largeur,
    hauteur,
  };
};

/**
 * Prépare le montage avant le rendu : durée de chaque extrait, durée totale,
 * et format de la vidéo finale. Rien à tenir à jour à la main.
 */
export const calculerMetadata: CalculateMetadataFunction<MontageProps> = async ({
  props,
}) => {
  const infos = await Promise.all(props.clips.map(lireClip));
  const dureesEnFrames = infos.map((info) => info.duree);

  const nombreDeFondus = Math.max(0, props.clips.length - 1);
  const total =
    dureesEnFrames.reduce((somme, duree) => somme + duree, 0) -
    nombreDeFondus * DUREE_FONDU;

  // En "auto", la vidéo garde le format du premier extrait.
  const premier = infos[0];
  const cadre =
    props.format === "auto"
      ? premier?.largeur && premier?.hauteur
        ? { width: arrondirPair(premier.largeur), height: arrondirPair(premier.hauteur) }
        : CADRES.vertical
      : CADRES[props.format];

  return {
    fps: FPS,
    durationInFrames: Math.max(FPS, total),
    ...cadre,
    props: { ...props, dureesEnFrames },
  };
};

/** Écran affiché tant qu'aucun extrait n'a été ajouté. */
const AucunClip: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#111",
      color: "white",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: 80,
      gap: 24,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}
  >
    <div style={{ fontSize: 90 }}>🎬</div>
    <div style={{ fontSize: 54, fontWeight: 700 }}>Aucun extrait pour l'instant</div>
    <div style={{ fontSize: 34, lineHeight: 1.5, opacity: 0.75 }}>
      Pose tes vidéos dans <b>video/public/clips/</b>
      <br />
      puis liste-les dans <b>src/clips.ts</b>
    </div>
  </AbsoluteFill>
);

/**
 * Un extrait avec son mouvement de caméra.
 *
 * Le zoom est régulier du début à la fin de l'extrait : sur 4 ou 5 secondes,
 * 8 à 10 % suffisent pour que ça respire sans que ça se voie.
 */
const ExtraitAvecZoom: React.FC<{
  clip: Clip;
  duree: number;
  sonDesClips: boolean;
  filtre: NomFiltre;
}> = ({ clip, duree, sonDesClips, filtre }) => {
  const frame = useCurrentFrame();
  const intensite = clip.intensite ?? MODELE.montage.intensiteZoom;

  const echelle = !clip.zoom
    ? 1
    : interpolate(
        frame,
        [0, duree],
        clip.zoom === "avant" ? [1, 1 + intensite] : [1 + intensite, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(`clips/${clip.fichier}`)}
        trimBefore={Math.round((clip.debut ?? 0) * FPS)}
        muted={!sonDesClips}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${echelle})`,
          filter: FILTRES[filtre].css,
        }}
      />
      {clip.texte ? <TexteIncruste texte={clip.texte} /> : null}
    </AbsoluteFill>
  );
};

export const Montage: React.FC<MontageProps> = ({
  clips,
  musique,
  volumeMusique,
  sonDesClips,
  filtre,
  hook,
  dureeHook,
  hookPosition,
  hookTaille,
  dureesEnFrames = [],
}) => {
  const { durationInFrames } = useVideoConfig();

  if (clips.length === 0) {
    return <AucunClip />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {musique === "" ? null : (
        <Audio src={staticFile(`audio/${musique}`)} volume={volumeMusique} loop />
      )}

      <TransitionSeries>
        {clips.map((clip, index) => {
          const duree = dureesEnFrames[index] ?? 3 * FPS;

          return (
            <React.Fragment key={`${clip.fichier}-${index}`}>
              {index === 0 ? null : (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: DUREE_FONDU })}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={duree}>
                <ExtraitAvecZoom
                  clip={clip}
                  duree={duree}
                  sonDesClips={sonDesClips}
                  filtre={filtre}
                />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* L'accroche passe par-dessus tout le montage, coupes comprises. */}
      {hook === "" ? null : (
        <Sequence
          durationInFrames={
            dureeHook > 0 ? Math.round(dureeHook * FPS) : durationInFrames
          }
        >
          <Hook
            texte={hook}
            style={{ position: hookPosition, tailleTexte: hookTaille }}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
