import { EnquiryForm } from '@/components/EnquiryForm';
import { FormPageShell, Steps } from '@/components/FormPageShell';

export const metadata = { title: 'Start a private label project — GNS Spices' };

export default function PrivateLabelApplyPage() {
  return (
    <FormPageShell
      eyebrow="Private label"
      title="Start your"
      accent="project."
      back={{ href: '/private-label', label: 'Private label' }}
      intro={
        <>
          <p>Share a short brief and a project manager will be in touch within 48 hours.</p>
          <p className="text-sm text-zinc-400">Minimum order: 500 units per SKU. Typical lead time 8–12 weeks. Smaller pilot runs considered case by case.</p>
        </>
      }
      aside={
        <Steps
          items={[
            ['Brief', 'Your brand, products and volumes.'],
            ['Feasibility', 'We check recipes, packaging and compliance for your markets.'],
            ['Samples', 'You approve formulation and packaging before production.'],
            ['Production & export', 'Lab-tested, labelled and shipped with the documents you need.'],
          ]}
        />
      }
    >
      <EnquiryForm
        type="private_label"
        submitLabel="Send brief"
        successTitle="Brief received."
        fields={[
          { name: 'name', label: 'Your name', required: true, autoComplete: 'name' },
          { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
          { name: 'country', label: 'Country', required: true, autoComplete: 'country-name' },
          { name: 'brandName', label: 'Brand name', required: true },
          { name: 'company', label: 'Company (if different)', autoComplete: 'organization' },
          { name: 'productType', label: 'What do you want to make?', type: 'select', required: true, options: ['Pure powders', 'Signature masalas / blends', 'Whole spices', 'Whole seeds', 'Indian pickles', 'Gift sets', 'Not sure yet'] },
          { name: 'quantity', label: 'Estimated units per SKU', type: 'select', required: true, options: ['500–1,000', '1,000–5,000', '5,000–20,000', 'Over 20,000', 'Pilot run (under 500)'] },
          { name: 'message', label: 'Project brief', type: 'textarea', placeholder: 'Target market, pack format, launch date, certifications you need…' },
        ]}
      />
    </FormPageShell>
  );
}
