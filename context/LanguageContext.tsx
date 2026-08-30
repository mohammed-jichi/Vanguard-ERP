'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'fa';

export interface LanguageContextType {
  language: LanguageCode;
  direction: 'ltr' | 'rtl';
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
}

const MASTER_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Branding & Core Layout
    company_name: 'Southern Olive Oil Products S.A.R.L',
    app_name: 'Vanguard ERP',
    system_live: 'System Live',
    select_branch: 'Select Branch',
    branch_choueifat: 'Choueifat Main Branch',
    branch_beirut: 'Beirut Branch',
    branch_pressing: 'Central Pressing & Production Plant',

    // 7 Core Modules Navigation
    mod_sales_pos: '1. Sales Control & POS',
    mod_fleet: '2. SuperSonic Fleet Management',
    mod_social_crm: '3. Social CRM & Support',
    mod_operations: '4. Operations & Pressing Center',
    mod_customers_ar: '5. Customer Management & AR',
    mod_accounting: '6. Accounting & Finance',
    mod_hr: '7. HR & Payroll Management',

    // Operations Center Sub-items
    ops_dashboard: 'Operations Center Dashboard',
    ops_olive_pressing: 'Olive Pressing & Production',
    ops_reports: 'Operations & Pressing Reports',

    // Common Actions & Form Controls
    filter_report: 'Filter Report',
    reset_filters: 'Reset Filters',
    print_report: 'Print Report',
    export_report: 'Export Report',
    close_report: 'Close Report',
    return_to_hub: 'Return to Hub',
    search_placeholder: 'Search...',
    all_branches: 'All Branches',
    all_categories: 'All Categories',
    all_divisions: 'All Divisions',
    all_groups: 'All Groups',
    all_salesmen: 'All Salesmen',
    all_invoices: 'All Invoices',
    remove_grouping: 'Remove Grouping',
    show_remark: 'Show Remark',

    // Table Headers (Vanguard Style Normal-Case)
    th_description: 'description',
    th_barcode: 'barcode',
    th_qty: 'qty',
    th_total_amount: 'total amount',
    th_employee_name: 'employee name',
    th_customer: 'customer',
    th_status: 'status',
    th_actions: 'actions',

    // Status Badges
    status_active: 'Active',
    status_pending: 'Pending',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    status_in_transit: 'In Transit',
  },
  ar: {
    company_name: 'Southern Olive Oil Products S.A.R.L',
    app_name: 'نظام Vanguard ERP',
    system_live: 'النظام متصل',
    select_branch: 'اختيار الفرع',
    branch_choueifat: 'فرع الشويفات الرئيسي',
    branch_beirut: 'فرع بيروت',
    branch_pressing: 'المعصرة والإنتاج المركزي',
    mod_sales_pos: '1. التحكم بالمبيعات ونقاط البيع',
    mod_fleet: '2. إدارة أسطول التوصيل',
    mod_social_crm: '3. خدمة العملاء والسوشيال ميديا',
    mod_operations: '4. مركز العمليات والمعصرة',
    mod_customers_ar: '5. إدارة العملاء والذمم المدينة',
    mod_accounting: '6. المحاسبة والمالية',
    mod_hr: '7. الموارد البشرية والرواتب',
    ops_dashboard: 'لوحة مؤشرات العمليات',
    ops_olive_pressing: 'عصر الزيتون والإنتاج',
    ops_reports: 'تقارير العمليات والمعصرة',
    filter_report: 'تطبيق الفلتر',
    reset_filters: 'إعادة تعيين',
    print_report: 'طباعة التقرير',
    export_report: 'تصدير التقرير',
    close_report: 'إغلاق التقرير',
    return_to_hub: 'العودة للرئيسية',
    search_placeholder: 'بحث...',
    all_branches: 'جميع الفروع',
    all_categories: 'جميع الفئات',
    all_divisions: 'جميع الأقسام',
    all_groups: 'جميع المجموعات',
    all_salesmen: 'جميع المندوبين',
    all_invoices: 'جميع الفواتير',
    remove_grouping: 'إلغاء التجميع',
    show_remark: 'عرض الملاحظات',
    th_description: 'الوصف',
    th_barcode: 'الباركود',
    th_qty: 'الكمية',
    th_total_amount: 'المجموع الإجمالي',
    th_employee_name: 'اسم الموظف',
    th_customer: 'العميل',
    th_status: 'الحالة',
    th_actions: 'الإجراءات',
    status_active: 'نشط',
    status_pending: 'مؤجل',
    status_delivered: 'مسلّم',
    status_cancelled: 'ملغى',
    status_in_transit: 'قيد التوصيل',
  },
  fr: {
    company_name: 'Southern Olive Oil Products S.A.R.L',
    app_name: 'Vanguard ERP',
    system_live: 'Système en ligne',
    select_branch: 'Sélectionner une succursale',
    branch_choueifat: 'Succursale principale de Choueifat',
    branch_beirut: 'Succursale de Beyrouth',
    branch_pressing: 'Huilerie et usine de production centrale',
    mod_sales_pos: '1. Contrôle des ventes & POS',
    mod_fleet: '2. Gestion de flotte SuperSonic',
    mod_social_crm: '3. CRM Social & Support',
    mod_operations: '4. Centre des opérations & Pressage',
    mod_customers_ar: '5. Gestion des clients & Créances',
    mod_accounting: '6. Comptabilité & Finances',
    mod_hr: '7. RH & Gestion de paie',
    ops_dashboard: 'Tableau de bord des opérations',
    ops_olive_pressing: 'Pressage des olives & Production',
    ops_reports: 'Rapports des opérations & Huilerie',
    filter_report: 'Filtrer le rapport',
    reset_filters: 'Réinitialiser',
    print_report: 'Imprimer',
    export_report: 'Exporter',
    close_report: 'Fermer',
    return_to_hub: 'Retour',
    search_placeholder: 'Recherche...',
    all_branches: 'Toutes les succursales',
    all_categories: 'Toutes les catégories',
    all_divisions: 'Toutes les divisions',
    all_groups: 'Tous les groupes',
    all_salesmen: 'Tous les vendeurs',
    all_invoices: 'Toutes les factures',
    remove_grouping: 'Supprimer le regroupement',
    show_remark: 'Afficher la remarque',
    th_description: 'description',
    th_barcode: 'code-barres',
    th_qty: 'qté',
    th_total_amount: 'montant total',
    th_employee_name: 'nom de l’employé',
    th_customer: 'client',
    th_status: 'statut',
    th_actions: 'actions',
    status_active: 'Actif',
    status_pending: 'En attente',
    status_delivered: 'Livré',
    status_cancelled: 'Annulé',
    status_in_transit: 'En transit',
  },
  es: {
    company_name: 'Southern Olive Oil Products S.A.R.L',
    app_name: 'Vanguard ERP',
    system_live: 'Sistema en línea',
    select_branch: 'Seleccionar sucursal',
    branch_choueifat: 'Sucursal principal de Choueifat',
    branch_beirut: 'Sucursal de Beirut',
    branch_pressing: 'Planta central de producción y almazara',
    mod_sales_pos: '1. Control de ventas y TPV',
    mod_fleet: '2. Gestión de flotas SuperSonic',
    mod_social_crm: '3. CRM Social y Soporte',
    mod_operations: '4. Centro de operaciones y almazara',
    mod_customers_ar: '5. Gestión de clientes y cuentas',
    mod_accounting: '6. Contabilidad y Finanzas',
    mod_hr: '7. RRHH y Gestión de nóminas',
    ops_dashboard: 'Panel de operaciones',
    ops_olive_pressing: 'Molienda de aceitunas y producción',
    ops_reports: 'Informes de operaciones y almazara',
    filter_report: 'Filtrar informe',
    reset_filters: 'Restablecer',
    print_report: 'Imprimir',
    export_report: 'Exportar',
    close_report: 'Cerrar',
    return_to_hub: 'Volver al inicio',
    search_placeholder: 'Buscar...',
    all_branches: 'Todas las sucursales',
    all_categories: 'Todas las categorías',
    all_divisions: 'Todas las divisiones',
    all_groups: 'Todos los grupos',
    all_salesmen: 'Todos los vendedores',
    all_invoices: 'Todas las facturas',
    remove_grouping: 'Eliminar agrupación',
    show_remark: 'Mostrar observación',
    th_description: 'descripción',
    th_barcode: 'código de barras',
    th_qty: 'cant.',
    th_total_amount: 'importe total',
    th_employee_name: 'nombre del empleado',
    th_customer: 'cliente',
    th_status: 'estado',
    th_actions: 'acciones',
    status_active: 'Activo',
    status_pending: 'Pendiente',
    status_delivered: 'Entregado',
    status_cancelled: 'Cancelado',
    status_in_transit: 'En tránsito',
  },
  fa: {
    company_name: 'Southern Olive Oil Products S.A.R.L',
    app_name: 'سامانه Vanguard ERP',
    system_live: 'سیستم فعال است',
    select_branch: 'انتخاب شعبه',
    branch_choueifat: 'شعبه اصلی شویفات',
    branch_beirut: 'شعبه بیروت',
    branch_pressing: 'کارخانه مرکزی روغنکشی و تولید',
    mod_sales_pos: '1. کنترل فروش و صندوق (POS)',
    mod_fleet: '2. مدیریت ناوگان SuperSonic',
    mod_social_crm: '3. ارتباط با مشتریان و شبکههای اجتماعی',
    mod_operations: '4. مرکز عملیات و روغنکشی زیتون',
    mod_customers_ar: '5. مدیریت مشتریان و حسابها',
    mod_accounting: '6. حسابداری و امور مالی',
    mod_hr: '7. منابع انسانی و حقوق و دستمزد',
    ops_dashboard: 'داشبورد عملیات',
    ops_olive_pressing: 'روغنکشی زیتون و تولید',
    ops_reports: 'گزارشهای عملیات و کارخانه',
    filter_report: 'اعمال فیلتر',
    reset_filters: 'بازنشانی',
    print_report: 'چاپ گزارش',
    export_report: 'خروجی گزارش',
    close_report: 'بستن گزارش',
    return_to_hub: 'بازگشت به مرکز',
    search_placeholder: 'جستجو...',
    all_branches: 'همه شعب',
    all_categories: 'همه دستهها',
    all_divisions: 'همه بخشها',
    all_groups: 'همه گروهها',
    all_salesmen: 'همه فروشندگان',
    all_invoices: 'همه فاکتورها',
    remove_grouping: 'حذف گروهبندی',
    show_remark: 'نمایش توضیحات',
    th_description: 'توضیحات',
    th_barcode: 'بارکد',
    th_qty: 'تعداد',
    th_total_amount: 'مبلغ کل',
    th_employee_name: 'نام کارمند',
    th_customer: 'مشتری',
    th_status: 'وضعیت',
    th_actions: 'عملیات',
    status_active: 'فعال',
    status_pending: 'معلق',
    status_delivered: 'تحویل شده',
    status_cancelled: 'لغو شده',
    status_in_transit: 'در حال ارسال',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  direction: 'ltr',
  dir: 'ltr',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const saved = localStorage.getItem('vanguard_language') as LanguageCode;
    if (saved && ['en', 'ar', 'fr', 'es', 'fa'].includes(saved)) {
      setLanguageState(saved);
      const newDir = saved === 'ar' || saved === 'fa' ? 'rtl' : 'ltr';
      setDirection(newDir);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = newDir;
        document.documentElement.lang = saved;
      }
    } else {
      // Default is English (LTR)
      setLanguageState('en');
      setDirection('ltr');
      if (typeof document !== 'undefined') {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    const newDir = lang === 'ar' || lang === 'fa' ? 'rtl' : 'ltr';
    setDirection(newDir);
    localStorage.setItem('vanguard_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newDir;
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, defaultText?: string) => {
    return MASTER_DICTIONARY[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, dir: direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
