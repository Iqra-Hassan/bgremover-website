import { AppSidebar } from '@/app/admin/_components/sidebar';
import { SiteHeader } from '@/app/admin/_components/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    return redirect('/login');
  }

  if (session.user.role !== 'admin') {
    return redirect('/');
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader user={session.user} />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-[1270px] p-4 md:p-7">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
