import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: { code: string; name: string; flag: string }[];
}

const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.expeditions': 'Expéditions',
    'nav.trips': 'Trajets',
    'nav.reservations': 'Réservations',
    'nav.profile': 'Profil',
    'nav.kyc': 'Vérification',
    'nav.earnings': 'Revenus',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.totalExpeditions': 'Expéditions totales',
    'dashboard.activeReservations': 'Réservations actives', 
    'dashboard.totalEarnings': 'Revenus totaux',
    'dashboard.averageRating': 'Note moyenne',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.quickActions': 'Actions rapides',
    
    // Buttons
    'btn.create': 'Créer',
    'btn.edit': 'Modifier',
    'btn.delete': 'Supprimer',
    'btn.save': 'Enregistrer',
    'btn.cancel': 'Annuler',
    'btn.confirm': 'Confirmer',
    'btn.view': 'Voir',
    'btn.chat': 'Chat',
    'btn.track': 'Suivre',
    'btn.rate': 'Noter',
    
    // Forms
    'form.title': 'Titre',
    'form.description': 'Description',
    'form.weight': 'Poids (kg)',
    'form.departure': 'Départ',
    'form.destination': 'Destination',
    'form.date': 'Date',
    'form.price': 'Prix',
    
    // Status
    'status.pending': 'En attente',
    'status.confirmed': 'Confirmé',
    'status.inTransit': 'En transit',
    'status.delivered': 'Livré',
    'status.cancelled': 'Annulé',
    
    // Messages
    'msg.success': 'Succès !',
    'msg.error': 'Erreur',
    'msg.loading': 'Chargement...',
    'msg.noData': 'Aucune donnée disponible',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.expeditions': 'Expeditions',
    'nav.trips': 'Trips',
    'nav.reservations': 'Reservations',
    'nav.profile': 'Profile',
    'nav.kyc': 'Verification',
    'nav.earnings': 'Earnings',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.totalExpeditions': 'Total Expeditions',
    'dashboard.activeReservations': 'Active Reservations',
    'dashboard.totalEarnings': 'Total Earnings',
    'dashboard.averageRating': 'Average Rating',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    
    // Buttons
    'btn.create': 'Create',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.confirm': 'Confirm',
    'btn.view': 'View',
    'btn.chat': 'Chat',
    'btn.track': 'Track',
    'btn.rate': 'Rate',
    
    // Forms
    'form.title': 'Title',
    'form.description': 'Description',
    'form.weight': 'Weight (kg)',
    'form.departure': 'Departure',
    'form.destination': 'Destination',
    'form.date': 'Date',
    'form.price': 'Price',
    
    // Status
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.inTransit': 'In Transit',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',
    
    // Messages
    'msg.success': 'Success!',
    'msg.error': 'Error',
    'msg.loading': 'Loading...',
    'msg.noData': 'No data available',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.expeditions': 'الشحنات',
    'nav.trips': 'الرحلات',
    'nav.reservations': 'الحجوزات',
    'nav.profile': 'الملف الشخصي',
    'nav.kyc': 'التحقق',
    'nav.earnings': 'الأرباح',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً',
    'dashboard.totalExpeditions': 'إجمالي الشحنات',
    'dashboard.activeReservations': 'الحجوزات النشطة',
    'dashboard.totalEarnings': 'إجمالي الأرباح',
    'dashboard.averageRating': 'التقييم المتوسط',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.quickActions': 'إجراءات سريعة',
    
    // Buttons
    'btn.create': 'إنشاء',
    'btn.edit': 'تعديل',
    'btn.delete': 'حذف',
    'btn.save': 'حفظ',
    'btn.cancel': 'إلغاء',
    'btn.confirm': 'تأكيد',
    'btn.view': 'عرض',
    'btn.chat': 'محادثة',
    'btn.track': 'تتبع',
    'btn.rate': 'تقييم',
    
    // Forms
    'form.title': 'العنوان',
    'form.description': 'الوصف',
    'form.weight': 'الوزن (كغ)',
    'form.departure': 'المغادرة',
    'form.destination': 'الوجهة',
    'form.date': 'التاريخ',
    'form.price': 'السعر',
    
    // Status
    'status.pending': 'في الانتظار',
    'status.confirmed': 'مؤكد',
    'status.inTransit': 'في الطريق',
    'status.delivered': 'تم التسليم',
    'status.cancelled': 'ملغي',
    
    // Messages
    'msg.success': 'نجح!',
    'msg.error': 'خطأ',
    'msg.loading': 'جاري التحميل...',
    'msg.noData': 'لا توجد بيانات متاحة',
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' }
  ];

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Changer la direction du texte pour l'arabe
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      languages
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};