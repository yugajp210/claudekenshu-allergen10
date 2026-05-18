export type Supplier = {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
};

export const SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    code: "S-001",
    name: "築地中央水産",
    contact: "田村 直樹",
    phone: "03-5678-9012",
    email: "tamura@tsukiji-suisan.example.jp",
    address: "東京都中央区築地6-1-1",
    notes: "鮮魚全般、毎朝6:00頃納品",
  },
  {
    id: "sup-002",
    code: "S-002",
    name: "国産畜産フードサプライ",
    contact: "佐々木 美穂",
    phone: "03-1234-0987",
    email: "sasaki@kokusan-meat.example.jp",
    address: "神奈川県横浜市青葉区青葉台3-7-8",
    notes: "国産牛・豚・鶏。HACCP対応工場直送。",
  },
  {
    id: "sup-003",
    code: "S-003",
    name: "信州オーガニックファーム",
    contact: "中村 健司",
    phone: "0263-44-5566",
    email: "info@shinshu-organic.example.jp",
    address: "長野県松本市浅間温泉1-12-3",
    notes: "有機野菜・果物。月水金納品。",
  },
  {
    id: "sup-004",
    code: "S-004",
    name: "丸三製粉工業",
    contact: "山口 たかし",
    phone: "048-991-2233",
    email: "yamaguchi@marusan-flour.example.jp",
    address: "埼玉県川越市新富町2-15-7",
    notes: "国産小麦粉・米粉。",
  },
  {
    id: "sup-005",
    code: "S-005",
    name: "ナカガワ乳業",
    contact: "藤井 麻衣",
    phone: "011-872-3344",
    email: "fujii@nakagawa-dairy.example.jp",
    address: "北海道札幌市北区北24条西8-1-1",
    notes: "北海道産生クリーム・バター・牛乳。",
  },
  {
    id: "sup-006",
    code: "S-006",
    name: "アジア食材センター",
    contact: "Wang Lei",
    phone: "03-3456-7890",
    email: "wang@asia-foods.example.jp",
    address: "東京都台東区上野3-22-1",
    notes: "ナッツ・スパイス・乾物。",
  },
];

export const SUPPLIER_MAP: Record<string, Supplier> = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export function getSupplier(id: string): Supplier | undefined {
  return SUPPLIER_MAP[id];
}

export type IngredientLot = {
  id: string;
  ingredientId: string;
  supplierId: string;
  lotNumber: string;
  receivedAt: string;
  expiresAt: string;
  quantity: number;
  unit: string;
  /** 「使用中」「在庫」「使い切り」「期限切れ」 */
  status: "active" | "stock" | "consumed" | "expired";
  pricePerUnit?: number;
};

