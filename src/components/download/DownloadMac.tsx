import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Share, PlusSquare } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { WEB_APP_URL } from '@/config/downloads';

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
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-400" />
                      Open Safari
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Launch Safari on your Mac and open the <a href={WEB_APP_URL} className="text-zinc-300 underline font-medium" target="_blank" rel="noopener noreferrer">Day Zero OS</a> web page.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-zinc-400" />
                      Click File / Share Icon
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Locate the **Share** button in the Safari toolbar (or select **File** in the menu bar at the top of your screen).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                      Add to Dock
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Select **Add to Dock...** from the list, name the application, and confirm to install it as a standalone app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DownloadCard>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. Safari and macOS are trademarks of Apple Inc., registered in the U.S. and other countries.
        </p>
      </footer>
    </div>
  );
}
