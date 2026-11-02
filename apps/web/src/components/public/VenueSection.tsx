import { Car, ExternalLink, Hotel as HotelIcon, MapPin, Phone, UserRound } from "lucide-react";
import type { SiteData } from "../../types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

interface VenueSectionProps {
  site: SiteData;
}

export function VenueSection({ site }: VenueSectionProps) {
  const { wedding, hotels, theme } = site;
  const address = [wedding.venueAddress, wedding.city, wedding.state, wedding.pinCode].filter(Boolean).join(", ");
  const mapUrl =
    wedding.venueMapsUrl ||
    (wedding.venueName ? `https://maps.google.com/?q=${encodeURIComponent(`${wedding.venueName} ${address}`)}` : "");

  return (
    <section className="paper grain relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-royal-primary/10 blur-3xl" />
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="The Venue"
          title={wedding.venueName ?? "Where we say I do"}
          description={wedding.venueDescription}
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <Reveal className="relative">
            <div className="relative h-full min-h-[22rem] overflow-hidden rounded-sm border border-royal-primary/30 bg-royal-deep/10">
              {wedding.venuePhotoUrl ? (
                <img
                  src={wedding.venuePhotoUrl}
                  alt={wedding.venueName ?? "Wedding venue"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full min-h-[22rem] w-full bg-[radial-gradient(circle_at_50%_40%,#e9bfc7,#b89555)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2f0e18]/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[0.5rem] uppercase tracking-[0.4em] text-[#e8cf9b]">Join us at</p>
                <h3 className="mt-2 font-display text-3xl text-[#fff8ee] sm:text-4xl">{wedding.venueName}</h3>
                <p className="mt-1 max-w-lg text-[0.72rem] font-light leading-relaxed text-[#f7e6c2]/75">{address}</p>
                {mapUrl ? (
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="btn btn-gold mt-4">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-4">
            <div className="ornate-card flex-1 p-6">
              <p className="text-[0.52rem] uppercase tracking-[0.3em] text-royal-primary">The Address</p>
              <p className="mt-3 font-display text-xl leading-snug text-royal-deep">{address}</p>
              {wedding.venueLandmark ? (
                <p className="mt-3 text-[0.76rem] font-light leading-relaxed text-royal-ink/60">
                  <span className="font-medium text-royal-ink/75">Landmark: </span>
                  {wedding.venueLandmark}
                </p>
              ) : null}
              {wedding.venueParking ? (
                <p className="mt-3 flex items-start gap-2 text-[0.76rem] font-light leading-relaxed text-royal-ink/60">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-royal-primary" />
                  {wedding.venueParking}
                </p>
              ) : null}
            </div>
            {wedding.venueContactName || wedding.venueContactPhone ? (
              <div className="ornate-card p-6">
                <p className="text-[0.52rem] uppercase tracking-[0.3em] text-royal-primary">Venue Concierge</p>
                <div className="mt-3 space-y-2 text-[0.8rem] text-royal-ink/70">
                  {wedding.venueContactName ? (
                    <p className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-royal-primary" />
                      {wedding.venueContactName}
                    </p>
                  ) : null}
                  {wedding.venueContactPhone ? (
                    <a href={`tel:${wedding.venueContactPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-royal-deep">
                      <Phone className="h-4 w-4 text-royal-primary" />
                      {wedding.venueContactPhone}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Reveal>
        </div>

        {hotels.length ? (
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-royal-primary/35 text-royal-primary">
                  <HotelIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[0.52rem] uppercase tracking-[0.3em] text-royal-primary">Stay Nearby</p>
                  <h3 className="font-display text-2xl text-royal-deep sm:text-3xl">A few of our favourite places</h3>
                </div>
              </div>
            </Reveal>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel, index) => (
                <Reveal key={hotel.id} delay={index * 0.05}>
                  <div className="lift h-full rounded-sm border border-royal-primary/25 bg-[#fbf7ef] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-xl text-royal-deep">{hotel.name}</h4>
                      {hotel.distance ? (
                        <span className="shrink-0 rounded-full bg-royal-primary/10 px-2.5 py-1 text-[0.48rem] uppercase tracking-[0.18em] text-royal-primary">
                          {hotel.distance}
                        </span>
                      ) : null}
                    </div>
                    {hotel.description ? (
                      <p className="mt-2 text-[0.75rem] font-light leading-relaxed text-royal-ink/60">{hotel.description}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[0.55rem] uppercase tracking-[0.16em] text-royal-deep">
                      {hotel.phone ? (
                        <a href={`tel:${hotel.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-royal-primary">
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                      ) : null}
                      {hotel.mapsUrl ? (
                        <a href={hotel.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-royal-primary">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Map
                        </a>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
