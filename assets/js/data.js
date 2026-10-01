/* Product catalog — ISHTAR GATE PRO EQUIPMENT */
window.ISHTAR = window.ISHTAR || {};

ISHTAR.products = [
  {
    id: "ig-barbell-20",
    name: "Ishtar Olympic Barbell 20kg",
    category: "strength",
    price: 289,
    compareAt: 329,
    image: "assets/images/product-barbell.svg",
    badge: "Best Seller",
    stock: 18,
    featured: true,
    short: "Competition-grade 20kg barbell with ceramic-blue sleeves and gold end caps.",
    description:
      "Built for serious lifts. Hardened chrome shaft, dual knurl marks, and a 1500 lb load rating. The sleeved finish echoes the lapis glaze of the Ishtar Gate—durable, distinctive, and ready for daily training.",
    specs: {
      Weight: "20 kg",
      Length: "2200 mm",
      "Shaft diameter": "28 mm",
      "Load rating": "1500 lb",
      Knurl: "Medium, dual mark",
    },
  },
  {
    id: "ig-kettle-24",
    name: "Gate Guard Kettlebell 24kg",
    category: "strength",
    price: 94,
    image: "assets/images/product-kettlebell.svg",
    badge: "New",
    stock: 32,
    featured: true,
    short: "Cast iron kettlebell with wide handle and balanced base for swings and presses.",
    description:
      "Single-piece cast iron with a wide, chalk-friendly handle. Flat base for stability on the floor and during renegade variations. Weight stamped in gold for quick rack identification.",
    specs: {
      Weight: "24 kg",
      Material: "Cast iron",
      Handle: "Wide, 35 mm",
      Finish: "Powder coat",
    },
  },
  {
    id: "ig-rack-pro",
    name: "Babylon Power Rack Pro",
    category: "strength",
    price: 899,
    compareAt: 999,
    image: "assets/images/product-rack.svg",
    badge: "Pro",
    stock: 7,
    featured: true,
    short: "Full-height power rack with pull-up bar, safety pins, and J-cups.",
    description:
      "11-gauge steel uprights, laser-cut numbering, and a multi-grip pull-up bar. Includes pair of J-cups and safety pins. Anchor holes for bolted installation in commercial or home gyms.",
    specs: {
      Height: "230 cm",
      Width: "120 cm",
      Depth: "140 cm",
      Steel: "11-gauge",
      "Weight capacity": "1000 lb",
    },
  },
  {
    id: "ig-bench-adj",
    name: "Lion Bench Adjustable",
    category: "strength",
    price: 349,
    image: "assets/images/product-bench.svg",
    stock: 14,
    featured: true,
    short: "FID bench with dense padding and a wide stable base.",
    description:
      "Seven back-pad angles from decline to military press. Dense foam that holds shape under heavy loads, dual-stitched upholstery, and a wide A-frame for zero wobble.",
    specs: {
      Positions: "7 back / 3 seat",
      Padding: "High-density foam",
      "Max user": "350 lb",
      Frame: "Commercial steel",
    },
  },
  {
    id: "ig-db-set",
    name: "Twin Bull Dumbbell Set",
    category: "strength",
    price: 219,
    image: "assets/images/product-dumbbell.svg",
    stock: 22,
    featured: false,
    short: "Paired hex dumbbells with rubberized heads and steel handles.",
    description:
      "Sold as a matched pair. Hex heads prevent rolling; contoured steel handles with medium knurl. Ideal for floor presses, rows, and accessory work.",
    specs: {
      Set: "Pair",
      Heads: "Rubber hex",
      Handle: "Steel knurl",
      Options: "10–30 kg pair",
    },
  },
  {
    id: "ig-rower-air",
    name: "Euphrates Air Rower",
    category: "cardio",
    price: 799,
    image: "assets/images/product-rower.svg",
    badge: "Featured",
    stock: 9,
    featured: true,
    short: "Air-resistance rower with smooth rail and lapis flywheel housing.",
    description:
      "Infinite air resistance scales with your effort. Aluminum monorail, ergonomic handle, and a quiet flywheel enclosure finished in gate blue. Monitor tracks time, distance, strokes, and estimated watts.",
    specs: {
      Resistance: "Air",
      Rail: "Aluminum",
      Monitor: "LCD multi-metric",
      "User max": "150 kg",
    },
  },
  {
    id: "ig-mat-pro",
    name: "Processional Training Mat",
    category: "accessories",
    price: 68,
    image: "assets/images/product-mat.svg",
    stock: 45,
    featured: false,
    short: "8mm closed-cell mat with subtle Ishtar brick pattern.",
    description:
      "Closed-cell foam rejects sweat and cleans easily. 8mm thickness for joint-friendly floor work without feeling spongy under standing drills. Non-slip underside.",
    specs: {
      Thickness: "8 mm",
      Size: "183 × 61 cm",
      Material: "Closed-cell foam",
      Care: "Wipe clean",
    },
  },
  {
    id: "ig-plates-20",
    name: "Glazed Brick Bumper 20kg",
    category: "strength",
    price: 129,
    image: "assets/images/product-plates.svg",
    stock: 28,
    featured: true,
    short: "Virgin rubber bumper plate with steel insert and color-coded rim.",
    description:
      "Drop-rated virgin rubber with a precision steel insert. Low bounce for controlled Olympic lifts. Rim stripe in gold for fast 20kg identification on crowded platforms.",
    specs: {
      Weight: "20 kg",
      Diameter: "450 mm",
      Insert: "Stainless steel",
      "Drop rated": "Yes",
    },
  },
];

ISHTAR.categories = [
  {
    id: "strength",
    name: "Strength",
    blurb: "Barbells, racks, bells, and iron for serious loading.",
    image: "assets/images/category-strength.svg",
  },
  {
    id: "cardio",
    name: "Cardio",
    blurb: "Rowers and conditioning tools built to last.",
    image: "assets/images/category-cardio.svg",
  },
  {
    id: "accessories",
    name: "Accessories",
    blurb: "Mats, recovery, and training essentials.",
    image: "assets/images/category-accessories.svg",
  },
];

ISHTAR.getProduct = function (id) {
  return ISHTAR.products.find(function (p) {
    return p.id === id;
  });
};

ISHTAR.formatMoney = function (amount, currency) {
  var cur = currency || ISHTAR.settings.get().currency || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return "$" + Number(amount).toFixed(0);
  }
};
