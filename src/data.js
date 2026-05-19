export const bankTypes = [
  { value: 'BRI', label: 'BANK BRI', color: '#0a58ca' },
  { value: 'BCA', label: 'BANK BCA', color: '#1456d9' },
  { value: 'Mandiri', label: 'BANK MANDIRI', color: '#f7b500' },
  { value: 'BNI', label: 'BANK BNI', color: '#f58220' },
  { value: 'CIMB', label: 'BANK CIMB', color: '#d71920' },
  { value: 'SeaBank', label: 'SEABANK', color: '#f6a400' },
  { value: 'DANA', label: 'DANA', color: '#108ee9' },
  { value: 'OVO', label: 'OVO', color: '#4c2a86' },
  { value: 'GoPay', label: 'GOPAY', color: '#00a6ff' },
  { value: 'ShopeePay', label: 'SHOPEEPAY', color: '#ee4d2d' },
];

export const defaultInvitation = {
  brand: 'NIKAHFIX',
  site: {
    eventSlug: 'nikahan-kita-nama-pria-nama-wanita',
    whatsappTemplate:
      'Yth. {guestName},\n\nDengan penuh sukacita kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pernikahan kami.\n\nSilakan buka undangan digital melalui link berikut:\n{inviteLink}\n\nTerima kasih atas doa dan kehadirannya.\n\n{coupleName}',
  },
  packageConfig: {
    activePackage: 'premium',
    guestLimitStep: 50,
    masterUnlock: true,
    tiers: [
      { id: 'basic', name: 'Paket 1', guestLimit: 50, features: ['RSVP'] },
      { id: 'standard', name: 'Paket 2', guestLimit: 100, features: ['RSVP', 'Buku tamu export'] },
      { id: 'premium', name: 'Paket 3', guestLimit: 150, features: ['RSVP', 'Buku tamu export', 'Scan QR'] },
    ],
  },
  cover: {
    prompt: "Who's watching?",
    guestFallback: 'Contoh Nama Tamu',
    buttonLabel: 'OPEN INVITATION',
  },
  music: {
    enabled: true,
    title: 'Janji Suci - Saxophone Cover',
    src: '/audio/Janji Suci Cover Saxophone - Yovie And Nuno.mp3',
  },
  hero: {
    title: 'Nama Pria & Nama Wanita:',
    subtitle: 'Final Episode of Love',
    status: 'Coming Soon',
    dateLabel: 'Tanggal Pernikahan',
    weddingDate: '2026-12-12T09:00',
    heroImage:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=86',
    trailerImage:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=84',
    tags: ['#NamaPriaNamaWanita', '#FinalEpisodeOfLove', '#WeddingDocumenter', '#NikahanKita'],
  },
  film: {
    genre: 'DOCUMENTER',
    title: '"Nama Pria & Nama Wanita: Final Episode of Love"',
    match: '100% match',
    rating: 'SU',
    release: 'YYYY MM DD',
    quality: ['4K', 'HD'],
    scheduleLabel: 'Coming soon on wedding day',
    synopsis:
      'Tulis narasi pembuka tentang perjalanan cinta kedua mempelai, doa keluarga, dan makna hari pernikahan ini.',
    verse:
      '"So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate."',
    verseSource: '(Matthew 19:6)',
  },
  news: {
    title: 'Breaking News',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=86',
    paragraphs: [
      'Hai semuanya, dengan penuh sukacita kami ingin membagikan kabar bahwa hari pernikahan kami segera tiba.',
      'Mohon doa agar seluruh rangkaian berjalan lancar dan menjadi awal rumah tangga yang penuh kasih.',
      'Best regards,',
      'Nama Pria & Nama Wanita',
    ],
  },
  couple: [
    {
      id: 'groom',
      role: 'Groom',
      name: 'Nama Mempelai Pria',
      detail: 'Putra dari Bapak Nama Ayah & Ibu Nama Ibu',
      instagram: 'https://www.instagram.com/',
      image:
        'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'bride',
      role: 'Bride',
      name: 'Nama Mempelai Wanita',
      detail: 'Putri dari Bapak Nama Ayah & Ibu Nama Ibu',
      instagram: 'https://www.instagram.com/',
      image:
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=84',
    },
  ],
  events: [
    {
      id: 'ceremony',
      name: 'Akad / Pemberkatan',
      date: 'Tanggal Acara',
      time: 'Jam Mulai s.d. Selesai',
      timezone: '#WIB',
      venue: 'Nama Tempat Acara',
      address: 'Alamat lengkap lokasi acara utama',
      mapsUrl: 'https://maps.google.com/',
      image:
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=86',
    },
    {
      id: 'reception',
      name: 'Resepsi',
      date: 'Tanggal Acara',
      time: 'Jam Mulai s.d. Selesai',
      timezone: '#WIB',
      venue: 'Nama Venue Resepsi',
      address: 'Alamat lengkap venue resepsi',
      mapsUrl: 'https://maps.google.com/',
      image:
        'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=86',
    },
  ],
  stories: [
    {
      id: 'episode-1',
      episode: 'Episode 1:',
      title: 'Awal Pertemuan',
      body: 'Tulis cerita singkat tentang bagaimana kedua mempelai pertama kali bertemu dan mulai saling mengenal.',
      duration: '03 min read',
      rating: 'SU',
      image:
        'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'episode-2',
      episode: 'Episode 2:',
      title: 'Perjalanan Bersama',
      body: 'Tulis momen penting, proses saling mendukung, dan perjalanan hubungan sebelum menuju hari pernikahan.',
      duration: '04 min read',
      rating: 'SU',
      image:
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'episode-3',
      episode: 'Episode 3:',
      title: 'Hari Lamaran',
      body: 'Tulis cerita tentang hari lamaran, doa keluarga, dan keputusan untuk melangkah ke jenjang pernikahan.',
      duration: '05 min read',
      rating: 'SU',
      image:
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=84',
    },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=82',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=82',
  ],
  gifts: {
    intro:
      'Terima kasih telah menambah semangat kegembiraan pernikahan kami dengan kehadiran dan hadiah indah Anda.',
    banks: [
      {
        id: 'bank-1',
        type: 'BRI',
        accountNumber: '000000000000',
        accountName: 'Nama Pemilik Rekening',
      },
      {
        id: 'bank-2',
        type: 'Mandiri',
        accountNumber: '111111111111',
        accountName: 'Nama Pemilik Rekening',
      },
    ],
    deliveryTitle: 'Kirim Kado',
    deliveryNote: 'Anda dapat mengirim kado ke:',
    deliveryAddress: 'Alamat pengiriman hadiah pernikahan',
  },
  closing: {
    body:
      'Terima kasih telah hadir dalam sukacita kami. Doa dan dukungan Anda menjadi bagian indah dari awal perjalanan ini.',
    cta: 'See you on our big day!',
    signature: 'Nama Pria & Nama Wanita',
  },
  guests: [
    { id: 'guest-1', name: 'Contoh Nama Tamu', slug: 'contoh-nama-tamu', qrToken: 'qr-contoh-nama-tamu' },
    { id: 'guest-2', name: 'Keluarga Besar', slug: 'keluarga-besar', qrToken: 'qr-keluarga-besar' },
  ],
  rsvps: [],
  checkIns: [],
};
