export type Category = "burgers" | "bbq" | "sides" | "sweets";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  tags?: string[];
  calories?: number;
  spice?: 0 | 1 | 2 | 3;
  smokeHours?: number;
  ingredients?: string[];
}

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const categories: { id: Category; label: string }[] = [
  { id: "burgers", label: "Burgers" },
  { id: "bbq", label: "Smoked BBQ" },
  { id: "sides", label: "Sides" },
  { id: "sweets", label: "Shakes & Sweets" },
];

export const menu: MenuItem[] = [
  // Burgers
  {
    id: "the-1986",
    name: "The 1986",
    description: "Double dry-aged smash patty, aged cheddar, smoked onion jam, house pickles, brioche.",
    price: 16.5,
    category: "burgers",
    image: u("photo-1568901346375-23c9450c58cd"),
    tags: ["Signature", "Bestseller"],
    calories: 980,
    spice: 0,
    ingredients: ["Dry-aged beef", "Aged cheddar", "Onion jam", "Brioche"],
  },
  {
    id: "brisket-stack",
    name: "Brisket Stack",
    description: "Beef patty crowned with 14-hour brisket, bourbon BBQ glaze and crispy shallots.",
    price: 19,
    category: "burgers",
    image: u("photo-1553979459-d2229ba7433b"),
    tags: ["Smoked"],
    calories: 1150,
    spice: 1,
    smokeHours: 14,
    ingredients: ["Beef patty", "Brisket", "Bourbon glaze", "Shallots"],
  },
  {
    id: "ember-heat",
    name: "Ember Heat",
    description: "Charred jalapeño, ghost-pepper jack, chipotle mayo and fire-roasted tomato.",
    price: 17,
    category: "burgers",
    image: u("photo-1571091718767-18b5b1457add"),
    tags: ["Hot"],
    calories: 940,
    spice: 3,
    ingredients: ["Beef patty", "Ghost-pepper jack", "Jalapeño", "Chipotle mayo"],
  },
  {
    id: "garden-smoke",
    name: "Garden Smoke",
    description: "Smoked portobello and black-bean patty, avocado, charred corn salsa, vegan aioli.",
    price: 15,
    category: "burgers",
    image: u("photo-1550547660-d9450f859349"),
    tags: ["Vegetarian"],
    calories: 720,
    spice: 1,
    ingredients: ["Portobello", "Black bean", "Avocado", "Corn salsa"],
  },
  // BBQ
  {
    id: "prime-brisket",
    name: "Prime Brisket Plate",
    description: "Half-pound oak-smoked brisket, pickled red onion, white bread, two sides.",
    price: 28,
    category: "bbq",
    image: u("photo-1544025162-d76694265947"),
    tags: ["Signature"],
    calories: 1300,
    spice: 0,
    smokeHours: 14,
    ingredients: ["Prime brisket", "Oak smoke", "Pickled onion"],
  },
  {
    id: "st-louis-ribs",
    name: "St. Louis Ribs",
    description: "Full rack, cherry-wood smoked, lacquered in molasses-coffee sauce.",
    price: 32,
    category: "bbq",
    image: u("photo-1529193591184-b1d58069ecdd"),
    tags: ["For two"],
    calories: 1600,
    spice: 1,
    smokeHours: 6,
    ingredients: ["Pork ribs", "Cherry wood", "Coffee molasses"],
  },
  {
    id: "smoked-wings",
    name: "Hickory Wings",
    description: "Twelve smoked-then-fried wings with honey-habanero or Alabama white sauce.",
    price: 18,
    category: "bbq",
    image: u("photo-1527477396000-e27163b481c2"),
    tags: ["Shareable"],
    calories: 1050,
    spice: 2,
    smokeHours: 3,
    ingredients: ["Chicken wings", "Hickory", "Honey-habanero"],
  },
  {
    id: "tomahawk",
    name: "Reverse-Seared Tomahawk",
    description: "32oz bone-in ribeye, slow-smoked then flame-seared, garlic-herb butter.",
    price: 74,
    category: "bbq",
    image: u("photo-1600891964092-4316c288032e"),
    tags: ["Chef's pick"],
    calories: 2100,
    spice: 0,
    smokeHours: 2,
    ingredients: ["Ribeye", "Herb butter", "Sea salt"],
  },
  // Sides
  {
    id: "tallow-fries",
    name: "Beef-Tallow Fries",
    description: "Hand-cut, triple-cooked, rosemary salt, smoked aioli.",
    ingredients: ["Russet potato", "Beef tallow", "Rosemary salt", "Smoked aioli"],
    price: 6.5,
    category: "sides",
    image: u("photo-1573080496219-bb080dd4f877"),
    calories: 520,
    spice: 0,
  },
  {
    id: "mac",
    name: "Smoked Mac & Cheese",
    description: "Three-cheese, brisket burnt ends, toasted crumb.",
    ingredients: ["Cheddar", "Gruyère", "Burnt ends", "Toasted crumb"],
    price: 8.5,
    category: "sides",
    image: u("photo-1543339494-b4cd4f7ba686"),
    calories: 690,
    spice: 0,
  },
  {
    id: "onion-rings",
    name: "Beer-Battered Onion Rings",
    description: "Sweet onions, lager batter, chipotle ranch.",
    ingredients: ["Sweet onion", "Lager batter", "Chipotle ranch"],
    price: 7,
    category: "sides",
    image: u("photo-1639024471283-03518883512d"),
    calories: 480,
    spice: 1,
  },
  {
    id: "slaw",
    name: "Charred Corn & Slaw",
    description: "Fire-kissed street corn with lime crema, crunchy vinegar slaw.",
    ingredients: ["Charred corn", "Lime crema", "Vinegar slaw"],
    price: 6,
    category: "sides",
    image: u("photo-1551754655-cd27e38d2076"),
    calories: 310,
    spice: 1,
  },
  // Sweets
  {
    id: "bourbon-shake",
    name: "Burnt Caramel Shake",
    description: "Vanilla bean custard, burnt caramel, smoked sea salt.",
    ingredients: ["Vanilla custard", "Burnt caramel", "Smoked salt"],
    price: 8,
    category: "sweets",
    image: u("photo-1572490122747-3968b75cc699"),
    calories: 760,
    spice: 0,
  },
  {
    id: "skillet-cookie",
    name: "Skillet Cookie",
    description: "Brown-butter chocolate chip cookie, warm from the cast iron, vanilla ice cream.",
    ingredients: ["Brown butter", "Dark chocolate", "Vanilla ice cream"],
    price: 9,
    category: "sweets",
    image: u("photo-1551024601-bebbd4e2c6d1"),
    calories: 880,
    spice: 0,
  },
  {
    id: "lemonade",
    name: "Smoked Peach Lemonade",
    description: "Grilled peaches, fresh lemon, thyme syrup.",
    ingredients: ["Grilled peach", "Lemon", "Thyme syrup"],
    price: 5,
    category: "sweets",
    image: u("photo-1621263764928-df1444c5e859"),
    calories: 180,
    spice: 0,
  },
  {
    id: "cheesecake",
    name: "Ember Cheesecake",
    description: "Basque-style burnt cheesecake, bourbon cherries.",
    ingredients: ["Cream cheese", "Bourbon cherries", "Caramelised top"],
    price: 9.5,
    category: "sweets",
    image: u("photo-1533134242443-d4fd215305ad"),
    calories: 640,
    spice: 0,
  },
];

export const signatureIds = ["the-1986", "prime-brisket", "st-louis-ribs", "ember-heat"];

export const getItem = (id: string) => menu.find((m) => m.id === id);

export const images = {
  interior: u("photo-1414235077428-338989a2e8c0", 1400),
  pitmaster: u("photo-1555939594-58d7cb561ad1", 1200),
  grill: u("photo-1558030006-450675393462", 1200),
  offerBurger: u("photo-1594212699903-ec8a3eca50f5", 1200),
};
