import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Logo from '../admin/_components/sidebar/logo';
import Image from 'next/image';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (session) {
    return redirect('/');
  }
  return (
    <div className="flex h-svh overflow-hidden">
      <div className="flex flex-1 flex-col gap-7 overflow-y-auto p-6 md:p-10">
        <div className="flex justify-start gap-2">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="bg-primary hidden flex-1 flex-col items-center justify-center lg:flex">
        <Image
          src="/images/auth-image.png"
          alt="Auth Background"
          width={1000}
          height={1000}
          className="size-full object-contain"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
