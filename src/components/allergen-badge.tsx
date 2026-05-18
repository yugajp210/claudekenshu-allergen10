import * as React from "react";
import { cn } from "@/lib/utils";
import { getAllergen, type Allergen } from "@/lib/allergens";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function AllergenBadge({
  id,
  size = "sm",
  className,
  outlined = false,
  title,
}: {
  id: string;
  size?: Size;
  className?: string;
  outlined?: boolean;
  title?: string;
}) {
  const a = getAllergen(id);
  if (!a) return null;
  return (
    <span
      title={title ?? `${a.name}${a.level === "specified" ? "（特定原材料）" : "（推奨表示）"}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold leading-none ring-1",
        SIZE_MAP[size],
        outlined ? "bg-background text-muted-foreground ring-border" : "ring-transparent",
        className
      )}
      style={
        outlined
          ? undefined
          : {
              backgroundColor: a.bgColor,
              color: a.color,
            }
      }
    >
      {a.short}
    </span>
  );
}

export function AllergenChip({ id, className }: { id: string; className?: string }) {
  const a = getAllergen(id);
  if (!a) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        a.level === "specified" ? "" : "opacity-90",
        className
      )}
      style={{ backgroundColor: a.bgColor, color: a.color, boxShadow: `inset 0 0 0 1px ${a.color}33` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: a.color }}
        aria-hidden
      />
      {a.name}
      {a.level === "specified" && <span className="text-[10px] font-bold opacity-70">必</span>}
    </span>
  );
}

export function AllergenList({ ids, max = 8, size = "sm" }: { ids: string[]; max?: number; size?: Size }) {
  const visible = ids.slice(0, max);
  const remaining = ids.length - max;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((id) => (
        <AllergenBadge key={id} id={id} size={size} />
      ))}
      {remaining > 0 && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground h-5">
          +{remaining}
        </span>
      )}
    </div>
  );
}

export function getAllergenList(ids: string[]): Allergen[] {
  return ids.map((id) => getAllergen(id)).filter(Boolean) as Allergen[];
}
