"use client";

export type Filter = "all" | "sent" | "pending";
export type View = "leads" | "template";

type Props = {
  view: View;
  setView: (v: View) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  city: string;
  setCity: (c: string) => void;
  counts: { all: number; sent: number; pending: number };
  cities: { name: string; count: number }[];
  onToggle: () => void;
  onExport: () => void;
  onImport: () => void;
};

const VIEWS: { key: Filter; label: string }[] = [
  { key: "all", label: "All leads" },
  { key: "sent", label: "Message sent" },
  { key: "pending", label: "Not sent yet" },
];

export function Sidebar({ view, setView, filter, setFilter, city, setCity, counts, cities, onToggle, onExport, onImport }: Props) {
  const selectFilter = (f: Filter) => { setView("leads"); setFilter(f); };
  const selectCity = (c: string) => { setView("leads"); setCity(c); };
  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          Dental Lead Tracker
          <span>Kathmandu Valley · outreach</span>
        </div>
        <button className="collapse-btn" onClick={onToggle} aria-label="Collapse sidebar" title="Collapse sidebar">«</button>
      </div>

      <nav>
        <p className="nav-group-label">Views</p>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={`nav-btn ${view === "leads" && filter === v.key ? "active" : ""}`}
            onClick={() => selectFilter(v.key)}
          >
            <span>{v.label}</span>
            <span className="count">{counts[v.key]}</span>
          </button>
        ))}
        <button
          className={`nav-btn ${view === "template" ? "active" : ""}`}
          onClick={() => setView("template")}
        >
          <span>Message template</span>
        </button>
      </nav>

      <nav>
        <p className="nav-group-label">City</p>
        <button className={`nav-btn ${view === "leads" && city === "all" ? "active" : ""}`} onClick={() => selectCity("all")}>
          <span>All cities</span>
          <span className="count">{counts.all}</span>
        </button>
        {cities.map((c) => (
          <button
            key={c.name}
            className={`nav-btn ${view === "leads" && city === c.name ? "active" : ""}`}
            onClick={() => selectCity(c.name)}
          >
            <span>{c.name}</span>
            <span className="count">{c.count}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="ghost-btn" onClick={onExport}>↓ Export backup (JSON)</button>
        <button className="ghost-btn" onClick={onImport}>↑ Import backup</button>
      </div>
    </aside>
  );
}
