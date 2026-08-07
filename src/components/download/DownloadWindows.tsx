import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { WINDOWS_STORE_URL, WINDOWS_SYSTEM_REQUIREMENTS, WINDOWS_BENEFITS } from '@/config/downloads';

export default function DownloadWindows() {
  useEffect(() => {
    document.title = 'Download Day Zero OS for Windows | Microsoft Store';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Install Day Zero OS on Windows. Get the desktop client directly from the Microsoft Store for automated background updates.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <Link
          to="/download"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 rounded outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          All Platforms
        </Link>
        <span className="text-xs text-zinc-500 font-mono">Windows Installation</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center items-center my-6">
        <DownloadCard
          platform="Windows"
          title="Windows Desktop Client"
          subtitle="Native Desktop Application"
          description="Day Zero OS is fully packaged for Windows 10 and 11. Enjoy hardware acceleration, offline database sync, and taskbar integration by installing the application via the Microsoft Store."
          headerAction={
            <Link to="/download" className="underline hover:text-zinc-100 transition-colors">
              Choose another device instead
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-4 mt-2">
            {/* Custom SVG Microsoft Store Badge Link */}
            <a
              href={WINDOWS_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-lg border border-zinc-700 bg-black hover:bg-zinc-900 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-zinc-400 outline-none hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Get Day Zero OS from Microsoft Store"
            >
              {/* Microsoft Logo Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="10.5" height="10.5" fill="#F25022"/>
                <rect x="12.5" width="10.5" height="10.5" fill="#7FBA00"/>
                <rect y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
              </svg>
              <div className="text-left leading-none">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Get it from</p>
                <p className="text-sm font-semibold text-white mt-1">Microsoft Store</p>
              </div>
            </a>

            <div className="w-full flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                Automatic Updates
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                Secure Installation
              </span>
            </div>
          </div>
        </DownloadCard>

        {/* Windows Benefits & Specs */}
        <div className="w-full max-w-xl space-y-6 mt-8">
          {/* Benefits Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 md:p-6 text-left space-y-4">
            <h3 className="text-base font-semibold text-zinc-200">Installation Benefits</h3>
            <div className="grid grid-cols-1 gap-4">
              {WINDOWS_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">{benefit.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 md:p-6 text-left">
            <h3 className="text-base font-semibold text-zinc-200 mb-4">System Requirements</h3>
            <div className="space-y-2 text-xs">
              {WINDOWS_SYSTEM_REQUIREMENTS.map((req, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-zinc-900 last:border-0">
                  <span className="text-zinc-500 font-medium">{req.label}</span>
                  <span className="text-zinc-300 font-semibold text-right">{req.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. Microsoft and Windows are trademarks of the Microsoft group of companies.
        </p>
      </footer>
    </div>
  );
}
