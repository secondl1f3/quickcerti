import React from 'react';
import { Plus, Upload, FileText, Zap, Users, Award, GraduationCap } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onCreateNew: () => void;
  onUploadTemplate: () => void;
  onUseTemplate: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateNew,
  onUploadTemplate,
  onUseTemplate,
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'create-new',
      title: 'Buat Sertifikat Baru',
      description: 'Mulai dari kanvas kosong dengan tools lengkap',
      icon: <Plus className="w-8 h-8" />,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: onCreateNew,
    },
    {
      id: 'upload-template',
      title: 'Upload Template',
      description: 'Upload gambar template (JPG, PNG, PDF, SVG)',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onUploadTemplate,
    },
    {
      id: 'use-template',
      title: 'Gunakan Template',
      description: 'Pilih dari koleksi template yang tersedia',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onUseTemplate,
    },
  ];

  const templateCategories = [
    {
      id: 'academic',
      title: 'Akademik',
      description: 'Sertifikat untuk institusi pendidikan',
      icon: <GraduationCap className="w-6 h-6" />,
      count: 12,
    },
    {
      id: 'professional',
      title: 'Profesional',
      description: 'Sertifikat untuk pelatihan dan workshop',
      icon: <Users className="w-6 h-6" />,
      count: 8,
    },
    {
      id: 'achievement',
      title: 'Penghargaan',
      description: 'Sertifikat prestasi dan kompetisi',
      icon: <Award className="w-6 h-6" />,
      count: 15,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Buat Sertifikat Profesional
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Pilih cara terbaik untuk memulai pembuatan sertifikat Anda. 
          Mulai dari template atau buat dari awal dengan mudah.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`${action.color} text-white p-8 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl group`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-all">
                {action.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Template Categories Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Kategori Template</h2>
          <button
            onClick={onUseTemplate}
            className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <span>Lihat Semua</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {templateCategories.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={onUseTemplate}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <span className="text-xs text-emerald-600 font-medium">
                    {category.count} template tersedia
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Tips Memulai</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Untuk Pemula:</h4>
            <ul className="space-y-1">
              <li>• Gunakan template yang sudah tersedia</li>
              <li>• Upload template dari file gambar</li>
              <li>• Sesuaikan teks dan warna sesuai kebutuhan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Untuk Pengguna Lanjutan:</h4>
            <ul className="space-y-1">
              <li>• Buat dari kanvas kosong untuk kontrol penuh</li>
              <li>• Gunakan variabel untuk sertifikat massal</li>
              <li>• Simpan sebagai template untuk digunakan kembali</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};