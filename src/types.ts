export type RetailerId = 'shoprite' | 'walgreens' | 'familydollar' | 'cvs' | 'kroger';

export interface ExtensionConfig {
  clickDelay: number; // ms after click
  scrollDelay: number; // ms after scroll
  glideDelay: number; // ms to glide to button
  scrollStep: number; // px to scroll
  showHud: boolean; // show in-page floating progress bar
  showAlert: boolean; // show alert upon completion
  playSound: boolean; // sound chime upon completion
  customKeywords: string[];
  targetUrl: string; // Default target URL
  shopriteTargetUrl?: string; // ShopRite coupon destination URL
  walgreensTargetUrl?: string; // Walgreens coupon destination URL
  familydollarTargetUrl?: string; // Family Dollar Smart Coupons destination URL
  cvsTargetUrl?: string; // CVS ExtraCare destination URL
  krogerTargetUrl?: string; // Kroger destination URL
  activeRetailer?: RetailerId; // Active or preferred retailer
  storeRsid?: string; // ShopRite store number ID (e.g. '521', '218')
  clippingStrategy: 'instant' | 'individual'; // 'instant' = 1-click batch clip; 'individual' = scrolls & clicks one-by-one
  extensionMode: 'autopilot' | 'popup'; // Autopilot directs & auto-clips on click; popup opens menu
  autoStartOnNavigation: boolean;
  humanJitter?: boolean; // Randomized humanized delay intervals to bypass Akamai/WAF rate-limits
  walgreensPacing?: 'stealth' | 'balanced' | 'custom'; // Anti-bot pacing profile for Walgreens/Akamai
  overrideLoginCheck?: boolean; // Override/bypass retailer login check heuristics
}

export interface GeneratedFile {
  filename: string;
  path: string;
  language: 'json' | 'javascript' | 'html' | 'css' | 'markdown';
  content: string;
  description: string;
}

export interface CouponItem {
  id: string;
  brand: string;
  title: string;
  discount: string;
  category: string;
  expiration: string;
  buttonLabel: string;
  isClipped: boolean;
  imageColor: string;
  badges?: string[];
  subtitle?: string;
  retailer?: RetailerId;
}

