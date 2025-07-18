import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, TranslationKey, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLanguage = 'id' // Default to Indonesian
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations.en[key] || key;
    
    if (variables) {
      Object.keys(variables).forEach(variable => {
        translation = translation.replace(`{{${variable}}}`, String(variables[variable]));
      });
    }
    
    return translation;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Convenience hook for just getting the translation function
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};