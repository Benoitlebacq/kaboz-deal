import { Header } from "@/components/Header";

/* Icônes de marque en SVG, aux couleurs officielles des plateformes. */
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" aria-hidden className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
    </svg>
  );
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#9146FF" aria-hidden className={className}>
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-6">{children}</div>
      </main>
      <footer className="mt-6 border-t border-border">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-3 text-[12px] text-muted">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-bold text-fg">KabozDeal</span> — Bons plans
              Tech &amp; Jeux vidéo sélectionnés à la main.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.youtube.com/@KabozYT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-fg"
              >
                <YoutubeIcon className="size-4" />
                YouTube
              </a>
              <a
                href="https://www.twitch.tv/thekaboz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-fg"
              >
                <TwitchIcon className="size-4" />
                Twitch
              </a>
            </div>
          </div>
          <p className="mt-1.5 text-muted">
            Liens affiliés : une commission peut être perçue sans surcoût pour
            toi. Prix constatés à un instant donné, susceptibles d&apos;évoluer.
          </p>
        </div>
      </footer>
    </>
  );
}
