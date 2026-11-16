'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { PageHeader } from '../../_ui';
import { ProductForm } from '../product-form';

export default function NewProductPage() {
  const router = useRouter();
  return (
    <>
      <PageHeader
        title="Add product"
        sub="The product gets a permanent code (GNS-…) for its QR code. Add packs, prices and stock on the next screen."
        actions={<Link href="/admin/products" className="text-sm text-zinc-400 hover:text-white">← All products</Link>}
      />
      <ProductForm
        submitLabel="Create product"
        initial={{ name: '', slug: '', categoryId: null, shortDesc: null, longDesc: null, originCountry: 'IN', isActive: false, isB2bOnly: false, ingredients: null, certifications: ['FSSAI'] }}
        onSubmit={async (v) => {
          const created = await adminApi.post<{ id: string }>('/admin/products', { ...v, slug: v.slug || undefined });
          router.replace(`/admin/products/${created.id}`);
        }}
      />
    </>
  );
}
