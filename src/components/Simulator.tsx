import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, RotateCcw, User, Store, ArrowDown, Undo2, CheckCheck, X, Check, Zap, Sparkles, Building2, ShoppingBag, Terminal, Tag } from 'lucide-react';
import couponLoaderLogo from '../assets/images/couponsweep_logo_1789261566330.jpg';
import { CouponItem, ExtensionConfig, RetailerId } from '../types';

const SHOPRITE_COUPONS: CouponItem[] = [
  {
    id: 'sr1',
    brand: 'Crest',
    title: 'Save $2.00 on ONE Crest Toothpaste 2.4 oz or more (excludes Crest Cavity, Bakin...',
    discount: 'Save $2.00',
    category: 'Personal Care',
    expiration: 'Expires: 09/26/2026 - 4 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['New', 'Limit 4'],
    retailer: 'shoprite'
  },
  {
    id: 'sr2',
    brand: 'Herbal Essences',
    title: 'Save $5.00 on TWO Herbal Essences Pure Plant Essences Shampoo, Conditioner...',
    discount: 'Save $5.00',
    category: 'Hair Care',
    expiration: 'Expires: 09/26/2026 - 4 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#059669',
    badges: ['Top Deal', 'Weekly Ad'],
    retailer: 'shoprite'
  },
  {
    id: 'sr3',
    brand: "Harry's Plus",
    title: "Save $2.00 on ONE Harry's Plus Razor Handle Pack (Select varieties)...",
    discount: 'Save $2.00',
    category: 'Personal Care',
    expiration: 'Expires: 10/03/2026 - 11 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#ea580c',
    badges: ['New'],
    retailer: 'shoprite'
  },
  {
    id: 'sr4',
    brand: "L'ORÉAL PARIS",
    title: "Save $3.00 on TWO L'Oréal Paris Elvive haircare or Advanced Hairstyle products...",
    discount: 'Save $3.00',
    category: 'Hair Care',
    expiration: 'Expires: 09/29/2026 - 7 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#dc2626',
    badges: ['Weekly Ad', 'Limit 4'],
    retailer: 'shoprite'
  },
  {
    id: 'sr5',
    brand: 'AVEENO Baby',
    title: 'Save $2.00 on any ONE (1) AVEENO Baby or AVEENO Kids product (excludes travel/trial)...',
    discount: 'Save $2.00',
    category: 'Baby Care',
    expiration: 'Expires: 10/05/2026 - 13 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#d97706',
    badges: ['New'],
    retailer: 'shoprite'
  },
  {
    id: 'sr6',
    brand: 'Blue Buffalo',
    title: 'Save $1.00 on any ONE (1) Blue Buffalo Dog Food Dry or Wet or Treats...',
    discount: 'Save $1.00',
    category: 'Pet Care',
    expiration: 'Expires: 09/28/2026 - 6 days left',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#2563eb',
    badges: ['Weekly Ad'],
    retailer: 'shoprite'
  },
  {
    id: 'sr7',
    brand: 'The Pink Stuff',
    title: 'Save $1.00 When you Buy ONE (1) The Pink Stuff Foaming Toilet Cleaner 2-Pack...',
    discount: 'Save $1.00',
    category: 'Cleaning',
    expiration: 'Expires: 09/26/2026',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#db2777',
    badges: ['New', 'Limit 4'],
    retailer: 'shoprite'
  },
  {
    id: 'sr8',
    brand: 'Tide',
    title: 'Save $3.00 on Tide PODS Laundry Detergent 42ct or Liquid Detergent 92oz...',
    discount: 'Save $3.00',
    category: 'Household & Laundry',
    expiration: 'Expires: 09/29/2026',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['Limit 4'],
    retailer: 'shoprite'
  },
  {
    id: 'sr9',
    brand: 'Chobani',
    title: 'Save $0.75 on Chobani Less Sugar or Zero Sugar Greek Yogurt Cups 5.3oz...',
    discount: 'Save $0.75',
    category: 'Dairy',
    expiration: 'Expires: 09/24/2026',
    buttonLabel: 'Load Coupon',
    isClipped: false,
    imageColor: '#059669',
    badges: ['New'],
    retailer: 'shoprite'
  }
];

const WALGREENS_COUPONS: CouponItem[] = [
  {
    id: 'wg1',
    brand: 'myW exclusive',
    title: 'Multi use offer valid online only',
    discount: 'Earn $5 W Cash rewards on $20+...',
    category: 'Rewards & Exclusives',
    expiration: 'Expires Oct 4, 2026',
    buttonLabel: 'Clip rebate',
    isClipped: false,
    imageColor: '#1e293b',
    badges: ['myW exclusive', '$5 Cash'],
    retailer: 'walgreens'
  },
  {
    id: 'wg2',
    brand: 'Wonderbelly®',
    title: 'ONE Wonderbelly® Product',
    discount: '$3 off 1',
    category: 'Health & Wellness',
    expiration: 'Expires Oct 4, 2026',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#ec4899',
    badges: ['Only for you'],
    retailer: 'walgreens'
  },
  {
    id: 'wg3',
    brand: 'Olay®',
    title: 'TWO Olay® Facial Moisturizer, Eye or Serum Products (excludes Olay Complete, Active Hydrating, Cleanser and trial/travel size).',
    discount: '$5 off 2',
    category: 'Beauty & Personal Care',
    expiration: 'Expires Oct 4, 2026',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#7c3aed',
    badges: ['Top Deal'],
    retailer: 'walgreens'
  },
  {
    id: 'wg4',
    brand: 'Dove',
    title: 'Dove Bar (6 ct or larger), Body Wash (20 oz or larger), Shower Gel (20 oz), Premium Body Wash, Body Scrub...',
    discount: '$2 off 1',
    category: 'Beauty & Personal Care',
    expiration: 'Expires Oct 4, 2026',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['Personal Care'],
    retailer: 'walgreens'
  },
  {
    id: 'wg5',
    brand: 'Neutrogena',
    title: 'ONE (1) Neutrogena Makeup Remover Wipes, Liquid Cleanser or Moisturizer',
    discount: '$3 off 1',
    category: 'Beauty & Skincare',
    expiration: 'Expires Oct 11, 2026',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#16a34a',
    badges: ['Weekly Deal'],
    retailer: 'walgreens'
  },
  {
    id: 'wg6',
    brand: 'Crest®',
    title: 'TWO Crest 3D White, Pro-Health, or Complete Toothpastes 2.7 oz or larger',
    discount: '$3 off 2 via Rebate',
    category: 'Oral Care',
    expiration: 'Expires Oct 18, 2026',
    buttonLabel: 'Clip rebate',
    isClipped: false,
    imageColor: '#9333ea',
    badges: ['Rebate Deal'],
    retailer: 'walgreens'
  }
];

const EXTRA_WALGREENS_COUPONS: CouponItem[] = [
  {
    id: 'wg7',
    brand: 'CeraVe Skincare',
    title: 'Save $3.00 on any ONE (1) CeraVe Skincare Product (excludes trial sizes and 1 oz. bar)',
    discount: '$3 off 1',
    category: 'Beauty & Personal Care',
    expiration: 'Expires 10/15/26',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['Top Pick'],
    retailer: 'walgreens'
  },
  {
    id: 'wg8',
    brand: 'Tide PODS Detergent',
    title: 'Save $2.00 on ONE Tide PODS Laundry Detergent 23-42 ct or Liquid 59-88 oz',
    discount: '$2 off 1',
    category: 'Household Essentials',
    expiration: 'Expires 10/20/26',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#ea580c',
    badges: ['myWalgreens'],
    retailer: 'walgreens'
  },
  {
    id: 'wg9',
    brand: 'Huggies Diapers',
    title: '$3.00 off 1 Huggies Little Snugglers or Little Movers Diapers via Cash Rebate',
    discount: '$3 off 1 via Rebate',
    category: 'Baby Care',
    expiration: 'Expires 10/25/26',
    buttonLabel: 'Clip rebate',
    isClipped: false,
    imageColor: '#db2777',
    badges: ['Cash Rebate'],
    retailer: 'walgreens'
  },
  {
    id: 'wg10',
    brand: 'Colgate Total',
    title: '$4.00 off 2 Colgate Total, Optic White, or Max Fresh Toothpaste 3 oz+',
    discount: '$4 off 2',
    category: 'Personal Care',
    expiration: 'Expires 10/18/26',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#dc2626',
    badges: ['Top Deal'],
    retailer: 'walgreens'
  },
  {
    id: 'wg11',
    brand: 'Nature Made Vitamins',
    title: 'Buy 1, Get 1 FREE on Nature Made Vitamins & Dietary Supplements',
    discount: 'BOGO Free',
    category: 'Vitamins & Supplements',
    expiration: 'Expires 10/28/26',
    buttonLabel: 'Clip offer',
    isClipped: false,
    imageColor: '#f59e0b',
    badges: ['BOGO Free'],
    retailer: 'walgreens'
  },
  {
    id: 'wg12',
    brand: 'Scott Paper Towels',
    title: '$1.25 off 1 Scott Bath Tissue 12 rolls or Scott Paper Towels 6 rolls',
    discount: '$1.25 off 1',
    category: 'Household Essentials',
    expiration: 'Expires 10/22/26',
    buttonLabel: 'Clip',
    isClipped: false,
    imageColor: '#2563eb',
    badges: ['Weekly Ad'],
    retailer: 'walgreens'
  }
];

