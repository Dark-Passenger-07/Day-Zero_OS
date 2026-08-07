import { Download, ExternalLink } from 'lucide-react';

interface InstallButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  download?: boolean | string;
  iconType?: 'download' | 'external' | 'none';
  variant?: 'primary' | 'secondary';
  ariaLabel?: string;
}

export function InstallButton({
  label,
  onClick,
  href,
  download,
  iconType = 'download',
  variant = 'primary',
  ariaLabel,
}: InstallButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

  const variantClasses =
    variant === 'primary'
      ? 'bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] active:scale-[0.98]'
      : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] border border-zinc-800 hover:border-zinc-700';

  const icon =
    iconType === 'download' ? (
      <Download className="w-4 h-4" />
    ) : iconType === 'external' ? (
      <ExternalLink className="w-4 h-4" />
    ) : null;

  if (href) {
    return (
      <a
        href={href}
        download={download}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses}`}
        aria-label={ariaLabel || label}
        target={download ? undefined : '_blank'}
        rel={download ? undefined : 'noopener noreferrer'}
      >
        {label}
        {icon}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={ariaLabel || label}
    >
      {label}
      {icon}
    </button>
  );
}
