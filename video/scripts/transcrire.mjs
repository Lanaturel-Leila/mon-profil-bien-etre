/**
 * Transcrit la parole d'une vidéo pour savoir ce qui est dit, et à quel moment.
 *
 *   npm run transcrire -- video-1.mov
 *   npm run transcrire -- video-1.mov --modele=small
 *
 * Le résultat est écrit dans out/<nom>.json et affiché à l'écran, avec les
 * minutages. Ça sert à écrire les sous-titres et à repérer les passages à
 * couper.
 *
 * Le premier lancement télécharge Whisper et un modèle (quelques centaines de
 * Mo) : c'est long une fois, rapide ensuite.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { join, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

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
const modele =
  arguments_.find((a) => a.startsWith("--modele="))?.split("=")[1] ?? "small";
const langue =
  arguments_.find((a) => a.startsWith("--langue="))?.split("=")[1] ?? "fr";

if (!fichier) {
  console.error("\n  npm run transcrire -- ma-video.mov\n");
  process.exit(1);
}

const chemin = join(racine, "public", "clips", fichier);
if (!existsSync(chemin)) {
  console.error(`\nJe ne trouve pas : ${chemin}\n`);
  process.exit(1);
}

const dossierWhisper = join(racine, "whisper.cpp");

console.log("\nInstallation de Whisper (long au premier lancement)…");
await installWhisperCpp({ to: dossierWhisper, version: "1.5.5" });

console.log(`Téléchargement du modèle « ${modele} »…`);
await downloadWhisperModel({ model: modele, folder: dossierWhisper });

// Un modèle fait des centaines de Mo. Si le fichier est minuscule, c'est que
// le téléchargement a renvoyé une page d'erreur au lieu du modèle.
const fichierModele = join(dossierWhisper, `ggml-${modele}.bin`);
const taille = statSync(fichierModele).size;
if (taille < 1_000_000) {
  rmSync(fichierModele, { force: true });
  throw new Error(
    `Le modèle n'a pas pu être téléchargé (fichier de ${taille} octets au lieu ` +
      `de plusieurs centaines de Mo). L'accès à huggingface.co est sans doute ` +
      `bloqué sur ce réseau. Réessaie depuis une connexion normale.`,
  );
}

// Whisper ne lit que du wav 16 kHz mono.
mkdirSync(join(racine, "out"), { recursive: true });
const wav = join(racine, "out", `${parse(fichier).name}-16k.wav`);
console.log("Extraction du son…");
execFileSync(trouverFfmpeg(), [
  "-y", "-loglevel", "error", "-i", chemin,
  "-ar", "16000", "-ac", "1", wav,
]);

console.log("Transcription…\n");
const brut = await transcribe({
  model: modele,
  whisperPath: dossierWhisper,
  // Sans "whisperCppVersion", la bibliothèque ne sait pas où chercher
  // l'exécutable et s'arrête sur une erreur de version.
  whisperCppVersion: "1.5.5",
  inputPath: wav,
  tokenLevelTimestamps: true,
  language: langue,
});

const { captions } = toCaptions({ whisperCppOutput: brut });

const sortie = join(racine, "out", `${parse(fichier).name}.json`);
writeFileSync(sortie, JSON.stringify(captions, null, 2));

const seconde = (ms) => (ms / 1000).toFixed(1).padStart(5) + " s";
let phrase = "";
let debutPhrase = captions[0]?.startMs ?? 0;

for (const mot of captions) {
  phrase += mot.text;
  if (/[.!?…]$/.test(mot.text.trim())) {
    console.log(`${seconde(debutPhrase)} → ${seconde(mot.endMs)}  ${phrase.trim()}`);
    phrase = "";
    debutPhrase = mot.endMs;
  }
}
if (phrase.trim()) {
  console.log(
    `${seconde(debutPhrase)} → ${seconde(captions[captions.length - 1].endMs)}  ${phrase.trim()}`,
  );
}

console.log(`\n${captions.length} mots. Détail enregistré dans ${sortie}\n`);
