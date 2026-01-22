import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">T</span>
            </div>
            <span className="text-base font-semibold text-gray-900 tracking-tight">trackmail</span>
          </Link>
          <Link
            href="/auth"
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-5 animate-fadeIn">Email Intelligence</p>

          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-[1.15] tracking-tight mb-6 animate-slideUp">
            Focus on emails<br />that actually matter
          </h1>

          <p className="text-base text-gray-500 max-w-md mx-auto mb-10 leading-relaxed animate-slideUp" style={{ animationDelay: '0.1s' }}>
            AI analyzes your inbox and surfaces high-priority messages. Stop missing what&apos;s important.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white h-11 px-7 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Get started
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center justify-center h-11 px-7 text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-[1.02]"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section id="preview" className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-scaleIn" style={{ animationDelay: '0.3s' }}>
            {/* Window chrome */}
            <div className="h-11 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-48 bg-gray-100 rounded"></div>
              </div>
            </div>

            {/* Email list */}
            <div className="divide-y divide-gray-100">
              <div className="p-4 hover:bg-gray-50 transition-all duration-200 border-l-[3px] border-l-red-500 hover:pl-5 cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">SC</div>
                      <span className="font-medium text-gray-900 text-sm">Sarah Chen</span>
                      <span className="text-xs text-gray-400">2m ago</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-0.5">Contract deadline tomorrow</p>
                    <p className="text-xs text-gray-400">Need your signature before EOD...</p>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">92</span>
                </div>
              </div>

              <div className="p-4 hover:bg-gray-50 transition-all duration-200 border-l-[3px] border-l-orange-500 hover:pl-5 cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">MT</div>
                      <span className="font-medium text-gray-900 text-sm">Mike Thompson</span>
                      <span className="text-xs text-gray-400">15m ago</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-0.5">Q4 Budget Review</p>
                    <p className="text-xs text-gray-400">Action required by end of day...</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">78</span>
                </div>
              </div>

              <div className="p-4 hover:bg-gray-50 transition-colors opacity-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-400">LI</div>
                      <span className="text-gray-600 text-sm">LinkedIn</span>
                      <span className="text-xs text-gray-400">1h ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-0.5">New connection requests</p>
                    <p className="text-xs text-gray-400">You have 3 pending invitations...</p>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">12</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Priority scores from 0-100 based on urgency & importance
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 text-center mb-3">How it works</p>
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-14 tracking-tight">
            Three steps to inbox clarity
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110 group-hover:border-gray-300">
                <span className="text-sm font-semibold text-gray-900">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Connect Gmail</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Secure OAuth connection. We never store your password.</p>
            </div>

            <div className="text-center group">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110 group-hover:border-gray-300">
                <span className="text-sm font-semibold text-gray-900">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">AI analyzes</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Each email scored 0-100 based on urgency and importance.</p>
            </div>

            <div className="text-center group">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110 group-hover:border-gray-300">
                <span className="text-sm font-semibold text-gray-900">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Focus</h3>
              <p className="text-sm text-gray-500 leading-relaxed">See priority inbox. Never miss important emails again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
            Ready to try?
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Free to use. No credit card required.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white h-11 px-8 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="text-xs text-gray-400">© 2025 Trackmail</span>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
