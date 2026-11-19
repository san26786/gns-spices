import Link from 'next/link';
import { EnquiryForm } from '@/components/EnquiryForm';
import { FormPageShell } from '@/components/FormPageShell';

export const metadata = { title: 'Contact us — GNS Spices' };

export default function ContactPage() {
  return (
    <FormPageShell
      eyebrow="Contact"
      title="Get in"
      accent="touch."
      intro={
        <>
          <p>Questions about an order, a product or working with us? Send a message and we&apos;ll reply within one business day.</p>
          <p className="text-sm text-zinc-400">
            For trade pricing use the <Link href="/b2b/quote" className="text-amber-400 hover:text-amber-300">quote form</Link>. For your own spice brand, start a{' '}
            <Link href="/private-label/apply" className="text-amber-400 hover:text-amber-300">private label project</Link>.
          </p>
        </>
      }
      aside={
        <address className="not-italic text-sm text-zinc-400 leading-relaxed">
          <b className="block text-zinc-200">GNS Kitchens Limited</b>
          71–75 Shelton Street, Covent Garden<br />London, WC2H 9JQ, United Kingdom
        </address>
      }
    >
      <EnquiryForm
        type="contact"
        submitLabel="Send message"
        successTitle="Message sent."
        fields={[
          { name: 'name', label: 'Your name', required: true, autoComplete: 'name' },
          { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
          { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
          { name: 'topic', label: 'Topic', type: 'select', required: true, options: ['An order', 'A product', 'Wholesale / B2B', 'Private label', 'Press or partnerships', 'Something else'] },
          { name: 'message', label: 'Message', type: 'textarea', required: true },
        ]}
      />
    </FormPageShell>
  );
}