const FAMILYDOLLAR_COUPONS: CouponItem[] = [
  {
    id: 'fd1',
    brand: 'Family Dollar',
    title: '$5.00 OFF your purchase of $25.00 or more STOREWIDE!',
    discount: 'Save $5',
    category: 'Storewide',
    expiration: 'Expires: Oct 01',
    buttonLabel: 'CLIP COUPON',
    isClipped: true,
    imageColor: '#ea580c',
    badges: ['Wed. 9/30 Only!'],
    retailer: 'familydollar'
  },
  {
    id: 'fd2',
    brand: 'Pampers',
    title: 'Diapers, Baby Wipes, or Training Pants',
    discount: 'Save $7',
    category: 'Baby & Child Care',
    expiration: 'Expires: Oct 05',
    buttonLabel: 'CLIP COUPON',
    isClipped: true,
    imageColor: '#0284c7',
    badges: ['EXPIRES SOON'],
    retailer: 'familydollar'
  },
  {
    id: 'fd3',
    brand: 'Angel Soft',
    title: 'Angel Soft® Bath Tissue',
    discount: 'Save $1',
    category: 'Household & Paper',
    expiration: 'Expires: Oct 08',
    buttonLabel: 'CLIP COUPON',
    isClipped: true,
    imageColor: '#0ea5e9',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd4',
    brand: 'OxiClean',
    title: 'OxiClean™ Versatile Stain Remover Powder or Laundry Stain Remover Spray',
    discount: 'Save $2',
    category: 'Laundry Care',
    expiration: 'Expires: Oct 12',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#eab308',
    badges: ['Popular'],
    retailer: 'familydollar'
  },
  {
    id: 'fd5',
    brand: 'Fabuloso',
    title: 'Fabuloso Multi-Purpose Cleaner',
    discount: 'Save $1',
    category: 'Cleaning Supplies',
    expiration: 'Expires: Oct 12',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#db2777',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd6',
    brand: 'CHIPS AHOY!',
    title: 'CHIPS AHOY! Limited Edition',
    discount: 'Save $2',
    category: 'Snacks & Cookies',
    expiration: 'Expires: Oct 15',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#1e293b',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd7',
    brand: 'ARM & HAMMER',
    title: 'ARM & HAMMER™ Liquid Laundry Detergent',
    discount: 'Save $2',
    category: 'Laundry Care',
    expiration: 'Expires: Oct 15',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#f59e0b',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd8',
    brand: 'Angel Soft / Sparkle',
    title: 'Angel Soft®, Sparkle®, Brawny®, or Quilted Northern®',
    discount: 'Save $5',
    category: 'Paper Products',
    expiration: 'Expires: Oct 20',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#0284c7',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd9',
    brand: 'Tide',
    title: 'Tide Laundry Detergent Downy or Pods',
    discount: 'Save $1',
    category: 'Laundry Care',
    expiration: 'Expires: Oct 22',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#ea580c',
    badges: [],
    retailer: 'familydollar'
  },
  {
    id: 'fd10',
    brand: 'Tide Febreze',
    title: 'Tide Laundry Detergent Febreze Fresh Scent',
    discount: 'Save $2',
    category: 'Laundry Care',
    expiration: 'Expires: Oct 22',
    buttonLabel: 'CLIP COUPON',
    isClipped: false,
    imageColor: '#c2410c',
    badges: [],
    retailer: 'familydollar'
  }
];

const CVS_COUPONS: CouponItem[] = [
  {
    id: 'cvs1',
    brand: 'General Mills Cereals',
    title: 'When you buy TWO(2) PACKAGES any flavor General Mills cereal or granola...',
    discount: '$1.00 OFF',
    category: 'Food',
    expiration: 'Exp 09/30/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#dc2626',
    badges: ['New'],
    retailer: 'cvs'
  },
  {
    id: 'cvs2',
    brand: 'Charmin Toilet Tissue',
    title: 'ONE Charmin Ultra Toilet paper product 9 MEGA Roll, 12 MEGA Roll, 6 MEGA XL Rol...',
    discount: 'Save $2.00',
    category: 'Household',
    expiration: 'Exp 09/25/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['New'],
    retailer: 'cvs'
  },
  {
    id: 'cvs3',
    brand: 'ALWAYS',
    title: 'ONE Always Infinity, Radiant, Pure Cotton or Pocket Flexfoam Pads (excludes...',
    discount: '$1.00 OFF',
    category: 'Personal Care',
    expiration: 'Exp 09/30/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#ec4899',
    badges: [],
    retailer: 'cvs'
  },
  {
    id: 'cvs4',
    brand: 'Ensure®',
    title: 'on any TWO (2) Ensure® products (valid on 4-count packs or larger)',
    discount: 'Save $7.00',
    category: 'Health',
    expiration: 'Exp 10/03/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#2563eb',
    badges: ['New'],
    retailer: 'cvs'
  },
  {
    id: 'cvs5',
    brand: 'Old Spice Whole Body',
    title: 'TWO Old Spice Whole Body Deodorant Sprays, Sticks, or Creams (excludes...',
    discount: 'Save $7.00',
    category: 'Personal Care',
    expiration: 'Exp 09/26/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#b91c1c',
    badges: ['New'],
    retailer: 'cvs'
  },
  {
    id: 'cvs6',
    brand: 'Head & Shoulders Hair Care',
    title: 'ONE Head & Shoulders CLINICAL Shampoo 13.5oz or higher (Excludes...',
    discount: 'Save $3.00',
    category: 'Hair Care',
    expiration: 'Exp 09/26/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#1d4ed8',
    badges: ['New'],
    retailer: 'cvs'
  },
  {
    id: 'cvs7',
    brand: 'Huggies® Wipes',
    title: 'off TWO (2) packages of Huggies® Baby Wipes, Natural Care®, Simply Clean®, Ski...',
    discount: 'Save $0.50',
    category: 'Baby',
    expiration: 'Exp 10/03/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#059669',
    badges: [],
    retailer: 'cvs'
  },
  {
    id: 'cvs8',
    brand: 'Dove',
    title: 'on select TWO (2) Dove Body Washes (10.3oz+), Bars (4ct+), Scrubs (15oz)...',
    discount: 'SAVE $5.00',
    category: 'Personal Care',
    expiration: 'Exp 10/03/2026',
    buttonLabel: 'Send to card',
    isClipped: false,
    imageColor: '#0369a1',
    badges: ['New'],
    retailer: 'cvs'
  }
];

const KROGER_COUPONS: CouponItem[] = [
  {
    id: 'kr1',
    brand: 'Save $20.00 When You Spend $20.00',
    title: '$20 off Your First Pickup or Delivery Order...',
    discount: '$20 OFF*',
    category: 'Pickup & Delivery Only',
    expiration: 'Exp. Sep. 15 - 2 days left!',
    buttonLabel: 'Add Card to Clip',
    isClipped: false,
    imageColor: '#1d4ed8',
    badges: ['Pickup & Delivery Only'],
    retailer: 'kroger'
  },
  {
    id: 'kr2',
    brand: 'Get 4x POINTS',
    title: 'Get 4x POINTS',
    discount: '4X POINTS',
    category: '4X Gift Card Event',
    expiration: 'Exp. Sep. 15 - 2 days left!',
    buttonLabel: 'Add Card to Clip',
    isClipped: false,
    imageColor: '#eab308',
    badges: ['4X Gift Card Event'],
    retailer: 'kroger'
  },
  {
    id: 'kr3',
    brand: 'Save $5.00 When You Spend $2...',
    title: 'Save $5 on your Produce Purchase',
    discount: 'Save $5.00',
    category: 'Bonus Digital Deals',
    expiration: 'Exp. Sep. 15 - 2 days left!',
    buttonLabel: 'Add Card to Clip',
    isClipped: false,
    imageColor: '#15803d',
    badges: ['Bonus Digital Deals'],
    retailer: 'kroger'
  },
  {
    id: 'kr4',
    brand: 'Save $4.00 on 4',
    title: 'Buy 4, Save $4 on Claussen, Heinz, Kraft, ...',
    discount: 'Save $4.00',
    category: 'Pickup & Delivery Only',
    expiration: 'Exp. Sep. 15 - 2 days left!',
    buttonLabel: 'Add Card to Clip',
    isClipped: false,
    imageColor: '#dc2626',
    badges: ['Pickup & Delivery Only'],
    retailer: 'kroger'
  },
  {
    id: 'kr5',
    brand: 'Save $1.00',
    title: 'Save $1.00 on Artesano Bread or Buns',
    discount: 'Save $1.00',
    category: '5X Event',
    expiration: 'Exp. Sep. 22',
    buttonLabel: 'Add Card to Clip',
    isClipped: false,
    imageColor: '#d97706',
    badges: ['5X Event'],
    retailer: 'kroger'
  }
];

