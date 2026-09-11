import type { Guest } from "@/lib/types";

export function GuestTable({ guests }: { guests: Guest[] }) {
  return (
    <div className="border border-line bg-navy-900/60">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-navy-800">
            <th className="px-4 py-3 text-left font-display text-xs font-bold uppercase tracking-[0.22em] text-white">
              Konuklar
            </th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center font-body text-sm uppercase tracking-[0.2em] text-ink/60">
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}