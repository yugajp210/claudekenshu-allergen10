import { inferAllergens } from "./ingredients";

export type MenuCategory = "main" | "side" | "soup" | "rice" | "dessert" | "drink";

export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  rice: "ご飯・麺",
  dessert: "デザート",
  drink: "ドリンク",
};

/** レシピ1行: 原材料 + 分量 + 単位 */
export type RecipeItem = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

export type Menu = {
  id: string;
  code: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  /** 後方互換: 原材料 ID のみのリスト。レシピがある場合は recipe から導出可能。 */
  ingredients: string[];
  /** 分量つきレシピ (オプショナル: 段階移行のため) */
  recipe?: RecipeItem[];
  declaredAllergens: string[];
  status: "published" | "draft" | "review";
  updatedAt: string;
  updatedBy: string;
  image?: string;
  /** 提供量 (人前) */
  servings?: number;
};

export function getIngredientIds(menu: Menu): string[] {
  if (menu.recipe && menu.recipe.length > 0) {
    return menu.recipe.map((r) => r.ingredientId);
  }
  return menu.ingredients;
}

const today = "2026-05-18";
const yesterday = "2026-05-17";

// メニュー画像は AI 生成済みのファイルを /public/menus/{id}.jpg として配信。
// 未生成のものは MenuImage が onError で取り扱い、グラデーション placeholder を表示する。
const LOCAL = (id: string) => `/menus/${id}.jpg`;
// 未使用だが Unsplash パターンを残す（必要時の差し替え用）
const _UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
void _UNSPLASH;

