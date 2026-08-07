import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Share, PlusSquare, AlertTriangle } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { WEB_APP_URL, IOS_INSTALL_STEPS } from '@/config/downloads';
import logoImg from '@/logo.png';

export default function DownloadIos() {
  useEffect(() => {
    document.title = 'Install Day Zero OS on iPhone & iPad | iOS PWA Guide';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Install Day Zero OS on iOS. Add the application directly to your iPhone or iPad home screen for standalone fullscreen mobile launching.');
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
        <span className="text-xs text-zinc-500 font-mono">iOS Integration</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center items-center my-6 gap-8">
        <DownloadCard
          platform="iOS"
          title="iOS Mobile App"
          subtitle="Progressive Web Application (PWA)"
          description="Access Day Zero OS as a Progressive Web App on your iPhone or iPad. Add it directly to your Home Screen to launch it full-screen without search bars or browser tabs."
        >
          <div className="flex flex-col gap-6">
            <InstallButton
              label="Open Day Zero OS"
              href={WEB_APP_URL}
              iconType="external"
              ariaLabel="Open Day Zero OS Web Application on iOS"
            />

            {/* iOS Step-by-Step Instructions */}
            <div className="text-left border-t border-zinc-900 pt-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                iOS Installation Steps
              </h3>
              
              <div className="space-y-6">
                {IOS_INSTALL_STEPS.map((step) => {
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

        {/* iOS Browser Limitation Alert Note */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 text-left flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-400">iOS browser limitation notice</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Google Chrome and third-party browsers on iOS cannot install Progressive Web Applications (PWAs) to the Home Screen. You **must** open this page in Apple's native **Safari** browser to complete the installation.
            </p>
          </div>
        </div>

        {/* Visual iOS Mockup Placeholders */}
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              iOS Installation Mockups
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mockup 1: iOS Share Sheet */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">1. iOS Safari Share</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="aspect-[4/3] rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col p-3 text-[10px] text-zinc-400 justify-between select-none">
                {/* Safari Bottom Bar simulation */}
                <div className="flex justify-around items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                  <Compass className="w-3.5 h-3.5 opacity-40" />
                  <Share className="w-4 h-4 text-zinc-300 animate-pulse" />
                  <PlusSquare className="w-3.5 h-3.5 opacity-40" />
                </div>
                {/* Share Sheet popup simulation */}
                <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 space-y-2 shadow-2xl">
                  <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase px-1">
                    <span>Safari Options</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 flex justify-between items-center text-zinc-200">
                    <span>Add to Home Screen</span>
                    <PlusSquare className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="p-2 opacity-35">Copy Link</div>
                  <div className="p-2 opacity-35">Add to Reading List</div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Home Screen shortcut launch */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">2. Mobile Home Screen</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="aspect-[4/3] rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center p-4 select-none">
                {/* Screen Grid simulation */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <span className="w-8 h-8 rounded-2xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold">M</span>
                    <span className="text-[8px]">Messages</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-2xl bg-white p-1.5 border border-zinc-800 shadow-lg transform scale-110">
                      <img src={logoImg} alt="Day Zero OS" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[8px] font-semibold text-zinc-200">Day Zero OS</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <span className="w-8 h-8 rounded-2xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold">S</span>
                    <span className="text-[8px]">Safari</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. iPhone, iPad, Safari, and iOS are trademarks of Apple Inc., registered in the U.S. and other countries.
        </p>
      </footer>
    </div>
  );
}
