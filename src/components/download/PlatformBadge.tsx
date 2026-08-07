import { Monitor, Smartphone, Laptop, Cpu, HelpCircle } from 'lucide-react';
import type { Platform } from '@/lib/platform/device-detection';

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
  const getPlatformConfig = () => {
    switch (platform) {
      case 'Windows':
        return { label: 'Windows', icon: Monitor, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'Android':
        return { label: 'Android', icon: Smartphone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'macOS':
        return { label: 'macOS', icon: Laptop, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'iOS':
        return { label: 'iPhone / iPad', icon: Smartphone, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' };
      case 'Linux':
        return { label: 'Linux (Coming Soon)', icon: Cpu, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default:
        return { label: 'Unsupported Platform', icon: HelpCircle, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' };
    }
  };

  const config = getPlatformConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
