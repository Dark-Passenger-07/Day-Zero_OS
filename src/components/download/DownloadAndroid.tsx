import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Info, HardDrive, Cpu, Hash } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { ReleaseNotes } from './ReleaseNotes';
import {
  ANDROID_APK_URL,
  CURRENT_VERSION,
  BUILD_NUMBER,
  APK_SIZE,
  APK_SHA256,
  ANDROID_MIN_VERSION,
  RELEASE_DATE,
} from '@/config/downloads';

export default function DownloadAndroid() {
  useEffect(() => {
    document.title = 'Download Day Zero OS APK for Android | Mobile Client';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Download Day Zero OS signed APK for Android devices. Get the official production-ready mobile package.');
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
        <span className="text-xs text-zinc-500 font-mono">Android Distribution</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center items-center my-6 gap-8">
        <DownloadCard
          platform="Android"
          title="Android Mobile Client"
          subtitle="Signed Application Package"
          description="Install the standalone Day Zero OS client directly on your Android phone or tablet. Experience high performance, secure offline database caching, and responsive swipe controls."
        >
          <div className="flex flex-col gap-4">
            <InstallButton
              label={`Download APK (${APK_SIZE})`}
              href={ANDROID_APK_URL}
              download="dayzeroos-release.apk"
              iconType="download"
              ariaLabel="Download Android Signed APK"
            />

            {/* Quick Metadata Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-left mt-4 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-zinc-500">File Size</p>
                  <p className="font-semibold text-zinc-200">{APK_SIZE}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <Info className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-zinc-500">Min. Android</p>
                  <p className="font-semibold text-zinc-200">{ANDROID_MIN_VERSION}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <Cpu className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-zinc-500">Architecture</p>
                  <p className="font-semibold text-zinc-200">arm64-v8a / universal</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <Shield className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-zinc-500">Security Scan</p>
                  <p className="font-semibold text-emerald-400">Verified Clean</p>
                </div>
              </div>
            </div>

            {/* SHA256 Signature Verification */}
            <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-left mt-1">
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1 text-[11px]">
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span>SHA256 CHECKSUM</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 break-all select-all leading-normal bg-zinc-950 p-2 rounded border border-zinc-900">
                {APK_SHA256}
              </p>
            </div>
          </div>
        </DownloadCard>

        {/* Release Notes container */}
        <div className="w-full max-w-xl">
          <ReleaseNotes
            version={CURRENT_VERSION}
            buildNumber={BUILD_NUMBER}
            releaseDate={RELEASE_DATE}
          />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center mt-12 pt-6 border-t border-zinc-900">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Day Zero. Android and Google Play are trademarks of Google LLC.
        </p>
      </footer>
    </div>
  );
}
