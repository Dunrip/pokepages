import { titleCase } from "@/lib/species-utils";
import type { EncounterLocation } from "@/lib/encounters";

function cleanArea(name: string) {
  return titleCase(name.replace(/-/g, " "));
}

export function EncounterTable({ encounters }: { encounters: EncounterLocation[] }) {
  if (!encounters.length) {
    return <p className="text-sm text-muted-foreground">No encounter data.</p>;
  }

  // flatten to a simple table: location area + version + method + levels + chance
  const rows = encounters.flatMap((e) =>
    (e.version_details ?? []).flatMap((vd) =>
      (vd.encounter_details ?? []).map((d) => ({
        area: cleanArea(e.location_area.name),
        version: titleCase(vd.version.name),
        method: titleCase(d.method.name),
        min: d.min_level,
        max: d.max_level,
        chance: d.chance,
      }))
    )
  );

  const shown = rows.slice(0, 120);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th className="text-left p-2">Location</th>
            <th className="text-left p-2">Version</th>
            <th className="text-left p-2">Method</th>
            <th className="text-right p-2">Lv</th>
            <th className="text-right p-2">Chance</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 whitespace-nowrap">{r.area}</td>
              <td className="p-2 whitespace-nowrap">{r.version}</td>
              <td className="p-2 whitespace-nowrap">{r.method}</td>
              <td className="p-2 text-right font-mono">{r.min === r.max ? r.min : `${r.min}-${r.max}`}</td>
              <td className="p-2 text-right font-mono">{r.chance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > shown.length ? (
        <div className="p-2 text-xs text-muted-foreground">Showing {shown.length} / {rows.length} rows (capped).</div>
      ) : null}
    </div>
  );
}
