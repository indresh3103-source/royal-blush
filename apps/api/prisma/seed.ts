import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const demoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../web/public");

async function imageMeta(url: string, originalName: string) {
  const relative = url.replace(/^\//, "");
  const filePath = resolve(demoRoot, relative);
  const info = await sharp(filePath).metadata();
  const file = await stat(filePath);
  return {
    storageKey: `demo/${relative.replace(/^demo\//, "")}`,
    url,
    originalName,
    mimeType: "image/webp",
    type: "IMAGE" as const,
    size: file.size,
    width: info.width ?? null,
    height: info.height ?? null,
    altText: originalName,
    caption: null
  };
}

async function main() {
  const existing = await prisma.wedding.findFirst();
  if (existing) {
    console.log("A wedding already exists. Seed skipped.");
    return;
  }

  const wedding = await prisma.wedding.create({
    data: {
      slug: "aarav-meera",
      title: "Aarav & Meera",
      tagline: "Two souls, one sacred journey",
      invitationMessage:
        "With hearts full of gratitude and joy, we invite you to share in the beginning of our forever. Come witness a love that was written in the stars and blessed by our families.",
      brideName: "Meera Rathore",
      groomName: "Aarav Singh",
      brideShortName: "Meera",
      groomShortName: "Aarav",
      coupleInitials: "A & M",
      brideIntro:
        "A collector of old poems, a lover of monsoon evenings, and the calm in every storm. Meera is the daughter of Rajendra and Sunita Rathore, and the heart of our celebration.",
      groomIntro:
        "A traveller who found home in a single smile. Aarav is the son of Vikram and Anjali Singh, and the quiet joy that brought both families together.",
      familyIntro:
        "A wedding is not only the union of two hearts, but the coming together of two families, two histories, and a lifetime of blessings. With folded hands and full hearts, our families welcome you.",
      weddingDate: "2026-12-08",
      weddingTime: "19:30",
      weddingEndTime: "23:30",
      timezone: "Asia/Kolkata",
      city: "Jaipur",
      state: "Rajasthan",
      pinCode: "302001",
      venueName: "The Rajmahal Palace",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      venueLandmark: "The rose garden entrance, beside the old fountain",
      venueParking:
        "Valet parking is available at the East Gate from 5:00 PM. Additional self-parking is available in the palace forecourt.",
      venueMapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      venueDescription:
        "An ivory palace wrapped in rose gardens, mirrored halls, and the soft glow of a thousand diyas. The Rajmahal Palace has been the setting of Jaipur's most cherished celebrations for generations.",
      venuePhotoUrl: "/demo/venue.webp",
      venueContactName: "Priya Sharma",
      venueContactPhone: "+91 98765 43210",
      familyContactName: "Raghav Rathore",
      familyContactPhone: "+91 98290 12345",
      familyContactEmail: "hello@royalblush.example",
      heroImageUrl: "/demo/hero.webp",
      bridePortraitUrl: "/demo/bride.webp",
      groomPortraitUrl: "/demo/groom.webp",
      familyPhotoUrl: "/demo/family.webp",
      brideFamilyPhotoUrl: "/demo/family.webp",
      groomFamilyPhotoUrl: "/demo/family.webp"
    }
  });

  const family = [
    ["BRIDE", "PARENT", "Father", "Rajendra Rathore", "A man of quiet strength and the first storyteller in Meera's life.", 1],
    ["BRIDE", "PARENT", "Mother", "Sunita Rathore", "The keeper of traditions, the warmth of every family gathering.", 2],
    ["BRIDE", "BROTHER", "Brother", "Kabir Rathore", "Meera's partner in mischief and her fiercest protector.", 3],
    ["BRIDE", "GRANDPARENT", "Grandmother", "Kamla Devi Rathore", "The family's living library of recipes, rituals, and blessings.", 4],
    ["GROOM", "PARENT", "Father", "Vikram Singh", "A gentleman of grace, and the one who taught Aarav how to listen.", 1],
    ["GROOM", "PARENT", "Mother", "Anjali Singh", "The soul of the Singh family, whose laughter fills every room.", 2],
    ["GROOM", "SISTER", "Sister", "Ira Singh", "Aarav's first friend, his toughest critic, and his proudest cheerleader.", 3],
    ["GROOM", "BROTHER", "Brother", "Rohan Singh", "The younger brother who keeps the family dancing and the chai flowing.", 4],
    ["GROOM", "GRANDPARENT", "Grandfather", "Devendra Singh", "The family patriarch, whose blessings begin every auspicious occasion.", 5]
  ] as const;

  for (const [side, relation, role, fullName, bio, order] of family) {
    await prisma.familyMember.create({
      data: {
        weddingId: wedding.id,
        side,
        relation,
        role,
        fullName,
        bio,
        visible: true,
        order
      }
    });
  }

  const eventData = [
    {
      name: "Tilak",
      description: "A morning of blessings as both families formally welcome the union with sacred tilak and sweets.",
      eventDate: "2026-11-20",
      startTime: "11:00",
      endTime: "13:00",
      venueName: "Singh Family Residence",
      venueAddress: "14, Civil Lines",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Civil+Lines+Jaipur",
      dressCode: "Traditional festive wear · Shades of ivory and gold",
      imageUrl: "/demo/event-engagement.webp",
      contactName: "Rohan Singh",
      contactPhone: "+91 98290 44556",
      parkingInfo: "Street parking is available along the lane.",
      order: 10
    },
    {
      name: "Engagement",
      description: "An evening of rings, roses, and promises under the stars, surrounded by the people who love us most.",
      eventDate: "2026-11-22",
      startTime: "18:30",
      endTime: "22:00",
      venueName: "The Rajmahal Palace · Rose Garden",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Cocktail Indian · Blush, champagne and emerald",
      imageUrl: "/demo/event-engagement.webp",
      contactName: "Priya Sharma",
      contactPhone: "+91 98765 43210",
      parkingInfo: "Valet parking at the palace East Gate.",
      order: 20
    },
    {
      name: "Ganesh Puja",
      description: "We begin the wedding week with a prayer to Lord Ganesh, asking for auspicious beginnings and the removal of every obstacle.",
      eventDate: "2026-12-05",
      startTime: "09:00",
      endTime: "10:30",
      venueName: "Rathore Family Residence",
      venueAddress: "7, Hathroi Fort Road",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Hathroi+Fort+Jaipur",
      dressCode: "Traditional Indian · Yellow and ivory",
      imageUrl: "/demo/event-haldi.webp",
      contactName: "Sunita Rathore",
      contactPhone: "+91 98290 11223",
      parkingInfo: "Limited parking; please carpool where possible.",
      order: 30
    },
    {
      name: "Mehendi",
      description: "Henna, laughter, and the soft scent of roses. Come find a quiet corner and let the artists adorn your hands.",
      eventDate: "2026-12-05",
      startTime: "16:00",
      endTime: "20:00",
      venueName: "The Rajmahal Palace · Courtyard",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Garden festive · Pastel pink and mint",
      imageUrl: "/demo/event-mehendi.webp",
      contactName: "Ira Singh",
      contactPhone: "+91 98290 33445",
      parkingInfo: "Valet parking at the East Gate.",
      order: 40
    },
    {
      name: "Haldi",
      description: "A sunlit morning of turmeric, marigolds, and family blessings before the sacred ceremonies begin.",
      eventDate: "2026-12-06",
      startTime: "10:00",
      endTime: "13:00",
      venueName: "Rathore Family Residence · Terrace",
      venueAddress: "7, Hathroi Fort Road",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Hathroi+Fort+Jaipur",
      dressCode: "Comfortable yellow · Bring a change of clothes",
      imageUrl: "/demo/event-haldi.webp",
      contactName: "Kabir Rathore",
      contactPhone: "+91 98290 55667",
      parkingInfo: "Street parking is available along the lane.",
      order: 50
    },
    {
      name: "Sangeet",
      description: "An evening of music, dance, and friendly rivalry between the two families. Comfortable shoes are strongly encouraged.",
      eventDate: "2026-12-06",
      startTime: "19:30",
      endTime: "23:30",
      venueName: "The Rajmahal Palace · Durbar Hall",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Black tie with an Indian soul",
      imageUrl: "/demo/event-reception.webp",
      contactName: "Rohan Singh",
      contactPhone: "+91 98290 44556",
      parkingInfo: "Valet parking at the East Gate.",
      order: 60
    },
    {
      name: "Baraat",
      description: "The groom's procession arrives with dhol, dancing, and a little too much joy. Join us at the palace gates.",
      eventDate: "2026-12-08",
      startTime: "17:00",
      endTime: "19:00",
      venueName: "The Rajmahal Palace · East Gate",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Festive Indian · Jewel tones",
      imageUrl: "/demo/gallery-07.webp",
      contactName: "Priya Sharma",
      contactPhone: "+91 98765 43210",
      parkingInfo: "The East Gate will be closed to private cars during the baraat. Please use the West Gate.",
      order: 70
    },
    {
      name: "Jaimala",
      description: "The first garlands, the first glance as husband and wife, and the moment the whole palace holds its breath.",
      eventDate: "2026-12-08",
      startTime: "19:30",
      endTime: "20:15",
      venueName: "The Rajmahal Palace · Mandap Lawn",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Traditional Indian · Ivory, blush and gold",
      imageUrl: "/demo/event-jaimala.webp",
      contactName: "Priya Sharma",
      contactPhone: "+91 98765 43210",
      parkingInfo: "Valet parking at the West Gate.",
      order: 80
    },
    {
      name: "Vivah Sanskar",
      description: "The sacred ceremony, the seven vows, and the beginning of a lifetime. Please join us at the mandap as we take our pheras.",
      eventDate: "2026-12-08",
      startTime: "21:00",
      endTime: "23:30",
      venueName: "The Rajmahal Palace · Mandap Lawn",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Traditional Indian · Ivory, blush and gold",
      imageUrl: "/demo/event-vivah.webp",
      contactName: "Priya Sharma",
      contactPhone: "+91 98765 43210",
      parkingInfo: "Valet parking at the West Gate.",
      order: 90
    },
    {
      name: "Saat Phere",
      description: "Seven rounds around the sacred fire, seven promises for a lifetime, and one shared journey ahead.",
      eventDate: "2026-12-08",
      startTime: "22:30",
      endTime: "23:30",
      venueName: "The Rajmahal Palace · Mandap Lawn",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Traditional Indian · Ivory, blush and gold",
      imageUrl: "/demo/event-vivah.webp",
      contactName: "Priya Sharma",
      contactPhone: "+91 98765 43210",
      parkingInfo: "Valet parking at the West Gate.",
      order: 100
    },
    {
      name: "Reception",
      description: "A relaxed evening of dinner, dancing, and one last celebration before we begin our new life together.",
      eventDate: "2026-12-09",
      startTime: "19:00",
      endTime: "23:00",
      venueName: "The Rajmahal Palace · Mirror Hall",
      venueAddress: "Sardar Patel Marg, Ashok Nagar",
      city: "Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajmahal+Palace+Jaipur",
      dressCode: "Cocktail · Champagne and deep maroon",
      imageUrl: "/demo/event-reception.webp",
      contactName: "Ira Singh",
      contactPhone: "+91 98290 33445",
      parkingInfo: "Valet parking at the East Gate.",
      order: 110
    }
  ];

  const events = [];
  for (const event of eventData) {
    events.push(await prisma.weddingEvent.create({ data: { ...event, weddingId: wedding.id } }));
  }
  const vivah = events.find((event) => event.name === "Vivah Sanskar");

  const ritualData = [
    ["Ganesh Puja", "An invocation to Lord Ganesh for an auspicious beginning.", "2026-12-05", "09:00", "ganesh", 10, true],
    ["Kanyadaan", "The bride's family entrusts her hand to the groom with love and blessings.", "2026-12-08", "21:15", "kanyadaan", 20, true],
    ["Varmala", "The exchange of garlands, the first promise of the ceremony.", "2026-12-08", "19:30", "varmala", 30, true],
    ["Havan", "Sacred offerings to the fire, surrounded by the sound of mantras.", "2026-12-08", "21:45", "havan", 40, true],
    ["Saat Phere", "Seven rounds, seven vows, one sacred journey.", "2026-12-08", "22:30", "phere", 50, true],
    ["Sindoor", "The vermilion mark of a new beginning.", "2026-12-08", "23:10", "sindoor", 60, true],
    ["Mangalsutra", "The sacred thread that binds two lives into one.", "2026-12-08", "23:20", "mangalsutra", 70, true],
    ["Ashirwad", "The final blessings of our elders as we step into our future.", "2026-12-08", "23:30", "ashirwad", 80, true]
  ] as const;

  for (const [name, description, ritualDate, ritualTime, icon, order, visible] of ritualData) {
    await prisma.weddingRitual.create({
      data: { weddingId: wedding.id, name, description, ritualDate, ritualTime, icon, order, visible }
    });
  }

  const sectionData = [
    ["opening", "Opening Curtains", 10, true],
    ["hero", "The Invitation", 20, true],
    ["ganesh", "Ganesh Vandana", 30, true],
    ["bride", "The Bride", 40, true],
    ["groom", "The Groom", 50, true],
    ["family", "Our Families", 60, true],
    ["story", "Our Story", 70, true],
    ["countdown", "The Countdown", 80, true],
    ["events", "Wedding Events", 90, true],
    ["vivah", "Vivah Sanskar", 100, true],
    ["venue", "The Venue", 110, true],
    ["gallery", "Gallery", 120, true],
    ["music", "Music", 130, true],
    ["rsvp", "RSVP", 140, true],
    ["blessing", "Blessing", 150, true]
  ] as const;

  for (const [key, label, order, visible] of sectionData) {
    await prisma.invitationSection.create({ data: { weddingId: wedding.id, key, label, order, visible } });
  }

  const storyMoments = [
    {
      title: "The First Hello",
      momentDate: "2023-02-14",
      description:
        "A crowded bookshop in Jaipur, one last copy of a Rumi collection, and a conversation that refused to end. We stayed until the lights came on.",
      imageUrl: "/demo/story-01.webp",
      order: 10
    },
    {
      title: "The First Journey",
      momentDate: "2023-11-10",
      description:
        "Three trains, two cities, and one shared playlist. Somewhere between Jaipur and Udaipur, we stopped being two separate stories.",
      imageUrl: "/demo/story-02.webp",
      order: 20
    },
    {
      title: "A Question, A Promise",
      momentDate: "2025-12-20",
      description:
        "Under a sky full of winter stars, Aarav asked a question he had been carrying for months. Meera said yes before he finished the sentence.",
      imageUrl: "/demo/gallery-07.webp",
      order: 30
    },
    {
      title: "Mehendi, Laughter, Home",
      momentDate: "2026-12-05",
      description:
        "The house filled with henna, marigolds, and the sound of our families becoming one. It was the first time forever felt close enough to touch.",
      imageUrl: "/demo/story-03.webp",
      order: 40
    },
    {
      title: "Forever Begins",
      momentDate: "2026-12-08",
      description:
        "Seven vows, one sacred fire, and every person we love in one place. This is the chapter we have been writing toward all along.",
      imageUrl: "/demo/gallery-01.webp",
      order: 50
    }
  ];

  for (const moment of storyMoments) {
    await prisma.storyMoment.create({ data: { ...moment, weddingId: wedding.id, visible: true } });
  }

  await prisma.themeSettings.create({
    data: {
      weddingId: wedding.id,
      preset: "royal-blush",
      primaryColor: "#B89555",
      accentColor: "#E9BFC7",
      backgroundColor: "#F5EBDD",
      deepColor: "#762F43",
      textColor: "#49372F",
      headingFont: "Cormorant Garamond",
      bodyFont: "Poppins",
      curtainStyle: "blush-velvet",
      ornamentStyle: "classic",
      animationIntensity: "balanced",
      showMandala: true,
      showFlorals: true,
      galleryLayout: "editorial"
    }
  });

  const settings = await prisma.invitationSettings.create({
    data: {
      weddingId: wedding.id,
      introEnabled: true,
      rsvpEnabled: true,
      rsvpRequirePhone: false,
      rsvpAllowGuestCount: true,
      rsvpMaxGuests: 8,
      rsvpClosingDate: "2026-12-01",
      rsvpTitle: "Will You Join Us?",
      rsvpDescription:
        "Your presence would make our celebration complete. Kindly respond by 1 December 2026 so we can welcome you the way you deserve.",
      rsvpSuccessMessage:
        "Thank you for responding. Your presence and blessings mean a lot to us! We cannot wait to celebrate with you in Jaipur.",
      rsvpDeclineMessage:
        "We will miss you dearly. Thank you for letting us know, and for sending your love and blessings across the miles.",
      notifyOnRsvp: false,
      countdownEventId: vivah?.id ?? null,
      musicEnabled: true,
      defaultVolume: 38,
      vivahTitle: "Vivah Sanskar",
      vivahMuhurat: "8 December 2026 · 9:00 PM – 12:30 AM",
      vivahDate: "2026-12-08",
      vivahTime: "21:00",
      vivahDescription:
        "Under a mandap of marigolds and moonlight, we will take our seven vows. Please join us for the sacred ceremony and stay for the blessings that follow.",
      vivahImageUrl: "/demo/event-vivah.webp",
      shareMessage:
        "Aarav and Meera invite you to their wedding in Jaipur. Your presence and blessings would mean the world to us."
    }
  });

  const hotels = [
    ["Rambagh Palace", "A Taj palace hotel set in 47 acres of Mughal gardens, ten minutes from the venue.", "3.2 km", "+91 141 221 1919", "https://maps.google.com/?q=Rambagh+Palace+Jaipur"],
    ["Samode Haveli", "A restored 18th-century haveli with hand-painted frescoes and a tranquil courtyard pool.", "2.1 km", "+91 141 263 2407", "https://maps.google.com/?q=Samode+Haveli+Jaipur"],
    ["Alsisar Haveli", "A heritage home with warm Jaipur hospitality, close to the old city and the venue.", "1.4 km", "+91 141 236 8290", "https://maps.google.com/?q=Alsisar+Haveli+Jaipur"]
  ] as const;

  for (let index = 0; index < hotels.length; index += 1) {
    const [name, description, distance, phone, mapsUrl] = hotels[index]!;
    await prisma.nearbyHotel.create({
      data: { weddingId: wedding.id, name, description, distance, phone, mapsUrl, visible: true, order: index }
    });
  }

  const mediaSpecs = [
    ["/demo/hero.webp", "The couple beneath the rose arch"],
    ["/demo/venue.webp", "The Rajmahal Palace gardens"],
    ["/demo/bride.webp", "Meera in her wedding lehenga"],
    ["/demo/groom.webp", "Aarav in his sherwani"],
    ["/demo/family.webp", "Our families together"],
    ["/demo/gallery-01.webp", "A quiet moment before the ceremony"],
    ["/demo/gallery-02.webp", "Holding hands"],
    ["/demo/gallery-03.webp", "The jaimala"],
    ["/demo/gallery-04.webp", "Mehendi details"],
    ["/demo/gallery-05.webp", "Haldi morning"],
    ["/demo/gallery-06.webp", "The bride's mehendi"],
    ["/demo/gallery-07.webp", "A palace celebration"],
    ["/demo/gallery-08.webp", "Blessings in the mandap"],
    ["/demo/event-mehendi.webp", "Mehendi evening"],
    ["/demo/event-haldi.webp", "Haldi ceremony"],
    ["/demo/event-jaimala.webp", "Jaimala"],
    ["/demo/event-vivah.webp", "Vivah Sanskar"],
    ["/demo/event-reception.webp", "Reception"],
    ["/demo/event-engagement.webp", "Engagement"],
    ["/demo/music-cover.webp", "Music cover"],
    ["/demo/story-01.webp", "Our first memory"],
    ["/demo/story-02.webp", "The engagement"],
    ["/demo/story-03.webp", "Mehendi celebrations"]
  ] as const;

  const mediaByUrl = new Map<string, string>();
  for (const [url, name] of mediaSpecs) {
    const meta = await imageMeta(url, name);
    const media = await prisma.mediaAsset.create({ data: { ...meta, weddingId: wedding.id } });
    mediaByUrl.set(url, media.id);
  }

  const galleryData = [
    ["/demo/gallery-01.webp", "couple", "A quiet moment before the ceremony", 10],
    ["/demo/gallery-02.webp", "couple", "Holding hands, and every promise", 20],
    ["/demo/gallery-03.webp", "wedding", "The first garland", 30],
    ["/demo/gallery-04.webp", "bride", "Mehendi, in bloom", 40],
    ["/demo/gallery-05.webp", "wedding", "A haldi morning", 50],
    ["/demo/gallery-06.webp", "bride", "The bride's hands", 60],
    ["/demo/gallery-07.webp", "engagement", "The beginning of forever", 70],
    ["/demo/gallery-08.webp", "family", "Blessings in the mandap", 80]
  ] as const;

  for (const [url, section, caption, order] of galleryData) {
    const mediaId = mediaByUrl.get(url);
    if (!mediaId) continue;
    await prisma.galleryImage.create({
      data: { weddingId: wedding.id, mediaId, section, caption, altText: caption, visible: true, order }
    });
  }

  const audioPath = resolve(demoRoot, "demo/royal-blush-theme.wav");
  const audioStat = await stat(audioPath);
  const audioMedia = await prisma.mediaAsset.create({
    data: {
      weddingId: wedding.id,
      storageKey: "demo/royal-blush-theme.wav",
      url: "/demo/royal-blush-theme.wav",
      originalName: "A Soft Promise — original instrumental",
      mimeType: "audio/wav",
      type: "AUDIO",
      size: audioStat.size,
      altText: "Soft shehnai, santoor and tanpura instrumental",
      caption: "An original instrumental created for Royal Blush"
    }
  });

  const track = await prisma.musicTrack.create({
    data: {
      weddingId: wedding.id,
      mediaId: audioMedia.id,
      title: "A Soft Promise",
      artist: "Original Royal Blush Ensemble",
      coverUrl: "/demo/music-cover.webp",
      visible: true,
      order: 0
    }
  });

  await prisma.invitationSettings.update({
    where: { id: settings.id },
    data: { activeMusicTrackId: track.id }
  });

  console.log(`Seeded ${wedding.title} with ${events.length} events, ${family.length} family members, and ${mediaSpecs.length + 1} media assets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
