import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Download } from 'lucide-react';
import { useDatasetStore } from '../store/datasetStore';
import { DataRow, Variable } from '../types';
import { useTranslation } from '../i18n/i18nContext';

interface DataManagerProps {
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const { 
    datasets, 
    currentDataset, 
    data, 
    variables, 
    loading, 
    error,
    loadDatasets,
    createDataset,
    setCurrentDataset,
    loadVariables,
    loadDataRows,
    createVariable,
    createDataRow,
    createDataRowAtIndex,
    updateDatasetVariable,
    deleteDatasetVariable,
    updateDataRow,
    deleteDataRow,
    updateDataRowLegacy,
    deleteDataRowLegacy,
    updateVariable,
    deleteVariable,
    addVariable,
    addDataRow,
    importCsv,
    exportCsv
  } = useDatasetStore();
  const [activeTab, setActiveTab] = useState<'data' | 'variables'>('data');
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  
  // Refs to prevent duplicate API calls
  const fetchingDatasetsRef = useRef(false);
  const fetchingDatasetDataRef = useRef(false);

  useEffect(() => {
    if (fetchingDatasetsRef.current) return;
    
    fetchingDatasetsRef.current = true;
    loadDatasets().finally(() => {
      fetchingDatasetsRef.current = false;
    });
  }, [loadDatasets]);

  useEffect(() => {
    if (currentDataset && !fetchingDatasetDataRef.current) {
      console.log('Loading data for dataset:', currentDataset);
      fetchingDatasetDataRef.current = true;
      
      Promise.all([
        loadVariables(currentDataset.id),
        loadDataRows(currentDataset.id)
      ]).finally(() => {
        fetchingDatasetDataRef.current = false;
      });
    }
  }, [currentDataset, loadVariables, loadDataRows]);

  // Debug variables state
  useEffect(() => {
    console.log('Variables state updated:', variables);
  }, [variables]);

