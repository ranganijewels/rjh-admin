import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// export function toTitleCase(str) {
//   const lowerWords = ["and", "of", "the"];
//   return str
//     ?.trim()
//     .toLowerCase()
//     .split(" ")
//     .map((word, index) =>
//       lowerWords?.includes(word) && index !== 0
//         ? word
//         : word.charAt(0).toUpperCase() + word.slice(1)
//     )
//     .join(" ");
// }

export function toTitleCase(str) {
  if (!str) return "";

  // Ensure we always work with a string
  const safe = typeof str === "string" ? str : String(str);

  const lowerWords = ["and", "of", "the"];

  return safe
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) =>
      lowerWords.includes(word) && index !== 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export const formatDateLong = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const formatDateShort = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file || typeof file === "string") return resolve(null);

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
