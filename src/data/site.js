/**
 * Site-wide copy. Everything that is not a project lives here.
 * Text wrapped in **double asterisks** is rendered in the strong (dark) colour,
 * the rest in the muted grey, matching the two-tone headline style.
 */

export const site = {
  name: 'Sitekeep',
  email: 'sitekeepstudio@gmail.com',
  // Form endpoint submitting JSON POST to personal inbox
  formEndpoint: 'https://formsubmit.co/ajax/mahamudmunna68@gmail.com',

  news: { label: 'Sprint delivery: 3 to 7 days • Now booking', href: '#contact' },

  preloader: ['Websites,', 'kept.'],

  statement: {
    before: 'Sitekeep designs, builds and keeps',
    after: 'that work, by design.',
    sub: 'We partner with ambitious small and mid-sized businesses to launch fast, beautiful websites, then stay on to keep them that way.',
  },

  testimonials: [
    {
      quote:
        'Instant booking, **a blog I can update myself,** and it all looks so professional. **Zero double bookings since launch** and clients love the effortless flow.',
      name: 'Madysen',
      role: "Owner, Madysen's Pet Care",
      avatar: '/media/site/madysen.webp',
    },
    {
      quote:
        'The animations and the overall look are **exactly the vibe I wanted for my studio.** Replaced our clunky scheduler and **client bookings skyrocketed.**',
      name: 'Kennedi Sherralle',
      role: "Founder, Kennedi's Grooming Studio",
      avatar: '/media/site/kennedi.webp',
    },
    {
      quote:
        'You know exactly what you are doing—**this is exactly what our brand needed.** The scroll motion and case study presentations **closed our largest client.**',
      name: 'Marcus Burnett',
      role: "Principal, Burnett's Digital Creative",
      avatar: '/media/site/marcus.webp',
    },
  ],
  testimonialImages: [
    '/media/site/t1.webp',
    '/media/site/t2.webp',
    '/media/site/t3.webp',
    '/media/site/t4.webp',
    '/media/site/t5.webp',
    '/media/site/t6.webp',
  ],

  approach: {
    title: 'Launch is the starting line. **Sites that keep working.**',
    body: 'We design and build alongside your team, ship quickly, then stay on. Every month your site gets a little faster, a little sharper and a little better at its job.',
    link: { label: 'How a project runs, week by week', thumb: '/media/site/approach.webp', href: '#contact' },
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
        body: 'Custom made with Next.js, React, Node.js, and seamless Shopify integration. Fast by default, accessible, and engineered for high conversion.',
        tags: ['Next.js', 'React', 'Node.js', 'Shopify'],
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
    clients: ["Madysen's", "Kennedi's", "Burnett's", 'Bake House', 'Sable', 'Crumb & Roll'],
    people: [
      { name: 'Mahmud Munna', role: 'Founder & Full Stack Developer', photo: '/media/team/mahmud.webp', link: 'https://wa.me/8801725073338' },
      { name: 'Nadia Karim', role: 'Co-Founder & Design Lead', photo: '/media/team/partner.webp', link: '#' },
      { name: 'Tanvir Hasan', role: 'Creative Developer & Architect', photo: '/media/team/friend.webp', link: '#' },
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
      { id: 'message', type: 'textarea', question: 'Anything else we should know?', placeholder: 'Timeline, links, ideas…', optional: true },
    ],
    done: 'Thanks, {first}. We’ll reply within one working day.',
  },

  footer: {
    columns: [
      { title: 'Contact', links: [{ label: 'Get in touch', href: '#contact' }, { label: 'sitekeepstudio@gmail.com', href: 'mailto:sitekeepstudio@gmail.com' }] },
      { title: 'Work', links: [{ label: 'Projects', href: '#work' }, { label: 'Care plans', href: '#approach' }] },
      { title: 'Elsewhere', links: [{ label: 'LinkedIn', href: '#' }, { label: 'Instagram', href: '#' }, { label: 'X', href: '#' }] },
      { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
    ],
    legal: 'Sitekeep. Websites, kept.',
  },
}
