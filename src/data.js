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
    eventSlug: 'nikahan-kita-gregory-dian',
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
    title: 'Gregory & Dian:',
    subtitle: 'Final Episode of Love',
    status: 'Coming Soon',
    dateLabel: '28 June 2025',
    weddingDate: '2025-06-28T09:30',
    heroImage:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=86',
    trailerImage:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=84',
    tags: ['#FromDiToMrsGreg', '#GregStoleDi', '#GregGotDi', '#documenter'],
  },
  film: {
    genre: 'DOCUMENTER',
    title: '"Gregory & Dian: Final Episode of Love"',
    match: '100% match',
    rating: 'SU',
    release: '2025 06 28',
    quality: ['4K', 'HD'],
    scheduleLabel: 'Coming soon on Saturday, 28 June 2025',
    synopsis:
      'Hari ini kami memilih berjalan bersama, merayakan kasih yang bertumbuh dalam doa, keluarga, dan setiap musim kehidupan.',
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
      'Gregory & Dian',
    ],
  },
  couple: [
    {
      id: 'groom',
      role: 'Groom',
      name: 'Gregory RN Tampubolon',
      detail: 'Anak Kedua dari Keluarga Bapak Uli H Tampubolon (Alm.) & Ibu Ely S Sembiring',
      instagram: 'https://www.instagram.com/gregtampubolon/',
      image:
        'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'bride',
      role: 'Bride',
      name: 'Dian Yudicia',
      detail: 'Anak Ketiga dari Keluarga Bapak Lindung Marpaung & Ibu Dumarista Sirait',
      instagram: 'https://www.instagram.com/dianyudicia/',
      image:
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=84',
    },
  ],
  events: [
    {
      id: 'blessing',
      name: 'Pemberkatan',
      date: '28 Juni 2025',
      time: '09.30 s.d. 11.30',
      timezone: '#WIB',
      venue: 'Gereja Katolik St. Maria Ratu Rosari',
      address: 'Jl. Flamboyan Raya No.139, Tj. Selamat, Kec. Medan Tuntungan, Kota Medan, Sumatera Utara',
      mapsUrl: 'https://maps.app.goo.gl/RybQBx4kozHm7STX9',
      image:
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=86',
    },
    {
      id: 'adat',
      name: 'Acara Adat',
      date: '28 Juni 2025',
      time: '12.00 s.d. 16.00',
      timezone: '#WIB',
      venue: 'Wisma Toga Sinaga',
      address:
        'Jl. Bunga Terompet Ujung No.139, Simpang Selayang, Kec. Medan Tuntungan, Kota Medan, Sumatera Utara',
      mapsUrl: 'https://maps.app.goo.gl/vN7E3wfU4d7LLjNX6',
      image:
        'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=86',
    },
  ],
  stories: [
    {
      id: 'episode-1',
      episode: 'Episode 1:',
      title: 'Putih Abu - Abu',
      body: 'Masa sekolah menyimpan awal cerita, saat rasa tumbuh pelan dan menjadi kenangan yang selalu pulang.',
      image:
        'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'episode-2',
      episode: 'Episode 2:',
      title: 'Jarak Pernah Hadir, Tapi Cinta Tak Pernah Pergi',
      body: 'Tahun-tahun berjalan dengan jarak, layar ponsel, dan doa yang sama. Waktu mengajarkan sabar, lalu membawa kami kembali.',
      image:
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=84',
    },
    {
      id: 'episode-3',
      episode: 'Episode 3:',
      title: 'Dua Hati, Satu Janji',
      body: 'Kami tidak memulai dari sempurna. Kami memilih bertumbuh bersama, saling menjaga, dan mengikat janji di hadapan Tuhan.',
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
        accountNumber: '036701014199538',
        accountName: 'Dian Yudicia',
      },
      {
        id: 'bank-2',
        type: 'Mandiri',
        accountNumber: '1370011834658',
        accountName: 'Gregory RN Tampubolon',
      },
    ],
    deliveryTitle: 'Kirim Kado',
    deliveryNote: 'Anda dapat mengirim kado ke:',
    deliveryAddress: 'Jl. Lasem No 2A, RT 5/RW 6, Menteng, Jakarta Pusat 10310',
  },
  closing: {
    body:
      'Terima kasih telah hadir dalam sukacita kami. Doa dan dukungan Anda menjadi bagian indah dari awal perjalanan ini.',
    cta: 'See you on our big day!',
    signature: 'Gregory & Dian',
  },
  guests: [
    { id: 'guest-1', name: 'Contoh Nama Tamu', slug: 'contoh-nama-tamu', qrToken: 'qr-contoh-nama-tamu' },
    { id: 'guest-2', name: 'Keluarga Besar', slug: 'keluarga-besar', qrToken: 'qr-keluarga-besar' },
  ],
  rsvps: [],
  checkIns: [],
};
