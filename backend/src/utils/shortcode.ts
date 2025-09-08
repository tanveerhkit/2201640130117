import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 6);

export function generateShortcode(): string {
  return nanoid();
}

export function isValidShortcode(code: string): boolean {
  return /^[a-zA-Z0-9]{4,20}$/.test(code);
}

export function isValidURL(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