const PUBLIX_COUPONS: CouponItem[] = [
  {
    id: 'pub1',
    brand: 'Chobani',
    title: 'Save $1.00 on any ONE (1) Chobani® Greek Yogurt 4-Pack or Zero Sugar 4-Pack (Select Varieties)',
    discount: 'Save $1.00',
    category: 'Dairy & Refrigerated',
    expiration: 'Exp. 10/12/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#007a3d',
    badges: ['Digital Coupon', 'Club Publix'],
    retailer: 'publix'
  },
  {
    id: 'pub2',
    brand: 'GreenWise',
    title: 'Save $1.50 on ONE (1) GreenWise Organic Extra Virgin Olive Oil 16.9 oz bottle',
    discount: 'Save $1.50',
    category: 'Pantry & Oils',
    expiration: 'Exp. 10/15/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#15803d',
    badges: ['GreenWise', 'Club Publix'],
    retailer: 'publix'
  },
  {
    id: 'pub3',
    brand: 'Tide',
    title: 'Save $3.00 on any ONE (1) Tide Liquid Laundry Detergent 92 oz or Tide PODS 32-42 ct',
    discount: 'Save $3.00',
    category: 'Household Essentials',
    expiration: 'Exp. 10/08/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#ea580c',
    badges: ['Club Publix', 'Popular'],
    retailer: 'publix'
  },
  {
    id: 'pub4',
    brand: 'Publix Deli',
    title: 'Save $2.00 on any Whole Publix Deli Sub or Wrap (Freshly Made to Order)',
    discount: 'Save $2.00',
    category: 'Deli & Prepared',
    expiration: 'Exp. 10/20/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#047857',
    badges: ['Publix Perks', 'Deli Favorite'],
    retailer: 'publix'
  },
  {
    id: 'pub5',
    brand: 'Starbucks',
    title: 'Save $2.50 on any TWO (2) Starbucks® Packaged Coffee 11-12 oz or K-Cup® Pods 10-12 ct',
    discount: 'Save $2.50',
    category: 'Beverages & Coffee',
    expiration: 'Exp. 10/18/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#065f46',
    badges: ['Club Publix'],
    retailer: 'publix'
  },
  {
    id: 'pub6',
    brand: 'General Mills',
    title: 'Save $1.00 on TWO (2) General Mills Cereals (Cheerios, Honey Nut Cheerios, Cinnamon Toast Crunch)',
    discount: 'Save $1.00',
    category: 'Breakfast & Cereal',
    expiration: 'Exp. 10/22/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#d97706',
    badges: ['Digital Coupon'],
    retailer: 'publix'
  },
  {
    id: 'pub7',
    brand: "Boar's Head",
    title: "Save $1.50 on 1 lb or more of Boar's Head Ovengold Turkey Breast or Sweet Slice Ham",
    discount: 'Save $1.50',
    category: 'Deli & Prepared',
    expiration: 'Exp. 10/25/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#b91c1c',
    badges: ['Premium Deli'],
    retailer: 'publix'
  },
  {
    id: 'pub8',
    brand: 'Bounty',
    title: 'Save $2.00 on any ONE (1) Bounty Paper Towels 6 Double Rolls or larger',
    discount: 'Save $2.00',
    category: 'Household Essentials',
    expiration: 'Exp. 10/14/2026',
    buttonLabel: 'Clip coupon',
    isClipped: false,
    imageColor: '#0284c7',
    badges: ['Club Publix'],
    retailer: 'publix'
  }
];

interface SimulatorProps {
  config: ExtensionConfig;
}

