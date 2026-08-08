'use client';

import { useMemo } from 'react';
import { usePortal } from '../store';

const proseCSS = `
.bc-doc {
  max-width: 780px;
  margin: 0 auto;
  color: var(--pt-text);
  font-size: 15.5px;
  line-height: 1.75;
}
.bc-doc h1 { font-size: 30px; font-weight: 700; line-height: 1.15; letter-spacing: -0.015em; color: var(--pt-off); margin: 0 0 6px; }
.bc-doc h2 {
  font-size: 20px; font-weight: 700; line-height: 1.25; color: var(--pt-off);
  margin: 42px 0 12px; padding-top: 22px;
  border-top: 1px solid var(--pt-line);
}
.bc-doc h3 { font-size: 15px; font-weight: 700; color: var(--pt-off); margin: 22px 0 6px; letter-spacing: 0; }
.bc-doc p { margin: 0 0 14px; }
.bc-doc ul { margin: 0 0 14px; padding-left: 20px; }
.bc-doc li { margin: 4px 0; }
.bc-doc strong { color: var(--pt-off); font-weight: 600; }
.bc-doc em { color: var(--pt-gold-hi); font-style: normal; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.85em; }
.bc-doc .lead { color: var(--pt-muted-hi); font-size: 17px; line-height: 1.7; }
.bc-doc .callout {
  margin: 20px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--pt-gold);
  background: rgba(176,141,58,0.05);
  border-radius: 0 8px 8px 0;
  color: var(--pt-text);
  font-size: 14.5px;
}
.bc-doc .callout .k { display: block; text-transform: uppercase; letter-spacing: 0.24em; font-size: 10px; color: var(--pt-gold); font-weight: 700; margin-bottom: 4px; }
.bc-doc .meta {
  display: flex; flex-wrap: wrap; gap: 14px; align-items: center;
  margin: 10px 0 30px; padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--pt-line);
  border-radius: 8px;
  font-size: 12px; color: var(--pt-muted);
}
.bc-doc .meta .sep { color: var(--pt-muted-2); }
.bc-doc .meta strong { color: var(--pt-off); }
.bc-doc .num-strip {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;
  margin: 18px 0;
}
.bc-doc .num-strip > div {
  padding: 10px 12px; border: 1px solid var(--pt-line); border-radius: 8px;
  background: rgba(255,255,255,0.02);
}
.bc-doc .num-strip .n { font-family: ui-monospace, monospace; font-size: 18px; font-weight: 700; color: var(--pt-off); }
.bc-doc .num-strip .l { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--pt-muted-2); margin-top: 2px; }
.bc-doc .signoff {
  margin: 40px 0 0;
  padding: 18px 20px;
  background: rgba(21,71,52,0.10);
  border: 1px solid rgba(21,71,52,0.35);
  border-radius: 10px;
  font-size: 13px;
  color: var(--pt-muted-hi);
}
.bc-doc .toc {
  padding: 14px 16px; margin: 20px 0 30px;
  border: 1px solid var(--pt-line); border-radius: 8px;
  background: rgba(255,255,255,0.015);
  font-size: 12.5px;
}
.bc-doc .toc .k { text-transform: uppercase; letter-spacing: 0.24em; font-size: 10px; font-weight: 700; color: var(--pt-gold); margin-bottom: 8px; }
.bc-doc .toc ol { list-style: none; padding: 0; margin: 0; columns: 2; column-gap: 24px; }
.bc-doc .toc li { padding: 2px 0; color: var(--pt-muted); }
.bc-doc .toc li a { color: var(--pt-muted-hi); text-decoration: none; }
.bc-doc .toc li a:hover { color: var(--pt-gold); }
.bc-doc .toc li::before { content: attr(data-n) '  '; color: var(--pt-muted-2); font-family: ui-monospace, monospace; }
.bc-print-btn {
  position: sticky; top: 96px; float: right;
  margin: 0 0 10px 20px;
}

@media print {
  .pt-root .sidebar, .pt-root nav, .pt-root .session-bar,
  .pt-root .no-print { display: none !important; }
  .pt-root { background: white !important; color: black !important; }
  .bc-doc { color: black !important; max-width: 100% !important; font-size: 11.5pt; line-height: 1.55; }
  .bc-doc h1, .bc-doc h2, .bc-doc h3, .bc-doc strong { color: black !important; }
  .bc-doc h2 { border-top-color: #ccc !important; page-break-after: avoid; }
  .bc-doc p, .bc-doc li { page-break-inside: avoid; }
  .bc-doc .callout { background: #f4f0e6 !important; border-left-color: #b08d3a !important; color: black !important; }
  .bc-doc .callout .k { color: #7a6222 !important; }
  .bc-doc .signoff { background: #eaf1ee !important; border-color: #6f8f80 !important; color: #333 !important; }
  .bc-doc .num-strip > div { background: #fafafa !important; border-color: #ddd !important; }
  .bc-doc .num-strip .n { color: black !important; }
  .bc-doc .toc { background: #fafafa !important; border-color: #ddd !important; }
  .bc-doc .toc li a { color: #333 !important; }
  .bc-print-btn { display: none !important; }
}
`;

