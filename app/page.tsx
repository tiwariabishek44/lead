"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { leads } from "@/lib/leads";
import { useLeadStatus, useTemplate, type StatusMap } from "@/lib/store";
import { Sidebar, type Filter, type View } from "@/components/Sidebar";
import { LeadTable } from "@/components/LeadTable";
import { TemplateEditor } from "@/components/TemplateEditor";

export default function Page() {
  const { map, loaded, toggleSent, setNote, replaceAll } = useLeadStatus();
  const { template } = useTemplate();
  const [view, setView] = useState<View>("leads");
  const [filter, setFilter] = useState<Filter>("all");
  const [city, setCity] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem("dental-lead-tracker.collapsed") === "1");
  }, []);
  const toggleSidebar = () => setCollapsed((c) => {
    const next = !c;
    localStorage.setItem("dental-lead-tracker.collapsed", next ? "1" : "0");
    return next;
  });

  const cities = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of leads) m.set(l.city, (m.get(l.city) ?? 0) + 1);
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, []);

  const sentCount = useMemo(() => leads.filter((l) => map[l.id]?.sent).length, [map]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (city !== "all" && l.city !== city) return false;
      const isSent = !!map[l.id]?.sent;
      if (filter === "sent" && !isSent) return false;
      if (filter === "pending" && isSent) return false;
      if (q && !(`${l.name} ${l.area} ${l.address} ${l.phone}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [filter, city, query, map]);

  const counts = { all: leads.length, sent: sentCount, pending: leads.length - sentCount };

  function onExport() {
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lead-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport() {
    fileRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as StatusMap;
        replaceAll(data);
      } catch {
        alert("That file isn't a valid backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const pct = Math.round((sentCount / leads.length) * 100);

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <Sidebar
        view={view}
        setView={setView}
        filter={filter}
        setFilter={setFilter}
        city={city}
        setCity={setCity}
        counts={counts}
        cities={cities}
        onToggle={toggleSidebar}
        onExport={onExport}
        onImport={onImport}
      />
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleFile} />

      <main className="main">
        <button
          className="rail-toggle"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "☰" : "«"}
        </button>
        {view === "template" ? <TemplateEditor /> : (
        <>
        <div className="head">
          <h1>{filter === "sent" ? "Message sent" : filter === "pending" ? "Not sent yet" : "All leads"}</h1>
          <span className="sub">{city === "all" ? "Kathmandu Valley" : city}</span>
        </div>
        <p className="progress-line">
          {loaded ? <><b>{sentCount}</b> of {leads.length} clinics contacted ({pct}%) · <b>{counts.pending}</b> still to reach</> : "Loading…"}
        </p>

        <div className="toolbar">
          <input
            className="search"
            placeholder="Search clinic, area, or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="sub">{rows.length} shown</span>
        </div>

        <LeadTable rows={rows} status={map} template={template} toggleSent={toggleSent} setNote={setNote} />
        </>
        )}
      </main>
    </div>
  );
}
