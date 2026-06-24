"use client";

import { useCallback, useEffect, useState } from "react";

export type LeadStatus = {
  sent: boolean;
  sentAt?: string; // ISO date (yyyy-mm-dd)
  note?: string;
};

export type StatusMap = Record<string, LeadStatus>;

const KEY = "dental-lead-tracker.v1";
const TEMPLATE_KEY = "dental-lead-tracker.template.v1";

export const DEFAULT_TEMPLATE =
  "Namaste {name} 🙏\n\nI came across your clinic on Google. I design modern websites for dental clinics here in Nepal, and I've put together a quick preview site for {name} — completely free to look at, no obligation.\n\nMay I share the link with you?";

export function useTemplate() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATE_KEY);
      if (raw != null) setTemplate(raw);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(TEMPLATE_KEY, template);
  }, [template, loaded]);

  return { template, setTemplate };
}

// Fill {name}/{area}/{city} placeholders for a given lead.
export function fillTemplate(tpl: string, vars: { name: string; area: string; city: string }) {
  return tpl
    .replace(/\{name\}/g, vars.name)
    .replace(/\{area\}/g, vars.area || vars.city)
    .replace(/\{city\}/g, vars.city);
}

export function useLeadStatus() {
  const [map, setMap] = useState<StatusMap>({});
  const [loaded, setLoaded] = useState(false);

  // Load once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMap(JSON.parse(raw) as StatusMap);
    } catch {
      /* corrupt storage — start clean */
    }
    setLoaded(true);
  }, []);

  // Persist on every change, but only after the initial load (never overwrite with {}).
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(map));
  }, [map, loaded]);

  const toggleSent = useCallback((id: string) => {
    setMap((m) => {
      const cur = m[id] ?? { sent: false };
      const sent = !cur.sent;
      return {
        ...m,
        [id]: {
          ...cur,
          sent,
          sentAt: sent ? cur.sentAt ?? new Date().toISOString().slice(0, 10) : undefined,
        },
      };
    });
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setMap((m) => ({ ...m, [id]: { ...(m[id] ?? { sent: false }), note } }));
  }, []);

  const replaceAll = useCallback((next: StatusMap) => setMap(next), []);

  return { map, loaded, toggleSent, setNote, replaceAll };
}
