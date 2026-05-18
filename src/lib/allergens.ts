export type AllergenLevel = "specified" | "recommended";

export type Allergen = {
  id: string;
  name: string;
  short: string;
  level: AllergenLevel;
  /** 食品表示法上の表示名以外の代替表記。OCR・原材料テキストからの自動判定に使用。 */
  aliases: string[];
  /** 取扱注意事項や法令メモ */
  notes?: string;
  color: string;
  bgColor: string;
  iconColor: string;
  /** 法令上の根拠ラベル */
  legalRef?: string;
};

export const ALLERGENS: Allergen[] = [
  {
    id: "egg", name: "卵", short: "卵", level: "specified", color: "#f59e0b", bgColor: "#fef3c7", iconColor: "text-amber-700",
    aliases: ["玉子", "鶏卵", "うずら卵", "エッグ", "egg", "卵黄", "卵白", "全卵"],
    notes: "マヨネーズ・チーズ等の加工品にも含まれる場合があるため、原材料表記を確認すること。",
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "milk", name: "乳", short: "乳", level: "specified", color: "#3b82f6", bgColor: "#dbeafe", iconColor: "text-blue-700",
    aliases: ["牛乳", "生乳", "脱脂粉乳", "全粉乳", "練乳", "クリーム", "バター", "チーズ", "ヨーグルト", "ホエイ", "カゼイン", "乳清", "ミルク"],
    notes: "「乳化剤」「乳酸菌」は原則として該当しない。製造ロットの確認推奨。",
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "wheat", name: "小麦", short: "小麦", level: "specified", color: "#a16207", bgColor: "#fef3c7", iconColor: "text-yellow-800",
    aliases: ["こむぎ", "小麦粉", "強力粉", "薄力粉", "デュラム小麦", "全粒粉", "麩", "グルテン", "wheat"],
    notes: "醤油・味噌に含まれることがあるため、調味料の原材料も確認。",
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "shrimp", name: "えび", short: "えび", level: "specified", color: "#ef4444", bgColor: "#fee2e2", iconColor: "text-red-700",
    aliases: ["エビ", "海老", "シュリンプ", "ブラックタイガー", "バナメイエビ", "車海老", "甘えび", "桜えび", "shrimp", "prawn"],
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "crab", name: "かに", short: "かに", level: "specified", color: "#f97316", bgColor: "#ffedd5", iconColor: "text-orange-700",
    aliases: ["カニ", "蟹", "ズワイガニ", "タラバガニ", "毛ガニ", "ワタリガニ", "crab"],
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "buckwheat", name: "そば", short: "そば", level: "specified", color: "#78350f", bgColor: "#fef3c7", iconColor: "text-amber-800",
    aliases: ["蕎麦", "そば粉", "ソバ", "buckwheat"],
    notes: "コンタミネーション（混入）防止のため、調理器具の分離管理が重要。",
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "peanut", name: "落花生", short: "落花", level: "specified", color: "#92400e", bgColor: "#fef3c7", iconColor: "text-amber-900",
    aliases: ["ピーナッツ", "南京豆", "らっかせい", "peanut"],
    legalRef: "食品表示法 別表第十四",
  },
  {
    id: "walnut", name: "くるみ", short: "胡桃", level: "specified", color: "#7c2d12", bgColor: "#fee2e2", iconColor: "text-orange-900",
    aliases: ["クルミ", "胡桃", "walnut"],
    notes: "2023年3月の食品表示基準改正により、特定原材料へ追加。経過措置期限は2025年3月末。",
    legalRef: "食品表示法 別表第十四（2023年改正）",
  },

  { id: "almond", name: "アーモンド", short: "扁桃", level: "recommended", color: "#a3a3a3", bgColor: "#f5f5f4", iconColor: "text-stone-600", aliases: ["扁桃", "almond"], legalRef: "食品表示基準通知 別添" },
  { id: "abalone", name: "あわび", short: "鮑", level: "recommended", color: "#737373", bgColor: "#f5f5f4", iconColor: "text-stone-600", aliases: ["アワビ", "鮑", "abalone"], legalRef: "食品表示基準通知 別添" },
  { id: "squid", name: "いか", short: "烏賊", level: "recommended", color: "#a78bfa", bgColor: "#ede9fe", iconColor: "text-violet-700", aliases: ["イカ", "烏賊", "squid"], legalRef: "食品表示基準通知 別添" },
  { id: "salmon-roe", name: "いくら", short: "鮭卵", level: "recommended", color: "#fb923c", bgColor: "#ffedd5", iconColor: "text-orange-700", aliases: ["イクラ", "salmon roe"], legalRef: "食品表示基準通知 別添" },
  { id: "orange", name: "オレンジ", short: "橙", level: "recommended", color: "#f97316", bgColor: "#ffedd5", iconColor: "text-orange-600", aliases: ["オレンジ", "orange"], legalRef: "食品表示基準通知 別添" },
  { id: "cashew", name: "カシューナッツ", short: "カシュ", level: "recommended", color: "#84cc16", bgColor: "#ecfccb", iconColor: "text-lime-700", aliases: ["カシュー", "cashew"], legalRef: "食品表示基準通知 別添" },
  { id: "kiwi", name: "キウイフルーツ", short: "鳥梨", level: "recommended", color: "#65a30d", bgColor: "#ecfccb", iconColor: "text-lime-700", aliases: ["キウイ", "kiwi"], legalRef: "食品表示基準通知 別添" },
  { id: "beef", name: "牛肉", short: "牛", level: "recommended", color: "#b91c1c", bgColor: "#fee2e2", iconColor: "text-red-800", aliases: ["牛", "ビーフ", "beef"], legalRef: "食品表示基準通知 別添" },
  { id: "sesame", name: "ごま", short: "胡麻", level: "recommended", color: "#1f2937", bgColor: "#e5e7eb", iconColor: "text-gray-700", aliases: ["ゴマ", "胡麻", "白ごま", "黒ごま", "ごま油", "sesame"], legalRef: "食品表示基準通知 別添" },
  { id: "salmon", name: "さけ", short: "鮭", level: "recommended", color: "#ec4899", bgColor: "#fce7f3", iconColor: "text-pink-700", aliases: ["サケ", "鮭", "サーモン", "salmon"], legalRef: "食品表示基準通知 別添" },
  { id: "mackerel", name: "さば", short: "鯖", level: "recommended", color: "#0ea5e9", bgColor: "#e0f2fe", iconColor: "text-sky-700", aliases: ["サバ", "鯖", "mackerel"], legalRef: "食品表示基準通知 別添" },
  { id: "soybean", name: "大豆", short: "大豆", level: "recommended", color: "#65a30d", bgColor: "#ecfccb", iconColor: "text-lime-700", aliases: ["だいず", "ダイズ", "枝豆", "醤油", "豆腐", "味噌", "soy", "soybean"], legalRef: "食品表示基準通知 別添" },
  { id: "chicken", name: "鶏肉", short: "鶏", level: "recommended", color: "#dc2626", bgColor: "#fee2e2", iconColor: "text-red-700", aliases: ["鶏", "チキン", "chicken"], legalRef: "食品表示基準通知 別添" },
  { id: "banana", name: "バナナ", short: "蕉", level: "recommended", color: "#facc15", bgColor: "#fef9c3", iconColor: "text-yellow-700", aliases: ["banana"], legalRef: "食品表示基準通知 別添" },
  { id: "pork", name: "豚肉", short: "豚", level: "recommended", color: "#f43f5e", bgColor: "#ffe4e6", iconColor: "text-rose-700", aliases: ["豚", "ポーク", "ハム", "ベーコン", "pork"], legalRef: "食品表示基準通知 別添" },
  { id: "matsutake", name: "まつたけ", short: "松茸", level: "recommended", color: "#65a30d", bgColor: "#ecfccb", iconColor: "text-lime-700", aliases: ["松茸", "マツタケ", "matsutake"], legalRef: "食品表示基準通知 別添" },
  { id: "peach", name: "もも", short: "桃", level: "recommended", color: "#f472b6", bgColor: "#fce7f3", iconColor: "text-pink-600", aliases: ["桃", "ピーチ", "peach"], legalRef: "食品表示基準通知 別添" },
  { id: "yam", name: "やまいも", short: "山芋", level: "recommended", color: "#a16207", bgColor: "#fef3c7", iconColor: "text-yellow-800", aliases: ["山芋", "長芋", "自然薯", "とろろ", "yam"], legalRef: "食品表示基準通知 別添" },
  { id: "apple", name: "りんご", short: "林檎", level: "recommended", color: "#dc2626", bgColor: "#fee2e2", iconColor: "text-red-700", aliases: ["リンゴ", "林檎", "アップル", "apple"], legalRef: "食品表示基準通知 別添" },
  { id: "gelatin", name: "ゼラチン", short: "膠", level: "recommended", color: "#78716c", bgColor: "#f5f5f4", iconColor: "text-stone-600", aliases: ["ゼラチン", "gelatin"], legalRef: "食品表示基準通知 別添" },
];

export const SPECIFIED_ALLERGENS = ALLERGENS.filter((a) => a.level === "specified");
export const RECOMMENDED_ALLERGENS = ALLERGENS.filter((a) => a.level === "recommended");

export const ALLERGEN_MAP: Record<string, Allergen> = Object.fromEntries(ALLERGENS.map((a) => [a.id, a]));

export function getAllergen(id: string): Allergen | undefined {
  return ALLERGEN_MAP[id];
}

/** 任意のテキストから aliases を含むアレルゲンを抽出する */
export function detectAllergensFromText(text: string, allergens: Allergen[] = ALLERGENS): string[] {
  const found = new Set<string>();
  const haystack = text.toLowerCase();
  for (const a of allergens) {
    const needles = [a.name, ...a.aliases].map((n) => n.toLowerCase());
    for (const n of needles) {
      if (n && haystack.includes(n)) {
        found.add(a.id);
        break;
      }
    }
  }
  return Array.from(found);
}
