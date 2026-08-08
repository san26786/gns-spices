'use client';

import { useEffect } from 'react';
import { usePortal } from '../store';
import { IllustrativeTag, Panel, SectionHead, TextareaField } from '../ui';

export default function Notes() {
  const n = usePortal((s) => s.notes);
  const patch = usePortal((s) => s.patch);

  function update(k: keyof typeof n, v: string) {
    patch({
      notes: {
        ...n,
        [k]: v,
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
    });
  }

  // Set initial lastUpdated if empty
  useEffect(() => {
    if (!n.lastUpdated) {
      patch({
        notes: {
          ...n,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SectionHead
        n="11"
        title="Confidential Notes"
        subtitle="Working notepad for the deal team. Stored locally to this browser (per-partner), not published, not synced."
      />

      <Panel title="Metadata">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="label">Version</div>
            <input
              className="input mt-1.5"
              value={n.version}
              onChange={(e) => patch({ notes: { ...n, version: e.target.value } })}
            />
          </div>
          <div>
            <div className="label">Updated by</div>
            <input
              className="input mt-1.5"
              value={n.updatedBy}
              placeholder="Your name / initials"
              onChange={(e) => patch({ notes: { ...n, updatedBy: e.target.value } })}
            />
          </div>
          <div>
            <div className="label">Last updated</div>
            <input
              className="input mt-1.5 mono"
              value={n.lastUpdated}
              readOnly
            />
          </div>
          <div className="flex items-end">
            <span className="tag tag-gold">Autosave enabled</span>
          </div>
        </div>
      </Panel>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Panel title="Strategic notes">
          <TextareaField
            label="Strategy · positioning · why-now"
            value={n.strategic}
            onChange={(v) => update('strategic', v)}
            rows={6}
          />
        </Panel>
        <Panel title="Commercial notes">
          <TextareaField
            label="Pricing · margins · terms to negotiate"
            value={n.commercial}
            onChange={(v) => update('commercial', v)}
            rows={6}
          />
        </Panel>
        <Panel title="Supplier notes">
          <TextareaField
            label="Kamdhenu · supply reliability · category depth"
            value={n.supplier}
            onChange={(v) => update('supplier', v)}
            rows={6}
          />
        </Panel>
        <Panel title="Distributor notes">
          <TextareaField
            label="Candidate profiles · appointment sequencing"
            value={n.distributor}
            onChange={(v) => update('distributor', v)}
            rows={6}
          />
        </Panel>
        <Panel title="Risk notes">
          <TextareaField
            label="Emerging risks · mitigation experiments"
            value={n.risk}
            onChange={(v) => update('risk', v)}
            rows={6}
          />
        </Panel>
        <Panel title="Next actions">
          <TextareaField
            label="Owner · action · due date"
            value={n.nextActions}
            onChange={(v) => update('nextActions', v)}
            rows={6}
          />
        </Panel>
      </div>

      <IllustrativeTag>
        Notes are stored in your browser only (local storage, keyed by partner
        code). Clearing browser data will erase them. Do not paste customer
        PII, banking or credential-sensitive material into this notepad.
      </IllustrativeTag>
    </div>
  );
}
