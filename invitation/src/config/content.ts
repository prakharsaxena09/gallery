/**
 * content.ts — the single editable source of truth for everything the couple
 * may want to change without touching components (ENGINEERING_SPEC §5).
 *
 * NOTE FOR THE COUPLE / EDITOR:
 *   Every value below is safe to edit. Dates, the WhatsApp number, the maps
 *   query and the venue copy are placeholders chosen to read elegantly — update
 *   them with the real details before sharing. The experience never invents
 *   information; it only renders what is configured here.
 */

export interface CoupleMember {
  readonly name: string;
  readonly fullName: string;
  /** A short editorial line shown on the "Meet the Couple" scene. */
  readonly caption: string;
}

export interface StoryMemory {
  readonly id: string;
  readonly title: string;
  readonly sentence: string;
  /** Key into the illustration set used by the Story scene. */
  readonly art: 'meeting' | 'letters' | 'rain' | 'journey' | 'promise' | 'roka';
}

export interface FamilySide {
  readonly label: string;
  readonly parents: string;
  readonly blessing: string;
}

export interface Hotspot {
  readonly id: 'stage' | 'dining' | 'pool' | 'photo';
  readonly title: string;
  readonly description: string;
  /** Position as a percentage of the venue stage (x, y from top-left). */
  readonly x: number;
  readonly y: number;
}

export interface EventDetail {
  readonly icon: 'calendar' | 'clock' | 'venue' | 'dress';
  readonly label: string;
  readonly value: string;
  readonly sub?: string;
}

export interface SiteContent {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly ogImage: string;
  };
  readonly occasion: string;
  readonly couple: {
    readonly groom: CoupleMember;
    readonly bride: CoupleMember;
    /** Monogram initials used on the wax seal and box. */
    readonly monogram: string;
  };
  readonly greeting: {
    readonly defaultGuest: string;
    readonly salutation: string;
    readonly line: string;
  };
  readonly story: readonly StoryMemory[];
  readonly families: {
    readonly groomSide: FamilySide;
    readonly brideSide: FamilySide;
  };
  readonly venue: {
    readonly name: string;
    readonly tagline: string;
    readonly hotspots: readonly Hotspot[];
  };
  readonly event: {
    readonly dateISO: string; // start, ISO 8601 with timezone offset
    readonly endISO: string;
    readonly details: readonly EventDetail[];
    readonly mapsQuery: string;
    readonly dressCode: string;
  };
  readonly rsvp: {
    /** International format, digits only, no "+". */
    readonly whatsappNumber: string;
    readonly messageTemplate: string;
    readonly shareText: string;
  };
  readonly farewell: {
    readonly message: string;
    readonly signature: string;
  };
}

export const content: SiteContent = {
  meta: {
    title: 'Prakhar ❤️ Pranjali — Roka Invitation',
    description:
      'With the blessings of our families, we invite you to the Roka of Prakhar & Pranjali — a handcrafted Lucknowi celebration.',
    ogImage: '/og/roka-og.png',
  },

  occasion: 'Roka Ceremony',

  couple: {
    groom: {
      name: 'Prakhar',
      fullName: 'Prakhar Saxena',
      caption: 'A quiet steadiness, a generous laugh, and a heart that always arrives early.',
    },
    bride: {
      name: 'Pranjali',
      fullName: 'Pranjali Jain',
      caption: 'Warmth that fills a room, a curious mind, and a kindness you never forget.',
    },
    monogram: 'PP',
  },

  greeting: {
    defaultGuest: 'Dear Guest',
    salutation: 'Dearest',
    line: 'It would mean the world to share this beginning with you.',
  },

  // Six illustrated memories (SCREEN_BOOK Scene 04).
  story: [
    {
      id: 'm1',
      title: 'The First Meeting',
      sentence: 'Two families, one evening in Lucknow — and a conversation that simply never wanted to end.',
      art: 'meeting',
    },
    {
      id: 'm2',
      title: 'Letters & Long Calls',
      sentence: 'Cities apart, they learned each other slowly — in late messages and unhurried mornings.',
      art: 'letters',
    },
    {
      id: 'm3',
      title: 'A Walk in the Rain',
      sentence: 'One borrowed umbrella, two cups of chai, and the certainty that this was something rare.',
      art: 'rain',
    },
    {
      id: 'm4',
      title: 'The Journey',
      sentence: 'Through festivals and quiet Tuesdays alike, they kept choosing the same direction.',
      art: 'journey',
    },
    {
      id: 'm5',
      title: 'The Promise',
      sentence: 'Under a rooftop sky, a question was asked the way it was always meant to be — gently.',
      art: 'promise',
    },
    {
      id: 'm6',
      title: 'The Roka',
      sentence: 'And so two stories become one, with the blessings of everyone who loves them.',
      art: 'roka',
    },
  ],

  families: {
    groomSide: {
      label: 'With love, the family of Prakhar',
      parents: 'Mr. Dharmendra Saxena\n& Late Smt. Archana Saxena',
      blessing:
        'With the cherished blessings of his beloved mother watching over us, we give our hearts to Prakhar and Pranjali. May your bond be as enduring as the marble of our courtyards and as warm as a Lucknow evening.',
    },
    brideSide: {
      label: 'With love, the family of Pranjali',
      parents: 'Mr. Alok Jain\n& Mrs. Chhavi Jain',
      blessing:
        'With joy beyond words, we welcome Prakhar into our family. May your days be gentle, your laughter plenty, and your love forever in bloom.',
    },
  },

  venue: {
    name: 'ITC Fortune Rooftop',
    tagline: 'An evening of celebration beneath the Lucknow sky',
    hotspots: [
      {
        id: 'stage',
        title: 'The Stage',
        description: 'A floral mandap in ivory and champagne where the families gather to bless the couple.',
        x: 50,
        y: 40,
      },
      {
        id: 'dining',
        title: 'Awadhi Dining',
        description: 'Slow-cooked Lucknawi flavours served under warm lantern light, late into the evening.',
        x: 22,
        y: 64,
      },
      {
        id: 'pool',
        title: 'The Poolside',
        description: 'Still water mirroring the lanterns — a quiet corner for unhurried conversation.',
        x: 76,
        y: 70,
      },
      {
        id: 'photo',
        title: 'Photo Corner',
        description: 'A mogra-draped alcove to keep tonight in a frame forever.',
        x: 82,
        y: 34,
      },
    ],
  },

  event: {
    dateISO: '2026-11-27T18:00:00+05:30',
    endISO: '2026-11-27T22:00:00+05:30',
    details: [
      { icon: 'calendar', label: 'Date', value: 'Friday, 27 November 2026' },
      { icon: 'clock', label: 'Time', value: '6:00 PM onwards', sub: 'Tea & welcome from 5:30 PM' },
      { icon: 'venue', label: 'Venue', value: 'Rooftop, ITC Fortune', sub: 'Lucknow' },
      { icon: 'dress', label: 'Dress Code', value: 'Festive Ivory & Gold', sub: 'Awadhi elegance' },
    ],
    mapsQuery: 'ITC Fortune, Lucknow',
    dressCode: 'Festive Ivory & Gold',
  },

  rsvp: {
    whatsappNumber: '910000000000', // placeholder — set the real number (country code + number)
    messageTemplate:
      "Hello! I'd love to RSVP for Prakhar & Pranjali's Roka. — ",
    shareText: 'You are invited to the Roka of Prakhar & Pranjali 💛',
  },

  farewell: {
    message: 'Thank you for becoming part of one of our most cherished memories.',
    signature: 'Prakhar & Pranjali',
  },
};
