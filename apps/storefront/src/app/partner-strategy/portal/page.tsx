import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from './session';
import UnlockGate from './UnlockGate';
import PlanningPortal from './PlanningPortal';

export const metadata: Metadata = {
  title: 'GNS UDYAM — Private Partner Strategy Portal',
  description: 'Confidential planning environment. Authorised access only.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySession(token);

  if (!session) {
    return <UnlockGate />;
  }
  return <PlanningPortal partner={session.partner} expiresAt={session.exp} />;
}
