export interface BlogSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: 'Graphic Design' | 'Printing Guides' | 'Branding';
  author: string;
  authorRole: string;
  date: string;
  readMinutes: number;
  intro: string;
  sections: BlogSection[];
  takeaway: string;
}

export const BLOG_CATEGORIES = ['All', 'Graphic Design', 'Printing Guides', 'Branding'] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: 'printing-quality-guide-gsm-paper-and-colour-modes',
    title: 'The Complete Printing Quality Guide: GSM, Paper Stocks and Colour Modes Explained',
    description:
      'Understand GSM paper weights, lamination options, CMYK vs RGB colour modes, bleed and DPI so every print job you order comes out exactly as you imagined.',
    category: 'Printing Guides',
    author: 'Md Sarfaraz',
    authorRole: 'Production Head, Graphicwala',
    date: '2026-07-18',
    readMinutes: 9,
    intro:
      'Most print disappointments do not happen at the press — they happen in the file. A photo that looks vivid on a phone screen can print dull, a logo that looks sharp in a presentation can print with jagged edges, and a visiting card that felt premium in the mockup can feel flimsy in hand. This guide walks through the three variables that decide print quality: paper weight (GSM), colour mode, and resolution, along with the finishing choices we use every day in our Katihar studio.',
    sections: [
      {
        heading: 'What GSM actually means, and which weight to choose',
        paragraphs: [
          'GSM stands for grams per square metre. It measures how much one square metre of a paper stock weighs, which in practice tells you how thick and rigid the sheet feels. A higher GSM does not automatically mean better — it means heavier, stiffer and usually more opaque.',
          'For everyday printing we keep a standard range of stocks in house, and each has a job it does best.',
        ],
        bullets: [
          '80–100 GSM — regular office and letterhead paper. Light, inexpensive, ideal for internal documents and forms.',
          '130–170 GSM — brochures, flyers and pamphlets. Enough body to avoid a flimsy feel while staying easy to fold.',
          '250–300 GSM — visiting cards, invitation cards and tags. This is the weight most people describe as "premium" when they hold it.',
          '350 GSM and above — rigid cards, hang tags and menu cards that must survive repeated handling.',
          '760-micron PVC — our ID cards and PVC card stock. Waterproof, non-tearable and the same thickness as a bank card.',
        ],
      },
      {
        heading: 'CMYK vs RGB: why the colour shifts',
        paragraphs: [
          'Screens emit light and mix red, green and blue. Presses lay down ink and mix cyan, magenta, yellow and black. RGB can display colours that simply have no ink equivalent — the electric blues, neon greens and fluorescent pinks that look brilliant on a phone. When those files hit a press, they get mapped to the nearest printable colour, which is why a vivid screen blue can arrive as a muted navy.',
          'The fix is straightforward: design or convert to CMYK before sending, and check the preview after conversion rather than before. For deep blacks on large filled areas, avoid plain 100% K; a rich black mix such as C40 M30 Y30 K100 prints far denser and avoids a washed grey.',
          'If your artwork must match an exact brand shade, tell us the Pantone reference and we will match it as closely as the stock allows. Uncoated paper absorbs more ink and always reads slightly softer than coated stock.',
        ],
      },
      {
        heading: 'Resolution, bleed and safe margins',
        paragraphs: [
          'Resolution is measured in DPI — dots per inch — at the final printed size. A 300 DPI file is the standard for anything held in hand. Large format items viewed from a distance, such as standees and banners, print cleanly at 150 DPI because the viewing distance hides the difference.',
          'Bleed is the extra artwork that extends past the trim line, normally 3 mm on every side. Cutting machines have a small tolerance, and without bleed a background that ends exactly at the edge can leave a thin white sliver. Equally important is the safe area: keep text and logos at least 4 mm inside the trim so nothing important gets shaved off.',
        ],
        bullets: [
          'Photo frames and photo prints: 300 DPI at the final print size, sRGB or CMYK, JPEG or PNG.',
          'Visiting and PVC cards: 300 DPI, CMYK, 3 mm bleed, text 4 mm inside the trim.',
          'Banners and standees: 150 DPI at full size is sufficient and keeps file sizes manageable.',
        ],
      },
      {
        heading: 'Finishing: lamination, spot UV and rounded corners',
        paragraphs: [
          'Finishing changes how a print feels as much as how it looks. Matte lamination mutes reflections, resists fingerprints and gives a soft, professional touch that suits corporate identity work. Gloss lamination deepens contrast and makes photographs pop, which is why it dominates product packaging and photo-heavy flyers.',
          'Spot UV applies a glossy varnish only to chosen elements — a logo, a name, a single motif — over a matte base. The contrast between the two surfaces is what creates the premium effect. Rounded corners cost very little, prevent dog-earing, and instantly make a card look more considered.',
        ],
      },
      {
        heading: 'Turnaround: what actually takes time',
        paragraphs: [
          'Personalised orders at Graphicwala move through four stages: artwork check, digital proof, production, and quality inspection before dispatch. The artwork check is where most delays begin — a low-resolution photo or a missing bleed sends the file back for a revision.',
          'When files arrive print-ready, small personalised items such as keychains, PVC cards and single photo frames are typically produced within one to two working days, and bulk card or brochure runs within two to four working days. Delivery time on top of that depends on your pin code and the courier network.',
        ],
      },
    ],
    takeaway:
      'Send a 300 DPI file in CMYK with 3 mm bleed, pick a GSM that matches how the piece will be handled, and choose lamination for the feel you want. Get those four right and the press will do the rest.',
  },
  {
    slug: 'vector-graphics-explained-ai-eps-svg-pdf',
    title: 'Vector Graphics Explained: Why Your Logo Needs AI, EPS, SVG or PDF Files',
    description:
      'Raster vs vector in plain language — file formats, when each one works, how to convert a JPG logo properly, and the export checklist we use before every print run.',
    category: 'Graphic Design',
    author: 'Nikhat Praveen',
    authorRole: 'Senior Designer, Graphicwala',
    date: '2026-08-02',
    readMinutes: 8,
    intro:
      'Every week someone sends us a logo screenshot taken from WhatsApp and asks for it on a three-foot banner. The request is completely reasonable — the reason it does not work is technical, and once you understand the difference between raster and vector artwork you will never be caught out by it again.',
    sections: [
      {
        heading: 'Raster images are pixels; vector art is maths',
        paragraphs: [
          'A raster image — JPG, PNG, WebP, or a phone photograph — is a fixed grid of coloured pixels. Enlarge it and the software has to invent the pixels that were never captured, which is why edges turn soft and blocky. The number of pixels is decided the moment the file is created and can never genuinely increase.',
          'A vector file stores shapes as mathematical paths: points, curves and fills. Scale it to a postage stamp or a hoarding and the maths is simply recalculated, so the edges stay perfectly crisp at any size. That is why professional logos are always built as vectors.',
        ],
      },
      {
        heading: 'The four vector formats that matter',
        bullets: [
          'AI — the native Adobe Illustrator file. It is the master working copy with all editable layers, and the file you should archive and never lose.',
          'EPS — the long-standing print exchange format. Almost every press and printing house can open it, which makes it the safest file to hand to a vendor.',
          'SVG — the web standard. Small, sharp on every screen density, and directly usable on websites and in apps.',
          'PDF (vector) — universally openable and ideal for approvals. Just be careful: a PDF can also contain nothing but a pasted raster image, so a PDF is not automatically a vector file.',
        ],
      },
      {
        heading: 'How to tell whether you actually have a vector logo',
        paragraphs: [
          'Open the file and zoom to 800 percent. If the edges stay razor sharp, it is vector. If they break into squares or blur, it is raster regardless of what the file extension says. A second quick test: try selecting a single letter of the logo. In a vector file you can select and recolour the individual shape; in a raster file you can only select a rectangular block of pixels.',
        ],
      },
      {
        heading: 'Converting a raster logo to vector, properly',
        paragraphs: [
          'Automatic trace tools produce a result in seconds, and for a simple two-colour mark on a clean background they are often good enough. For anything with fine type, gradients or overlapping elements, auto-trace leaves wobbly outlines and hundreds of unnecessary anchor points that print as ragged edges.',
          'The reliable method is manual redraw: rebuild the mark with the pen tool, identify the typeface (or recreate the lettering as outlines), and match the colours to CMYK or Pantone values. It takes longer, but the result is a genuine master file you can use for the next decade across every size and surface.',
        ],
        bullets: [
          'Convert all text to outlines before sending artwork, so the printer does not need your fonts installed.',
          'Expand strokes so line weights scale proportionally instead of staying at a fixed thickness.',
          'Delete hidden layers and unused swatches to keep the file light and predictable.',
          'Keep one master AI file, and export EPS, SVG, PDF and transparent PNG versions from it.',
        ],
      },
      {
        heading: 'Which format to send us for which product',
        paragraphs: [
          'For printed identity work — visiting cards, letterheads, PVC and ID cards, signage — send EPS or vector PDF. For personalised photo products such as frames, mugs and photo keychains, a high-resolution JPEG or PNG straight from the original camera file is correct, because photographs are raster by nature and cannot be vectorised meaningfully.',
          'Our uploader accepts JPEG and PNG for customer photographs. If your job needs a vector source file, send it over WhatsApp or email and our design team will attach it to your order.',
        ],
      },
    ],
    takeaway:
      'Photographs stay raster; logos and type should be vector. Keep one master AI file, export EPS, SVG, PDF and PNG from it, and you will never have to rebuild your identity artwork again.',
  },
  {
    slug: 'visiting-card-and-pvc-card-design-principles',
    title: 'Card Design That Gets Kept: Visiting Card and PVC Card Principles That Work',
    description:
      'Layout, hierarchy, typography, sizing and material choices for visiting cards, PVC cards and ID cards — plus the eight mistakes that spoil otherwise good designs.',
    category: 'Branding',
    author: 'Md Sarfaraz',
    authorRole: 'Production Head, Graphicwala',
    date: '2026-08-21',
    readMinutes: 7,
    intro:
      'A visiting card has roughly three seconds to communicate who you are before it goes into a pocket or a bin. A PVC identity card, by contrast, is looked at hundreds of times over years. The two need very different design thinking, and both reward restraint far more than decoration.',
    sections: [
      {
        heading: 'Start with sizes and margins',
        paragraphs: [
          'The Indian standard visiting card is 3.5 × 2 inches (89 × 51 mm). PVC and ID cards follow the CR80 standard at 85.6 × 54 mm — exactly the size of a debit card — so they fit lanyard holders and wallets without modification.',
          'Whatever the size, design with 3 mm bleed beyond the trim and keep all text at least 4 mm inside it. Cramming content to the edge is the single most common reason a card looks amateur even when the artwork itself is good.',
        ],
      },
      {
        heading: 'Hierarchy: decide what gets read first',
        paragraphs: [
          'Every card has three tiers of information. Tier one is the name or the brand — whichever the recipient needs to remember. Tier two is the role and the company. Tier three is the contact details. If everything is set at a similar size, the eye has nowhere to land and the card reads as a block of grey text.',
          'A practical rule: set tier one about twice the size of tier three, give tier two a medium weight, and let generous white space do the separating rather than lines and boxes.',
        ],
      },
      {
        heading: 'Typography that survives at small sizes',
        bullets: [
          'Use two typefaces at most — one for the name, one for everything else.',
          'Never set body text below 7 pt; 8–9 pt is comfortable and still compact.',
          'Avoid thin hairline weights on dark backgrounds, where ink spread closes up the letterforms.',
          'Keep letter spacing slightly open on uppercase text so names stay legible at a glance.',
          'Align contact details on a single axis instead of centring some lines and left-aligning others.',
        ],
      },
      {
        heading: 'Designing PVC and ID cards for daily use',
        paragraphs: [
          'Identity cards carry a photograph, a name, a designation, an ID number and often a QR code. Place the photo in a consistent position across the whole batch so a verifier can scan a group of cards quickly. Leave a clear zone at the top for the punch slot — a hole punched through a logo ruins an otherwise perfect card.',
          'Print QR codes at a minimum of 20 × 20 mm with a quiet margin around them, and always test the printed code with two or three different phones before approving a bulk run. Dark ink on a light background scans far more reliably than the reverse.',
        ],
      },
      {
        heading: 'Eight mistakes we see most often',
        bullets: [
          'Low-resolution logos pulled from a website or a chat app.',
          'Text running right to the trim line with no safe margin.',
          'Five contact methods when two would be remembered.',
          'Screen-bright RGB colours that print noticeably duller.',
          'Pure 100% K used for large solid black panels instead of a rich black mix.',
          'Fonts sent as files rather than converted to outlines.',
          'A back face left completely blank when it could carry a service list or a QR code.',
          'Matte lamination chosen for a photo-led design that needed gloss to hold its contrast.',
        ],
      },
      {
        heading: 'Choosing material and finish',
        paragraphs: [
          'For visiting cards, 300 GSM art card with matte lamination is our most-ordered combination — durable, fingerprint resistant and comfortable to write on with a ballpoint. For photo-heavy or promotional cards, gloss lamination keeps images punchy. For a card meant to feel distinctive, 350 GSM with matte lamination and spot UV on the logo delivers the clearest step up in perceived quality.',
          'For PVC and ID cards, 760-micron stock is the standard. It is waterproof, does not tear, and holds printed colour for years of pocket and lanyard use.',
        ],
      },
    ],
    takeaway:
      'Respect the standard sizes, build a clear three-tier hierarchy, set type large enough to read easily, and choose the finish that matches the content. Simple cards printed well beat elaborate cards printed badly every time.',
  },
];

export const getPostBySlug = (slug?: string) => blogPosts.find((p) => p.slug === slug);
