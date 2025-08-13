export interface Translations {
  // Common
  skip: string;
  next: string;
  back: string;
  getStarted: string;
  continue: string;
  save: string;
  cancel: string;
  done: string;
  loading: string;
  error: string;
  success: string;
  or: string;
  
  // Language Selection
  selectLanguage: string;
  english: string;
  arabic: string;
  chooseLanguage: string;
  
  // Onboarding
  trackSaveGrow: string;
  trackSaveGrowSubtitle: string;
  trackSaveGrowDescription: string;
  privateByDesign: string;
  privateByDesignSubtitle: string;
  privateByDesignDescription: string;
  builtForQatar: string;
  builtForQatarSubtitle: string;
  builtForQatarDescription: string;
  
  // Welcome
  welcomeToMasar: string;
  personalFinanceCompanion: string;
  continueWithEmail: string;
  continueWithPhone: string;
  continueWithSocial: string;
  termsAndPrivacy: string;
  alreadyHaveAccount: string;
  signIn: string;
  
  // Auth
  welcomeBack: string;
  signInToAccount: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  forgotPassword: string;
  createAccount: string;
  dontHaveAccount: string;
  signUpWithEmail: string;
  signUpWithPhone: string;
  enterEmail: string;
  enterPhone: string;
  enterFullName: string;
  enterPassword: string;
  confirmYourPassword: string;
  
  // Validation
  emailRequired: string;
  validEmail: string;
  passwordRequired: string;
  passwordMinLength: string;
  confirmPasswordRequired: string;
  passwordsMatch: string;
  fullNameRequired: string;
  phoneRequired: string;
  validPhone: string;
  
  // Dashboard
  totalBalance: string;
  yourAccounts: string;
  recentExpenses: string;
  upcomingSubscriptions: string;
  noRecentExpenses: string;
  noUpcomingSubscriptions: string;
  welcomeUser: string;
  welcomeToMasarDash: string;
  loadingFinancialData: string;
  
  // Navigation
  dashboard: string;
  accounts: string;
  expenses: string;
  subscriptions: string;
  income: string;
  aiCoach: string;
  deals: string;
  settings: string;

  // Additional UI
  customizeExperience: string;
  preferences: string;
  languageLabel: string;
  autoAddSalary: string;
  biometricAuth: string;
  subscription: string;
  premiumPlan: string;
  planPrice: string;
  planDescription: string;
  dataLabel: string;
  exportDataCsv: string;
  clearAllDataTesting: string;
  logout: string;
  logoutConfirmTitle: string;
  logoutConfirmBody: string;
  deleteAccount: string;
  editProfile: string;
  manageAccounts: string;
  noAccounts: string;
  addNewAccount: string;
  noExpenses: string;
  addNewExpense: string;
}

