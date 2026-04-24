import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

function getI18nDir() {
  return dirname(fileURLToPath(import.meta.url));
}

export function getFrontendLocalePath(code: string) {
  const dir = getI18nDir();
  return resolve(dir, "../../../frontend/src/i18n/locales", `${code}.json`);
}

export function getBundledLocalePath(code: string) {
  const dir = getI18nDir();
  return resolve(dir, "../../locales", `${code}.json`);
}

export function getLocaleCandidatePaths(code: string) {
  return [
    getBundledLocalePath(code),
    getFrontendLocalePath(code),
  ];
}
