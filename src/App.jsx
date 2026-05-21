import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Calendar,
  Camera,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Gift,
  Heart,
  Image as ImageIcon,
  Instagram,
  Link as LinkIcon,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Music,
  Package,
  Pause,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Volume2,
  XCircle,
} from 'lucide-react';
import { bankTypes, defaultInvitation } from './data.js';
import {
  clearAdminSession,
  deleteRemoteRsvp,
  fetchRemoteInvitation,
  getAdminSession,
  loginAdmin,
  saveRemoteInvitation,
  saveRemoteRsvp,
  verifyAdminSession,
} from './apiClient.js';
import { loadInvitation, makeId, makeToken, resetInvitation, saveInvitation } from './storage.js';

const imageFallback =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=82';
const brandLogoSrc = '/nikahfix-logo.webp';
const developerGuestLimit = Number(import.meta.env.VITE_GUEST_LIMIT || defaultInvitation.packageConfig.guestLimit || 150);

const genreOptions = ['DOCUMENTER', 'ROMANTIS', 'DRAMA', 'KELUARGA', 'SPIRITUAL', 'WEDDING'];
const eventNameOptions = ['Akad / Pemberkatan', 'Resepsi', 'Acara Adat', 'After Party'];
const timezoneOptions = ['#WIB', '#WITA', '#WIT'];

const whatsappTemplateOptions = [
  {
    id: 'template-1',
    label: 'Opsi 1',
    text:
      'Yth. {guestName},\n\nDengan penuh sukacita kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan menjadi bagian dari hari bahagia kami.\n\nDetail undangan dapat dibuka melalui link berikut:\n{inviteLink}\n\nMerupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nSalam hangat,\n{coupleName}',
  },
  {
    id: 'template-2',
    label: 'Opsi 2',
    text:
      'Halo {guestName},\n\nKami ingin berbagi kabar bahagia. Dengan segala kerendahan hati, kami mengundang Anda untuk hadir dalam perayaan pernikahan kami.\n\nSilakan buka undangan digital berikut untuk melihat detail acara dan konfirmasi kehadiran:\n{inviteLink}\n\nDoa dan kehadiran Anda akan sangat berarti bagi kami.\n\nTerima kasih,\n{coupleName}',
  },
  {
    id: 'template-3',
    label: 'Opsi 3',
    text:
      'Kepada {guestName},\n\nHari yang kami nantikan akan segera tiba. Kami mengundang Anda untuk ikut merayakan momen penuh syukur ini bersama keluarga dan orang-orang terkasih.\n\nBuka undangan personal Anda di sini:\n{inviteLink}\n\nMohon konfirmasi kehadiran melalui halaman RSVP agar kami dapat mempersiapkan acara dengan baik.\n\nDengan kasih,\n{coupleName}',
  },
];

