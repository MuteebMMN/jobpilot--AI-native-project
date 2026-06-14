import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { SignOutButton } from "./SignOutButton";
import { NavLinks } from "./NavLinks";

export async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("insforge_logged_in");

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/public/logo.png"
            alt="JobPilot"
            width={36}
            height={36}
            className="rounded-[10px]"
          />
          <span className="text-[19px] font-bold leading-7 text-text-darkest">
            jobpilot
          </span>
        </Link>

        <NavLinks />

        {isLoggedIn ? (
          <SignOutButton />
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-overlay text-white text-sm font-medium rounded-lg hover:bg-overlay-dark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
          >
            Start for free
          </Link>
        )}
      </div>
    </header>
  );
}
