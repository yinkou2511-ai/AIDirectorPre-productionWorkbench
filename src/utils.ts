import type { Status } from "./types";

export const statuses: Status[] = ["待审核", "已修改", "已确认", "需重做", "已导出"];

export function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function splitList(value: string) {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function statusClass(status: Status) {
  const map: Record<Status, string> = {
    待审核: "border-slate-300 bg-slate-50 text-slate-700",
    已修改: "border-amber/30 bg-amber/10 text-amber",
    已确认: "border-signal/30 bg-signal/10 text-signal",
    需重做: "border-brick/30 bg-brick/10 text-brick",
    已导出: "border-slate-400 bg-slate-100 text-slate-600",
  };
  return map[status];
}
