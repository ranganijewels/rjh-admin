// Resolves the "@/..." path alias used across the app so the test files can
// import source modules the same way the application does.
//
// The bundler resolves extensionless imports; Node does not, so the loader
// tries the obvious extensions before giving up.
//
// Register it with `node --import ./tests/register-alias.mjs --test`.
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "src");
const EXTENSIONS = ["", ".js", ".jsx", ".mjs", "/index.js", "/index.jsx"];

function resolveFile(target) {
  for (const extension of EXTENSIONS) {
    const candidate = path.join(SRC, target.slice(2) + extension);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const resolved = resolveFile(specifier);
    if (resolved) return next(resolved, context);
  }
  return next(specifier, context);
}
