import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Ganesh } from "../components/decor/Ganesh";
import { Mandala } from "../components/decor/Mandala";
import { OrnamentDivider } from "../components/decor/Ornament";

interface Credit {
  files: string[];
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

const credits: Credit[] = [
  {
    files: ["hero.webp", "gallery-01.webp", "event-vivah.webp"],
    title: "Indian Wedding",
    author: "Jatin khurma",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Indian_Wedding.jpg"
  },
  {
    files: ["bride.webp", "groom.webp", "gallery-07.webp", "event-engagement.webp", "story-02.webp"],
    title: "Bride and Groom During Pair Pujan Rasam",
    author: "The open draft",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Bride_and_Groom_During_Pair_Pujan_Rasam.jpg"
  },
  {
    files: ["family.webp", "event-reception.webp"],
    title: "Indian couple in wedding",
    author: "Swapppp57",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Indian_couple_in_wedding.jpg"
  },
  {
    files: ["gallery-02.webp", "music-cover.webp", "story-01.webp"],
    title: "Indian Wedding Couple (Unsplash)",
    author: "Pablo Heimplatz",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "https://commons.wikimedia.org/wiki/File:Indian_Wedding_Couple_(Unsplash).jpg"
  },
  {
    files: ["gallery-03.webp", "event-jaimala.webp"],
    title: "Indian malayali couples exchanging garlands",
    author: "Kannanshanmugam",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    source: "https://commons.wikimedia.org/wiki/File:Indian_malayali_couples_exchanging_garlands.JPG"
  },
  {
    files: ["gallery-04.webp", "event-mehendi.webp", "story-03.webp"],
    title: "Bridal Mehndi",
    author: "Iramuthusamy",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    source: "https://commons.wikimedia.org/wiki/File:Bridal_Mehndi.JPG"
  },
  {
    files: ["gallery-05.webp", "event-haldi.webp"],
    title: "Raw turmeric paste for haldi ceremony in Indian wedding",
    author: "Debapriya Manna",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://commons.wikimedia.org/wiki/File:Raw_turmeric_paste_for_haldi_ceremony_in_Indian_wedding.jpg"
  },
  {
    files: ["gallery-06.webp"],
    title: "Indian Mehndi Culture (1) 01",
    author: "AmanAgrahari01",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Indian_Mehndi_Culture_(1)_01.jpg"
  },
  {
    files: ["gallery-08.webp"],
    title: "DSC 1491 Indian cultural wedding PAIR PUJAYI ceremony new married couple",
    author: "Ravi Gupta",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://commons.wikimedia.org/wiki/File:DSC_1491_Indian_cultural_wedding_PAIR_PUJAYI_ceremony_new_married_couple.jpg"
  },
  {
    files: ["venue.webp"],
    title: "Raj Mahal Jaipur 2019 (1)",
    author: "Gryffindor",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: "https://commons.wikimedia.org/wiki/File:Raj_Mahal_Jaipur_2019_(1).jpg"
  }
];

const modifications = "Cropped, resized, and converted to WebP for this demo.";

export function CreditsPage() {
  return (
    <div className="paper grain min-h-screen">
      <header className="relative overflow-hidden border-b border-royal-primary/20 py-14 text-center">
        <Mandala className="pointer-events-none absolute -left-36 -top-36 h-[28rem] w-[28rem] text-royal-primary/[0.08]" />
        <Mandala className="pointer-events-none absolute -right-32 -top-24 h-[22rem] w-[22rem] text-royal-primary/[0.06]" />
        <div className="container-rb relative">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-royal-deep/70 transition hover:text-royal-deep"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the invitation
          </Link>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-royal-primary/50 bg-white/40 text-royal-deep/80">
            <Ganesh className="h-11 w-11" />
          </div>
          <p className="kicker mt-6">With gratitude</p>
          <h1 className="section-title mt-3">Credits &amp; Attributions</h1>
          <OrnamentDivider className="mt-5" />
          <p className="lede mx-auto mt-5 max-w-2xl">
            Royal Blush is a demonstration project. The photographs below are used under their respective
            Creative Commons licences. Replace them with your own photographs before publishing a real
            invitation.
          </p>
        </div>
      </header>

      <main className="container-rb py-16">
        <div className="ornate-card overflow-hidden bg-white/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-royal-primary/25 text-[0.58rem] uppercase tracking-[0.22em] text-royal-deep/70">
                  <th className="px-5 py-4 font-medium">Demo files</th>
                  <th className="px-5 py-4 font-medium">Work</th>
                  <th className="px-5 py-4 font-medium">Author</th>
                  <th className="px-5 py-4 font-medium">Licence</th>
                  <th className="px-5 py-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((credit) => (
                  <tr key={credit.source} className="border-b border-royal-primary/10 align-top last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {credit.files.map((file) => (
                          <span
                            key={file}
                            className="rounded-full border border-royal-primary/15 bg-white/70 px-2.5 py-1 font-mono text-[0.62rem] leading-none text-royal-ink/70"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-display text-base leading-snug text-royal-deep">{credit.title}</p>
                      <p className="mt-1 text-[0.68rem] leading-relaxed text-royal-ink/55">{modifications}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-royal-ink/75">{credit.author}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <a
                        href={credit.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-royal-deep underline decoration-royal-primary/40 underline-offset-4 transition hover:decoration-royal-primary"
                      >
                        {credit.license}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <a
                        href={credit.source}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[0.7rem] text-royal-deep/70 underline decoration-royal-primary/30 underline-offset-4 transition hover:text-royal-deep"
                      >
                        Wikimedia Commons
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-5 text-center text-[0.78rem] font-light leading-relaxed text-royal-ink/60">
          <p>
            CC BY-SA 4.0 and CC BY-SA 3.0 require attribution and share-alike distribution of adapted
            material. The demo photographs are adapted by cropping and conversion; if you redistribute them,
            keep this page and the accompanying <span className="font-mono text-[0.72rem]">CREDITS.md</span>{" "}
            intact.
          </p>
          <p>
            The ambient music track was generated for this demo and is free of third-party rights. Interface
            ornaments, mandalas, and illustrations are original vector artwork created for Royal Blush.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="btn btn-deep">
            Return to the invitation
          </Link>
        </div>
      </main>
    </div>
  );
}
