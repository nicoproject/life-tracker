import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'

export type Language = 'en' | 'ru'

export const translations = {
  en: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    dashboardTitle: 'Trackers Dashboard',
    noTrackers: 'You have no trackers yet',
    addTracker: 'Add Tracker',
    trackerType: 'Type',
    currentValue: 'Current Value',
    targetValue: 'Target Value',
    trackerDeleted: 'Tracker successfully deleted',
    trackerUpdated: 'Tracker successfully updated',
    trackerCreated: 'Tracker successfully created',
    errorLoadingTrackers: 'Error loading trackers',
    errorDeletingTracker: 'Error deleting tracker',
    errorUpdatingTracker: 'Error updating tracker',
    errorCreatingTracker: 'Error creating tracker',
    createTracker: 'Create Tracker',
    editTracker: 'Edit Tracker',
    trackerName: 'Tracker Name',
    trackerNamePlaceholder: 'e.g., Workouts',
    targetValuePlaceholder: 'e.g., 100',
    invalidTargetValue:
      'Please enter a valid target value or leave empty for measurements',
    deleteConfirmation: 'Delete Confirmation',
    deleteConfirmationMessage:
      'Are you sure you want to delete this tracker? This action cannot be undone.',
    deleteTracker: 'Delete Tracker',
    smokingTracker: 'Smoking Tracker',
    daysWithoutSmoking: 'Days without smoking',
    markSuccessfulDay: 'Mark successful day',
    markFailure: 'Mark failure',
    resetCounter: 'Reset counter',
    showHistory: 'Show history',
    trackerHistory: 'Tracker History',
    entry: 'entry',
    entries: 'entries',
    alreadyMarkedFailure:
      'You have already marked a failure today, calm down, failure is part of recovery',
    alreadyMarkedSuccess: 'You have already marked a successful day today',
    alreadyReset: 'You have already reset the counter today',
    counterAlreadyReset: 'The counter is already reset',
    entryAlreadyExists: 'This entry already exists',
    statusFailure: 'Failure',
    statusSuccess: 'Success',
    statusReset: 'Reset',
    errorLoadingValue: 'Error loading value',
    errorSavingValue: 'Error saving value',
    futureDateNotAllowed: 'Cannot save values for future dates',
    invalidValue: 'Please enter a valid number',
    valueSaved: 'Value saved successfully',
    enterValue: 'Enter value',
  },
  ru: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    save: 'Сохранить',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    yes: 'Да',
    no: 'Нет',
    dashboardTitle: 'Панель трекеров',
    noTrackers: 'У вас пока нет трекеров',
    addTracker: 'Добавить трекер',
    trackerType: 'Тип',
    currentValue: 'Текущее значение',
    targetValue: 'Целевое значение',
    trackerDeleted: 'Трекер успешно удален',
    trackerUpdated: 'Трекер успешно обновлен',
    trackerCreated: 'Трекер успешно создан',
    errorLoadingTrackers: 'Ошибка при загрузке трекеров',
    errorDeletingTracker: 'Ошибка при удалении трекера',
    errorUpdatingTracker: 'Ошибка при обновлении трекера',
    errorCreatingTracker: 'Ошибка при создании трекера',
    createTracker: 'Создать трекер',
    editTracker: 'Редактировать трекер',
    trackerName: 'Название трекера',
    trackerNamePlaceholder: 'Например: Тренировки',
    targetValuePlaceholder: 'Например: 100',
    invalidTargetValue:
      'Введите корректное целевое значение или оставьте пустым для измерений',
    deleteConfirmation: 'Подтверждение удаления',
    deleteConfirmationMessage:
      'Вы уверены, что хотите удалить трекер? Это действие нельзя отменить.',
    deleteTracker: 'Удалить трекер',
    smokingTracker: 'Трекер курения',
    daysWithoutSmoking: 'Дней без курения',
    markSuccessfulDay: 'Отметить успешный день',
    markFailure: 'Отметить срыв',
    resetCounter: 'Обнулить счетчик',
    showHistory: 'Показать историю',
    trackerHistory: 'История трекера',
    entry: 'запись',
    entries: 'записей',
    alreadyMarkedFailure:
      'Вы уже отметили срыв сегодня, успокойтесь, срыв - часть выздоровления',
    alreadyMarkedSuccess: 'Вы уже отметили успешный день сегодня',
    alreadyReset: 'Вы уже сбросили счетчик сегодня',
    counterAlreadyReset: 'Счетчик уже обнулен',
    entryAlreadyExists: 'Эта запись уже существует',
    statusFailure: 'Срыв',
    statusSuccess: 'Успех',
    statusReset: 'Сброс',
    errorLoadingValue: 'Ошибка при загрузке значения',
    errorSavingValue: 'Ошибка при сохранении значения',
    futureDateNotAllowed: 'Нельзя сохранять значения для будущих дат',
    invalidValue: 'Пожалуйста, введите корректное число',
    valueSaved: 'Значение успешно сохранено',
    enterValue: 'Введите значение',
  },
} as const

export type LabelKey = keyof typeof translations.en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: LabelKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language')
    return (savedLanguage === 'en' || savedLanguage === 'ru') ? savedLanguage : 'ru'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: LabelKey): string => {
    return translations[language][key]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

