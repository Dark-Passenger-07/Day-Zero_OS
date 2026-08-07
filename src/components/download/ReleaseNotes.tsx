import { FileText, CheckCircle2 } from 'lucide-react';

interface ReleaseNotesProps {
  version: string;
  buildNumber: string;
  releaseDate: string;
}

export function ReleaseNotes({ version, buildNumber, releaseDate }: ReleaseNotesProps) {
  const notes = [
    'Complete support for native Android via Capacitor integration.',
    'Redesigned high-fidelity launch splash screen and adaptive app icon.',
    'Optimized layout grid to fully respect safe-area notches and status bars.',
    'Smart deep-link routing for login verification and password reset callbacks.',
    'Dynamic offline connectivity checker with standalone recovery layouts.',
    'Performance enhancements for low-end devices and minor UI alignment tweaks.',
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 md:p-6 text-left">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-zinc-400" />
        <h3 className="text-base font-semibold text-zinc-100">
          Release Notes (v{version} - #{buildNumber})
        </h3>
      </div>
      
      <p className="text-xs text-zinc-400 mb-4">
        Released on <time dateTime={releaseDate}>{releaseDate}</time>
      </p>

      <ul className="space-y-3">
        {notes.map((note, index) => (
          <li key={index} className="flex gap-2.5 items-start text-sm text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
