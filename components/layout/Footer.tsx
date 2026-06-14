import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/public/logo.png"
            alt="JobPilot"
            width={28}
            height={28}
            className="rounded-[8px]"
          />
          <span className="text-sm font-bold text-text-darkest">jobpilot</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/profile"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Login
          </Link>
        </nav>

        <p className="text-xs text-text-muted">
          © 2025 JobPilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
