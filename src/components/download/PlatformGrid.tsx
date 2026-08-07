import { Link } from 'react-router-dom';
import { Monitor, Smartphone, Laptop, Cpu, Smartphone as PhoneIcon } from 'lucide-react';
import type { Platform } from '@/lib/platform/device-detection';

interface PlatformGridProps {
  excludePlatform?: Platform;
}

export function PlatformGrid({ excludePlatform }: PlatformGridProps) {
  const options = [
    {
      id: 'Windows' as Platform,
      name: 'Windows',
      method: 'Desktop Native Client',
      desc: 'Get native performance and hotkeys via Microsoft Store.',
      path: '/download/windows',
      icon: Monitor,
      status: 'Available',
      statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      btnText: 'Get Windows App',
      hoverClass: 'hover:border-blue-500/30 hover:bg-blue-500/5',
      iconClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'Android' as Platform,
      name: 'Android',
      method: 'Signed Mobile APK',
      desc: 'Download APK binary directly for manual sideloading.',
      path: '/download/android',
      icon: Smartphone,
      status: 'Available',
      statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      btnText: 'Get Android APK',
      hoverClass: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
      iconClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    },
    {
      id: 'macOS' as Platform,
      name: 'macOS',
      method: 'Desktop Web App (PWA)',
      desc: 'Install directly into Dock via Safari browser menu.',
      path: '/download/macos',
      icon: Laptop,
      status: 'PWA Support',
      statusColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
      btnText: 'Get Mac App',
      hoverClass: 'hover:border-violet-500/30 hover:bg-violet-500/5',
      iconClass: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    },
    {
      id: 'iOS' as Platform,
      name: 'iPhone / iPad',
      method: 'Mobile Web App (PWA)',
      desc: 'Add web app to Home Screen via Safari Share sheet.',
      path: '/download/ios',
      icon: PhoneIcon,
      status: 'PWA Support',
      statusColor: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
      btnText: 'Get iOS App',
      hoverClass: 'hover:border-pink-500/30 hover:bg-pink-500/5',
      iconClass: 'text-pink-400 bg-pink-500/10 border-pink-400/20',
    },
    {
      id: 'Linux' as Platform,
      name: 'Linux',
      method: 'Universal Package',
      desc: 'AppImage and Flatpak distribution formats coming soon.',
      path: '#',
      icon: Cpu,
      status: 'Coming Soon',
      statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      btnText: 'Coming Soon',
      hoverClass: 'opacity-65 cursor-not-allowed',
      iconClass: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      disabled: true,
    },
  ];

  const filteredOptions = excludePlatform
    ? options.filter((opt) => opt.id !== excludePlatform)
    : options;

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 text-center">
        Supported Platforms
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {filteredOptions.map((opt) => {
          const Icon = opt.icon;
          const CardContent = (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Header Row: Icon + Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg border ${opt.iconClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${opt.statusColor}`}>
                    {opt.status}
                  </span>
                </div>

                {/* Platform Name + Install Method */}
                <div className="text-left mb-2">
                  <h4 className="text-base font-bold text-zinc-100">{opt.name}</h4>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">{opt.method}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 text-left leading-relaxed mb-6">
                  {opt.desc}
                </p>
              </div>

              {/* Action Button */}
              <div className="w-full">
                <span className={`inline-flex w-full items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                  opt.disabled 
                    ? 'text-zinc-600 border-zinc-800 bg-zinc-950/20' 
                    : 'text-zinc-200 border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white'
                }`}>
                  {opt.btnText}
                </span>
              </div>
            </div>
          );

          if (opt.disabled) {
            return (
              <div
                key={opt.id}
                className={`p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 ${opt.hoverClass}`}
              >
                {CardContent}
              </div>
            );
          }

          return (
            <Link
              key={opt.id}
              to={opt.path}
              className={`p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 transition-all duration-200 ${opt.hoverClass} focus-visible:ring-2 focus-visible:ring-zinc-400 outline-none`}
            >
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