export const INITIAL_LOTS: IngredientLot[] = [
  // 鮮魚 (sup-001)
  { id: "lot-001", ingredientId: "shrimp",   supplierId: "sup-001", lotNumber: "TSK-20260510-S01", receivedAt: "2026-05-10", expiresAt: "2026-05-20", quantity: 5.0, unit: "kg", status: "active",   pricePerUnit: 2800 },
  { id: "lot-002", ingredientId: "crab",     supplierId: "sup-001", lotNumber: "TSK-20260512-C01", receivedAt: "2026-05-12", expiresAt: "2026-05-19", quantity: 3.0, unit: "kg", status: "active",   pricePerUnit: 4500 },
  { id: "lot-003", ingredientId: "salmon",   supplierId: "sup-001", lotNumber: "TSK-20260515-SA1", receivedAt: "2026-05-15", expiresAt: "2026-05-22", quantity: 8.0, unit: "kg", status: "active",   pricePerUnit: 2200 },
  { id: "lot-004", ingredientId: "tuna",     supplierId: "sup-001", lotNumber: "TSK-20260517-T01", receivedAt: "2026-05-17", expiresAt: "2026-05-21", quantity: 4.5, unit: "kg", status: "active",   pricePerUnit: 3800 },
  { id: "lot-005", ingredientId: "squid",    supplierId: "sup-001", lotNumber: "TSK-20260514-I01", receivedAt: "2026-05-14", expiresAt: "2026-05-19", quantity: 2.0, unit: "kg", status: "expired", pricePerUnit: 1500 },
  { id: "lot-006", ingredientId: "mackerel", supplierId: "sup-001", lotNumber: "TSK-20260518-M01", receivedAt: "2026-05-18", expiresAt: "2026-05-22", quantity: 3.5, unit: "kg", status: "active",   pricePerUnit: 1200 },

  // 畜産 (sup-002)
  { id: "lot-010", ingredientId: "ground-meat", supplierId: "sup-002", lotNumber: "KKS-20260515-GM01", receivedAt: "2026-05-15", expiresAt: "2026-05-20", quantity: 10, unit: "kg", status: "active",   pricePerUnit: 1800 },
  { id: "lot-011", ingredientId: "beef",        supplierId: "sup-002", lotNumber: "KKS-20260516-B01",  receivedAt: "2026-05-16", expiresAt: "2026-05-22", quantity: 6,  unit: "kg", status: "active",   pricePerUnit: 3500 },
  { id: "lot-012", ingredientId: "pork",        supplierId: "sup-002", lotNumber: "KKS-20260516-P01",  receivedAt: "2026-05-16", expiresAt: "2026-05-22", quantity: 12, unit: "kg", status: "active",   pricePerUnit: 1600 },
  { id: "lot-013", ingredientId: "chicken",     supplierId: "sup-002", lotNumber: "KKS-20260517-CH1",  receivedAt: "2026-05-17", expiresAt: "2026-05-21", quantity: 8,  unit: "kg", status: "active",   pricePerUnit: 1200 },
  { id: "lot-014", ingredientId: "bacon",       supplierId: "sup-002", lotNumber: "KKS-20260510-BC1",  receivedAt: "2026-05-10", expiresAt: "2026-06-10", quantity: 3,  unit: "kg", status: "stock",    pricePerUnit: 2400 },
  { id: "lot-015", ingredientId: "ham",         supplierId: "sup-002", lotNumber: "KKS-20260510-HM1",  receivedAt: "2026-05-10", expiresAt: "2026-06-10", quantity: 2,  unit: "kg", status: "stock",    pricePerUnit: 2600 },

  // 有機野菜・果物 (sup-003)
  { id: "lot-020", ingredientId: "onion",  supplierId: "sup-003", lotNumber: "SHI-20260517-ON1", receivedAt: "2026-05-17", expiresAt: "2026-05-31", quantity: 15, unit: "kg", status: "active", pricePerUnit: 280 },
  { id: "lot-021", ingredientId: "carrot", supplierId: "sup-003", lotNumber: "SHI-20260517-CR1", receivedAt: "2026-05-17", expiresAt: "2026-05-31", quantity: 10, unit: "kg", status: "active", pricePerUnit: 320 },
  { id: "lot-022", ingredientId: "tomato", supplierId: "sup-003", lotNumber: "SHI-20260515-TM1", receivedAt: "2026-05-15", expiresAt: "2026-05-25", quantity: 8,  unit: "kg", status: "active", pricePerUnit: 480 },
  { id: "lot-023", ingredientId: "potato", supplierId: "sup-003", lotNumber: "SHI-20260512-PT1", receivedAt: "2026-05-12", expiresAt: "2026-06-12", quantity: 20, unit: "kg", status: "active", pricePerUnit: 220 },
  { id: "lot-024", ingredientId: "apple",  supplierId: "sup-003", lotNumber: "SHI-20260513-AP1", receivedAt: "2026-05-13", expiresAt: "2026-06-13", quantity: 12, unit: "kg", status: "active", pricePerUnit: 380 },
  { id: "lot-025", ingredientId: "orange", supplierId: "sup-003", lotNumber: "SHI-20260518-OR1", receivedAt: "2026-05-18", expiresAt: "2026-05-30", quantity: 8,  unit: "kg", status: "active", pricePerUnit: 420 },
  { id: "lot-026", ingredientId: "banana", supplierId: "sup-003", lotNumber: "SHI-20260516-BN1", receivedAt: "2026-05-16", expiresAt: "2026-05-23", quantity: 6,  unit: "kg", status: "active", pricePerUnit: 240 },
  { id: "lot-027", ingredientId: "yam",    supplierId: "sup-003", lotNumber: "SHI-20260514-YM1", receivedAt: "2026-05-14", expiresAt: "2026-05-28", quantity: 5,  unit: "kg", status: "active", pricePerUnit: 580 },

  // 製粉 (sup-004)
  { id: "lot-030", ingredientId: "flour",       supplierId: "sup-004", lotNumber: "MRS-20260501-FL1", receivedAt: "2026-05-01", expiresAt: "2026-08-01", quantity: 25, unit: "kg", status: "active", pricePerUnit: 320 },
  { id: "lot-031", ingredientId: "bread-crumb", supplierId: "sup-004", lotNumber: "MRS-20260505-PK1", receivedAt: "2026-05-05", expiresAt: "2026-07-05", quantity: 8,  unit: "kg", status: "active", pricePerUnit: 480 },
  { id: "lot-032", ingredientId: "pasta",       supplierId: "sup-004", lotNumber: "MRS-20260420-PS1", receivedAt: "2026-04-20", expiresAt: "2027-04-20", quantity: 15, unit: "kg", status: "stock",  pricePerUnit: 580 },
  { id: "lot-033", ingredientId: "udon",        supplierId: "sup-004", lotNumber: "MRS-20260510-UD1", receivedAt: "2026-05-10", expiresAt: "2026-05-24", quantity: 5,  unit: "kg", status: "active", pricePerUnit: 380 },
  { id: "lot-034", ingredientId: "soba-noodle", supplierId: "sup-004", lotNumber: "MRS-20260515-SB1", receivedAt: "2026-05-15", expiresAt: "2026-05-25", quantity: 4,  unit: "kg", status: "active", pricePerUnit: 620 },
  { id: "lot-035", ingredientId: "ramen-noodle",supplierId: "sup-004", lotNumber: "MRS-20260516-RM1", receivedAt: "2026-05-16", expiresAt: "2026-05-23", quantity: 6,  unit: "kg", status: "active", pricePerUnit: 540 },

  // 乳製品 (sup-005)
  { id: "lot-040", ingredientId: "milk-raw",       supplierId: "sup-005", lotNumber: "NKG-20260517-MR1", receivedAt: "2026-05-17", expiresAt: "2026-05-24", quantity: 20, unit: "L",  status: "active", pricePerUnit: 240 },
  { id: "lot-041", ingredientId: "butter",         supplierId: "sup-005", lotNumber: "NKG-20260510-BT1", receivedAt: "2026-05-10", expiresAt: "2026-07-10", quantity: 6,  unit: "kg", status: "active", pricePerUnit: 1480 },
  { id: "lot-042", ingredientId: "cream",          supplierId: "sup-005", lotNumber: "NKG-20260518-CR1", receivedAt: "2026-05-18", expiresAt: "2026-05-26", quantity: 4,  unit: "L",  status: "active", pricePerUnit: 980 },
  { id: "lot-043", ingredientId: "cheese",         supplierId: "sup-005", lotNumber: "NKG-20260512-CH1", receivedAt: "2026-05-12", expiresAt: "2026-07-12", quantity: 3,  unit: "kg", status: "active", pricePerUnit: 1820 },
  { id: "lot-044", ingredientId: "yogurt",         supplierId: "sup-005", lotNumber: "NKG-20260516-YG1", receivedAt: "2026-05-16", expiresAt: "2026-05-30", quantity: 5,  unit: "kg", status: "active", pricePerUnit: 480 },
  { id: "lot-045", ingredientId: "condensed-milk", supplierId: "sup-005", lotNumber: "NKG-20260401-CM1", receivedAt: "2026-04-01", expiresAt: "2026-10-01", quantity: 2,  unit: "kg", status: "stock",  pricePerUnit: 680 },

  // ナッツ・スパイス (sup-006)
  { id: "lot-050", ingredientId: "peanut", supplierId: "sup-006", lotNumber: "ASI-20260418-PN1", receivedAt: "2026-04-18", expiresAt: "2026-10-18", quantity: 3,  unit: "kg", status: "stock",  pricePerUnit: 1480 },
  { id: "lot-051", ingredientId: "walnut", supplierId: "sup-006", lotNumber: "ASI-20260415-WN1", receivedAt: "2026-04-15", expiresAt: "2026-10-15", quantity: 2,  unit: "kg", status: "stock",  pricePerUnit: 2280 },
  { id: "lot-052", ingredientId: "almond", supplierId: "sup-006", lotNumber: "ASI-20260415-AM1", receivedAt: "2026-04-15", expiresAt: "2026-10-15", quantity: 4,  unit: "kg", status: "stock",  pricePerUnit: 1980 },
  { id: "lot-053", ingredientId: "cashew", supplierId: "sup-006", lotNumber: "ASI-20260420-CS1", receivedAt: "2026-04-20", expiresAt: "2026-10-20", quantity: 2,  unit: "kg", status: "stock",  pricePerUnit: 2280 },
  { id: "lot-054", ingredientId: "sesame", supplierId: "sup-006", lotNumber: "ASI-20260501-SS1", receivedAt: "2026-05-01", expiresAt: "2026-11-01", quantity: 5,  unit: "kg", status: "active", pricePerUnit: 880 },
  { id: "lot-055", ingredientId: "sesame-oil", supplierId: "sup-006", lotNumber: "ASI-20260501-SO1", receivedAt: "2026-05-01", expiresAt: "2026-11-01", quantity: 6, unit: "L", status: "stock", pricePerUnit: 1380 },
];

export type LotStatus = IngredientLot["status"];

export const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  active: "使用中",
  stock: "在庫",
  consumed: "使い切り",
  expired: "期限切れ",
};

export const LOT_STATUS_VARIANT: Record<LotStatus, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  active: "success",
  stock: "secondary",
  consumed: "outline",
  expired: "destructive",
};

export function daysUntilExpiry(expiresAt: string, today = new Date()): number {
  const exp = new Date(expiresAt + "T00:00:00");
  const diff = exp.getTime() - new Date(today.toDateString()).getTime();
  return Math.round(diff / 86400000);
}