export const englishTranslations: Translations = {
  // Common
  skip: 'Skip',
  next: 'Next',
  back: 'Back',
  getStarted: 'Get Started',
  continue: 'Continue',
  save: 'Save',
  cancel: 'Cancel',
  done: 'Done',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  or: 'OR',
  
  // Language Selection
  selectLanguage: 'Select Language',
  english: 'English',
  arabic: 'العربية',
  chooseLanguage: 'Choose your preferred language',
  
  // Onboarding
  trackSaveGrow: 'TRACK. SAVE. GROW.',
  trackSaveGrowSubtitle: 'Auto-track subscriptions, bills, and spending.',
  trackSaveGrowDescription: 'Snap receipts to log purchases in seconds.',
  privateByDesign: 'PRIVATE BY DESIGN',
  privateByDesignSubtitle: 'No bank password required; you control what you share.',
  privateByDesignDescription: 'On-device parsing where possible; data stays yours.',
  builtForQatar: 'BUILT FOR QATAR',
  builtForQatarSubtitle: 'Arabic & English, local categories and reminders.',
  builtForQatarDescription: 'Set salary and accounts in under a minute — QAR 10/month.',
  
  // Welcome
  welcomeToMasar: 'WELCOME TO MASAR',
  personalFinanceCompanion: 'YOUR PERSONAL FINANCE COMPANION',
  continueWithEmail: 'Continue with Email',
  continueWithPhone: 'Continue with Phone',
  continueWithSocial: 'Continue with Social Account',
  termsAndPrivacy: 'BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE AND PRIVACY POLICY',
  alreadyHaveAccount: 'ALREADY HAVE AN ACCOUNT?',
  signIn: 'Sign In',
  
  // Auth
  welcomeBack: 'WELCOME BACK',
  signInToAccount: 'SIGN IN TO YOUR ACCOUNT',
  emailAddress: 'Email Address',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  fullName: 'Full Name',
  phoneNumber: 'Phone Number',
  forgotPassword: 'Forgot Password?',
  createAccount: 'Create Account',
  dontHaveAccount: "DON'T HAVE AN ACCOUNT?",
  signUpWithEmail: 'Sign up with Email',
  signUpWithPhone: 'Sign up with Phone',
  enterEmail: 'Enter your email address',
  enterPhone: 'Enter your phone number',
  enterFullName: 'Enter your full name',
  enterPassword: 'Enter your password',
  confirmYourPassword: 'Confirm your password',
  
  // Validation
  emailRequired: 'Email is required',
  validEmail: 'Please enter a valid email address',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 6 characters',
  confirmPasswordRequired: 'Please confirm your password',
  passwordsMatch: 'Passwords do not match',
  fullNameRequired: 'Full name is required',
  phoneRequired: 'Phone number is required',
  validPhone: 'Please enter a valid phone number',
  
  // Dashboard
  totalBalance: 'TOTAL BALANCE',
  yourAccounts: 'YOUR ACCOUNTS',
  recentExpenses: 'RECENT EXPENSES',
  upcomingSubscriptions: 'UPCOMING SUBSCRIPTIONS',
  noRecentExpenses: 'No recent expenses',
  noUpcomingSubscriptions: 'No upcoming subscriptions',
  welcomeUser: 'Welcome back',
  welcomeToMasarDash: 'Welcome to Masar',
  loadingFinancialData: 'Loading your financial data...',
  
  // Navigation
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  expenses: 'Expenses',
  subscriptions: 'Subscriptions',
  income: 'Income',
  aiCoach: 'AI Coach',
  deals: 'Deals',
  settings: 'Settings',

  // Additional UI
  customizeExperience: 'Customize your experience',
  preferences: 'PREFERENCES',
  languageLabel: 'Language',
  autoAddSalary: 'Auto-add Salary',
  biometricAuth: 'Biometric Authentication',
  subscription: 'SUBSCRIPTION',
  premiumPlan: 'PREMIUM PLAN',
  planPrice: 'QAR 10 / month',
  planDescription: 'Full access to all features including AI coach, receipt scanning, and more.',
  dataLabel: 'DATA',
  exportDataCsv: 'Export Data (CSV)',
  clearAllDataTesting: 'Clear All Data (Testing)',
  logout: 'Log Out',
  logoutConfirmTitle: 'Logout',
  logoutConfirmBody: 'Are you sure you want to logout?',
  deleteAccount: 'Delete Account',
  editProfile: 'Edit Profile',
  manageAccounts: 'Manage your bank accounts',
  noAccounts: 'No accounts added yet',
  addNewAccount: 'Add New Account',
  noExpenses: 'No expenses recorded yet',
  addNewExpense: 'Add New Expense',
};

