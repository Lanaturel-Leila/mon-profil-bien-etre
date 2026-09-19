import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Charge les polices posées dans video/public/polices/.
 *
 * Remotion attend que le chargement soit fini avant de dessiner l'image :
 * sans ça, le rendu partirait avec la police de secours.
 */

export const POLICES = [
  { nom: "Nunito", fichier: "Nunito.ttf", variable: true },
  { nom: "Quicksand", fichier: "Quicksand.ttf", variable: true },
  { nom: "Varela Round", fichier: "VarelaRound.ttf", variable: false },
  { nom: "Poppins", fichier: "Poppins-SemiBold.ttf", variable: false },
  { nom: "Baloo 2", fichier: "Baloo2.ttf", variable: true },
  { nom: "Montserrat", fichier: "Montserrat.ttf", variable: true },
] as const;

export type NomPolice = (typeof POLICES)[number]["nom"];

let chargement: Promise<void> | null = null;

export const chargerPolices = () => {
  if (chargement) return chargement;

  const attente = delayRender("Chargement des polices");

  chargement = Promise.all(
    POLICES.map(async ({ nom, fichier, variable }) => {
      const police = new FontFace(
        nom,
        `url(${staticFile(`polices/${fichier}`)})`,
        // Les polices "variables" contiennent toutes les graisses dans un seul
        // fichier : il faut le déclarer, sinon le gras est ignoré.
        variable ? { weight: "300 900" } : {},
      );
      await police.load();
      document.fonts.add(police);
    }),
  ).then(() => {
    continueRender(attente);
  });

  return chargement;
};
