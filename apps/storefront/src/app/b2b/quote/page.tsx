import { EnquiryForm } from '@/components/EnquiryForm';
import { FormPageShell } from '@/components/FormPageShell';

export const metadata = { title: 'Request a quote — GNS Spices' };

export default function QuotePage() {
  return (
    <FormPageShell
      eyebrow="Bulk & wholesale"
      title="Request a"
      accent="quote."
      back={{ href: '/b2b', label: 'Trade & wholesale' }}
      intro={
        <>
          <p>Tell us what you need and in what quantities. We&apos;ll come back with pricing, pack sizes and lead times, usually within one business day.</p>
          <p className="text-sm text-zinc-400">Bulk packs go up to 25kg sacks. Already approved for trade? Mention your business name and we&apos;ll apply your tier.</p>
        </>
      }
    >
      <EnquiryForm
        type="quote_request"
        submitLabel="Request quote"
        successTitle="Quote request received."
        fields={[
          { name: 'name', label: 'Your name', required: true, autoComplete: 'name' },
          { name: 'company', label: 'Business name', required: true, autoComplete: 'organization' },
          { name: 'email', label: 'Work email', type: 'email', required: true, autoComplete: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
          { name: 'businessType', label: 'Business type', type: 'select', options: ['Restaurant or café', 'Retailer', 'Wholesaler', 'Distributor', 'Caterer', 'Food manufacturer', 'Other'] },
          { name: 'country', label: 'Delivery country', required: true, autoComplete: 'country-name' },
          { name: 'products', label: 'Products and quantities', type: 'textarea', required: true, placeholder: 'e.g. Turmeric powder 25kg × 4, Garam masala 5kg × 10' },
          { name: 'message', label: 'Delivery date, frequency or other details', type: 'textarea' },
        ]}
      />
    </FormPageShell>
  );
}
