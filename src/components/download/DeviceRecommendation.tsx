import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDevicePlatform, type Platform } from '@/lib/platform/device-detection';
import { DownloadCard } from './DownloadCard';
import { InstallButton } from './InstallButton';
import { PlatformGrid } from './PlatformGrid';
import { WINDOWS_STORE_URL, ANDROID_APK_URL } from '@/config/downloads';

interface DeviceRecommendationProps {
  onPlatformDetected?: (platform: Platform) => void;
}

export function DeviceRecommendation({ onPlatformDetected }: DeviceRecommendationProps) {
  const [platform, setPlatform] = useState<Platform>('Unknown');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = getDevicePlatform();
    setPlatform(detected);
    setMounted(true);
    if (onPlatformDetected) {
      onPlatformDetected(detected);
    }
  }, [onPlatformDetected]);

  if (!mounted) {
    return (
      <div className="w-full max-w-xl mx-auto h-[400px] flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-md">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin" />
      </div>
    );
  }

  // Handle Unknown / Linux directly by showing the manual selection grid
  if (platform === 'Unknown' || platform === 'Linux') {
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-3">
            Choose Your Platform
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We couldn't automatically verify your device layout. Please choose your platform manually below to get started with Day Zero OS.
          </p>
        </div>
        <PlatformGrid />
      </div>
    );
  }

  // Define details for recommended platforms
  const getRecommendationDetails = () => {
    switch (platform) {
      case 'Windows':
        return {
          title: 'Install Day Zero OS for Windows',
          description: 'Get the native Windows app from the official Microsoft Store for secure installation, automatic updates, and full system integration.',
          label: 'Install from Microsoft Store',
          href: WINDOWS_STORE_URL,
          iconType: 'external' as const,
          actionPath: '/download/windows',
          actionText: 'View Windows Manual Install Guides',
        };
      case 'Android':
        return {
          title: 'Install Day Zero OS for Android',
          description: 'Download the production-ready signed APK directly to your device for an optimized mobile experience with push alerts and safe-area notch layout.',
          label: 'Download APK',
          href: ANDROID_APK_URL,
          download: 'dayzeroos-release.apk',
          iconType: 'download' as const,
          actionPath: '/download/android',
          actionText: 'View APK Details & Release Notes',
        };
      case 'macOS':
        return {
          title: 'Add Day Zero OS to macOS Dock',
          description: 'Day Zero OS runs as a highly optimized Progressive Web App (PWA) on macOS. Launch it, add it to your Dock, and run it as a standalone desktop utility.',
          label: 'Open Web Application',
          actionPath: '/download/macos',
          actionText: 'View step-by-step macOS PWA Guide',
        };
      case 'iOS':
        return {
          title: 'Install Day Zero OS on iOS',
          description: 'Access Day Zero OS as a Progressive Web App on iPhone and iPad. Save it directly to your home screen for full-screen view and quick launching.',
          label: 'Open Web Application',
          actionPath: '/download/ios',
          actionText: 'View step-by-step iOS PWA Guide',
        };
      default:
        throw new Error('Unreachable platform state');
    }
  };

  const details = getRecommendationDetails();

  return (
    <div className="w-full space-y-12 animate-fade-in">
      <div className="text-center">
        <span className="text-[10px] tracking-widest font-bold text-zinc-500 uppercase">
          Recommended for you
        </span>
      </div>

      <DownloadCard
        platform={platform}
        title={details.title}
        description={details.description}
        headerAction={
          <Link to={details.actionPath} className="underline hover:text-zinc-100 transition-colors">
            {details.actionText}
          </Link>
        }
      >
        <div className="flex flex-col gap-3">
          {details.href ? (
            <InstallButton
              label={details.label}
              href={details.href}
              download={details.download}
              iconType={details.iconType}
              ariaLabel={`${details.label} for ${platform}`}
            />
          ) : (
            <Link to={details.actionPath} className="w-full">
              <InstallButton
                label={details.label}
                iconType="external"
                ariaLabel={`Open installation guide for ${platform}`}
              />
            </Link>
          )}
        </div>
      </DownloadCard>

      <div className="pt-4">
        <PlatformGrid excludePlatform={platform} />
      </div>
    </div>
  );
}
