import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Leaf,
  Map,
  Radar,
  Shield,
  Sparkles,
  Users,
  Wind,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: 'easeOut' },
};

function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--navy-border)]/80 bg-[var(--navy)]/85 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="AURA — ana səhifə">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M20 2L4 10v12c0 9.5 6.8 18.4 16 20 9.2-1.6 16-10.5 16-20V10L20 2z"
              stroke="var(--cyan)"
              strokeWidth="2"
              fill="rgba(0,212,255,0.08)"
            />
            <path
              d="M20 12v16M14 18h12M14 24h8"
              stroke="var(--cyan)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-brand text-lg font-bold tracking-tight text-[var(--text-1)]">AURA</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Marketinq">
          <Link
            to="/login"
            className="hidden rounded-[var(--r-md)] px-3 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text-1)] sm:inline-block"
          >
            Daxil ol
          </Link>
          <a
            href="#download"
            className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] px-3 py-2 text-sm font-medium text-[var(--text-1)] transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
          >
            Tətbiqi yüklə
          </a>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] bg-[var(--cyan)] px-3 py-2 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-hover)] sm:px-4"
          >
            Betaya qoşul
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer
      className="border-t border-[var(--navy-border)] bg-[var(--navy-card)] py-10"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-brand text-base font-bold text-[var(--text-1)]">AURA</span>
          <span className="text-sm text-[var(--text-3)]">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link className="text-[var(--text-2)] hover:text-[var(--cyan)]" to="/login">
            Daxil ol
          </Link>
          <Link className="text-[var(--text-2)] hover:text-[var(--cyan)]" to="/register">
            Qeydiyyat
          </Link>
          <a className="text-[var(--text-2)] hover:text-emerald-400" href="#science">
            Inklüzivlik indeksi
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--navy)] text-[var(--text-1)]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(0, 212, 255, 0.12), transparent)',
        }}
      />
      <div className="auth-circuit-bg relative min-h-screen">
        <SiteHeader />

        <main id="main">
          {/* Hero */}
          <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-4xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-300"
              >
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                Eko-intellektual şəhər naviqasiyası
              </motion.p>
              <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="font-brand text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
              >
                Hər kəs üçün əlçatan,
                <span className="block bg-gradient-to-r from-emerald-400 via-[var(--cyan)] to-emerald-300 bg-clip-text text-transparent">
                  hər kəs üçün yaşıl.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-2)] sm:text-lg"
              >
                Real vaxt AI ilə şəhərdəki &quot;görünməz&quot; maneələri xəritələşdiririk — əlil arabası
                istifadəçiləri, yaşlılar və valideynlər üçün təhlükəsiz, ekoloji cəhətdən təmiz marşrutlar.
              </motion.p>
              <motion.div
                id="download"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="mt-10 flex scroll-mt-24 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
              >
                <Link
                  to="/register"
                  className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--cyan)] px-6 text-base font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-hover)] sm:w-auto"
                >
                  Betaya qoşul
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <span
                  className="inline-flex h-12 w-full max-w-xs cursor-default select-none items-center justify-center rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] px-6 text-base font-medium text-[var(--text-1)] opacity-90 sm:w-auto"
                  title="Tezliklə App Store və Google Play-də"
                  aria-label="Tətbiqi yüklə — tezliklə mövcud olacaq"
                >
                  Tətbiqi yüklə
                </span>
              </motion.div>
            </div>
          </section>

          {/* Bridging */}
          <section className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="bridge-heading">
            <div className="mx-auto max-w-6xl">
              <motion.h2
                id="bridge-heading"
                {...fadeUp}
                className="font-brand text-center text-3xl font-bold sm:text-4xl"
              >
                Şəhər boşluğunu bağlayırıq
              </motion.h2>
              <motion.p
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 }}
                className="mx-auto mt-4 max-w-2xl text-center text-[var(--text-2)]"
              >
                Standart xəritələr milyonlar üçün küçə reallığını görmür. AURA küçələrin gizli həqiqətini
                üzə çıxarır.
              </motion.p>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                <motion.article
                  {...fadeUp}
                  className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-6 sm:p-8"
                >
                  <h3 className="font-brand text-xl font-semibold text-[var(--error)]">Görünməz maneələr</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-2)]">
                    Adi xəritələr sizi təhlükəyə aparır: sıradan çıxmış rampalar, həddindən artıq hündür
                    səki, tikinti zonaları və zəif hava keyfiyyətli dəhlizlər. Bir çoxları üçün şəhər hələ də
                    keçilməzdir.
                  </p>
                </motion.article>
                <motion.article
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.08 }}
                  className="rounded-[var(--r-lg)] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-[var(--navy-card)] p-6 sm:p-8"
                >
                  <h3 className="font-brand text-xl font-semibold text-emerald-300">AURA həlli</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-2)]">
                    Özəl Inklüzivlik İndeksi ilə real vaxt marşrut optimallaşdırması. Səkilər, hava keyfiyyəti
                    və əlçatanlıq nöqtələrini təhlil edərək təhlükəsiz səyahət təmin edirik.
                  </p>
                </motion.article>
              </div>
            </div>
          </section>

          {/* Last meter */}
          <section className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="lastmeter-heading">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <motion.p
                  {...fadeUp}
                  className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--cyan)]"
                >
                  <Cpu className="h-4 w-4" aria-hidden="true" />
                  Kompüter görməsi ilə gücləndirilmiş
                </motion.p>
                <motion.h2
                  id="lastmeter-heading"
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 }}
                  className="font-brand text-3xl font-bold sm:text-4xl"
                >
                  &quot;Son metr&quot; AI naviqatoru
                </motion.h2>
                <motion.p
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.1 }}
                  className="mt-4 text-[var(--text-2)]"
                >
                  Standart GPS küçədə dayanır. AURA-nın görmə sistemi YOLOv8 maşın öyrənməsi ilə fiziki
                  mühiti məhz sizin olduğunuz yerdə skan edir. Google Maps-in görmədiyi maneələri aşkar
                  edirik.
                </motion.p>
                <motion.ul
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.14 }}
                  className="mt-6 space-y-3 text-[var(--text-2)]"
                >
                  {[
                    'Real vaxt səki təsnifatı',
                    'Avtomatlaşdırılmış maneə və təhlükə aşkarlanması',
                    'Kraudsors əlçatanlıq təsdiqi',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </motion.ul>
                <motion.div
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.18 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <span className="rounded-[var(--r-md)] border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200">
                    Əlçatan rampa 98%
                  </span>
                  <span className="rounded-[var(--r-md)] border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
                    Maneə 85%
                  </span>
                </motion.div>
              </div>
              <motion.div
                {...fadeUp}
                className="relative aspect-[4/3] overflow-hidden rounded-[var(--r-xl)] border border-[var(--navy-border)] bg-[var(--navy-raised)]"
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, transparent 50%), linear-gradient(225deg, rgba(16,185,129,0.12) 0%, transparent 55%)',
                  }}
                />
                <div className="absolute inset-4 rounded-[var(--r-lg)] border border-dashed border-[var(--navy-border)] bg-[var(--navy)]/60 p-4">
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--text-3)]">
                    <Radar className="h-10 w-10 text-[var(--cyan)]" aria-hidden="true" />
                    <span>Canlı mühit skanı (nümunə)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Science */}
          <section
            id="science"
            className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-20"
            aria-labelledby="science-heading"
          >
            <div className="mx-auto max-w-6xl">
              <motion.h2
                id="science-heading"
                {...fadeUp}
                className="text-center font-brand text-3xl font-bold sm:text-4xl"
              >
                İnklüziyanın elmi
              </motion.h2>
              <motion.p
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 }}
                className="mx-auto mt-4 max-w-2xl text-center text-[var(--text-2)]"
              >
                Marşrutumuz yalnız məsafə deyil — sizə uyğun dinamik düstur üzərində qurulub.
              </motion.p>
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="mx-auto mt-10 max-w-xl rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-6 text-center"
              >
                <p className="text-sm font-medium uppercase tracking-wider text-[var(--text-3)]">
                  Inklüzivlik indeksi düsturu
                </p>
                <p className="mt-4 font-mono text-lg text-[var(--cyan)] sm:text-xl">
                  I = (Əlçatanlıq × Hava keyfiyyəti) / Maneələr
                </p>
              </motion.div>
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                {[
                  {
                    icon: Users,
                    title: 'Fərdiləşdirilmiş profillər',
                    body: 'Astma, əlil arabası və ya uşaq arabası — marşrutlar dərhal yenidən çəkilir.',
                  },
                  {
                    icon: Wind,
                    title: 'Real vaxt AQI məlumatı',
                    body: 'Canlı sensor inteqrasiyası təmiz hava ilə marşrutda nəfəs almağınızı təmin edir.',
                  },
                  {
                    icon: Shield,
                    title: 'Dinamik maneələr',
                    body: 'Tikinti və müvəqqəti bağlanmalar marşrutun yaşama ehtimalını dərhal azaldır.',
                  },
                ].map(({ icon: Icon, title, body }, i) => (
                  <motion.article
                    key={title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: 0.08 + i * 0.06 }}
                    className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-6"
                  >
                    <Icon className="h-8 w-8 text-[var(--cyan)]" strokeWidth={1.5} aria-hidden="true" />
                    <h3 className="mt-4 font-brand text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{body}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {/* Eco corridors */}
          <section className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="eco-heading">
            <div className="mx-auto max-w-6xl">
              <motion.h2
                id="eco-heading"
                {...fadeUp}
                className="font-brand text-3xl font-bold sm:text-4xl"
              >
                İnteraktiv eko-dəhlizlər
              </motion.h2>
              <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }} className="mt-4 max-w-2xl text-[var(--text-2)]">
                Əlçatan, təmiz hava marşrutlarını vurğulayan yüksək dəqiqlikli xəritələşmə. Yaşıl dəhlizlər
                təhlükəsiz yönləndirir.
              </motion.p>
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="mt-10 overflow-hidden rounded-[var(--r-xl)] border border-[var(--navy-border)] bg-[var(--navy-card)]"
              >
                <div className="flex flex-wrap gap-2 border-b border-[var(--navy-border)] p-4">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Xəritə qatları
                  </span>
                  <span className="rounded-full bg-[var(--cyan-dim)] px-3 py-1 text-xs font-medium text-[var(--cyan)]">
                    Eko-dəhliz (yüksək bal)
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-200">
                    Maneə aşkarlandı
                  </span>
                </div>
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="relative min-h-[200px] overflow-hidden rounded-[var(--r-lg)] bg-[var(--navy-raised)]">
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0.08) 40%, transparent 70%), linear-gradient(180deg, rgba(0,212,255,0.08), transparent)',
                      }}
                    />
                    <Map className="absolute bottom-4 right-4 h-16 w-16 text-[var(--text-3)]/40" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-4 rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy)] p-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-3)]">Marşrut statusu</span>
                      <span className="font-medium text-emerald-400">Optimallaşdırılıb</span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--navy-border)] pt-4 text-sm">
                      <span className="text-[var(--text-3)]">İnklüzivlik</span>
                      <span className="font-brand text-lg font-bold text-[var(--cyan)]">94/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-3)]">Təxmini vaxt</span>
                      <span className="font-medium text-[var(--text-1)]">12 dəq</span>
                    </div>
                    <Link
                      to="/register"
                      className="mt-2 inline-flex h-10 items-center justify-center rounded-[var(--r-md)] bg-emerald-500/20 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/30"
                    >
                      Xəritəni kəşf et
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Baku */}
          <section className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="baku-heading">
            <div className="mx-auto max-w-6xl">
              <motion.h2
                id="baku-heading"
                {...fadeUp}
                className="text-center font-brand text-3xl font-bold sm:text-4xl"
              >
                Bakını ağıllı şəhərə çeviririk
              </motion.h2>
              <motion.p
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 }}
                className="mx-auto mt-4 max-w-3xl text-center text-[var(--text-2)]"
              >
                AURA təkcə tətbiq deyil — Azərbaycanın Ağıllı Şəhər strategiyasının əsas komponentidir.
                Müharibə veteranlarının sosial reinteqrasiyasını dəstəkləyir və heç kimi geridə qoymayan
                infrastruktur qururuq.
              </motion.p>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {['Veteran reinteqrasiyası', 'Ağıllı şəhər infrastrukturu', 'İcma xəritələşdirməsi'].map(
                  (label, i) => (
                    <motion.div
                      key={label}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: 0.08 + i * 0.06 }}
                      className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] px-5 py-6 text-center font-medium text-[var(--text-1)]"
                    >
                      {label}
                    </motion.div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="border-t border-[var(--navy-border)] px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="roadmap-heading">
            <div className="mx-auto max-w-6xl">
              <motion.h2
                id="roadmap-heading"
                {...fadeUp}
                className="text-center font-brand text-3xl font-bold sm:text-4xl"
              >
                Gələcəyə səyahət
              </motion.h2>
              <motion.p
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 }}
                className="mx-auto mt-4 max-w-xl text-center text-[var(--text-2)]"
              >
                Universal əlçatan şəhərlər üçün 5 illik vizyon.
              </motion.p>
              <div className="relative mx-auto mt-14 max-w-3xl">
                <div
                  className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--cyan)] via-emerald-500/50 to-[var(--navy-border)] sm:left-6"
                  aria-hidden="true"
                />
                <ol className="space-y-10">
                  {[
                    {
                      y: 'Y1',
                      t: 'Bakı pilotu',
                      d: 'İlkin buraxılış, beta testi və əsas istilik xəritəsi infrastrukturu.',
                    },
                    {
                      y: 'Y2',
                      t: 'Gəncə və Sumqayıt',
                      d: 'İkinci dərəcəli şəhərlərə genişlənmə, daha dərin IoT sensor şəbəkəsi.',
                    },
                    {
                      y: 'Y3',
                      t: 'Qarabağ ağıllı kəndləri',
                      d: 'Yenidənqurma və ağıllı infrastruktura tam inteqrasiya.',
                    },
                    {
                      y: 'Y4',
                      t: 'Qlobal genişlənmə',
                      d: 'Inklüzivlik indeksi çərçivəsini beynəlxalq metropolitənlərə miqyaslama.',
                    },
                  ].map((step, i) => (
                    <motion.li
                      key={step.y}
                      {...fadeUp}
                      transition={{ ...fadeUp.transition, delay: 0.05 * i }}
                      className="relative flex gap-6 pl-1 sm:gap-8"
                    >
                      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--cyan)]/40 bg-[var(--navy-card)] font-brand text-xs font-bold text-[var(--cyan)] sm:h-12 sm:w-12 sm:text-sm">
                        {step.y}
                      </span>
                      <div className="pb-2 pt-0.5">
                        <h3 className="font-brand text-lg font-semibold sm:text-xl">{step.t}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)] sm:text-[15px]">{step.d}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }} className="mt-14 text-center">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--r-md)] bg-[var(--cyan)] px-8 text-base font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-hover)]"
                >
                  Betaya qoşul
                </Link>
              </motion.div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
