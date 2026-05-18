"use client";

import * as React from "react";
import { INITIAL_MENUS, type Menu } from "./menus";
import { INGREDIENTS as INITIAL_INGREDIENTS, inferAllergens, type Ingredient } from "./ingredients";
import { ALLERGENS as INITIAL_ALLERGENS, type Allergen } from "./allergens";
import { SUPPLIERS as INITIAL_SUPPLIERS, INITIAL_LOTS, type Supplier, type IngredientLot } from "./suppliers";

export type StoreInfo = {
  storeName: string;
  storeCode: string;
  category: "restaurant" | "cafe" | "deli" | "bakery" | "izakaya";
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  closedDays: string;
};

export type Profile = {
  name: string;
  role: string;
  email: string;
  phone: string;
  initials: string;
};

export type DisplaySettings = {
  theme: "light" | "dark" | "system";
  iconStyle: "circle" | "square";
  showRecommendedAllergens: boolean;
  showAllergenFreeBadge: boolean;
  compactMode: boolean;
};

export type CheckSettings = {
  defaultLevel: "specified" | "all";
  strictMode: boolean;
  requireApproval: boolean;
  autoApplyOnSave: boolean;
  remindDays: number;
};

export type NotificationSettings = {
  emailMissing: boolean;
  emailReviewRequest: boolean;
  pushMissing: boolean;
  pushDailyReport: boolean;
  weeklyDigest: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff" | "viewer";
  joinedAt: string;
  lastActive: string;
};

export type Settings = {
  store: StoreInfo;
  profile: Profile;
  display: DisplaySettings;
  check: CheckSettings;
  notifications: NotificationSettings;
  team: TeamMember[];
};

const DEFAULT_SETTINGS: Settings = {
  store: {
    storeName: "アレルゲン管理キッチン 新宿本店",
    storeCode: "STR-001",
    category: "restaurant",
    postalCode: "160-0023",
    address: "東京都新宿区西新宿1-1-1 アレルゲンビル 5F",
    phone: "03-1234-5678",
    email: "shinjuku@allercheck.example.jp",
    businessHours: "11:00 〜 23:00",
    closedDays: "毎週水曜日",
  },
  profile: {
    name: "山田 太郎",
    role: "店舗管理者",
    email: "yamada@allercheck.example.jp",
    phone: "090-1111-2222",
    initials: "YT",
  },
  display: {
    theme: "light",
    iconStyle: "circle",
    showRecommendedAllergens: true,
    showAllergenFreeBadge: true,
    compactMode: false,
  },
  check: {
    defaultLevel: "specified",
    strictMode: true,
    requireApproval: false,
    autoApplyOnSave: true,
    remindDays: 7,
  },
  notifications: {
    emailMissing: true,
    emailReviewRequest: true,
    pushMissing: true,
    pushDailyReport: false,
    weeklyDigest: true,
  },
  team: [
    { id: "u-001", name: "山田 太郎", email: "yamada@allercheck.example.jp", role: "owner", joinedAt: "2024-04-01", lastActive: "2026-05-18" },
    { id: "u-002", name: "鈴木 花子", email: "suzuki@allercheck.example.jp", role: "manager", joinedAt: "2024-08-12", lastActive: "2026-05-17" },
    { id: "u-003", name: "佐藤 一郎", email: "sato@allercheck.example.jp", role: "staff", joinedAt: "2025-01-20", lastActive: "2026-05-15" },
    { id: "u-004", name: "高橋 美咲", email: "takahashi@allercheck.example.jp", role: "staff", joinedAt: "2025-09-05", lastActive: "2026-05-12" },
    { id: "u-005", name: "渡辺 健太", email: "watanabe@allercheck.example.jp", role: "viewer", joinedAt: "2026-02-14", lastActive: "2026-05-10" },
  ],
};

type StoreState = {
  menus: Menu[];
  settings: Settings;
  allergens: Allergen[];
  ingredients: Ingredient[];
  suppliers: Supplier[];
  lots: IngredientLot[];
};

