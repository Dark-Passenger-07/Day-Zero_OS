import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DeviceRecommendation } from './DeviceRecommendation';

export default function DownloadHome() {
  useEffect(() => {
    document.title = 'Download Day Zero OS | Cross-Platform App';
    
    // Update SEO meta tags dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Download Day Zero OS for Windows, Android, macOS, and iOS. Get the latest release builds and install the standalone client.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top utility navigation */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 rounded outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
        <span className="text-xs text-zinc-500 font-mono">Day Zero OS Project</span>
      </header>

      {/* Main recommendation widget container */}
      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center items-center my-6">
        <div className="w-full text-center max-w-2xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Day Zero OS
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Download for your device
          </h1>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
            Choose the best installation method for your platform.
          </p>
        </div>

        <DeviceRecommendation />
      </main>

      {/* Footer copyright */}
      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. All rights reserved. Microsoft Store and Apple Dock are trademarks of their respective owners.
        </p>
      </footer>
    </div>
  );
}
