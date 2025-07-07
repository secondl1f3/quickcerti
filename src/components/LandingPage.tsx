import React from 'react';
import { ArrowRight, CheckCircle, Zap, Users, Download, Palette, FileText, Star, User } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface LandingPageProps {
  user?: SupabaseUser | null;
  onGetStarted: () => void;
  onLogin?: () => void;
  onProfile?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onGetStarted, onLogin, onProfile }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">CertifikatKu</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#fitur" className="text-gray-600 hover:text-teal-600 transition-colors">Fitur</a>
              <a href="#harga" className="text-gray-600 hover:text-teal-600 transition-colors">Harga</a>
              <a href="#testimoni" className="text-gray-600 hover:text-teal-600 transition-colors">Testimoni</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onProfile}
                    className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {onLogin && (
                    <button
                      onClick={onLogin}
                      className="text-gray-600 hover:text-teal-600 transition-colors font-medium"
                    >
                      Masuk
                    </button>
                  )}
                  <button
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium"
                  >
                    Mulai Gratis
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Buat Sertifikat
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                Profesional
              </span>
              dalam Hitungan Menit
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Platform desain sertifikat yang mudah digunakan dengan template profesional, 
              editor drag-and-drop, dan fitur batch generation untuk kebutuhan organisasi Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Mulai Membuat Sertifikat</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Gratis untuk 10 sertifikat pertama</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Semua Kebutuhan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dari template profesional hingga batch generation, semua yang Anda butuhkan ada di sini.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Editor Drag & Drop</h3>
              <p className="text-gray-600 leading-relaxed">
                Desain sertifikat dengan mudah menggunakan editor visual yang intuitif. 
                Tambahkan teks, gambar, dan elemen desain hanya dengan drag and drop.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Batch Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Buat ratusan sertifikat sekaligus dengan data dari CSV. 
                Hemat waktu dan tenaga untuk acara besar atau pelatihan massal.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Multi-Format</h3>
              <p className="text-gray-600 leading-relaxed">
                Download sertifikat dalam format PDF berkualitas tinggi atau PNG/JPG 
                untuk berbagai kebutuhan distribusi dan pencetakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih CertifikatKu?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Template Profesional</h3>
                    <p className="text-gray-600">Koleksi template yang dirancang khusus untuk berbagai jenis acara dan organisasi.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Mudah Digunakan</h3>
                    <p className="text-gray-600">Interface yang intuitif memungkinkan siapa saja membuat sertifikat tanpa skill desain.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Hemat Waktu & Biaya</h3>
                    <p className="text-gray-600">Tidak perlu menyewa desainer atau menggunakan software mahal yang rumit.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Mulai dalam 30 Detik</h3>
                <p className="text-gray-600 mb-6">
                  Daftar sekarang dan langsung buat sertifikat pertama Anda. 
                  Tidak perlu kartu kredit untuk memulai.
                </p>
                <button
                  onClick={onGetStarted}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold"
                >
                  Coba Gratis Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dipercaya oleh Ribuan Organisasi
            </h2>
            <p className="text-xl text-gray-600">
              Lihat apa kata mereka tentang CertifikatKu
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "CertifikatKu sangat membantu kami dalam membuat sertifikat untuk 500+ peserta workshop. 
                Prosesnya cepat dan hasilnya profesional!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Ahmad Rizki</p>
                  <p className="text-sm text-gray-600">Event Manager, TechCorp</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Interface yang sangat mudah digunakan. Bahkan tanpa background desain, 
                saya bisa membuat sertifikat yang terlihat profesional."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sari Indah</p>
                  <p className="text-sm text-gray-600">HR Manager, EduCenter</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Fitur batch generation sangat menghemat waktu kami. 
                Yang tadinya butuh berhari-hari, sekarang selesai dalam hitungan jam."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  B
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Budi Santoso</p>
                  <p className="text-sm text-gray-600">Training Coordinator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Membuat Sertifikat Profesional?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Bergabung dengan ribuan organisasi yang sudah mempercayai CertifikatKu 
            untuk kebutuhan sertifikat mereka.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <span>Mulai Gratis Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-emerald-100 mt-4 text-sm">
            Tidak perlu kartu kredit • 10 sertifikat gratis • Setup dalam 30 detik
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CertifikatKu</span>
              </div>
              <p className="text-gray-400">
                Platform terdepan untuk membuat sertifikat profesional dengan mudah dan cepat.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produk</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Template</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Editor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Batch Generation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CertifikatKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};