export const arabicTranslations: Translations = {
  // Common
  skip: 'تخطي',
  next: 'التالي',
  back: 'رجوع',
  getStarted: 'ابدأ الآن',
  continue: 'متابعة',
  save: 'حفظ',
  cancel: 'إلغاء',
  done: 'تم',
  loading: 'جاري التحميل...',
  error: 'خطأ',
  success: 'نجح',
  or: 'أو',
  
  // Language Selection
  selectLanguage: 'اختر اللغة',
  english: 'English',
  arabic: 'العربية',
  chooseLanguage: 'اختر لغتك المفضلة',
  
  // Onboarding
  trackSaveGrow: 'تتبع. وفر. انمو.',
  trackSaveGrowSubtitle: 'تتبع تلقائي للاشتراكات والفواتير والمصروفات.',
  trackSaveGrowDescription: 'التقط الإيصالات لتسجيل المشتريات في ثوانٍ.',
  privateByDesign: 'خصوصية بالتصميم',
  privateByDesignSubtitle: 'لا حاجة لكلمة مرور البنك؛ أنت تتحكم فيما تشاركه.',
  privateByDesignDescription: 'معالجة محلية عند الإمكان؛ بياناتك تبقى ملكك.',
  builtForQatar: 'مصمم لقطر',
  builtForQatarSubtitle: 'عربي وإنجليزي، فئات محلية وتذكيرات.',
  builtForQatarDescription: 'اضبط الراتب والحسابات في أقل من دقيقة — 10 ريال قطري/شهر.',
  
  // Welcome
  welcomeToMasar: 'مرحباً بك في مسار',
  personalFinanceCompanion: 'رفيقك في الشؤون المالية الشخصية',
  continueWithEmail: 'متابعة بالبريد الإلكتروني',
  continueWithPhone: 'متابعة برقم الهاتف',
  continueWithSocial: 'متابعة بحساب اجتماعي',
  termsAndPrivacy: 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية',
  alreadyHaveAccount: 'لديك حساب بالفعل؟',
  signIn: 'تسجيل الدخول',
  
  // Auth
  welcomeBack: 'مرحباً بعودتك',
  signInToAccount: 'سجل الدخول إلى حسابك',
  emailAddress: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  fullName: 'الاسم الكامل',
  phoneNumber: 'رقم الهاتف',
  forgotPassword: 'نسيت كلمة المرور؟',
  createAccount: 'إنشاء حساب',
  dontHaveAccount: 'ليس لديك حساب؟',
  signUpWithEmail: 'التسجيل بالبريد الإلكتروني',
  signUpWithPhone: 'التسجيل برقم الهاتف',
  enterEmail: 'أدخل بريدك الإلكتروني',
  enterPhone: 'أدخل رقم هاتفك',
  enterFullName: 'أدخل اسمك الكامل',
  enterPassword: 'أدخل كلمة المرور',
  confirmYourPassword: 'أكد كلمة المرور',
  
  // Validation
  emailRequired: 'البريد الإلكتروني مطلوب',
  validEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  passwordRequired: 'كلمة المرور مطلوبة',
  passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  confirmPasswordRequired: 'يرجى تأكيد كلمة المرور',
  passwordsMatch: 'كلمات المرور غير متطابقة',
  fullNameRequired: 'الاسم الكامل مطلوب',
  phoneRequired: 'رقم الهاتف مطلوب',
  validPhone: 'يرجى إدخال رقم هاتف صحيح',
  
  // Dashboard
  totalBalance: 'الرصيد الإجمالي',
  yourAccounts: 'حساباتك',
  recentExpenses: 'المصروفات الأخيرة',
  upcomingSubscriptions: 'الاشتراكات القادمة',
  noRecentExpenses: 'لا توجد مصروفات حديثة',
  noUpcomingSubscriptions: 'لا توجد اشتراكات قادمة',
  welcomeUser: 'مرحباً بعودتك',
  welcomeToMasarDash: 'مرحباً بك في مسار',
  loadingFinancialData: 'جاري تحميل بياناتك المالية...',
  
  // Navigation
  dashboard: 'لوحة التحكم',
  accounts: 'الحسابات',
  expenses: 'المصروفات',
  subscriptions: 'الاشتراكات',
  income: 'الدخل',
  aiCoach: 'المدرب الذكي',
  deals: 'العروض',
  settings: 'الإعدادات',

  // Additional UI
  customizeExperience: 'خصص تجربتك',
  preferences: 'التفضيلات',
  languageLabel: 'اللغة',
  autoAddSalary: 'إضافة الراتب تلقائياً',
  biometricAuth: 'المصادقة البيومترية',
  subscription: 'الاشتراك',
  premiumPlan: 'الخطة المميزة',
  planPrice: '10 ريال/شهر',
  planDescription: 'وصول كامل لجميع المزايا بما في ذلك المدرب الذكي ومسح الإيصالات والمزيد.',
  dataLabel: 'البيانات',
  exportDataCsv: 'تصدير البيانات (CSV)',
  clearAllDataTesting: 'حذف جميع البيانات (للاختبار)',
  logout: 'تسجيل الخروج',
  logoutConfirmTitle: 'تسجيل الخروج',
  logoutConfirmBody: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
  deleteAccount: 'حذف الحساب',
  editProfile: 'تعديل الملف الشخصي',
  manageAccounts: 'إدارة حساباتك البنكية',
  noAccounts: 'لا توجد حسابات بعد',
  addNewAccount: 'إضافة حساب جديد',
  noExpenses: 'لا توجد مصروفات مسجلة بعد',
  addNewExpense: 'إضافة مصروف جديد',
};

export const translations = {
  en: englishTranslations,
  ar: arabicTranslations,
};

export type Language = keyof typeof translations;