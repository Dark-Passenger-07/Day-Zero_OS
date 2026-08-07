import { Link } from 'react-router-dom';
import { Monitor, Smartphone, Laptop } from 'lucide-react';
import type { Platform } from '@/lib/platform/device-detection';

interface PlatformGridProps {
  excludePlatform?: Platform;
}

export function PlatformGrid({ excludePlatform }: PlatformGridProps) {
  const options = [
    {
      id: 'Windows' as Platform,
      name: 'Windows Desktop',
      desc: 'Install native app via Microsoft Store',
      path: '/download/windows',
      icon: Monitor,
      hoverClass: 'hover:border-blue-500/30 hover:bg-blue-500/5',
      iconClass: 'text-blue-400 bg-blue-500/10',
    },
    {
      id: 'Android' as Platform,
      name: 'Android Mobile',
      desc: 'Download signed APK for direct install',
      path: '/download/android',
      icon: Smartphone,
      hoverClass: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
      iconClass: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'macOS' as Platform,
      name: 'macOS Desktop',
      desc: 'Add web application directly to Dock',
      path: '/download/macos',
      icon: Laptop,
      hoverClass: 'hover:border-violet-500/30 hover:bg-violet-500/5',
      iconClass: 'text-violet-400 bg-violet-500/10',
    },
    {
      id: 'iOS' as Platform,
      name: 'iPhone / iPad',
      desc: 'Add web app to iOS Home Screen',
      path: '/download/ios',
      icon: Smartphone,
      hoverClass: 'hover:border-pink-500/30 hover:bg-pink-500/5',
      iconClass: 'text-pink-400 bg-pink-500/10',
    },
  ];

  const filteredOptions = excludePlatform
    ? options.filter((opt) => opt.id !== excludePlatform)
    : options;

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 text-center md:text-left">
        Other Platforms
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.id}
              to={opt.path}
              className={`flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 transition-all duration-200 ${opt.hoverClass} focus-visible:ring-2 focus-visible:ring-zinc-400 outline-none`}
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${opt.iconClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-zinc-100">{opt.name}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{opt.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