  const handleCreateDataset = async () => {
    if (newDatasetName.trim()) {
      try {
        await createDataset({
          name: newDatasetName.trim(),
          description: `Dataset created for ${newDatasetName.trim()}`
        });
        setNewDatasetName('');
        setShowDatasetSelector(false);
      } catch (error) {
        console.error('Failed to create dataset:', error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentDataset) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        try {
          await importCsv(currentDataset.id, {
            csvData: csvContent,
            replaceExisting: true,
            createVariables: true
          });
        } catch (error) {
          console.error('Failed to import CSV:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddRow = () => {
    // Only add to local state, don't hit API immediately
    const newRow: DataRow = {};
    variables?.forEach(variable => {
      if (variable && variable.name) {
        newRow[variable.name] = variable.defaultValue || '';
      }
    });
    // Add without id to mark as unsaved
    addDataRow(newRow);
  };

  const handleAddVariable = () => {
    const newVariable: Variable = {
      name: `Variable${(variables?.length || 0) + 1}`,
      type: 'text',
      defaultValue: ''
    };
    
    // Only add to local state, API call will happen when user clicks save
    addVariable(newVariable);
  };

  const handleSaveVariable = async (index: number) => {
    if (!variables || !variables[index] || !currentDataset) return;
    
    const variable = variables[index];
    
    try {
      await createVariable(currentDataset.id, {
        name: variable.name,
        type: variable.type,
        defaultValue: variable.defaultValue || ''
      });
      // Reload variables to get the updated list with IDs
      if (currentDataset) {
        await loadVariables(currentDataset.id);
      }
    } catch (error) {
      console.error('Failed to save variable:', error);
    }
  };

  const handleDeleteVariable = async (index: number) => {
      if (currentDataset && variables && variables[index].id) {
        try {
          await deleteDatasetVariable(currentDataset.id, variables[index].id!);
        } catch (error) {
          console.error('Failed to delete variable:', error);
          // Fallback to local state
          deleteVariable(index);
        }
      } else {
        // Fallback to local state
        deleteVariable(index);
      }
    };
 
   const handleCellChange = (rowIndex: number, variableName: string, value: string) => {
     console.log('handleCellChange called:', { rowIndex, variableName, value, dataLength: data?.length });
     if (!data || !data[rowIndex]) {
       console.log('No data or row not found:', { data, rowIndex });
       return;
     }
     const updatedRow = { ...data[rowIndex], [variableName]: value };
     
     // Only update local state, API call will happen when user clicks save
     updateDataRowLegacy(rowIndex, updatedRow);
     console.log('Updated row:', updatedRow);
   };

  const handleSaveAllData = async () => {
    if (!currentDataset || !data) return;
    
    try {
      // Save all data rows
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row.id) {
          // Existing row - update via API
          await updateDataRow(currentDataset.id, String(row.id), { data: row });
        } else {
          // New row - create via API
          await createDataRowAtIndex(currentDataset.id, { data: row }, i);
        }
      }
      
      // Reload data to get updated IDs
      await loadDataRows(currentDataset.id);
      
      alert('Data berhasil disimpan!');
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, variableName: string) => {
     if (e.key === 'Tab') {
       e.preventDefault();
       
       const currentVariableIndex = variables?.findIndex(v => v.name === variableName) ?? -1;
       const isLastVariable = currentVariableIndex === (variables?.length ?? 0) - 1;
       const isLastRow = rowIndex === (data?.length ?? 0) - 1;
       
       if (isLastVariable && isLastRow) {
         // Create new row when tabbing from last cell
         handleAddRow();
         // Focus will be set to first cell of new row after state update
         setTimeout(() => {
           const firstInput = document.querySelector(`input[data-row="${rowIndex + 1}"][data-variable="${variables?.[0]?.name}"]`) as HTMLInputElement;
           firstInput?.focus();
         }, 100);
       } else if (isLastVariable) {
         // Move to first cell of next row
         setTimeout(() => {
           const nextInput = document.querySelector(`input[data-row="${rowIndex + 1}"][data-variable="${variables?.[0]?.name}"]`) as HTMLInputElement;
           nextInput?.focus();
         }, 0);
       } else {
         // Move to next cell in same row
         const nextVariable = variables?.[currentVariableIndex + 1];
         if (nextVariable) {
           setTimeout(() => {
             const nextInput = document.querySelector(`input[data-row="${rowIndex}"][data-variable="${nextVariable.name}"]`) as HTMLInputElement;
             nextInput?.focus();
           }, 0);
         }
       }
     }
   };
 
   const handleDeleteRow = async (index: number) => {
     if (currentDataset && data && data[index] && data[index].id) {
       try {
         await deleteDataRow(currentDataset.id, String(data[index].id));
         // Reload data to ensure consistency
         await loadDataRows(currentDataset.id);
       } catch (error) {
         console.error('Failed to delete row:', error);
         // Fallback to local state
         deleteDataRowLegacy(index);
       }
     } else {
       // Fallback to local state
       deleteDataRowLegacy(index);
     }
   };
 
   const handleVariableChange = (index: number, field: keyof Variable, value: string) => {
      if (!variables || !variables[index]) return;
      const updatedVariable = { ...variables[index], [field]: value };
      
      // Only update local state, API call will happen when user clicks save
      updateVariable(index, updatedVariable);
    };

    const handleUpdateVariable = async (index: number) => {
      if (!variables || !variables[index] || !currentDataset) return;
      
      const variable = variables[index];
      
      if (variable.id) {
        try {
          await updateDatasetVariable(currentDataset.id, variable.id, {
            name: variable.name,
            type: variable.type,
            defaultValue: variable.defaultValue || ''
          });
          // Reload variables to get the updated list
       if (currentDataset) {
         await loadVariables(currentDataset.id);
       }
        } catch (error) {
          console.error('Failed to update variable:', error);
        }
      }
    };

  const exportToCSV = async () => {
    if (currentDataset) {
      try {
        await exportCsv(currentDataset.id);
      } catch (error) {
        console.error('Failed to export CSV:', error);
        // Fallback to local export
        if (!data || data.length === 0) return;
        
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
      }
    } else {
      // Fallback to local export
      if (!data || data.length === 0) return;
      
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">{t('dataManager')}</h2>
            <div className="flex items-center space-x-2">
              <select
                value={currentDataset?.id || ''}
                onChange={(e) => {
                  const dataset = datasets?.find(d => d && d.id === e.target.value);
                  if (dataset) {
                    setCurrentDataset(dataset);
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                disabled={!datasets || datasets.length === 0}
              >
                <option value="">
                  {!datasets || datasets.length === 0 ? 'No datasets available' : 'Select Dataset'}
                </option>
                {datasets?.filter(dataset => dataset && dataset.id).map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowDatasetSelector(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                {!datasets || datasets.length === 0 ? 'Create First Dataset' : 'New Dataset'}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {showDatasetSelector && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                placeholder="Dataset name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleCreateDataset}
                disabled={!newDatasetName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
Create
              </button>
              <button
                onClick={() => {
                  setShowDatasetSelector(false);
                  setNewDatasetName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
Cancel
              </button>
            </div>
          </div>
        )}

        {(!datasets || datasets.length === 0) && (
          <div className="mb-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">No Datasets Found</h3>
              <p className="text-blue-700 mb-4">
                You don't have any datasets yet. Create your first dataset to start managing data for certificate generation.
              </p>
              <button
                onClick={() => setShowDatasetSelector(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Dataset
              </button>
            </div>
          </div>
        )}

        {datasets && datasets.length > 0 && !currentDataset && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please select a dataset to manage data and variables with API persistence.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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
{t('data')} ({data?.length || 0} {t('rows')})
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'variables'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
{t('variables')} ({variables?.length || 0})
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
                    disabled={!data || data.length === 0}
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
                {!data || data.length === 0 ? (
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
                          {variables?.map((variable) => (
                            variable && variable.name ? (
                              <th key={variable.name} className="border border-gray-300 px-4 py-2 text-left">
                                {variable.name}
                              </th>
                            ) : null
                          ))}
                          <th className="border border-gray-300 px-4 py-2 text-left">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                            {variables?.map((variable) => (
                              variable && variable.name ? (
                                <td key={variable.name} className="border border-gray-300 px-4 py-2">
                                  <input
                                    type="text"
                                    value={row[variable.name] || ''}
                                    onChange={(e) => handleCellChange(index, variable.name, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, variable.name)}
                                    className="w-full px-2 py-1 border border-gray-200 rounded"
                                    data-row={index}
                                    data-variable={variable.name}
                                  />
                                </td>
                              ) : null
                            ))}
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                onClick={() => handleDeleteRow(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Save Button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveAllData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
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
                {/* Debug Info */}
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <div>Current Dataset: {currentDataset?.name || 'None'}</div>
                  <div>Variables Count: {variables?.length || 0}</div>
                  <div>Variables: {JSON.stringify(variables, null, 2)}</div>
                </div>
                <div className="space-y-4">
                  {variables?.map((variable, index) => (
                    variable ? (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
{t('variableName')}
                            </label>
                            <input
                              type="text"
                              value={variable.name || ''}
                              onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
{t('type')}
                            </label>
                            <select
                              value={variable.type || 'text'}
                              onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                          </div>
                          <div className="flex items-end space-x-2">
                            {/* Save button - only show for new variables or when there are unsaved changes */}
                            {(!((variable as any).id) || currentDataset) && (
                              <button
                                onClick={() => {
                                  if ((variable as any).id) {
                                    handleUpdateVariable(index);
                                  } else {
                                    handleSaveVariable(index);
                                  }
                                }}
                                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                disabled={!variable.name?.trim()}
                              >
                                {(variable as any).id ? 'Update' : 'Save'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVariable(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null
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