/**
 * Studio Template Store
 *
 * Templates use Studio JSON Schema v0.4.
 * Structure: section (root, path="/") → div (flex-col wrapper) → div sections → content nodes
 *
 * WIDGET USAGE GUIDE:
 *  - section   : page root only (with path="/")
 *  - div       : all layout containers — use className for all CSS
 *  - grid      : CSS grid for equal-column card grids (columns: 2|3|4, gap: "sm"|"md"|"lg")
 *  - flex      : flexbox row (for CTA rows, store buttons, etc.)
 *  - text      : all text — tag: h1|h2|h3|p|span|li
 *  - image     : images
 *  - button    : CTAs and links
 *  - card      : cards with title+description+(optional image)
 *  - threeColumn : IDE/dashboard 3-panel layout (left sidebar + main + right inspector) — NOT for card grids
 *  - twoColumn   : dashboard 2-panel layout — NOT for content hero sections
 */

const BUILTIN_TEMPLATES: Record<string, () => any> = {

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SaaS Product Landing
  // ─────────────────────────────────────────────────────────────────────────
  'SaaS Product Landing': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      // ── Page root ──────────────────────────────────────────────────────
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-features', 's-pricing', 's-cta'] },

      // ── Hero ───────────────────────────────────────────────────────────
      's-hero': { type: 'div', props: { className: 'bg-slate-900 text-white py-24 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-row gap-12 items-center' }, children: ['hero-copy', 'hero-img'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-4 flex-1' }, children: ['hero-badge', 'hero-h1', 'hero-p', 'hero-btns'] },
      'hero-badge': { type: 'text', props: { tag: 'span', content: '✨ New release', className: 'inline-block px-3 py-1 rounded-full bg-white/10 text-sm w-fit' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Kelola bisnis dari satu dashboard', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'CMS modular untuk landing page, dashboard, dan workflow internal.', className: 'text-slate-300 text-lg' }, children: [] },
      'hero-btns': { type: 'div', props: { className: 'flex flex-row gap-3 flex-wrap' }, children: ['btn-start', 'btn-demo'] },
      'btn-start': { type: 'button', props: { text: 'Mulai Gratis', size: 'lg', href: '#pricing', className: 'bg-white text-slate-900 hover:bg-slate-100' }, children: [] },
      'btn-demo': { type: 'button', props: { text: 'Lihat Demo', variant: 'outline', size: 'lg', href: '#demo', className: 'border-white/20 text-white hover:bg-white/10' }, children: [] },
      'hero-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', alt: 'Dashboard preview', className: 'flex-1 rounded-2xl shadow-2xl' }, children: [] },

      // ── Features ───────────────────────────────────────────────────────
      's-features': { type: 'div', props: { className: 'py-20 px-8 bg-slate-50' }, children: ['feat-inner'] },
      'feat-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-10' }, children: ['feat-h2', 'feat-grid'] },
      'feat-h2': { type: 'text', props: { tag: 'h2', content: 'Fitur inti', className: 'text-3xl font-bold text-center' }, children: [] },
      'feat-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['feat-1', 'feat-2', 'feat-3'] },
      'feat-1': { type: 'card', props: { title: 'Section Builder', description: 'Susun halaman dari blok modular.', className: 'border rounded-xl p-6 h-full' }, children: [] },
      'feat-2': { type: 'card', props: { title: 'Schema-driven', description: 'Kontrol data lewat YAML/JSON.', className: 'border rounded-xl p-6 h-full' }, children: [] },
      'feat-3': { type: 'card', props: { title: 'Reusable Components', description: 'Satu komponen dipakai lintas page.', className: 'border rounded-xl p-6 h-full' }, children: [] },

      // ── Pricing ────────────────────────────────────────────────────────
      's-pricing': { type: 'div', props: { className: 'py-20 px-8 bg-white' }, children: ['price-inner'] },
      'price-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['price-h2', 'price-grid'] },
      'price-h2': { type: 'text', props: { tag: 'h2', content: 'Pricing', className: 'text-3xl font-bold text-center' }, children: [] },
      'price-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['plan-1', 'plan-2', 'plan-3'] },
      'plan-1': { type: 'card', props: { title: 'Starter', description: '$19/mo · 3 pages · Basic blocks', className: 'border rounded-xl p-6' }, children: [] },
      'plan-2': { type: 'card', props: { title: 'Pro', description: '$49/mo · Unlimited pages · All blocks', className: 'border-2 border-blue-500 rounded-xl p-6' }, children: [] },
      'plan-3': { type: 'card', props: { title: 'Enterprise', description: 'Custom pricing · White-label · SLA', className: 'border rounded-xl p-6' }, children: [] },

      // ── CTA ────────────────────────────────────────────────────────────
      's-cta': { type: 'div', props: { className: 'bg-slate-900 text-white py-20 px-8 text-center flex flex-col items-center gap-6' }, children: ['cta-h2', 'cta-btn'] },
      'cta-h2': { type: 'text', props: { tag: 'h2', content: 'Mulai bangun page secara modular', className: 'text-3xl font-bold' }, children: [] },
      'cta-btn': { type: 'button', props: { text: 'Coba Sekarang', size: 'lg', href: '#', className: 'bg-white text-slate-900' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Agency / Studio
  // ─────────────────────────────────────────────────────────────────────────
  'Agency Studio': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-services', 's-portfolio', 's-contact'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-black text-white py-24 px-8 text-center flex flex-col items-center gap-6' }, children: ['hero-h1', 'hero-p', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Creative studio for modern brands', className: 'text-5xl font-bold' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Branding, website, dan campaign execution.', className: 'text-gray-400 text-xl' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Lihat Portfolio', variant: 'outline', size: 'lg', href: '#portfolio', className: 'border-white text-white' }, children: [] },

      // Services
      's-services': { type: 'div', props: { className: 'py-20 px-8 bg-white' }, children: ['svc-inner'] },
      'svc-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['svc-h2', 'svc-grid'] },
      'svc-h2': { type: 'text', props: { tag: 'h2', content: 'Services', className: 'text-3xl font-bold text-center' }, children: [] },
      'svc-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['svc-1', 'svc-2', 'svc-3'] },
      'svc-1': { type: 'card', props: { title: 'Brand Strategy', description: 'Positioning dan identitas brand.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-2': { type: 'card', props: { title: 'Web Design', description: 'UI/UX design dan development.', className: 'border rounded-xl p-6' }, children: [] },
      'svc-3': { type: 'card', props: { title: 'Content Production', description: 'Foto, video, dan copywriting.', className: 'border rounded-xl p-6' }, children: [] },

      // Portfolio
      's-portfolio': { type: 'div', props: { className: 'py-20 px-8 bg-gray-50' }, children: ['port-inner'] },
      'port-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-8' }, children: ['port-h2', 'port-grid'] },
      'port-h2': { type: 'text', props: { tag: 'h2', content: 'Portfolio', className: 'text-3xl font-bold text-center' }, children: [] },
      'port-grid': { type: 'grid', props: { columns: '2', gap: 'md', className: '' }, children: ['port-1', 'port-2'] },
      'port-1': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80', alt: 'Project 1', className: 'w-full rounded-xl' }, children: [] },
      'port-2': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80', alt: 'Project 2', className: 'w-full rounded-xl' }, children: [] },

      // Contact
      's-contact': { type: 'div', props: { className: 'py-20 px-8 bg-black text-white text-center flex flex-col items-center gap-6' }, children: ['ct-h2', 'ct-btn'] },
      'ct-h2': { type: 'text', props: { tag: 'h2', content: "Ada project baru? Let's talk.", className: 'text-3xl font-bold' }, children: [] },
      'ct-btn': { type: 'button', props: { text: 'Contact Us', variant: 'outline', size: 'lg', href: 'mailto:hello@agency.com', className: 'border-white text-white' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Personal Portfolio
  // ─────────────────────────────────────────────────────────────────────────
  'Personal Portfolio': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-skills', 's-projects', 's-contact'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'py-24 px-8 text-center flex flex-col items-center gap-5' }, children: ['hero-h1', 'hero-role', 'hero-bio', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Halo, saya [Nama]', className: 'text-5xl font-bold' }, children: [] },
      'hero-role': { type: 'text', props: { tag: 'p', content: 'Developer · Designer · Builder', className: 'text-blue-600 font-medium text-xl' }, children: [] },
      'hero-bio': { type: 'text', props: { tag: 'p', content: 'Saya membangun produk digital yang berdampak. Fokus pada UX yang intuitif dan arsitektur yang skalabel.', className: 'text-gray-600 text-lg max-w-xl' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Lihat Project', size: 'lg', href: '#projects' }, children: [] },

      // Skills
      's-skills': { type: 'div', props: { className: 'py-16 px-8 bg-slate-50' }, children: ['skills-inner'] },
      'skills-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col gap-8' }, children: ['skills-h2', 'skills-grid'] },
      'skills-h2': { type: 'text', props: { tag: 'h2', content: 'Skills', className: 'text-2xl font-bold text-center' }, children: [] },
      'skills-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['sk-1', 'sk-2', 'sk-3'] },
      'sk-1': { type: 'card', props: { title: 'Frontend', description: 'React, Next.js, TypeScript, TailwindCSS', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'sk-2': { type: 'card', props: { title: 'Backend', description: 'Node.js, Convex, PostgreSQL, REST/GraphQL', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'sk-3': { type: 'card', props: { title: 'Design', description: 'Figma, UI Systems, Motion Design', className: 'border rounded-xl p-5 text-center' }, children: [] },

      // Projects
      's-projects': { type: 'div', props: { className: 'py-16 px-8 bg-white' }, children: ['proj-inner'] },
      'proj-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-8' }, children: ['proj-h2', 'proj-grid'] },
      'proj-h2': { type: 'text', props: { tag: 'h2', content: 'Featured Projects', className: 'text-2xl font-bold text-center' }, children: [] },
      'proj-grid': { type: 'grid', props: { columns: '2', gap: 'md', className: '' }, children: ['proj-1', 'proj-2'] },
      'proj-1': { type: 'card', props: { title: 'Project Alpha', description: 'SaaS platform dengan 10k+ users. Built dengan Next.js dan Convex.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', className: 'border rounded-xl overflow-hidden' }, children: [] },
      'proj-2': { type: 'card', props: { title: 'Project Beta', description: 'E-commerce mobile app dengan AR try-on feature.', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80', className: 'border rounded-xl overflow-hidden' }, children: [] },

      // Contact
      's-contact': { type: 'div', props: { className: 'py-16 px-8 text-center bg-slate-900 text-white flex flex-col items-center gap-5' }, children: ['ct-h2', 'ct-p', 'ct-btn'] },
      'ct-h2': { type: 'text', props: { tag: 'h2', content: "Let's work together", className: 'text-3xl font-bold' }, children: [] },
      'ct-p': { type: 'text', props: { tag: 'p', content: 'Terbuka untuk freelance, full-time, dan kolaborasi.', className: 'text-slate-300' }, children: [] },
      'ct-btn': { type: 'button', props: { text: 'Hubungi Saya', size: 'lg', href: 'mailto:hello@example.com', className: 'bg-white text-slate-900' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Startup Pitch Page
  // ─────────────────────────────────────────────────────────────────────────
  'Startup Pitch': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-problem', 's-solution', 's-waitlist'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-gradient-to-br from-violet-900 to-indigo-900 text-white py-24 px-8 text-center flex flex-col items-center gap-6' }, children: ['hero-h1', 'hero-p', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'One platform for everything your team needs', className: 'text-5xl font-bold max-w-3xl leading-tight' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Kami membantu tim remote berkolaborasi 3× lebih cepat tanpa chaos email.', className: 'text-violet-200 text-xl max-w-xl' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Join Waitlist', size: 'lg', href: '#waitlist', className: 'bg-white text-violet-900 font-semibold' }, children: [] },

      // Problem
      's-problem': { type: 'div', props: { className: 'py-20 px-8 bg-white' }, children: ['prob-inner'] },
      'prob-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col gap-10' }, children: ['prob-h2', 'prob-p', 'prob-grid'] },
      'prob-h2': { type: 'text', props: { tag: 'h2', content: 'Masalah yang kami selesaikan', className: 'text-3xl font-bold text-center' }, children: [] },
      'prob-p': { type: 'text', props: { tag: 'p', content: 'Tim modern tenggelam dalam tools yang terpisah — Slack, Notion, Jira, Drive — tanpa satu sumber kebenaran.', className: 'text-gray-500 text-lg text-center' }, children: [] },
      'prob-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['p-1', 'p-2', 'p-3'] },
      'p-1': { type: 'card', props: { title: '⚡ Context Switching', description: 'Rata-rata 23 menit untuk kembali fokus setelah pindah tool.', className: 'border rounded-xl p-5' }, children: [] },
      'p-2': { type: 'card', props: { title: '🗂 Silo Data', description: 'Dokumen, task, dan komunikasi tidak terhubung.', className: 'border rounded-xl p-5' }, children: [] },
      'p-3': { type: 'card', props: { title: '💸 Biaya Tool', description: 'Rata-rata startup bayar 8 SaaS berbeda sekaligus.', className: 'border rounded-xl p-5' }, children: [] },

      // Solution
      's-solution': { type: 'div', props: { className: 'py-20 px-8 bg-violet-50' }, children: ['sol-inner'] },
      'sol-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col items-center gap-8' }, children: ['sol-h2', 'sol-img', 'sol-p'] },
      'sol-h2': { type: 'text', props: { tag: 'h2', content: 'Satu workspace untuk segalanya', className: 'text-3xl font-bold' }, children: [] },
      'sol-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=900&q=80', alt: 'Product overview', className: 'w-full rounded-2xl shadow-xl' }, children: [] },
      'sol-p': { type: 'text', props: { tag: 'p', content: 'Chat, docs, project management, dan analytics — semuanya dalam satu tab.', className: 'text-gray-600' }, children: [] },

      // Waitlist
      's-waitlist': { type: 'div', props: { className: 'py-20 px-8 bg-violet-900 text-white text-center flex flex-col items-center gap-5' }, children: ['wl-h2', 'wl-p', 'wl-btn'] },
      'wl-h2': { type: 'text', props: { tag: 'h2', content: 'Dapatkan early access', className: 'text-3xl font-bold' }, children: [] },
      'wl-p': { type: 'text', props: { tag: 'p', content: 'Bergabung dengan 2.000+ founder yang sudah mendaftar.', className: 'text-violet-300' }, children: [] },
      'wl-btn': { type: 'button', props: { text: 'Join Waitlist', size: 'lg', href: '#', className: 'bg-white text-violet-900 font-semibold' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Online Course / Education
  // ─────────────────────────────────────────────────────────────────────────
  'Online Course': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-outcomes', 's-instructor', 's-pricing'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-amber-50 py-20 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-row gap-12 items-center' }, children: ['hero-copy', 'hero-img'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-4 flex-1' }, children: ['hero-badge', 'hero-h1', 'hero-p', 'hero-cta'] },
      'hero-badge': { type: 'text', props: { tag: 'span', content: '🎓 Kelas Online', className: 'text-amber-600 font-semibold text-sm uppercase tracking-wider' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Belajar skill spesifik lebih cepat', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Course outcome-based. Bukan teori, langsung ke praktik nyata yang bisa kamu pakai besok.', className: 'text-gray-600 text-lg' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Enroll Sekarang', size: 'lg', href: '#pricing', className: 'bg-amber-500 text-white hover:bg-amber-600' }, children: [] },
      'hero-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80', alt: 'Course preview', className: 'flex-1 rounded-2xl shadow-lg' }, children: [] },

      // Outcomes
      's-outcomes': { type: 'div', props: { className: 'py-16 px-8 bg-white' }, children: ['out-inner'] },
      'out-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col gap-8' }, children: ['out-h2', 'out-grid'] },
      'out-h2': { type: 'text', props: { tag: 'h2', content: 'Yang akan kamu pelajari', className: 'text-2xl font-bold text-center' }, children: [] },
      'out-grid': { type: 'grid', props: { columns: '2', gap: 'md', className: '' }, children: ['o-1', 'o-2', 'o-3', 'o-4'] },
      'o-1': { type: 'card', props: { title: '✅ Outcome 1', description: 'Setup project dari nol sampai production-ready.', className: 'border rounded-lg p-4' }, children: [] },
      'o-2': { type: 'card', props: { title: '✅ Outcome 2', description: 'Memahami arsitektur scalable untuk startup.', className: 'border rounded-lg p-4' }, children: [] },
      'o-3': { type: 'card', props: { title: '✅ Outcome 3', description: 'Ship fitur dengan confidence menggunakan best practices.', className: 'border rounded-lg p-4' }, children: [] },
      'o-4': { type: 'card', props: { title: '✅ Outcome 4', description: 'Bangun portfolio yang diperhitungkan employer.', className: 'border rounded-lg p-4' }, children: [] },

      // Instructor
      's-instructor': { type: 'div', props: { className: 'py-16 px-8 bg-amber-50' }, children: ['inst-inner'] },
      'inst-inner': { type: 'div', props: { className: 'max-w-3xl mx-auto flex flex-row gap-8 items-center' }, children: ['inst-img', 'inst-copy'] },
      'inst-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', alt: 'Instructor', className: 'w-24 h-24 rounded-full object-cover shrink-0' }, children: [] },
      'inst-copy': { type: 'div', props: { className: 'flex flex-col gap-2' }, children: ['inst-h3', 'inst-p'] },
      'inst-h3': { type: 'text', props: { tag: 'h3', content: 'Nama Instructor', className: 'text-xl font-bold' }, children: [] },
      'inst-p': { type: 'text', props: { tag: 'p', content: '10+ tahun di industri. Pernah memimpin engineering di 3 startup yang sukses exit.', className: 'text-gray-600' }, children: [] },

      // Pricing
      's-pricing': { type: 'div', props: { className: 'py-20 px-8 bg-white text-center flex flex-col items-center gap-8' }, children: ['pr-h2', 'pr-card', 'pr-btn'] },
      'pr-h2': { type: 'text', props: { tag: 'h2', content: 'Harga', className: 'text-3xl font-bold' }, children: [] },
      'pr-card': { type: 'card', props: { title: 'Full Access', description: 'Rp 499.000 · Lifetime access · Bonus template + community', className: 'border-2 border-amber-400 rounded-2xl p-8 max-w-sm' }, children: [] },
      'pr-btn': { type: 'button', props: { text: 'Daftar Sekarang', size: 'lg', href: '#', className: 'bg-amber-500 text-white text-lg px-10' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Mobile App Landing
  // ─────────────────────────────────────────────────────────────────────────
  'Mobile App Landing': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-features', 's-download'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-gradient-to-b from-blue-600 to-cyan-500 text-white py-24 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-row gap-12 items-center' }, children: ['hero-copy', 'hero-phone'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-5 flex-1' }, children: ['hero-h1', 'hero-p', 'hero-stores'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Mobile app that simplifies your daily work', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Track tasks, chat dengan tim, dan lihat analytics — semua dari genggaman tangan.', className: 'text-blue-100 text-lg' }, children: [] },
      'hero-stores': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['store-ios', 'store-android'] },
      'store-ios': { type: 'button', props: { text: '🍎 App Store', size: 'lg', href: '#', className: 'bg-white text-blue-700 font-semibold' }, children: [] },
      'store-android': { type: 'button', props: { text: '▶ Google Play', variant: 'outline', size: 'lg', href: '#', className: 'border-white text-white' }, children: [] },
      'hero-phone': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80', alt: 'App mockup', className: 'rounded-3xl shadow-2xl max-w-xs' }, children: [] },

      // Features
      's-features': { type: 'div', props: { className: 'py-20 px-8 bg-white' }, children: ['feat-inner'] },
      'feat-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['feat-h2', 'feat-grid'] },
      'feat-h2': { type: 'text', props: { tag: 'h2', content: 'Kenapa pilih kami?', className: 'text-3xl font-bold text-center' }, children: [] },
      'feat-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['f-1', 'f-2', 'f-3'] },
      'f-1': { type: 'card', props: { title: '⚡ Fast Onboarding', description: 'Mulai dalam 2 menit. Tidak perlu setup yang rumit.', className: 'border rounded-xl p-6 text-center' }, children: [] },
      'f-2': { type: 'card', props: { title: '🔒 Secure by Default', description: 'End-to-end encryption untuk semua data tim.', className: 'border rounded-xl p-6 text-center' }, children: [] },
      'f-3': { type: 'card', props: { title: '📊 Real-time Analytics', description: 'Dashboard live untuk monitor performa tim.', className: 'border rounded-xl p-6 text-center' }, children: [] },

      // Download CTA
      's-download': { type: 'div', props: { className: 'py-20 px-8 bg-blue-600 text-white text-center flex flex-col items-center gap-6' }, children: ['dl-h2', 'dl-p', 'dl-stores'] },
      'dl-h2': { type: 'text', props: { tag: 'h2', content: 'Mulai gratis sekarang', className: 'text-3xl font-bold' }, children: [] },
      'dl-p': { type: 'text', props: { tag: 'p', content: '4.9 ⭐ · 50,000+ downloads', className: 'text-blue-200' }, children: [] },
      'dl-stores': { type: 'div', props: { className: 'flex flex-row gap-4' }, children: ['dl-ios', 'dl-android'] },
      'dl-ios': { type: 'button', props: { text: '🍎 App Store', size: 'lg', href: '#', className: 'bg-white text-blue-700' }, children: [] },
      'dl-android': { type: 'button', props: { text: '▶ Google Play', size: 'lg', href: '#', className: 'bg-white text-blue-700' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Local Business Website
  // ─────────────────────────────────────────────────────────────────────────
  'Local Business': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-services', 's-gallery', 's-booking'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-green-700 text-white py-20 px-8 text-center flex flex-col items-center gap-6' }, children: ['hero-h1', 'hero-p', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Nama Bisnis Lokal', className: 'text-5xl font-bold' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Layanan cepat, terpercaya, dan profesional sejak 2010.', className: 'text-green-100 text-xl' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Booking Sekarang', size: 'lg', href: '#booking', className: 'bg-white text-green-800 font-semibold' }, children: [] },

      // Services
      's-services': { type: 'div', props: { className: 'py-16 px-8 bg-white' }, children: ['svc-inner'] },
      'svc-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-8' }, children: ['svc-h2', 'svc-grid'] },
      'svc-h2': { type: 'text', props: { tag: 'h2', content: 'Layanan Kami', className: 'text-3xl font-bold text-center' }, children: [] },
      'svc-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['s-1', 's-2', 's-3'] },
      's-1': { type: 'card', props: { title: 'Service A', description: 'Deskripsi layanan pertama. Mulai dari Rp 150.000.', className: 'border rounded-xl p-6' }, children: [] },
      's-2': { type: 'card', props: { title: 'Service B', description: 'Deskripsi layanan kedua. Mulai dari Rp 250.000.', className: 'border rounded-xl p-6' }, children: [] },
      's-3': { type: 'card', props: { title: 'Service C', description: 'Deskripsi layanan ketiga. Mulai dari Rp 500.000.', className: 'border rounded-xl p-6' }, children: [] },

      // Gallery
      's-gallery': { type: 'div', props: { className: 'py-16 px-8 bg-green-50' }, children: ['gal-inner'] },
      'gal-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-6' }, children: ['gal-h2', 'gal-grid'] },
      'gal-h2': { type: 'text', props: { tag: 'h2', content: 'Galeri', className: 'text-2xl font-bold text-center' }, children: [] },
      'gal-grid': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['g-1', 'g-2', 'g-3'] },
      'g-1': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80', alt: 'Gallery 1', className: 'w-full rounded-xl object-cover' }, children: [] },
      'g-2': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80', alt: 'Gallery 2', className: 'w-full rounded-xl object-cover' }, children: [] },
      'g-3': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=400&q=80', alt: 'Gallery 3', className: 'w-full rounded-xl object-cover' }, children: [] },

      // Booking
      's-booking': { type: 'div', props: { className: 'py-16 px-8 bg-white text-center flex flex-col items-center gap-5' }, children: ['bk-h2', 'bk-info', 'bk-btn'] },
      'bk-h2': { type: 'text', props: { tag: 'h2', content: 'Booking & Kontak', className: 'text-3xl font-bold' }, children: [] },
      'bk-info': { type: 'text', props: { tag: 'p', content: '📍 Jl. Contoh No. 1, Jakarta  ·  📞 0812-3456-7890  ·  ⏰ Senin–Sabtu 08.00–17.00', className: 'text-gray-600' }, children: [] },
      'bk-btn': { type: 'button', props: { text: 'Hubungi via WhatsApp', size: 'lg', href: '#', className: 'bg-green-600 text-white' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Event / Conference
  // ─────────────────────────────────────────────────────────────────────────
  'Event Conference': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-speakers', 's-tickets', 's-register'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-indigo-900 text-white py-24 px-8 text-center flex flex-col items-center gap-5' }, children: ['ev-label', 'ev-h1', 'ev-date', 'ev-cta'] },
      'ev-label': { type: 'text', props: { tag: 'span', content: '📅 Annual Tech Conference 2026', className: 'text-indigo-300 font-semibold text-sm uppercase tracking-widest' }, children: [] },
      'ev-h1': { type: 'text', props: { tag: 'h1', content: 'The Future of Software Engineering', className: 'text-5xl font-bold max-w-3xl leading-tight' }, children: [] },
      'ev-date': { type: 'text', props: { tag: 'p', content: '15–16 Agustus 2026 · Jakarta Convention Center', className: 'text-indigo-200 text-xl' }, children: [] },
      'ev-cta': { type: 'button', props: { text: 'Register Now', size: 'lg', href: '#tickets', className: 'bg-white text-indigo-900 font-semibold text-lg px-10' }, children: [] },

      // Speakers
      's-speakers': { type: 'div', props: { className: 'py-20 px-8 bg-white' }, children: ['sp-inner'] },
      'sp-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['sp-h2', 'sp-grid'] },
      'sp-h2': { type: 'text', props: { tag: 'h2', content: 'Keynote Speakers', className: 'text-3xl font-bold text-center' }, children: [] },
      'sp-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: 'text-center' }, children: ['sp-1', 'sp-2', 'sp-3'] },
      'sp-1': { type: 'card', props: { title: 'Speaker 1', description: 'CEO · Tech Company', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80', className: 'border rounded-xl p-5' }, children: [] },
      'sp-2': { type: 'card', props: { title: 'Speaker 2', description: 'VP Engineering · Scale-up', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80', className: 'border rounded-xl p-5' }, children: [] },
      'sp-3': { type: 'card', props: { title: 'Speaker 3', description: 'Founder · Open Source', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', className: 'border rounded-xl p-5' }, children: [] },

      // Tickets
      's-tickets': { type: 'div', props: { className: 'py-20 px-8 bg-indigo-50' }, children: ['tix-inner'] },
      'tix-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col gap-10' }, children: ['tix-h2', 'tix-grid'] },
      'tix-h2': { type: 'text', props: { tag: 'h2', content: 'Ticket Pricing', className: 'text-3xl font-bold text-center' }, children: [] },
      'tix-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['t-1', 't-2', 't-3'] },
      't-1': { type: 'card', props: { title: 'Early Bird', description: 'Rp 299.000 · Sampai 30 Juni', className: 'border rounded-xl p-6' }, children: [] },
      't-2': { type: 'card', props: { title: 'Regular', description: 'Rp 499.000 · All sessions', className: 'border-2 border-indigo-500 rounded-xl p-6' }, children: [] },
      't-3': { type: 'card', props: { title: 'VIP', description: 'Rp 999.000 · Exclusive networking dinner', className: 'border rounded-xl p-6' }, children: [] },

      // Register
      's-register': { type: 'div', props: { className: 'py-16 px-8 bg-indigo-900 text-white text-center flex flex-col items-center gap-6' }, children: ['reg-h2', 'reg-btn'] },
      'reg-h2': { type: 'text', props: { tag: 'h2', content: 'Daftar sebelum sold out', className: 'text-3xl font-bold' }, children: [] },
      'reg-btn': { type: 'button', props: { text: 'Register Sekarang', size: 'lg', href: '#', className: 'bg-white text-indigo-900 font-semibold' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 9. Product Marketing Page
  // ─────────────────────────────────────────────────────────────────────────
  'Product Marketing': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['s-hero', 's-benefits', 's-gallery', 's-buy'] },

      // Hero
      's-hero': { type: 'div', props: { className: 'bg-white py-20 px-8' }, children: ['hero-inner'] },
      'hero-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-row gap-12 items-center' }, children: ['hero-copy', 'hero-img'] },
      'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-5 flex-1' }, children: ['hero-h1', 'hero-price', 'hero-p', 'hero-cta'] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Produk Unggulan Kami', className: 'text-4xl font-bold leading-tight' }, children: [] },
      'hero-price': { type: 'text', props: { tag: 'span', content: 'Mulai dari Rp 1.999.000', className: 'text-2xl font-bold text-blue-600' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Kualitas premium, desain modern, dan garansi 2 tahun. Dibuat untuk profesional yang menuntut yang terbaik.', className: 'text-gray-600 text-lg' }, children: [] },
      'hero-cta': { type: 'button', props: { text: 'Beli Sekarang', size: 'lg', href: '#buy', className: 'bg-blue-600 text-white text-lg' }, children: [] },
      'hero-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', alt: 'Product', className: 'flex-1 rounded-2xl shadow-xl' }, children: [] },

      // Benefits
      's-benefits': { type: 'div', props: { className: 'py-16 px-8 bg-blue-50' }, children: ['ben-inner'] },
      'ben-inner': { type: 'div', props: { className: 'max-w-4xl mx-auto flex flex-col gap-8' }, children: ['ben-h2', 'ben-grid'] },
      'ben-h2': { type: 'text', props: { tag: 'h2', content: 'Kenapa produk kami?', className: 'text-2xl font-bold text-center' }, children: [] },
      'ben-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['b-1', 'b-2', 'b-3'] },
      'b-1': { type: 'card', props: { title: '🏆 Kualitas Premium', description: 'Material grade A dengan ketahanan 5× lebih kuat.', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'b-2': { type: 'card', props: { title: '⚙ Teknologi Canggih', description: 'Prosesor terbaru dengan AI optimization built-in.', className: 'border rounded-xl p-5 text-center' }, children: [] },
      'b-3': { type: 'card', props: { title: '🛡 Garansi 2 Tahun', description: 'Full replacement warranty. Tidak puas, uang kembali.', className: 'border rounded-xl p-5 text-center' }, children: [] },

      // Gallery
      's-gallery': { type: 'div', props: { className: 'py-16 px-8 bg-white' }, children: ['gal-inner'] },
      'gal-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-6' }, children: ['gal-h2', 'gal-grid'] },
      'gal-h2': { type: 'text', props: { tag: 'h2', content: 'Lihat dari semua sudut', className: 'text-2xl font-bold text-center' }, children: [] },
      'gal-grid': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['g-1', 'g-2', 'g-3'] },
      'g-1': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80', alt: 'View 1', className: 'w-full rounded-xl' }, children: [] },
      'g-2': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=400&q=80', alt: 'View 2', className: 'w-full rounded-xl' }, children: [] },
      'g-3': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80', alt: 'View 3', className: 'w-full rounded-xl' }, children: [] },

      // Buy CTA
      's-buy': { type: 'div', props: { className: 'py-16 px-8 bg-blue-600 text-white text-center flex flex-col items-center gap-5' }, children: ['buy-h2', 'buy-p', 'buy-btn'] },
      'buy-h2': { type: 'text', props: { tag: 'h2', content: 'Siap dapatkan yang terbaik?', className: 'text-3xl font-bold' }, children: [] },
      'buy-p': { type: 'text', props: { tag: 'p', content: 'Rp 1.999.000 · Gratis ongkir · Garansi 2 tahun', className: 'text-blue-200' }, children: [] },
      'buy-btn': { type: 'button', props: { text: 'Beli Sekarang', size: 'lg', href: '#', className: 'bg-white text-blue-700 font-semibold text-lg px-10' }, children: [] },
    },
  }),

  // ─────────────────────────────────────────────────────────────────────────
  // 10. Waitlist / Coming Soon
  // ─────────────────────────────────────────────────────────────────────────
  'Waitlist Coming Soon': () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      'page': { type: 'section', props: { path: '/', className: 'bg-slate-900 text-white' }, children: ['wrap'] },
      'wrap': { type: 'div', props: { className: 'flex flex-col items-center min-h-screen py-24 px-8 gap-10' }, children: ['badge', 'hero-h1', 'hero-p', 'feat-grid', 'waitlist-group'] },

      'badge': { type: 'text', props: { tag: 'span', content: '🚀 Coming Soon', className: 'inline-block px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-sm font-medium' }, children: [] },
      'hero-h1': { type: 'text', props: { tag: 'h1', content: 'Something new is coming', className: 'text-6xl font-bold text-center max-w-2xl leading-tight' }, children: [] },
      'hero-p': { type: 'text', props: { tag: 'p', content: 'Kami sedang membangun sesuatu yang akan mengubah cara kamu bekerja. Daftar sekarang untuk early access eksklusif.', className: 'text-purple-200 text-xl text-center max-w-xl' }, children: [] },

      'feat-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: 'w-full max-w-3xl' }, children: ['f-1', 'f-2', 'f-3'] },
      'f-1': { type: 'card', props: { title: '⚡ Feature 1', description: 'Teaser singkat tentang fitur unggulan pertama.', className: 'bg-white/5 border border-white/10 rounded-xl p-4' }, children: [] },
      'f-2': { type: 'card', props: { title: '🎯 Feature 2', description: 'Teaser singkat tentang fitur unggulan kedua.', className: 'bg-white/5 border border-white/10 rounded-xl p-4' }, children: [] },
      'f-3': { type: 'card', props: { title: '🔮 Feature 3', description: 'Teaser singkat tentang fitur unggulan ketiga.', className: 'bg-white/5 border border-white/10 rounded-xl p-4' }, children: [] },

      'waitlist-group': { type: 'div', props: { className: 'flex flex-col items-center gap-4' }, children: ['wl-btn', 'social-row', 'wl-note'] },
      'wl-btn': { type: 'button', props: { text: '✉ Join Waitlist', size: 'lg', href: '#', className: 'bg-purple-500 hover:bg-purple-400 text-white rounded-full px-10 py-4 text-lg' }, children: [] },
      'social-row': { type: 'div', props: { className: 'flex flex-row gap-4' }, children: ['tw-btn', 'ig-btn'] },
      'tw-btn': { type: 'button', props: { text: '𝕏 Follow us', variant: 'ghost', href: '#', className: 'text-purple-300 hover:text-white' }, children: [] },
      'ig-btn': { type: 'button', props: { text: '📸 Instagram', variant: 'ghost', href: '#', className: 'text-purple-300 hover:text-white' }, children: [] },
      'wl-note': { type: 'text', props: { tag: 'p', content: '2.000+ orang sudah mendaftar. Segera bergabung!', className: 'text-purple-400 text-sm' }, children: [] },
    },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

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
  // plain name — check builtins first, then user assets
  return instantiateDefaultTemplate(key) || listAssetTemplates()[key] || null;
}
