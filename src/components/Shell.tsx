import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CartPanel from './CartPanel';

export default function Shell() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="mx-auto flex w-full max-w-[1720px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="flex min-w-0 flex-1 items-stretch">
            <main className="min-w-0 flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
              <Outlet />
              <footer className="mt-20 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-6 text-xs text-muted">
                <span className="flex items-center gap-3">
                  <span>© 2026 Cybernexus. All rights reserved.</span>
                  <span aria-hidden="true">·</span>
                  <Link to="/terms" className="transition-colors hover:text-cream">
                    Terms &amp; Conditions
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/privacy" className="transition-colors hover:text-cream">
                    Data Policy
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/sell" className="font-semibold text-cream/80 transition-colors hover:text-cream">
                    Become a Vendor
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span>Created by Gish Israel</span>
                </span>
                <span className="font-display tracking-[0.25em] text-cream/30">
                  GET DISCOVERED — CYBERNEXUS
                </span>
              </footer>
            </main>
            <CartPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
