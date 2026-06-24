"use client";

import { useTemplate, fillTemplate, DEFAULT_TEMPLATE } from "@/lib/store";
import { leads } from "@/lib/leads";

const sample = leads[0];

export function TemplateEditor() {
  const { template, setTemplate } = useTemplate();
  const preview = fillTemplate(template, { name: sample.name, area: sample.area, city: sample.city });

  return (
    <>
      <div className="head">
        <h1>Message template</h1>
        <span className="sub">reused for every clinic</span>
      </div>
      <p className="progress-line">
        Use <code className="ph">{"{name}"}</code> for the clinic name and <code className="ph">{"{area}"}</code> for the area. Saved automatically.
      </p>

      <div className="tpl-grid">
        <section className="tpl-card">
          <div className="tpl-card-head">
            <span>Your message</span>
            <button className="reset-btn" onClick={() => setTemplate(DEFAULT_TEMPLATE)}>Reset to default</button>
          </div>
          <textarea
            className="tpl-page-input"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={12}
            spellCheck={false}
            placeholder="Type your outreach message…"
          />
        </section>

        <section className="tpl-card">
          <div className="tpl-card-head">
            <span>Preview</span>
            <span className="preview-for">for “{sample.name}”</span>
          </div>
          <div className="preview-bubble">{preview || "Your message will appear here…"}</div>
          <p className="preview-note">This is exactly what gets pre-filled in WhatsApp Web.</p>
        </section>
      </div>
    </>
  );
}
