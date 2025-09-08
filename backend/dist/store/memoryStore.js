"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
class MemoryStore {
    constructor() {
        this.byCode = new Map();
    }
    has(code) {
        return this.byCode.has(code);
    }
    save(record) {
        this.byCode.set(record.shortcode, record);
    }
    get(code) {
        return this.byCode.get(code);
    }
    all() {
        return Array.from(this.byCode.values());
    }
}
exports.store = new MemoryStore();