export const INITIAL_MENUS: Menu[] = [
  {
    id: "m-001",
    code: "M-1001",
    name: "和風ハンバーグ定食",
    category: "main",
    description: "国産合いびき肉に玉ねぎを練り込み、和風おろしソースで仕上げました。",
    price: 980,
    ingredients: ["ground-meat", "onion", "egg", "bread-crumb", "soy-sauce", "rice"],
    declaredAllergens: ["egg", "wheat", "beef", "pork", "soybean"],
    status: "published",
    updatedAt: today,
    updatedBy: "山田 太郎",
    image: LOCAL("m-001"),
  },
  {
    id: "m-002",
    code: "M-1002",
    name: "エビフライ盛り合わせ",
    category: "main",
    description: "ぷりっと食感の有頭海老を使ったサクサクのエビフライです。",
    price: 1280,
    ingredients: ["shrimp", "egg", "flour", "bread-crumb", "mayonnaise"],
    declaredAllergens: ["shrimp", "egg", "wheat", "soybean"],
    status: "published",
    updatedAt: today,
    updatedBy: "山田 太郎",
    image: LOCAL("m-002"),
  },
  {
    id: "m-003",
    code: "M-1003",
    name: "牛乳パンケーキ",
    category: "dessert",
    description: "牛乳と新鮮な卵を贅沢に使ったふわふわパンケーキ。",
    price: 780,
    ingredients: ["flour", "milk-raw", "egg", "butter", "sugar"],
    declaredAllergens: ["wheat", "milk", "egg"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-003"),
  },
  {
    id: "m-004",
    code: "M-1004",
    name: "ざるそば",
    category: "rice",
    description: "国産そば粉100%の本格そば。",
    price: 820,
    ingredients: ["soba-noodle", "soy-sauce", "dashi"],
    declaredAllergens: ["buckwheat", "wheat", "soybean"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-004"),
  },
  {
    id: "m-005",
    code: "M-1005",
    name: "カニクリームコロッケ",
    category: "main",
    description: "北海道産のかに身をふんだんに使った濃厚クリームコロッケ。",
    price: 1180,
    ingredients: ["crab", "milk-raw", "butter", "flour", "egg", "bread-crumb", "onion"],
    declaredAllergens: ["crab", "milk", "wheat", "egg"],
    status: "review",
    updatedAt: today,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-005"),
  },
  {
    id: "m-006",
    code: "M-1006",
    name: "焼き鮭定食",
    category: "main",
    description: "脂ののった銀鮭を香ばしく焼き上げました。",
    price: 880,
    ingredients: ["salmon", "rice", "miso", "soy-sauce"],
    declaredAllergens: ["salmon", "soybean", "wheat"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "山田 太郎",
    image: LOCAL("m-006"),
  },
  {
    id: "m-007",
    code: "M-1007",
    name: "鶏のから揚げ",
    category: "main",
    description: "ジューシーな国産鶏もも肉を使用したから揚げ。",
    price: 880,
    ingredients: ["chicken", "soy-sauce", "egg", "flour"],
    declaredAllergens: ["chicken", "soybean", "wheat", "egg"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "山田 太郎",
    image: LOCAL("m-007"),
  },
  {
    id: "m-008",
    code: "M-1008",
    name: "豚の生姜焼き",
    category: "main",
    description: "国産豚ロースをすりおろし生姜と醤油ダレで。",
    price: 980,
    ingredients: ["pork", "soy-sauce", "onion", "rice"],
    declaredAllergens: ["pork", "soybean", "wheat"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "佐藤 一郎",
    image: LOCAL("m-008"),
  },
  {
    id: "m-009",
    code: "M-1009",
    name: "野菜のごま和え",
    category: "side",
    description: "旬の青菜を香り高い炒りごまで和えました。",
    price: 380,
    ingredients: ["sesame", "soy-sauce"],
    declaredAllergens: ["sesame", "soybean", "wheat"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-009"),
  },
  {
    id: "m-010",
    code: "M-1010",
    name: "リンゴのタルト",
    category: "dessert",
    description: "信州産りんごをたっぷり使ったタルト。",
    price: 680,
    ingredients: ["flour", "butter", "egg", "sugar", "apple", "almond"],
    declaredAllergens: ["wheat", "milk", "egg", "apple", "almond"],
    status: "published",
    updatedAt: today,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-010"),
  },
  {
    id: "m-011",
    code: "M-1011",
    name: "オレンジ&バナナスムージー",
    category: "drink",
    description: "フレッシュなオレンジとバナナのスムージー。",
    price: 580,
    ingredients: ["orange", "banana", "yogurt", "sugar"],
    declaredAllergens: ["orange", "banana", "milk"],
    status: "published",
    updatedAt: today,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-011"),
  },
  {
    id: "m-012",
    code: "M-1012",
    name: "クルミとカシューのナッツサラダ",
    category: "side",
    description: "ローストしたくるみとカシューナッツを散らした彩りサラダ。",
    price: 580,
    ingredients: ["walnut", "cashew", "olive-oil", "vinegar"],
    declaredAllergens: ["walnut", "cashew"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "佐藤 一郎",
    image: LOCAL("m-012"),
  },
  {
    id: "m-013",
    code: "M-1013",
    name: "ピーナッツバタートースト",
    category: "rice",
    description: "自家製ピーナッツバターを使ったトースト。",
    price: 480,
    ingredients: ["flour", "peanut", "butter", "sugar"],
    declaredAllergens: ["wheat", "peanut", "milk"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "佐藤 一郎",
    image: LOCAL("m-013"),
  },
  {
    id: "m-014",
    code: "M-1014",
    name: "マグロのカルパッチョ",
    category: "side",
    description: "鮮度抜群のマグロを使った前菜。",
    price: 980,
    ingredients: ["tuna", "olive-oil", "salt", "pepper"],
    declaredAllergens: [],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "山田 太郎",
    image: LOCAL("m-014"),
  },
  {
    id: "m-015",
    code: "M-1015",
    name: "豚骨ラーメン",
    category: "rice",
    description: "九州風の濃厚豚骨スープと中華麺。",
    price: 980,
    ingredients: ["ramen-noodle", "pork", "soy-sauce", "sesame-oil"],
    declaredAllergens: ["wheat", "egg", "pork", "soybean", "sesame"],
    status: "published",
    updatedAt: today,
    updatedBy: "佐藤 一郎",
    image: LOCAL("m-015"),
  },
  {
    id: "m-016",
    code: "M-1016",
    name: "山芋とろろご飯",
    category: "rice",
    description: "新鮮な山芋を擦りおろし、温かいご飯にかけて。",
    price: 580,
    ingredients: ["yam", "rice", "soy-sauce", "egg"],
    declaredAllergens: ["yam", "soybean", "wheat"],
    status: "draft",
    updatedAt: today,
    updatedBy: "山田 太郎",
    image: LOCAL("m-016"),
  },
  {
    id: "m-017",
    code: "M-1017",
    name: "本日のお味噌汁",
    category: "soup",
    description: "出汁の旨味を活かしたお味噌汁。",
    price: 180,
    ingredients: ["miso", "tofu", "dashi"],
    declaredAllergens: ["soybean", "mackerel"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-017"),
  },
  {
    id: "m-018",
    code: "M-1018",
    name: "コンソメスープ",
    category: "soup",
    description: "野菜の旨味が溶け込んだコンソメスープ。",
    price: 280,
    ingredients: ["consomme", "onion", "carrot"],
    declaredAllergens: ["wheat", "milk", "soybean", "chicken", "beef"],
    status: "published",
    updatedAt: yesterday,
    updatedBy: "鈴木 花子",
    image: LOCAL("m-018"),
  },
];

export function makeInferredMenu(input: Omit<Menu, "declaredAllergens">): Menu {
  return { ...input, declaredAllergens: inferAllergens(input.ingredients) };
}

// ============================================================================
// レシピ（分量つき）- 1人前
// ============================================================================
const RECIPES: Record<string, { servings: number; items: RecipeItem[] }> = {
  "m-001": { servings: 1, items: [
    { ingredientId: "ground-meat", quantity: 150, unit: "g" },
    { ingredientId: "onion", quantity: 30, unit: "g" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
    { ingredientId: "bread-crumb", quantity: 20, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 15, unit: "ml" },
    { ingredientId: "rice", quantity: 180, unit: "g" },
  ]},
  "m-002": { servings: 1, items: [
    { ingredientId: "shrimp", quantity: 150, unit: "g" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
    { ingredientId: "flour", quantity: 30, unit: "g" },
    { ingredientId: "bread-crumb", quantity: 40, unit: "g" },
    { ingredientId: "mayonnaise", quantity: 20, unit: "g" },
  ]},
  "m-003": { servings: 1, items: [
    { ingredientId: "flour", quantity: 100, unit: "g" },
    { ingredientId: "milk-raw", quantity: 150, unit: "ml" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
    { ingredientId: "butter", quantity: 20, unit: "g" },
    { ingredientId: "sugar", quantity: 25, unit: "g" },
  ]},
  "m-004": { servings: 1, items: [
    { ingredientId: "soba-noodle", quantity: 200, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 30, unit: "ml" },
    { ingredientId: "dashi", quantity: 200, unit: "ml" },
  ]},
  "m-005": { servings: 1, items: [
    { ingredientId: "crab", quantity: 80, unit: "g" },
    { ingredientId: "milk-raw", quantity: 120, unit: "ml" },
    { ingredientId: "butter", quantity: 20, unit: "g" },
    { ingredientId: "flour", quantity: 30, unit: "g" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
    { ingredientId: "bread-crumb", quantity: 40, unit: "g" },
    { ingredientId: "onion", quantity: 20, unit: "g" },
  ]},
  "m-006": { servings: 1, items: [
    { ingredientId: "salmon", quantity: 120, unit: "g" },
    { ingredientId: "rice", quantity: 180, unit: "g" },
    { ingredientId: "miso", quantity: 20, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 5, unit: "ml" },
  ]},
  "m-007": { servings: 1, items: [
    { ingredientId: "chicken", quantity: 200, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 15, unit: "ml" },
    { ingredientId: "egg", quantity: 0.5, unit: "個" },
    { ingredientId: "flour", quantity: 30, unit: "g" },
  ]},
  "m-008": { servings: 1, items: [
    { ingredientId: "pork", quantity: 150, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 20, unit: "ml" },
    { ingredientId: "onion", quantity: 30, unit: "g" },
    { ingredientId: "rice", quantity: 180, unit: "g" },
  ]},
  "m-009": { servings: 1, items: [
    { ingredientId: "sesame", quantity: 10, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 10, unit: "ml" },
  ]},
  "m-010": { servings: 1, items: [
    { ingredientId: "flour", quantity: 50, unit: "g" },
    { ingredientId: "butter", quantity: 30, unit: "g" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
    { ingredientId: "sugar", quantity: 20, unit: "g" },
    { ingredientId: "apple", quantity: 100, unit: "g" },
    { ingredientId: "almond", quantity: 20, unit: "g" },
  ]},
  "m-011": { servings: 1, items: [
    { ingredientId: "orange", quantity: 100, unit: "g" },
    { ingredientId: "banana", quantity: 80, unit: "g" },
    { ingredientId: "yogurt", quantity: 100, unit: "g" },
    { ingredientId: "sugar", quantity: 5, unit: "g" },
  ]},
  "m-012": { servings: 1, items: [
    { ingredientId: "walnut", quantity: 20, unit: "g" },
    { ingredientId: "cashew", quantity: 20, unit: "g" },
    { ingredientId: "olive-oil", quantity: 10, unit: "ml" },
    { ingredientId: "vinegar", quantity: 5, unit: "ml" },
  ]},
  "m-013": { servings: 1, items: [
    { ingredientId: "flour", quantity: 60, unit: "g" },
    { ingredientId: "peanut", quantity: 30, unit: "g" },
    { ingredientId: "butter", quantity: 10, unit: "g" },
    { ingredientId: "sugar", quantity: 5, unit: "g" },
  ]},
  "m-014": { servings: 1, items: [
    { ingredientId: "tuna", quantity: 100, unit: "g" },
    { ingredientId: "olive-oil", quantity: 10, unit: "ml" },
    { ingredientId: "salt", quantity: 1, unit: "g" },
    { ingredientId: "pepper", quantity: 0.5, unit: "g" },
  ]},
  "m-015": { servings: 1, items: [
    { ingredientId: "ramen-noodle", quantity: 130, unit: "g" },
    { ingredientId: "pork", quantity: 80, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 20, unit: "ml" },
    { ingredientId: "sesame-oil", quantity: 5, unit: "ml" },
  ]},
  "m-016": { servings: 1, items: [
    { ingredientId: "yam", quantity: 100, unit: "g" },
    { ingredientId: "rice", quantity: 200, unit: "g" },
    { ingredientId: "soy-sauce", quantity: 10, unit: "ml" },
    { ingredientId: "egg", quantity: 1, unit: "個" },
  ]},
  "m-017": { servings: 1, items: [
    { ingredientId: "miso", quantity: 15, unit: "g" },
    { ingredientId: "tofu", quantity: 30, unit: "g" },
    { ingredientId: "dashi", quantity: 200, unit: "ml" },
  ]},
  "m-018": { servings: 1, items: [
    { ingredientId: "consomme", quantity: 5, unit: "g" },
    { ingredientId: "onion", quantity: 20, unit: "g" },
    { ingredientId: "carrot", quantity: 15, unit: "g" },
  ]},
};

// 各メニューに recipe と servings を注入
for (const m of INITIAL_MENUS) {
  const r = RECIPES[m.id];
  if (r) {
    m.recipe = r.items;
    m.servings = r.servings;
  }
}
