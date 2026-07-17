import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#2D3148]/40 py-5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          © {year} SystemDesignLearner. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/changelog" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Release notes
          </Link>
          <Link href="/tracks" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Curriculum
          </Link>
          <Link href="/progress" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            My progress
          </Link>
        </div>
      </div>
    </footer>
  );
}
