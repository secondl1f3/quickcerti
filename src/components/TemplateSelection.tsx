import React from 'react';
import { QuickActions } from './QuickActions';

interface TemplateSelectionProps {
  onCreateNew: () => void;
  onUploadTemplate: () => void;
  onUseTemplate: () => void;
}

export const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  onCreateNew,
  onUploadTemplate,
  onUseTemplate,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <QuickActions
        onCreateNew={onCreateNew}
        onUploadTemplate={onUploadTemplate}
        onUseTemplate={onUseTemplate}
      />
    </div>
  );
};