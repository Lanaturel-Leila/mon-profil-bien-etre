/**
 * Repère les blancs (les silences) dans une vidéo et propose une liste de
 * montage qui ne garde que les moments où ça parle.
 *
 *   npm run blancs -- ma-video.mp4
 *   npm run blancs -- ma-video.mp4 --duree=0.8 --marge=0.25
 *
 * - duree : à partir de combien de secondes de silence on considère un blanc
 * - marge : combien de secondes on garde autour de la parole, pour ne pas
 *           couper au ras des mots
 *
 * Le script ne modifie rien : il affiche un texte à recopier dans src/clips.ts.
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Trouve le ffmpeg fourni avec Remotion (ou celui du système). */
const trouverFfmpeg = () => {
  const dossier = join(racine, "node_modules", "@remotion");
  if (existsSync(dossier)) {
    for (const nom of readdirSync(dossier)) {
      if (!nom.startsWith("compositor-")) continue;
      for (const binaire of ["ffmpeg", "ffmpeg.exe"]) {
        const chemin = join(dossier, nom, binaire);
        if (existsSync(chemin)) return chemin;
      }
    }
  }
  return "ffmpeg";
};

const arguments_ = process.argv.slice(2);
const fichier = arguments_.find((a) => !a.startsWith("--"));

const lireOption = (nom, defaut) => {
  const trouve = arguments_.find((a) => a.startsWith(`--${nom}=`));
  return trouve ? Number(trouve.split("=")[1]) : defaut;
};

const dureeMiniDuBlanc = lireOption("duree", 0.7);
const marge = lireOption("marge", 0.2);
const seuil = lireOption("seuil", -35); // en dB : plus bas = plus tolérant au bruit

if (!fichier) {
  console.error(
    "\nIl me faut le nom d'une vidéo posée dans video/public/clips/\n\n" +
      "  npm run blancs -- ma-video.mp4\n",
  );
  process.exit(1);
}

const chemin = join(racine, "public", "clips", fichier);
if (!existsSync(chemin)) {
  console.error(`\nJe ne trouve pas le fichier : ${chemin}\n`);
  process.exit(1);
}

/** Lance ffmpeg et récupère ce qu'il raconte. */
const analyser = () =>
  new Promise((resolve, reject) => {
    const ffmpeg = spawn(trouverFfmpeg(), [
      "-hide_banner",
      "-i",
      chemin,
      // On ne s'occupe que du son : sans "-vn", ffmpeg essaie de ré-encoder
      // l'image pour rien, et échoue sur certaines installations.
      "-vn",
      "-af",
      `silencedetect=noise=${seuil}dB:d=${dureeMiniDuBlanc}`,
      "-f",
      "null",
      "-",
    ]);

    let sortie = "";
    ffmpeg.stderr.on("data", (bloc) => (sortie += bloc.toString()));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0 || sortie.includes("silence")
        ? resolve(sortie)
        : reject(new Error(`ffmpeg s'est arrêté (code ${code})\n${sortie}`)),
    );
  });

const sortie = await analyser();

const dureeTotale = (() => {
  const trouve = sortie.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (!trouve) return null;
  const [, h, m, s] = trouve;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
})();

const debutsDeBlanc = [...sortie.matchAll(/silence_start: (-?[\d.]+)/g)].map((t) =>
  Number(t[1]),
);
const finsDeBlanc = [...sortie.matchAll(/silence_end: ([\d.]+)/g)].map((t) =>
  Number(t[1]),
);

// On reconstruit les morceaux où ça parle : entre la fin d'un blanc et le début du suivant.
const morceaux = [];
let curseur = 0;

for (let i = 0; i < debutsDeBlanc.length; i++) {
  const debutDuBlanc = debutsDeBlanc[i];
  if (debutDuBlanc > curseur) {
    morceaux.push({ debut: curseur, fin: debutDuBlanc });
  }
  curseur = finsDeBlanc[i] ?? dureeTotale ?? debutDuBlanc;
}

if (dureeTotale !== null && curseur < dureeTotale) {
  morceaux.push({ debut: curseur, fin: dureeTotale });
}

// On ajoute la marge, on recolle les morceaux qui se touchent, on jette les miettes.
const arrondir = (valeur) => Math.round(valeur * 10) / 10;
const avecMarge = morceaux
  .map((m) => ({
    debut: Math.max(0, m.debut - marge),
    fin: dureeTotale === null ? m.fin + marge : Math.min(dureeTotale, m.fin + marge),
  }))
  .filter((m) => m.fin - m.debut >= 0.4);

const fusionnes = [];
for (const morceau of avecMarge) {
  const precedent = fusionnes[fusionnes.length - 1];
  if (precedent && morceau.debut <= precedent.fin) {
    precedent.fin = Math.max(precedent.fin, morceau.fin);
  } else {
    fusionnes.push({ ...morceau });
  }
}

const gardé = fusionnes.reduce((somme, m) => somme + (m.fin - m.debut), 0);

console.log(`\n🎬  ${fichier}`);
if (dureeTotale !== null) {
  console.log(`    durée d'origine : ${dureeTotale.toFixed(1)} s`);
}
console.log(`    blancs repérés  : ${debutsDeBlanc.length}`);
console.log(
  `    montage proposé : ${fusionnes.length} extrait(s), ${gardé.toFixed(1)} s au total\n`,
);

if (fusionnes.length === 0) {
  console.log("Aucun passage parlé trouvé. Essaie un seuil plus bas :");
  console.log(`  npm run blancs -- ${fichier} --seuil=-45\n`);
  process.exit(0);
}

console.log("À recopier dans src/clips.ts :\n");
console.log("export const clips: Clip[] = [");
for (const morceau of fusionnes) {
  console.log(
    `  { fichier: ${JSON.stringify(fichier)}, debut: ${arrondir(morceau.debut)}, fin: ${arrondir(morceau.fin)} },`,
  );
}
console.log("];\n");
console.log(
  "C'est une proposition, pas une vérité : relis les coupes dans le studio\n" +
    "(npm run studio) et ajuste les chiffres à la main si besoin.\n",
);
