import type { ReactNode } from 'react';
import { PlatformBadge } from './PlatformBadge';
import type { Platform } from '@/lib/platform/device-detection';
import { CURRENT_VERSION, RELEASE_CHANNEL } from '@/config/downloads';

interface DownloadCardProps {
  platform: Platform;
  title: string;
  subtitle?: string;
  description: string;
  children?: ReactNode;
  headerAction?: ReactNode;
}

export function DownloadCard({
  platform,
  title,
  subtitle,
  description,
  children,
  headerAction,
}: DownloadCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md p-6 md:p-8 flex flex-col items-center text-center shadow-xl shadow-black/40 transition-transform duration-300">
      {/* Header Logo branding */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2 mb-4 shadow-lg shadow-white/10">
          <img src="/logo.png" alt="Day Zero OS logo" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Day Zero OS</h1>
        <p className="text-sm text-zinc-400 mt-1">BUILD • FOCUS • LAUNCH</p>
      </div>

      {/* Platform Badge */}
      <div className="flex items-center gap-2 mb-4">
        <PlatformBadge platform={platform} />
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-md">
          {RELEASE_CHANNEL}
        </span>
      </div>

      {/* Version Info */}
      <div className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
        <span>Version {CURRENT_VERSION}</span>
        <span>•</span>
        <span>Stable Build</span>
      </div>

      {/* Card Content Header */}
      <div className="mb-6 max-w-sm">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mb-2">{subtitle}</p>}
        <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
      </div>

      {/* Dynamic Children Actions / Badges */}
      <div className="w-full space-y-4 mb-6">
        {children}
      </div>

      {headerAction && (
        <div className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          {headerAction}
        </div>
      )}
    </div>
  );
}
