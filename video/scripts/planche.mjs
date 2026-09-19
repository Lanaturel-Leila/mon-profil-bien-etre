/**
 * Fabrique la vue d'ensemble d'une vidéo : toutes les images clés sur une
 * seule planche, avec les secondes marquées dessus.
 *
 *   npm run planche -- ma-video.mov
 *   npm run planche -- ma-video.mov --nombre=40 --colonnes=5
 *
 * Ça sert à regarder toute la vidéo d'un coup d'œil et à dire précisément
 * où couper.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

const trouverBinaire = (nom) => {
  const dossier = join(racine, "node_modules", "@remotion");
  if (existsSync(dossier)) {
    for (const paquet of readdirSync(dossier)) {
      if (!paquet.startsWith("compositor-")) continue;
      for (const binaire of [nom, `${nom}.exe`]) {
        const chemin = join(dossier, paquet, binaire);
        if (existsSync(chemin)) return chemin;
      }
    }
  }
  return nom;
};

const arguments_ = process.argv.slice(2);
const fichier = arguments_.find((a) => !a.startsWith("--"));
const lireOption = (nom, defaut) => {
  const trouve = arguments_.find((a) => a.startsWith(`--${nom}=`));
  return trouve ? Number(trouve.split("=")[1]) : defaut;
};

const nombre = lireOption("nombre", 24);
const colonnes = lireOption("colonnes", 4);

if (!fichier) {
  console.error("\n  npm run planche -- ma-video.mov\n");
  process.exit(1);
}

const chemin = join(racine, "public", "clips", fichier);
if (!existsSync(chemin)) {
  console.error(`\nJe ne trouve pas : ${chemin}\n`);
  process.exit(1);
}

// Durée de la vidéo
const sortieFfprobe = execFileSync(
  trouverBinaire("ffprobe"),
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", chemin],
  { encoding: "utf8" },
);
const duree = Number(sortieFfprobe.trim());

if (!Number.isFinite(duree) || duree <= 0) {
  console.error("\nJe n'arrive pas à lire la durée de cette vidéo.\n");
  process.exit(1);
}

const nom = parse(fichier).name;
const dossierVignettes = join(racine, "public", "planche");
rmSync(dossierVignettes, { recursive: true, force: true });
mkdirSync(dossierVignettes, { recursive: true });

console.log(`\n🎬  ${fichier} — ${duree.toFixed(1)} s`);
console.log(`    extraction de ${nombre} vignettes…`);

const ffmpeg = trouverBinaire("ffmpeg");
const vignettes = [];

const extraire = (seconde, destination) => {
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error",
    "-ss", String(seconde),
    "-i", chemin,
    "-frames:v", "1",
    "-vf", "scale=320:-2",
    destination,
  ]);
  return existsSync(destination);
};

// Les toutes dernières images d'un fichier ne sont pas toujours décodables :
// on garde une marge de sécurité à la fin.
const dureeUtile = Math.max(0.5, duree - 0.4);

for (let i = 0; i < nombre; i++) {
  // On décale d'un demi-intervalle pour éviter la toute première image,
  // souvent noire.
  const seconde = Number(((dureeUtile * (i + 0.5)) / nombre).toFixed(2));
  const image = `${nom}-${String(i).padStart(3, "0")}.jpg`;
  const destination = join(dossierVignettes, image);

  // Si l'image ne sort pas, on recule un peu et on réessaie.
  const reussi =
    extraire(seconde, destination) ||
    extraire(Math.max(0, seconde - 0.4), destination);

  if (reussi) {
    vignettes.push({ image, seconde });
  } else {
    console.log(`\n    (pas d'image à ${seconde} s, vignette ignorée)`);
  }
  process.stdout.write(`\r    ${i + 1}/${nombre}`);
}

console.log("\n    assemblage de la planche…");

const lignes = Math.ceil(vignettes.length / colonnes);
const largeurVignette = 320;
const hauteurVignette = Math.round((largeurVignette * 16) / 9);

const props = join(racine, "out", `planche-${nom}.json`);
mkdirSync(join(racine, "out"), { recursive: true });
writeFileSync(props, JSON.stringify({ vignettes, colonnes }));

const sortie = join(racine, "out", `planche-${nom}.png`);
execFileSync(
  join(racine, "node_modules", ".bin", "remotion"),
  [
    "still", "PlancheTemps", sortie,
    `--props=${props}`,
    `--width=${largeurVignette * colonnes}`,
    `--height=${hauteurVignette * lignes}`,
  ],
  { stdio: "inherit", cwd: racine },
);

console.log(`\nPlanche prête : ${sortie}\n`);
