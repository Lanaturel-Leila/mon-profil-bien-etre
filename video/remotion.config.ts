import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Qualité adaptée aux Reels Instagram / TikTok
Config.setCrf(18);

/**
 * Sur un poste normal (Mac / Windows), Remotion télécharge tout seul son
 * navigateur : rien à faire. Dans un environnement où ce téléchargement est
 * bloqué (CI, conteneur), on réutilise un Chromium déjà installé si on en
 * trouve un.
 */
const chromiumsPossibles = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/opt/pw-browsers/chromium",
].filter((chemin): chemin is string => Boolean(chemin));

const chromiumTrouve = chromiumsPossibles.find((chemin) => existsSync(chemin));

if (chromiumTrouve) {
  Config.setBrowserExecutable(chromiumTrouve);
}
