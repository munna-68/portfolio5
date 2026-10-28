/**
 * Site-wide copy. Everything that is not a project lives here.
 * Text wrapped in **double asterisks** is rendered in the strong (dark) colour,
 * the rest in the muted grey, matching the two-tone headline style.
 */

const avatar = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg` // PLACEHOLDER
const picsum = (seed, w = 900, h = 1100) => `https://picsum.photos/seed/${seed}/${w}/${h}` // PLACEHOLDER

export const site = {
  name: 'Sitekeep',
  email: 'hello@sitekeep.co',
  // Optional: a form endpoint (Formspree, Basin, your own API…) that accepts a JSON POST.
  // Leave empty to fall back to opening the visitor's email client.
  formEndpoint: '',

  news: { label: 'Now booking projects for early 2027', href: '#contact' },

  preloader: ['Websites,', 'kept.'],

  statement: {
    before: 'Sitekeep designs, builds and keeps',
    after: 'that work, by design.',
    sub: 'We partner with ambitious small and mid-sized businesses to launch fast, beautiful websites, then stay on to keep them that way.',
  },

  testimonials: [
    {
      quote:
        'Sitekeep rebuilt our shop in six weeks and **we have not thought about the website since,** in the best way. **Orders are up, the site is fast** and every small request is done the same day.',
      name: 'Priya Natarajan',
      role: 'Founder, Northwind Coffee',
      avatar: avatar('women', 44),
    },
    {
      quote:
        'They asked better questions than any agency we have worked with. **The new site finally sounds like us,** and the enquiries that come through it are **the kind we actually want.**',
      name: 'Daniel Okafor',
      role: 'Managing Partner, Fieldstone Legal',
      avatar: avatar('men', 32),
    },
    {
      quote:
        'Our photographers send new work on Monday and **it is live by Tuesday.** The site feels like an extension of the studio, **calm, precise and full of light.**',
      name: 'Mara Lindqvist',
      role: 'Director, Halcyon Studio',
      avatar: avatar('women', 68),
    },
  ],
  testimonialImages: [picsum('t1'), picsum('t2'), picsum('t3'), picsum('t4'), picsum('t5'), picsum('t6')],

  approach: {
    title: 'Launch is the starting line. **Sites that keep working.**',
    body: 'We design and build alongside your team, ship quickly, then stay on. Every month your site gets a little faster, a little sharper and a little better at its job.',
    link: { label: 'How a project runs, week by week', thumb: picsum('approach', 400, 260), href: '#contact' },
    steps: [
      {
        icon: 'design',
        title: 'Design',
        body: 'Workshops, sitemap and wireframes in week one. Then a design system and real pages, written with real copy, reviewed with you every few days.',
        tags: ['Strategy', 'UX', 'Copy', 'Visual design'],
      },
      {
        icon: 'build',
        title: 'Build',
        body: 'Hand-built on the right platform for you: Shopify, Webflow, WordPress or a custom Next.js stack. Fast by default, accessible and easy to edit.',
        tags: ['Shopify', 'Webflow', 'Next.js', 'CMS'],
      },
      {
        icon: 'keep',
        title: 'Keep',
        body: 'Our care plans cover hosting, updates, monitoring, backups and a monthly block of improvements. You get one team that knows your site inside out.',
        tags: ['Hosting', 'Security', 'Performance', 'Monthly updates'],
      },
    ],
  },

  team: {
    title: 'Senior people, small team. **The team.**',
    body: 'We are designers and engineers who have built sites for startups, studios and household names. You work directly with the people doing the work.',
    clients: ['Northwind', 'Lumen', 'Halcyon', 'Fieldstone', 'Orbit', 'Tidewater', 'Meadow'],
    people: [
      { name: 'Alex Rivera', role: 'Co-Founder, Design', photo: avatar('men', 46), link: '#' },
      { name: 'Sam Chen', role: 'Co-Founder, Engineering', photo: avatar('women', 21), link: '#' },
      { name: 'Jordan Patel', role: 'Lead Developer', photo: avatar('men', 75), link: '#' },
      { name: 'Riley Brooks', role: 'Client Partner', photo: avatar('women', 90), link: '#' },
    ],
  },

  contact: {
    title: 'Let’s build something worth keeping. **Get in touch.**',
    steps: [
      { id: 'name', type: 'text', question: 'What’s your name?', placeholder: 'Jamie Lee', autocomplete: 'name' },
      { id: 'email', type: 'email', question: 'Nice to meet you, {first}. What’s your email?', placeholder: 'jamie@company.com', autocomplete: 'email' },
      {
        id: 'need',
        type: 'chips',
        multi: true,
        question: 'What can we help with?',
        options: ['New website', 'Redesign', 'E-commerce', 'Care plan', 'Something else'],
      },
      { id: 'budget', type: 'chips', question: 'Rough budget?', options: ['Under $5k', '$5–15k', '$15–40k', '$40k+'] },
      { id: 'message', type: 'textarea', question: 'Anything else we should know?', placeholder: 'Timeline, links, ideas…', optional: true },
    ],
    done: 'Thanks, {first}. We’ll reply within one working day.',
  },

  footer: {
    columns: [
      { title: 'Contact', links: [{ label: 'Get in touch', href: '#contact' }, { label: 'hello@sitekeep.co', href: 'mailto:hello@sitekeep.co' }] },
      { title: 'Work', links: [{ label: 'Projects', href: '#work' }, { label: 'Care plans', href: '#approach' }] },
      { title: 'Elsewhere', links: [{ label: 'LinkedIn', href: '#' }, { label: 'Instagram', href: '#' }, { label: 'X', href: '#' }] },
      { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
    ],
    legal: 'Sitekeep. Websites, kept.',
  },
}