export function Simulator({ config }: SimulatorProps) {
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerId>(config.activeRetailer || 'publix');
  const [shopriteCoupons, setShopriteCoupons] = useState<CouponItem[]>(SHOPRITE_COUPONS);
  const [walgreensCoupons, setWalgreensCoupons] = useState<CouponItem[]>(WALGREENS_COUPONS);
  const [familydollarCoupons, setFamilydollarCoupons] = useState<CouponItem[]>(FAMILYDOLLAR_COUPONS);
  const [cvsCoupons, setCvsCoupons] = useState<CouponItem[]>(CVS_COUPONS);
  const [krogerCoupons, setKrogerCoupons] = useState<CouponItem[]>(KROGER_COUPONS);
  const [publixCoupons, setPublixCoupons] = useState<CouponItem[]>(PUBLIX_COUPONS);
  
  const coupons = selectedRetailer === 'publix' ? publixCoupons : selectedRetailer === 'shoprite' ? shopriteCoupons : selectedRetailer === 'walgreens' ? walgreensCoupons : selectedRetailer === 'cvs' ? cvsCoupons : selectedRetailer === 'kroger' ? krogerCoupons : familydollarCoupons;
  const setCoupons = selectedRetailer === 'publix' ? setPublixCoupons : selectedRetailer === 'shoprite' ? setShopriteCoupons : selectedRetailer === 'walgreens' ? setWalgreensCoupons : selectedRetailer === 'cvs' ? setCvsCoupons : selectedRetailer === 'kroger' ? setKrogerCoupons : setFamilydollarCoupons;

  const [walgreensHasMore, setWalgreensHasMore] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const handleLoadMoreWalgreens = () => {
    if (!walgreensHasMore) return;
    setWalgreensCoupons(prev => [...prev, ...EXTRA_WALGREENS_COUPONS]);
    setWalgreensHasMore(false);
    addLog(`📄 Loaded 6 additional Walgreens paperless offers via "Load More"! All 12 offers now available.`);
  };
  const [isNestedWindow, setIsNestedWindow] = useState(true);
  const [activeFilter, setActiveFilter] = useState(selectedRetailer === 'publix' ? 'All Coupons (284)' : (selectedRetailer === 'shoprite' ? 'All Coupons - (254)' : 'All Offers (186)'));
  const [isRunning, setIsRunning] = useState(false);
  const [clippedCount, setClippedCount] = useState(0);
  const [currentActionText, setCurrentActionText] = useState('Ready for 1-click execution');
  const [logs, setLogs] = useState<string[]>([
    `Target: ${selectedRetailer === 'publix' ? (config.publixTargetUrl || 'https://www.publix.com/savings/digital-coupons') : (selectedRetailer === 'shoprite' ? (config.shopriteTargetUrl || config.targetUrl) : (config.walgreensTargetUrl || 'https://www.walgreens.com/offers/offers.jsp'))}`,
    `Simulator initialized for ${selectedRetailer === 'publix' ? 'Publix (Club Publix)' : (selectedRetailer === 'shoprite' ? 'ShopRite (Price Plus®)' : 'Walgreens (myWalgreens™)')}.`
  ]);
  const [completionNotice, setCompletionNotice] = useState<{ count: number; stopped: boolean; isAllLoaded?: boolean; retailer?: RetailerId } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState<'instant' | 'individual'>(config.clippingStrategy || 'instant');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);
  const couponsRef = useRef(coupons);
  couponsRef.current = coupons;

  useEffect(() => {
    if (config.clippingStrategy) {
      setActiveStrategy(config.clippingStrategy);
    }
  }, [config.clippingStrategy]);

  useEffect(() => {
    setActiveFilter(
      selectedRetailer === 'publix' ? 'All Coupons (284)' :
      selectedRetailer === 'shoprite' ? 'All Coupons - (254)' :
      selectedRetailer === 'walgreens' ? 'All Offers (186)' :
      selectedRetailer === 'cvs' ? 'All (162)' :
      selectedRetailer === 'kroger' ? 'All Coupons (302)' : 'Smart Coupons (120)'
    );
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Switched view to ${
        selectedRetailer === 'publix' ? 'Publix (Club Publix)' :
        selectedRetailer === 'shoprite' ? 'ShopRite (Price Plus®)' :
        selectedRetailer === 'walgreens' ? 'Walgreens (myWalgreens™)' :
        selectedRetailer === 'cvs' ? 'CVS (ExtraCare®)' :
        selectedRetailer === 'kroger' ? "Kroger (Shopper's Card)" : 'Family Dollar (Smart Coupons)'
      }`,
      ...prev.slice(0, 48)
    ]);
  }, [selectedRetailer]);

  const loadedCount = coupons.filter(c => c.isClipped).length;

  const handleSelectModeAndStart = (mode: 'instant' | 'individual') => {
    setActiveStrategy(mode);
    setShowModeModal(false);
    runLoaderScript(mode);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleManualClip = (id: string) => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    const target = coupons.find(c => c.id === id);
    if (target?.isClipped) return;

    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, isClipped: true } : c))
    );
    if (target) {
      addLog(`✓ Manually loaded coupon: ${target.brand} - ${target.discount}`);
    }
  };

  const handleUnclipCoupon = (id: string) => {
    const target = coupons.find(c => c.id === id);
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, isClipped: false } : c))
    );
    setClippedCount(prev => Math.max(0, prev - 1));
    if (target) {
      addLog(`↩️ Unclipped coupon for testing: ${target.brand} - ${target.discount}`);
    }
  };

  const handleUnclipAll = () => {
    setCompletionNotice(null);
    setCoupons(prev => prev.map(c => ({ ...c, isClipped: false })));
    setClippedCount(0);
    setCurrentActionText('All coupons unclipped (Ready to test loading)');
    addLog(`↩️ Unclipped ALL ${selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))} coupons for testing.`);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.querySelectorAll('[data-cs-processed]').forEach(el => {
        el.removeAttribute('data-cs-processed');
      });
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleClipAll = () => {
    setCompletionNotice(null);
    setCoupons(prev => prev.map(c => ({ ...c, isClipped: true })));
    setClippedCount(coupons.length);
    setCurrentActionText(`All ${coupons.length} coupons marked as loaded`);
    addLog(`✓ Marked all ${coupons.length} coupons as loaded on ${selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))}.`);
  };

  const handleReset = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
    setCompletionNotice(null);
    setWalgreensHasMore(true);
    if (selectedRetailer === 'publix') {
      setPublixCoupons(PUBLIX_COUPONS);
    } else if (selectedRetailer === 'shoprite') {
      setShopriteCoupons(SHOPRITE_COUPONS);
    } else if (selectedRetailer === 'cvs') {
      setCvsCoupons(CVS_COUPONS);
    } else if (selectedRetailer === 'familydollar') {
      setFamilydollarCoupons(FAMILYDOLLAR_COUPONS);
    } else if (selectedRetailer === 'kroger') {
      setKrogerCoupons(KROGER_COUPONS);
    } else {
      setWalgreensCoupons(WALGREENS_COUPONS);
    }
    setClippedCount(0);
    setCurrentActionText('Reset complete');
    addLog(`Reset all ${selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))} coupons in sandbox to default state.`);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.querySelectorAll('[data-cs-processed]').forEach(el => {
        el.removeAttribute('data-cs-processed');
      });
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const runLoaderScript = async (strategyOverride?: 'instant' | 'individual') => {
    if (isRunning) return;
    const mode = strategyOverride || activeStrategy || config.clippingStrategy || 'instant';
    setActiveStrategy(mode);
    setCompletionNotice(null);
    setIsRunning(true);
    abortControllerRef.current = false;

    const rName = selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'familydollar' ? 'Family Dollar' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens')));
    const pName = selectedRetailer === 'publix' ? 'Club Publix' : selectedRetailer === 'shoprite' ? 'Price Plus®' : (selectedRetailer === 'cvs' ? 'ExtraCare®' : (selectedRetailer === 'familydollar' ? 'Smart Coupons' : (selectedRetailer === 'kroger' ? "Shopper's Card" : 'myWalgreens™')));
    const destinationUrl = selectedRetailer === 'publix'
      ? (config.publixTargetUrl || 'https://www.publix.com/savings/digital-coupons')
      : selectedRetailer === 'shoprite'
      ? (config.shopriteTargetUrl || config.targetUrl)
      : (selectedRetailer === 'cvs' ? (config.cvsTargetUrl || 'https://www.cvs.com/extracare/home') : (selectedRetailer === 'familydollar' ? (config.familydollarTargetUrl || 'https://www.familydollar.com/smart-coupons') : (selectedRetailer === 'kroger' ? (config.krogerTargetUrl || 'https://www.kroger.com/savings/cl/coupons/') : (config.walgreensTargetUrl || 'https://www.walgreens.com/offers/offers.jsp?ban=dl_dlsp_MegaMenu_Coupons'))));

    addLog(`🚀 Directing to: ${destinationUrl}`);
    addLog(`⚙️ Mode Selected: ${mode === 'instant' ? '⚡ Instant Mode (Load All at Once)' : '🎬 Step-by-Step Mode (Individual Glide)'}`);
    addLog(`Checking ${rName} (${pName}) loyalty account status...`);

    if (isGuest) {
      const loginMsg = `⚠️ Please sign in to your ${rName} account to load coupons`;
      setCurrentActionText(loginMsg);
      addLog(`⚠️ ${loginMsg}`);
      setShowLoginModal(true);
      setIsRunning(false);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    container.querySelectorAll('[data-cs-processed]').forEach(el => {
      const cId = el.getAttribute('data-coupon-id');
      const c = couponsRef.current.find(item => item.id === cId);
      if (!c || !c.isClipped) {
        el.removeAttribute('data-cs-processed');
      }
    });

    const unclippedInitial = couponsRef.current.filter(c => !c.isClipped);
    if (unclippedInitial.length === 0) {
      addLog(`ℹ️ Checked all offers: Every available digital coupon is already loaded to your ${pName} card.`);
      addLog(`✓ 0 new offers to clip — loyalty account is 100% up to date.`);
      setCurrentActionText('✅ Everything is up to date! All coupons already loaded (0 new offers).');
      setCompletionNotice({ count: 0, stopped: false, isAllLoaded: true, retailer: selectedRetailer });
      setIsRunning(false);
      return;
    }

    addLog(`Target container identified: ${rName} Digital Offers view (overflow-y: auto)`);
    addLog('Scanning and clipping unclipped offers...');

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let localClipped = 0;
    let consecutiveEmptyPasses = 0;
    const MAX_EMPTY_PASSES = 8;

    try {
      while (!abortControllerRef.current) {
        const allButtons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
        const buttons = allButtons.filter(b => {
          const text = (b.textContent || '').trim().toLowerCase();
          const matchesKw = config.customKeywords.some(kw => text.includes(kw)) || text.startsWith('clip');
          const hasCouponId = b.hasAttribute('data-coupon-id');
          return matchesKw || hasCouponId;
        });

        const unclippedButtons = buttons.filter(b => {
          const text = (b.textContent || '').trim().toLowerCase();
          const isProcessed = b.getAttribute('data-cs-processed') === 'true';
          const isAlreadyClipped = 
            text.includes('loaded ✓') || text.includes('clipped ✓') || 
            text === 'clipped' || text === 'loaded' || text === 'added' || 
            text.includes('rebate clipped') || text.includes('clipped rebate') ||
            text.includes('unclip') || text === 'unclip';
          const couponId = b.getAttribute('data-coupon-id');
          const coupon = couponsRef.current.find(c => c.id === couponId);
          return !isProcessed && !isAlreadyClipped && couponId && coupon && !coupon.isClipped;
        });

        if (unclippedButtons.length === 0) {
          // If on Walgreens and more offers can be loaded, click Load More to load all coupons!
          const loadMoreBtn = container.querySelector('button[data-element-name="Load More"], button.wag-load-more') as HTMLButtonElement;
          if (loadMoreBtn && !loadMoreBtn.disabled) {
            setCurrentActionText(`Loading all remaining ${rName} offers (Load More)...`);
            addLog(`Found "Load More Offers" button on ${rName}. Loading next batch of coupons...`);
            loadMoreBtn.click();
            await sleep(650);
            consecutiveEmptyPasses = 0;
            continue;
          }

          consecutiveEmptyPasses++;
          setCurrentActionText(`Scanning for more ${rName} offers... [${consecutiveEmptyPasses}/${MAX_EMPTY_PASSES}]`);
          container.scrollBy({ top: config.scrollStep, behavior: 'smooth' });
          await sleep(config.scrollDelay);

          const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
          if (isAtBottom && consecutiveEmptyPasses >= MAX_EMPTY_PASSES) {
            addLog(`Reached end of ${rName} coupon list.`);
            break;
          }
          continue;
        }

        consecutiveEmptyPasses = 0;

        if (mode === 'instant') {
          if (selectedRetailer === 'familydollar') {
            setCurrentActionText(`🛡️ Smart Coupons Anti-Bot Pacer: Loading ${unclippedButtons.length} offers safely...`);
            for (const btn of unclippedButtons) {
              if (abortControllerRef.current) break;
              try {
                const text = (btn.textContent || '').trim().toLowerCase();
                if (text.includes('unclip') || text === 'unclip') {
                  btn.setAttribute('data-cs-processed', 'true');
                  continue;
                }

                btn.setAttribute('data-cs-processed', 'true');
                const couponId = btn.getAttribute('data-coupon-id');
                const coupon = couponsRef.current.find(c => c.id === couponId);

                if (couponId && coupon && !coupon.isClipped) {
                  btn.style.outline = '2px solid #003874';
                  setCurrentActionText(`⏳ Smart Coupons: Clipping ${coupon.brand} - ${coupon.discount}...`);
                  await sleep(400);

                  // Server confirmation simulation: state transitions to clipped (UNCLIP)
                  setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isClipped: true } : c));
                  localClipped++;
                  setClippedCount(prev => prev + 1);
                  addLog(`🛡️ Clipped Smart Coupon: ${coupon.brand} - ${coupon.discount} (#${localClipped})`);
                  btn.style.outline = 'none';

                  // Humanized anti-bot pacing (750ms) prevents Family Dollar rate-limit rejection
                  await sleep(750);

                  // Anti-bot breathing pause every 7 coupons
                  if (localClipped % 7 === 0 && localClipped < unclippedButtons.length) {
                    setCurrentActionText(`🛡️ Smart Coupons anti-bot breathing pause (preventing unclip rollback)...`);
                    addLog(`🛡️ Anti-bot breathing cooldown: Pausing 2.2s to prevent Family Dollar server rate-limit rollback.`);
                    await sleep(2200);
                  }
                }
              } catch (e) {
                console.error(e);
              }
            }
          } else if (selectedRetailer === 'walgreens') {
            setCurrentActionText(`🛡️ Safe Auto-Pacer: Loading ${unclippedButtons.length} offers safely...`);
            for (const btn of unclippedButtons) {
              if (abortControllerRef.current) break;
              try {
                btn.setAttribute('data-cs-processed', 'true');
                const couponId = btn.getAttribute('data-coupon-id');
                const coupon = couponsRef.current.find(c => c.id === couponId);

                if (couponId && coupon && !coupon.isClipped) {
                  btn.style.outline = '2px solid #0f172a';
                  setCurrentActionText(`⏳ Loading offer: ${coupon.brand} - ${coupon.discount}...`);
                  await sleep(400);

                  setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isClipped: true } : c));
                  localClipped++;
                  setClippedCount(prev => prev + 1);
                  addLog(`🛡️ Loaded to myWalgreens: ${coupon.brand} - ${coupon.discount} (#${localClipped})`);
                  btn.style.outline = 'none';

                  // Pacing delay
                  await sleep(750);

                  if (localClipped % 5 === 0 && localClipped < unclippedButtons.length) {
                    setCurrentActionText(`🛡️ Anti-bot cooldown pause (Akamai rate-limit protection)...`);
                    addLog(`🛡️ Anti-bot breathing cooldown: Pausing 2.5s to prevent Walgreens "cannot clip" rate-limit lock.`);
                    await sleep(2500);
                  }
                }
              } catch (e) {
                console.error(e);
              }
            }
          } else {
            setCurrentActionText(`⚡ Rapid Batch: Loading ${unclippedButtons.length} coupons at once...`);
            for (const btn of unclippedButtons) {
              if (abortControllerRef.current) break;
              try {
                btn.setAttribute('data-cs-processed', 'true');
                const couponId = btn.getAttribute('data-coupon-id');
                const coupon = couponsRef.current.find(c => c.id === couponId);

                if (couponId && coupon && !coupon.isClipped) {
                  setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isClipped: true } : c));
                  localClipped++;
                  setClippedCount(prev => prev + 1);
                  addLog(`⚡ Batch load: ${coupon.brand} - ${coupon.discount} (#${localClipped})`);
                }
                await sleep(60);
              } catch (e) {
                console.error(e);
              }
            }
            addLog(`⚡ Batch loaded ${unclippedButtons.length} coupons! Total loaded: ${localClipped}`);
            await sleep(150);
          }

          if (abortControllerRef.current) break;
          container.scrollBy({ top: config.scrollStep + 200, behavior: 'smooth' });
          await sleep(Math.min(config.scrollDelay, 350));
        } else {
          for (const btn of unclippedButtons) {
            if (abortControllerRef.current) break;

            try {
              // Re-check unclip in Step Mode
              const text = (btn.textContent || '').trim().toLowerCase();
              if (text.includes('unclip') || text === 'unclip') {
                btn.setAttribute('data-cs-processed', 'true');
                continue;
              }

              btn.setAttribute('data-cs-processed', 'true');
              const btnRect = btn.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              if (btnRect.top < containerRect.top + 30 || btnRect.bottom > containerRect.bottom - 30) {
                const offset = btnRect.top - containerRect.top - (containerRect.height / 2) + (btnRect.height / 2);
                container.scrollBy({ top: offset, behavior: 'smooth' });
              }

              const couponId = btn.getAttribute('data-coupon-id');
              const coupon = couponsRef.current.find(c => c.id === couponId);
              const title = btn.getAttribute('data-title') || coupon?.brand || 'coupon';

              if (couponId && coupon && !coupon.isClipped) {
                setCurrentActionText(`Gliding to offer: ${title}...`);
                btn.style.outline = '3px solid #0f172a';
                await sleep(config.glideDelay);

                setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isClipped: true } : c));
                localClipped++;
                setClippedCount(prev => prev + 1);
                addLog(`✓ Clipped to ${pName} card: ${title} (#${localClipped})`);

                const clickWait = selectedRetailer === 'walgreens' 
                  ? Math.max(config.clickDelay, 900) 
                  : (selectedRetailer === 'familydollar' ? Math.max(config.clickDelay, 800) : config.clickDelay);
                await sleep(clickWait);
                btn.style.outline = 'none';

                if ((selectedRetailer === 'walgreens' || selectedRetailer === 'familydollar') && localClipped % (selectedRetailer === 'walgreens' ? 5 : 7) === 0 && localClipped < unclippedButtons.length) {
                  setCurrentActionText(`🛡️ Anti-bot breathing pause (protecting from server rate limit)...`);
                  addLog(`🛡️ Anti-bot pause: 2.2s cooldown after ${localClipped} clips to maintain clean session.`);
                  await sleep(2200);
                }
              }
            } catch (e) {
              console.error(e);
            }
          }

          if (abortControllerRef.current) break;
          container.scrollBy({ top: config.scrollStep + 150, behavior: 'smooth' });
          await sleep(config.scrollDelay);
        }
      }
    } finally {
      setIsRunning(false);
      const stopped = abortControllerRef.current;
      const allLoadedNow = coupons.every(c => c.isClipped) || localClipped === 0;
      if (stopped) {
        setCurrentActionText(`Stopped by user (${localClipped} clipped)`);
        addLog(`⏹️ Loader halted. Loaded ${localClipped} coupons.`);
      } else if (allLoadedNow && localClipped === 0) {
        setCurrentActionText('Up to date — all coupons are loaded');
        addLog(`✅ Up to date — all coupons are loaded on your ${pName} loyalty account.`);
      } else if (localClipped > 0) {
        setCurrentActionText(`🎉 Finished! Loaded ${localClipped} digital coupons!`);
        addLog(`🎉 Complete! All ${localClipped} coupons loaded to your ${rName} account.`);
      } else {
        setCurrentActionText('Up to date — all coupons are loaded');
        addLog(`✅ Up to date — all coupons are loaded on your ${pName} loyalty account.`);
      }
      setCompletionNotice({ count: localClipped, stopped, isAllLoaded: allLoadedNow, retailer: selectedRetailer });
    }
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
    setCurrentActionText('Stopping loader...');
    addLog('User clicked stop.');
  };

  return (
    <div id="sandbox-simulator" className="flex flex-col gap-4">
      {/* Multi-Retailer Selector & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-black text-base shadow-md">
            CS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">CouponSweep Multi-Retailer Engine</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                Publix, ShopRite, Walgreens &amp; More
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              1-click automated digital coupon clipping for grocery and pharmacy loyalty accounts.
            </p>
          </div>
        </div>

        {/* Retailer Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            id="tab-select-publix"
            onClick={() => setSelectedRetailer('publix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'publix'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#007a3d] text-white flex items-center justify-center text-[9px] font-black leading-none">P</div>
            <span>Publix (Club Publix)</span>
          </button>
          <button
            id="tab-select-shoprite"
            onClick={() => setSelectedRetailer('shoprite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'shoprite'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-red-500" />
            <span>ShopRite (Price Plus®)</span>
          </button>
          <button
            id="tab-select-walgreens"
            onClick={() => setSelectedRetailer('walgreens')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'walgreens'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
            <span>Walgreens (myWalgreens™)</span>
          </button>
          <button
            id="tab-select-cvs"
            onClick={() => setSelectedRetailer('cvs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'cvs'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-red-500" />
            <span>CVS (ExtraCare®)</span>
          </button>
          <button
            id="tab-select-kroger"
            onClick={() => setSelectedRetailer('kroger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'kroger'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Kroger</span>
          </button>
          <button
            id="tab-select-familydollar"
            onClick={() => setSelectedRetailer('familydollar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedRetailer === 'familydollar'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-red-600" />
            <span>Family Dollar</span>
          </button>
        </div>

        {/* Execution & Testing Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!isRunning ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-simulate-click-extension"
                onClick={() => setShowModeModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md border border-slate-600 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="Click extension icon: opens selection option (Instant or Step-by-Step), then loads coupons"
              >
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Click Extension Icon (Select Option)</span>
              </button>

              <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => handleSelectModeAndStart('instant')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    activeStrategy === 'instant'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title="Direct trigger: Instant Mode"
                >
                  <Zap className="w-3 h-3" />
                  <span>Instant</span>
                </button>
                <button
                  onClick={() => handleSelectModeAndStart('individual')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                    activeStrategy === 'individual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title="Direct trigger: Step-by-Step Mode"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Step-by-Step</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>Stop Loader</span>
            </button>
          )}

          <button
            id="btn-unclip-all"
            onClick={handleUnclipAll}
            disabled={isRunning}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Unclip all coupons in sandbox"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Unclip All ({loadedCount})</span>
          </button>

          <button
            id="btn-clip-all"
            onClick={handleClipAll}
            disabled={isRunning}
            className="hidden sm:flex px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Mark all as loaded"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clip All</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isRunning}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reset sandbox coupons"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Account State Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-semibold">Account State on {selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'familydollar' ? 'Family Dollar' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens')))}:</span>
          <span className="text-slate-400">
            {isGuest ? (
              <span className="text-amber-400 font-semibold">"Hi Guest" (Buttons show "{selectedRetailer === 'publix' ? 'Clip coupon' : selectedRetailer === 'shoprite' ? 'Login to Load' : (selectedRetailer === 'cvs' ? 'Sign in to send' : 'Sign in to clip')}")</span>
            ) : (
              <span className="text-emerald-400 font-semibold">"Signed In" ({selectedRetailer === 'publix' ? 'Club Publix #8241' : selectedRetailer === 'shoprite' ? 'Price Plus #4892' : (selectedRetailer === 'cvs' ? 'ExtraCare #7109' : 'myWalgreens #9104')})</span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGuest(!isGuest)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isGuest
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isGuest ? 'Switch to: Signed In' : 'Switch to: Hi Guest (Signed Out)'}
          </button>

          <button
            onClick={() => setIsNestedWindow(!isNestedWindow)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isNestedWindow
                ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/35'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>{isNestedWindow ? 'Embedded Coupon Frame' : 'Full Page View'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Retailer Webpage */}
      <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-300">
        {selectedRetailer === 'publix' ? (
          /* ================= PUBLIX HEADER ================= */
          <>
            <div className="border-b border-emerald-800 px-5 py-2.5 flex items-center justify-between text-xs text-white bg-[#007a3d] font-medium">
              <div className="flex items-center gap-4">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Savings: Digital Coupons</span>
                <span className="font-medium text-emerald-100 hidden sm:inline text-[11px]">Weekly Ad</span>
                <span className="font-medium text-emerald-100 hidden sm:inline text-[11px]">BOGOs</span>
                <span className="font-medium text-emerald-100 hidden md:inline text-[11px]">Delivery &amp; Curbside</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#005a2d] text-emerald-100 px-2.5 py-0.5 rounded text-[11px] font-bold">
                  Club Publix Member Savings
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#007a3d] text-white flex items-center justify-center font-black text-2xl shadow-sm tracking-tight">
                  P
                </div>
                <div>
                  <div className="font-black text-[#007a3d] text-2xl tracking-tight leading-none">
                    Publix.
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Digital Coupons
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-lg hidden sm:block">
                <input
                  type="text"
                  readOnly
                  value="Search all Publix digital coupons..."
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 px-4 text-xs text-slate-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <Store className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Your Store</div>
                    <div className="font-bold text-slate-800">
                      Store #1452 (Sunny Isles)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500">
                      {isGuest ? 'Hi Guest' : 'Hi, Mark'}
                    </div>
                    <div className="font-bold text-[#007a3d] text-xs sm:text-sm">
                      {isGuest ? (
                        <span 
                          id="publixLoginBtn"
                          data-qa="login"
                          className="cursor-pointer hover:underline inline-flex items-center gap-1 font-bold text-[#007a3d]"
                          onClick={() => setShowLoginModal(true)}
                          title="Click to view login requirement"
                        >
                          Log In / Sign Up
                        </span>
                      ) : (
                        <span className="cursor-pointer" onClick={() => setIsGuest(true)} title="Click to simulate signing out">
                          Club Publix Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6 px-5 text-center bg-emerald-50/50 border-b border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">284 Digital Coupons</div>
              <div className="text-xs font-semibold text-[#007a3d] uppercase tracking-wider mt-1">
                Save over $400 on groceries with Club Publix digital coupons
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['All Coupons (284)', 'BOGO Savings', 'Produce & Deli', 'Pantry & Grocery', 'Frozen & Dairy', 'Household'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeFilter === filter
                        ? 'bg-[#007a3d] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : selectedRetailer === 'shoprite' ? (
          /* ================= SHOPRITE HEADER ================= */
          <>
            <div className="border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">Careers</span>
                <span className="font-semibold text-slate-700">Pharmacy</span>
                <span className="font-semibold text-slate-700">Gift Cards</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-[11px]">
                  0 New See All Notifications
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-red-600 bg-white flex-shrink-0 p-0.5">
                  <img
                    src={couponLoaderLogo}
                    alt="CouponSweep"
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="font-black text-red-700 text-xl tracking-tight flex items-center gap-1.5">
                  <span>ShopRite</span>
                  <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded tracking-normal">Price Plus®</span>
                </div>
              </div>

              <div className="flex-1 max-w-lg hidden sm:block">
                <input
                  type="text"
                  readOnly
                  value="Search all ShopRite digital coupons..."
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 px-4 text-xs text-slate-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <Store className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">In Store</div>
                    <div className="font-bold text-slate-800">
                      {config.storeRsid ? `Store #${config.storeRsid}` : 'Store #218'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500">
                      {isGuest ? 'Hi Guest' : 'Mark (Price Plus #4892)'}
                    </div>
                    <div className="font-bold text-red-700 text-xs sm:text-sm">
                      {isGuest ? (
                        <span 
                          data-testid="header-sub-title-testId" 
                          className="HeaderSubtitle--__sc-1cc0e6bb-6 bwlvxL cursor-pointer hover:underline inline-flex items-center gap-1"
                          onClick={() => setShowLoginModal(true)}
                          title="Click to view login requirement"
                        >
                          Sign In or Register
                        </span>
                      ) : (
                        <span className="cursor-pointer" onClick={() => setIsGuest(true)} title="Click to simulate signing out">
                          Price Plus® Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6 px-5 text-center bg-slate-50 border-b border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">$649.13</div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1">
                Available ShopRite Savings
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['All Coupons - (254)', 'Expiring - (110)', 'Weekly Ad - (115)', 'Limit 4 Offers - (90)'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeFilter === filter
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : selectedRetailer === 'walgreens' ? (
          /* ================= WALGREENS HEADER ================= */
          <>
            <div className="border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs text-slate-600 bg-red-700 text-white font-medium">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white">Prescriptions &amp; Health</span>
                <span className="font-semibold text-white">Beauty</span>
                <span className="font-semibold text-white">Personal Care</span>
                <span className="font-semibold text-white">Photo</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-800 text-red-100 px-2.5 py-0.5 rounded text-[11px] font-bold">
                  myWalgreens™: $14.50 Cash Rewards Available
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-serif text-2xl font-black italic shadow-sm">
                  W
                </div>
                <div>
                  <div className="font-black text-red-700 text-xl tracking-tight leading-none">
                    Walgreens
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Coupons &amp; Weekly Deals
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-lg hidden sm:block">
                <input
                  type="text"
                  readOnly
                  value="Search all Walgreens paperless coupons..."
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 px-4 text-xs text-slate-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <Store className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Your Walgreens</div>
                    <div className="font-bold text-slate-800">
                      Main St &amp; 5th Ave
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500">
                      {isGuest ? 'Hi Guest' : 'Hi Mark ($14.50 Cash)'}
                    </div>
                    <div className="font-bold text-red-700 text-xs sm:text-sm">
                      {isGuest ? (
                        <span 
                          id="signInBtn"
                          data-element-name="Sign In"
                          className="cursor-pointer hover:underline inline-flex items-center gap-1"
                          onClick={() => setShowLoginModal(true)}
                          title="Click to view login requirement"
                        >
                          Sign In / Register
                        </span>
                      ) : (
                        <span className="cursor-pointer" onClick={() => setIsGuest(true)} title="Click to simulate signing out">
                          myWalgreens™ Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6 px-5 text-center bg-red-50/50 border-b border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">$482.50</div>
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mt-1">
                Available Paperless Coupons &amp; Offers
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['All Offers (186)', 'Beauty & Personal Care', 'Vitamins & Supplements', 'Household Essentials', 'Food & Beverage'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeFilter === filter
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ================= FAMILY DOLLAR HEADER ================= */
          <>
            <div className="border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-white bg-[#ed1c24] font-bold">
              <div className="flex items-center gap-4">
                <span className="font-bold text-white uppercase tracking-wider">Weekly Ads</span>
                <span className="font-bold text-white uppercase tracking-wider">Smart Coupons</span>
                <span className="font-bold text-white uppercase tracking-wider">Deals &amp; Rewards</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-800 text-white px-2.5 py-0.5 rounded text-[11px] font-bold">
                  Family Dollar Smart Coupons Hub
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#ed1c24] text-white flex items-center justify-center font-black text-sm shadow-sm tracking-tighter">
                  FD
                </div>
                <div>
                  <div className="font-black text-[#ed1c24] text-xl tracking-tight leading-none">
                    FAMILY DOLLAR
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Smart Coupons
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-lg hidden sm:block">
                <input
                  type="text"
                  readOnly
                  value="What can we help you find?"
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 px-4 text-xs text-slate-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <Store className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Store</div>
                    <div className="font-bold text-slate-800">
                      Family Dollar #4102
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-[10px] text-slate-500">
                      {isGuest ? 'Hi Guest' : 'Hi, Mark'}
                    </div>
                    <div className="font-bold text-[#ed1c24] text-xs sm:text-sm">
                      {isGuest ? (
                        <span 
                          className="cursor-pointer hover:underline inline-flex items-center gap-1"
                          onClick={() => setShowLoginModal(true)}
                          title="Click to view login requirement"
                        >
                          Sign In / Register
                        </span>
                      ) : (
                        <span className="cursor-pointer" onClick={() => setIsGuest(true)} title="Click to simulate signing out">
                          Smart Coupons Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-6 px-5 text-center bg-red-50/50 border-b border-slate-200">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">228 Coupons</div>
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-1">
                Start saving by browsing and clipping Smart Coupons below.
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['All Coupons - (228)', 'Expiring Soon', 'Storewide', 'Outdoor & Pest', 'Food & Beverage'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeFilter === filter
                        ? 'bg-[#ed1c24] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Scrollable Coupon Grid under Test */}
        <div className={isNestedWindow ? "p-4 bg-slate-100 border-t border-slate-200" : ""}>
          {isNestedWindow && (
            <div className="bg-indigo-950 text-indigo-200 border-2 border-indigo-500/60 rounded-t-xl px-4 py-2.5 flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
                <span className="font-bold text-white">
                  {selectedRetailer === 'publix' ? 'Publix Digital Coupons (publix.com/savings/digital-coupons)' : selectedRetailer === 'shoprite' ? 'ShopRite Digital Coupons Window' : selectedRetailer === 'walgreens' ? 'Walgreens Offers Page (walgreens.com/offers)' : selectedRetailer === 'cvs' ? 'CVS ExtraCare Deals' : selectedRetailer === 'kroger' ? 'Kroger Digital Coupons' : 'Family Dollar Smart Coupons Window (familydollar.com/smart-coupons)'}
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-400/30">
                  Target Scroll Container
                </span>
              </div>
              <div className="text-[11px] text-indigo-300 font-mono">[overflow-y: auto]</div>
            </div>
          )}

          <div
            ref={scrollContainerRef}
            id="coupons-scroll-container"
            style={{ overflowY: 'auto', maxHeight: '480px' }}
            className={`p-5 bg-white relative space-y-4 scroll-smooth ${
              isNestedWindow ? 'border-2 border-t-0 border-indigo-500/60 rounded-b-xl shadow-inner' : ''
            }`}
          >
            {/* Floating In-Page HUD Indicator if running */}
            {isRunning && (
              <div className="sticky top-2 z-30 flex justify-end">
                <div className="bg-white text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-300 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse"></div>
                  <div className="text-xs">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>CouponSweep</span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        {selectedRetailer === 'publix' ? '• Club Publix' : (selectedRetailer === 'shoprite' ? `• Store #${config.storeRsid || '218'}` : (selectedRetailer === 'walgreens' ? '• myWalgreens™' : (selectedRetailer === 'cvs' ? '• ExtraCare®' : (selectedRetailer === 'kroger' ? "• Shopper's Card" : '• Smart Coupons'))))}
                      </span>
                      <button
                        onClick={() => setActiveStrategy(prev => prev === 'instant' ? 'individual' : 'instant')}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        {activeStrategy === 'instant' ? '⚡ Instant' : '🎬 Step-by-Step'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {loadedCount === coupons.length 
                        ? '✅ Up to date — all coupons are loaded to your loyalty card.' 
                        : currentActionText}
                    </div>
                  </div>
                  <div className={`border-l border-slate-200 pl-3 text-center px-2.5 py-1 rounded-xl border ${
                    loadedCount === coupons.length 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    {loadedCount === coupons.length ? (
                      <>
                        <div className="text-sm font-black leading-tight">✓</div>
                        <div className="text-[9px] font-bold leading-tight uppercase">Up to Date</div>
                      </>
                    ) : (
                      <>
                        <div className="text-base font-black leading-tight">{loadedCount}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">clipped</div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleStop}
                    className="ml-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Celebratory Completion Banner */}
            {completionNotice && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCompletionNotice(null)} />
                <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-slate-900/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
                  <div className="bg-gradient-to-br from-slate-50 to-white px-6 pt-10 pb-6 text-center border-b border-slate-100 relative">
                    <button 
                      onClick={() => setCompletionNotice(null)}
                      className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-2 ${
                      (completionNotice.count === 0 || completionNotice.isAllLoaded) && !completionNotice.stopped 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-300' 
                        : 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-300'
                    }`}>
                      <Check className="w-8 h-8 text-white stroke-[3px]" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {completionNotice.stopped 
                        ? 'Session Paused' 
                        : ((completionNotice.count === 0 || completionNotice.isAllLoaded) ? 'Up to Date!' : 'All Set & Loaded!')}
                    </h3>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                      (completionNotice.count === 0 || completionNotice.isAllLoaded) && !completionNotice.stopped
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {(completionNotice.count === 0 || completionNotice.isAllLoaded) && !completionNotice.stopped 
                        ? `✓ ALL ${selectedRetailer === 'publix' ? 'CLUB PUBLIX' : (selectedRetailer === 'shoprite' ? 'PRICE PLUS®' : (selectedRetailer === 'cvs' ? 'EXTRACARE®' : (selectedRetailer === 'familydollar' ? 'SMART COUPONS' : 'MYWALGREENS™')))} COUPONS LOADED` 
                        : `${selectedRetailer === 'publix' ? 'CLUB PUBLIX' : (selectedRetailer === 'shoprite' ? 'PRICE PLUS®' : (selectedRetailer === 'cvs' ? 'EXTRACARE®' : (selectedRetailer === 'familydollar' ? 'SMART COUPONS' : 'MYWALGREENS™')))} SAVINGS ACTIVE`}
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    {completionNotice.count > 0 && !completionNotice.isAllLoaded && (
                      <div className="flex items-baseline justify-center gap-2 mb-3">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter italic">{completionNotice.count}</span>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Coupons</span>
                      </div>
                    )}
                    <p className="text-sm text-slate-600 font-medium leading-relaxed px-2">
                      {(completionNotice.count === 0 || completionNotice.isAllLoaded) && !completionNotice.stopped
                        ? `Up to date — all digital coupons are loaded to your ${selectedRetailer === 'publix' ? 'Club Publix' : (selectedRetailer === 'shoprite' ? 'ShopRite Price Plus®' : (selectedRetailer === 'cvs' ? 'CVS ExtraCare®' : (selectedRetailer === 'familydollar' ? 'Family Dollar' : (selectedRetailer === 'kroger' ? "Kroger Shopper's Card" : 'myWalgreens™'))))} card. No new offers to clip.`
                        : `Successfully loaded to your ${selectedRetailer === 'publix' ? 'Publix' : (selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'familydollar' ? 'Family Dollar' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))))} account. All discounts will automatically apply at checkout.`}
                    </p>
                    <button 
                      onClick={() => setCompletionNotice(null)}
                      className="w-full mt-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      ✓ Got it, Thanks!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Login Required Modal */}
            {showLoginModal && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setShowLoginModal(false)} />
                <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-slate-900/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col z-10">
                  <div className="bg-gradient-to-br from-blue-50 to-white px-6 pt-8 pb-5 text-center border-b border-blue-100 relative">
                    <button 
                      onClick={() => setShowLoginModal(false)}
                      className="absolute top-4 right-4 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-300">
                      <User className="w-7 h-7 text-white stroke-[2.5px]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {selectedRetailer === 'publix' ? 'Publix Sign In Required' : (selectedRetailer === 'shoprite' ? 'ShopRite Sign In Required' : (selectedRetailer === 'cvs' ? 'CVS Sign In Required' : (selectedRetailer === 'familydollar' ? 'Family Dollar Sign In Required' : (selectedRetailer === 'kroger' ? 'Kroger Sign In Required' : 'Walgreens Sign In Required'))))}
                    </h3>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedRetailer === 'publix' ? 'CLUB PUBLIX ACCOUNT' : (selectedRetailer === 'shoprite' ? 'PRICE PLUS® CLUB ACCOUNT' : (selectedRetailer === 'cvs' ? 'EXTRACARE® ACCOUNT' : (selectedRetailer === 'familydollar' ? 'SMART COUPONS ACCOUNT' : (selectedRetailer === 'kroger' ? "SHOPPER'S CARD ACCOUNT" : 'MYWALGREENS™ REWARDS ACCOUNT'))))}
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-base font-extrabold text-blue-700 leading-snug mb-2">
                      Please sign in to your {selectedRetailer === 'publix' ? 'Publix' : (selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'familydollar' ? 'Family Dollar' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))))} account to load coupons
                    </p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                      Digital coupons must be linked to your {selectedRetailer === 'publix' ? 'Club Publix' : (selectedRetailer === 'shoprite' ? 'Price Plus®' : (selectedRetailer === 'cvs' ? 'ExtraCare®' : (selectedRetailer === 'familydollar' ? 'Smart Coupons' : (selectedRetailer === 'kroger' ? "Shopper's Card" : 'myWalgreens™'))))} card so discounts automatically apply at checkout.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <button 
                        onClick={() => {
                          setIsGuest(false);
                          setShowLoginModal(false);
                          addLog(`✓ Signed in! ${selectedRetailer === 'publix' ? 'Club Publix' : (selectedRetailer === 'shoprite' ? 'Price Plus®' : (selectedRetailer === 'cvs' ? 'ExtraCare®' : (selectedRetailer === 'familydollar' ? 'Smart Coupons' : (selectedRetailer === 'kroger' ? "Shopper's Card" : 'myWalgreens™'))))} account active.`);
                          runLoaderScript();
                        }}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign In &amp; Start Loading</span>
                      </button>
                      <button 
                        onClick={() => setShowLoginModal(false)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(coupon => {
                const label = isGuest
                  ? (selectedRetailer === 'shoprite' ? 'Login to Load' : 'Sign in to clip')
                  : coupon.isClipped
                  ? 'Clipped ✓'
                  : coupon.buttonLabel;

                return (
                  <div
                    key={coupon.id}
                    id={`coupon-card-${coupon.id}`}
                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${
                      coupon.isClipped
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center gap-1 mb-2">
                        {coupon.isClipped ? (
                          <button
                            onClick={() => handleUnclipCoupon(coupon.id)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Click to unclip for testing"
                          >
                            <Undo2 className="w-2.5 h-2.5" />
                            <span>Unclip</span>
                          </button>
                        ) : (
                          <div />
                        )}
                        <div className="flex gap-1">
                          {coupon.badges?.map(badge => (
                            <span
                              key={badge}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                badge === 'New' || badge === 'Top Deal'
                                  ? 'bg-sky-100 text-sky-800'
                                  : badge.includes('Cash')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div
                          style={{ backgroundColor: coupon.imageColor }}
                          className="w-16 h-20 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner"
                        >
                          {coupon.brand.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="text-lg font-black text-slate-900 leading-tight">
                            {coupon.discount}
                          </div>
                          <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                            {coupon.title}
                          </p>
                          <div className="text-[11px] text-red-700 font-semibold mt-2">
                            {coupon.expiration}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    {selectedRetailer === 'walgreens' ? (
                      /* Exact Walgreens Card Button Row (Matching Real Walgreens Site) */
                      <>
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                        {isGuest ? (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-element-name={coupon.buttonLabel}
                            onClick={() => handleManualClip(coupon.id)}
                            className="w-full py-2.5 px-4 text-xs font-bold rounded-full bg-[#8b1e2e] hover:bg-[#731926] text-white transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer wag-btn-clip"
                          >
                            {coupon.buttonLabel}
                          </button>
                        ) : coupon.isClipped ? (
                          <>
                            <button
                              id={`btn-load-${coupon.id}`}
                              data-coupon-id={coupon.id}
                              data-title={`${coupon.brand} ${coupon.discount}`}
                              data-cs-processed="true"
                              data-element-name="Clipped"
                              onClick={() => handleUnclipCoupon(coupon.id)}
                              className="flex-1 py-2.5 px-4 text-xs font-bold rounded-full bg-emerald-700 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm group"
                              title="Click to unclip"
                            >
                              <span className="group-hover:hidden flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>{coupon.buttonLabel.includes('rebate') ? 'Rebate clipped ✓' : 'Clipped ✓'}</span>
                              </span>
                              <span className="hidden group-hover:flex items-center gap-1">
                                <Undo2 className="w-3.5 h-3.5" />
                                <span>Unclip</span>
                              </span>
                            </button>
                            {coupon.id !== 'wg1' && (
                              <button
                                onClick={() => alert(`Shopping eligible products for ${coupon.title}`)}
                                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-700 transition-colors cursor-pointer"
                              >
                                Shop
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              id={`btn-load-${coupon.id}`}
                              data-coupon-id={coupon.id}
                              data-title={`${coupon.brand} ${coupon.discount}`}
                              data-element-name={coupon.buttonLabel}
                              data-cs-processed={coupon.isClipped ? "true" : undefined}
                              onClick={() => handleManualClip(coupon.id)}
                              className={`py-2.5 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 text-white active:scale-95 cursor-pointer bg-[#8b1e2e] hover:bg-[#731926] wag-btn-clip ${
                                coupon.buttonLabel.includes('rebate') ? 'wag-btn-rebate' : ''
                              } ${coupon.id === 'wg1' ? 'w-full' : 'flex-1'}`}
                            >
                              {coupon.buttonLabel}
                            </button>
                            {coupon.id !== 'wg1' && (
                              <button
                                onClick={() => alert(`Shopping eligible products for ${coupon.title}`)}
                                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-700 transition-colors cursor-pointer"
                              >
                                Shop
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {/* Walgreens card details footer matching real site */}
                      <div className="mt-2 pt-1 flex flex-col gap-1">
                        <a
                          href="#details"
                          onClick={(e) => { e.preventDefault(); alert(`Offer details for: ${coupon.title}`); }}
                          className="text-[11px] text-[#005a9c] hover:underline font-medium inline-block"
                        >
                          View details
                        </a>
                        {coupon.id === 'wg1' && (
                          <p className="text-[10px] text-slate-500 leading-tight">
                            Earn $5 W Cash rewards when you spend $20 or more on eligible items.
                          </p>
                        )}
                      </div>
                      </>
                    ) : selectedRetailer === 'familydollar' ? (
                      /* Exact Family Dollar Smart Coupons Button Row (Full-width UNCLIP / ✂ CLIP COUPON) */
                      <div className="pt-3 mt-3 border-t border-slate-100">
                        {isGuest ? (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-element-name="CLIP COUPON"
                            onClick={() => handleManualClip(coupon.id)}
                            className="w-full py-2.5 px-3 text-xs font-bold rounded-sm border border-dashed border-slate-400 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer uppercase clip-coupon"
                          >
                            <span>✂</span>
                            <span>CLIP COUPON</span>
                          </button>
                        ) : coupon.isClipped ? (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-cs-processed="true"
                            data-element-name="UNCLIP"
                            onClick={() => handleUnclipCoupon(coupon.id)}
                            className="w-full py-2.5 px-3 text-xs font-bold rounded-sm bg-[#003874] hover:bg-[#002855] text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm uppercase tracking-wide unclip"
                            title="Click to unclip"
                          >
                            <span>UNCLIP</span>
                          </button>
                        ) : (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-element-name="CLIP COUPON"
                            data-cs-processed={coupon.isClipped ? "true" : undefined}
                            onClick={() => handleManualClip(coupon.id)}
                            className="w-full py-2.5 px-3 text-xs font-bold rounded-sm border border-dashed border-slate-400 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer uppercase clip-coupon"
                          >
                            <span>✂</span>
                            <span>CLIP COUPON</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Other Retailers (ShopRite, Publix, CVS, Kroger, Family Dollar) */
                      <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <button
                          className="py-2 px-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => alert(`Viewing eligible items for ${coupon.title}`)}
                        >
                          Eligible Items
                        </button>

                        {isGuest ? (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-cs-processed={coupon.isClipped ? "true" : undefined}
                            onClick={() => handleManualClip(coupon.id)}
                            className="py-2 px-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 bg-black text-white hover:bg-slate-800 active:scale-95 cursor-pointer"
                          >
                            {label}
                          </button>
                        ) : coupon.isClipped ? (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-cs-processed="true"
                            onClick={() => handleUnclipCoupon(coupon.id)}
                            className="group py-2 px-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 bg-emerald-600 hover:bg-amber-600 text-white active:scale-95 cursor-pointer shadow-sm"
                            title="Click to unclip"
                          >
                            <span className="group-hover:hidden flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Loaded ✓</span>
                            </span>
                            <span className="hidden group-hover:flex items-center gap-1">
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>Unclip</span>
                            </span>
                          </button>
                        ) : (
                          <button
                            id={`btn-load-${coupon.id}`}
                            data-coupon-id={coupon.id}
                            data-title={`${coupon.brand} ${coupon.discount}`}
                            data-cs-processed={coupon.isClipped ? "true" : undefined}
                            onClick={() => handleManualClip(coupon.id)}
                            data-qa={selectedRetailer === 'publix' ? 'clip-coupon' : undefined}
                            className={`py-2 px-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 text-white active:scale-95 cursor-pointer ${
                              selectedRetailer === 'publix' ? 'bg-[#007a3d] hover:bg-[#005a2d] p-coupon__clip' : selectedRetailer === 'shoprite' ? 'bg-black hover:bg-slate-800' : selectedRetailer === 'cvs' ? 'bg-[#cc0000] hover:bg-red-800' : selectedRetailer === 'kroger' ? 'bg-[#00539f] hover:bg-[#003b70]' : 'bg-[#ed1c24] hover:bg-red-700 clip-coupon'
                            }`}
                          >
                            {coupon.buttonLabel}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load More Section for Walgreens */}
            {selectedRetailer === 'walgreens' && walgreensHasMore && (
              <div className="py-4 text-center border-t border-slate-100">
                <button
                  id="btn-load-more-walgreens"
                  data-element-name="Load More"
                  onClick={handleLoadMoreWalgreens}
                  className="wag-load-more px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-full border border-slate-300 shadow-sm hover:border-slate-500 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-[#8b1e2e]" />
                  <span>Load More Offers (6 More Coupons Available)</span>
                </button>
              </div>
            )}

            <div className="text-center py-6 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1">
              <ArrowDown className="w-3.5 h-3.5" /> End of Digital Offers List
            </div>

            {/* Retailer Footer */}
            <footer className="mt-8 border-t border-slate-200 pt-8 pb-10 bg-slate-50 rounded-b-xl text-slate-700">
              <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                  <div>
                    <h4 className="text-lg font-extrabold tracking-tight">Don't miss our deals!</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Sign up to get weekly ads and exclusive digital coupons sent directly to your inbox.
                    </p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 flex-1 md:w-64"
                      readOnly
                      value="shopper@example.com"
                    />
                    <button className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer">
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
                <div>
                  <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                    About Us
                  </h5>
                  <ul className="space-y-2 text-slate-600 font-medium">
                    <li><span className="hover:text-slate-900 cursor-pointer">About {selectedRetailer === 'publix' ? 'Publix' : selectedRetailer === 'shoprite' ? 'ShopRite' : (selectedRetailer === 'cvs' ? 'CVS' : (selectedRetailer === 'kroger' ? 'Kroger' : 'Walgreens'))}</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Our Stories</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Careers</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Press Room</span></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                    Customer Care
                  </h5>
                  <ul className="space-y-2 text-slate-600 font-medium">
                    <li><span className="hover:text-slate-900 cursor-pointer">Help &amp; FAQs</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Online Orders</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Return Policy</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Contact Us</span></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                    Savings &amp; Loyalty
                  </h5>
                  <ul className="space-y-2 text-slate-600 font-medium">
                    <li><span className="hover:text-slate-900 cursor-pointer">Weekly Circular</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Digital Coupons</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">{selectedRetailer === 'publix' ? 'Club Publix' : selectedRetailer === 'shoprite' ? 'Price Plus® Club' : (selectedRetailer === 'cvs' ? 'ExtraCare®' : (selectedRetailer === 'kroger' ? "Shopper's Card" : 'myWalgreens™ Cash'))}</span></li>
                    <li><span className="hover:text-slate-900 cursor-pointer">Mobile Apps</span></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                    Mobile &amp; Apps
                  </h5>
                  <div className="space-y-2">
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors shadow-xs">
                      <span className="text-sm"></span>
                      <div>
                        <div className="text-[9px] text-slate-400 leading-none">apple store link</div>
                        <div className="text-[11px] font-bold leading-tight">App Store</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors shadow-xs">
                      <span className="text-xs">▶</span>
                      <div>
                        <div className="text-[9px] text-slate-400 leading-none">google store link</div>
                        <div className="text-[11px] font-bold leading-tight">Google Play</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-4xl mx-auto px-6 mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                  <span className="hover:text-slate-800 cursor-pointer">Policies</span>
                  <span className="hover:text-slate-800 cursor-pointer">Accessibility Statement</span>
                  <span className="hover:text-slate-800 cursor-pointer">Privacy Notice</span>
                  <span className="hover:text-slate-800 cursor-pointer">Terms &amp; Conditions</span>
                </div>
                <div className="text-slate-400 font-medium">
                  {selectedRetailer === 'publix' ? '© 2026 Publix Asset Management Company' : selectedRetailer === 'shoprite' ? '© 2026 Wakefern Food Corp.' : (selectedRetailer === 'cvs' ? '© 2026 CVS Health' : (selectedRetailer === 'kroger' ? '© 2026 The Kroger Co.' : '© 2026 Walgreen Co.'))}
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Live Execution Console */}
        <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 border-t border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Terminal className="w-3.5 h-3.5 text-slate-400" /> Real-Time Multi-Retailer Execution Log
            </span>
            <span className="text-[10px] text-slate-500">
              Active: {selectedRetailer === 'publix' ? 'publix.com/savings/digital-coupons' : selectedRetailer === 'shoprite' ? 'shoprite.com (Store #218)' : selectedRetailer === 'cvs' ? 'cvs.com/extracare' : selectedRetailer === 'kroger' ? 'kroger.com/cl/coupons' : selectedRetailer === 'familydollar' ? 'familydollar.com/smart-coupons' : 'walgreens.com/offers'}
            </span>
          </div>
          <div className="bg-black/50 p-2 rounded max-h-24 overflow-y-auto space-y-1 text-[11px]">
            {logs.map((log, idx) => (
              <div key={idx} className="truncate leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Selection Dialog Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                  CS
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Choose Clipping Mode</h3>
                  <p className="text-xs text-slate-500">
                    Loading digital offers for {selectedRetailer === 'shoprite' ? 'ShopRite (Price Plus®)' : 'Walgreens (myWalgreens™)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 mb-4">
              Select how CouponSweep should load offers on <strong className="text-slate-800">{selectedRetailer === 'shoprite' ? 'ShopRite' : 'Walgreens'}</strong>:
            </p>

            <div className="space-y-3">
              <button
                id="btn-modal-choose-instant"
                onClick={() => handleSelectModeAndStart('instant')}
                className="w-full text-left p-4 rounded-xl border border-slate-900 bg-slate-900 text-white transition-all cursor-pointer group shadow-sm hover:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span className="font-extrabold text-sm text-white">Instant Mode</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                    Fastest
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Loads all available coupons in rapid concurrent batches at once. Entire page is clipped in seconds without waiting.
                </p>
              </button>

              <button
                id="btn-modal-choose-individual"
                onClick={() => handleSelectModeAndStart('individual')}
                className="w-full text-left p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎬</span>
                    <span className="font-extrabold text-sm text-slate-900">Step-by-Step Mode</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    Visual
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Smoothly scrolls to each coupon, highlights clearly, and clips one-by-one so you can inspect every deal.
                </p>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>You can stop or pause at any time</span>
              <button
                onClick={() => setShowModeModal(false)}
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
