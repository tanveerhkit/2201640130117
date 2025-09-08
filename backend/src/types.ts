export interface CreateShortUrlRequest {
  url: string;
  validity?: number; // minutes
  shortcode?: string;
}

export interface ShortUrl {
  shortcode: string;
  url: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
}

export interface ClickEvent {
  timestamp: string; // ISO
  source: string; // referrer hostname or 'direct'
  location: string; // coarse location description
  ip: string; // stored for completeness (not returned in response to keep coarse)
}

export interface ShortUrlRecord extends ShortUrl {
  clicks: ClickEvent[];
}

