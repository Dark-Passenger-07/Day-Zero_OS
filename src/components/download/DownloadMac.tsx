import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Share, PlusSquare } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { WEB_APP_URL, MAC_INSTALL_STEPS } from '@/config/downloads';

export default function DownloadMac() {
  useEffect(() => {
    document.title = 'Install Day Zero OS on macOS | PWA Integration';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Install Day Zero OS on macOS. Add the web app directly to your Dock for standalone desktop performance.');
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
        <span className="text-xs text-zinc-500 font-mono">macOS Integration</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center items-center my-6 gap-8">
        <DownloadCard
          platform="macOS"
          title="macOS Desktop App"
          subtitle="Progressive Web Application (PWA)"
          description="Day Zero OS is distributed as a lightweight Progressive Web App on macOS. Add the application directly to your macOS Dock to run it in a dedicated window with hardware-accelerated layouts."
        >
          <div className="flex flex-col gap-6">
            <InstallButton
              label="Open Day Zero OS"
              href={WEB_APP_URL}
              iconType="external"
              ariaLabel="Open Day Zero OS Web Application"
            />

            {/* macOS Step-by-Step Instructions */}
            <div className="text-left border-t border-zinc-900 pt-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                Safari Installation Steps
              </h3>
              
              <div className="space-y-6">
                {MAC_INSTALL_STEPS.map((step) => {
                  return (
                    <div key={step.step} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                          {step.step === '1' && <Compass className="w-4 h-4 text-blue-400" />}
                          {step.step === '2' && <Share className="w-4 h-4 text-zinc-400" />}
                          {step.step === '3' && <PlusSquare className="w-4 h-4 text-emerald-400" />}
                          {step.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DownloadCard>

        {/* Visual Screenshot Mockup Placeholders */}
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Installation Mockups
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mockup 1: Safari Share Menu */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">1. Safari Share Menu</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="aspect-[4/3] rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col p-3 text-[10px] text-zinc-400 justify-between select-none">
                {/* Browser Toolbar simulation */}
                <div className="flex justify-between items-center bg-zinc-950 p-1.5 rounded border border-zinc-800">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                  <span className="font-mono text-[8px] text-zinc-600 truncate max-w-[80px]">day-zero-os.app</span>
                  <Share className="w-3 h-3 text-zinc-400 animate-pulse" />
                </div>
                {/* Dropdown Menu simulation */}
                <div className="self-end w-[110px] bg-zinc-950 border border-zinc-800 rounded p-1.5 space-y-1.5 shadow-lg shadow-black/80">
                  <div className="p-1 rounded bg-zinc-900/40 border border-zinc-800 flex justify-between items-center text-zinc-300">
                    <span>Add to Dock...</span>
                    <PlusSquare className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <div className="p-1 opacity-45">Add Bookmark...</div>
                  <div className="p-1 opacity-45">Add to Reading List</div>
                </div>
              </div>
            </div>

            {/* Mockup 2: macOS Dock app launch */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">2. macOS Dock Shortcut</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="aspect-[4/3] rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center p-4 select-none">
                {/* Dock simulation */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-850 shadow-2xl">
                  {/* System Apps */}
                  <span className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/10 flex items-center justify-center text-[10px] text-blue-400 font-bold">SF</span>
                  <span className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 font-bold">FS</span>
                  {/* Divider */}
                  <span className="w-[1px] h-6 bg-zinc-800" />
                  {/* Day Zero OS Icon in Dock */}
                  <div className="relative group flex flex-col items-center">
                    <div className="w-7 h-7 rounded-lg bg-white p-1 border border-zinc-800 shadow-md transform hover:scale-110 transition-transform">
                      <img src="/logo.png" alt="Day Zero OS" className="w-full h-full object-contain" />
                    </div>
                    {/* Active dot */}
                    <span className="w-1 h-1 rounded-full bg-white mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. Safari and macOS are trademarks of Apple Inc., registered in the U.S. and other countries.
        </p>
      </footer>
    </div>
  );
}
