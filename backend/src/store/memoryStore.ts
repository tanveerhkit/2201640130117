import { ShortUrlRecord } from "../types";

class MemoryStore {
  private byCode = new Map<string, ShortUrlRecord>();

  has(code: string): boolean {
    return this.byCode.has(code);
  }

  save(record: ShortUrlRecord) {
    this.byCode.set(record.shortcode, record);
  }

  get(code: string): ShortUrlRecord | undefined {
    return this.byCode.get(code);
  }

  all(): ShortUrlRecord[] {
    return Array.from(this.byCode.values());
  }
}

export const store = new MemoryStore();

