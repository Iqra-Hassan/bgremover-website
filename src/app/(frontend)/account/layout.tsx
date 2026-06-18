import AccountAside from './_components/account-aside';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="py-14 md:py-20">
      <div className="container flex !max-w-4xl flex-col items-start gap-6 sm:flex-row sm:gap-10">
        <AccountAside />
        <div className="flex w-full flex-1 flex-col space-y-4 sm:w-auto">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
