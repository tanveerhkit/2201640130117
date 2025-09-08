"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortcode = generateShortcode;
exports.isValidShortcode = isValidShortcode;
exports.isValidURL = isValidURL;
const nanoid_1 = require("nanoid");
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = (0, nanoid_1.customAlphabet)(alphabet, 6);
function generateShortcode() {
    return nanoid();
}
function isValidShortcode(code) {
    return /^[a-zA-Z0-9]{4,20}$/.test(code);
}
function isValidURL(url) {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    }
    catch {
        return false;
    }
}
