import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Info, HardDrive, Cpu, Hash, ChevronDown, CheckCircle } from 'lucide-react';
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
  ANDROID_SYSTEM_REQUIREMENTS,
  ANDROID_PERMISSIONS,
  ANDROID_INSTALL_STEPS,
  ANDROID_FAQ,
} from '@/config/downloads';

export default function DownloadAndroid() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Download Day Zero OS APK for Android | Mobile Client';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Download Day Zero OS signed APK for Android devices. Get the official production-ready mobile package.');
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
        {/* Main APK Download Card */}
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

        {/* Security & Certificate Notice */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left flex gap-4">
          <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-300">Signed Official Release</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              This APK is cryptographically signed with the official Day Zero OS production keystore certificate (Alias: `dayzeroos`). Sideloading this package is safe, secure, and guarantees you are running official untampered code.
            </p>
          </div>
        </div>

        {/* Step-by-Step Sideloading Instructions */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 text-left">
          <h3 className="text-base font-bold text-zinc-200 mb-4">How to Install (Sideloading)</h3>
          <div className="space-y-4">
            {ANDROID_INSTALL_STEPS.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">{step.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Required */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 text-left">
          <h3 className="text-base font-bold text-zinc-200 mb-4">Required Permissions</h3>
          <div className="space-y-3">
            {ANDROID_PERMISSIONS.map((perm) => (
              <div key={perm.name} className="flex gap-3 items-start">
                <div className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">{perm.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{perm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 text-left">
          <h3 className="text-base font-bold text-zinc-200 mb-4">Device System Specifications</h3>
          <div className="space-y-2 text-xs">
            {ANDROID_SYSTEM_REQUIREMENTS.map((req) => (
              <div key={req.label} className="flex justify-between py-2 border-b border-zinc-900 last:border-0">
                <span className="text-zinc-500 font-medium">{req.label}</span>
                <span className="text-zinc-300 font-semibold">{req.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Release Notes */}
        <div className="w-full max-w-xl">
          <ReleaseNotes
            version={CURRENT_VERSION}
            buildNumber={BUILD_NUMBER}
            releaseDate={RELEASE_DATE}
          />
        </div>

        {/* FAQ Accordion */}
        <div className="w-full max-w-xl p-5 md:p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 text-left">
          <h3 className="text-base font-bold text-zinc-200 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {ANDROID_FAQ.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="border-b border-zinc-900 last:border-0 pb-3 last:pb-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-2 text-sm text-zinc-200 hover:text-zinc-100 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
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
