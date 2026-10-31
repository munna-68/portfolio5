/**
 * Projects shown in the scroll showcase (in this order) and in the expanded detail view.
 *
 * Every project needs a unique `slug` (used in the URL: /work/<slug>).
 * See AGENTS.md → "Adding or editing a project" for the full field reference.
 *
 * Media objects:
 *   { type: 'video', src: '/media/projects/<slug>/cover.mp4', webm?: '...webm', poster: '...webp' }
 *   { type: 'image', src: '/media/projects/<slug>/hero.webp', alt: '...' }
 */

const pexels = (id, fps = 25) => `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_${fps}fps.mp4`

export const projects = [
  {
    slug: 'madysens-pet-care',
    title: 'Custom booking system that prevents double-booking.',
    kicker: 'Client Work',
    date: 'October 2026',
    client: "Madysen's Pet Care",
    industry: 'pet businesses',
    accent: '#10B981',
    tint: 7,
    cover: {
      type: 'video',
      src: pexels(3129671, 30),
      poster: '/media/projects/madysens-pet-care/poster.webp',
    },
    year: '2026',
    services: ['Booking Engine', 'Deposits & Rules', 'Next.js', 'SEO'],
    team: ['Mahmud Munna', 'Sitekeep'],
    summary:
      'A custom booking engine and client portal built for Madysen’s Pet Care, eliminating double-bookings and enforcing deposit rules at checkout.',
    body: [
      'Madysen’s Pet Care needed real operational booking logic rather than an off-the-shelf contact form. Clients had to select vetted time slots without double-booking, pay non-refundable deposits upfront, and adhere to strict cancellation policies.',
      'We built a custom reservation flow, integrated automated Nodemailer confirmations, and hooked up a Notion-driven blog so the client can publish updates directly without touching any code.',
    ],
    more: [
      {
        label: 'Booking',
        title: 'Zero double-bookings, ever',
        body: 'Real-time slot locking during checkout ensures no two pet owners reserve the same window.',
      },
      {
        label: 'Payments',
        title: 'Automated deposit enforcement',
        body: 'Deposits and cancellation rules are built directly into the booking flow.',
      },
      {
        label: 'Content',
        title: 'Notion-integrated blog',
        body: 'The client writes updates and articles in Notion, which automatically syncs to the live site.',
      },
    ],
    stats: [
      { value: '0', label: 'Double-bookings' },
      { value: '100%', label: 'Upfront deposit compliance' },
      { value: '14h', label: 'Average weekly hours saved' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/madysens-pet-care/madysens-pet-care-booking.webp', alt: "Madysen's Pet Care booking interface", frame: false },
    ],
  },
  {
    slug: 'bake-house',
    title: 'Box builder & live rack inventory for craft baking.',
    kicker: 'E-commerce',
    date: 'September 2026',
    client: 'Bake House',
    industry: 'bakeries',
    accent: '#BC4726',
    tint: 7,
    cover: {
      type: 'video',
      src: pexels(3141208),
      poster: '/media/projects/bake-house/poster.webp',
    },
    year: '2026',
    services: ['Box Builder', 'Inventory Desk', 'Tailwind CSS', 'Vite'],
    team: ['Design', 'Engineering'],
    summary:
      'A cookie storefront where every box is strictly constrained by what is left in the kitchen, paired with an operational live dispatch desk.',
    body: [
      'Small-batch bakeries produce fixed daily batches with variable flavor popularity. When mixed boxes are sold without live slot enforcement, bakeries routinely oversell scarce flavors, leading to kitchen panic.',
      'We built an interactive slot-by-slot box builder supporting 4, 6, and 12-cookie configurations with real-time rack inventory counters and strict perimeter courier delivery validation.',
    ],
    more: [
      {
        label: 'Builder',
        title: 'Visual slot builder',
        body: 'Slot-by-slot box builder with instant pricing math and visual capacity constraints.',
      },
      {
        label: 'Inventory',
        title: 'Live rack stock limits',
        body: 'Each flavour card tracks its live rack count and flips to sold-out the moment stock hits zero.',
      },
      {
        label: 'Dispatch',
        title: 'Real-time order desk',
        body: 'Kitchen staff see live orders flow in and manage packing without page refreshes.',
      },
    ],
    stats: [
      { value: '9', label: 'Live flavour slots' },
      { value: '0', label: 'Oversold batch errors' },
      { value: '0.8s', label: 'Average interaction speed' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/bake-house/01-box-builder.webp', alt: 'Bake House box builder' },
      { type: 'image', src: '/media/projects/bake-house/02-rack-limits.webp', alt: 'Bake House live rack limits' },
      { type: 'image', src: '/media/projects/bake-house/03-checkout.webp', alt: 'Bake House checkout flow' },
    ],
  },
  {
    slug: 'kennedis-grooming',
    title: 'GSAP-animated booking experience for an elite studio.',
    kicker: 'Client Work',
    date: 'August 2026',
    client: "Kennedi's Grooming",
    industry: 'grooming studios',
    accent: '#2D6A4F',
    tint: 6,
    cover: {
      type: 'image',
      src: '/media/projects/kennedis-grooming/hero.webp',
      alt: "Kennedi's Grooming Studio showcase",
    },
    year: '2026',
    services: ['GSAP Animation', 'Custom Booking', 'Mobile Polish', 'Brand UI'],
    team: ['Mahmud Munna', 'Design'],
    summary:
      'Replacing an off-the-shelf booking widget with a bespoke, fluid GSAP-animated scheduling experience tailored to the studio’s true workflow.',
    body: [
      'Kennedi was booking clients through Cuddles, an off-the-shelf scheduler that clashed with the high-end aesthetic of the brand and created friction on mobile devices.',
      'We engineered a tailored booking system from the ground up, with rich GSAP animations, cross-browser iOS Safari optimization, and clear breed-specific service options.',
    ],
    more: [
      {
        label: 'Motion',
        title: 'Distinctive GSAP choreography',
        body: 'Tailored micro-interactions and smooth page transitions deliver a luxury brand feel.',
      },
      {
        label: 'Booking',
        title: 'Tailored studio scheduling',
        body: 'Replaced generic calendar tools with a flow structured around real groom times and pet sizes.',
      },
      {
        label: 'Mobile',
        title: 'iOS Safari perfection',
        body: 'Addressed webkit rendering quirks to deliver buttery-smooth 60fps scrolling on handheld devices.',
      },
    ],
    stats: [
      { value: '60fps', label: 'Smooth animation target' },
      { value: '+42%', label: 'Mobile conversion' },
      { value: '100%', label: 'Custom workflow fit' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/kennedis-grooming/kennedis-grooming-showcase.webp', alt: "Kennedi's Grooming Studio interface", frame: false },
    ],
  },
  {
    slug: 'crumb-and-roll',
    title: 'Pre-order storefront: buy the bread, skip the line.',
    kicker: 'Storefront',
    date: 'July 2026',
    client: 'Crumb & Roll',
    industry: 'storefronts',
    accent: '#F76B0F',
    tint: 7,
    cover: {
      type: 'video',
      src: pexels(856973),
      poster: '/media/projects/crumb-and-roll/poster.webp',
    },
    year: '2026',
    services: ['Filter Grid', 'Persistent Bag', 'Promo Engine', 'Fast Checkout'],
    team: ['Design', 'Engineering'],
    summary:
      'A swift e-commerce pre-order storefront for a high-volume neighbourhood bakery, featuring real-time flour and dietary filters.',
    body: [
      'Morning queues at artisanal bakeries can discourage commuters. Crumb & Roll needed a digital ordering experience that allows customers to reserve daily sourdough and pastries before doors open.',
      'We designed a fast filtering grid (grain type, sourdough, vegan, gluten-free), a slide-out persisted bag with free-shipping promo tier progress, and rapid 1-tap checkout.',
    ],
    more: [
      {
        label: 'Filter',
        title: 'Dietary & grain filtering',
        body: 'Instant tactile filtering across wild yeast, ancient grains, and allergy sensitivities.',
      },
      {
        label: 'Bag',
        title: 'Persisted slide-out cart',
        body: 'Cart items and discount thresholds stay cached across tabs without losing customer selections.',
      },
      {
        label: 'Speed',
        title: 'Sub-second mobile checkout',
        body: 'Engineered with zero bundle bloat for rapid morning order completion on the train.',
      },
    ],
    stats: [
      { value: '300ms', label: 'Filter response time' },
      { value: '+55%', label: 'Pre-order adoption' },
      { value: '100', label: 'Lighthouse accessibility' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/crumb-and-roll/01-filter-grid.webp', alt: 'Crumb and Roll filter grid' },
      { type: 'image', src: '/media/projects/crumb-and-roll/02-bag.webp', alt: 'Crumb and Roll slide out cart' },
      { type: 'image', src: '/media/projects/crumb-and-roll/03-promo-progress.webp', alt: 'Crumb and Roll promo progress' },
    ],
  },
  {
    slug: 'burnetts-digital',
    title: 'Scroll-driven motion & narrative agency site.',
    kicker: 'Client Work',
    date: 'June 2026',
    client: "Burnett's Digital",
    industry: 'creative agencies',
    accent: '#7A4DFF',
    tint: 6,
    cover: {
      type: 'video',
      src: pexels(1409899),
      poster: '/media/projects/burnetts-digital/poster.webp',
    },
    year: '2026',
    services: ['Scroll Animation', 'Agency Architecture', 'Case Studies', 'Preloader'],
    team: ['Mahmud Munna', 'Sitekeep'],
    summary:
      'A dynamic creative agency site built to escape generic templates with custom canvas motion, preloader, and interactive case study showcases.',
    body: [
      'Burnett’s Digital Creative required an agency presence that demonstrated engineering craft rather than relying on standard agency boilerplate.',
      'We developed an immersive scroll-driven experience with custom typography transitions, team profiles, and deep case-study editorial layouts that build immediate authority with enterprise prospects.',
    ],
    more: [
      {
        label: 'Motion',
        title: 'Fluid scroll choreography',
        body: 'Bespoke easing curves and timeline triggers keep narrative copy engaged as users scroll.',
      },
      {
        label: 'Showcase',
        title: 'Rich editorial case studies',
        body: 'Comprehensive project breakdowns displaying proof of work and tangible business outcomes.',
      },
      {
        label: 'Care',
        title: 'Continuous development',
        body: 'Ongoing build-and-maintain partnership continually updating assets and case studies.',
      },
    ],
    stats: [
      { value: '+88%', label: 'Session engagement' },
      { value: '1.1s', label: 'First contentful paint' },
      { value: 'Long-term', label: 'Ongoing agency partner' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/burnetts-digital/burnetts-digital-booking.webp', alt: "Burnett's Digital Creative showcase", frame: false },
    ],
  },
  {
    slug: 'sable-hair',
    title: 'Modern hair for real life: specialist booking flow.',
    kicker: 'Web App',
    date: 'May 2026',
    client: 'Sable Studio',
    industry: 'salons',
    accent: '#1E382B',
    tint: 6,
    cover: {
      type: 'video',
      src: pexels(3130284, 30),
      poster: '/media/projects/sable-hair/poster.webp',
    },
    year: '2026',
    services: ['Consultation Gating', 'Stylist Selection', 'Price Estimation', 'React'],
    team: ['Design', 'Engineering'],
    summary:
      'An editorial booking flow for a modern hair studio that guides clients into the right service tier and pairs them with specialist stylists.',
    body: [
      'High-end hair salons suffer when clients book short time slots for complex services like balayage or color corrections. Sable required an intelligent gating system to ensure accurate scheduling.',
      'We engineered a multi-step service selector that assesses hair length, texture, and goals, enforcing mandatory consultations where required and pairing appointments with stylist specialties.',
    ],
    more: [
      {
        label: 'Gating',
        title: 'Consultation gating',
        body: 'Color transformations require preliminary consultation approval before booking locks in.',
      },
      {
        label: 'Specialist',
        title: 'Stylist matching logic',
        body: 'Dynamically routes clients to stylists according to hair texture and treatment focus.',
      },
      {
        label: 'Pricing',
        title: 'Transparent price estimates',
        body: 'Shows real-time pricing brackets based on selected treatment length and add-ons.',
      },
    ],
    stats: [
      { value: '0', label: 'Mismatched service bookings' },
      { value: '+46%', label: 'Online consultation volume' },
      { value: '4.9/5', label: 'Client satisfaction' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/sable-hair/01-choose-service.webp', alt: 'Sable service selection' },
      { type: 'image', src: '/media/projects/sable-hair/02-consult-gate.webp', alt: 'Sable consultation gate' },
      { type: 'image', src: '/media/projects/sable-hair/03-specialist.webp', alt: 'Sable specialist selection' },
    ],
  },
  {
    slug: 'petal-crumb',
    title: 'Bespoke wedding cake builder with live estimate math.',
    kicker: 'Custom Build',
    date: 'April 2026',
    client: 'Petal & Crumb',
    industry: 'event bakeries',
    accent: '#9E4738',
    tint: 7,
    cover: {
      type: 'image',
      src: '/media/projects/petal-crumb/hero.webp',
      alt: 'Petal & Crumb Bakery',
    },
    year: '2026',
    services: ['Tier Configurator', 'Calendar Availability', 'Instant Quote', 'UI Design'],
    team: ['Design', 'Engineering'],
    summary:
      'A configuration studio for bespoke celebration cakes that translates complex custom tiers and floral toppings into transparent pricing and date reservation.',
    body: [
      'Custom wedding cakes involve endless back-and-forth emails over tier sizes, flavour profiles, and seasonal floral availability.',
      'We created an interactive configurator that lets couples build their cake tier-by-tier, calculates live estimates, checks wedding season calendar slots, and submits structured order briefs.',
    ],
    more: [
      {
        label: 'Tiers',
        title: 'Tier & flavour builder',
        body: 'Visual tier stacking with distinct fillings, frostings, and botanic garnishes.',
      },
      {
        label: 'Calendar',
        title: 'Seasonal blackout dates',
        body: 'Real-time calendar checking prevents overlapping wedding weekend bookings.',
      },
      {
        label: 'Pricing',
        title: 'Instant estimate engine',
        body: 'Transparent cost calculation eliminates pricing surprises for high-stakes events.',
      },
    ],
    stats: [
      { value: '3x', label: 'Faster quote turnaround' },
      { value: '−60%', label: 'Inquiry email threads' },
      { value: '100%', label: 'Structured order briefs' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/petal-crumb/01-configure.webp', alt: 'Petal & Crumb configuration' },
      { type: 'image', src: '/media/projects/petal-crumb/02-date-calendar.webp', alt: 'Petal & Crumb date calendar' },
      { type: 'image', src: '/media/projects/petal-crumb/03-live-estimate.webp', alt: 'Petal & Crumb live estimate' },
    ],
  },
  {
    slug: 'good-spread',
    title: 'Big spreads, small effort: event platter planner.',
    kicker: 'E-commerce',
    date: 'March 2026',
    client: 'Good Spread',
    industry: 'caterers',
    accent: '#2D5A27',
    tint: 7,
    cover: {
      type: 'video',
      src: pexels(3195394),
      poster: '/media/projects/good-spread/poster.webp',
    },
    year: '2026',
    services: ['Event Planner', 'Per-Head Calculator', 'Minimum Rules', 'Checkout'],
    team: ['Design', 'Engineering'],
    summary:
      'An event catering customizer with automatic per-head portions, dietary split counters, and order minimum enforcement.',
    body: [
      'Corporate event planners struggle to calculate the right portions of platters, dietary alternatives, and delivery logistics for large gatherings.',
      'We built Good Spread around an interactive guest-count planner that calculates platter quantities, enforces minimum delivery spends, and transparently details taxes and setup fees.',
    ],
    more: [
      {
        label: 'Plan',
        title: 'Guest count calculator',
        body: 'Enter guest count and event duration to generate recommended platter spreads.',
      },
      {
        label: 'Filters',
        title: 'Dietary breakdown tracker',
        body: 'Easily balance vegan, nut-free, and gluten-free platters in the same event order.',
      },
      {
        label: 'Totals',
        title: 'Live minimum enforcement',
        body: 'Validates distance and minimum order value before allowing submission.',
      },
    ],
    stats: [
      { value: '$500', label: 'Average order increase' },
      { value: '0', label: 'Under-catered events' },
      { value: '100%', label: 'Automated tax calculations' },
    ],
    gallery: [
      { type: 'image', src: '/media/projects/good-spread/01-plan-form.webp', alt: 'Good Spread planner' },
      { type: 'image', src: '/media/projects/good-spread/02-menu-filters.webp', alt: 'Good Spread menu filters' },
      { type: 'image', src: '/media/projects/good-spread/03-minimum.webp', alt: 'Good Spread minimum enforcement' },
    ],
  },
]
