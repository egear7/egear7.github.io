import { SquareCheckbox } from "./SquareCheckbox";
import type { Guest } from "@/lib/types";

const COLUMNS = ["Konuklar", "Kişi", "Ege Onay", "Gelir / Gelmez", "Tarih"];

export function GuestTable({ guests }: { guests: Guest[] }) {
  return (
    <div className="overflow-x-auto border border-line bg-navy-900/60">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="bg-navy-800">
            {COLUMNS.map((col, i) => (
              <th
                key={col}
                className={`px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.22em] text-white ${
                  i >= 2 ? "text-center" : "text-left"
                } ${i === 0 ? "w-[38%]" : ""} ${i === 1 ? "w-[22%]" : ""}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-6 text-center font-body text-sm uppercase tracking-[0.2em] text-ink/60">
                Henüz konuk eklenmedi
              </td>
            </tr>
          ) : (
            guests.map((g, i) => (
              <tr
                key={g.id}
                className={`border-b border-line-soft bg-paper text-ink ${
                  i === guests.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-4 py-3 font-body text-base font-semibold uppercase tracking-wide">
                  {g.name || "—"}
                </td>
                <td className="px-4 py-3 font-body text-sm font-medium uppercase tracking-wide text-ink/70">
                  {g.host || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <SquareCheckbox checked={g.approved} variant="light" />
                </td>
                <td className="px-4 py-3 text-center">
                  <SquareCheckbox checked={g.coming} variant="light" />
                </td>
                <td className="px-4 py-3 text-center font-body text-sm font-medium tracking-wide text-ink/70">
                  {g.date || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}