type StoreApi = StoreState & {
  addMenu: (menu: Omit<Menu, "id" | "code" | "updatedAt" | "updatedBy">) => Menu;
  updateMenu: (id: string, patch: Partial<Menu>) => void;
  deleteMenu: (id: string) => void;
  setDeclaredAllergens: (id: string, allergens: string[]) => void;
  markReviewed: (ids: string[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateStore: (patch: Partial<StoreInfo>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateDisplay: (patch: Partial<DisplaySettings>) => void;
  // master data
  upsertAllergen: (a: Allergen) => void;
  deleteAllergen: (id: string) => void;
  upsertIngredient: (i: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  upsertSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  upsertLot: (l: IngredientLot) => void;
  deleteLot: (id: string) => void;
  updateCheck: (patch: Partial<CheckSettings>) => void;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  addTeamMember: (member: Omit<TeamMember, "id" | "joinedAt" | "lastActive">) => void;
  removeTeamMember: (id: string) => void;
  updateTeamRole: (id: string, role: TeamMember["role"]) => void;
};

const StoreContext = React.createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = React.useState<Menu[]>(INITIAL_MENUS);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [allergens, setAllergens] = React.useState<Allergen[]>(INITIAL_ALLERGENS);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [lots, setLots] = React.useState<IngredientLot[]>(INITIAL_LOTS);

  const addMenu: StoreApi["addMenu"] = (input) => {
    const id = `m-${String(menus.length + 1).padStart(3, "0")}`;
    const code = `M-${1000 + menus.length + 1}`;
    const next: Menu = {
      ...input,
      id,
      code,
      updatedAt: "2026-05-18",
      updatedBy: settings.profile.name,
    };
    setMenus((prev) => [next, ...prev]);
    return next;
  };

  const updateMenu: StoreApi["updateMenu"] = (id, patch) => {
    setMenus((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: "2026-05-18" } : m)));
  };

  const deleteMenu: StoreApi["deleteMenu"] = (id) => {
    setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  const setDeclaredAllergens: StoreApi["setDeclaredAllergens"] = (id, allergens) => {
    updateMenu(id, { declaredAllergens: allergens });
  };

  const markReviewed: StoreApi["markReviewed"] = (ids) => {
    setMenus((prev) =>
      prev.map((m) => {
        if (!ids.includes(m.id)) return m;
        const inferred = inferAllergens(m.ingredients);
        const merged = Array.from(new Set([...m.declaredAllergens, ...inferred]));
        return { ...m, declaredAllergens: merged, status: "published", updatedAt: "2026-05-18", updatedBy: settings.profile.name };
      })
    );
  };

  const updateSettings: StoreApi["updateSettings"] = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const updateStore: StoreApi["updateStore"] = (patch) => setSettings((s) => ({ ...s, store: { ...s.store, ...patch } }));
  const updateProfile: StoreApi["updateProfile"] = (patch) => setSettings((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  const updateDisplay: StoreApi["updateDisplay"] = (patch) => setSettings((s) => ({ ...s, display: { ...s.display, ...patch } }));
  const updateCheck: StoreApi["updateCheck"] = (patch) => setSettings((s) => ({ ...s, check: { ...s.check, ...patch } }));
  const updateNotifications: StoreApi["updateNotifications"] = (patch) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, ...patch } }));

  const addTeamMember: StoreApi["addTeamMember"] = (m) => {
    const id = `u-${String(settings.team.length + 1).padStart(3, "0")}`;
    setSettings((s) => ({
      ...s,
      team: [...s.team, { ...m, id, joinedAt: "2026-05-18", lastActive: "2026-05-18" }],
    }));
  };
  const removeTeamMember: StoreApi["removeTeamMember"] = (id) => {
    setSettings((s) => ({ ...s, team: s.team.filter((u) => u.id !== id) }));
  };
  const updateTeamRole: StoreApi["updateTeamRole"] = (id, role) => {
    setSettings((s) => ({ ...s, team: s.team.map((u) => (u.id === id ? { ...u, role } : u)) }));
  };

  const upsertAllergen: StoreApi["upsertAllergen"] = (a) =>
    setAllergens((prev) => (prev.some((x) => x.id === a.id) ? prev.map((x) => (x.id === a.id ? a : x)) : [...prev, a]));
  const deleteAllergen: StoreApi["deleteAllergen"] = (id) => setAllergens((prev) => prev.filter((x) => x.id !== id));

  const upsertIngredient: StoreApi["upsertIngredient"] = (i) =>
    setIngredients((prev) => (prev.some((x) => x.id === i.id) ? prev.map((x) => (x.id === i.id ? i : x)) : [...prev, i]));
  const deleteIngredient: StoreApi["deleteIngredient"] = (id) => setIngredients((prev) => prev.filter((x) => x.id !== id));

  const upsertSupplier: StoreApi["upsertSupplier"] = (s) =>
    setSuppliers((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s]));
  const deleteSupplier: StoreApi["deleteSupplier"] = (id) => setSuppliers((prev) => prev.filter((x) => x.id !== id));

  const upsertLot: StoreApi["upsertLot"] = (l) =>
    setLots((prev) => (prev.some((x) => x.id === l.id) ? prev.map((x) => (x.id === l.id ? l : x)) : [...prev, l]));
  const deleteLot: StoreApi["deleteLot"] = (id) => setLots((prev) => prev.filter((x) => x.id !== id));

  const value: StoreApi = {
    menus,
    settings,
    allergens,
    ingredients,
    suppliers,
    lots,
    addMenu,
    updateMenu,
    deleteMenu,
    setDeclaredAllergens,
    markReviewed,
    updateSettings,
    updateStore,
    updateProfile,
    updateDisplay,
    updateCheck,
    updateNotifications,
    addTeamMember,
    removeTeamMember,
    updateTeamRole,
    upsertAllergen,
    deleteAllergen,
    upsertIngredient,
    deleteIngredient,
    upsertSupplier,
    deleteSupplier,
    upsertLot,
    deleteLot,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
