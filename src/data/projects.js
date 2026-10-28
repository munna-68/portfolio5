/**
 * Projects shown in the scroll showcase (in this order) and in the expanded detail view.
 *
 * Every project needs a unique `slug` (used in the URL: /work/<slug>).
 * See AGENTS.md → "Adding or editing a project" for the full field reference
 * and how to swap the placeholder media below for real, optimised files.
 *
 * Media objects:
 *   { type: 'video', src: '/media/projects/<slug>/cover.mp4', webm?: '...webm', poster: '...jpg' }
 *   { type: 'image', src: '/media/projects/<slug>/cover-1600.webp', srcset?: '...', alt: '...' }
 *   { type: 'youtube', id: '<youtube id>' }   ← fine for galleries, avoid for covers (heavy)
 *
 * PLACEHOLDERS: every remote URL below (pexels / test-videos / picsum / randomuser)
 * is temporary stock media. Replace with local files in /public/media before launch.
 */

const pexels = (id, fps = 25) => `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_${fps}fps.mp4`
const picsum = (seed, w = 1800, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const projects = [
  {
    slug: 'sitekeep-care',
    title: 'Sitekeep Care: websites that never go stale',
    kicker: 'Update',
    date: 'October 2026',
    client: 'Sitekeep',
    industry: 'websites',
    accent: '#F26A1B',
    tint: 6,
    cover: { type: 'video', src: pexels(3129671, 30), poster: picsum('sk-care') },
    year: '2026',
    services: ['Care plans', 'Performance', 'Security'],
    team: ['Sitekeep team'],
    summary:
      'We launched Sitekeep Care: a monthly plan that keeps your site fast, secure and current, so it never stops working for you.',
    body: [
      'Most websites peak on launch day and slowly decay after. Plugins age, pages slow down, content drifts out of date. Sitekeep Care is our answer: a dedicated team watching performance, uptime and security every day, and shipping small improvements every month.',
      'Every plan includes monitoring, backups, Core Web Vitals tuning, content updates and a quarterly review where we look at what is working and what to build next.',
    ],
    stats: [
      { value: '99.99%', label: 'Uptime across care clients' },
      { value: '< 1.2s', label: 'Median LCP after tuning' },
      { value: '24h', label: 'Average turnaround on requests' },
    ],
    gallery: [
      { type: 'image', src: picsum('sk-care-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('sk-care-2'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'northwind-coffee',
    title: 'A storefront that sells while you sleep.',
    kicker: 'E-commerce',
    date: 'September 2026',
    client: 'Northwind Coffee',
    industry: 'storefronts',
    accent: '#1F6F54',
    tint: 7,
    cover: { type: 'video', src: pexels(3141208), poster: picsum('northwind') },
    year: '2026',
    services: ['Shopify build', 'Brand refresh', 'Subscriptions'],
    team: ['Design', 'Engineering'],
    summary:
      'We rebuilt Northwind’s online shop around subscriptions, cutting checkout steps in half and doubling repeat orders.',
    body: [
      'Northwind roasts small batches and ships across the country. Their old shop made subscribing harder than buying once. We redesigned the product pages around the subscription, rebuilt checkout and added a self-serve portal for pausing and swapping roasts.',
      'The new storefront loads in under a second on mobile and has been running on Sitekeep Care since launch.',
    ],
    stats: [
      { value: '2.1×', label: 'Repeat orders' },
      { value: '−48%', label: 'Checkout steps' },
      { value: '0.9s', label: 'Mobile LCP' },
    ],
    gallery: [
      { type: 'image', src: picsum('northwind-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('northwind-2'), alt: 'Placeholder' },
      { type: 'image', src: picsum('northwind-3'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'lumen-clinics',
    title: 'Booking care in three taps.',
    kicker: 'Healthcare',
    date: 'August 2026',
    client: 'Lumen Clinics',
    industry: 'health care',
    accent: '#2F6BFF',
    tint: 6,
    cover: { type: 'image', src: picsum('lumen', 2000, 1333), alt: 'Lumen Clinics placeholder' },
    year: '2026',
    services: ['Web app', 'Booking flow', 'Accessibility'],
    team: ['Design', 'Engineering', 'QA'],
    summary: 'A booking experience for a network of twelve clinics, built to WCAG 2.2 AA from day one.',
    body: [
      'Patients were calling to book because the website was too hard to use on a phone. We designed a three-step booking flow, connected it to the clinics’ scheduling system, and tested it with real patients of every age.',
      'Phone bookings dropped by a third in the first month, freeing reception staff for patients in the room.',
    ],
    stats: [
      { value: '3', label: 'Taps to book' },
      { value: '−34%', label: 'Phone bookings' },
      { value: 'AA', label: 'WCAG 2.2' },
    ],
    gallery: [
      { type: 'image', src: picsum('lumen-1'), alt: 'Placeholder' },
      { type: 'youtube', id: 'aqz-KE-bpKQ' },
    ],
  },
  {
    slug: 'halcyon-studio',
    title: 'A portfolio that moves like the work.',
    kicker: 'Brand site',
    date: 'July 2026',
    client: 'Halcyon Studio',
    industry: 'brand sites',
    accent: '#E9B21A',
    tint: 8,
    cover: { type: 'video', src: pexels(856973), poster: picsum('halcyon') },
    year: '2026',
    services: ['Art direction', 'Motion', 'Webflow'],
    team: ['Design', 'Motion'],
    summary: 'An animated portfolio for an architecture studio, with a CMS their team updates themselves.',
    body: [
      'Halcyon’s projects are calm, precise and full of light. We built a site that feels the same: slow, deliberate transitions, generous space and photography that fills the screen.',
      'Everything is editable in the CMS, so new projects go live the day they are photographed.',
    ],
    stats: [
      { value: '+63%', label: 'Time on site' },
      { value: '4', label: 'New enquiries per week' },
      { value: '100', label: 'Lighthouse performance' },
    ],
    gallery: [
      { type: 'image', src: picsum('halcyon-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('halcyon-2'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'fieldstone-legal',
    title: 'Making a law firm feel human.',
    kicker: 'Professional services',
    date: 'June 2026',
    client: 'Fieldstone Legal',
    industry: 'law firms',
    accent: '#7A4DFF',
    tint: 6,
    cover: { type: 'video', src: pexels(1409899), poster: picsum('fieldstone') },
    year: '2026',
    services: ['Strategy', 'Copywriting', 'Next.js'],
    team: ['Strategy', 'Design', 'Engineering'],
    summary: 'A plain-spoken website for a firm that wanted fewer buzzwords and more clients.',
    body: [
      'We rewrote every page in plain English, introduced the people behind the firm, and gave each practice area a clear next step.',
      'Organic traffic is up and the enquiry form now asks the right questions, so lawyers spend less time qualifying leads.',
    ],
    stats: [
      { value: '+82%', label: 'Organic traffic' },
      { value: '+40%', label: 'Qualified enquiries' },
      { value: '6 wks', label: 'Kick-off to launch' },
    ],
    gallery: [
      { type: 'image', src: picsum('fieldstone-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('fieldstone-2'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'orbit-fitness',
    title: 'Memberships, sold online.',
    kicker: 'Web app',
    date: 'May 2026',
    client: 'Orbit Fitness',
    industry: 'web apps',
    accent: '#FF4D5E',
    tint: 6,
    cover: { type: 'video', src: pexels(3130284, 30), poster: picsum('orbit') },
    year: '2026',
    services: ['Product design', 'Payments', 'Member portal'],
    team: ['Design', 'Engineering'],
    summary: 'A joining flow and member portal for a growing chain of gyms.',
    body: [
      'Orbit wanted people to join from their phone in the car park. We designed a joining flow that takes under two minutes and a portal where members book classes, freeze and upgrade.',
    ],
    stats: [
      { value: '1m 48s', label: 'Average time to join' },
      { value: '+57%', label: 'Online sign-ups' },
      { value: '4.8', label: 'Member rating' },
    ],
    gallery: [
      { type: 'image', src: picsum('orbit-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('orbit-2'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'tidewater-hotels',
    title: 'Direct bookings, up and to the right.',
    kicker: 'Hospitality',
    date: 'April 2026',
    client: 'Tidewater Hotels',
    industry: 'hotels',
    accent: '#0F9BA8',
    tint: 7,
    cover: { type: 'image', src: picsum('tidewater', 2000, 1333), alt: 'Tidewater placeholder' },
    year: '2026',
    services: ['Booking engine', 'Photography direction', 'SEO'],
    team: ['Design', 'Engineering', 'SEO'],
    summary: 'A coastal hotel group moved bookings away from third-party sites and onto their own.',
    body: [
      'We redesigned the booking journey around the rooms and the view, integrated their booking engine without the clunky iframe, and built landing pages for every season.',
    ],
    stats: [
      { value: '+36%', label: 'Direct bookings' },
      { value: '−22%', label: 'Commission paid' },
      { value: '12', label: 'Seasonal landing pages' },
    ],
    gallery: [
      { type: 'image', src: picsum('tidewater-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('tidewater-2'), alt: 'Placeholder' },
    ],
  },
  {
    slug: 'meadow-bakery',
    title: 'A local bakery, open online.',
    kicker: 'Small business',
    date: 'March 2026',
    client: 'Meadow Bakery',
    industry: 'local shops',
    accent: '#B8673A',
    tint: 8,
    cover: {
      type: 'video',
      src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4',
      poster: picsum('meadow'),
    },
    year: '2026',
    services: ['Website', 'Click & collect', 'Google Business'],
    team: ['Design', 'Engineering'],
    summary: 'Pre-orders and click & collect for a neighbourhood bakery that kept selling out by 10am.',
    body: [
      'A small site with one job: let regulars reserve their loaf before it sells out. Orders print straight to the kitchen each morning.',
    ],
    stats: [
      { value: '300+', label: 'Pre-orders a week' },
      { value: '£0', label: 'Marketplace fees' },
      { value: '2 wks', label: 'To launch' },
    ],
    gallery: [
      { type: 'image', src: picsum('meadow-1'), alt: 'Placeholder' },
      { type: 'image', src: picsum('meadow-2'), alt: 'Placeholder' },
    ],
  },
]
