export const categorySlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export interface CategorySeoContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
  sections: { h2: string; body: string }[];
  faqs: { q: string; a: string }[];
}

const BRAND = 'Graphic Wala';

const PRESETS: Record<string, Partial<CategorySeoContent>> = {
  'photo frame': {
    title: `Custom Photo Frames Online in India | ${BRAND}`,
    description:
      'Buy custom photo frames online in India. Upload your photo, choose a size and get a premium personalised photo frame printed in 24-48 hours with All India delivery.',
    h1: 'Custom Photo Frames Online in India',
    intro:
      'Turn any photo into a premium framed keepsake. Upload your picture, we print it on high-quality photo paper, mount it in a sturdy frame and ship it safely to your doorstep anywhere in India.',
    keywords: [
      'custom photo frame',
      'personalised photo frame online',
      'photo frame printing India',
      'photo frame with name',
      'gift photo frame',
    ],
    sections: [
      {
        h2: 'Why order a personalised photo frame from us?',
        body: 'Every frame is printed fresh after your order — no stock prints. We use fade-resistant inks, thick photo paper and shock-proof packing so the frame reaches you exactly as you designed it.',
      },
      {
        h2: 'Popular photo frame gift ideas',
        body: 'Birthday and anniversary gifts, wedding couple frames, baby milestone frames, collage frames for families and memorial frames — all printed with your own photo and text.',
      },
      {
        h2: 'Photo frame sizes and pricing',
        body: 'Frames are available in multiple sizes and finishes. Prices are shown per product below, with delivery charges calculated live from your pincode before you pay.',
      },
    ],
  },
  'id card': {
    title: `ID Card Printing Online — School & Office | ${BRAND}`,
    description:
      'Order custom ID cards online in India. School, college, staff and event ID cards printed on durable PVC with photo, logo and QR — bulk friendly, fast dispatch, All India delivery.',
    h1: 'Custom ID Card Printing Online in India',
    intro:
      'Professional identity cards for schools, colleges, offices, events and staff teams. Send us your photo, logo and details — we design, print and deliver ready-to-use cards.',
    keywords: [
      'id card printing',
      'custom id card online',
      'school id card',
      'office staff id card',
      'pvc id card India',
    ],
    sections: [
      {
        h2: 'School, college and office ID cards',
        body: 'Clean professional layouts with photo, name, designation, blood group, emergency contact and QR code. Bulk orders for institutions are welcome — share an Excel sheet and we handle the rest.',
      },
      {
        h2: 'Durable PVC printing',
        body: 'Cards are printed on waterproof PVC that survives daily use, sunlight and washing. Lanyard hole punching is available on request.',
      },
      {
        h2: 'Bulk ID card orders',
        body: 'Ordering 50+ cards? Automatic bulk discounts apply at checkout, and delivery is charged at actual courier rates for your pincode.',
      },
    ],
  },
  keychain: {
    title: `Personalised Photo Keychains Online in India | ${BRAND}`,
    description:
      'Buy custom photo keychains online in India. Print your photo, name or logo on acrylic and metal keychains — perfect gifts, printed in 24-48 hours with All India delivery.',
    h1: 'Custom Photo Keychains Online in India',
    intro:
      'Small gifts that people actually keep. Print any photo, name, quote or logo on a personalised keychain and gift it for birthdays, anniversaries, return gifts or brand promotions.',
    keywords: [
      'custom keychain',
      'photo keychain online',
      'personalised keychain India',
      'name keychain',
      'keychain gift',
    ],
    sections: [
      {
        h2: 'Photo keychains for every occasion',
        body: 'Couple keychains, birthday return gifts, car number keychains, bike keychains and corporate giveaways — all customised with your own photo or text.',
      },
      {
        h2: 'Print quality that lasts',
        body: 'High-resolution UV printing on acrylic and metal keeps colours sharp and scratch-free for years of daily use.',
      },
      {
        h2: 'Order single pieces or in bulk',
        body: 'There is no minimum order. Single keychains are welcome, and bulk orders get automatic cart discounts.',
      },
    ],
  },
  'pvc card': {
    title: `Custom PVC Card Printing Online in India | ${BRAND}`,
    description:
      'Order custom PVC cards online — waterproof, full-colour printed membership, loyalty, ID and business PVC cards with fast dispatch and All India delivery.',
    h1: 'Custom PVC Card Printing Online in India',
    intro:
      'Waterproof, long-lasting PVC cards printed in full colour on both sides. Ideal for membership cards, loyalty cards, gym cards, staff IDs and premium visiting cards.',
    keywords: [
      'pvc card printing',
      'custom pvc card online',
      'membership card printing',
      'plastic card printing India',
    ],
    sections: [
      {
        h2: 'Where PVC cards are used',
        body: 'Gyms, clinics, schools, retail loyalty programmes and startups use PVC cards because they look premium and survive years in a wallet.',
      },
      {
        h2: 'Double-sided full-colour printing',
        body: 'Both sides are printed edge to edge with your artwork, logo, QR code and contact details in crisp, waterproof colour.',
      },
      {
        h2: 'Design support included',
        body: 'No design file? Send your details on WhatsApp and our team will prepare a layout for approval before printing.',
      },
    ],
  },
  'visiting card': {
    title: `Visiting Card Printing Online in India | ${BRAND}`,
    description:
      'Design and print visiting cards online in India. Premium business card printing with your logo and details, printed in 24-48 hours and delivered across India.',
    h1: 'Visiting Card Printing Online in India',
    intro:
      'Business cards that make the right first impression. Choose a layout, send your logo and details, and receive crisp, premium visiting cards at your door.',
    keywords: [
      'visiting card printing',
      'business card online India',
      'custom visiting card',
      'visiting card design and print',
    ],
    sections: [
      {
        h2: 'Premium paper and finishes',
        body: 'Thick card stock with matte or glossy finish keeps your card looking professional long after you hand it over.',
      },
      {
        h2: 'Free design assistance',
        body: 'Share your business name, logo, phone number and address — we prepare the design and send a proof for approval before printing.',
      },
      {
        h2: 'Fast turnaround',
        body: 'Approved designs are printed within 24-48 hours and dispatched with tracked courier delivery across India.',
      },
    ],
  },
};

