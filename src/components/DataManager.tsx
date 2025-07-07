import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Download } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { DataRow, Variable } from '../types';
import { useTranslation } from '../i18n/i18nContext';

interface DataManagerProps {
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const { data, variables, setData, addDataRow, updateDataRow, deleteDataRow, importFromCSV, addVariable, updateVariable, deleteVariable } = useDataStore();
  const [activeTab, setActiveTab] = useState<'data' | 'variables'>('data');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        importFromCSV(csvContent);
      };
      reader.readAsText(file);
    }
  };

  const handleAddRow = () => {
    const newRow: DataRow = {};
    variables.forEach(variable => {
      newRow[variable.name] = '';
    });
    addDataRow(newRow);
  };

  const handleAddVariable = () => {
    const newVariable: Variable = {
      name: `Variable${variables.length + 1}`,
      type: 'text',
      defaultValue: ''
    };
    addVariable(newVariable);
  };

  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{t('dataManager')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'data'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
{t('data')} ({data.length} {t('rows')})
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'variables'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
{t('variables')} ({variables.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'data' ? (
            <div className="h-full flex flex-col">
              {/* Data Controls */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={20} />
                    <span>{t('importCsv')}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={exportToCSV}
                    disabled={data.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={20} />
                    <span>{t('exportCsv')}</span>
                  </button>
                  <button
                    onClick={handleAddRow}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus size={20} />
                    <span>{t('addRow')}</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto p-4">
                {data.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">{t('noDataAvailable')}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('importCsvFile')}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                          {variables.map((variable) => (
                            <th key={variable.name} className="border border-gray-300 px-4 py-2 text-left">
                              {variable.name}
                            </th>
                          ))}
                          <th className="border border-gray-300 px-4 py-2 text-left">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                            {variables.map((variable) => (
                              <td key={variable.name} className="border border-gray-300 px-4 py-2">
                                <input
                                  type="text"
                                  value={row[variable.name] || ''}
                                  onChange={(e) => {
                                    const newRow = { ...row, [variable.name]: e.target.value };
                                    updateDataRow(index, newRow);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                onClick={() => deleteDataRow(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Variables Controls */}
              <div className="p-4 border-b bg-gray-50">
                <button
                  onClick={handleAddVariable}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>{t('addVariable')}</span>
                </button>
              </div>

              {/* Variables List */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {variables.map((variable, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
{t('variableName')}
                          </label>
                          <input
                            type="text"
                            value={variable.name}
                            onChange={(e) => updateVariable(index, { ...variable, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
{t('type')}
                          </label>
                          <select
                            value={variable.type}
                            onChange={(e) => updateVariable(index, { ...variable, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteVariable(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};