import { EnquiryForm } from '@/components/EnquiryForm';
import { FormPageShell, Steps } from '@/components/FormPageShell';

export const metadata = { title: 'Apply for a business account — GNS Spices' };

export default function B2BApplyPage() {
  return (
    <FormPageShell
      eyebrow="For trade"
      title="Apply for a"
      accent="business account."
      back={{ href: '/b2b', label: 'Trade & wholesale' }}
      intro={<p>Restaurants, retailers, caterers and distributors get tiered pricing, bulk packs and credit terms once approved.</p>}
      aside={
        <Steps
          items={[
            ['Apply', 'Tell us about your business and what you buy.'],
            ['Verify', 'Our trade team reviews applications within 1–2 business days.'],
            ['Get pricing', 'We assign your price tier and send a custom quote if you need one.'],
            ['Order', 'Reorder online and track every delivery.'],
          ]}
        />
      }
    >
      <EnquiryForm
        type="b2b_application"
        submitLabel="Send application"
        successTitle="Application received."
        fields={[
          { name: 'name', label: 'Your name', required: true, autoComplete: 'name' },
          { name: 'company', label: 'Business name', required: true, autoComplete: 'organization' },
          { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
          { name: 'businessType', label: 'Business type', type: 'select', required: true, options: ['Restaurant or café', 'Retailer', 'Wholesaler', 'Distributor', 'Caterer', 'Food manufacturer', 'Other'] },
          { name: 'city', label: 'City', required: true, autoComplete: 'address-level2' },
          { name: 'country', label: 'Country', required: true, autoComplete: 'country-name' },
          { name: 'quantity', label: 'Expected monthly spend', type: 'select', options: ['Under £500', '£500–£2,000', '£2,000–£10,000', 'Over £10,000'] },
          { name: 'message', label: 'Anything else we should know', type: 'textarea', placeholder: 'Products you use most, delivery needs, VAT or company number…' },
        ]}
      />
    </FormPageShell>
  );
}