const findPreset = (name: string) => {
  const lower = name.toLowerCase();
  const key = Object.keys(PRESETS).find((k) => lower.includes(k));
  return key ? PRESETS[key] : undefined;
};

export const getCategorySeo = (name: string): CategorySeoContent => {
  const preset = findPreset(name) || {};
  const lower = name.toLowerCase();
  return {
    title: preset.title || `Custom ${name} Online in India | ${BRAND}`,
    description:
      preset.description ||
      `Buy custom ${lower} online in India. Personalised ${lower} printed in 24-48 hours by ${BRAND} with secure prepaid payment and All India delivery.`,
    h1: preset.h1 || `Custom ${name} Online in India`,
    intro:
      preset.intro ||
      `Personalised ${lower} printed to order and delivered to every pincode in India. Upload your photo or details and we handle the rest.`,
    keywords: preset.keywords || [`custom ${lower}`, `${lower} online India`, `personalised ${lower}`],
    sections:
      preset.sections || [
        {
          h2: `Why buy ${lower} from ${BRAND}?`,
          body: `Every ${lower} is made to order with premium materials, checked before dispatch and packed safely for transit.`,
        },
        {
          h2: 'Fast printing and delivery',
          body: 'Orders are printed within 24-48 hours and shipped with tracked courier service across India.',
        },
      ],
    faqs:
      preset.faqs || [
        {
          q: `How long does it take to get custom ${lower} delivered?`,
          a: `We print your ${lower} within 24-48 hours of design approval and deliver anywhere in India in about 3-7 days depending on your pincode.`,
        },
        {
          q: `Can I order ${lower} with my own photo or logo?`,
          a: 'Yes. Upload your photo or logo on the product page, or send it to us on WhatsApp and we will attach it to your order.',
        },
        {
          q: 'Is Cash on Delivery available?',
          a: 'No. All orders are prepaid because each item is custom-made. You can pay securely using UPI, debit card, credit card or netbanking.',
        },
        {
          q: 'Do you deliver all over India?',
          a: 'Yes, we deliver to every serviceable pincode in India with tracked courier shipping and live delivery charges shown before payment.',
        },
      ],
  };
};