export default function BusinessCase() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const setActive = usePortal((s) => s.setActive);

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: proseCSS }} />

      <div className="flex items-start justify-between mb-6 no-print">
        <div>
          <div className="eyebrow">Section 02</div>
          <div className="text-sm mt-1" style={{ color: 'var(--pt-muted)' }}>
            Written business case — for reading, discussion and offline distribution
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive('overview')}
            className="btn"
            style={{ fontSize: 11 }}
          >
            ← Back to overview
          </button>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ fontSize: 11 }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      <article className="bc-doc">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Confidential — Working business case</div>
        <h1>Kamdhenu — India Market Development</h1>
        <p className="lead">
          A proposal to build a structured, technology-enabled distribution
          network across India, using the Kamdhenu category as the anchor
          working case. Prepared for authorised partner review.
        </p>

        <div className="meta">
          <span><strong>Version</strong> v1.0</span>
          <span className="sep">·</span>
          <span><strong>Date</strong> {today}</span>
          <span className="sep">·</span>
          <span><strong>Status</strong> Planning / Evaluation</span>
          <span className="sep">·</span>
          <span><strong>Commercial</strong> Subject to agreement</span>
        </div>

        <div className="toc">
          <div className="k">Contents</div>
          <ol>
            <li data-n="1."><a href="#es">Executive Summary</a></li>
            <li data-n="2."><a href="#opp">The Opportunity</a></li>
            <li data-n="3."><a href="#prop">The Proposition</a></li>
            <li data-n="4."><a href="#model">Business Model</a></li>
            <li data-n="5."><a href="#arch">Distribution Architecture</a></li>
            <li data-n="6."><a href="#pilot">The Pilot: Jaunpur</a></li>
            <li data-n="7."><a href="#fin">Financial Framework</a></li>
            <li data-n="8."><a href="#wc">Working Capital Discipline</a></li>
            <li data-n="9."><a href="#risk">Risk &amp; Mitigation</a></li>
            <li data-n="10."><a href="#ask">Path to Decision</a></li>
          </ol>
        </div>

        <h2 id="es">1. Executive Summary</h2>
        <p>
          India is not one market. It is thousands of micro-markets stitched
          together by administrative geography — thirty-six states and union
          territories, more than eight hundred districts, over seven thousand
          development blocks, roughly two hundred and fifty thousand Gram
          Panchayats and more than six hundred thousand villages. National
          distribution is therefore not a logistics problem. It is a
          <strong> route-to-market design problem</strong> — deciding which
          territory to enter, in what sequence, with which distributor, backed
          by what commercial economics and measured against which operating
          metric.
        </p>
        <p>
          GNS Spices proposes to build the platform that answers those
          questions systematically: a national distribution and market
          development engine that maps opportunity, appoints distributors
          against a scoring model, activates retailers into revenue and closes
          the loop with technology and data. The first working case is the
          proposed Kamdhenu category, treated in this document as a
          <em> confidential — working business case </em> — not a confirmed
          commercial relationship.
        </p>
        <p>
          We are asking authorised reviewers to evaluate three things: whether
          the market opportunity is real, whether the model captures it
          defensibly and whether the pilot as designed is the right first
          rupee spent. If the answer is yes to all three, we would move to
          secure commercial terms with the supplier and begin the Jaunpur
          pilot within one operating quarter.
        </p>

        <h2 id="opp">2. The Opportunity</h2>
        <p>
          The rural and peri-urban FMCG market in India has been widely
          described but poorly served. Distribution beyond Tier-2 towns is
          fragmented across thousands of small wholesalers with limited
          working capital, no data infrastructure and no incentive to build
          the categories they carry. The economics of the shelf are
          negotiated at the counter and settled in cash, and the brand loses
          both visibility and pricing power the further downstream one goes.
        </p>
        <p>
          At the same time, three structural shifts have changed what a
          modern distributor can be. Digital payments have collapsed the
          settlement cycle. Smartphone penetration among retailers now
          exceeds the coverage of any single distributor. And rural
          consumption is compounding faster than urban across most FMCG
          categories, drawn by cash transfers, farm income and the arrival of
          national brands into micro-markets that never carried them before.
        </p>
        <div className="num-strip">
          <div><div className="n">36</div><div className="l">States &amp; UTs</div></div>
          <div><div className="n">800+</div><div className="l">Districts</div></div>
          <div><div className="n">7,000+</div><div className="l">Blocks</div></div>
          <div><div className="n">250,000+</div><div className="l">Gram Panchayats</div></div>
          <div><div className="n">600,000+</div><div className="l">Villages</div></div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--pt-muted-2)' }}>
          Administrative counts are indicative planning figures and vary by
          source; they are used here to size the coverage problem, not to
          assert precision.
        </p>
        <p>
          The opportunity is not simply to move more product through this
          system. It is to build the <strong>coordination layer</strong> that
          the system lacks — an entity that can score a territory before
          entering it, appoint the right distributor because it has a
          measurable definition of &ldquo;right&rdquo;, activate retailers
          against a designed programme rather than a hopeful conversation,
          and give the supplier visibility into what is actually happening
          shelf by shelf.
        </p>

        <h2 id="prop">3. The Proposition</h2>
        <p>
          GNS Spices is designed to be that coordination layer. The
          proposition is deliberately narrow and defensible: we are not
          another distributor competing on price, and we are not a marketing
          agency competing on ideas. We are a
          <strong> distribution and market-development platform </strong>
          that turns a supplier&apos;s product into distributed, activated,
          measured retail volume across defined territories.
        </p>
        <p>
          For the supplier, the value is a single accountable partner for
          national coverage, with a written territory plan, distributor
          scorecards, retailer-level visibility and a working capital model
          that scales with performance rather than promise. For the
          distributor, the value is quality supply, structured incentives,
          data-backed territory rights and a growth path where exclusivity is
          earned. For the retailer, the value is climbing tiers — better
          prices, promotions, rewards and category anchor status as monthly
          purchase grows.
        </p>
        <p>
          The Kamdhenu category is being considered as the anchor product
          around which this platform is first built. Nothing in this document
          implies a signed relationship, exclusivity or pricing; those are
          matters for a separate commercial agreement. The purpose of this
          case is to test whether the platform is viable if such an agreement
          were reached on terms that any competent commercial team would
          negotiate.
        </p>

        <h2 id="model">4. Business Model</h2>
        <p>
          The platform is built as seven interlocking engines. Each is
          designed, staffed and measured independently, but they are wired
          together so that a decision in one — say, upgrading a distributor
          from Preferred to Strategic — flows through pricing, incentives,
          sales targeting and reporting automatically.
        </p>
        <ul>
          <li><strong>Territory Engine</strong> — scores every state, district and block on a 100-point model so that capital follows opportunity rather than geography.</li>
          <li><strong>Distributor Engine</strong> — identifies, scores, appoints and grows distribution partners against nine measurable criteria.</li>
          <li><strong>Retailer Engine</strong> — recruits, activates and grows retailers along six ascending tiers, each with better economics as monthly volume rises.</li>
          <li><strong>Pricing Engine</strong> — maintains a sustainable ladder from supplier price to shelf price, protecting margin at every layer.</li>
          <li><strong>Incentive Engine</strong> — programmatically rewards volume, achievement, market development and repeat purchase.</li>
          <li><strong>Sales Engine</strong> — turns territory coverage into active retailers and active retailers into recurring order flow.</li>
          <li><strong>Data Engine</strong> — closes the loop with national-to-retailer visibility, replacing anecdote with measured performance.</li>
        </ul>
        <p>
          Revenue accrues through distribution margin, market-development
          fees, incentive pool participation and, at scale, data and
          technology services. Cost is concentrated in field sales, the
          technology platform and working capital. Contribution is the
          difference — and, as the working capital section makes clear, that
          difference is only meaningful if the cash cycle is disciplined.
        </p>

        <h2 id="arch">5. Distribution Architecture</h2>
        <p>
          Product flows downward through eight tiers, and data flows
          upward. GNS Spices sits in the second tier — deliberately distinct
          from the manufacturer above it and the regional distributors below
          — because the market-development function needs a different
          accountability, a different balance sheet posture and a different
          measurement framework from either.
        </p>
        <p>
          Every downstream tier operates under an earned rather than
          contracted set of rights. A newly appointed distributor enters a
          ninety-day probation, then progresses through Performance Territory
          → Preferred Territory → Exclusive Territory only against sustained
          scorecard performance. This inverts the usual arrangement — where
          exclusivity is offered up front and then quietly regretted — and
          allows the supplier to trust the network without operating it.
        </p>
        <div className="callout">
          <span className="k">Principle</span>
          Territory exclusivity is earned through performance, never granted
          at signing. The supplier retains the option to re-territorise if
          performance lapses. This is the single most consequential
          governance choice in the model.
        </div>

        <h2 id="pilot">6. The Pilot: Jaunpur</h2>
        <p>
          Jaunpur, in eastern Uttar Pradesh, is the proposed pilot district.
          It is chosen deliberately — not because it is the easiest district
          in India but because it is a representative one. Twenty-one
          development blocks, a little over a thousand Gram Panchayats, a
          planning population of roughly four million and a mix of rural
          concentration and market-town density that mirrors what national
          rollout will encounter at scale.
        </p>
        <p>
          The pilot is sequenced across five phases. Phase 1 activates five to
          seven priority blocks with a dedicated field team. Phase 2 saturates
          one hundred to two hundred priority Gram Panchayats. Phase 3
          onboards two hundred and fifty to five hundred active retailers.
          Phase 4 extends coverage across all twenty-one blocks. Phase 5
          optimises — route density, tier upgrades and, if warranted,
          private-label extensions. All targets are
          <em> illustrative planning bands </em>, not commitments.
        </p>
        <p>
          Jaunpur is the working laboratory where the seven engines are
          proven in production before capital is committed to scale. Every
          scorecard, every incentive band, every reporting rhythm and every
          field cadence is battle-tested here. What survives Jaunpur is what
          replicates.
        </p>

        <h2 id="fin">7. Financial Framework</h2>
        <p>
          Two scenarios frame the economic conversation. Neither is a
          forecast; both are illustrative sizings intended to show how the
          model scales.
        </p>
        <p>
          At the <strong>pilot district level</strong>, five hundred active
          retailers purchasing an average of thirty thousand rupees per month
          produce one and a half crore of monthly secondary sales, or
          eighteen crore annualised. GNS contribution at three to ten percent
          of secondary sales — depending on category depth and negotiated
          terms — sits between fifty-four lakh and one crore eighty lakh.
          That range is wide by design: it is the sensitivity partners should
          be reviewing.
        </p>
        <p>
          At a <strong>mature national network</strong>, ten thousand active
          retailers at an average monthly purchase of fifty thousand rupees
          produce fifty crore of monthly secondary sales, or six hundred
          crore annualised. Contribution economics at the same range would
          place GNS contribution in a middle-to-high nine-figure rupee band.
          This is a mature-state illustrative scenario, and the intervening
          years require capital, operational build-out and category
          extension.
        </p>
        <p>
          The interactive dashboard in this portal exposes every input to the
          reviewer. Adjust the number of retailers, the average monthly
          purchase, the contribution percentage or the operating cost line,
          and the model recomputes in real time. That is the appropriate
          form for these numbers — they are not to be quoted as facts.
        </p>

        <h2 id="wc">8. Working Capital Discipline</h2>
        <p>
          Distribution businesses fail on working capital more often than
          they fail on strategy. As secondary sales grow, inventory,
          receivables and credit exposure grow with them — and if the
          supplier&apos;s payables terms do not extend at the same pace, the
          cash tied up in the business scales faster than contribution.
        </p>
        <p>
          The working capital model in this portal is deliberately simple:
          inventory investment plus receivable investment minus payables
          equals net working capital, and the cash conversion cycle is the
          number of days that cash spends outside the bank. A threshold
          alert fires the moment net working capital exceeds a configured
          ceiling. That alert is a governance mechanism, not a warning
          decoration — it is intended to force a CFO conversation before the
          next scale gate is cleared.
        </p>
        <div className="callout">
          <span className="k">Non-negotiable</span>
          No scale gate — from Jaunpur to Uttar Pradesh, from Uttar Pradesh
          to multi-state, from multi-state to national — is cleared without
          demonstrated working capital discipline in the preceding period.
          This is a Committee-level control.
        </div>

        <h2 id="risk">9. Risk &amp; Mitigation</h2>
        <p>
          The risk dashboard within this portal maintains a living register
          of ten categories, each with level, impact, mitigation, owner and
          status. Four risks warrant particular Committee attention.
        </p>
        <ul>
          <li>
            <strong>Distributor selection risk.</strong> The wrong
            appointment compounds silently. Mitigation: ninety-day
            probation, hard scorecard gates, and territory rights that are
            explicitly performance-linked rather than tenure-linked.
          </li>
          <li>
            <strong>Credit risk.</strong> Distributor credit slippage is
            where working capital breaks. Mitigation: capped credit days
            per tier, digital ledgers, bank guarantees at Strategic tier and
            weekly ageing review at Finance.
          </li>
          <li>
            <strong>Execution risk.</strong> The gap between plan-on-paper
            and field reality is where most distribution ventures die.
            Mitigation: weekly field cadence with leading-indicator KPIs,
            not lagging ones — retailer visits, order lines placed, first-order
            conversion — reported at COO level.
          </li>
          <li>
            <strong>Working capital risk.</strong> Covered in the section
            above; managed by threshold-based scale gates and CFO sign-off
            before geographic expansion.
          </li>
        </ul>
        <p>
          Commercial, supply, price, inventory, channel-conflict and
          competition risks are managed through structural terms, contract
          clauses and operating cadence documented in the Risks section.
        </p>

        <h2 id="ask">10. Path to Decision</h2>
        <p>
          There are four decisions available to the Committee at the end of
          this review. The Decision Centre inside this portal records the
          selection and an audit note. None of those buttons transmit
          anything externally — they are internal governance markers.
        </p>
        <ul>
          <li>
            <strong>Approve pilot.</strong> Authorises the Jaunpur pilot
            subject to securing the commercial terms outlined below.
          </li>
          <li>
            <strong>Request more data.</strong> Specifies the additional
            evidence required before a proceed decision can be made.
          </li>
          <li>
            <strong>Revise assumptions.</strong> Sends the case back to the
            planning team for a reworked pricing, volume or working capital
            frame.
          </li>
          <li>
            <strong>Do not proceed.</strong> Closes the case; the platform
            can be re-proposed with a different anchor category or supplier
            configuration.
          </li>
        </ul>
        <h3>Commercial terms to secure before proceeding</h3>
        <p>
          Any approval is contingent on securing, at minimum, a
          volume-linked pricing band with the supplier, a written
          expectation on supply reliability, a category-development
          contribution or equivalent trade-marketing budget, a defined
          territory arrangement that respects earned distributor
          exclusivity, and a quarterly price-review clause. These are the
          non-negotiables. Anything softer than this exposes the model to
          the risks documented above.
        </p>
        <h3>Cross-functional readiness</h3>
        <p>
          A green light also assumes the platform is operationally ready.
          That means the field sales team recruited, the distributor
          onboarding process signed off by Sales Operations, the technology
          console live for at least the KPIs listed in the Performance
          Dashboard section, and Finance in a position to fund the
          projected working capital for the first two operating quarters.
        </p>

        <div className="signoff">
          <div style={{ fontWeight: 700, color: 'var(--pt-off)', marginBottom: 6 }}>
            Confidentiality
          </div>
          Kamdhenu is treated throughout this document as a
          <em> confidential — working business case </em>. Nothing in this
          document implies a formal appointment, exclusivity or commercial
          agreement unless separately verified in writing. This portal is
          accessible only to holders of an authorised access code, and its
          contents are proprietary planning information of GNS Spices. Not
          for redistribution.
        </div>
      </article>
    </div>
  );
}
