/*
 * Default editable content. The admin panel stores overrides in data/*.json;
 * the static builder falls back to these values when no override exists.
 * Testimonial and package defaults mirror the content currently published on
 * the homepage so the first publish is visually unchanged.
 */
const env = process.env;

const defaults = {
  settings: {
    contactEmail: 'md@mtelnetworks.com',
    contactPhone: '+91-73737 10071 / 72',
    topbarPhone: '+91 73737 10071',
    phoneDigits: '917373710071',
    gatewayName: 'M-Tel Networks Core — Coimbatore (Tier-1 Peering)',
    smtp: {
      enabled: env.SMTP_ENABLED === 'true',
      host: env.SMTP_HOST || '',
      port: Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER || '',
      password: env.SMTP_PASSWORD || '',
      fromName: env.SMTP_FROM_NAME || 'M-Tel Networks',
      fromEmail: env.SMTP_FROM_EMAIL || env.SMTP_USER || '',
      notifyEmail: env.SMTP_TO_EMAIL || 'md@mtelnetworks.com',
      subjectPrefix: env.SMTP_SUBJECT_PREFIX || '[M-Tel]',
      timeoutMs: Number(env.SMTP_TIMEOUT_MS) || 8000,
      notifyTypes: {
        contact: true,
        speedtest: true,
        login: true,
        signup: true
      },
      verifiedAt: ''
    },
    updatedAt: ''
  },
  testimonials: [
    {
      id: 'testimonial-1',
      quote: 'M-Tel’s dedicated fiber leased line gives our engineering campus continuous sub-2ms latency to cloud regions. The 99.9% uptime SLA has held solid without a glitch.',
      name: 'K. Senthilkumar',
      role: 'Head of Infrastructure, IT Park, Saravanampatti',
      initials: 'KS',
      note: 'Enterprise 1:1 Leased Line Subscriber',
      status: 'approved',
      order: 1,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'testimonial-2',
      quote: 'Switched from a legacy provider to M-Tel Fibernet. Our multi-branch retail network, VoIP, and billing systems now communicate over an encrypted private Intranet with zero packet drops.',
      name: 'R. Meenakshi Sundaram',
      role: 'Operations Director, Retail & Logistics, RS Puram',
      initials: 'RM',
      note: 'Multi-Office Intranet & Fibernet Subscriber',
      status: 'approved',
      order: 2,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'testimonial-3',
      quote: 'Providing high-speed Wi-Fi across our campus labs and administrative blocks was seamless. The site survey and fiber pull were completed on schedule without disrupting classes.',
      name: 'Dr. V. Anand',
      role: 'Campus Administrator, Educational Institute, Peelamedu',
      initials: 'VA',
      note: 'Campus High-Speed FTTH Subscriber',
      status: 'approved',
      order: 3,
      createdAt: '',
      updatedAt: ''
    }
  ],
  packages: [
    {
      id: 'standard-home',
      category: 'home',
      badge: '100 Mbps',
      icon: 'star',
      name: 'STANDARD PLAN',
      description: 'Cost-effective high-speed connection for streaming, browsing, and work-from-home.',
      currency: '₹',
      amount: '699',
      period: '/ month',
      custom: false,
      features: [
        'Unlimited High-Speed Data',
        'Symmetrical Download / Upload',
        'Dual-Band Wi-Fi Router on 6mo+',
        '24/7 Dedicated Support'
      ],
      cta: 'Choose Standard',
      href: 'contact-us.php?plan=Standard_100Mbps',
      featured: false,
      ribbon: '',
      status: 'active',
      order: 1,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'silver-home',
      category: 'home',
      badge: '250 Mbps',
      icon: 'half-star',
      name: 'SILVER PLAN',
      description: 'Ultra-fast fiber designed for simultaneous 4K/8K streaming, smart homes & gaming.',
      currency: '₹',
      amount: '999',
      period: '/ month',
      custom: false,
      features: [
        'Unlimited High-Speed Data (No FUP)',
        'Gigabit Dual-Band Wi-Fi 6 Router',
        'Zero Installation Fee on 3mo+',
        'Low Latency Gaming Routing'
      ],
      cta: 'Choose Silver',
      href: 'contact-us.php?plan=Silver_250Mbps',
      featured: true,
      ribbon: 'Most Popular',
      status: 'active',
      order: 2,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'gold-home',
      category: 'home',
      badge: '500 Mbps',
      icon: 'solid-star',
      name: 'GOLD PLAN',
      description: 'Pro-grade bandwidth for heavy home labs, creators, and executive offices.',
      currency: '₹',
      amount: '1,499',
      period: '/ month',
      custom: false,
      features: [
        'True 500 Mbps Symmetric Optical Link',
        'Static IPv4 Address on Request',
        'Priority Enterprise Peering Routes',
        '4-Hour Rapid Response SLA'
      ],
      cta: 'Choose Gold',
      href: 'contact-us.php?plan=Gold_500Mbps',
      featured: false,
      ribbon: '',
      status: 'active',
      order: 3,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'leased-line-business',
      category: 'business',
      badge: '1:1 CIR',
      icon: 'grid',
      name: 'DEDICATED LEASED LINE',
      description: '1:1 unshared committed information rate with strict latency SLAs for corporate offices.',
      currency: '',
      amount: 'Custom SLA',
      period: '',
      custom: true,
      features: [
        'Guaranteed 99.95% Network Uptime',
        'Symmetrical CIR (10 Mbps to 1 Gbps)',
        'Static IP Subnet (/29 Allocated)',
        '2-Hour Mean Time to Restore (MTTR)'
      ],
      cta: 'Request Leased Line Quote',
      href: 'contact-us.php?service=Leased_Line',
      featured: false,
      ribbon: '',
      status: 'active',
      order: 1,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'vpn-business',
      category: 'business',
      badge: 'MPLS / SD-WAN',
      icon: 'globe',
      name: 'INTRANET & MANAGED VPN',
      description: 'Connect multi-location branches, warehouses & retail hubs over an isolated private backbone.',
      currency: '',
      amount: 'Enterprise Ring',
      period: '',
      custom: true,
      features: [
        'Zero Public Internet Exposure / Air-Gapped',
        'Hardware Firewall & AES-256 Encryption',
        'Seamless LAN / WAN Interconnect',
        'Dedicated Account Executive & Priority NOC'
      ],
      cta: 'Request VPN Architecture',
      href: 'contact-us.php?service=Intranet_VPN',
      featured: true,
      ribbon: 'Corporate Ready',
      status: 'active',
      order: 2,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'wireless-business',
      category: 'business',
      badge: 'Fixed Wireless',
      icon: 'wireless',
      name: 'CAMPUS POINT-TO-POINT',
      description: 'Long-range radio transceiver link for colleges, industrial estates, and remote facilities.',
      currency: '',
      amount: 'Turnkey Setup',
      period: '',
      custom: true,
      features: [
        'No Physical Road Digging Required',
        'High-Throughput Microwave Transceiver',
        'Primary or Failover Redundant Link',
        'Free Site Survey by RF Engineers'
      ],
      cta: 'Schedule Site Survey',
      href: 'contact-us.php?service=Campus_Wireless',
      featured: false,
      ribbon: '',
      status: 'active',
      order: 3,
      createdAt: '',
      updatedAt: ''
    }
  ]
};

module.exports = { defaults };
