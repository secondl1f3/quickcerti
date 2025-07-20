import React, { memo, useMemo } from 'react';
import { FaqItem } from './FaqItem';
import { ArrowRight, CheckCircle, Zap, Users, Download, Palette, FileText, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Memoized star rating component for better performance
const StarRating = memo(() => {
  const stars = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
    )), []
  );
  return <div className="flex items-center mb-4">{stars}</div>;
});

StarRating.displayName = 'StarRating';

export const LandingPage: React.FC<LandingPageProps> = memo(({ onGetStarted }) => {
  const { isAuthenticated } = useAuthStore();
  const buttonText = isAuthenticated ? 'Buka Dasbor' : 'Mulai Gratis';

  const features = [
    {
      icon: Palette,
      title: 'Editor Seret & Lepas yang Intuitif',
      description: 'Rancang sertifikat dengan mudah menggunakan editor visual kami yang ramah pengguna. Tambahkan teks, gambar, dan elemen desain dengan fungsionalitas seret dan lepas yang sederhana.',
    },
    {
      icon: Users,
      title: 'Pembuatan Massal yang Efisien',
      description: 'Buat ratusan sertifikat sekaligus menggunakan data dari file CSV. Hemat waktu dan tenaga untuk acara besar dan program pelatihan.',
    },
    {
      icon: Download,
      title: 'Ekspor Multi-Format',
      description: 'Unduh sertifikat dalam format PDF, PNG, atau JPG berkualitas tinggi untuk memenuhi kebutuhan distribusi dan pencetakan Anda.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/src/assets/logo.svg" alt="sertiku.id logo" className="h-8" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-lg">
            <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300">Fitur</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300">Harga</a>
            <a href="#faq" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300">FAQ</a>
          </nav>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full hover:scale-105 transform transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            {buttonText}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <section className="text-center container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Buat Sertifikat Menakjubkan
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              dalam Hitungan Menit
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Platform terbaik untuk merancang sertifikat profesional dengan fitur canggih seperti editor seret dan lepas serta pembuatan massal.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-full hover:scale-105 transform transition-all duration-300 font-bold text-xl shadow-2xl flex items-center gap-3"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Mulai Membuat Sekarang'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span>Gratis untuk 100 sertifikat pertama Anda</span>
            </div>
          </div>
        </section>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Semua yang Anda Butuhkan, Semua di Satu Tempat</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Dari template profesional hingga pembuatan massal, kami siap membantu Anda.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-200/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Harga Fleksibel Sesuai Kebutuhan Anda</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tanpa langganan, tanpa biaya tersembunyi. Bayar hanya untuk apa yang Anda gunakan.</p>
          </div>
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-200/80">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Pay As You Go</h3>
              <p className="text-6xl font-extrabold text-gray-900 mb-4">Rp 100<span className="text-2xl font-medium text-gray-500">/sertifikat</span></p>
              <p className="text-gray-600 mb-8">Model harga kami sederhana: 1 sertifikat yang diterbitkan membutuhkan 1 poin. Dan 1 poin hanya seharga Rp 100.</p>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-4">
                <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">Semua Fitur Editor</h4>
                  <p className="text-gray-600">Akses penuh ke editor seret & lepas, template, dan semua alat desain.</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">Pembuatan Massal</h4>
                  <p className="text-gray-600">Buat ratusan sertifikat sekaligus dari data file CSV Anda.</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">Pengiriman Email Gratis</h4>
                  <p className="text-gray-600">Kirim sertifikat langsung ke email penerima tanpa biaya tambahan.</p>
                </div>
              </li>
            </ul>
            <button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-full hover:scale-105 transform transition-all duration-300 font-bold text-xl shadow-lg"
            >
              Mulai Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Punya pertanyaan? Kami punya jawabannya.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {
                [
                  {
                    question: "Apa itu sertiku.id?",
                    answer: "sertiku.id adalah platform online yang memudahkan Anda untuk membuat, mengelola, dan mendistribusikan sertifikat digital secara efisien."
                  },
                  {
                    question: "Siapa yang bisa menggunakan platform ini?",
                    answer: "Platform ini cocok untuk penyelenggara acara, lembaga pelatihan, sekolah, universitas, dan siapa saja yang perlu membuat sertifikat dalam jumlah besar maupun satuan."
                  },
                  {
                    question: "Apakah saya perlu keahlian desain?",
                    answer: "Tidak sama sekali. Kami menyediakan editor seret dan lepas yang intuitif serta berbagai template profesional yang siap Anda gunakan."
                  },
                  {
                    question: "Mengapa pembuatan massal menjadi fitur utama?",
                    answer: "Inti dari platform kami adalah efisiensi. Membuat sertifikat satu per satu sangat memakan waktu. Dengan fitur pembuatan massal, Anda bisa menghasilkan ratusan sertifikat hanya dengan mengunggah satu file data, menghemat waktu dan tenaga Anda secara signifikan."
                  },
                  {
                    question: "Bagaimana cara kerja pembuatan massal?",
                    answer: "Anda cukup menyiapkan data penerima sertifikat dalam format file CSV, unggah ke platform kami, dan sertiku.id akan secara otomatis menghasilkan semua sertifikat untuk Anda dalam sekejap."
                  }
                ].map((faq, index) => (
                  <FaqItem key={index} question={faq.question} answer={faq.answer} />
                ))
              }
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-12 text-center shadow-2xl overflow-hidden relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-16 -right-5 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Siap Membuat Sertifikat Profesional?</h2>
              <p className="text-emerald-100 text-xl mb-8">Bergabunglah dengan ribuan pengguna dan tingkatkan kualitas sertifikat Anda hari ini.</p>
              <button
                onClick={onGetStarted}
                className="bg-white text-emerald-600 px-10 py-4 rounded-full hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 font-bold text-xl shadow-lg"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Coba Gratis Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto py-8 px-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} sertiku.id. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
});