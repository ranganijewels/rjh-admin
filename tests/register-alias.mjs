// Registers the "@/..." alias resolver before the test files are loaded.
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
