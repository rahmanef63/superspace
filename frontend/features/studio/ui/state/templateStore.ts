/**
 * Studio Template Store
 *
 * Built-in templates use Studio JSON Schema v0.4.
 * Supported widget types: section, div, grid, twoColumn, threeColumn,
 * flex, text, image, button, card, statsBlock, listBlock, activityBlock,
 * eventsBlock, formBlock, richTextBlock, metricCardBlock, and more.
 *
 * Node structure: { type, props, children: string[] }
 * Props for text: { tag, content, className }
 * Props for image: { src, alt, className }
 * Props for button: { text, variant, size, href, className }
 * Props for layout: { className, display, gap, columns, ... }
 */

const BUILTIN_TEMPLATES: Record<string, () => any> = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. SaaS Product Landing
  // ─────────────────────────────────────────────────────────────────────────
  'SaaS Product Landing': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      // Hero
      'hero': { type: 'section', props: { className: 'bg-slate-900 text-white py-24 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'twoColumn', props: { className: 'max-w-6xl mx-auto gap-12 items-center' }, children: ['hero-copy', 'hero-media'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['hero-badge', 'hero-h1', 'hero-sub', 'hero-cta-row'] },
      'hero-badge': { type: 'text', props: { tag: 'span', content: '✨ New release', className: 'inline-block px-3 py-1 rounded-full bg-white/10 text-sm w-fit' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Kelola bisnis dari satu dashboard', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'CMS modular untuk landing page, dashboard, dan workflow internal.', className: 'text-slate-300 text-lg' }, children: [] },
      'hero-cta-row': { type: 'flex', props: { className: 'gap-3 flex-wrap' }, children: ['btn-primary', 'btn-ghost'] },
      'btn-primary': { type: 'button', props: { text: 'Mulai Gratis', variant: 'default', size: 'lg', href: '#pricing', className: 'bg-white text-slate-900 hover:bg-slate-100' }, children: [] },
      'btn-ghost': { type: 'button', props: { text: 'Lihat Demo', variant: 'outline', size: 'lg', href: '#demo', className: 'border-white/20 text-white hover:bg-white/10' }, children: [] },
      'hero-media': { type: 'image', props: { src: 'https://picsum.photos/seed/saas/800/500', alt: 'Dashboard preview', className: 'w-full rounded-2xl shadow-2xl' }, children: [] },

      // Features Grid
      'features': { type: 'section', props: { className: 'bg-slate-50 py-20 px-8' }, children: ['features-inner'] },
      'features-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto' }, children: ['features-title', 'features-grid'] },
      'features-title': { type: 'text', props: { tag: 'h2', content: 'Fitur inti', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'features-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['feat-1', 'feat-2', 'feat-3'] },
      'feat-1': { type: 'card', props: { title: 'Section Builder', description: 'Susun halaman dari blok modular.', className: 'border rounded-xl p-6' }, children: [] },
      'feat-2': { type: 'card', props: { title: 'Schema-driven', description: 'Kontrol data lewat YAML/JSON.', className: 'border rounded-xl p-6' }, children: [] },
      'feat-3': { type: 'card', props: { title: 'Reusable Components', description: 'Satu komponen dipakai lintas page.', className: 'border rounded-xl p-6' }, children: [] },

      // Pricing
      'pricing': { type: 'section', props: { className: 'bg-white py-20 px-8' }, children: ['pricing-inner'] },
      'pricing-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['pricing-title', 'pricing-grid'] },
      'pricing-title': { type: 'text', props: { tag: 'h2', content: 'Pricing', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'pricing-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['plan-starter', 'plan-pro', 'plan-enterprise'] },
      'plan-starter': { type: 'card', props: { title: 'Starter', description: '$19/mo · 3 pages · Basic blocks', className: 'border rounded-xl p-6' }, children: [] },
      'plan-pro': { type: 'card', props: { title: 'Pro', description: '$49/mo · Unlimited pages · All blocks', className: 'border-2 border-blue-500 rounded-xl p-6' }, children: [] },
      'plan-enterprise': { type: 'card', props: { title: 'Enterprise', description: 'Custom pricing · White-label · SLA', className: 'border rounded-xl p-6' }, children: [] },

      // CTA
      'cta': { type: 'section', props: { className: 'bg-slate-900 text-white py-20 px-8 text-center' }, children: ['cta-h2', 'cta-btn'] },
      'cta-h2': { type: 'text', props: { tag: 'h2', content: 'Mulai bangun page secara modular', className: 'text-3xl font-bold mb-6' }, children: [] },
      'cta-btn': { type: 'button', props: { text: 'Coba Sekarang', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-slate-900' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Agency / Studio
  // ─────────────────────────────────────────────────────────────────────────
  'Agency Studio': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-black text-white py-24 px-8 text-center' }, children: ['hero-h1', 'hero-sub', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Creative studio for modern brands', className: 'text-5xl font-bold mb-4' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Branding, website, dan campaign execution.', className: 'text-gray-400 text-xl mb-8' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Lihat Portfolio', variant: 'outline', size: 'lg', href: '#portfolio', className: 'border-white text-white' }, children: [] },

      'services': { type: 'section', props: { className: 'py-20 px-8 bg-white' }, children: ['svc-inner'] },
      'svc-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['svc-title', 'svc-grid'] },
      'svc-title': { type: 'text', props: { tag: 'h2', content: 'Services', className: 'text-3xl font-bold mb-10 text-center' }, children: [] },
      'svc-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['svc-1', 'svc-2', 'svc-3'] },
      'svc-1': { type: 'card', props: { title: 'Brand Strategy', description: 'Positioning dan identitas brand.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-2': { type: 'card', props: { title: 'Web Design', description: 'UI/UX design dan development.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-3': { type: 'card', props: { title: 'Content Production', description: 'Foto, video, dan copywriting.', className: 'border rounded-xl p-6' }, children: [] },

      'portfolio': { type: 'section', props: { className: 'py-20 px-8 bg-gray-50' }, children: ['port-inner'] },
      'port-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto' }, children: ['port-title', 'port-grid'] },
      'port-title': { type: 'text', props: { tag: 'h2', content: 'Portfolio', className: 'text-3xl font-bold mb-10 text-center' }, children: [] },
      'port-grid': { type: 'twoColumn', props: { className: 'gap-6' }, children: ['port-1', 'port-2'] },
      'port-1': { type: 'image', props: { src: 'https://picsum.photos/seed/agency1/600/400', alt: 'Project 1', className: 'w-full rounded-xl' }, children: [] },
      'port-2': { type: 'image', props: { src: 'https://picsum.photos/seed/agency2/600/400', alt: 'Project 2', className: 'w-full rounded-xl' }, children: [] },

      'contact': { type: 'section', props: { className: 'py-20 px-8 bg-black text-white text-center' }, children: ['contact-h2', 'contact-btn'] },
      'contact-h2': { type: 'text', props: { tag: 'h2', content: 'Ada project baru? Let\'s talk.', className: 'text-3xl font-bold mb-6' }, children: [] },
      'contact-btn': { type: 'button', props: { text: 'Contact Us', variant: 'outline', size: 'lg', href: 'mailto:hello@agency.com', className: 'border-white text-white' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Personal Portfolio
  // ─────────────────────────────────────────────────────────────────────────
  'Personal Portfolio': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'py-24 px-8 max-w-3xl mx-auto text-center' }, children: ['hero-h1', 'hero-role', 'hero-bio', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Halo, saya [Nama]', className: 'text-5xl font-bold mb-3' }, children: [] },
      'hero-role': { type: 'text', props: { tag: 'p', content: 'Developer · Designer · Builder', className: 'text-blue-600 font-medium text-xl mb-4' }, children: [] },
      'hero-bio': { type: 'text', props: { tag: 'p', content: 'Saya membangun produk digital yang berdampak. Fokus pada UX yang intuitif dan arsitektur yang skalabel.', className: 'text-gray-600 text-lg mb-8' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Lihat Project', variant: 'default', size: 'lg', href: '#projects' }, children: [] },

      'skills': { type: 'section', props: { className: 'py-16 px-8 bg-slate-50' }, children: ['skills-inner'] },
      'skills-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto' }, children: ['skills-title', 'skills-grid'] },
      'skills-title': { type: 'text', props: { tag: 'h2', content: 'Skills', className: 'text-2xl font-bold mb-8 text-center' }, children: [] },
      'skills-grid': { type: 'threeColumn', props: { className: 'gap-4' }, children: ['skill-1', 'skill-2', 'skill-3'] },
      'skill-1': { type: 'card', props: { title: 'Frontend', description: 'React, Next.js, TypeScript, TailwindCSS', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'skill-2': { type: 'card', props: { title: 'Backend', description: 'Node.js, Convex, PostgreSQL, REST/GraphQL', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'skill-3': { type: 'card', props: { title: 'Design', description: 'Figma, UI Systems, Motion Design', className: 'border rounded-xl p-5 text-center' }, children: [] },

      'projects': { type: 'section', props: { className: 'py-16 px-8 bg-white' }, children: ['proj-inner'] },
      'proj-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['proj-title', 'proj-grid'] },
      'proj-title': { type: 'text', props: { tag: 'h2', content: 'Featured Projects', className: 'text-2xl font-bold mb-8 text-center' }, children: [] },
      'proj-grid': { type: 'twoColumn', props: { className: 'gap-6' }, children: ['proj-1', 'proj-2'] },
      'proj-1': { type: 'card', props: { title: 'Project Alpha', description: 'SaaS platform dengan 10k+ users. Built dengan Next.js dan Convex.', imageUrl: 'https://picsum.photos/seed/proj1/600/350', className: 'border rounded-xl overflow-hidden' }, children: [] },
      'proj-2': { type: 'card', props: { title: 'Project Beta', description: 'E-commerce mobile app dengan AR try-on feature.', imageUrl: 'https://picsum.photos/seed/proj2/600/350', className: 'border rounded-xl overflow-hidden' }, children: [] },

      'contact': { type: 'section', props: { className: 'py-16 px-8 text-center bg-slate-900 text-white' }, children: ['contact-h2', 'contact-sub', 'contact-btn'] },
      'contact-h2': { type: 'text', props: { tag: 'h2', content: 'Let\'s work together', className: 'text-3xl font-bold mb-3' }, children: [] },
      'contact-sub': { type: 'text', props: { tag: 'p', content: 'Terbuka untuk freelance, full-time, dan kolaborasi.', className: 'text-slate-300 mb-6' }, children: [] },
      'contact-btn': { type: 'button', props: { text: 'Hubungi Saya', variant: 'default', size: 'lg', href: 'mailto:hello@example.com', className: 'bg-white text-slate-900' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Startup Pitch Page
  // ─────────────────────────────────────────────────────────────────────────
  'Startup Pitch': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-gradient-to-br from-violet-900 to-indigo-900 text-white py-24 px-8 text-center' }, children: ['hero-h1', 'hero-sub', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'One platform for everything your team needs', className: 'text-5xl font-bold mb-4 max-w-3xl mx-auto' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Kami membantu tim remote berkolaborasi 3× lebih cepat tanpa chaos email.', className: 'text-violet-200 text-xl mb-8 max-w-xl mx-auto' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Join Waitlist', variant: 'default', size: 'lg', href: '#waitlist', className: 'bg-white text-violet-900 font-semibold' }, children: [] },

      'problem': { type: 'section', props: { className: 'py-20 px-8 bg-white' }, children: ['prob-inner'] },
      'prob-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto text-center' }, children: ['prob-h2', 'prob-sub', 'prob-points'] },
      'prob-h2': { type: 'text', props: { tag: 'h2', content: 'Masalah yang kami selesaikan', className: 'text-3xl font-bold mb-4' }, children: [] },
      'prob-sub': { type: 'text', props: { tag: 'p', content: 'Tim modern tenggelam dalam tools yang terpisah — Slack, Notion, Jira, Drive — tanpa satu sumber kebenaran.', className: 'text-gray-500 text-lg mb-10' }, children: [] },
      'prob-points': { type: 'threeColumn', props: { className: 'gap-6 text-left' }, children: ['prob-1', 'prob-2', 'prob-3'] },
      'prob-1': { type: 'card', props: { title: '⚡ Context Switching', description: 'Rata-rata 23 menit untuk kembali fokus setelah pindah tool.', className: 'border rounded-xl p-5' }, children: [] },
      'prob-2': { type: 'card', props: { title: '🗂 Silo Data', description: 'Dokumen, task, dan komunikasi tidak terhubung.', className: 'border rounded-xl p-5' }, children: [] },
      'prob-3': { type: 'card', props: { title: '💸 Biaya Tool', description: 'Rata-rata startup bayar 8 SaaS berbeda sekaligus.', className: 'border rounded-xl p-5' }, children: [] },

      'solution': { type: 'section', props: { className: 'py-20 px-8 bg-violet-50' }, children: ['sol-inner'] },
      'sol-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto text-center' }, children: ['sol-h2', 'sol-img', 'sol-caption'] },
      'sol-h2': { type: 'text', props: { tag: 'h2', content: 'Satu workspace untuk segalanya', className: 'text-3xl font-bold mb-8' }, children: [] },
      'sol-img': { type: 'image', props: { src: 'https://picsum.photos/seed/startup/900/500', alt: 'Product overview', className: 'w-full rounded-2xl shadow-xl mb-6' }, children: [] },
      'sol-caption': { type: 'text', props: { tag: 'p', content: 'Chat, docs, project management, dan analytics — semuanya dalam satu tab.', className: 'text-gray-600' }, children: [] },

      'waitlist': { type: 'section', props: { className: 'py-20 px-8 bg-violet-900 text-white text-center' }, children: ['wl-h2', 'wl-sub', 'wl-btn'] },
      'wl-h2': { type: 'text', props: { tag: 'h2', content: 'Dapatkan early access', className: 'text-3xl font-bold mb-3' }, children: [] },
      'wl-sub': { type: 'text', props: { tag: 'p', content: 'Bergabung dengan 2.000+ founder yang sudah mendaftar.', className: 'text-violet-300 mb-6' }, children: [] },
      'wl-btn': { type: 'button', props: { text: 'Join Waitlist', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-violet-900 font-semibold' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Online Course / Education
  // ─────────────────────────────────────────────────────────────────────────
  'Online Course': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-amber-50 py-20 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'twoColumn', props: { className: 'max-w-5xl mx-auto gap-12 items-center' }, children: ['hero-copy', 'hero-img'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['hero-badge', 'hero-h1', 'hero-sub', 'hero-cta'] },
      'hero-badge': { type: 'text', props: { tag: 'span', content: '🎓 Kelas Online', className: 'text-amber-600 font-semibold text-sm uppercase tracking-wider' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Belajar skill spesifik lebih cepat', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Course outcome-based. Bukan teori, langsung ke praktik nyata yang bisa kamu pakai besok.', className: 'text-gray-600 text-lg' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Enroll Sekarang', variant: 'default', size: 'lg', href: '#pricing', className: 'bg-amber-500 hover:bg-amber-600 text-white border-0' }, children: [] },
      'hero-img': { type: 'image', props: { src: 'https://picsum.photos/seed/course/600/400', alt: 'Course preview', className: 'w-full rounded-2xl shadow-lg' }, children: [] },

      'outcomes': { type: 'section', props: { className: 'py-16 px-8 bg-white' }, children: ['out-inner'] },
      'out-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto' }, children: ['out-h2', 'out-grid'] },
      'out-h2': { type: 'text', props: { tag: 'h2', content: 'Yang akan kamu pelajari', className: 'text-2xl font-bold mb-8 text-center' }, children: [] },
      'out-grid': { type: 'twoColumn', props: { className: 'gap-4' }, children: ['out-1', 'out-2', 'out-3', 'out-4'] },
      'out-1': { type: 'card', props: { title: '✅ Outcome 1', description: 'Setup project dari nol sampai production-ready.', className: 'border rounded-lg p-4' }, children: [] },
      'out-2': { type: 'card', props: { title: '✅ Outcome 2', description: 'Memahami arsitektur scalable untuk startup.', className: 'border rounded-lg p-4' }, children: [] },
      'out-3': { type: 'card', props: { title: '✅ Outcome 3', description: 'Ship fitur dengan confidence menggunakan best practices.', className: 'border rounded-lg p-4' }, children: [] },
      'out-4': { type: 'card', props: { title: '✅ Outcome 4', description: 'Bangun portfolio yang diperhitungkan employer.', className: 'border rounded-lg p-4' }, children: [] },

      'instructor': { type: 'section', props: { className: 'py-16 px-8 bg-amber-50' }, children: ['inst-inner'] },
      'inst-inner': { type: 'div', props: { className: 'max-w-3xl mx-auto text-center' }, children: ['inst-img', 'inst-name', 'inst-bio'] },
      'inst-img': { type: 'image', props: { src: 'https://picsum.photos/seed/instructor/200/200', alt: 'Instructor', className: 'w-24 h-24 rounded-full object-cover mx-auto mb-4' }, children: [] },
      'inst-name': { type: 'text', props: { tag: 'h3', content: 'Nama Instructor', className: 'text-xl font-bold mb-2' }, children: [] },
      'inst-bio': { type: 'text', props: { tag: 'p', content: '10+ tahun di industri. Pernah memimpin engineering di 3 startup yang sukses exit.', className: 'text-gray-600' }, children: [] },

      'pricing': { type: 'section', props: { className: 'py-20 px-8 bg-white text-center' }, children: ['price-h2', 'price-card', 'price-cta'] },
      'price-h2': { type: 'text', props: { tag: 'h2', content: 'Harga', className: 'text-3xl font-bold mb-8' }, children: [] },
      'price-card': { type: 'card', props: { title: 'Full Access', description: 'Rp 499.000 · Lifetime access · Bonus template + community', className: 'border-2 border-amber-400 rounded-2xl p-8 max-w-sm mx-auto mb-6' }, children: [] },
      'price-cta': { type: 'button', props: { text: 'Daftar Sekarang', variant: 'default', size: 'lg', href: '#', className: 'bg-amber-500 text-white border-0 text-lg px-10' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Mobile App Landing
  // ─────────────────────────────────────────────────────────────────────────
  'Mobile App Landing': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-gradient-to-b from-blue-600 to-cyan-500 text-white py-24 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'twoColumn', props: { className: 'max-w-5xl mx-auto gap-12 items-center' }, children: ['hero-copy', 'hero-phone'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-5' }, children: ['hero-h1', 'hero-sub', 'hero-stores'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Mobile app that simplifies your daily work', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Track tasks, chat dengan tim, dan lihat analytics — semua dari genggaman tangan.', className: 'text-blue-100 text-lg' }, children: [] },
      'hero-stores': { type: 'flex', props: { className: 'gap-4 flex-wrap' }, children: ['store-ios', 'store-android'] },
      'store-ios': { type: 'button', props: { text: '🍎 App Store', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-blue-700 font-semibold' }, children: [] },
      'store-android': { type: 'button', props: { text: '▶ Google Play', variant: 'outline', size: 'lg', href: '#', className: 'border-white text-white' }, children: [] },
      'hero-phone': { type: 'image', props: { src: 'https://picsum.photos/seed/app/400/600', alt: 'App mockup', className: 'w-full max-w-xs mx-auto rounded-3xl shadow-2xl' }, children: [] },

      'features': { type: 'section', props: { className: 'py-20 px-8 bg-white' }, children: ['feat-inner'] },
      'feat-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['feat-title', 'feat-grid'] },
      'feat-title': { type: 'text', props: { tag: 'h2', content: 'Kenapa pilih kami?', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'feat-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['feat-1', 'feat-2', 'feat-3'] },
      'feat-1': { type: 'card', props: { title: '⚡ Fast Onboarding', description: 'Mulai dalam 2 menit. Tidak perlu setup yang rumit.', className: 'border rounded-xl p-6 text-center' }, children: [] },
      'feat-2': { type: 'card', props: { title: '🔒 Secure by Default', description: 'End-to-end encryption untuk semua data tim.', className: 'border rounded-xl p-6 text-center' }, children: [] },
      'feat-3': { type: 'card', props: { title: '📊 Real-time Analytics', description: 'Dashboard live untuk monitor performa tim.', className: 'border rounded-xl p-6 text-center' }, children: [] },

      'download': { type: 'section', props: { className: 'py-20 px-8 bg-blue-600 text-white text-center' }, children: ['dl-h2', 'dl-sub', 'dl-stores'] },
      'dl-h2': { type: 'text', props: { tag: 'h2', content: 'Mulai gratis sekarang', className: 'text-3xl font-bold mb-3' }, children: [] },
      'dl-sub': { type: 'text', props: { tag: 'p', content: '4.9 ⭐ · 50,000+ downloads', className: 'text-blue-200 mb-8' }, children: [] },
      'dl-stores': { type: 'flex', props: { className: 'gap-4 justify-center' }, children: ['dl-ios', 'dl-android'] },
      'dl-ios': { type: 'button', props: { text: '🍎 App Store', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-blue-700' }, children: [] },
      'dl-android': { type: 'button', props: { text: '▶ Google Play', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-blue-700' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Local Business Website
  // ─────────────────────────────────────────────────────────────────────────
  'Local Business': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-green-700 text-white py-20 px-8 text-center' }, children: ['hero-h1', 'hero-tagline', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Nama Bisnis Lokal', className: 'text-5xl font-bold mb-3' }, children: [] },
      'hero-tagline': { type: 'text', props: { tag: 'p', content: 'Layanan cepat, terpercaya, dan profesional sejak 2010.', className: 'text-green-100 text-xl mb-8' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Booking Sekarang', variant: 'default', size: 'lg', href: '#booking', className: 'bg-white text-green-800 font-semibold' }, children: [] },

      'services': { type: 'section', props: { className: 'py-16 px-8 bg-white' }, children: ['svc-inner'] },
      'svc-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['svc-title', 'svc-grid'] },
      'svc-title': { type: 'text', props: { tag: 'h2', content: 'Layanan Kami', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'svc-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['svc-1', 'svc-2', 'svc-3'] },
      'svc-1': { type: 'card', props: { title: 'Service A', description: 'Deskripsi layanan pertama. Mulai dari Rp 150.000.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-2': { type: 'card', props: { title: 'Service B', description: 'Deskripsi layanan kedua. Mulai dari Rp 250.000.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-3': { type: 'card', props: { title: 'Service C', description: 'Deskripsi layanan ketiga. Mulai dari Rp 500.000.', className: 'border rounded-xl p-6' }, children: [] },

      'gallery': { type: 'section', props: { className: 'py-16 px-8 bg-green-50' }, children: ['gal-inner'] },
      'gal-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['gal-title', 'gal-grid'] },
      'gal-title': { type: 'text', props: { tag: 'h2', content: 'Galeri', className: 'text-2xl font-bold text-center mb-8' }, children: [] },
      'gal-grid': { type: 'threeColumn', props: { className: 'gap-4' }, children: ['gal-1', 'gal-2', 'gal-3'] },
      'gal-1': { type: 'image', props: { src: 'https://picsum.photos/seed/biz1/400/300', alt: 'Gallery 1', className: 'w-full rounded-xl object-cover' }, children: [] },
      'gal-2': { type: 'image', props: { src: 'https://picsum.photos/seed/biz2/400/300', alt: 'Gallery 2', className: 'w-full rounded-xl object-cover' }, children: [] },
      'gal-3': { type: 'image', props: { src: 'https://picsum.photos/seed/biz3/400/300', alt: 'Gallery 3', className: 'w-full rounded-xl object-cover' }, children: [] },

      'booking': { type: 'section', props: { className: 'py-16 px-8 bg-white text-center' }, children: ['book-h2', 'book-info', 'book-btn'] },
      'book-h2': { type: 'text', props: { tag: 'h2', content: 'Booking & Kontak', className: 'text-3xl font-bold mb-4' }, children: [] },
      'book-info': { type: 'text', props: { tag: 'p', content: '📍 Jl. Contoh No. 1, Jakarta  ·  📞 0812-3456-7890  ·  ⏰ Senin–Sabtu 08.00–17.00', className: 'text-gray-600 mb-6' }, children: [] },
      'book-btn': { type: 'button', props: { text: 'Hubungi via WhatsApp', variant: 'default', size: 'lg', href: '#', className: 'bg-green-600 text-white border-0' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Event / Conference
  // ─────────────────────────────────────────────────────────────────────────
  'Event Conference': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-indigo-900 text-white py-24 px-8 text-center' }, children: ['hero-label', 'hero-h1', 'hero-date', 'hero-cta'] },
      'hero-label': { type: 'text', props: { tag: 'span', content: '📅 Annual Tech Conference 2026', className: 'text-indigo-300 font-semibold text-sm uppercase tracking-widest mb-4 block' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'The Future of Software Engineering', className: 'text-5xl font-bold mb-4 max-w-3xl mx-auto leading-tight' }, children: [] },
      'hero-date': { type: 'text', props: { tag: 'p', content: '15–16 Agustus 2026 · Jakarta Convention Center', className: 'text-indigo-200 text-xl mb-8' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Register Now', variant: 'default', size: 'lg', href: '#tickets', className: 'bg-white text-indigo-900 font-semibold text-lg px-10' }, children: [] },

      'speakers': { type: 'section', props: { className: 'py-20 px-8 bg-white' }, children: ['sp-inner'] },
      'sp-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['sp-title', 'sp-grid'] },
      'sp-title': { type: 'text', props: { tag: 'h2', content: 'Keynote Speakers', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'sp-grid': { type: 'threeColumn', props: { className: 'gap-8 text-center' }, children: ['sp-1', 'sp-2', 'sp-3'] },
      'sp-1': { type: 'card', props: { title: 'Speaker 1', description: 'CEO · Tech Company', imageUrl: 'https://picsum.photos/seed/sp1/200/200', className: 'border rounded-xl p-5' }, children: [] },
      'sp-2': { type: 'card', props: { title: 'Speaker 2', description: 'VP Engineering · Scale-up', imageUrl: 'https://picsum.photos/seed/sp2/200/200', className: 'border rounded-xl p-5' }, children: [] },
      'sp-3': { type: 'card', props: { title: 'Speaker 3', description: 'Founder · Open Source', imageUrl: 'https://picsum.photos/seed/sp3/200/200', className: 'border rounded-xl p-5' }, children: [] },

      'tickets': { type: 'section', props: { className: 'py-20 px-8 bg-indigo-50' }, children: ['tix-inner'] },
      'tix-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto' }, children: ['tix-title', 'tix-grid'] },
      'tix-title': { type: 'text', props: { tag: 'h2', content: 'Ticket Pricing', className: 'text-3xl font-bold text-center mb-10' }, children: [] },
      'tix-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['tix-early', 'tix-regular', 'tix-vip'] },
      'tix-early': { type: 'card', props: { title: 'Early Bird', description: 'Rp 299.000 · Sampai 30 Juni · All sessions', className: 'border rounded-xl p-6' }, children: [] },
      'tix-regular': { type: 'card', props: { title: 'Regular', description: 'Rp 499.000 · 1 Juli – 14 Agustus · All sessions', className: 'border-2 border-indigo-500 rounded-xl p-6' }, children: [] },
      'tix-vip': { type: 'card', props: { title: 'VIP', description: 'Rp 999.000 · Akses eksklusif + networking dinner', className: 'border rounded-xl p-6' }, children: [] },

      'register': { type: 'section', props: { className: 'py-16 px-8 bg-indigo-900 text-white text-center' }, children: ['reg-h2', 'reg-btn'] },
      'reg-h2': { type: 'text', props: { tag: 'h2', content: 'Daftar sebelum sold out', className: 'text-3xl font-bold mb-6' }, children: [] },
      'reg-btn': { type: 'button', props: { text: 'Register Sekarang', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-indigo-900 font-semibold' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Product Marketing Page
  // ─────────────────────────────────────────────────────────────────────────
  'Product Marketing': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'bg-white py-20 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'twoColumn', props: { className: 'max-w-5xl mx-auto gap-12 items-center' }, children: ['hero-copy', 'hero-img'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-5' }, children: ['hero-h1', 'hero-price', 'hero-sub', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Produk Unggulan Kami', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-price': { type: 'text', props: { tag: 'span', content: 'Mulai dari Rp 1.999.000', className: 'text-2xl font-bold text-blue-600' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Kualitas premium, desain modern, dan garansi 2 tahun. Dibuat untuk profesional yang menuntut yang terbaik.', className: 'text-gray-600 text-lg' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Beli Sekarang', variant: 'default', size: 'lg', href: '#buy', className: 'bg-blue-600 text-white border-0 text-lg' }, children: [] },
      'hero-img': { type: 'image', props: { src: 'https://picsum.photos/seed/product/600/500', alt: 'Product', className: 'w-full rounded-2xl shadow-xl' }, children: [] },

      'benefits': { type: 'section', props: { className: 'py-16 px-8 bg-blue-50' }, children: ['ben-inner'] },
      'ben-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto' }, children: ['ben-title', 'ben-grid'] },
      'ben-title': { type: 'text', props: { tag: 'h2', content: 'Kenapa produk kami?', className: 'text-2xl font-bold text-center mb-8' }, children: [] },
      'ben-grid': { type: 'threeColumn', props: { className: 'gap-6' }, children: ['ben-1', 'ben-2', 'ben-3'] },
      'ben-1': { type: 'card', props: { title: '🏆 Kualitas Premium', description: 'Material grade A dengan ketahanan 5× lebih kuat dari rata-rata pasar.', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'ben-2': { type: 'card', props: { title: '⚙ Teknologi Canggih', description: 'Prosesor terbaru dengan AI optimization built-in.', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'ben-3': { type: 'card', props: { title: '🛡 Garansi 2 Tahun', description: 'Full replacement warranty. Tidak puas, uang kembali.', className: 'border rounded-xl p-5 text-center' }, children: [] },

      'gallery': { type: 'section', props: { className: 'py-16 px-8 bg-white' }, children: ['gal-inner'] },
      'gal-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto' }, children: ['gal-title', 'gal-grid'] },
      'gal-title': { type: 'text', props: { tag: 'h2', content: 'Lihat dari semua sudut', className: 'text-2xl font-bold text-center mb-8' }, children: [] },
      'gal-grid': { type: 'threeColumn', props: { className: 'gap-4' }, children: ['gal-1', 'gal-2', 'gal-3'] },
      'gal-1': { type: 'image', props: { src: 'https://picsum.photos/seed/prod1/400/300', alt: 'View 1', className: 'w-full rounded-xl' }, children: [] },
      'gal-2': { type: 'image', props: { src: 'https://picsum.photos/seed/prod2/400/300', alt: 'View 2', className: 'w-full rounded-xl' }, children: [] },
      'gal-3': { type: 'image', props: { src: 'https://picsum.photos/seed/prod3/400/300', alt: 'View 3', className: 'w-full rounded-xl' }, children: [] },

      'buy': { type: 'section', props: { className: 'py-16 px-8 bg-blue-600 text-white text-center' }, children: ['buy-h2', 'buy-price', 'buy-btn'] },
      'buy-h2': { type: 'text', props: { tag: 'h2', content: 'Siap dapatkan yang terbaik?', className: 'text-3xl font-bold mb-3' }, children: [] },
      'buy-price': { type: 'text', props: { tag: 'p', content: 'Rp 1.999.000 · Gratis ongkir · Garansi 2 tahun', className: 'text-blue-200 mb-8' }, children: [] },
      'buy-btn': { type: 'button', props: { text: 'Beli Sekarang', variant: 'default', size: 'lg', href: '#', className: 'bg-white text-blue-700 font-semibold text-lg px-10' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Waitlist / Coming Soon
  // ─────────────────────────────────────────────────────────────────────────
  'Waitlist Coming Soon': () => ({
    version: '0.4',
    root: ['hero'],
    nodes: {
      'hero': { type: 'section', props: { className: 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center text-center py-20 px-8' }, children: ['hero-badge', 'hero-h1', 'hero-sub', 'hero-features', 'hero-waitlist'] },
      'hero-badge': { type: 'text', props: { tag: 'span', content: '🚀 Coming Soon', className: 'inline-block px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-sm font-medium mb-6' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Something new is coming', className: 'text-6xl font-bold mb-4 max-w-2xl leading-tight' }, children: [] },
      'hero-sub': { type: 'text', props: { tag: 'p', content: 'Kami sedang membangun sesuatu yang akan mengubah cara kamu bekerja. Daftar sekarang untuk early access eksklusif.', className: 'text-purple-200 text-xl mb-10 max-w-xl' }, children: [] },
      'hero-features': { type: 'threeColumn', props: { className: 'gap-4 mb-10 max-w-3xl mx-auto' }, children: ['feat-1', 'feat-2', 'feat-3'] },
      'feat-1': { type: 'card', props: { title: '⚡ Feature 1', description: 'Teaser singkat tentang fitur unggulan pertama.', className: 'bg-white/5 border border-white/10 rounded-xl p-4 text-left' }, children: [] },
      'feat-2': { type: 'card', props: { title: '🎯 Feature 2', description: 'Teaser singkat tentang fitur unggulan kedua.', className: 'bg-white/5 border border-white/10 rounded-xl p-4 text-left' }, children: [] },
      'feat-3': { type: 'card', props: { title: '🔮 Feature 3', description: 'Teaser singkat tentang fitur unggulan ketiga.', className: 'bg-white/5 border border-white/10 rounded-xl p-4 text-left' }, children: [] },
      'hero-waitlist': { type: 'div', props: { className: 'flex flex-col items-center gap-4' }, children: ['wl-btn', 'wl-social', 'wl-note'] },
      'wl-btn': { type: 'button', props: { text: '✉ Join Waitlist', variant: 'default', size: 'lg', href: '#', className: 'bg-purple-500 hover:bg-purple-400 text-white border-0 text-lg px-10 py-4 rounded-full' }, children: [] },
      'wl-social': { type: 'flex', props: { className: 'gap-4' }, children: ['wl-twitter', 'wl-instagram'] },
      'wl-twitter': { type: 'button', props: { text: '𝕏 Follow us', variant: 'ghost', href: '#', className: 'text-purple-300 hover:text-white' }, children: [] },
      'wl-instagram': { type: 'button', props: { text: '📸 Instagram', variant: 'ghost', href: '#', className: 'text-purple-300 hover:text-white' }, children: [] },
      'wl-note': { type: 'text', props: { tag: 'p', content: '2.000+ orang sudah mendaftar. Segera bergabung!', className: 'text-purple-400 text-sm' }, children: [] },
    },
  }),
};

const ASSET_KEY = 'cms-asset-templates';

export function getDefaultTemplates() {
  return { ...BUILTIN_TEMPLATES };
}

export function isBuiltinKey(key: string) {
  return !!BUILTIN_TEMPLATES[key];
}

export function instantiateDefaultTemplate(key: string) {
  const fn = BUILTIN_TEMPLATES[key];
  return fn ? fn() : null;
}

export function listAssetTemplates(): Record<string, any> {
  try {
    const raw = localStorage.getItem(ASSET_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveAssetTemplate(name: string, schema: any) {
  const all = listAssetTemplates();
  all[name] = schema;
  localStorage.setItem(ASSET_KEY, JSON.stringify(all));
}

export function deleteAssetTemplate(name: string) {
  const all = listAssetTemplates();
  delete all[name];
  localStorage.setItem(ASSET_KEY, JSON.stringify(all));
}

export function getTemplateByKey(key: string) {
  // key may be "builtin:Name" or "asset:Name" or plain name for backward-compat
  if (key.startsWith('builtin:')) {
    const name = key.slice('builtin:'.length);
    return instantiateDefaultTemplate(name);
  }
  if (key.startsWith('asset:')) {
    const name = key.slice('asset:'.length);
    const all = listAssetTemplates();
    return all[name] || null;
  }
  // plain
  return instantiateDefaultTemplate(key) || listAssetTemplates()[key] || null;
}
