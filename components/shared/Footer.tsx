export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#2D3148]/40 py-4 mt-auto">
      <p className="text-center text-xs text-slate-600">
        © {year} SystemDesignLearner. All rights reserved.
      </p>
    </footer>
  );
}