function getRoute() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'demo') return { type: 'demo' };
  if (parts[0] === 'admin') return { type: 'admin' };
  if (parts[0] === 'checkin') return { type: 'checkin', eventSlug: parts[1], token: parts[2] };
  if (parts[0] === 'invite') return { type: 'invite', slug: parts[1] };
  if (parts.length >= 2) return { type: 'invite', eventSlug: parts[0], slug: parts[1] };
  return { type: 'public' };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function bankMeta(type) {
  return bankTypes.find((bank) => bank.value === type) || bankTypes[0];
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

function eventSlug(invitation) {
  return slugify(invitation.site?.eventSlug || `${invitation.hero.title} ${invitation.hero.subtitle}`) || 'undangan';
}

function coupleName(invitation) {
  return `${invitation.hero.title} ${invitation.hero.subtitle}`.replace(/\s+/g, ' ').replace(/: /g, ' ').trim();
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLabel(value, fallback = 'Tanggal Pernikahan') {
  if (!value) return fallback;
  const date = safeDate(value);
  if (!date) return value || fallback;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function heroDateLabel(invitation) {
  return formatDateLabel(invitation.hero.weddingDate, invitation.hero.dateLabel || 'Tanggal Pernikahan');
}

function eventDateInput(value = '') {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);
  return '';
}

function formatEventDate(value = '') {
  const input = eventDateInput(value);
  return input ? formatDateLabel(`${input}T00:00`, 'Tanggal Acara') : value || 'Tanggal Acara';
}

function parseTimeRange(value = '') {
  const match = String(value).match(/(\d{1,2})[:.](\d{2}).*?(\d{1,2})[:.](\d{2})/);
  if (!match) return { start: '', end: '' };
  return {
    start: `${match[1].padStart(2, '0')}:${match[2]}`,
    end: `${match[3].padStart(2, '0')}:${match[4]}`,
  };
}

function formatTimeRange(start = '', end = '') {
  const normalize = (value) => String(value || '').replace(':', '.');
  if (start && end) return `${normalize(start)} s.d. ${normalize(end)}`;
  if (start) return `${normalize(start)} s.d. selesai`;
  return 'Jam Mulai s.d. Selesai';
}

function genreList(value = '') {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[•,|/]+/);
  return raw.map((item) => item.trim()).filter(Boolean);
}

function genreLabel(value = '') {
  const genres = genreList(value);
  return genres.length ? genres.join(' • ') : 'DOCUMENTER';
}

function filmReleaseLabel(invitation) {
  const date = safeDate(invitation.hero.weddingDate || invitation.events?.[0]?.date);
  return date ? String(date.getFullYear()) : 'Wedding Day';
}

function filmScheduleLabel(invitation) {
  return `Coming soon on ${heroDateLabel(invitation)}`;
}

function splitVerseText(value = '') {
  const lines = String(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) return { verse: lines[0] || '', verseSource: '' };
  const lastLine = lines[lines.length - 1];
  const looksLikeSource = /^\(.+\)$/.test(lastLine) || /\d+\s*:\s*\d+/.test(lastLine);
  return looksLikeSource
    ? { verse: lines.slice(0, -1).join('\n'), verseSource: lastLine }
    : { verse: lines.join('\n'), verseSource: '' };
}

function guestLimitFor(invitation) {
  const configured = Number(invitation.packageConfig?.guestLimit);
  const active = packageTier(invitation.packageConfig, invitation.packageConfig?.activePackage);
  const limit = Number.isFinite(configured) && configured > 0 ? configured : developerGuestLimit || active?.guestLimit;
  return Number.isFinite(limit) && limit > 0 ? limit : 150;
}

function makeGuestCode(existingGuests = []) {
  const used = new Set(existingGuests.map((guest) => guest.code).filter(Boolean));
  let counter = existingGuests.length + 1;
  let code = `NK-${String(counter).padStart(4, '0')}`;
  while (used.has(code)) {
    counter += 1;
    code = `NK-${String(counter).padStart(4, '0')}`;
  }
  return code;
}

function cloneInvitation(value = defaultInvitation) {
  return JSON.parse(JSON.stringify(value));
}

function guestLink(invitation, guest, origin = window.location.origin) {
  return `${origin}/${eventSlug(invitation)}/${guest.slug}`;
}

function qrPayload(invitation, guest, origin = window.location.origin) {
  return `${origin}/checkin/${eventSlug(invitation)}/${guest.qrToken}`;
}

function extractQrToken(value = '') {
  const raw = String(value).trim();
  const checkinMatch = raw.match(/\/checkin\/[^/]+\/([^/?#]+)/);
  if (checkinMatch) return decodeURIComponent(checkinMatch[1]);
  const tokenMatch = raw.match(/qr-[a-z0-9-]+/i);
  return tokenMatch ? tokenMatch[0] : raw;
}

const packageRanks = {
  basic: 1,
  proper: 2,
  premium: 3,
};

const featureRequirements = {
  content: 'basic',
  couple: 'basic',
  events: 'basic',
  story: 'basic',
  gifts: 'basic',
  guests: 'basic',
  guestbook: 'proper',
  scanner: 'premium',
  packages: 'basic',
};

const featureLabels = {
  content: 'Konten undangan',
  couple: 'Profil pasangan',
  events: 'Tanggal & lokasi',
  story: 'Love story & galeri',
  gifts: 'Wedding gift',
  guests: 'Bulk link tamu',
  guestbook: 'Buku tamu dan export',
  scanner: 'Scan QR check-in',
  packages: 'Konfigurasi paket',
};

const packageFeatureKeys = ['guests', 'guestbook', 'scanner'];

function normalizePackageId(value = '') {
  return value === 'standard' ? 'proper' : value || 'premium';
}

function packageRank(value) {
  return packageRanks[normalizePackageId(value)] || packageRanks.premium;
}

function packageTiers(config = defaultInvitation.packageConfig) {
  const tiers = Array.isArray(config.tiers) && config.tiers.length ? config.tiers : defaultInvitation.packageConfig.tiers;
  return tiers.map((tier) => ({ ...tier, id: normalizePackageId(tier.id) }));
}

function packageTier(config, id) {
  const normalizedId = normalizePackageId(id);
  return packageTiers(config).find((tier) => tier.id === normalizedId) || defaultInvitation.packageConfig.tiers.find((tier) => tier.id === normalizedId) || defaultInvitation.packageConfig.tiers[2];
}

function packageGate(config = defaultInvitation.packageConfig, featureKey) {
  const requiredId = featureRequirements[featureKey] || 'basic';
  const activeId = normalizePackageId(config.activePackage || defaultInvitation.packageConfig.activePackage);
  const restricted = packageRank(activeId) < packageRank(requiredId);
  return {
    featureKey,
    label: featureLabels[featureKey] || featureKey,
    activeTier: packageTier(config, activeId),
    requiredTier: packageTier(config, requiredId),
    restricted,
    locked: restricted && config.masterUnlock === false,
    masterUnlock: config.masterUnlock !== false,
  };
}

function whatsappMessage(invitation, guest, origin = window.location.origin) {
  const template = invitation.site?.whatsappTemplate || defaultInvitation.site.whatsappTemplate;
  return template
    .replaceAll('{guestName}', guest.name)
    .replaceAll('{inviteLink}', guestLink(invitation, guest, origin))
    .replaceAll('{coupleName}', coupleName(invitation));
}

function whatsappUrl(invitation, guest, origin = window.location.origin) {
  return `https://wa.me/?text=${encodeURIComponent(whatsappMessage(invitation, guest, origin))}`;
}

function guestRows(invitation) {
  return invitation.guests.map((guest, index) => {
    const rsvp = invitation.rsvps.find((item) => item.guestSlug === guest.slug);
    const checkIn = invitation.checkIns.find((item) => item.guestId === guest.id || item.guestSlug === guest.slug || item.guestCode === guest.code);
    return {
      no: index + 1,
      guest,
      rsvp,
      checkIn,
      attendance: rsvp?.attendance || 'Belum RSVP',
      pax: rsvp?.pax || '-',
      note: rsvp?.note || '',
      checkedInAt: checkIn?.checkedInAt || '',
    };
  });
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportGuestCsv(invitation) {
  const header = ['No', 'Nama Tamu', 'Kode Unik', 'Slug', 'RSVP', 'Jumlah', 'Ucapan', 'Check-in'];
  const rows = guestRows(invitation).map((row) => [
    row.no,
    row.guest.name,
    row.guest.code || row.guest.qrToken,
    row.guest.slug,
    row.attendance,
    row.pax,
    row.note,
    row.checkedInAt ? new Date(row.checkedInAt).toLocaleString('id-ID') : 'Belum hadir',
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  downloadBlob(`buku-tamu-${eventSlug(invitation)}.csv`, `\ufeff${csv}`, 'text/csv;charset=utf-8');
}

async function exportGuestPdf(invitation) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(`Buku Tamu - ${coupleName(invitation)}`, 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [['No', 'Nama Tamu', 'Kode', 'RSVP', 'Jumlah', 'Ucapan', 'Check-in']],
    body: guestRows(invitation).map((row) => [
      row.no,
      row.guest.name,
      row.guest.code || row.guest.qrToken,
      row.attendance,
      row.pax,
      row.note,
      row.checkedInAt ? new Date(row.checkedInAt).toLocaleString('id-ID') : 'Belum hadir',
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [217, 32, 40] },
  });
  doc.save(`buku-tamu-${eventSlug(invitation)}.pdf`);
}

export default function App() {
  const [route] = useState(getRoute);

  if (route.type === 'demo') {
    return <DemoPage />;
  }

  return <PersistentApp route={route} />;
}

function PersistentApp({ route }) {
  const [invitation, setInvitation] = useState(loadInvitation);
  const [adminSession, setAdminSession] = useState(getAdminSession);
  const [authChecking, setAuthChecking] = useState(route.type === 'admin' && Boolean(getAdminSession()?.token));
  const [syncStatus, setSyncStatus] = useState('local');

  useEffect(() => {
    let active = true;

    fetchRemoteInvitation().then((remoteInvitation) => {
      if (!active || !remoteInvitation) return;
      setInvitation(remoteInvitation);
      saveInvitation(remoteInvitation);
      setSyncStatus('database');
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (route.type !== 'admin' || !adminSession?.token) {
      setAuthChecking(false);
      return undefined;
    }

    let active = true;
    setAuthChecking(true);
    verifyAdminSession(adminSession).then((ok) => {
      if (!active) return;
      if (!ok) {
        clearAdminSession();
        setAdminSession(null);
      }
      setAuthChecking(false);
    });

    return () => {
      active = false;
    };
  }, [adminSession, route.type]);

  const persistAdmin = (next) => {
    setInvitation(next);
    saveInvitation(next);
    saveRemoteInvitation(next, adminSession?.token).then((ok) => setSyncStatus(ok ? 'database' : 'auth-error'));
  };

  const persistGuest = (next, action) => {
    setInvitation(next);
    saveInvitation(next);

    if (action?.type === 'rsvp') {
      saveRemoteRsvp(action.payload).then((remoteInvitation) => {
        if (remoteInvitation) {
          setInvitation(remoteInvitation);
          saveInvitation(remoteInvitation);
          setSyncStatus('database');
        } else {
          setSyncStatus('local');
        }
      });
      return;
    }

    if (action?.type === 'delete-rsvp') {
      deleteRemoteRsvp(action.guestSlug).then((remoteInvitation) => {
        if (remoteInvitation) {
          setInvitation(remoteInvitation);
          saveInvitation(remoteInvitation);
          setSyncStatus('database');
        } else {
          setSyncStatus('local');
        }
      });
      return;
    }

    setSyncStatus('local');
  };

  const handleAdminLogin = async ({ username, password }) => {
    const result = await loginAdmin(username, password);
    if (result.ok) {
      setAdminSession(result.session);
      setSyncStatus('database');
    }
    return result;
  };

  const logoutAdmin = () => {
    clearAdminSession();
    setAdminSession(null);
  };

  if (route.type === 'admin') {
    if (authChecking || !adminSession?.token) {
      return <AdminLogin onLogin={handleAdminLogin} checking={authChecking} />;
    }

    return (
      <AdminApp
        invitation={invitation}
        onLogout={logoutAdmin}
        onSave={persistAdmin}
        syncStatus={syncStatus}
      />
    );
  }

  if (route.type === 'checkin') {
    return <CheckInLanding invitation={invitation} token={route.token} />;
  }

  return (
    <InvitationApp
      invitation={invitation}
      onSave={persistGuest}
      recipientSlug={route.type === 'invite' ? route.slug : undefined}
    />
  );
}

function CheckInLanding({ invitation, token }) {
  const guest = invitation.guests.find((item) => item.qrToken === token || item.code === token);
  return (
    <main className="checkin-landing">
      <div className="checkin-card">
        <ShieldCheck size={34} />
        <BrandLogo label={invitation.brand} variant="mini" />
        <h1>QR Check-in</h1>
        <p>
          QR ini terdaftar untuk {guest?.name || 'tamu undangan'}, dan validasinya dilakukan melalui scanner admin.
        </p>
        <a className="red-wide" href="/">
          Buka Undangan
        </a>
      </div>
    </main>
  );
}

const defaultDemoForm = {
  groomName: '',
  brideName: '',
  guestName: 'Calon Tamu',
  weddingDate: '2026-12-12T09:00',
  venue: '',
  city: '',
  storySeed: '',
  heroImage: '',
  galleryImages: [],
};

function formatDemoDate(value) {
  if (!value) return 'Tanggal Pernikahan';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal Pernikahan';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDemoTime(value) {
  if (!value) return 'Jam Mulai';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Jam Mulai';
  return `${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} s.d. selesai`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildDemoInvitation(form) {
  const groom = form.groomName.trim() || 'Nama Pria';
  const bride = form.brideName.trim() || 'Nama Wanita';
  const guestName = form.guestName.trim() || 'Calon Tamu';
  const dateLabel = formatDemoDate(form.weddingDate);
  const timeLabel = formatDemoTime(form.weddingDate);
  const venue = form.venue.trim() || 'Nama Venue Pernikahan';
  const city = form.city.trim() || 'Kota atau alamat acara';
  const storySeed = form.storySeed.trim() || 'awal yang sederhana, proses saling mengenal, dan keputusan untuk bertumbuh bersama';
  const heroImage = form.heroImage || defaultInvitation.hero.heroImage;
  const gallery = [form.heroImage, ...form.galleryImages, ...defaultInvitation.gallery].filter(Boolean).slice(0, 9);
  const guestSlug = slugify(guestName) || 'calon-tamu';
  const coupleSlug = slugify(`${groom} ${bride}`) || 'nama-pria-nama-wanita';

  return {
    ...cloneInvitation(defaultInvitation),
    site: {
      ...defaultInvitation.site,
      eventSlug: `nikahan-kita-${coupleSlug}`,
    },
    cover: {
      ...defaultInvitation.cover,
      guestFallback: guestName,
    },
    hero: {
      ...defaultInvitation.hero,
      title: `${groom} & ${bride}:`,
      dateLabel,
      weddingDate: form.weddingDate || defaultInvitation.hero.weddingDate,
      heroImage,
      trailerImage: heroImage,
      tags: [`#${groom.replace(/\s/g, '')}${bride.replace(/\s/g, '')}`, '#FinalEpisodeOfLove', '#NikahanKita'],
    },
    film: {
      ...defaultInvitation.film,
      title: `"${groom} & ${bride}: Final Episode of Love"`,
      release: dateLabel,
      scheduleLabel: `Coming soon on ${dateLabel}`,
      synopsis: `${groom} dan ${bride} ingin membagikan kabar bahagia tentang hari yang mereka nanti. Undangan ini menjadi cuplikan kecil dari perjalanan mereka menuju janji pernikahan.`,
    },
    news: {
      ...defaultInvitation.news,
      image: heroImage,
      paragraphs: [
        `Hai ${guestName}, dengan penuh sukacita ${groom} dan ${bride} mengundang Anda menjadi bagian dari hari pernikahan mereka.`,
        `Semoga kehadiran dan doa baik Anda membuat hari ini semakin hangat dan berkesan.`,
        'Best regards,',
        `${groom} & ${bride}`,
      ],
    },
    couple: [
      {
        ...defaultInvitation.couple[0],
        name: groom,
        detail: `Calon mempelai pria yang siap memulai babak baru bersama ${bride}.`,
        image: heroImage,
      },
      {
        ...defaultInvitation.couple[1],
        name: bride,
        detail: `Calon mempelai wanita yang akan melangkah bersama ${groom}.`,
        image: form.galleryImages[0] || heroImage,
      },
    ],
    events: [
      {
        ...defaultInvitation.events[0],
        name: 'Akad / Pemberkatan',
        date: dateLabel,
        time: timeLabel,
        venue,
        address: city,
        image: form.galleryImages[1] || heroImage,
      },
      {
        ...defaultInvitation.events[1],
        date: dateLabel,
        time: timeLabel,
        venue: `Resepsi di ${venue}`,
        address: city,
        image: form.galleryImages[2] || heroImage,
      },
    ],
    stories: [
      {
        ...defaultInvitation.stories[0],
        title: 'Awal yang Tidak Terduga',
        body: `Cerita ${groom} dan ${bride} bermula dari ${storySeed}. Dari sana, percakapan kecil perlahan menjadi tempat pulang yang hangat.`,
        image: form.galleryImages[3] || heroImage,
      },
      {
        ...defaultInvitation.stories[1],
        title: 'Bertumbuh Bersama',
        body: `Mereka belajar bahwa cinta bukan hanya tentang hari yang mudah, tetapi juga tentang memilih saling menjaga saat keadaan tidak selalu sempurna.`,
        image: form.galleryImages[4] || heroImage,
      },
      {
        ...defaultInvitation.stories[2],
        title: 'Satu Janji',
        body: `Kini ${groom} dan ${bride} siap merayakan janji mereka bersama keluarga, sahabat, dan orang-orang yang berarti.`,
        image: form.galleryImages[5] || heroImage,
      },
    ],
    gallery,
    closing: {
      ...defaultInvitation.closing,
      body: `Terima kasih telah berbagi doa, waktu, dan kehangatan untuk ${groom} dan ${bride}. Semoga hari ini menjadi awal cerita yang penuh kasih.`,
      signature: `${groom} & ${bride}`,
    },
    guests: [{ id: 'demo-guest', name: guestName, slug: guestSlug, code: 'NK-DEMO', qrToken: 'qr-demo-preview' }],
    rsvps: [],
    checkIns: [],
  };
}

function DemoPage() {
  const [form, setForm] = useState(defaultDemoForm);
  const [demoState, setDemoState] = useState({ rsvps: [], checkIns: [] });
  const [previewOpen, setPreviewOpen] = useState(false);
  const invitation = useMemo(() => {
    const built = buildDemoInvitation(form);
    return { ...built, rsvps: demoState.rsvps, checkIns: demoState.checkIns };
  }, [demoState, form]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateDemoState = (next) => setDemoState({ rsvps: next.rsvps || [], checkIns: next.checkIns || [] });

  const uploadHero = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateForm('heroImage', dataUrl);
  };

  const uploadGallery = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 6);
    if (files.length === 0) return;
    const dataUrls = await Promise.all(files.map(fileToDataUrl));
    updateForm('galleryImages', dataUrls);
  };

  const resetDemo = () => {
    setForm(defaultDemoForm);
    setDemoState({ rsvps: [], checkIns: [] });
  };

  return (
    <main className="demo-page">
      <section className="demo-studio">
        <header className="demo-header">
          <div>
            <BrandLogo label="NIKAHFIX" variant="mini" />
            <h1>Demo Invitation Studio</h1>
            <p>Calon client cukup isi detail kecil, upload foto sementara, lalu langsung melihat simulasi undangan tanpa menyimpan ke database.</p>
          </div>
          <a className="ghost-button" href="/">
            Lihat Template Utama
          </a>
        </header>

        <div className="demo-grid">
          <form className="demo-panel demo-form">
            <div className="panel-title-row">
              <h2>Isi Cepat</h2>
              <span className="count-label">No database</span>
            </div>
            <TextField label="Nama Mempelai Pria" value={form.groomName} onChange={(value) => updateForm('groomName', value)} />
            <TextField label="Nama Mempelai Wanita" value={form.brideName} onChange={(value) => updateForm('brideName', value)} />
            <TextField label="Nama Tamu Preview" value={form.guestName} onChange={(value) => updateForm('guestName', value)} />
            <TextField label="Tanggal & Jam" type="datetime-local" value={form.weddingDate} onChange={(value) => updateForm('weddingDate', value)} />
            <TextField label="Nama Venue" value={form.venue} onChange={(value) => updateForm('venue', value)} />
            <TextField label="Kota / Alamat Singkat" textarea value={form.city} onChange={(value) => updateForm('city', value)} />
            <TextField label="Gaya Cerita Singkat" textarea value={form.storySeed} onChange={(value) => updateForm('storySeed', value)} />

            <label className="upload-drop">
              <Upload size={20} />
              Upload Foto Cover Sementara
              <input type="file" accept="image/*" onChange={uploadHero} />
            </label>
            <label className="upload-drop">
              <Camera size={20} />
              Upload Foto Galeri Sementara
              <input type="file" accept="image/*" multiple onChange={uploadGallery} />
            </label>
            <div className="demo-actions">
              <button className="red-wide" type="button" onClick={() => setPreviewOpen(true)}>
                <Sparkles size={16} />
                Lihat Preview Full
              </button>
              <button className="ghost-button" type="button" onClick={resetDemo}>
                <RefreshCw size={16} />
                Reset Demo
              </button>
            </div>
          </form>

          <section className="demo-panel demo-preview-panel">
            <div className="panel-title-row">
              <h2>Live Preview</h2>
              <button className="ghost-button" type="button" onClick={() => setPreviewOpen(true)}>
                <Eye size={16} />
                Buka
              </button>
            </div>
            <DemoPhonePreview invitation={invitation} />
          </section>
        </div>
      </section>

      {previewOpen && (
        <div className="demo-fullscreen">
          <button className="story-modal-close demo-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Tutup preview demo">
            <XCircle size={24} />
          </button>
          <InvitationApp invitation={invitation} onSave={updateDemoState} recipientSlug={invitation.guests[0]?.slug} />
        </div>
      )}
    </main>
  );
}

function DemoPhonePreview({ invitation }) {
  return (
    <div className="demo-phone">
      <div className="demo-phone-hero" style={{ '--hero-image': `url("${invitation.hero.heroImage || imageFallback}")` }}>
        <div className="demo-phone-fade" />
        <div>
          <BrandLogo label={invitation.brand} variant="phone" />
          <h3>{invitation.hero.title}</h3>
          <p>{heroDateLabel(invitation)}</p>
        </div>
      </div>
      <div className="demo-phone-section">
        <h4>Date, Time & Location</h4>
        <div className="demo-phone-event">
          <img src={invitation.events[0]?.image || imageFallback} alt="" />
          <div>
            <strong>{invitation.events[0]?.name}</strong>
            <span>{formatEventDate(invitation.events[0]?.date)}</span>
            <p>{invitation.events[0]?.venue}</p>
          </div>
        </div>
      </div>
      <div className="demo-phone-section">
        <h4>Our Love Story</h4>
        <div className="demo-phone-story">
          <img src={invitation.stories[0]?.image || imageFallback} alt="" />
          <div>
            <strong>{invitation.stories[0]?.title}</strong>
            <p>{invitation.stories[0]?.body}</p>
          </div>
        </div>
      </div>
      <div className="demo-phone-gallery">
        {invitation.gallery.slice(0, 6).map((src, index) => (
          <img src={src || imageFallback} alt="" key={`${src}-${index}`} />
        ))}
      </div>
    </div>
  );
}

function useCinematicScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const shell = document.querySelector('.invitation-shell');
    if (!shell) return undefined;

    const nodes = Array.from(shell.querySelectorAll('[data-reveal]'));
    nodes.forEach((node, index) => {
      node.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 70, 280)}ms`);
    });

    const updateProgress = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      shell.style.setProperty('--scroll-progress', progress.toFixed(3));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
    };
  }, [enabled]);
}

function InvitationApp({ invitation, onSave, recipientSlug }) {
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [copied, setCopied] = useState('');
  const audioRef = useRef(null);
  const heroRef = useRef(null);
  const guest = useMemo(() => {
    if (!recipientSlug) return null;
    return invitation.guests.find((item) => item.slug === recipientSlug) || null;
  }, [invitation.guests, recipientSlug]);
  const guestName = guest?.name || invitation.cover.guestFallback;

  useCinematicScroll(opened);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  const openInvitation = () => {
    document.activeElement?.blur?.();
    setOpened(true);
    window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), 620);
    if (invitation.music.enabled && audioRef.current) {
      audioRef.current.volume = 0.55;
      audioRef.current
        .play()
        .then(() => setAudioOn(true))
        .catch(() => setAudioOn(false));
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setAudioOn(true));
    } else {
      audioRef.current.pause();
      setAudioOn(false);
    }
  };

  const saveRsvp = (payload) => {
    const existing = invitation.rsvps.find((rsvp) => rsvp.guestSlug === payload.guestSlug);
    const nextRsvps = existing
      ? invitation.rsvps.map((rsvp) => (rsvp.guestSlug === payload.guestSlug ? { ...rsvp, ...payload } : rsvp))
      : [{ id: makeId('rsvp'), createdAt: new Date().toISOString(), ...payload }, ...invitation.rsvps];
    onSave({ ...invitation, rsvps: nextRsvps }, { type: 'rsvp', payload });
  };

  const deleteRsvp = (guestSlug) => {
    onSave(
      { ...invitation, rsvps: invitation.rsvps.filter((rsvp) => rsvp.guestSlug !== guestSlug) },
      { type: 'delete-rsvp', guestSlug },
    );
  };

  const flashCopy = (key, text) => {
    copyText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1200);
  };

  return (
    <main className="invite-page">
      {loading && <Preloader />}
      <audio ref={audioRef} loop src={invitation.music.src} />
      <CoverLayer invitation={invitation} guestName={guestName} opened={opened} onOpen={openInvitation} />
      <div className="invitation-shell" aria-hidden={!opened}>
        <div className="cinema-progress" aria-hidden="true">
          <span />
        </div>
        <HeroSection invitation={invitation} heroRef={heroRef} />
        <FilmSection invitation={invitation} />
        <NewsSection invitation={invitation} />
        <CoupleSection invitation={invitation} />
        <EventsSection invitation={invitation} onConfirm={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })} />
        <StorySection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <GiftSection invitation={invitation} copied={copied} onCopy={flashCopy} />
        <RsvpSection invitation={invitation} guest={guest} guestName={guestName} onSave={saveRsvp} onDelete={deleteRsvp} />
        <WishWallSection invitation={invitation} />
        <ClosingSection invitation={invitation} />
      </div>
      {opened && (
        <button className="music-fab" type="button" onClick={toggleAudio} aria-label={audioOn ? 'Pause music' : 'Play music'}>
          {audioOn ? <Volume2 size={24} /> : <Music size={24} />}
        </button>
      )}
    </main>
  );
}

function Preloader() {
  return (
    <div className="preloader" role="status" aria-label="Loading invitation">
      <span className="loader-square" />
    </div>
  );
}

function CoverLayer({ invitation, guestName, opened, onOpen }) {
  return (
    <section className={`cover-layer ${opened ? 'cover-opened' : ''}`}>
      <div className="cover-stack">
        <BrandLogo label={invitation.brand} variant="cover" />
        <p>{invitation.cover.prompt}</p>
        <div className="profile-face" aria-hidden="true">
          <span />
          <span />
          <i />
        </div>
        <strong>{guestName}</strong>
        <button className="outline-cta" type="button" onClick={onOpen}>
          {invitation.cover.buttonLabel}
        </button>
      </div>
    </section>
  );
}

function HeroSection({ invitation, heroRef }) {
  return (
    <section ref={heroRef} className="hero-section" style={{ '--hero-image': `url("${invitation.hero.heroImage || imageFallback}")` }}>
      <div className="hero-vignette" />
      <div className="hero-copy reveal-up">
        <BrandLogo label={invitation.brand} variant="mini" />
        <h1>
          {invitation.hero.title}
          <span>{invitation.hero.subtitle}</span>
        </h1>
        <div className="meta-line">
          <span className="red-pill">{invitation.hero.status}</span>
          <span>{heroDateLabel(invitation)}</span>
        </div>
        <div className="tag-row">
          {invitation.hero.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmSection({ invitation }) {
  return (
    <section className="content-section film-section reveal-on-scroll" data-reveal>
      <div className="poster-frame">
        <img src={invitation.hero.trailerImage || imageFallback} alt="" />
        <button type="button" className="play-badge" aria-label="Play teaser">
          <Play size={20} fill="currentColor" />
        </button>
      </div>
      <div className="genre-row">
        <span className="netflix-n">N</span>
        <span>{genreLabel(invitation.film.genre)}</span>
      </div>
      <h2>{invitation.film.title}</h2>
      <div className="film-meta">
        <span className="match">100% match</span>
        <span className="rating">SU</span>
        <span>{filmReleaseLabel(invitation)}</span>
        {invitation.film.quality.map((item) => (
          <span className="quality" key={item}>
            {item}
          </span>
        ))}
      </div>
      <button className="red-wide" type="button">
        {filmScheduleLabel(invitation)}
      </button>
      <p>{invitation.film.synopsis}</p>
      <blockquote>
        {invitation.film.verse}
        {invitation.film.verseSource && <cite>{invitation.film.verseSource}</cite>}
      </blockquote>
    </section>
  );
}

function NewsSection({ invitation }) {
  return (
    <section className="content-section reveal-on-scroll" data-reveal>
      <h2>{invitation.news.title}</h2>
      <figure className="news-card">
        <img src={invitation.news.image || imageFallback} alt="" />
        <figcaption>
          {invitation.news.paragraphs.map((text, index) => (
            <p key={`${text}-${index}`}>{text}</p>
          ))}
        </figcaption>
      </figure>
    </section>
  );
}

function CoupleSection({ invitation }) {
  return (
    <section id="couple" className="content-section reveal-on-scroll" data-reveal>
      <h2>Bride & Groom</h2>
      <div className="person-list">
        {invitation.couple.map((person) => (
          <article className="person-card" key={person.id}>
            <img src={person.image || imageFallback} alt="" />
            <div>
              <span>{person.role}</span>
              <h3>{person.name}</h3>
              <p>{person.detail}</p>
              {person.instagram && (
                <a href={person.instagram} target="_blank" rel="noreferrer">
                  <Instagram size={17} />
                  Instagram
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventsSection({ invitation, onConfirm }) {
  return (
    <section className="content-section events-section reveal-on-scroll" data-reveal>
      <h2>Date, Time & Location</h2>
      <div className="event-list">
        {invitation.events.map((event) => (
          <article className="event-card" key={event.id}>
            <img src={event.image || imageFallback} alt="" />
            <div className="event-head">
              <span className="red-pill">{event.name}</span>
              <h3>{formatEventDate(event.date)}</h3>
              <div className="meta-line">
                <span className="soft-pill">{event.time}</span>
                <span className="soft-pill">{event.timezone}</span>
              </div>
            </div>
            <div className="event-copy">
              <strong>{event.venue}</strong>
              <p>{event.address}</p>
              <a href={event.mapsUrl} target="_blank" rel="noreferrer">
                Buka Google Maps &gt;&gt;
              </a>
            </div>
          </article>
        ))}
      </div>
      <button className="confirm-button" type="button" onClick={onConfirm}>
        KONFIRMASI KEHADIRAN
      </button>
      <Countdown target={invitation.hero.weddingDate} />
      <a className="save-date" href={calendarUrl(invitation)} target="_blank" rel="noreferrer">
        <Calendar size={18} />
        SAVE THE DATE
      </a>
    </section>
  );
}

function calendarUrl(invitation) {
  const title = encodeURIComponent(`${invitation.hero.title} ${invitation.hero.subtitle}`.replace(/\s+/g, ' ').trim());
  const location = encodeURIComponent(invitation.events[0]?.venue || '');
  return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&location=${location}`;
}

function Countdown({ target }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const units = [
    ['Hari', days],
    ['Jam', hours],
    ['Menit', minutes],
    ['Detik', seconds],
  ];
  return (
    <div className="countdown">
      {units.map(([label, value]) => (
        <span key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          {label}
        </span>
      ))}
    </div>
  );
}

function BrandLogo({ label = 'NIKAHFIX', variant = 'mini' }) {
  return (
    <div className={`brand-logo brand-logo-${variant}`} aria-label={label}>
      <img src={brandLogoSrc} alt="" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function StorySection({ invitation }) {
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <section id="love-story" className="content-section reveal-on-scroll" data-reveal>
      <h2>Our Love Story</h2>
      <div className="episode-shelf">
        {invitation.stories.map((story) => (
          <article
            className="episode-cover"
            key={story.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedStory(story)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedStory(story);
              }
            }}
            aria-label={`Lihat detail ${story.episode} ${story.title}`}
          >
            <div className="episode-cover-head">
              <img src={story.image || imageFallback} alt="" />
              <div className="episode-cover-copy">
                <h3>
                  <span>{String(story.episode || '').replace(/:+$/g, '')}:</span>
                  {story.title}
                </h3>
              </div>
            </div>
            <div className="episode-body">
              <p>{story.body}</p>
            </div>
          </article>
        ))}
      </div>
      {selectedStory && (
        <div className="story-modal" role="dialog" aria-modal="true" aria-label={`Detail ${selectedStory.title}`}>
          <div className="story-modal-card">
            <button className="story-modal-close" type="button" onClick={() => setSelectedStory(null)} aria-label="Tutup detail episode">
              <XCircle size={24} />
            </button>
            <div className="story-modal-poster">
              <img src={selectedStory.image || imageFallback} alt="" />
            </div>
            <div className="story-modal-copy">
              <span className="netflix-n">N</span>
              <span className="episode-label">{selectedStory.episode}</span>
              <h3>{selectedStory.title}</h3>
              <div className="film-meta">
                <span className="match">100% match</span>
                <span className="rating">SU</span>
                <span>{selectedStory.duration || '03 min read'}</span>
              </div>
              <p>{selectedStory.body}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function GallerySection({ invitation }) {
  return (
    <section className="content-section memories-section reveal-on-scroll" data-reveal>
      <h2>Our Memories</h2>
      <div className="memory-grid">
        {invitation.gallery.map((src, index) => (
          <img src={src || imageFallback} alt="" key={`${src}-${index}`} />
        ))}
      </div>
    </section>
  );
}

function GiftSection({ invitation, copied, onCopy }) {
  return (
    <section className="content-section reveal-on-scroll" data-reveal>
      <h2>Wedding Gift</h2>
      <p className="section-intro">{invitation.gifts.intro}</p>
      <div className="bank-list">
        {invitation.gifts.banks.map((bank) => {
          const meta = bankMeta(bank.type);
          return (
            <article className="bank-card" key={bank.id} style={{ '--bank-color': meta.color }}>
              <div className="bank-logo">{meta.label}</div>
              <strong>{bank.accountNumber}</strong>
              <button type="button" onClick={() => onCopy(bank.id, bank.accountNumber)}>
                <Copy size={16} />
                {copied === bank.id ? 'Tersalin' : 'Salin Rekening'}
              </button>
              <span>{bank.accountName}</span>
            </article>
          );
        })}
      </div>
      <article className="delivery-card">
        <h3>{invitation.gifts.deliveryTitle}</h3>
        <p>{invitation.gifts.deliveryNote}</p>
        <strong>{invitation.gifts.deliveryAddress}</strong>
        <button type="button" onClick={() => onCopy('address', invitation.gifts.deliveryAddress)}>
          <Copy size={16} />
          {copied === 'address' ? 'Tersalin' : 'Salin Alamat'}
        </button>
      </article>
    </section>
  );
}

function RsvpSection({ invitation, guest, guestName, onSave, onDelete }) {
  const guestSlug = guest?.slug || slugify(guestName || 'tamu-undangan') || 'tamu-undangan';
  const existing = invitation.rsvps.find((rsvp) => rsvp.guestSlug === guestSlug);
  const guestForQr = guest || invitation.guests.find((item) => item.slug === guestSlug);
  const [form, setForm] = useState(
    existing || {
      guestSlug,
      guestName,
      attendance: 'Hadir',
      pax: '1',
      note: '',
    },
  );

  useEffect(() => {
    setForm(
      existing || {
        guestSlug,
        guestName,
        attendance: 'Hadir',
        pax: '1',
        note: '',
      },
    );
  }, [existing, guestName, guestSlug]);

  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, guestSlug, guestName: form.guestName || guestName, updatedAt: new Date().toISOString() });
  };

  return (
    <section className="content-section rsvp-section reveal-on-scroll" id="rsvp" data-reveal>
      <h2>RSVP</h2>
      <form className="rsvp-form" onSubmit={submit}>
        <label>
          Nama
          <input value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} />
        </label>
        <label>
          Kehadiran
          <select value={form.attendance} onChange={(event) => setForm({ ...form, attendance: event.target.value })}>
            <option>Hadir</option>
            <option>Tidak Hadir</option>
            <option>Masih Ragu</option>
          </select>
        </label>
        <label>
          Jumlah Tamu
          <input
            min="1"
            type="number"
            value={form.pax}
            onChange={(event) => setForm({ ...form, pax: event.target.value })}
          />
        </label>
        <label>
          Ucapan
          <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </label>
        <div className="form-actions">
          <button className="red-wide" type="submit">
            <Send size={16} />
            {existing ? 'UPDATE RSVP' : 'KIRIM RSVP'}
          </button>
          {existing && (
            <button className="ghost-button" type="button" onClick={() => onDelete(guestSlug)}>
              <Trash2 size={16} />
              HAPUS RSVP
            </button>
          )}
        </div>
      </form>
      {guestForQr?.qrToken && (
        <article className="guest-confirmation-card">
          <div>
            <span className="confirmation-label">QR CHECK-IN</span>
            <h3>{existing ? 'Konfirmasi tersimpan' : 'QR tamu undangan'}</h3>
            <p>
              QR ini khusus untuk {guestForQr.name}. Tunjukkan kepada panitia saat hadir agar check-in masuk otomatis ke buku tamu.
            </p>
          </div>
          <div className="guest-qr-card">
            <GuestQrCode invitation={invitation} guest={guestForQr} />
            <strong>{guestForQr.name}</strong>
          </div>
        </article>
      )}
    </section>
  );
}

function WishWallSection({ invitation }) {
  const wishes = invitation.rsvps.filter((item) => item.note?.trim());

  return (
    <section className="content-section wish-section reveal-on-scroll" data-reveal>
      <div className="section-title-row">
        <h2>Ucapan & Doa</h2>
        <span>{wishes.length} pesan</span>
      </div>
      {wishes.length === 0 ? (
        <div className="wish-empty">
          <MessageCircle size={24} />
          <strong>Belum ada ucapan masuk</strong>
          <p>Setiap ucapan dari tamu akan tampil di sini sebagai wall animasi.</p>
        </div>
      ) : (
        <div className="wish-wall">
          {wishes.map((item, index) => (
            <article className="wish-card" key={item.id || item.guestSlug} style={{ '--delay': `${Math.min(index * 90, 720)}ms` }}>
              <Sparkles size={18} aria-hidden="true" />
              <div className="wish-card-head">
                <strong>{item.guestName}</strong>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ClosingSection({ invitation }) {
  return (
    <section className="closing-section reveal-on-scroll" data-reveal>
      <div className="closing-photo">
        <img src={invitation.news.image || invitation.hero.trailerImage || imageFallback} alt="" />
      </div>
      <Heart size={30} fill="currentColor" />
      <p>{invitation.closing.body}</p>
      <strong>{invitation.closing.cta}</strong>
      <h2>{invitation.closing.signature}</h2>
    </section>
  );
}

function AdminLogin({ onLogin, checking }) {
  const [username, setUsername] = useState('Owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await onLogin({ username, password });
    setSubmitting(false);
    if (!result.ok) setError(result.error || 'Login admin gagal.');
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <BrandLogo label="NIKAHFIX" variant="cover" />
        <span className="login-kicker">Admin Invitation Studio</span>
        <h1>Masuk sebagai Owner</h1>
        <p>Dashboard admin terhubung ke backend. Login diperlukan untuk mengubah konten, tamu, RSVP, gift, dan QR check-in.</p>
        <form className="admin-login-form" onSubmit={submit}>
          <label>
            ID Admin
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <strong className="login-error">{error}</strong>}
          <button className="red-wide" type="submit" disabled={checking || submitting}>
            <ShieldCheck size={16} />
            {checking ? 'MEMERIKSA SESSION' : submitting ? 'MASUK...' : 'MASUK ADMIN'}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminApp({ invitation, onLogout, onSave, syncStatus }) {
  const [draft, setDraft] = useState(invitation);
  const [tab, setTab] = useState('content');
  const [saved, setSaved] = useState(false);
  const [packageNotice, setPackageNotice] = useState(null);

  useEffect(() => setDraft(invitation), [invitation]);

  const commit = () => {
    onSave(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const autosave = (next) => {
    onSave(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const tabs = [
    ['content', Eye, 'Konten'],
    ['couple', Heart, 'Pasangan'],
    ['events', MapPin, 'Acara'],
    ['story', ImageIcon, 'Story'],
    ['gifts', CreditCard, 'Gift'],
    ['guests', Users, 'Link Tamu'],
    ['guestbook', ClipboardList, 'Buku Tamu'],
    ['scanner', ScanLine, 'Scan QR'],
  ];

  const openTab = (key) => {
    const gate = packageGate(draft.packageConfig, key);
    if (gate.restricted) {
      setPackageNotice(gate);
      if (gate.locked) return;
    }
    setTab(key);
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <BrandLogo label={draft.brand} variant="admin" />
        <nav>
          {tabs.map(([key, Icon, label]) => {
            const gate = packageGate(draft.packageConfig, key);
            return (
              <button
                className={`${tab === key ? 'active' : ''} ${gate.restricted ? 'is-pro-feature' : ''}`}
                key={key}
                type="button"
                onClick={() => openTab(key)}
              >
                <Icon size={18} />
                <span className="nav-label">{label}</span>
                {gate.restricted && (
                  <span className="pro-lock-badge">
                    <Lock size={12} />
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <a className="preview-link" href="/">
          <Eye size={18} />
          Preview Undangan
        </a>
      </aside>
      <section className="admin-workspace">
        <header className="admin-header">
          <div>
            <h1>Admin Invitation Studio</h1>
            <p>Kelola konten, bulk link tamu, WhatsApp, buku tamu, dan QR check-in yang tersinkron ke backend.</p>
            <span className={`sync-badge ${syncStatus === 'database' ? 'online' : ''}`}>
              {syncStatus === 'database'
                ? 'Database Neon aktif'
                : syncStatus === 'auth-error'
                  ? 'Session admin perlu login ulang'
                  : 'Mode lokal / menunggu API'}
            </span>
          </div>
          <div className="admin-actions">
            <button className="ghost-button" type="button" onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </button>
            <button className="ghost-button" type="button" onClick={() => setDraft(resetInvitation())}>
              Reset
            </button>
            <button className="red-wide" type="button" onClick={commit}>
              <Save size={16} />
              {saved ? 'TERSIMPAN' : 'SIMPAN SEMUA'}
            </button>
          </div>
        </header>

        {tab === 'content' && <ContentEditor draft={draft} setDraft={setDraft} />}
        {tab === 'couple' && <CoupleEditor draft={draft} setDraft={setDraft} />}
        {tab === 'events' && <EventsEditor draft={draft} setDraft={setDraft} />}
        {tab === 'story' && <StoryGalleryEditor draft={draft} setDraft={setDraft} />}
        {tab === 'gifts' && <GiftEditor draft={draft} setDraft={setDraft} />}
        {tab === 'guests' && <GuestRsvpEditor draft={draft} setDraft={setDraft} onAutosave={autosave} />}
        {tab === 'guestbook' && <GuestBookEditor draft={draft} setDraft={setDraft} onAutosave={autosave} />}
        {tab === 'scanner' && <ScannerEditor draft={draft} setDraft={setDraft} onSave={autosave} />}
      </section>
      {packageNotice && <PackageGateModal notice={packageNotice} onClose={() => setPackageNotice(null)} />}
    </main>
  );
}

function PackageGateModal({ notice, onClose }) {
  return (
    <div className="package-gate-overlay" role="dialog" aria-modal="true" aria-labelledby="package-gate-title">
      <article className="package-gate-modal">
        <div className="package-gate-mark">
          <Lock size={22} />
          <span>PRO</span>
        </div>
        <h2 id="package-gate-title">Fitur {notice.label}</h2>
        <p>
          Anda saat ini berada di paket <strong>{notice.activeTier.name}</strong>. Fitur ini tersedia mulai paket{' '}
          <strong>{notice.requiredTier.name}</strong>.
        </p>
        <p className="helper-text">
          {notice.masterUnlock
            ? 'Master unlock aktif, jadi template ini tetap bisa membuka semua fitur untuk kebutuhan demo dan development.'
            : 'Mode kunci aktif. Naikkan paket client agar fitur ini bisa digunakan di dashboard.'}
        </p>
        <button className="red-wide" type="button" onClick={onClose}>
          Mengerti
        </button>
      </article>
    </div>
  );
}

function updateNested(setDraft, section, key, value) {
  setDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
}

function TextField({ label, value, onChange, textarea = false, type = 'text' }) {
  const Input = textarea ? 'textarea' : 'input';
  return (
    <label className="field">
      {label}
      <Input type={textarea ? undefined : type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TemplatePicker({ onSelect }) {
  return (
    <div className="template-choice-grid">
      {whatsappTemplateOptions.map((template) => (
        <button className="template-choice" type="button" key={template.id} onClick={() => onSelect(template.text)}>
          <strong>{template.label}</strong>
          <span>{template.text.split('\n')[0]}</span>
        </button>
      ))}
    </div>
  );
}

function ContentEditor({ draft, setDraft }) {
  const updateTag = (index, value) => {
    const tags = [...draft.hero.tags];
    tags[index] = value;
    updateNested(setDraft, 'hero', 'tags', tags);
  };
  const updateNewsParagraph = (index, value) => {
    const paragraphs = [...draft.news.paragraphs];
    paragraphs[index] = value;
    updateNested(setDraft, 'news', 'paragraphs', paragraphs);
  };
  const selectedGenres = genreList(draft.film.genre);
  const toggleGenre = (genre) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((item) => item !== genre)
      : [...selectedGenres, genre];
    updateNested(setDraft, 'film', 'genre', genreLabel(next));
  };
  const updateWeddingDate = (value) => {
    setDraft((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        weddingDate: value,
        dateLabel: formatDateLabel(value, prev.hero.dateLabel || 'Tanggal Pernikahan'),
      },
    }));
  };
  const updateVerse = (value) => {
    const verse = splitVerseText(value);
    setDraft((prev) => ({ ...prev, film: { ...prev.film, ...verse } }));
  };

  return (
    <div className="editor-grid">
      <section className="editor-panel">
        <h2>Cover & Hero</h2>
        <TextField label="Brand" value={draft.brand} onChange={(value) => setDraft({ ...draft, brand: value })} />
        <TextField label="Slug URL Client" value={draft.site.eventSlug} onChange={(value) => updateNested(setDraft, 'site', 'eventSlug', slugify(value))} />
        <TextField label="Judul" value={draft.hero.title} onChange={(value) => updateNested(setDraft, 'hero', 'title', value)} />
        <TextField label="Subjudul" value={draft.hero.subtitle} onChange={(value) => updateNested(setDraft, 'hero', 'subtitle', value)} />
        <TextField label="Tanggal & Jam Pernikahan" type="datetime-local" value={draft.hero.weddingDate} onChange={updateWeddingDate} />
        <TextField label="Hero Image URL" value={draft.hero.heroImage} onChange={(value) => updateNested(setDraft, 'hero', 'heroImage', value)} />
        <TextField label="Trailer Image URL" value={draft.hero.trailerImage} onChange={(value) => updateNested(setDraft, 'hero', 'trailerImage', value)} />
        <div className="automation-note">
          <Lock size={16} />
          <span>Cover prompt, tombol open invitation, nama tamu cover, status film, match, rating, dan schedule dibuat otomatis dari sistem.</span>
        </div>
        <div className="chip-editor">
          {draft.hero.tags.map((tag, index) => (
            <input key={`${tag}-${index}`} value={tag} onChange={(event) => updateTag(index, event.target.value)} />
          ))}
          <button type="button" onClick={() => updateNested(setDraft, 'hero', 'tags', [...draft.hero.tags, '#newtag'])}>
            <Plus size={16} />
            Tag
          </button>
        </div>
      </section>

      <section className="editor-panel">
        <h2>Film Copy</h2>
        <label className="field">
          Genre
          <div className="option-button-grid">
            {genreOptions.map((genre) => (
              <button
                className={selectedGenres.includes(genre) ? 'selected' : ''}
                type="button"
                key={genre}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </label>
        <TextField label="Judul Film" value={draft.film.title} onChange={(value) => updateNested(setDraft, 'film', 'title', value)} />
        <TextField label="Synopsis" textarea value={draft.film.synopsis} onChange={(value) => updateNested(setDraft, 'film', 'synopsis', value)} />
        <TextField
          label="Ayat / Kutipan"
          textarea
          value={[draft.film.verse, draft.film.verseSource].filter(Boolean).join('\n')}
          onChange={updateVerse}
        />
        <p className="helper-text">Musik memakai file bawaan di root project dan tidak dibuka sebagai CRUD client.</p>
      </section>

      <section className="editor-panel wide">
        <h2>Breaking News & Closing</h2>
        <TextField label="News Image URL" value={draft.news.image} onChange={(value) => updateNested(setDraft, 'news', 'image', value)} />
        {draft.news.paragraphs.map((paragraph, index) => (
          <TextField key={index} label={`News Paragraph ${index + 1}`} textarea value={paragraph} onChange={(value) => updateNewsParagraph(index, value)} />
        ))}
        <button
          className="ghost-button"
          type="button"
          onClick={() => updateNested(setDraft, 'news', 'paragraphs', [...draft.news.paragraphs, 'Tulis paragraf baru...'])}
        >
          <Plus size={16} />
          Tambah Paragraf
        </button>
        <TextField label="Closing Body" textarea value={draft.closing.body} onChange={(value) => updateNested(setDraft, 'closing', 'body', value)} />
        <TextField label="Closing CTA" value={draft.closing.cta} onChange={(value) => updateNested(setDraft, 'closing', 'cta', value)} />
        <TextField label="Signature" value={draft.closing.signature} onChange={(value) => updateNested(setDraft, 'closing', 'signature', value)} />
        <TextField
          label="Template WhatsApp Undangan"
          textarea
          value={draft.site.whatsappTemplate}
          onChange={(value) => updateNested(setDraft, 'site', 'whatsappTemplate', value)}
        />
        <TemplatePicker onSelect={(value) => updateNested(setDraft, 'site', 'whatsappTemplate', value)} />
        <p className="helper-text">Variabel tersedia: {'{guestName}'}, {'{inviteLink}'}, {'{coupleName}'}.</p>
      </section>
    </div>
  );
}

function CoupleEditor({ draft, setDraft }) {
  const updatePerson = (id, key, value) => {
    setDraft((prev) => ({
      ...prev,
      couple: prev.couple.map((person) => (person.id === id ? { ...person, [key]: value } : person)),
    }));
  };

  return (
    <section className="editor-panel wide">
      <h2>Bride & Groom</h2>
      <div className="admin-list split-list">
        {draft.couple.map((person) => (
          <article className="admin-row-card" key={person.id}>
            <div className="mini-preview-row">
              <img src={person.image || imageFallback} alt="" />
              <div>
                <span className="status-pill">{person.role}</span>
                <h3>{person.name}</h3>
              </div>
            </div>
            <TextField label="Nama" value={person.name} onChange={(value) => updatePerson(person.id, 'name', value)} />
            <TextField label="Detail Keluarga" textarea value={person.detail} onChange={(value) => updatePerson(person.id, 'detail', value)} />
            <label className="field">
              Instagram
              <div className="input-with-icon">
                <Instagram size={17} />
                <input value={person.instagram || ''} onChange={(event) => updatePerson(person.id, 'instagram', event.target.value)} />
              </div>
            </label>
            <TextField label="Foto URL" value={person.image} onChange={(value) => updatePerson(person.id, 'image', value)} />
          </article>
        ))}
      </div>
    </section>
  );
}

function EventsEditor({ draft, setDraft }) {
  const updateEvent = (id, patch) => {
    setDraft((prev) => ({
      ...prev,
      events: prev.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    }));
  };
  const addEvent = () => {
    setDraft((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          ...defaultInvitation.events[0],
          id: makeId('event'),
          name: 'Resepsi',
          date: eventDateInput(prev.events[0]?.date),
          time: prev.events[0]?.time || 'Jam Mulai s.d. Selesai',
          timezone: prev.events[0]?.timezone || '#WIB',
          venue: 'Nama Tempat Acara',
          address: 'Alamat lengkap lokasi acara',
        },
      ],
    }));
  };
  const deleteEvent = (id) => {
    setDraft((prev) => ({ ...prev, events: prev.events.filter((event) => event.id !== id) }));
  };

  return (
    <section className="editor-panel wide">
      <div className="panel-title-row">
        <h2>Date, Time & Location</h2>
        <button className="red-wide compact" type="button" onClick={addEvent}>
          <Plus size={16} />
          Tambah Acara
        </button>
      </div>
      <div className="admin-list">
        {draft.events.map((event) => {
          const time = parseTimeRange(event.time);
          return (
            <article className="admin-row-card" key={event.id}>
              <div className="mini-preview-row">
                <img src={event.image || imageFallback} alt="" />
                <div>
                  <span className="status-pill">{formatEventDate(event.date)}</span>
                  <h3>{event.name}</h3>
                </div>
              </div>
              <label className="field">
                Jenis Acara
                <div className="option-button-grid">
                  {eventNameOptions.map((name) => (
                    <button
                      className={event.name === name ? 'selected' : ''}
                      type="button"
                      key={name}
                      onClick={() => updateEvent(event.id, { name })}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </label>
              <TextField label="Nama Acara Custom" value={event.name} onChange={(value) => updateEvent(event.id, { name: value })} />
              <TextField label="Tanggal Acara" type="date" value={eventDateInput(event.date)} onChange={(value) => updateEvent(event.id, { date: value })} />
              <div className="event-time-grid">
                <TextField
                  label="Jam Mulai"
                  type="time"
                  value={time.start}
                  onChange={(value) => updateEvent(event.id, { time: formatTimeRange(value, time.end) })}
                />
                <TextField
                  label="Jam Selesai"
                  type="time"
                  value={time.end}
                  onChange={(value) => updateEvent(event.id, { time: formatTimeRange(time.start, value) })}
                />
                <label className="field">
                  Zona Waktu
                  <select value={event.timezone || '#WIB'} onChange={(entry) => updateEvent(event.id, { timezone: entry.target.value })}>
                    {timezoneOptions.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replace('#', '')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <TextField label="Venue" value={event.venue} onChange={(value) => updateEvent(event.id, { venue: value })} />
              <TextField label="Alamat" textarea value={event.address} onChange={(value) => updateEvent(event.id, { address: value })} />
              <TextField label="Google Maps URL" value={event.mapsUrl} onChange={(value) => updateEvent(event.id, { mapsUrl: value })} />
              <TextField label="Foto Acara URL" value={event.image} onChange={(value) => updateEvent(event.id, { image: value })} />
              {draft.events.length > 1 && (
                <button className="danger-button" type="button" onClick={() => deleteEvent(event.id)}>
                  <Trash2 size={16} />
                  Hapus Acara
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArrayEditor({ title, field, draft, setDraft, template }) {
  const items = draft[field];
  const updateItem = (id, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  };
  const addItem = () => {
    setDraft((prev) => ({
      ...prev,
      [field]: [{ ...template, id: makeId(field), name: template.name || 'Item baru' }, ...prev[field]],
    }));
  };
  const deleteItem = (id) => {
    setDraft((prev) => ({ ...prev, [field]: prev[field].filter((item) => item.id !== id) }));
  };
  const editableKeys = Object.keys(template).filter((key) => key !== 'id');

  return (
    <section className="editor-panel wide">
      <div className="panel-title-row">
        <h2>{title}</h2>
        <button className="red-wide compact" type="button" onClick={addItem}>
          <Plus size={16} />
          Tambah
        </button>
      </div>
      <div className="admin-list">
        {items.map((item) => (
          <article className="admin-row-card" key={item.id}>
            {editableKeys.map((key) => (
              <TextField
                key={key}
                label={key}
                textarea={['detail', 'address', 'body'].includes(key)}
                value={item[key]}
                onChange={(value) => updateItem(item.id, key, value)}
              />
            ))}
            <button className="danger-button" type="button" onClick={() => deleteItem(item.id)}>
              <Trash2 size={16} />
              Hapus
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function StoryListEditor({ draft, setDraft }) {
  const updateStory = (id, patch) => {
    setDraft((prev) => ({
      ...prev,
      stories: prev.stories.map((story) => (story.id === id ? { ...story, ...patch, rating: 'SU' } : story)),
    }));
  };
  const addStory = () => {
    setDraft((prev) => {
      const episodeNumber = prev.stories.length + 1;
      return {
        ...prev,
        stories: [
          ...prev.stories,
          {
            ...defaultInvitation.stories[0],
            id: makeId('episode'),
            episode: `Episode ${episodeNumber}:`,
            title: 'Episode Baru',
            body: 'Tulis cerita singkat untuk episode ini.',
            duration: '03 min read',
            rating: 'SU',
            image: imageFallback,
          },
        ],
      };
    });
  };
  const deleteStory = (id) => {
    setDraft((prev) => ({ ...prev, stories: prev.stories.filter((story) => story.id !== id) }));
  };

  return (
    <section className="editor-panel wide">
      <div className="panel-title-row">
        <h2>Our Love Story</h2>
        <button className="red-wide compact" type="button" onClick={addStory}>
          <Plus size={16} />
          Episode
        </button>
      </div>
      <div className="admin-list">
        {draft.stories.map((story, index) => (
          <article className="admin-row-card" key={story.id}>
            <div className="mini-preview-row">
              <img src={story.image || imageFallback} alt="" />
              <div>
                <span className="status-pill">Episode {index + 1} - SU</span>
                <h3>{story.title}</h3>
              </div>
            </div>
            <TextField label="Judul Episode" value={story.title} onChange={(value) => updateStory(story.id, { title: value })} />
            <TextField label="Isi Cerita" textarea value={story.body} onChange={(value) => updateStory(story.id, { body: value })} />
            <TextField label="Foto Episode URL" value={story.image} onChange={(value) => updateStory(story.id, { image: value })} />
            {draft.stories.length > 1 && (
              <button className="danger-button" type="button" onClick={() => deleteStory(story.id)}>
                <Trash2 size={16} />
                Hapus Episode
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function StoryGalleryEditor({ draft, setDraft }) {
  const updateGallery = (index, value) => {
    const gallery = [...draft.gallery];
    gallery[index] = value;
    setDraft((prev) => ({ ...prev, gallery }));
  };
  const deleteGallery = (index) => {
    setDraft((prev) => ({ ...prev, gallery: prev.gallery.filter((_, itemIndex) => itemIndex !== index) }));
  };

  return (
    <div className="editor-grid">
      <StoryListEditor draft={draft} setDraft={setDraft} />
      <section className="editor-panel">
        <div className="panel-title-row">
          <h2>Our Memories</h2>
          <button className="red-wide compact" type="button" onClick={() => setDraft((prev) => ({ ...prev, gallery: [imageFallback, ...prev.gallery] }))}>
            <Plus size={16} />
            Foto
          </button>
        </div>
        <div className="gallery-editor">
          {draft.gallery.map((src, index) => (
            <div className="gallery-edit-row" key={`${src}-${index}`}>
              <img src={src || imageFallback} alt="" />
              <input value={src} onChange={(event) => updateGallery(index, event.target.value)} />
              <button type="button" onClick={() => deleteGallery(index)} aria-label="Hapus foto">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GiftEditor({ draft, setDraft }) {
  const updateGift = (key, value) => setDraft((prev) => ({ ...prev, gifts: { ...prev.gifts, [key]: value } }));
  const updateBank = (id, key, value) => {
    setDraft((prev) => ({
      ...prev,
      gifts: {
        ...prev.gifts,
        banks: prev.gifts.banks.map((bank) => (bank.id === id ? { ...bank, [key]: value } : bank)),
      },
    }));
  };
  const addBank = () => {
    setDraft((prev) => ({
      ...prev,
      gifts: {
        ...prev.gifts,
        banks: [{ id: makeId('bank'), type: 'BCA', accountNumber: '0000000000', accountName: 'Nama Pemilik' }, ...prev.gifts.banks],
      },
    }));
  };
  const deleteBank = (id) => {
    setDraft((prev) => ({
      ...prev,
      gifts: { ...prev.gifts, banks: prev.gifts.banks.filter((bank) => bank.id !== id) },
    }));
  };

  return (
    <section className="editor-panel wide">
      <h2>Wedding Gift</h2>
      <TextField label="Intro" textarea value={draft.gifts.intro} onChange={(value) => updateGift('intro', value)} />
      <div className="panel-title-row">
        <h3>Rekening</h3>
        <button className="red-wide compact" type="button" onClick={addBank}>
          <Plus size={16} />
          Bank
        </button>
      </div>
      <div className="admin-list">
        {draft.gifts.banks.map((bank) => (
          <article className="admin-row-card" key={bank.id}>
            <label className="field">
              Jenis Kartu/Bank
              <select value={bank.type} onChange={(event) => updateBank(bank.id, 'type', event.target.value)}>
                {bankTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <TextField label="Nomor Rekening" value={bank.accountNumber} onChange={(value) => updateBank(bank.id, 'accountNumber', value)} />
            <TextField label="Nama Pemilik" value={bank.accountName} onChange={(value) => updateBank(bank.id, 'accountName', value)} />
            <button className="danger-button" type="button" onClick={() => deleteBank(bank.id)}>
              <Trash2 size={16} />
              Hapus
            </button>
          </article>
        ))}
      </div>
      <TextField label="Judul Kirim Kado" value={draft.gifts.deliveryTitle} onChange={(value) => updateGift('deliveryTitle', value)} />
      <TextField label="Catatan Kirim Kado" value={draft.gifts.deliveryNote} onChange={(value) => updateGift('deliveryNote', value)} />
      <TextField label="Alamat Kirim Kado" textarea value={draft.gifts.deliveryAddress} onChange={(value) => updateGift('deliveryAddress', value)} />
    </section>
  );
}

function GuestRsvpEditor({ draft, setDraft, onAutosave }) {
  const origin = window.location.origin;
  const [bulkNames, setBulkNames] = useState('');
  const [copied, setCopied] = useState('');
  const [limitNotice, setLimitNotice] = useState('');
  const limit = guestLimitFor(draft);

  const flashCopy = (key, text) => {
    copyText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1100);
  };

  const persistGuestDraft = (next) => {
    setDraft(next);
    onAutosave?.(next);
  };

  const updateGuest = (id, value) => {
    const current = draft.guests.find((guest) => guest.id === id);
    if (!current) return;
    const next = {
      ...draft,
      guests: draft.guests.map((guest) => (guest.id === id ? { ...guest, name: value } : guest)),
      rsvps: draft.rsvps.map((rsvp) => (rsvp.guestSlug === current.slug ? { ...rsvp, guestName: value } : rsvp)),
      checkIns: draft.checkIns.map((checkIn) => (checkIn.guestId === id ? { ...checkIn, guestName: value } : checkIn)),
    };
    persistGuestDraft(next);
  };

  const addGuest = () => {
    if (draft.guests.length >= limit) {
      setLimitNotice(`Limit tamu client adalah ${limit}. Ubah VITE_GUEST_LIMIT atau packageConfig.guestLimit dari code/env developer bila perlu.`);
      return;
    }
    const name = 'Nama Tamu Baru';
    const next = { ...draft, guests: [createGuest(name, draft.guests), ...draft.guests] };
    setLimitNotice('');
    persistGuestDraft(next);
  };

  const bulkCreate = () => {
    const names = bulkNames
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    const remaining = Math.max(0, limit - draft.guests.length);
    if (remaining === 0) {
      setLimitNotice(`Limit tamu client adalah ${limit}. Tidak ada slot link tersisa.`);
      return;
    }
    const acceptedNames = names.slice(0, remaining);
    let nextGuests = [...draft.guests];
    for (const name of acceptedNames) {
      const guest = createGuest(name, nextGuests);
      nextGuests = [guest, ...nextGuests];
    }
    if (names.length > acceptedNames.length) {
      setLimitNotice(`${names.length - acceptedNames.length} nama tidak dibuat karena limit ${limit} tamu sudah tercapai.`);
    } else {
      setLimitNotice('');
    }
    persistGuestDraft({ ...draft, guests: nextGuests });
    setBulkNames('');
  };

  const deleteGuest = (id) => {
    const removed = draft.guests.find((guest) => guest.id === id);
    if (!removed) return;
    persistGuestDraft({
      ...draft,
      guests: draft.guests.filter((guest) => guest.id !== id),
      rsvps: draft.rsvps.filter((rsvp) => rsvp.guestSlug !== removed.slug),
      checkIns: draft.checkIns.filter(
        (checkIn) => checkIn.guestId !== id && checkIn.guestSlug !== removed.slug && checkIn.qrToken !== removed.qrToken,
      ),
    });
  };

  const updateWhatsappTemplate = (value) => {
    persistGuestDraft({ ...draft, site: { ...draft.site, whatsappTemplate: value } });
  };

  const summary = summarizeGuests(draft);

  return (
    <div className="editor-grid">
      <section className="editor-panel wide">
        <div className="metric-grid">
          <MetricCard label="Total Tamu" value={summary.total} icon={<Users size={18} />} />
          <MetricCard label="RSVP Hadir" value={summary.attending} icon={<CheckCircle2 size={18} />} />
          <MetricCard label="Check-in" value={summary.checkedIn} icon={<UserCheck size={18} />} />
          <MetricCard label="Belum RSVP" value={summary.pending} icon={<XCircle size={18} />} />
          <MetricCard label="Limit Tamu" value={`${summary.total}/${limit}`} icon={<Lock size={18} />} />
        </div>
      </section>

      <section className="editor-panel">
        <div className="panel-title-row">
          <h2>Bulk Create Link</h2>
          <button className="red-wide compact" type="button" onClick={bulkCreate}>
            <Plus size={16} />
            Buat Link
          </button>
        </div>
        <label className="field">
          Nama tamu, satu nama per baris
          <textarea
            value={bulkNames}
            onChange={(event) => setBulkNames(event.target.value)}
            placeholder={'Bapak/Ibu Nama Tamu 1\nKeluarga Nama Tamu 2\nNama Tamu 3'}
          />
        </label>
        <p className="helper-text">
          Link production mengikuti pola: /{eventSlug(draft)}/nama-tamu. Setelah deploy domain Vercel/custom domain,
          link otomatis memakai domain production dan daftar tamu langsung autosave ke database.
        </p>
        {limitNotice && <div className="limit-alert">{limitNotice}</div>}
        <button className="ghost-button" type="button" onClick={addGuest}>
          <Plus size={16} />
          Tambah Manual
        </button>
      </section>

      <section className="editor-panel">
        <h2>Template WhatsApp</h2>
        <TextField
          label="Pesan"
          textarea
          value={draft.site.whatsappTemplate}
          onChange={updateWhatsappTemplate}
        />
        <TemplatePicker onSelect={updateWhatsappTemplate} />
        <p className="helper-text">Gunakan variabel {'{guestName}'}, {'{inviteLink}'}, dan {'{coupleName}'}.</p>
      </section>

      <section className="editor-panel wide">
        <div className="panel-title-row">
          <h2>Daftar Link Tamu</h2>
          <span className="count-label">{draft.guests.length}/{limit} link</span>
        </div>
        <div className="admin-list">
          {draft.guests.map((guest) => {
            const productionLink = guestLink(draft, guest, origin);
            return (
              <article className="admin-row-card" key={guest.id}>
                <div className="guest-admin-card">
                  <div className="guest-fields">
                    <TextField label="Nama Tamu" value={guest.name} onChange={(value) => updateGuest(guest.id, value)} />
                    <div className="guest-code-row">
                      <span>Kode unik</span>
                      <strong>{guest.code || guest.qrToken}</strong>
                    </div>
                    <div className="link-row">
                      <a href={`/${eventSlug(draft)}/${guest.slug}`}>
                        <LinkIcon size={16} />
                        {productionLink}
                      </a>
                      <button type="button" onClick={() => flashCopy(`link-${guest.id}`, productionLink)}>
                        <Copy size={16} />
                        <span>{copied === `link-${guest.id}` ? 'OK' : ''}</span>
                      </button>
                    </div>
                    <div className="guest-action-row">
                      <button type="button" className="ghost-button" onClick={() => flashCopy(`wa-${guest.id}`, whatsappMessage(draft, guest, origin))}>
                        <MessageCircle size={16} />
                        {copied === `wa-${guest.id}` ? 'Pesan Tersalin' : 'Salin Pesan WA'}
                      </button>
                      <a className="ghost-button" href={whatsappUrl(draft, guest, origin)} target="_blank" rel="noreferrer">
                        <MessageCircle size={16} />
                        Buka WhatsApp
                      </a>
                      <button className="danger-button" type="button" onClick={() => deleteGuest(guest.id)}>
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="qr-preview-card">
                    <GuestQrCode invitation={draft} guest={guest} />
                    <span>QR Check-in</span>
                    <strong>{guest.code || guest.qrToken}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function createGuest(name, existingGuests) {
  const baseSlug = slugify(name) || 'tamu';
  let slug = baseSlug;
  let counter = 2;
  while (existingGuests.some((guest) => guest.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return {
    id: makeId('guest'),
    name,
    slug,
    code: makeGuestCode(existingGuests),
    qrToken: makeToken('qr'),
  };
}

function MetricCard({ label, value, icon }) {
  return (
    <article className="metric-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function summarizeGuests(invitation) {
  const rows = guestRows(invitation);
  return {
    total: rows.length,
    attending: rows.filter((row) => row.attendance === 'Hadir').length,
    pending: rows.filter((row) => row.attendance === 'Belum RSVP').length,
    checkedIn: rows.filter((row) => Boolean(row.checkedInAt)).length,
  };
}

function GuestQrCode({ invitation, guest }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrPayload(invitation, guest), {
      margin: 1,
      width: 132,
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
    }).then((dataUrl) => {
      if (active) setSrc(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [guest, invitation]);

  return src ? <img src={src} alt={`QR check-in ${guest.name}`} /> : <div className="qr-skeleton" />;
}

function GuestBookEditor({ draft, setDraft, onAutosave }) {
  const rows = guestRows(draft);
  const summary = summarizeGuests(draft);
  const messageRows = rows.filter((row) => row.rsvp?.note?.trim());

  const clearMessage = (guestSlug) => {
    const next = {
      ...draft,
      rsvps: draft.rsvps.map((rsvp) =>
        rsvp.guestSlug === guestSlug ? { ...rsvp, note: '', moderatedAt: new Date().toISOString() } : rsvp,
      ),
    };
    setDraft(next);
    onAutosave?.(next);
  };

  return (
    <section className="editor-panel wide">
      <div className="panel-title-row">
        <div>
          <h2>Buku Tamu</h2>
          <p className="helper-text">Recap RSVP dan check-in untuk admin, siap export Excel-compatible CSV atau PDF.</p>
        </div>
        <div className="export-actions">
          <button className="ghost-button" type="button" onClick={() => exportGuestCsv(draft)}>
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
          <button className="ghost-button" type="button" onClick={() => exportGuestPdf(draft)}>
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>
      <div className="metric-grid">
        <MetricCard label="Total Tamu" value={summary.total} icon={<Users size={18} />} />
        <MetricCard label="Hadir RSVP" value={summary.attending} icon={<CheckCircle2 size={18} />} />
        <MetricCard label="Sudah Check-in" value={summary.checkedIn} icon={<UserCheck size={18} />} />
        <MetricCard label="Belum RSVP" value={summary.pending} icon={<XCircle size={18} />} />
      </div>
      <section className="message-admin-panel">
        <div className="panel-title-row compact">
          <div>
            <h3>Pesan Masuk</h3>
            <p className="helper-text">Moderasi ucapan yang tampil di halaman undangan. Penghapusan pesan langsung tersimpan ke database.</p>
          </div>
          <span className="status-pill">{messageRows.length} pesan</span>
        </div>
        {messageRows.length === 0 ? (
          <div className="empty-admin-state">
            <MessageCircle size={18} />
            Belum ada pesan yang perlu dimoderasi.
          </div>
        ) : (
          <div className="message-admin-list">
            {messageRows.map((row) => (
              <article className="message-admin-card" key={`message-${row.guest.id}`}>
                <div>
                  <strong>{row.rsvp.guestName || row.guest.name}</strong>
                  <p>{row.rsvp.note}</p>
                </div>
                <button className="danger-button compact" type="button" onClick={() => clearMessage(row.guest.slug)}>
                  <Trash2 size={15} />
                  Hapus Pesan
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="table-wrap">
        <table className="guest-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Kode</th>
              <th>RSVP</th>
              <th>Jumlah</th>
              <th>Ucapan</th>
              <th>Check-in</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.guest.id}>
                <td>{row.no}</td>
                <td>{row.guest.name}</td>
                <td>{row.guest.code || row.guest.qrToken}</td>
                <td>
                  <span className={`status-pill ${row.attendance === 'Hadir' ? 'ok' : row.attendance === 'Tidak Hadir' ? 'no' : ''}`}>
                    {row.attendance}
                  </span>
                </td>
                <td>{row.pax}</td>
                <td>{row.note || '-'}</td>
                <td>{row.checkedInAt ? new Date(row.checkedInAt).toLocaleString('id-ID') : 'Belum hadir'}</td>
                <td>
                  {row.rsvp?.note?.trim() ? (
                    <button className="danger-button compact" type="button" onClick={() => clearMessage(row.guest.slug)}>
                      <Trash2 size={15} />
                      Hapus Pesan
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScannerEditor({ draft, setDraft, onSave }) {
  const [scanInput, setScanInput] = useState('');
  const [result, setResult] = useState(null);
  const [scannerRunning, setScannerRunning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const recordToken = (rawValue) => {
    const token = extractQrToken(rawValue);
    const guest = draft.guests.find((item) => item.qrToken === token || item.code === token);
    if (!guest) {
      setResult({ type: 'error', title: 'QR tidak dikenal', body: 'Token tidak cocok dengan daftar tamu di event ini.' });
      return;
    }
    const existing = draft.checkIns.find((item) => item.guestId === guest.id || item.qrToken === guest.qrToken || item.guestCode === guest.code);
    if (existing) {
      setResult({
        type: 'warning',
        title: 'Sudah check-in',
        body: `${guest.name} sudah tercatat pada ${new Date(existing.checkedInAt).toLocaleString('id-ID')}.`,
      });
      return;
    }
    const checkIn = {
      id: makeId('checkin'),
      guestId: guest.id,
      guestSlug: guest.slug,
      guestName: guest.name,
      guestCode: guest.code,
      qrToken: guest.qrToken,
      checkedInAt: new Date().toISOString(),
      source: 'admin-scanner',
    };
    const next = { ...draft, checkIns: [checkIn, ...draft.checkIns] };
    setDraft(next);
    onSave(next);
    setResult({ type: 'success', title: 'Check-in berhasil', body: `${guest.name} berhasil masuk buku tamu.` });
  };

  const startScanner = async () => {
    if (scannerRunning) return;
    setResult(null);
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decodedText) => {
        recordToken(decodedText);
        await scanner.stop();
        setScannerRunning(false);
      },
    );
    setScannerRunning(true);
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    await scannerRef.current.stop().catch(() => {});
    setScannerRunning(false);
  };

  return (
    <div className="editor-grid">
      <section className="editor-panel">
        <h2>Scan QR Kehadiran</h2>
        <p className="helper-text">
          Gunakan kamera panitia/admin untuk scan QR tamu. QR memakai token unik, dan production nanti harus divalidasi
          ulang oleh API agar tidak bisa dicurangi dari browser biasa.
        </p>
        <div id="qr-reader" className="qr-reader" />
        <div className="guest-action-row">
          <button className="red-wide compact" type="button" onClick={startScanner}>
            <ScanLine size={16} />
            Mulai Scan
          </button>
          <button className="ghost-button" type="button" onClick={stopScanner}>
            <Pause size={16} />
            Stop
          </button>
        </div>
        <label className="field">
          Manual Token / URL QR
          <input value={scanInput} onChange={(event) => setScanInput(event.target.value)} placeholder="Tempel hasil scan QR" />
        </label>
        <button className="ghost-button" type="button" onClick={() => recordToken(scanInput)}>
          <UserCheck size={16} />
          Check-in Manual
        </button>
        {result && (
          <div className={`scan-result ${result.type}`}>
            <strong>{result.title}</strong>
            <span>{result.body}</span>
          </div>
        )}
      </section>
      <section className="editor-panel">
        <h2>Riwayat Check-in</h2>
        <div className="admin-list">
          {draft.checkIns.length === 0 && <p className="empty-state">Belum ada tamu yang check-in.</p>}
          {draft.checkIns.map((item) => (
            <article className="checkin-row" key={item.id}>
              <UserCheck size={18} />
              <div>
                <strong>{item.guestName}</strong>
                <span>{new Date(item.checkedInAt).toLocaleString('id-ID')}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PackageEditor({ draft, setDraft, onShowGate }) {
  const updatePackage = (key, value) => {
    setDraft((prev) => ({ ...prev, packageConfig: { ...prev.packageConfig, [key]: value } }));
  };
  const tiers = packageTiers(draft.packageConfig);
  const active = packageTier(draft.packageConfig, draft.packageConfig.activePackage);

  return (
    <section className="editor-panel wide">
      <h2>Paket Fitur</h2>
      <p className="helper-text">
        Paket Basic, Proper, dan Premium sudah disiapkan untuk batasan fitur client. Master template tetap bisa dibuka
        semua saat master unlock aktif.
      </p>
      <div className="package-current-card">
        <div>
          <span>PAKET AKTIF</span>
          <h3>{active.name}</h3>
          <p>
            Limit default {active.guestLimit} tamu. {draft.packageConfig.masterUnlock ? 'Semua fitur masih terbuka untuk master template.' : 'Fitur di atas paket aktif akan terkunci.'}
          </p>
        </div>
        <div className={`package-lock-state ${draft.packageConfig.masterUnlock ? 'open' : 'locked'}`}>
          <Lock size={16} />
          {draft.packageConfig.masterUnlock ? 'Master Unlock' : 'Client Lock'}
        </div>
      </div>
      <div className="package-control">
        <label className="field">
          Paket Aktif
          <select value={draft.packageConfig.activePackage} onChange={(event) => updatePackage('activePackage', event.target.value)}>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} - {tier.guestLimit} tamu
              </option>
            ))}
          </select>
        </label>
        <label className="switch-row">
          <input
            checked={draft.packageConfig.masterUnlock}
            type="checkbox"
            onChange={(event) => updatePackage('masterUnlock', event.target.checked)}
          />
          Master unlock semua fitur
        </label>
      </div>
      <div className="package-grid">
        {tiers.map((tier) => (
          <article className={`package-card ${active?.id === tier.id ? 'active' : ''}`} key={tier.id}>
            <div className="package-card-head">
              <Package size={22} />
              {tier.id !== 'basic' && <span className="pro-badge">PRO</span>}
            </div>
            <h3>{tier.name}</h3>
            <strong>{tier.guestLimit} tamu</strong>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={15} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="feature-lock-grid">
        {packageFeatureKeys.map((featureKey) => {
          const gate = packageGate(draft.packageConfig, featureKey);
          return (
            <article className={`feature-lock-card ${gate.restricted ? 'restricted' : ''}`} key={featureKey}>
              <div className="feature-lock-icon">
                {gate.restricted ? <Lock size={17} /> : <CheckCircle2 size={17} />}
              </div>
              <div>
                <strong>{gate.label}</strong>
                <span>Mulai paket {gate.requiredTier.name}</span>
              </div>
              {gate.restricted && (
                <button className="ghost-button compact" type="button" onClick={() => onShowGate(gate)}>
                  Lihat Batasan
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
