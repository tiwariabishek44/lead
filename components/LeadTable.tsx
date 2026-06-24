"use client";

import type { Lead } from "@/lib/leads";
import { fillTemplate, type StatusMap } from "@/lib/store";

type Props = {
  rows: Lead[];
  status: StatusMap;
  template: string;
  toggleSent: (id: string) => void;
  setNote: (id: string, note: string) => void;
};

// Open WhatsApp Web with the message pre-filled for this clinic's number.
function waWebLink(lead: Lead, template: string) {
  const digits = lead.phone.replace(/\D/g, "");
  const text = encodeURIComponent(
    fillTemplate(template, { name: lead.name, area: lead.area, city: lead.city })
  );
  return `https://web.whatsapp.com/send?phone=977${digits}&text=${text}`;
}

// Reuse a single WhatsApp Web tab. We keep the window handle AND use a fixed
// target name, so as long as the app owns the tab we switch chats in place
// rather than spawning a new tab (which trips WhatsApp's one-session lock).
let waWindow: Window | null = null;
function openWhatsApp(e: React.MouseEvent, url: string) {
  e.preventDefault();
  try {
    if (waWindow && !waWindow.closed) {
      waWindow.location.href = url;
      waWindow.focus();
      return;
    }
  } catch {
    /* handle severed by WhatsApp's COOP — fall through and open a fresh one */
  }
  waWindow = window.open(url, "whatsapp-web");
}

export function LeadTable({ rows, status, template, toggleSent, setNote }: Props) {
  if (rows.length === 0) {
    return <div className="table-wrap"><div className="empty">No clinics match this view.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="num">#</th>
            <th>Clinic</th>
            <th>Area</th>
            <th>Phone</th>
            <th>Rating</th>
            <th>Map</th>
            <th>Sent?</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((lead, i) => {
            const st = status[lead.id];
            const sent = !!st?.sent;
            return (
              <tr key={lead.id} className={sent ? "is-sent" : ""}>
                <td className="num">{i + 1}</td>
                <td>
                  <div className="clinic-name">{lead.name}</div>
                  {lead.address && <div className="clinic-addr">{lead.address}</div>}
                </td>
                <td><span className="pill">{lead.area || lead.city}</span></td>
                <td>
                  <a
                    className="wa-btn"
                    href={waWebLink(lead, template)}
                    target="whatsapp-web"
                    onClick={(e) => openWhatsApp(e, waWebLink(lead, template))}
                    title="Open WhatsApp Web with your message pre-filled"
                  >
                    <span className="wa-glyph" aria-hidden>✆</span> {lead.phone}
                  </a>
                </td>
                <td>{lead.rating ? <span className="rating">{lead.rating}</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                <td><a className="maplink" href={lead.placeUrl} target="_blank" rel="noopener noreferrer">View ↗</a></td>
                <td>
                  <label className="sent-toggle">
                    <input type="checkbox" checked={sent} onChange={() => toggleSent(lead.id)} />
                    {sent && st?.sentAt ? <span className="sent-date">{st.sentAt}</span> : "Mark"}
                  </label>
                </td>
                <td>
                  <input
                    className="note-input"
                    placeholder="add note…"
                    defaultValue={st?.note ?? ""}
                    onBlur={(e) => setNote(lead.id, e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
