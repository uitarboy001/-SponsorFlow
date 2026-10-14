import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Navigation */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-bold tracking-tight text-white text-lg">
              SponsorFlow
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <Link href="/the-tech-horizon" className="hover:text-white transition-colors">
              Live Demo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-mono text-neutral-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-mono bg-white hover:bg-neutral-200 text-black font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-emerald-400 text-xs font-mono mb-6">
            <span>✦ SELF-SERVICE NEWSLETTER SPONSORSHIPS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Stop chasing invoices.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-600">
              Automate your ad slots.
            </span>
          </h1>

          <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Turn your media kit into a self-serve checkout. Sponsors pick an available issue, preview their ad copy live, and pay upfront via Stripe—without a single back-and-forth email.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/the-tech-horizon"
              className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-black font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors shadow-lg shadow-emerald-950/50"
            >
              Try Live Sponsor Demo ↗
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-medium px-7 py-3.5 rounded-lg text-sm transition-colors font-mono"
            >
              Creator Sign In
            </Link>
          </div>

          {/* Interactive Flow Preview Box */}
          <div className="mt-16 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 md:p-10 max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
                <span className="text-xs font-mono text-neutral-500 ml-2">
                  sponsorflow.com/the-tech-horizon
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded">
                Stripe Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl">
                <div className="text-xs font-mono text-neutral-500 mb-1">STEP 01</div>
                <div className="font-semibold text-white text-sm mb-2">Select an Issue Date</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time inventory shows open dates and locks booked slots automatically.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl">
                <div className="text-xs font-mono text-neutral-500 mb-1">STEP 02</div>
                <div className="font-semibold text-white text-sm mb-2">Live Ad Copy Preview</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Sponsors write their headline, body, and link with strict character limits and instant preview.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl">
                <div className="text-xs font-mono text-emerald-400 mb-1">STEP 03</div>
                <div className="font-semibold text-white text-sm mb-2">Instant Stripe Checkout</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Payment is captured upfront. Webhooks lock the slot and send ad copy straight to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-neutral-900 py-24 bg-neutral-950">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                Workflow
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Built for independent newsletter operators.
              </h2>
              <p className="text-sm text-neutral-400 mt-2">
                No more PDF media kits, messy spreadsheets, or unpaid invoices before publication day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono text-xs text-white">
                  1
                </div>
                <h3 className="text-base font-semibold text-white">Open Your Inventory</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Add upcoming newsletter issue dates, planned topics, and slot prices inside your Creator Dashboard in seconds.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono text-xs text-white">
                  2
                </div>
                <h3 className="text-base font-semibold text-white">Share Your Booking Link</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Place your public booking link at the bottom of your emails or X bio. Interested brands can book 24/7.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono text-xs text-white">
                  3
                </div>
                <h3 className="text-base font-semibold text-white">Copy & Paste Into Your Issue</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Once paid, the sponsor&apos;s headline, body copy, and target URL appear in your dashboard ready to copy with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="border-t border-neutral-900 py-24 bg-neutral-900/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                Core Capabilities
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Everything you need to monetize.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-xl">
                <h3 className="font-semibold text-white text-base mb-2">
                  Real-Time Newsletter Preview
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Sponsors see exactly how their ad will render inside your newsletter before they check out, reducing revision requests.
                </p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-xl">
                <h3 className="font-semibold text-white text-base mb-2">
                  Automated Webhook Locking
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Powered by Stripe Webhooks and Supabase. As soon as payment clears, the slot flips to &ldquo;Booked&rdquo; to prevent double-booking.
                </p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-xl">
                <h3 className="font-semibold text-white text-base mb-2">
                  Full Inventory Control
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Create new dates, adjust pricing for special issues, manually toggle slot availability, or remove outdated slots anytime.
                </p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-xl">
                <h3 className="font-semibold text-white text-base mb-2">
                  One-Click Creative Export
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Review submitted ad creatives alongside payment records and copy formatted text directly into Substack, Beehiiv, or ConvertKit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-neutral-900 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              Ready to streamline your sponsorships?
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Explore the live storefront for <span className="text-white font-medium">The Tech Horizon</span> or sign in to the creator dashboard to manage inventory.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href="/the-tech-horizon"
                className="bg-white hover:bg-neutral-200 text-black font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Explore Live Storefront →
              </Link>
              <Link
                href="/dashboard"
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-medium px-6 py-3 rounded-lg text-sm transition-colors font-mono"
              >
                Open Creator Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8 text-xs text-neutral-500 font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} SponsorFlow. Built with Next.js, Supabase & Stripe.
          </div>
          <div className="flex gap-6">
            <Link href="/the-tech-horizon" className="hover:text-neutral-300 transition-colors">
              Demo Page
            </Link>
            <Link href="/login" className="hover:text-neutral-300 transition-colors">
              Creator Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}