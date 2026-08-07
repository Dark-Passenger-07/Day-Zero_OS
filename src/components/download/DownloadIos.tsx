import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Share, PlusSquare } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { WEB_APP_URL } from '@/config/downloads';

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
                      Launch the system Safari browser and go to <a href={WEB_APP_URL} className="text-zinc-300 underline font-medium" target="_blank" rel="noopener noreferrer">Day Zero OS</a>.
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
                      Tap the Share Button
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Find and tap the **Share** icon (represented by a square with an upward arrow) in Safari's bottom navigation bar.
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
                      Add to Home Screen
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Scroll down the share sheet options and tap **Add to Home Screen**. Name it and click **Add** in the top right.
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
          &copy; {new Date().getFullYear()} Day Zero. iPhone, iPad, Safari, and iOS are trademarks of Apple Inc., registered in the U.S. and other countries.
        </p>
      </footer>
    </div>
  );
}
