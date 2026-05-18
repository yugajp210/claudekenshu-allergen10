export type Ingredient = {
  id: string;
  name: string;
  category: string;
  allergens: string[];
  /** 標準単位 (g, ml, 個 など) */
  unit?: string;
  /** 主要仕入先 ID (suppliers.ts) */
  primarySupplierId?: string;
  /** 標準的な保存可能日数 */
  shelfLifeDays?: number;
  /** ノート/コメント (調達上の注意・代替品など) */
  notes?: string;
};

export const INGREDIENTS: Ingredient[] = [
  // 穀類・粉類
  { id: "flour",           name: "小麦粉",         category: "穀類",   allergens: ["wheat"] },
  { id: "bread-crumb",     name: "パン粉",         category: "穀類",   allergens: ["wheat"] },
  { id: "pasta",           name: "パスタ",         category: "穀類",   allergens: ["wheat"] },
  { id: "ramen-noodle",    name: "中華麺",         category: "穀類",   allergens: ["wheat", "egg"] },
  { id: "udon",            name: "うどん",         category: "穀類",   allergens: ["wheat"] },
  { id: "soba-noodle",     name: "そば",           category: "穀類",   allergens: ["buckwheat", "wheat"] },
  { id: "rice",            name: "米",             category: "穀類",   allergens: [] },
  { id: "panko-cheese",    name: "チーズパン粉",   category: "穀類",   allergens: ["wheat", "milk"] },

  // 乳製品
  { id: "milk-raw",        name: "牛乳",           category: "乳製品", allergens: ["milk"] },
  { id: "butter",          name: "バター",         category: "乳製品", allergens: ["milk"] },
  { id: "cheese",          name: "チーズ",         category: "乳製品", allergens: ["milk"] },
  { id: "cream",           name: "生クリーム",     category: "乳製品", allergens: ["milk"] },
  { id: "yogurt",          name: "ヨーグルト",     category: "乳製品", allergens: ["milk"] },
  { id: "condensed-milk",  name: "練乳",           category: "乳製品", allergens: ["milk"] },

  // 卵
  { id: "egg",             name: "鶏卵",           category: "卵",     allergens: ["egg"] },
  { id: "egg-yolk",        name: "卵黄",           category: "卵",     allergens: ["egg"] },
  { id: "mayonnaise",      name: "マヨネーズ",     category: "卵",     allergens: ["egg", "soybean"] },

  // 肉類
  { id: "beef",            name: "牛肉",           category: "肉類",   allergens: ["beef"] },
  { id: "pork",            name: "豚肉",           category: "肉類",   allergens: ["pork"] },
  { id: "chicken",         name: "鶏肉",           category: "肉類",   allergens: ["chicken"] },
  { id: "bacon",           name: "ベーコン",       category: "肉類",   allergens: ["pork"] },
  { id: "ham",             name: "ハム",           category: "肉類",   allergens: ["pork"] },
  { id: "sausage",         name: "ソーセージ",     category: "肉類",   allergens: ["pork"] },
  { id: "ground-meat",     name: "合いびき肉",     category: "肉類",   allergens: ["beef", "pork"] },

  // 魚介類
  { id: "shrimp",          name: "えび",           category: "魚介類", allergens: ["shrimp"] },
  { id: "crab",            name: "かに",           category: "魚介類", allergens: ["crab"] },
  { id: "squid",           name: "イカ",           category: "魚介類", allergens: ["squid"] },
  { id: "salmon",          name: "鮭",             category: "魚介類", allergens: ["salmon"] },
  { id: "mackerel",        name: "サバ",           category: "魚介類", allergens: ["mackerel"] },
  { id: "tuna",            name: "マグロ",         category: "魚介類", allergens: [] },
  { id: "salmon-roe",      name: "いくら",         category: "魚介類", allergens: ["salmon-roe", "salmon"] },
  { id: "abalone",         name: "あわび",         category: "魚介類", allergens: ["abalone"] },
  { id: "tuna-flakes",     name: "ツナ缶",         category: "魚介類", allergens: ["soybean"] },

  // 野菜・果物
  { id: "onion",           name: "玉ねぎ",         category: "野菜",   allergens: [] },
  { id: "carrot",          name: "にんじん",       category: "野菜",   allergens: [] },
  { id: "tomato",          name: "トマト",         category: "野菜",   allergens: [] },
  { id: "potato",          name: "じゃがいも",     category: "野菜",   allergens: [] },
  { id: "yam",             name: "山芋",           category: "野菜",   allergens: ["yam"] },
  { id: "matsutake",       name: "まつたけ",       category: "野菜",   allergens: ["matsutake"] },
  { id: "apple",           name: "りんご",         category: "果物",   allergens: ["apple"] },
  { id: "banana",          name: "バナナ",         category: "果物",   allergens: ["banana"] },
  { id: "orange",          name: "オレンジ",       category: "果物",   allergens: ["orange"] },
  { id: "kiwi",            name: "キウイ",         category: "果物",   allergens: ["kiwi"] },
  { id: "peach",           name: "もも",           category: "果物",   allergens: ["peach"] },

  // 大豆製品
  { id: "tofu",            name: "豆腐",           category: "大豆製品", allergens: ["soybean"] },
  { id: "soy-sauce",       name: "醤油",           category: "調味料", allergens: ["soybean", "wheat"] },
  { id: "miso",            name: "味噌",           category: "調味料", allergens: ["soybean"] },
  { id: "natto",           name: "納豆",           category: "大豆製品", allergens: ["soybean"] },

  // ナッツ類
  { id: "peanut",          name: "ピーナッツ",     category: "ナッツ", allergens: ["peanut"] },
  { id: "walnut",          name: "くるみ",         category: "ナッツ", allergens: ["walnut"] },
  { id: "almond",          name: "アーモンド",     category: "ナッツ", allergens: ["almond"] },
  { id: "cashew",          name: "カシューナッツ", category: "ナッツ", allergens: ["cashew"] },

  // ごま・その他
  { id: "sesame",          name: "ごま",           category: "種実",   allergens: ["sesame"] },
  { id: "sesame-oil",      name: "ごま油",         category: "調味料", allergens: ["sesame"] },
  { id: "gelatin",         name: "ゼラチン",       category: "その他", allergens: ["gelatin"] },
  { id: "chocolate",       name: "チョコレート",   category: "菓子材料", allergens: ["milk", "soybean"] },
  { id: "vanilla-extract", name: "バニラエッセンス", category: "菓子材料", allergens: [] },

  // 調味料
  { id: "salt",            name: "塩",             category: "調味料", allergens: [] },
  { id: "sugar",           name: "砂糖",           category: "調味料", allergens: [] },
  { id: "pepper",          name: "こしょう",       category: "調味料", allergens: [] },
  { id: "olive-oil",       name: "オリーブオイル", category: "調味料", allergens: [] },
  { id: "vinegar",         name: "酢",             category: "調味料", allergens: [] },
  { id: "dashi",           name: "和風だし",       category: "調味料", allergens: ["mackerel"] },
  { id: "consomme",        name: "コンソメ",       category: "調味料", allergens: ["wheat", "milk", "soybean", "chicken", "beef"] },
];

export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENT_MAP[id];
}

export function inferAllergens(ingredientIds: string[]): string[] {
  const set = new Set<string>();
  for (const id of ingredientIds) {
    const ing = INGREDIENT_MAP[id];
    if (!ing) continue;
    for (const a of ing.allergens) set.add(a);
  }
  return Array.from(set);
}

export const INGREDIENT_CATEGORIES = Array.from(new Set(INGREDIENTS.map((i) => i.category)));
