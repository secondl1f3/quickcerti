import React, { useState, useEffect } from 'react';
import { Plus, Upload, FileText, Zap, Users, Award, GraduationCap, Search, Filter } from 'lucide-react';
import { Template } from '../types';
import { TemplateService } from '../services/templateService';

interface CertificateHubProps {
  onCreateBlank: () => void;
  onUploadTemplate: () => void;
  onSelectTemplate: (template: Template) => void;
}

interface TemplateGalleryProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  loading: boolean;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates, onSelectTemplate, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Semua Template', count: templates.length },
    { id: 'academic', name: 'Akademik', count: templates.filter(t => t.category === 'academic').length },
    { id: 'professional', name: 'Profesional', count: templates.filter(t => t.category === 'professional').length },
    { id: 'achievement', name: 'Penghargaan', count: templates.filter(t => t.category === 'achievement').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Galeri Template</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Galeri Template</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada template ditemukan</h3>
          <p className="text-gray-600">Coba ubah kata kunci pencarian atau kategori</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={template.thumbnail || template.templateUrl}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDMwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEyNSIgeT0iOTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI0NSIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UZW1wbGF0ZTwvdGV4dD4KPHN2Zz4=';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-emerald-600 font-medium capitalize">
                    {template.category}
                  </span>
                  {template.isPublic && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Publik
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CertificateHub: React.FC<CertificateHubProps> = ({
  onCreateBlank,
  onUploadTemplate,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch templates using the service
        const [publicTemplates, userTemplates] = await Promise.all([
          TemplateService.getPublicTemplates(),
          TemplateService.getUserTemplates(),
        ]);
        
        // Combine templates
        const allTemplates = [...publicTemplates, ...userTemplates];
        setTemplates(allTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Gagal memuat template. Silakan coba lagi.');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const quickActions = [
    {
      id: 'create-blank',
      title: 'Mulai dengan Kanvas Kosong',
      description: 'Buat sertifikat dari awal dengan kontrol penuh',
      icon: <Plus className="w-8 h-8" />,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: onCreateBlank,
    },
    {
      id: 'upload-template',
      title: 'Upload Template Anda',
      description: 'Upload gambar template (JPG, PNG, PDF, SVG)',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onUploadTemplate,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Buat Sertifikat Profesional
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Pilih cara terbaik untuk memulai pembuatan sertifikat Anda. 
          Desain gratis, bayar hanya saat download berdasarkan jumlah halaman.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 underline hover:no-underline mt-2"
          >
            Muat ulang halaman
          </button>
        </div>
      )}

      {/* Template Gallery */}
      <TemplateGallery
        templates={templates}
        onSelectTemplate={onSelectTemplate}
        loading={loading}
      />

      {/* Pricing Info */}
      <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Informasi Harga</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Desain Gratis:</h4>
            <ul className="space-y-1">
              <li>• Buat dan edit desain tanpa batas</li>
              <li>• Simpan progress kapan saja</li>
              <li>• Preview hasil akhir</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Bayar Saat Download:</h4>
            <ul className="space-y-1">
              <li>• 30 poin per halaman sertifikat</li>
              <li>• Download format PDF berkualitas tinggi</li>
              <li>• Dapat digunakan untuk keperluan komersial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};