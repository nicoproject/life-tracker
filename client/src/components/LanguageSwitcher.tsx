import React from 'react';
import { useLanguage, Language } from '../constants/labels';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${language === 'ru' ? styles.active : ''}`}
        onClick={() => handleLanguageChange('ru')}
      >
        RU
      </button>
      <button
        className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => handleLanguageChange('en')}
      >
        EN
      </button>
    </div>
  );
}; 
