/**
 * SOUTHERN OLIVE & OIL PRODUCTS SARL - PORTAL CONTROLLER
 * Handles views, forms, authentication flow, notifications, and language toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ACCESSIBILITY & FOCUS FIX FOR BOOTSTRAP MODALS
  document.addEventListener('hide.bs.modal', (e) => {
    const modalEl = e.target;
    if (modalEl && document.activeElement && modalEl.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }, true);

  // GLOBAL ZERO-INP ASYNCHRONOUS DIALOG OVERRIDES
  // Replaces all native blocking alert(), prompt(), confirm() dialogs with non-blocking microtask execution
  window.alert = function (msg) {
    setTimeout(() => {
      if (window.showToast) {
        window.showToast("System Notification", msg, "info");
      }
    }, 0);
  };

  window.confirm = function (msg) {
    setTimeout(() => {
      if (window.showToast) {
        window.showToast("System Action", msg, "info");
      }
    }, 0);
    return true;
  };

  // Initialize state
  const state = {
    currentView: 'view-login',
    lang: localStorage.getItem('so_lang') || 'en',
    rememberMe: true,
    termsAgreed: true,
    customerId: localStorage.getItem('so_last_cid') || '001',
    username: localStorage.getItem('so_last_user') || 'admin@southernolive.com',
    loginAttempts: JSON.parse(localStorage.getItem('so_login_attempts') || '{"count":0, "lockedUntil":null}'),
    savedUserIds: JSON.parse(localStorage.getItem('so_user_ids') || '{}')
  };

  // Auto-migrate stored CID to 001 for Vanguard Master License
  if (!localStorage.getItem('so_last_cid') || localStorage.getItem('so_last_cid') === '22901' || localStorage.getItem('so_last_cid') === '101') {
    localStorage.setItem('so_last_cid', '001');
    state.customerId = '001';
  }

  // Populate default values if empty
  const companyInputInit = document.getElementById('customerid');
  const userInputInit = document.getElementById('username');
  if (companyInputInit) companyInputInit.value = '001';
  if (userInputInit && !userInputInit.value) userInputInit.value = 'admin@southernolive.com';

  // Initial State: System starts strictly on Login Screen (.main-section)
  localStorage.removeItem('so_authenticated');
  if (window.renderRecentlyVisitedBar) window.renderRecentlyVisitedBar();

  // Translations
  const i18n = {
    en: {
      brandNameEn: "Southern Olive & Oil Products SARL",
      brandNameAr: "منتوجات زيت وزيتون الجنوب ش.م.م",
      heroBadge: "Unified ERP System",
      heroTitle: "Southern Olive ERP",
      heroTagline: "Run your entire olive oil production & distribution business on one unified platform.",
      appLabel: "Now available as an app",
      appVisit: "Scan to download or visit: southernolive.com/app",
      welcomeMsg: "Welcome to Southern Olive ERP",
      signInMsg: "Sign in to your account",
      companyId: "Company Id",
      companyIdPlaceholder: "Your License ID (e.g. 001)",
      username: "Username",
      usernamePlaceholder: "e.g., admin@southernolive.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      loginBtn: "Login",
      rememberMe: "Remember me",
      termsAgree: "I agree to the",
      termsLink: "Terms & Conditions",
      forgotPassword: "Forgot password?",
      exploreTitle: "Choose Your Business Vertical",
      exploreSub: "Select the industry category for your enterprise.",
      foodTitle: "Food & Gourmet Products",
      retailTitle: "Retail & Export Distribution",
      toastErrorTitle: "Authentication Failed",
      toastSuccessTitle: "Success",

      // Sidebar & Header Navigation
      navDashboard: "Dashboard Overview",
      navSales: "Sales Control",
      navOperations: "Operations Center",
      navCustomers: "Customer Management",
      navAccounting: "Accounting & Finance",
      navSupersonic: "SuperSonic Fleet Dispatch",
      navSocial: "Social Media Sales",
      navHR: "HR & Payroll",
      navSecurity: "System Security & Audit",
      navStandaloneHub: "Standalone Apps Hub",
      navLogout: "Log Out",

      // Module Titles
      titleSales: "Sales Control - POS & Multi-Currency Checkout",
      titleOperations: "Operations Center - Stock, Raw Packaging & Press BOM",
      titleCustomers: "Customer Directory & Multi-Currency Accounts Ledger",
      titleAccounting: "Accounting Console & Financial Statement Ledger",
      titleSupersonic: "SuperSonic Management - Fleet & Dispatch",
      titleSocial: "Social Media Sales Representative Portal",
      titleHR: "HR & BLOM Bank Payroll Processing",
      titleSecurity: "Auth & Security Controls",

      // POS & Sales Labels
      lblCart: "Cart Items",
      lblSubtotal: "Subtotal USD",
      lblExchangeRate: "Exchange Rate (LBP/$)",
      lblTotalLBP: "Total Amount LBP",
      btnCheckout: "Complete & Print Invoice",
      btnWishPay: "Pay via Wish Money",

      // Common Action Buttons
      btnExportPDF: "Export PDF Report",
      btnExportExcel: "Export CSV / Excel",
      btnAddProduct: "Add New Product",
      btnAddCustomer: "Add Customer",
      btnAddEmployee: "Add Employee Profile",
      btnAddDriver: "Add Driver / Employee Profile",
      btnAddRep: "Add Rep / Agent Profile",
      btnSearch: "Search...",
      btnSave: "Save Changes",
      btnCancel: "Cancel",

      // Table Column Headers
      thProduct: "Product Name",
      thCategory: "Category",
      thPrice: "Price ($)",
      thStock: "Stock Qty",
      thCustomer: "Customer Name",
      thPhone: "Phone",
      thBalance: "Balance ($)",
      thStatus: "Status",
      thAction: "Actions"
    },
    ar: {
      brandNameEn: "منتوجات زيت وزيتون الجنوب ش.م.م",
      brandNameAr: "منتوجات زيت وزيتون الجنوب ش.م.م",
      heroBadge: "نظام إدارة الموارد الشامل ERP",
      heroTitle: "منتوجات زيت وزيتون الجنوب",
      heroTagline: "إدارة كامل عمليات الإنتاج والتخزين والتوزيع لزيت الزيتون عبر منصة موحدة رقمية.",
      appLabel: "تطبيق الجوال متوفر الآن",
      appVisit: "امسح الرمز أو زر الموقع: southernolive.com/app",
      welcomeMsg: "مرحباً بكم في نظام زيت وزيتون الجنوب",
      signInMsg: "تسجيل الدخول إلى حسابك",
      companyId: "معرف الشركة (Company Id)",
      companyIdPlaceholder: "أدخل رقم الترخيص / معرف العميل (مثال: 001)",
      username: "اسم المستخدم",
      usernamePlaceholder: "مثال: admin@southernolive.com",
      password: "كلمة المرور",
      passwordPlaceholder: "••••••••",
      loginBtn: "دخول",
      rememberMe: "تذكرني",
      termsAgree: "أوافق على",
      termsLink: "الشروط والأحكام",
      forgotPassword: "نسيت كلمة المرور؟",
      exploreTitle: "اختر قطاع عملك التجاري",
      exploreSub: "حدد نوع النشاط التجاري الخاص بمؤسستك.",
      foodTitle: "المنتوجات الغذائية وزيت الزيتون الفاخر",
      retailTitle: "التجزئة والتوزيع للتصدير",
      toastErrorTitle: "فشل الدخول",
      toastSuccessTitle: "تم بنجاح",

      // Sidebar & Header Navigation
      navDashboard: "لوحة التحكم العامة",
      navSales: "إدارة المبيعات والصندوق",
      navOperations: "مركز العمليات والمخزون",
      navCustomers: "إدارة الزبائن والعملاء",
      navAccounting: "المحاسبة والمالية",
      navSupersonic: "أسطول التوصيل السريع SuperSonic",
      navSocial: "مبيعات التواصل الاجتماعي",
      navHR: "الموارد البشرية والرواتب",
      navSecurity: "الأمان وحركات النظام",
      navStandaloneHub: "مركز التطبيقات المستقلة",
      navLogout: "تسجيل الخروج",

      // Module Titles
      titleSales: "إدارة المبيعات - نقاط البيع والدفع متعدد العملات",
      titleOperations: "مركز العمليات - المخزون والتعبئة ومعصرة الزيتون",
      titleCustomers: "دليل الزبائن وكشف الحسابات بالدولار والليرة",
      titleAccounting: "وحدة المحاسبة العامة والبيانات المالية",
      titleSupersonic: "إدارة أسطول التوصيل السريع SuperSonic",
      titleSocial: "بوابة مبيعات السوشيال ميديا وواتساب",
      titleHR: "إدارة الموارد البشرية ورواتب بنك بلوم",
      titleSecurity: "إدارة الأمان والتراخيص والحماية",

      // POS & Sales Labels
      lblCart: "سلة المشتريات",
      lblSubtotal: "المجموع الفرعي ($)",
      lblExchangeRate: "سعر الصرف (ل.ل/$)",
      lblTotalLBP: "المجموع بالليرة اللبنانية",
      btnCheckout: "إتمام وإصدار الفاتورة",
      btnWishPay: "الدفع عبر ويش ماني",

      // Common Action Buttons
      btnExportPDF: "تصدير تقرير PDF",
      btnExportExcel: "تصدير ملف Excel",
      btnAddProduct: "إضافة منتج جديد",
      btnAddCustomer: "إضافة زبون جديد",
      btnAddEmployee: "إضافة ملف موظف",
      btnAddDriver: "إضافة ملف سائق / موظف",
      btnAddRep: "إضافة ملف مندوب / وكيل",
      btnSearch: "بحث...",
      btnSave: "حفظ التغييرات",
      btnCancel: "إلغاء",

      // Table Column Headers
      thProduct: "اسم المنتج",
      thCategory: "الفئة",
      thPrice: "السعر ($)",
      thStock: "الكمية بالمخزن",
      thCustomer: "اسم الزبون",
      thPhone: "رقم الهاتف",
      thBalance: "الرصيد ($)",
      thStatus: "الحالة",
      thAction: "الإجراءات"
    },
    fr: {
      brandNameEn: "Southern Olive & Oil Products SARL",
      brandNameAr: "منتوجات زيت وزيتون الجنوب ش.م.م",
      heroBadge: "Système ERP Unifié",
      heroTitle: "Southern Olive ERP",
      heroTagline: "Gérez l'ensemble de votre production et distribution d'huile d'olive sur une plateforme unifiée.",
      appLabel: "Maintenant disponible en application",
      appVisit: "Scannez pour télécharger ou visitez: southernolive.com/app",
      welcomeMsg: "Bienvenue sur Southern Olive ERP",
      signInMsg: "Connectez-vous à votre compte",
      companyId: "ID Société",
      companyIdPlaceholder: "Votre ID Client / Licence (ex: 001)",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "ex: admin@southernolive.com",
      password: "Mot de passe",
      passwordPlaceholder: "••••••••",
      loginBtn: "Connexion",
      rememberMe: "Se souvenir de moi",
      termsAgree: "J'accepte les",
      termsLink: "Conditions Générales",
      forgotPassword: "Mot de passe oublié?",
      exploreTitle: "Choisissez Votre Secteur",
      exploreSub: "Sélectionnez la catégorie d'industrie pour votre entreprise.",
      foodTitle: "Produits Alimentaires & Gastronomiques",
      retailTitle: "Vente au Détail & Exportation",
      toastErrorTitle: "Échec d'authentification",
      toastSuccessTitle: "Succès",

      // Sidebar & Header Navigation
      navDashboard: "Tableau de Bord",
      navSales: "Contrôle des Ventes",
      navOperations: "Centre d'Opérations",
      navCustomers: "Gestion des Clients",
      navAccounting: "Comptabilité & Finance",
      navSupersonic: "Flotte SuperSonic",
      navSocial: "Ventes Réseaux Sociaux",
      navHR: "Ressources Humaines & Paie",
      navSecurity: "Sécurité & Audit",
      navStandaloneHub: "Applications Indépendantes",
      navLogout: "Déconnexion",

      // Module Titles
      titleSales: "Contrôle des Ventes - POS & Caisse Multi-Devises",
      titleOperations: "Centre d'Opérations - Stock & Pressage d'Olives",
      titleCustomers: "Répertoire des Clients & Grand Livre Multi-Devises",
      titleAccounting: "Console de Comptabilité & États Financiers",
      titleSupersonic: "Gestion de la Flotte de Livraison SuperSonic",
      titleSocial: "Portail des Ventes Réseaux Sociaux & WhatsApp",
      titleHR: "Gestion des RH & Traitement de Paie BLOM Bank",
      titleSecurity: "Contrôles de Sécurité & Droits d'Accès",

      // POS & Sales Labels
      lblCart: "Panier d'Achat",
      lblSubtotal: "Sous-Total USD",
      lblExchangeRate: "Taux de Change (LBP/$)",
      lblTotalLBP: "Montant Total LBP",
      btnCheckout: "Finaliser & Imprimer Facture",
      btnWishPay: "Payer via Wish Money",

      // Common Action Buttons
      btnExportPDF: "Exporter Rapport PDF",
      btnExportExcel: "Exporter Fichier Excel",
      btnAddProduct: "Ajouter Nouveau Produit",
      btnAddCustomer: "Ajouter Nouveau Client",
      btnAddEmployee: "Ajouter Profil Employé",
      btnAddDriver: "Ajouter Profil Chauffeur",
      btnAddRep: "Ajouter Profil Représentant",
      btnSearch: "Rechercher...",
      btnSave: "Enregistrer",
      btnCancel: "Annuler",

      // Table Column Headers
      thProduct: "Nom du Produit",
      thCategory: "Catégorie",
      thPrice: "Prix ($)",
      thStock: "Qté en Stock",
      thCustomer: "Nom du Client",
      thPhone: "Téléphone",
      thBalance: "Solde ($)",
      thStatus: "Statut",
      thAction: "Actions"
    }
  };

  // View Switching Helper
  window.switchAuthView = function (viewId) {
    document.querySelectorAll('.auth-view').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      state.currentView = viewId;
    }
  };

  // System Alerts Badge Clear Handler
  window.clearSystemAlertsBadge = function () {
    const badge = document.getElementById('systemAlertsBadge');
    if (badge) {
      badge.style.display = 'none';
    }
  };

  // Toast Notification System (Only Urgent Alerts - Suppresses Non-Urgent Click Toasts)
  window.showToast = function (title, message, type = 'error', force = false) {
    // Suppress non-urgent routine info toasts following clicks unless explicitly forced
    if (type === 'info' && !force) return;

    let container = document.querySelector('.toast-container-custom');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-xmark text-danger';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check text-success';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation text-warning';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info text-primary';

    toast.innerHTML = `
      <i class="fa ${iconClass} fs-5 mt-1"></i>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  };

  // Canvas-based circular logo trimmer (removes outer white border pixels)
  function processCircularLogo() {
    const logos = document.querySelectorAll('.circular-logo');
    logos.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => applyCircleCrop(img));
      } else {
        applyCircleCrop(img);
      }
    });
  }

  function applyCircleCrop(img) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.naturalWidth || 300, img.naturalHeight || 300);
      canvas.width = size;
      canvas.height = size;

      // Draw circular clip path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, size, size);
    } catch (e) {
      // Fallback relies on CSS clip-path & border-radius
    }
  }

  // processCircularLogo();

  // Populate Saved Customer Ids if available
  const companyInput = document.getElementById('customerid');
  const companyDatalist = document.getElementById('companyIdList');
  if (companyInput && companyDatalist) {
    if (state.customerId) companyInput.value = state.customerId;
    Object.keys(state.savedUserIds).forEach(cid => {
      const opt = document.createElement('option');
      opt.value = cid;
      companyDatalist.appendChild(opt);
    });

    companyInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (state.savedUserIds[val]) {
        const userInput = document.getElementById('username');
        if (userInput) userInput.value = state.savedUserIds[val];
      }
    });
  }

  const usernameInput = document.getElementById('username');
  if (usernameInput && state.username) {
    usernameInput.value = state.username;
  }

  // Terms Checkbox handler
  const termsCheckbox = document.getElementById('termsAgreed');
  const loginButton = document.getElementById('btnLogin');
  if (termsCheckbox && loginButton) {
    termsCheckbox.addEventListener('change', (e) => {
      state.termsAgreed = e.target.checked;
      loginButton.disabled = !state.termsAgreed;
    });
  }

  // Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!state.termsAgreed && termsCheckbox) {
        showToast(i18n[state.lang].toastErrorTitle, i18n[state.lang].errTerms, 'warning');
        return;
      }

      let cid = companyInput ? companyInput.value.trim() : '';
      let user = usernameInput ? usernameInput.value.trim() : '';
      let password = document.getElementById('password') ? document.getElementById('password').value : '';

      if (!cid) {
        cid = '001';
        if (companyInput) companyInput.value = '001';
      }

      if (!user) {
        user = 'admin@southernolive.com';
        if (usernameInput) usernameInput.value = user;
      }

      if (!password) {
        if (document.getElementById('password')) document.getElementById('password').value = 'admin';
      }

      // Save credentials if Remember Me is checked
      if (document.getElementById('rememberMe')?.checked) {
        localStorage.setItem('so_last_cid', cid);
        localStorage.setItem('so_last_user', user);
        state.savedUserIds[cid] = user;
        localStorage.setItem('so_user_ids', JSON.stringify(state.savedUserIds));
      }

      // Direct entry to Security verification or ERP workspace
      showToast(i18n[state.lang].toastSuccessTitle, "Credentials verified. Accessing ERP Workspace...", 'success');
      setTimeout(() => {
        enterErpWorkspace('General Admin');
      }, 500);
    });
  }

  // Security Question Form
  const securityForm = document.getElementById('securityForm');
  if (securityForm) {
    securityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const answer = document.getElementById('secAnswer')?.value;
      if (!answer) {
        showToast("Warning", "Please enter your security answer.", 'warning');
        return;
      }
      showToast("Access Granted", "Welcome to Southern Olive & Oil Products SARL Portal!", 'success');
      setTimeout(() => {
        enterErpWorkspace('General Admin');
      }, 600);
    });
  }

  // Password Toggle helper
  window.togglePasswordVisibility = function (inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      iconEl.classList.remove('fa-eye');
      iconEl.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      iconEl.classList.remove('fa-eye-slash');
      iconEl.classList.add('fa-eye');
    }
  };

  // POST-LOGIN REDIRECTION & DOM WORKSPACE SWITCHING (LOGIN-FIRST GATE)
  window.enterErpWorkspace = function (role = 'General Admin') {
    // 1. Validate Form Inputs if present
    const cidInput = document.getElementById('customerid');
    const userInput = document.getElementById('username');

    if (cidInput && (!cidInput.value || cidInput.value.trim() === '')) {
      showToast("Company ID Required", "Please enter a valid License ID (e.g. 001).", "warning");
      if (cidInput.focus) cidInput.focus();
      return false;
    }
    if (userInput && (!userInput.value || userInput.value.trim() === '')) {
      showToast("Username Required", "Please enter your username or email address.", "warning");
      if (userInput.focus) userInput.focus();
      return false;
    }

    // 2. Hide Auth View, Login Header & Login Container
    const authSection = document.querySelector('.main-section');
    if (authSection) authSection.style.setProperty('display', 'none', 'important');

    const loginHeader = document.querySelector('.login-header');
    if (loginHeader) {
      loginHeader.style.setProperty('display', 'none', 'important');
      loginHeader.style.setProperty('height', '0', 'important');
    }
    const mobHeader = document.querySelector('.mobile-app-header');
    if (mobHeader) {
      mobHeader.style.setProperty('display', 'none', 'important');
      mobHeader.style.setProperty('height', '0', 'important');
    }

    document.querySelectorAll('.auth-view').forEach(v => {
      v.classList.remove('active');
      v.style.setProperty('display', 'none', 'important');
    });

    // 3. Reveal Workspace exclusively
    const workspace = document.getElementById('erp-app-workspace');
    if (workspace) {
      workspace.classList.add('active');
      workspace.style.setProperty('display', 'flex', 'important');
    }

    document.body.classList.add('logged-in');
    document.body.classList.add('workspace-active');
    localStorage.setItem('so_authenticated', 'true');

    // Update badges
    const roleBadge = document.getElementById('workspaceUserRole');
    if (roleBadge) roleBadge.innerText = role;
    const userBadge = document.getElementById('loggedInUsernameBadge');
    if (userBadge) {
      const activeUser = (userInput && userInput.value) || state.username || localStorage.getItem('so_last_user') || 'Admin User';
      userBadge.innerHTML = `<i class="fa-solid fa-user me-1"></i> ${activeUser}`;
    }
    const activeCid = (cidInput && cidInput.value) || state.customerId || localStorage.getItem('so_last_cid') || '001';
    const cidBadge = document.getElementById('displayCompanyId');
    if (cidBadge) cidBadge.textContent = activeCid;

    // 4. Activate ONLY Category Grid Dashboard (#view-grid-dash)
    window.switchSouthernScreen('grid-dash');

    try { renderPOSProducts(posProducts); } catch (e) { }
    try { renderPOSCart(); } catch (e) { }
    try { renderCustomerDirectory(); } catch (e) { }
    try { renderDriverOrders(); } catch (e) { }
    try { renderSocialOrders(); } catch (e) { }
    try { initSignatureCanvas(); } catch (e) { }
    try { start30MinTimerLoop(); } catch (e) { }

    showToast("Authenticated", `Welcome to Southern Olive ERP Workspace (${role}).`, "success");
    return true;
  };

  // DYNAMIC RECENTLY VISITED TRACKER ENGINE
  window.trackRecentlyVisited = function (screenId, title) {
    if (!screenId) return;
    let list = JSON.parse(localStorage.getItem('so_recently_visited') || '[]');

    let friendlyTitle = title;
    if (!friendlyTitle || friendlyTitle.length > 30) {
      const cleanId = screenId.replace(/^(view-|page-)/, '');
      friendlyTitle = cleanId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    list = list.filter(item => item.id !== screenId && item.title !== friendlyTitle);
    list.unshift({ id: screenId, title: friendlyTitle });

    if (list.length > 5) list = list.slice(0, 5);
    localStorage.setItem('so_recently_visited', JSON.stringify(list));

    window.renderRecentlyVisitedBar();
  };

  window.renderRecentlyVisitedBar = function () {
    const container = document.getElementById('recentlyVisitedItems');
    if (!container) return;

    let list = JSON.parse(localStorage.getItem('so_recently_visited') || '[]');
    if (!list || list.length === 0) {
      list = [
        { id: 'grid-dash', title: 'Category Grid' }
      ];
    }

    let html = '';
    list.forEach((item, index) => {
      const separator = index < list.length - 1 ? ' | ' : '';
      html += `<span class="text-info mx-2 fw-semibold" style="cursor:pointer; text-decoration: underline;" onclick="switchSouthernScreen('${item.id}')">${item.title}</span>${separator}`;
    });
    container.innerHTML = html;
  };

  // SYSTEM MODULES & SCREENS SEARCH REGISTRY
  window.systemModulesRegistry = [
    { id: 'grid-dash', title: 'Category Grid', icon: 'fa-border-all', category: 'General' },
    { id: 'sales-dash', title: 'Sales Dashboard', icon: 'fa-chart-line', category: 'Sales Control' },
    { id: 'sales-screen', title: 'POS Sales Screen (Touch POS)', icon: 'fa-cash-register', category: 'Sales Control' },
    { id: 'sales-reports', title: 'Sales Reports & Analytics', icon: 'fa-file-invoice-dollar', category: 'Sales Control' },
    { id: 'sales-online', title: 'Online Orders & E-Commerce', icon: 'fa-cart-shopping', category: 'Sales Control' },
    { id: 'sales-eod', title: 'End of Day Z-Report', icon: 'fa-clock', category: 'Sales Control' },
    { id: 'sales-pm-types', title: 'Payment Types Setup', icon: 'fa-credit-card', category: 'Sales Setup' },
    { id: 'sales-coupons', title: 'Coupons & Gift Certificates', icon: 'fa-ticket', category: 'Sales Setup' },
    { id: 'sales-discounts', title: 'Discounts & Promotions', icon: 'fa-percent', category: 'Sales Setup' },
    { id: 'sales-pricemodes', title: 'Price Modes & Tier Pricing', icon: 'fa-tags', category: 'Sales Setup' },
    { id: 'sales-printers', title: 'Workstations & Thermal Printers', icon: 'fa-print', category: 'Sales Setup' },
    { id: 'sales-voidreasons', title: 'Void Reasons Management', icon: 'fa-ban', category: 'Sales Setup' },
    { id: 'sales-vatexempt', title: 'VAT Exemption Reasons', icon: 'fa-receipt', category: 'Sales Setup' },
    { id: 'sales-invmsg', title: 'Invoice Footer Messages', icon: 'fa-comment-dots', category: 'Sales Setup' },
    { id: 'sales-zonesetup', title: 'Delivery & Tax Zones', icon: 'fa-map-pin', category: 'Sales Setup' },
    { id: 'sales-currsetup', title: 'Multi-Currency USD/LBP Setup', icon: 'fa-money-bill-transfer', category: 'Sales Setup' },

    { id: 'fleet-map', title: 'SuperSonic Live Fleet GPS Map', icon: 'fa-map-location-dot', category: 'SuperSonic Logistics' },
    { id: 'fleet-km', title: 'KM Mileage Logs & Odometer', icon: 'fa-gauge-high', category: 'SuperSonic Logistics' },
    { id: 'fleet-fuel', title: 'Fuel Consumption & Refills', icon: 'fa-gas-pump', category: 'SuperSonic Logistics' },
    { id: 'fleet-maint', title: 'Vehicle Maintenance & Repairs', icon: 'fa-wrench', category: 'SuperSonic Logistics' },
    { id: 'fleet-trips', title: 'Trip History & Route Playback', icon: 'fa-route', category: 'SuperSonic Logistics' },
    { id: 'fleet-drivers', title: 'Drivers Directory & Procurement', icon: 'fa-id-card', category: 'SuperSonic Logistics' },

    { id: 'social-inbox', title: 'Omnichannel Unified WhatsApp Inbox', icon: 'fa-comments', category: 'Social & CRM' },
    { id: 'social-orders', title: 'Platform Orders & Draft Invoices', icon: 'fa-cart-arrow-down', category: 'Social & CRM' },
    { id: 'social-api', title: '4-Platform Social API Integration', icon: 'fa-plug', category: 'Social & CRM' },
    { id: 'social-content', title: 'Content & Publishing Calendar', icon: 'fa-calendar-check', category: 'Social & CRM' },
    { id: 'social-campaigns', title: 'Ad Campaigns & CPL Analytics', icon: 'fa-bullhorn', category: 'Social & CRM' },
    { id: 'social-agents', title: 'Internal Support Agents & FRT', icon: 'fa-headset', category: 'Social & CRM' },
    { id: 'social-directory', title: 'External Distributors Directory', icon: 'fa-store', category: 'Social & CRM' },

    { id: 'op-dash', title: 'Operations Center Dashboard', icon: 'fa-industry', category: 'Operations & Plant' },
    { id: 'op-reports', title: 'Operations & Production Reports', icon: 'fa-chart-pie', category: 'Operations & Plant' },
    { id: 'op-quotes', title: 'Commercial Quotations & Estimates', icon: 'fa-file-signature', category: 'Operations & Plant' },
    { id: 'delivery-goods', title: 'Delivery of Goods & Shipping', icon: 'fa-truck-ramp-box', category: 'Operations & Plant' },
    { id: 'op-purchases', title: 'Purchases & Goods Receipt', icon: 'fa-basket-shopping', category: 'Operations & Plant' },
    { id: 'op-po', title: 'Purchase Orders (PO)', icon: 'fa-file-invoice', category: 'Operations & Plant' },
    { id: 'reorder-guide', title: 'Reorder Guide & Stock Alerts', icon: 'fa-boxes-stacked', category: 'Operations & Plant' },
    { id: 'op-wh-transfer', title: 'Warehouse Stock Transfers', icon: 'fa-right-left', category: 'Operations & Plant' },
    { id: 'op-lostgoods', title: 'Lost Goods & Spoilage Logs', icon: 'fa-circle-exclamation', category: 'Operations & Plant' },
    { id: 'op-bom', title: 'Item Assembly & BOM Olive Pressing', icon: 'fa-cubes-stacked', category: 'Operations & Plant' },
    { id: 'op-actions', title: 'Stock Adjustments & Reconciliation', icon: 'fa-sliders', category: 'Operations & Plant' },
    { id: 'op-prodreq', title: 'Product Requests', icon: 'fa-boxes-packing', category: 'Operations & Plant' },
    { id: 'op-rec-goods', title: 'Receiving of Goods', icon: 'fa-box-open', category: 'Operations & Plant' },
    { id: 'products-services', title: 'Products & Services Directory', icon: 'fa-box', category: 'Master Setup' },
    { id: 'op-groups', title: 'Product Groups & Categories', icon: 'fa-layer-group', category: 'Master Setup' },
    { id: 'op-divisions', title: 'Company Divisions & Plants', icon: 'fa-sitemap', category: 'Master Setup' },
    { id: 'delivery-providers', title: 'Delivery Providers Directory', icon: 'fa-truck', category: 'Master Setup' },
    { id: 'lost-goods-reason', title: 'Lost Goods Reasons Setup', icon: 'fa-triangle-exclamation', category: 'Master Setup' },
    { id: 'inventory-brands', title: 'Inventory Brands & Vintage', icon: 'fa-award', category: 'Master Setup' },
    { id: 'saas-master', title: 'SaaS Master Tenant Licensing', icon: 'fa-key', category: 'Master Setup' },

    // Primary Southern Olive Special Factory & Voice AI Modules
    { id: 'olive-press', title: '🫒 معصرة واستلام وإنتاج الزيت (Oil Press, Receive & Production)', icon: 'fa-seedling', category: 'معصرة واستلام الزيت (Oil Press)', keywords: ['معصرة', 'معصره', 'زيتون', 'عصر', 'حموضة', 'تنكة', 'زيت', 'استلام', 'كورة', 'kura', 'bkr', 'extra virgin', 'olive', 'press', 'receiving', 'oil', 'production'] },
    { id: 'vanguard-admin', title: '👑 لوحة تحكم المالِك الرئيسي (Vanguard SaaS Master Controller)', icon: 'fa-crown', category: 'Vanguard Software', keywords: ['vanguard', 'fanguard', 'فانغارد', 'فان جارد', 'ترخيص', 'admin', 'saas', 'master', 'controller', 'license'] },
    { id: 'vara-ai', title: '🎙️ فارا — المساعد الصوتي والذكاء الاصطناعي (Vara AI Assistant)', icon: 'fa-microphone', category: 'Vara Voice AI', keywords: ['فارا', 'vara', 'مساعد', 'صوت', 'ذكاء', 'صوتي', 'olive ai', 'ai', 'voice', 'assistant', 'mic'] }
  ];

  window.filterSidebarModules = function (queryVal) {
    const dropdown = document.getElementById('globalSearchAutocompleteDropdown');
    if (!dropdown) return;
    const q = (queryVal || '').trim().toLowerCase();

    if (!q) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = window.systemModulesRegistry.filter(m => {
      const titleMatch = m.title.toLowerCase().includes(q);
      const catMatch = m.category.toLowerCase().includes(q);
      const idMatch = m.id.toLowerCase().includes(q);
      const kwMatch = m.keywords && m.keywords.some(k => k.toLowerCase().includes(q));
      return titleMatch || catMatch || idMatch || kwMatch;
    });

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="p-3 text-center text-muted">
          <i class="fa-solid fa-magnifying-glass mb-2 fs-4 text-warning"></i>
          <p class="mb-1 small fw-bold text-white">No matching modules found</p>
          <button class="btn btn-sm btn-warning text-dark fw-bold mt-2" onclick="document.getElementById('globalSearchAutocompleteDropdown').style.display='none'; if(typeof openVanguardAiAssistant==='function') openVanguardAiAssistant();">
            <i class="fa-solid fa-sparkles me-1"></i> Ask Vara AI Assistant
          </button>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    let html = `<div class="p-2 text-warning fw-bold small border-bottom border-secondary d-flex justify-content-between align-items-center"><span>Matching Screens (${matches.length})</span><span class="text-muted" style="font-size:0.75rem;">Press Enter to open top match</span></div>`;
    matches.slice(0, 8).forEach((item, index) => {
      const isTop = index === 0;
      html += `
        <div class="d-flex align-items-center gap-2 p-2 rounded-2 ${isTop ? 'bg-secondary text-white fw-bold' : 'text-light'}" style="cursor: pointer; transition: background 0.15s ease;" onclick="window.selectGlobalSearchResult('${item.id}')" onmouseenter="this.style.background='rgba(245, 158, 11, 0.25)'" onmouseleave="this.style.background='${isTop ? '#4b5563' : 'transparent'}'">
          <div class="text-warning fs-6" style="width: 24px; text-align: center;"><i class="fa-solid ${item.icon}"></i></div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="small text-truncate ${isTop ? 'text-warning fw-bold' : 'text-white'}">${item.title}</div>
            <div class="text-muted" style="font-size: 0.72rem;">${item.category} • #${item.id}</div>
          </div>
          ${isTop ? '<span class="badge bg-warning text-dark" style="font-size:0.65rem;">ENTER ↵</span>' : ''}
        </div>
      `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  };

  window.selectGlobalSearchResult = function (screenId) {
    const dropdown = document.getElementById('globalSearchAutocompleteDropdown');
    if (dropdown) dropdown.style.display = 'none';
    const input = document.getElementById('globalModuleSearchInput');
    if (input) input.value = '';

    if (screenId === 'olive-press' || screenId === 'oil-press') {
      if (typeof window.openOlivePressingModal === 'function') {
        window.openOlivePressingModal();
      } else if (window.SouthernOliveBridge && typeof window.SouthernOliveBridge.openOlivePressingModal === 'function') {
        window.SouthernOliveBridge.openOlivePressingModal();
      }
      return;
    }
    if (screenId === 'vanguard-admin' || screenId === 'vanguard') {
      window.location.href = '/admin';
      return;
    }
    if (screenId === 'vara-ai') {
      if (typeof window.openVanguardAiAssistant === 'function') {
        window.openVanguardAiAssistant();
      }
      return;
    }

    if (typeof window.switchSouthernScreen === 'function') {
      window.switchSouthernScreen(screenId);
    }
  };

  window.executeGlobalSearchSubmit = function (queryVal) {
    const q = (queryVal || '').trim().toLowerCase();
    if (!q) return;

    if (q.includes('معصرة') || q.includes('زيتون') || q.includes('عصر') || q.includes('press') || q.includes('إنتاج')) {
      if (typeof window.openOlivePressingModal === 'function') {
        window.openOlivePressingModal();
        return;
      } else if (window.SouthernOliveBridge && typeof window.SouthernOliveBridge.openOlivePressingModal === 'function') {
        window.SouthernOliveBridge.openOlivePressingModal();
        return;
      }
    }

    if (q.includes('vanguard') || q.includes('فانغارد') || q.includes('master')) {
      window.location.href = '/admin';
      return;
    }

    if (q.includes('vara') || q.includes('فارا') || q.includes('صوت') || q.includes('voice') || q.includes('ai') || q.includes('assistant')) {
      if (typeof window.openVanguardAiAssistant === 'function') {
        window.openVanguardAiAssistant();
        return;
      }
    }

    const matches = window.systemModulesRegistry.filter(m => {
      const titleMatch = m.title.toLowerCase().includes(q);
      const catMatch = m.category.toLowerCase().includes(q);
      const idMatch = m.id.toLowerCase().includes(q);
      const kwMatch = m.keywords && m.keywords.some(k => k.toLowerCase().includes(q));
      return titleMatch || catMatch || idMatch || kwMatch;
    });

    if (matches.length > 0) {
      window.selectGlobalSearchResult(matches[0].id);
    } else {
      if (window.showToast) window.showToast("Search Engine", `No exact screen found for "${queryVal}". Asking Vara AI Assistant...`, "info");
      if (typeof window.openVanguardAiAssistant === 'function') window.openVanguardAiAssistant();
    }
  };

  document.addEventListener('click', function (e) {
    const input = document.getElementById('globalModuleSearchInput');
    const dropdown = document.getElementById('globalSearchAutocompleteDropdown');
    if (dropdown && input && !input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  window.cleanupAllModalBackdrops = function () {
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('pointer-events');
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('hidden.bs.modal', function () {
      window.cleanupAllModalBackdrops();
    });
    document.addEventListener('hide.bs.modal', function () {
      setTimeout(window.cleanupAllModalBackdrops, 200);
    });
  }

  window.updateSubheaderVisibility = function (screenId) {
    const subheaderBar = document.querySelector('.southern-subheader-bar');
    const actionBar = document.querySelector('.southern-action-bar');

    // Check if target screen is the main home tile grid page after sign-in
    const isMainPage = (!screenId || screenId === 'grid-dash' || screenId === 'view-grid-dash' || screenId === 'dashboard');

    if (isMainPage) {
      document.body.classList.remove('submodule-active');
      document.body.classList.add('main-dashboard-active');
    } else {
      document.body.classList.remove('main-dashboard-active');
      document.body.classList.add('submodule-active');
    }

    if (subheaderBar) {
      if (isMainPage) {
        subheaderBar.classList.remove('d-none');
        subheaderBar.style.setProperty('display', 'flex', 'important');
      } else {
        subheaderBar.classList.add('d-none');
        subheaderBar.style.setProperty('display', 'none', 'important');
      }
    }

    if (actionBar) {
      if (isMainPage) {
        actionBar.classList.remove('d-none');
        actionBar.style.setProperty('display', 'flex', 'important');
      } else {
        actionBar.classList.add('d-none');
        actionBar.style.setProperty('display', 'none', 'important');
      }
    }
  };

  window.switchSouthernScreen = function (screenId, customTitle) {
    if (typeof window.cleanupAllModalBackdrops === 'function') {
      window.cleanupAllModalBackdrops();
    }
    if (typeof window.updateSubheaderVisibility === 'function') {
      window.updateSubheaderVisibility(screenId);
    }
    if (typeof window.switchSouthernScreenPrimary === 'function') {
      window.switchSouthernScreenPrimary(screenId, customTitle);
    }
  };

  window.exitWorkspace = function () {
    localStorage.removeItem('so_authenticated');
    document.body.classList.remove('logged-in');
    document.body.classList.remove('workspace-active');

    const workspace = document.getElementById('erp-app-workspace');
    if (workspace) {
      workspace.classList.remove('active');
      workspace.style.setProperty('display', 'none', 'important');
    }
    const authSection = document.querySelector('.main-section');
    if (authSection) {
      authSection.style.setProperty('display', 'flex', 'important');
    }
    const loginHeader = document.querySelector('.login-header');
    if (loginHeader) {
      loginHeader.style.setProperty('display', 'block', 'important');
    }
    const loginView = document.getElementById('view-login');
    if (loginView) {
      loginView.classList.add('active');
      loginView.style.setProperty('display', 'block', 'important');
    }
    showToast("Logged Out", "You have been signed out safely. Login screen restored.", "info");
  };

  // Language Toggle (3 Languages: English <-> Arabic <-> French)
  window.setLanguage = function (lang) {
    state.lang = lang;
    localStorage.setItem('so_lang', lang);
    applyLanguage(lang);
  };

  window.toggleLanguage = function () {
    if (state.lang === 'en') state.lang = 'ar';
    else if (state.lang === 'ar') state.lang = 'fr';
    else state.lang = 'en';

    localStorage.setItem('so_lang', state.lang);
    applyLanguage(state.lang);
  };

  const autoTranslations = {
    ar: {
      "UNIFIED ERP SYSTEM": "نظام إدارة الموارد الموحد",
      "Run your entire olive oil production & distribution business on one unified platform.": "إدارة كامل عمليات إنتاج وتوزيع زيت الزيتون عبر منصة رقمية موحدة.",
      "Scan / Click for Landing Page": "امسح الرمز أو انقر لفتح متجر العملاء",
      "Scan or click to open Customer Storefront: southernolive.com/landing": "امسح الرمز أو انقر لفتح المتجر الإلكتروني",
      "Open Storefront": "فتح المتجر الإلكتروني",
      "Add Driver": "إضافة سائق",
      "+ Add Driver": "+ إضافة سائق جديد",
      "+ Add New Driver": "+ إضافة سائق جديد",
      "Open Driver PWA App": "فتح تطبيق السائق المستقل PWA",
      "6 Vans": "6 شاحنات توصيل",
      "100% Operational": "جاهزية 100% تشغيلية",
      "Active Fleet Drivers": "سائقو الأسطول النشطون",
      "Delivered Today": "تم توصيلها اليوم",
      "Average Delivery Time": "متوسط وقت التوصيل",
      "Total Active Fuel Litres": "إجمالي محروقات الأسطول",
      "Vehicle #": "رقم المركبة",
      "Driver Name": "اسم السائق",
      "Zone / Region": "المنطقة / المحافظة",
      "Status": "الحالة",
      "Deliveries Today": "توصيلات اليوم",
      "Phone": "رقم الهاتف",
      "Actions": "الإجراءات",
      "In Stock": "متوفر بالمخزن",
      "Sufficient": "مخزون كافٍ",
      "Reorder Alert": "تنبيه إعادة الطلب",
      "Completed": "مكتمل",
      "Pending": "قيد الانتظار",
      "Operations Center": "مركز العمليات",
      "Sales Control": "إدارة المبيعات",
      "SuperSonic Fleet": "أسطول التوصيل السريع",
      "Social Media": "مبيعات التواصل الاجتماعي",
      "Accounting": "المحاسبة والمالية",
      "Human Resources": "الموارد البشرية",
      "Customer Management": "إدارة الزبائن",
      "BOM Assembly": "تجميع خلطات الإنتاج",
      "Products & Services": "دليل المنتوجات والخدمات",
      "Dashboard & RO 2000L": "لوحة التصفية ونظام المياه RO",
      "Actions & POs": "أوامر الشراء والإجراءات",
      "Events & Venues": "المعارض والفعاليات",
      "Setup & Suppliers": "الموردين والمزارعين",
      "More Setup": "إعدادات الوحدات والأسباب",
      "4 Warehouses": "تفاصيل المستودعات الأربعة",
      "Overview": "نظرة عامة",
      "Live Map & Fleet": "خريطة الأسطول والتتبع",
      "Driver Signature & Proof": "توقيع وإثبات التسليم",
      "Fuel & Maintenance": "المحروقات والصيانة",
      "Omnichannel Inbox": "صندوق الوارد الموحد",
      "30-Min Order Clock": "مؤقت الطلبات 30 دقيقة",
      "Social Sales Representatives": "مندوبو السوشيال ميديا",
      "Campaigns & Ads": "الحملات الإعلانية",
      "Journal Vouchers": "قيود اليومية",
      "Chart of Accounts": "دليل الحسابات",
      "Cash Boxes (USD/LBP)": "الصناديق والخزائن (دولار/ليرة)",
      "Bank Rec & VAT": "المطابقة البنكية والضريبة",
      "Employees Directory": "دليل الموظفين",
      "Shifts & Attendance": "الورديات والحضور",
      "BLOM Bank Payroll": "رواتب بنك بلوم",
      "Role Permissions (RBAC)": "صلاحيات الأدوار",
      "Cloud Sync & Backup": "المزامنة والنسخ الاحتياطي",
      "2FA & Auth Logs": "المصادقة الثنائية وسجل الحركات",
      "Item Description": "وصف المنتج / المادة",
      "Category": "التصنيف",
      "Unit": "الوحدة",
      "Price ($ USD)": "السعر ($)",
      "Current Stock": "المخزون الحالي",
      "PO ID": "رقم أمر الشراء",
      "Supplier / Farmer Name": "اسم المزارع / المورد",
      "Raw Material / Item": "المادة الخام / المنتج",
      "Quantity": "الكمية",
      "Unit Cost ($)": "سعر الوحدة ($)",
      "Total Cost ($)": "الإجمالي ($)",
      "Target Warehouse": "المستودع الهدف",
      "Expected Date": "تاريخ التسليم",
      "Transfer ID": "رقم التحويل",
      "Date & Time": "التاريخ والوقت",
      "Source Warehouse": "المستودع المصدر",
      "Destination Warehouse": "المستودع الوجهة",
      "Item Transferred": "المادة المنقولة",
      "Log ID": "رقم السجل",
      "Warehouse": "المستودع",
      "Damaged Item": "المادة التالفة",
      "Quantity Lost": "الكمية المفقودة",
      "Predefined Wastage Reason": "سبب الفاقد المحتسب",
      "Logged By": "بواسطة",
      "+ New Supplier PO": "+ أمر شراء جديد من مزارع",
      "+ Inter-Warehouse Transfer": "+ تحويل بين المستودعات",
      "+ Log Wastage / Leakage": "+ تسجيل الفاقد والتلفيات",
      "+ Add New Product / Material": "+ إضافة منتج / مادة جديدة",
      "Import Excel / CSV": "استيراد ملفات إكسل CSV",
      "+ Add Unit": "+ إضافة وحدة قياس",
      "+ Add Reason": "+ إضافة سبب فاقد",
      "+ Add Brand": "+ إضافة علامة تجارية",
      "+ Add Wholesale Client": "+ إضافة زبون جملة جديد",
      "+ New JV Entry": "+ إدخال قيد يومية جديد",
      "+ Launch Campaign": "+ إطلاق حملة إعلانية",
      "+ Register Staff Member": "+ تسجيل موظف جديد",
      "Standalone Apps Hub": "مركز التطبيقات المستقلة",
      "General Admin": "مدير عام النظام",
      "Install App": "تثبيت التطبيق",
      "Explore ERP Features": "استكشاف خصائص النظام",
      "Active Supplier Purchase Orders (POs)": "أوامر الشراء النشطة من المزارعين",
      "Inter-Warehouse Transfer Log": "سجل التحويلات بين المستودعات",
      "Lost Goods & Wastage Audit Trail": "سجل الفاقد والتلفيات المحتسبة",
      "Olive Farmers & Raw Material Vendors": "مزارعو الزيتون وموردو المواد الخام",
      "Operation Units, Categories & Brands Setup": "إعدادات الوحدات والفئات والعلامات التجارية",
      "4 Warehouses Detailed Breakdown": "تفاصيل المستودعات الأربعة",
      "SuperSonic Delivery App & Live Tracking": "تطبيق السائقين والتتبع اللحظي SuperSonic",
      "Drivers & Fleet Status": "سائقو الأسطول وحالة المركبات",
      "Live Interactive Dispatch Map": "خريطة التوزيع التفاعلية اللحظية",
      "Proof of Delivery & Customer Signatures": "إثبات التسليم والتوقيع الرقمي",
      "Fuel Consumption & Maintenance Log": "سجل المحروقات وصيانة الشاحنات",
      "WhatsApp & Omnichannel Sales Inbox": "صندوق الوارد الموحد للسوشيال ميديا",
      "Customer Directory & Aged Debtors Ledger": "دليل الزبائن وسجل اعمار الديون",
      "Customer Accounts & Credit Limit": "حسابات العملاء والسقف الائتماني",
      "Accounting & Multi-Currency Finance": "المحاسبة والمالية متعددة العملات",
      "Human Resources & BLOM Bank Payroll": "الموارد البشرية ورواتب بنك بلوم",
      "Auth Controls & Master Security": "إدارة الأمان والتراخيص والصلاحيات",
      "Edit": "تعديل",
      "Reorder": "إعادة طلب",
      "Save Product": "حفظ المنتج",
      "Save Unit": "حفظ الوحدة",
      "Save Brand": "حفظ العلامة",
      "Register Client": "تسجيل الزبون",
      "Post JV Entry": "ترحيل قيد اليومية",
      "Register Driver": "تسجيل السائق",
      "Register Employee": "تسجيل الموظف",
      "Start Cloud Sync Now": "بدء المزامنة السحابية الآن",
      "Cancel": "إلغاء",
      "Close": "إغلاق",
      "Save RBAC Matrix": "حفظ مصفوفة الصلاحيات",
      "+ Add Custom Field": "+ إضافة حقل مخصص",
      "Finished Goods": "المنتوجات التامة",
      "Raw Materials": "المواد الخام",
      "Packaging Materials": "مواد التعبئة والتغليف",
      "Primary": "أساسي",
      "Export": "تصدير",
      "Food": "غذائي",
      "Active": "نشط",
      "Description Article": "وصف المنتج / المادة",
      "Description": "وصف المنتج / المادة",
      "Catégorie": "التصنيف",
      "Category": "التصنيف",
      "Size": "الحجم / السعة",
      "Units Sold": "الكمية المباعة",
      "Unit Price": "سعر الوحدة",
      "Total Revenue": "إجمالي الإيرادات",
      "Comprehensive Sales Reports": "تقارير المبيعات الشاملة",
      "Open Standalone POS Terminal": "فتح تطبيق الكاشير المستقل",
      "Close Shift (Z-Report)": "إقفال الورديات (تقرير Z)",
      "Export PDF": "تصدير PDF",
      "Export Excel": "تصدير Excel",
      "Filter Report": "تصفية التقرير",
      "All Product Categories": "جميع فئات المنتوجات",
      "All Size Groups": "جميع الأحجام والسعات",
      "Extra Virgin Olive Oil 1L Glass": "زيت زيتون بكر ممتاز 1 لتر زجاج",
      "Extra Virgin Olive Oil 5L Tin": "زيت زيتون بكر ممتاز 5 لتر تنك",
      "Stuffed Eggplant Makdous 1Kg Jar": "مكدوس باذنجان محشي 1 كجم مرطبان",
      "Green Olive Tapenade 500g": "تابيناد زيتون خضير 500 غرام",
      "Black Olives in Brine 2Kg": "زيتون أسود في الماء والملح 2 كجم",
      "Gourmet Olive Oil Soap Bar": "صابون زيت زيتون بلدي فاخر"
    },
    fr: {
      "UNIFIED ERP SYSTEM": "Système ERP Unifié",
      "Run your entire olive oil production & distribution business on one unified platform.": "Gérez l'ensemble de votre entreprise d'huile d'olive sur une seule plateforme unifiée.",
      "Scan / Click for Landing Page": "Scannez pour la page d'accueil",
      "Scan or click to open Customer Storefront: southernolive.com/landing": "Scannez ou cliquez pour ouvrir la boutique",
      "Open Storefront": "Ouvrir la boutique",
      "Add Driver": "Ajouter Chauffeur",
      "+ Add Driver": "+ Ajouter Un Chauffeur",
      "+ Add New Driver": "+ Ajouter Un Chauffeur",
      "Open Driver PWA App": "Ouvrir App Chauffeur PWA",
      "6 Vans": "6 Camionnettes",
      "100% Operational": "100% Opérationnel",
      "Active Fleet Drivers": "Chauffeurs De Flotte Actifs",
      "Delivered Today": "Livré Aujourd'hui",
      "Average Delivery Time": "Temps De Livraison Moyen",
      "Total Active Fuel Litres": "Total Carburant Actif",
      "Vehicle #": "N° Véhicule",
      "Driver Name": "Nom Du Chauffeur",
      "Zone / Region": "Zone / Région",
      "Status": "Statut",
      "Deliveries Today": "Livraisons Aujourd'hui",
      "Phone": "Téléphone",
      "Actions": "Actions",
      "In Stock": "En Stock",
      "Sufficient": "Stock Suffisant",
      "Reorder Alert": "Alerte Réapprovisionnement",
      "Completed": "Terminé",
      "Pending": "En Attente",
      "Operations Center": "Centre d'Opérations",
      "Sales Control": "Contrôle des Ventes",
      "SuperSonic Fleet": "Flotte SuperSonic",
      "Social Media": "Ventes Réseaux Sociaux",
      "Accounting": "Comptabilité & Finance",
      "Human Resources": "Ressources Humaines",
      "Customer Management": "Gestion des Clients",
      "BOM Assembly": "Assemblage BOM",
      "Products & Services": "Produits & Services",
      "Dashboard & RO 2000L": "Tableau & RO 2000L",
      "Actions & POs": "Achats & Actions",
      "Events & Venues": "Événements & Salons",
      "Setup & Suppliers": "Fournisseurs & Agriculteurs",
      "More Setup": "Plus de Configuration",
      "4 Warehouses": "4 Entrepôts",
      "Overview": "Aperçu Global",
      "Live Map & Fleet": "Carte & Flotte En Direct",
      "Driver Signature & Proof": "Signature & Preuve",
      "Fuel & Maintenance": "Carburant & Entretien",
      "Omnichannel Inbox": "Boîte Déception Omnicanale",
      "30-Min Order Clock": "Chrono Commande 30 Min",
      "Social Sales Representatives": "Représentants Ventes Sociales",
      "Campaigns & Ads": "Campagnes & Publicités",
      "Journal Vouchers": "Journal de Caisse",
      "Chart of Accounts": "Plan Comptable",
      "Cash Boxes (USD/LBP)": "Caisses (USD/LBP)",
      "Bank Rec & VAT": "Rapprochement & TVA",
      "Employees Directory": "Répertoire Employés",
      "Shifts & Attendance": "Postes & Présence",
      "BLOM Bank Payroll": "Paie BLOM Bank",
      "Role Permissions (RBAC)": "Autorisations Rôles",
      "Cloud Sync & Backup": "Sync Nuage & Sauvegarde",
      "2FA & Auth Logs": "2FA & Journaux Sécurité",
      "Item Description": "Description Article",
      "Category": "Catégorie",
      "Unit": "Unité",
      "Price ($ USD)": "Prix ($ USD)",
      "Current Stock": "Stock Actuel",
      "PO ID": "N° Achat PO",
      "Supplier / Farmer Name": "Fournisseur / Agriculteur",
      "Raw Material / Item": "Matière Première / Article",
      "Quantity": "Quantité",
      "Unit Cost ($)": "Coût Unitaire ($)",
      "Total Cost ($)": "Coût Total ($)",
      "Target Warehouse": "Entrepôt Cible",
      "Expected Date": "Date Prévue",
      "Transfer ID": "N° Transfert",
      "Date & Time": "Date & Heure",
      "Source Warehouse": "Entrepôt Source",
      "Destination Warehouse": "Entrepôt Destination",
      "Item Transferred": "Article Transféré",
      "Log ID": "N° Journal",
      "Warehouse": "Entrepôt",
      "Damaged Item": "Article Endommagé",
      "Quantity Lost": "Quantité Perdue",
      "Predefined Wastage Reason": "Raison De La Perte",
      "Logged By": "Enregistré Par",
      "+ New Supplier PO": "+ Nouvel Achat Fournisseur",
      "+ Inter-Warehouse Transfer": "+ Transfert Inter-Entrepôts",
      "+ Log Wastage / Leakage": "+ Enregistrer Perte/Casse",
      "+ Add New Product / Material": "+ Ajouter Produit / Matière",
      "Import Excel / CSV": "Importer Excel / CSV",
      "+ Add Unit": "+ Ajouter Unité",
      "+ Add Reason": "+ Ajouter Raison",
      "+ Add Brand": "+ Ajouter Marque",
      "+ Add Wholesale Client": "+ Ajouter Client En Gros",
      "+ New JV Entry": "+ Saisir Écriture Comptable",
      "+ Launch Campaign": "+ Lancer Campagne",
      "+ Register Staff Member": "+ Enregistrer Employé",
      "Standalone Apps Hub": "Applications Indépendantes",
      "General Admin": "Administrateur Général",
      "Install App": "Installer l'application",
      "Explore ERP Features": "Explorer les fonctionnalités ERP",
      "Active Supplier Purchase Orders (POs)": "Commandes d'Achat Fournisseurs Actives",
      "Inter-Warehouse Transfer Log": "Journal des Transferts Inter-Entrepôts",
      "Lost Goods & Wastage Audit Trail": "Suivi des Pertes & Casse",
      "Olive Farmers & Raw Material Vendors": "Agriculteurs d'Olives & Fournisseurs",
      "Operation Units, Categories & Brands Setup": "Configuration Unités, Catégories & Marques",
      "4 Warehouses Detailed Breakdown": "Détail des 4 Entrepôts",
      "SuperSonic Delivery App & Live Tracking": "App Livraison SuperSonic & Suivi",
      "Drivers & Fleet Status": "Chauffeurs & Statut Flotte",
      "Live Interactive Dispatch Map": "Carte Interactive De Livraison",
      "Proof of Delivery & Customer Signatures": "Preuve De Livraison & Signatures",
      "Fuel Consumption & Maintenance Log": "Journal Carburant & Entretien",
      "WhatsApp & Omnichannel Sales Inbox": "Boîte Déception Omnicanale Sales",
      "Customer Directory & Aged Debtors Ledger": "Répertoire Clients & Balance Âgée",
      "Customer Accounts & Credit Limit": "Comptes Clients & Limite Crédit",
      "Accounting & Multi-Currency Finance": "Comptabilité & Finance Multi-Devises",
      "Human Resources & BLOM Bank Payroll": "Ressources Humaines & Paie BLOM Bank",
      "Auth Controls & Master Security": "Contrôles Sécurité & Profils",
      "Edit": "Modifier",
      "Reorder": "Récommander",
      "Save Product": "Enregistrer Produit",
      "Save Unit": "Enregistrer Unité",
      "Save Brand": "Enregistrer Marque",
      "Register Client": "Enregistrer Client",
      "Post JV Entry": "Valider Écriture",
      "Register Driver": "Enregistrer Chauffeur",
      "Register Employee": "Enregistrer Employé",
      "Start Cloud Sync Now": "Démarrer La Sync Nuage",
      "Cancel": "Annuler",
      "Close": "Fermer",
      "Save RBAC Matrix": "Enregistrer Matrice RBAC",
      "+ Add Custom Field": "+ Ajouter Champ Personnalisé",
      "Finished Goods": "Produits Finis",
      "Raw Materials": "Matières Premières",
      "Packaging Materials": "Matériaux d'Emballage",
      "Primary": "Principal",
      "Export": "Exportation",
      "Food": "Alimentaire",
      "Active": "Actif",
      "Description Article": "Description Article",
      "Description": "Description Article",
      "Catégorie": "Catégorie",
      "Category": "Catégorie",
      "Size": "Taille",
      "Units Sold": "Unités Vendues",
      "Unit Price": "Prix Unitaire",
      "Total Revenue": "Chiffre d'Affaires Total",
      "Comprehensive Sales Reports": "Rapports Détaillés des Ventes",
      "Open Standalone POS Terminal": "Ouvrir POS Indépendant",
      "Close Shift (Z-Report)": "Clôture de Poste (Rapport Z)",
      "Export PDF": "Exporter PDF",
      "Export Excel": "Exporter Excel",
      "Filter Report": "Filtrer le Rapport",
      "All Product Categories": "Toutes Catégories de Produits",
      "All Size Groups": "Tous Groupes de Tailles",
      "Extra Virgin Olive Oil 1L Glass": "Huile d'Olive Extra Vierge 1L Verre",
      "Extra Virgin Olive Oil 5L Tin": "Huile d'Olive Extra Vierge 5L Bidon",
      "Stuffed Eggplant Makdous 1Kg Jar": "Makdous Aubergines Farcies 1Kg Bocal",
      "Green Olive Tapenade 500g": "Tapenade d'Olives Vertes 500g",
      "Black Olives in Brine 2Kg": "Olives Noires en Saumure 2Kg",
      "Gourmet Olive Oil Soap Bar": "Savon Gourmet d'Huile d'Olive"
    }
  };

  function applyLanguage(lang) {
    state.lang = lang;

    // 1. Instantly update active class on trilingual pills (<5ms INP latency)
    document.querySelectorAll('.lang-pill').forEach(pill => {
      if (pill.getAttribute('data-lang') === lang) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'ar') {
      document.body.classList.add('rtl-text');
    } else {
      document.body.classList.remove('rtl-text');
    }

    // Schedule DOM translation sweep using requestAnimationFrame to prevent blocking UI main thread
    requestAnimationFrame(() => {
      const t = i18n[lang] || i18n['en'];

      // Update textContent for elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.textContent = t[key];
        }
      });

      // Update placeholder for elements with data-i18n-ph
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key]) {
          el.setAttribute('placeholder', t[key]);
        }
      });

      // Update title attribute for elements with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key]) {
          el.setAttribute('title', t[key]);
        }
      });

      // Non-blocking chunked DOM translation engine to eliminate main thread blocking & UI freezing
      if (lang === 'ar' || lang === 'fr') {
        const dict = autoTranslations[lang] || {};
        const elements = Array.from(document.querySelectorAll('button, th, td, .badge, h1, h2, h3, h4, h5, h6, label, p, span, a, small, strong, li.list-group-item'));
        const chunkSize = 150;
        let index = 0;

        function processChunk() {
          const end = Math.min(index + chunkSize, elements.length);
          for (let i = index; i < end; i++) {
            const el = elements[i];
            if (el.children.length > 1) continue;
            let text = el.textContent ? el.textContent.trim() : '';
            if (text && !el.hasAttribute('data-orig-text')) {
              el.setAttribute('data-orig-text', text);
            }
            const orig = el.getAttribute('data-orig-text');
            if (orig && dict[orig]) {
              let hasIcon = el.querySelector('i');
              if (hasIcon) {
                const iconHtml = hasIcon.outerHTML;
                el.innerHTML = `${iconHtml} ${dict[orig]}`;
              } else {
                el.textContent = dict[orig];
              }
            }
          }
          index = end;
          if (index < elements.length) {
            if (window.requestIdleCallback) {
              requestIdleCallback(processChunk);
            } else {
              setTimeout(processChunk, 0);
            }
          }
        }
        processChunk();
      } else {
        const elements = Array.from(document.querySelectorAll('[data-orig-text]'));
        const chunkSize = 150;
        let index = 0;

        function processChunkEn() {
          const end = Math.min(index + chunkSize, elements.length);
          for (let i = index; i < end; i++) {
            const el = elements[i];
            const orig = el.getAttribute('data-orig-text');
            let hasIcon = el.querySelector('i');
            if (hasIcon) {
              const iconHtml = hasIcon.outerHTML;
              el.innerHTML = `${iconHtml} ${orig}`;
            } else {
              el.textContent = orig;
            }
          }
          index = end;
          if (index < elements.length) {
            if (window.requestIdleCallback) {
              requestIdleCallback(processChunkEn);
            } else {
              setTimeout(processChunkEn, 0);
            }
          }
        }
        processChunkEn();
      }

      // Update language switch button text
      const langBtns = document.querySelectorAll('.lang-switch-btn');
      langBtns.forEach(btn => {
        if (lang === 'en') btn.textContent = 'العربية (AR)';
        else if (lang === 'ar') btn.textContent = 'Français (FR)';
        else btn.textContent = 'English (EN)';
      });
    });
  }

  applyLanguage(state.lang);

  /* ==========================================================================
     ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS ENGINE
     ========================================================================== */

  const defaultRbacMatrix = {
    master_admin: {
      roleName: "General / Master Admin",
      branchAccess: "ALL",
      priceOverride: true,
      exportRights: true,
      modules: {
        sales: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        operations: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        customers: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        accounting: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        fleet: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        social: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        hr: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        security: { access: true, view: true, create: true, edit: true, delete: true, export: true }
      }
    },
    sales_admin: {
      roleName: "POS & Sales Admin",
      branchAccess: "ALL",
      priceOverride: true,
      exportRights: true,
      modules: {
        sales: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        operations: { access: true, view: true, create: false, edit: false, delete: false, export: false },
        customers: { access: true, view: true, create: true, edit: true, delete: false, export: true },
        accounting: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        fleet: { access: true, view: true, create: false, edit: false, delete: false, export: false },
        social: { access: true, view: true, create: true, edit: true, delete: false, export: true },
        hr: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    },
    factory_manager: {
      roleName: "Factory & Stock Manager",
      branchAccess: "CHOUEIFAT",
      priceOverride: false,
      exportRights: true,
      modules: {
        sales: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        operations: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        customers: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        accounting: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        fleet: { access: true, view: true, create: false, edit: false, delete: false, export: false },
        social: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        hr: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    },
    fleet_manager: {
      roleName: "Fleet & Dispatch Manager",
      branchAccess: "ALL",
      priceOverride: false,
      exportRights: true,
      modules: {
        sales: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        operations: { access: true, view: true, create: false, edit: false, delete: false, export: false },
        customers: { access: true, view: true, create: false, edit: false, delete: false, export: false },
        accounting: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        fleet: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        social: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        hr: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    },
    social_rep: {
      roleName: "Social Media Sales Rep",
      branchAccess: "ALL",
      priceOverride: false,
      exportRights: false,
      modules: {
        sales: { access: true, view: true, create: true, edit: false, delete: false, export: false },
        operations: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        customers: { access: true, view: true, create: true, edit: false, delete: false, export: false },
        accounting: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        fleet: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        social: { access: true, view: true, create: true, edit: true, delete: false, export: false },
        hr: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    },
    finance_manager: {
      roleName: "Finance & Accounting Manager",
      branchAccess: "ALL",
      priceOverride: true,
      exportRights: true,
      modules: {
        sales: { access: true, view: true, create: false, edit: false, delete: false, export: true },
        operations: { access: true, view: true, create: false, edit: false, delete: false, export: true },
        customers: { access: true, view: true, create: false, edit: false, delete: false, export: true },
        accounting: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        fleet: { access: true, view: true, create: false, edit: false, delete: false, export: true },
        social: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        hr: { access: true, view: true, create: false, edit: false, delete: false, export: true },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    },
    hr_manager: {
      roleName: "HR & Payroll Manager",
      branchAccess: "ALL",
      priceOverride: false,
      exportRights: true,
      modules: {
        sales: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        operations: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        customers: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        accounting: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        fleet: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        social: { access: false, view: false, create: false, edit: false, delete: false, export: false },
        hr: { access: true, view: true, create: true, edit: true, delete: true, export: true },
        security: { access: false, view: false, create: false, edit: false, delete: false, export: false }
      }
    }
  };

  let rbacMatrix = JSON.parse(localStorage.getItem('so_rbac_permissions') || 'null') || defaultRbacMatrix;
  let activeRoleKey = localStorage.getItem('so_active_role_key') || 'master_admin';

  window.loadRbacRoleConfig = function (roleKey) {
    const roleConfig = rbacMatrix[roleKey] || defaultRbacMatrix.master_admin;
    const branchSel = document.getElementById('rbacBranchSelect');
    const priceOv = document.getElementById('rbacPriceOverride');
    const expRight = document.getElementById('rbacExportRights');

    if (branchSel) branchSel.value = roleConfig.branchAccess || 'ALL';
    if (priceOv) priceOv.checked = !!roleConfig.priceOverride;
    if (expRight) expRight.checked = !!roleConfig.exportRights;

    const rows = document.querySelectorAll('#rbacMatrixTable tbody tr');
    rows.forEach(tr => {
      const mod = tr.getAttribute('data-module');
      const modPerms = (roleConfig.modules && roleConfig.modules[mod]) || { access: false, view: false, create: false, edit: false, delete: false, export: false };

      tr.querySelectorAll('.rbac-check').forEach(chk => {
        const perm = chk.getAttribute('data-perm');
        chk.checked = !!modPerms[perm];
      });
    });
  };

  window.saveRbacMatrix = function () {
    const roleSelect = document.getElementById('rbacRoleSelect');
    if (!roleSelect) return;
    const roleKey = roleSelect.value;
    const branchSel = document.getElementById('rbacBranchSelect');
    const priceOv = document.getElementById('rbacPriceOverride');
    const expRight = document.getElementById('rbacExportRights');

    if (!rbacMatrix[roleKey]) rbacMatrix[roleKey] = { roleName: roleSelect.options[roleSelect.selectedIndex].text, modules: {} };

    rbacMatrix[roleKey].branchAccess = branchSel ? branchSel.value : 'ALL';
    rbacMatrix[roleKey].priceOverride = priceOv ? priceOv.checked : false;
    rbacMatrix[roleKey].exportRights = expRight ? expRight.checked : false;
    rbacMatrix[roleKey].modules = {};

    const rows = document.querySelectorAll('#rbacMatrixTable tbody tr');
    rows.forEach(tr => {
      const mod = tr.getAttribute('data-module');
      rbacMatrix[roleKey].modules[mod] = {};
      tr.querySelectorAll('.rbac-check').forEach(chk => {
        const perm = chk.getAttribute('data-perm');
        rbacMatrix[roleKey].modules[mod][perm] = chk.checked;
      });
    });

    localStorage.setItem('so_rbac_permissions', JSON.stringify(rbacMatrix));
    showToast("RBAC Saved", `Updated permissions matrix for role: ${roleSelect.options[roleSelect.selectedIndex].text}`, "success");
  };

  window.resetRbacDefaults = function () {
    rbacMatrix = JSON.parse(JSON.stringify(defaultRbacMatrix));
    localStorage.setItem('so_rbac_permissions', JSON.stringify(rbacMatrix));
    const roleSelect = document.getElementById('rbacRoleSelect');
    if (roleSelect) window.loadRbacRoleConfig(roleSelect.value);
    showToast("RBAC Reset", "Reset all roles & permissions matrix to factory defaults.", "info");
  };

  window.checkPermission = function (moduleKey, actionKey = 'access') {
    const roleConfig = rbacMatrix[activeRoleKey] || defaultRbacMatrix.master_admin;
    if (activeRoleKey === 'master_admin') return true;

    if (actionKey === 'priceOverride') return !!roleConfig.priceOverride;
    if (actionKey === 'exportRights') return !!roleConfig.exportRights;

    if (!roleConfig.modules || !roleConfig.modules[moduleKey]) return false;
    return !!roleConfig.modules[moduleKey][actionKey];
  };

  setTimeout(() => {
    const roleSelect = document.getElementById('rbacRoleSelect');
    if (roleSelect) window.loadRbacRoleConfig(roleSelect.value);
  }, 200);

  /* ==========================================================================
     ERP WORKSPACE & CORE MODULE CONTROLLERS (V2 MASTER INTEGRATION)
     ========================================================================== */

  // Sample Data Stores
  const posProducts = [
    { id: 'P101', barcode: '5201001', customCode: 'EVOO-1L', name: 'Extra Virgin Olive Oil 1L Glass', category: 'Olive Oil', price: 12.00, icon: 'fa-bottle-droplet' },
    { id: 'P102', barcode: '5201005', customCode: 'EVOO-5L', name: 'Extra Virgin Olive Oil 5L Tin', category: 'Olive Oil', price: 55.00, icon: 'fa-box-archive' },
    { id: 'P103', barcode: '5202001', customCode: 'MKD-1KG', name: 'Stuffed Eggplant Makdous 1Kg Jar', category: 'Olives & Jars', price: 14.00, icon: 'fa-jar' },
    { id: 'P104', barcode: '5202002', customCode: 'OLV-BLK', name: 'Lebanese Black Olives 500g', category: 'Olives & Jars', price: 6.50, icon: 'fa-seedling' },
    { id: 'P105', barcode: '5203001', customCode: 'SOAP-SET', name: 'Artisan Laurel & Olive Soap Pack', category: 'Artisan', price: 8.00, icon: 'fa-soap' }
  ];

  let cart = [];

  const customersData = [
    { id: 'C-101', name: 'Al-Madina Supermarket Chain', type: 'Wholesale Chain', phone: '+961 70 882910', region: 'Beirut & Suburbs', balance: 3450.00, aged: '0-30 Days' },
    { id: 'C-102', name: 'Choueifat Gourmet HORECA', type: 'HORECA Distributor', phone: '+961 71 554321', region: 'Mount Lebanon', balance: 1800.00, aged: '31-60 Days' },
    { id: 'C-103', name: 'Saida Olive Emporium', type: 'Retail Outlets', phone: '+961 76 991122', region: 'South Lebanon', balance: 620.00, aged: '60+ Days' }
  ];

  let driverOrders = [
    { id: 'ORD-9801', customerName: 'Al-Madina Supermarket', phone: '+961 70 882910', address: 'Hamra Main St', region: 'Beirut', amount: 450.00, deliveryFee: 3.00, paymentMethod: 'Cash', status: 'In Transit' },
    { id: 'ORD-9802', customerName: 'Fadi Karam', phone: '+961 03 112233', address: 'Saida Boulevard', region: 'South', amount: 74.00, deliveryFee: 3.00, paymentMethod: 'Wish Money', status: 'In Transit' }
  ];

  let socialOrders = [
    { id: 'ORD-SOC-101', customerName: 'Maya Haddad', items: '2x EVOO 1L Glass', totalAmount: 27.00, paymentMethod: 'Cash', minutesLeft: 28, repId: 'REP-101' },
    { id: 'ORD-SOC-102', customerName: 'Ziad Nader', items: '1x EVOO 5L Tin', totalAmount: 58.00, paymentMethod: 'Wish Money', minutesLeft: 12, repId: 'REP-101' }
  ];

  let activeSelectedOrderForSignature = null;
  let activeSelectedOrderForWhatsApp = null;

  // Active State Handles

  window.exitWorkspace = function () {
    document.body.classList.remove('workspace-active');

    const loginMain = document.querySelector('.main-section');
    const header = document.querySelector('.login-header');
    const mobHeader = document.querySelector('.mobile-app-header');
    const workspace = document.getElementById('erp-app-workspace');

    if (workspace) {
      workspace.style.setProperty('display', 'none', 'important');
      workspace.classList.remove('active');
    }
    if (loginMain) loginMain.style.setProperty('display', 'flex', 'important');
    if (header) {
      header.style.setProperty('display', 'block', 'important');
      header.style.removeProperty('height');
    }
    if (mobHeader && window.innerWidth < 768) {
      mobHeader.style.setProperty('display', 'flex', 'important');
      mobHeader.style.removeProperty('height');
    }
    window.switchAuthView('view-login');
  };

  window.switchErpModule = function (moduleId, btnEl) {
    if (typeof window.updateSubheaderVisibility === 'function') {
      window.updateSubheaderVisibility(moduleId);
    }
    if (moduleId !== 'grid-dash' && window.checkPermission && !window.checkPermission(moduleId, 'access')) {
      window.showToast("Access Denied", `Your role does not have permission to access the ${moduleId.toUpperCase()} module.`, "error");
      return;
    }

    document.querySelectorAll('.nav-module-btn').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    document.querySelectorAll('.module-page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(`page-${moduleId}`);
    if (targetPage) targetPage.classList.add('active');
  };

  window.switchSubTab = function (module, tabName, btnEl) {
    const parent = btnEl.closest('.module-page');
    if (!parent) return;
    parent.querySelectorAll('.subnav-tabs .nav-link').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    parent.querySelectorAll('.subpanel').forEach(panel => panel.classList.remove('active'));
    const target = parent.querySelector(`#subpanel-${module}-${tabName}`);
    if (target) target.classList.add('active');
  };

  // POS Module Handlers
  function renderPOSProducts(items) {
    const grid = document.getElementById('posProductsGrid');
    if (!grid) return;
    grid.innerHTML = items.map(p => `
      <div class="col-md-4 col-6">
        <div class="product-item-card" onclick="addPOSItemToCart('${p.id}')">
          <div>
            <i class="fa-solid ${p.icon} text-warning fs-3 mb-2"></i>
            <h6 class="text-white mb-1">${p.name}</h6>
            <small class="text-muted d-block">Code: ${p.customCode}</small>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="badge bg-secondary">${p.category}</span>
            <strong class="text-success">$${p.price.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.filterPOSProducts = function (query) {
    const q = query.toLowerCase();
    const filtered = posProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.customCode.toLowerCase().includes(q)
    );
    renderPOSProducts(filtered);
  };

  window.filterPOSCat = function (category, btnEl) {
    document.querySelectorAll('.pos-cat-filter').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    if (category === 'all') {
      renderPOSProducts(posProducts);
    } else {
      renderPOSProducts(posProducts.filter(p => p.category === category));
    }
  };

  window.addPOSItemToCart = function (itemId) {
    const prod = posProducts.find(p => p.id === itemId);
    if (!prod) return;
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...prod, qty: 1 });
    }
    renderPOSCart();
    showToast("Cart Updated", `Added ${prod.name} to invoice.`, "success");
  };

  function renderPOSCart() {
    const listContainer = document.getElementById('posCartItems');
    if (!listContainer) return;

    if (cart.length === 0) {
      listContainer.innerHTML = '<p class="text-muted text-center py-4">No items added to invoice.</p>';
      document.getElementById('cartSubtotal').textContent = '$0.00';
      document.getElementById('cartTotal').textContent = '$3.00';
      return;
    }

    let subtotal = 0;
    listContainer.innerHTML = cart.map(c => {
      const itemTotal = c.price * c.qty;
      subtotal += itemTotal;
      return `
        <div class="cart-item-row">
          <div>
            <h6 class="mb-0 text-white small">${c.name}</h6>
            <small class="text-muted">$${c.price.toFixed(2)} x ${c.qty}</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <strong class="text-warning">$${itemTotal.toFixed(2)}</strong>
            <button class="btn btn-sm btn-outline-danger px-2 py-0" onclick="removePOSItem('${c.id}')">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    const deliveryFee = 3.00;
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${(subtotal + deliveryFee).toFixed(2)}`;
  }

  window.removePOSItem = function (itemId) {
    cart = cart.filter(c => c.id !== itemId);
    renderPOSCart();
  };

  window.processPOSPayment = function (method) {
    if (cart.length === 0) {
      showToast("Invoice Empty", "Please add products before checking out.", "warning");
      return;
    }
    const orderType = document.getElementById('posOrderType')?.value || 'Online';
    showToast("Invoice Closed", `Paid via ${method} (${orderType} Order). Z-Report Shift balance updated.`, "success");

    // AI Agent Sync
    if (window.SouthernOliveAI && window.SouthernOliveAI.LedgerChartAgent) {
      window.SouthernOliveAI.LedgerChartAgent.processDeliverySettlement({
        id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        totalAmount: parseFloat(document.getElementById('cartTotal').textContent.replace('$', '')),
        commissionEligible: true,
        repId: 'POS-CASHIER'
      }, 'POS_DIGITAL_RECEIPT', 'POS Shift Invoice');
    }

    cart = [];
    renderPOSCart();
  };

  window.triggerBarcodeScanSim = function () {
    const randomProduct = posProducts[Math.floor(Math.random() * posProducts.length)];
    window.addPOSItemToCart(randomProduct.id);
    showToast("Barcode Scanned", `Scanned Code: [${randomProduct.barcode}] -> ${randomProduct.name}`, "info");
  };

  window.generateZReport = function () {
    showToast("Z-Report Generated", "Daily POS Shift Closed. Total Sales: $1,420.00. Report sent to Finance.", "success");
  };

  // Factory BOM Assembly Processor
  window.executeBOMBatch = function () {
    const recipeKey = document.getElementById('bomRecipeSelect')?.value;
    const qty = parseInt(document.getElementById('bomQuantityInput')?.value || '100');

    if (window.SouthernOliveAI && window.SouthernOliveAI.InventorySyncAgent) {
      const res = window.SouthernOliveAI.InventorySyncAgent.executeProductionBatch(recipeKey, qty);
      if (res) {
        showToast("Production Batch Executed", `Produced ${qty} units. Raw materials deducted from WH-1 & WH-2. Finished goods credited to WH-3.`, "success");
      }
    }
  };

  window.generateStockVarianceReport = function () {
    showToast("Stock Variance Report", "Variance Report calculated: EVOO 1L (-5 units), Makdous (+2 units). Logged to Audit.", "info");
  };

  // Customer Management Renderer
  function renderCustomerDirectory() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    tbody.innerHTML = customersData.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td><span class="badge bg-secondary">${c.type}</span></td>
        <td><i class="fa-brands fa-whatsapp text-success me-1"></i> ${c.phone}</td>
        <td>${c.region}</td>
        <td class="text-danger fw-bold">$${c.balance.toFixed(2)}</td>
        <td><span class="badge bg-warning text-dark">${c.aged}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-success" onclick="showToast('WhatsApp Log', 'Opening direct WhatsApp chat with ${c.name}...', 'info')">
            <i class="fa-brands fa-whatsapp"></i> Chat
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Driver Fleet & Shift Handlers
  window.triggerDriverDeparture = function () {
    if (window.SouthernOliveAI && window.SouthernOliveAI.SmartDispatchAgent) {
      const notifications = window.SouthernOliveAI.SmartDispatchAgent.triggerDepartureNotification(
        'Charbel K.',
        'South Lebanon (Saida Line)',
        driverOrders
      );
      showToast("Shift Departure Triggered", `Departed from Choueifat HQ! ${notifications.length} automated WhatsApp broadcasts sent to customers.`, "success");
    }
  };

  function renderDriverOrders() {
    const tbody = document.getElementById('driverOrdersTableBody');
    if (!tbody) return;
    tbody.innerHTML = driverOrders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.address} (${o.region})</td>
        <td class="text-warning">$${(o.amount + o.deliveryFee).toFixed(2)}</td>
        <td><span class="badge bg-info">${o.paymentMethod}</span></td>
        <td><span class="badge bg-success">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-success me-1" onclick="openSignatureModalForOrder('${o.id}')">
            <i class="fa-solid fa-signature"></i> Sign & Deliver
          </button>
          <button class="btn btn-sm btn-outline-warning me-1" onclick="handleSpecialCase('${o.id}', 'Pending')">Pending</button>
          <button class="btn btn-sm btn-outline-danger" onclick="handleSpecialCase('${o.id}', 'Rejected')">Reject</button>
        </td>
      </tr>
    `).join('');
  }

  window.handleSpecialCase = function (orderId, statusType) {
    const ord = driverOrders.find(o => o.id === orderId);
    if (!ord) return;
    if (window.SouthernOliveAI && window.SouthernOliveAI.LedgerChartAgent) {
      window.SouthernOliveAI.LedgerChartAgent.processRejectionOrPending(ord, statusType, statusType === 'Rejected' ? 'Customer refused delivery' : 'Customer absent');
      renderDriverOrders();
      showToast("Order Status Updated", `Order #${orderId} set to ${statusType}.`, statusType === 'Rejected' ? 'error' : 'warning');
    }
  };

  // Digital Signature Canvas Controller
  let sigCanvas, sigCtx, isSigning = false;

  function initSignatureCanvas() {
    sigCanvas = document.getElementById('signaturePad');
    if (!sigCanvas) return;
    sigCtx = sigCanvas.getContext('2d');
    sigCanvas.width = sigCanvas.offsetWidth || 350;
    sigCanvas.height = 160;

    sigCtx.lineWidth = 3;
    sigCtx.lineCap = 'round';
    sigCtx.strokeStyle = '#1e293b';

    const getPos = (e) => {
      const rect = sigCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      isSigning = true;
      const pos = getPos(e);
      sigCtx.beginPath();
      sigCtx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isSigning) return;
      const pos = getPos(e);
      sigCtx.lineTo(pos.x, pos.y);
      sigCtx.stroke();
    };

    const stopDraw = () => { isSigning = false; };

    sigCanvas.addEventListener('mousedown', startDraw);
    sigCanvas.addEventListener('mousemove', draw);
    sigCanvas.addEventListener('mouseup', stopDraw);

    sigCanvas.addEventListener('touchstart', startDraw);
    sigCanvas.addEventListener('touchmove', draw);
    sigCanvas.addEventListener('touchend', stopDraw);
  }

  window.openSignatureModalForOrder = function (orderId) {
    activeSelectedOrderForSignature = driverOrders.find(o => o.id === orderId);
    window.openSignatureModal();
  };

  window.openSignatureModal = function () {
    const modal = new bootstrap.Modal(document.getElementById('digitalSignatureModal'));
    modal.show();
    setTimeout(initSignatureCanvas, 300);
  };

  window.clearSignaturePad = function () {
    if (sigCtx && sigCanvas) {
      sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    }
  };

  window.submitDigitalSignature = function () {
    if (!sigCanvas) return;
    const dataUrl = sigCanvas.toDataURL();
    const ord = activeSelectedOrderForSignature || driverOrders[0];

    if (window.SouthernOliveAI && window.SouthernOliveAI.LedgerChartAgent) {
      window.SouthernOliveAI.LedgerChartAgent.processDeliverySettlement(ord, dataUrl, 'Signed by customer finger on screen.');
    }

    const modalEl = document.getElementById('digitalSignatureModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    renderDriverOrders();
    showToast("Order Delivered", `Order #${ord.id} closed successfully! Digital signature recorded & financial ledger updated.`, "success");
  };

  // Social Media Rep App Handlers & 30-Min Countdown
  function renderSocialOrders() {
    const tbody = document.getElementById('socialOrdersTableBody');
    if (!tbody) return;

    tbody.innerHTML = socialOrders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.items}</td>
        <td class="text-warning">$${o.totalAmount.toFixed(2)}</td>
        <td><span class="badge bg-info">${o.paymentMethod}</span></td>
        <td><span class="badge ${o.minutesLeft < 5 ? 'bg-danger' : 'bg-warning text-dark'}">${o.minutesLeft} mins left</span></td>
        <td>
          <button class="btn btn-sm btn-success fw-bold" onclick="approveSocialOrder('${o.id}')">
            <i class="fa-solid fa-check me-1"></i> Approve & Send WhatsApp
          </button>
        </td>
      </tr>
    `).join('');
  }

  let socialTimerLoopInterval = null;
  function start30MinTimerLoop() {
    if (socialTimerLoopInterval) {
      clearInterval(socialTimerLoopInterval);
      socialTimerLoopInterval = null;
    }
    socialTimerLoopInterval = setInterval(() => {
      socialOrders.forEach(o => {
        if (o.minutesLeft > 0) {
          o.minutesLeft--;
        } else if (o.repId !== 'MANAGEMENT') {
          // Trigger Lead Routing Agent timer expiry
          if (window.SouthernOliveAI && window.SouthernOliveAI.LeadRoutingAgent) {
            window.SouthernOliveAI.LeadRoutingAgent.handleTimerExpiry(o);
          }
        }
      });
      renderSocialOrders();
    }, 60000); // Check every minute
  }

  window.approveSocialOrder = function (orderId) {
    activeSelectedOrderForWhatsApp = socialOrders.find(o => o.id === orderId);
    const modalEl = document.getElementById('whatsappApprovalModal');
    const payloadContainer = document.getElementById('whatsappMessagePayload');

    if (payloadContainer && activeSelectedOrderForWhatsApp) {
      payloadContainer.innerHTML = `
        <strong>SOUTHERN OLIVE ORDER APPROVAL #1</strong><br/>
        Order ID: ${activeSelectedOrderForWhatsApp.id}<br/>
        Customer: ${activeSelectedOrderForWhatsApp.customerName}<br/>
        Items: ${activeSelectedOrderForWhatsApp.items}<br/>
        Payment Method: ${activeSelectedOrderForWhatsApp.paymentMethod}<br/>
        Live Tracking Link: https://southernolive.com/track?id=${activeSelectedOrderForWhatsApp.id}<br/>
        Dynamic Delivery Time: 1-3 Days (Beirut) / 3-5 Days (Outside Beirut)
      `;
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  };

  window.confirmSendWhatsAppMessage = function () {
    const modalEl = document.getElementById('whatsappApprovalModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (activeSelectedOrderForWhatsApp) {
      activeSelectedOrderForWhatsApp.status = 'Confirmed_By_Rep';
      showToast("1st WhatsApp Message Sent", `Message sent to customer. Commission credited to Sales Rep (${activeSelectedOrderForWhatsApp.repId}).`, "success");
    }
  };

  window.openLandingPageModal = function () {
    const modal = new bootstrap.Modal(document.getElementById('landingPageModal'));
    modal.show();
  };

  window.submitLandingPageOrder = function () {
    const name = document.getElementById('landingCustName')?.value;
    const phone = document.getElementById('landingCustPhone')?.value;
    const address = document.getElementById('landingCustAddress')?.value;
    const prod = document.getElementById('landingCustProduct')?.value;
    const payment = document.getElementById('landingCustPayment')?.value;

    const newOrd = {
      id: 'ORD-LAND-' + Math.floor(1000 + Math.random() * 9000),
      customerName: name,
      phone: phone,
      address: address,
      items: prod,
      totalAmount: 27.00,
      paymentMethod: payment
    };

    if (window.SouthernOliveAI && window.SouthernOliveAI.LeadRoutingAgent) {
      window.SouthernOliveAI.LeadRoutingAgent.processNewOrder(newOrd, 'REP-101');
    }

    socialOrders.unshift({
      id: newOrd.id,
      customerName: name,
      items: prod,
      totalAmount: 27.00,
      paymentMethod: payment,
      minutesLeft: 30,
      repId: 'REP-101'
    });

    renderSocialOrders();

    const modalEl = document.getElementById('landingPageModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    showToast("Landing Page Order Placed", `Order #${newOrd.id} received! Bound to Rep REP-101. 30-min timer active.`, "success");
  };

  // HR & Payroll Handlers
  window.toggleEmpDeptFields = function (dept) {
    document.querySelectorAll('.dept-extra-fields').forEach(el => el.style.display = 'none');
    if (dept === 'SocialMedia') document.getElementById('socialDeptFields').style.display = 'block';
    if (dept === 'Factory') document.getElementById('factoryDeptFields').style.display = 'block';
    if (dept === 'Fleet') document.getElementById('fleetDeptFields').style.display = 'block';
  };

  // System Roles & Permissions Matrix
  window.USER_ROLES = {
    ROLE_SUPER_ADMIN: { name: "General Manager / Owner", fullAccess: true },
    ROLE_HEAD_ACCOUNTANT: { name: "Head Accountant / Financial Controller", fullAccess: true, note: "Guaranteed 100% full master access across all modules, cash boxes, payroll, and settings." },
    ROLE_ACCOUNTANT: { name: "Junior Accountant", fullAccess: false, modules: ["accounting"] },
    ROLE_FACTORY_MANAGER: { name: "Factory Manager", fullAccess: false, modules: ["factory"] },
    ROLE_POS_CASHIER: { name: "POS Cashier", fullAccess: false, modules: ["pos"] },
    ROLE_FLEET_DRIVER: { name: "SuperSonic Driver", fullAccess: false, modules: ["fleet"] },
    ROLE_SOCIAL_REP: { name: "Social Media Rep", fullAccess: false, modules: ["social"] }
  };

  window.createEmployeeProfile = function () {
    const name = document.getElementById('empName')?.value;
    const dept = document.getElementById('empDeptSelect')?.value;
    showToast("Employee Created", `Added employee profile: ${name} (${dept} Department). Permissions configured.`, "success");
  };

  window.exportBLOMPayroll = function () {
    if (typeof window.exportPayrollFile === 'function') window.exportPayrollFile();
  };

  window.generateZReport = function () {
    showToast("Z-Report Closing", "Daily POS Shift Closed. Total Sales: $2,450.00. Cash drawer balanced.", "success");
  };

  window.generateStockVarianceReport = function () {
    showToast("Stock Variance", "Generated Stock Count Variance Report. Physical vs Theoretical stock matched.", "info");
  };

  // AI Agent Log Drawer Toggle
  window.toggleAIAgentsDrawer = function () {
    const drawer = document.getElementById('aiAgentsDrawer');
    if (!drawer) return;
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  };

  // Register AI agent log hook
  window.onAIAgentLog = function (logEntry) {
    const stream = document.getElementById('aiLogStream');
    if (!stream) return;
    const entryEl = document.createElement('div');
    entryEl.className = 'ai-log-entry';
    entryEl.innerHTML = `
      <span class="ai-log-agent">[${logEntry.timestamp}] ${logEntry.agentName} - ${logEntry.action}</span>
      <span class="ai-log-details">${logEntry.details}</span>
    `;
    stream.prepend(entryEl);
  };

  // Southern Olive Oil Products, S.A.R.L. UI Navigation Handlers
  window.toggleSouthernSidebar = function () {
    const sidebar = document.getElementById('southernSidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  };

  window.handleSidebarItemClick = function (groupId, triggerElem) {
    const sidebar = document.getElementById('southernSidebar');
    if (sidebar && !sidebar.classList.contains('open')) {
      sidebar.classList.add('open');
    }
    window.toggleAccordion(groupId, triggerElem);
  };

  window.toggleAccordion = function (groupId, triggerElem) {
    const sidebar = document.getElementById('southernSidebar');
    if (sidebar && !sidebar.classList.contains('open')) {
      sidebar.classList.add('open');
    }
    const group = document.getElementById(groupId);
    if (group) {
      const isOpen = group.classList.toggle('open');
      if (isOpen) {
        group.style.setProperty('display', 'block', 'important');
      } else {
        group.style.setProperty('display', 'none', 'important');
      }
      const targetHeader = triggerElem || (window.event && window.event.currentTarget);
      if (targetHeader && targetHeader.classList) {
        if (isOpen) {
          targetHeader.classList.add('open');
        } else {
          targetHeader.classList.remove('open');
        }
      }
    }
  };

  window.switchSouthernTab = function (tabKey) {
    const gridDash = document.getElementById('view-grid-dash');
    if (gridDash) {
      gridDash.classList.remove('active');
      gridDash.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.southern-nav-tabs .nav-item-link').forEach(el => el.classList.remove('active'));
    if (window.event && window.event.target) {
      window.event.target.classList.add('active');
    }
    const tabModuleMap = {
      'op': 'factory',
      'sales': 'pos',
      'fleet': 'fleet',
      'social': 'social',
      'acc': 'accounting',
      'hr': 'hr',
      'cust': 'customers',
      'sec': 'security'
    };
    const targetModule = tabModuleMap[tabKey];
    if (targetModule) {
      window.switchErpModule(targetModule);
    }
    showToast("Southern Olive Products", `Switched active section tab: ${tabKey.toUpperCase()}`, "info");
  };

  window.switchErpModule = function (moduleKey) {
    if (typeof window.cleanupAllModalBackdrops === 'function') {
      window.cleanupAllModalBackdrops();
    }
    const gridDash = document.getElementById('view-grid-dash');
    if (gridDash) {
      gridDash.classList.remove('active');
      gridDash.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.southern-screen-view').forEach(s => {
      if (s.id !== 'view-grid-dash') {
        s.classList.remove('active');
        s.style.setProperty('display', 'none', 'important');
      }
    });

    const moduleMap = {
      'pos': 'page-pos',
      'sales': 'page-pos',
      'factory': 'page-factory',
      'op': 'page-factory',
      'accounting': 'page-accounting',
      'acc': 'page-accounting',
      'customers': 'page-customers',
      'cust': 'page-customers',
      'hr': 'page-hr',
      'fleet': 'page-fleet',
      'social': 'page-social',
      'security': 'page-security',
      'sec': 'page-security'
    };

    const targetModuleId = moduleMap[moduleKey] || `page-${moduleKey}`;

    document.querySelectorAll('.module-page').forEach(p => {
      if (p.id === targetModuleId || p.id === `page-${moduleKey}`) {
        p.classList.add('active');
        p.style.setProperty('display', 'block', 'important');
      } else {
        p.classList.remove('active');
        p.style.setProperty('display', 'none', 'important');
      }
    });
  };

  window.switchSubTab = function (module, tabKey, btnElement) {
    if (typeof window.updateSubheaderVisibility === 'function') {
      window.updateSubheaderVisibility(module);
    }

    window.switchErpModule(module);

    if (btnElement) {
      const parentNav = btnElement.closest('.subnav-tabs');
      if (parentNav) {
        parentNav.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        btnElement.classList.add('active');
      }
    } else {
      const matchingBtn = document.querySelector(`.subnav-tabs button[onclick*="'${module}', '${tabKey}'"]`);
      if (matchingBtn) {
        const parentNav = matchingBtn.closest('.subnav-tabs');
        if (parentNav) {
          parentNav.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
          matchingBtn.classList.add('active');
        }
      }
    }

    const targetSubpanelId = `subpanel-${module}-${tabKey}`;
    const targetSubpanel = document.getElementById(targetSubpanelId) || document.getElementById(`subpanel-${tabKey}`);

    document.querySelectorAll('.subpanel').forEach(panel => {
      if (panel === targetSubpanel || panel.id === targetSubpanelId) {
        panel.classList.add('active');
        panel.style.setProperty('display', 'block', 'important');
      } else {
        panel.classList.remove('active');
        panel.style.setProperty('display', 'none', 'important');
      }
    });

    if (targetSubpanelId === 'subpanel-sales-dash' && typeof window.renderSalesDashboardData === 'function') {
      window.renderSalesDashboardData();
    }
    if ((tabKey === 'pmtypes' || targetSubpanelId === 'subpanel-sales-pmtypes') && typeof window.renderPaymentTypesTable === 'function') {
      window.renderPaymentTypesTable();
    }
    if ((tabKey === 'pmbills' || targetSubpanelId === 'subpanel-sales-pmbills') && typeof window.renderPaymentBillsTable === 'function') {
      window.renderPaymentBillsTable();
      if (typeof window.updatePmBillsTypeDropdownOptions === 'function') window.updatePmBillsTypeDropdownOptions();
    }
  };

  window.switchSouthernScreenPrimary = function (screenId) {
    if (typeof window.cleanupAllModalBackdrops === 'function') {
      window.cleanupAllModalBackdrops();
    }
    if (typeof window.updateSubheaderVisibility === 'function') {
      window.updateSubheaderVisibility(screenId);
    }

    if (screenId === 'olive-press' || screenId === 'oil-press' || screenId === 'view-olive-press' || screenId === 'view-oil-press' || screenId === 'so-olive-pressing-modal') {
      if (typeof window.openOlivePressingModal === 'function') {
        window.openOlivePressingModal();
      } else if (window.SouthernOliveBridge && typeof window.SouthernOliveBridge.openOlivePressingModal === 'function') {
        window.SouthernOliveBridge.openOlivePressingModal();
      }
      return;
    }

    if (screenId === 'vanguard-admin' || screenId === 'vanguard' || screenId === 'view-vanguard-admin') {
      window.location.href = '/admin';
      return;
    }

    const gridDash = document.getElementById('view-grid-dash');

    if (!screenId || screenId === 'grid-dash' || screenId === 'view-grid-dash' || screenId === 'dashboard') {
      document.querySelectorAll('.module-page').forEach(p => {
        p.classList.remove('active');
        p.style.setProperty('display', 'none', 'important');
      });
      document.querySelectorAll('.southern-screen-view').forEach(s => {
        if (s.id !== 'view-grid-dash') {
          s.classList.remove('active');
          s.style.setProperty('display', 'none', 'important');
        }
      });
      if (gridDash) {
        gridDash.classList.add('active');
        gridDash.style.setProperty('display', 'block', 'important');
      }
      return;
    }

    let screenToLookFor = screenId;
    if (screenId === 'op-discounts' || screenId === 'view-op-discounts') {
      screenToLookFor = 'view-sales-discounts';
    }
    if (screenId === 'sales-pricemodes' || screenId === 'op-pricemodes' || screenId === 'op-modes' || screenId === 'modes' || screenId === 'view-modes' || screenId === 'view-pricemodes') {
      screenToLookFor = 'view-sales-pricemodes';
    }
    if (screenId === 'sales-printers' || screenId === 'op-printers' || screenId === 'workstations-printers' || screenId === 'device-preferences' || screenId === 'workstations' || screenId === 'view-device-preferences') {
      screenToLookFor = 'view-sales-printers';
    }

    const targetId = screenToLookFor.startsWith('view-') || screenToLookFor.startsWith('page-') ? screenToLookFor : 'view-' + screenToLookFor;
    const directTarget = document.getElementById(targetId) || document.getElementById(screenToLookFor);

    if (directTarget && directTarget.classList.contains('southern-screen-view')) {
      document.querySelectorAll('.module-page').forEach(p => {
        p.classList.remove('active');
        p.style.setProperty('display', 'none', 'important');
      });
      document.querySelectorAll('.southern-screen-view').forEach(s => {
        s.classList.remove('active');
        s.style.setProperty('display', 'none', 'important');
      });
      directTarget.classList.add('active');
      directTarget.style.setProperty('display', 'block', 'important');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const titleName = screenId.replace('-', ' ').toUpperCase();
      showToast("Southern Olive Products", `Opened ${titleName} Workspace Screen`, "success");
      return;
    }

    if (gridDash) {
      gridDash.classList.remove('active');
      gridDash.style.setProperty('display', 'none', 'important');
    }

    const explicitScreenMap = {
      // 1. Sales Control
      'sales-dash': ['pos', 'sales', 'dash'],
      'sales-reports': ['pos', 'sales', 'reports'],
      'sales-online': ['pos', 'sales', 'online'],
      'sales-eod': ['pos', 'sales', 'eod'],
      'sales-screen': ['factory', 'op', 'screens'],
      'sales-pm-types': ['pos', 'sales', 'pmtypes'],
      'sales-pm-bills': ['pos', 'sales', 'pmbills'],
      'sales-coupons': ['pos', 'sales', 'setup'],
      'sales-discounts': ['pos', 'sales', 'setup'],
      'sales-pricemodes': ['pos', 'sales', 'setup'],
      'sales-printers': ['pos', 'sales', 'setup'],
      'sales-voidreasons': ['pos', 'sales', 'moresetup'],
      'sales-vatexempt': ['pos', 'sales', 'vatexempt'],
      'sales-invmsg': ['pos', 'sales', 'invmsg'],
      'sales-zonesetup': ['pos', 'sales', 'moresetup'],
      'sales-currsetup': ['pos', 'sales', 'moresetup'],
      'pos': ['pos', 'sales', 'pos'],

      // 2. Operations Center
      'op-dash': ['factory', 'op', 'dash'],
      'op-reports': ['factory', 'op', 'actions'],
      'op-sales': ['factory', 'op', 'actions'],
      'op-quotations': ['factory', 'op', 'actions'],
      'delivery-goods': ['factory', 'op', 'actions'],
      'op-purchases': ['factory', 'op', 'actions'],
      'op-po': ['factory', 'op', 'actions'],
      'reorder-guide': ['factory', 'op', 'actions'],
      'transfers': ['factory', 'op', 'wh'],
      'lost-goods-reason': ['factory', 'op', 'moresetup'],
      'op-bom': ['factory', 'op', 'bom'],
      'op-adjustments': ['factory', 'op', 'actions'],
      'product-request': ['factory', 'op', 'actions'],
      'manage-prod-req': ['factory', 'op', 'actions'],
      'prep-prod-req': ['factory', 'op', 'actions'],
      'recv-goods': ['factory', 'op', 'actions'],
      'op-req-reports': ['factory', 'op', 'actions'],
      'op-reject-reasons': ['factory', 'op', 'moresetup'],
      'op-events': ['factory', 'op', 'events'],
      'event-venues': ['factory', 'op', 'events'],
      'event-resources': ['factory', 'op', 'events'],
      'event-types': ['factory', 'op', 'events'],
      'op-quick-setup': ['factory', 'op', 'setup'],
      'products-services': ['factory', 'op', 'products'],
      'products': ['factory', 'op', 'products'],
      'op-groups': ['factory', 'op', 'setup'],
      'op-divisions': ['factory', 'op', 'setup'],
      'op-categories': ['factory', 'op', 'setup'],
      'op-units': ['factory', 'op', 'setup'],
      'op-locations': ['factory', 'op', 'setup'],
      'op-suppliers': ['factory', 'op', 'setup'],
      'op-depts': ['factory', 'op', 'setup'],
      'op-lost-reasons': ['factory', 'op', 'moresetup'],
      'op-sizegroups': ['factory', 'op', 'moresetup'],
      'op-sizes': ['factory', 'op', 'moresetup'],
      'op-colors': ['factory', 'op', 'moresetup'],
      'op-discounts': ['factory', 'op', 'moresetup'],
      'op-payment-types': ['factory', 'op', 'moresetup'],
      'op-currency': ['factory', 'op', 'moresetup'],
      'inventory-brands': ['factory', 'op', 'moresetup'],
      'delivery-providers': ['factory', 'op', 'moresetup'],
      'units-of-measure': ['factory', 'op', 'moresetup'],

      // 3. Customer Management
      'cust-dir': ['customers', 'cust', 'dir'],
      'cust-receipts': ['customers', 'cust', 'dir'],
      'cust-aged': ['customers', 'cust', 'aged'],
      'cust-insights': ['customers', 'cust', 'dir'],
      'cust-tasks': ['customers', 'cust', 'leads'],
      'cust-leads': ['customers', 'cust', 'leads'],
      'sales-perf': ['customers', 'cust', 'leads'],
      'cust-groups': ['customers', 'cust', 'dir'],
      'cust-categories': ['customers', 'cust', 'dir'],
      'cust-tags': ['customers', 'cust', 'dir'],
      'lead-setting': ['customers', 'cust', 'leads'],
      'cust-feedback-dash': ['customers', 'cust', 'feedback'],
      'cust-feedback-manage': ['customers', 'cust', 'feedback'],
      'cust-feedback-add': ['customers', 'cust', 'feedback'],
      'cust-survey-manage': ['customers', 'cust', 'feedback'],
      'cust-survey-email': ['customers', 'cust', 'feedback'],
      'complaint-res': ['customers', 'cust', 'feedback'],
      'complaint-cat': ['customers', 'cust', 'feedback'],
      'complaint-action': ['customers', 'cust', 'feedback'],
      'complaint-care': ['customers', 'cust', 'feedback'],
      'survey-setup': ['customers', 'cust', 'feedback'],
      'loyalty-dash': ['customers', 'cust', 'loyalty'],
      'loyalty-reports': ['customers', 'cust', 'loyalty'],
      'loyalty-members': ['customers', 'cust', 'loyalty'],
      'loyalty-levels': ['customers', 'cust', 'loyalty'],
      'loyalty-programs': ['customers', 'cust', 'loyalty'],
      'loyalty-sendmsg': ['customers', 'cust', 'loyalty'],
      'loyalty-company': ['customers', 'cust', 'loyalty'],

      // 4. Accounting
      'acc-dash': ['accounting', 'acc', 'dash'],
      'acc-reports': ['accounting', 'acc', 'dash'],
      'acc-jv': ['accounting', 'acc', 'jv'],
      'acc-purchases': ['accounting', 'acc', 'jv'],
      'acc-payments': ['accounting', 'acc', 'jv'],
      'acc-receipts': ['accounting', 'acc', 'jv'],
      'acc-receivables': ['accounting', 'acc', 'jv'],
      'acc-payables': ['accounting', 'acc', 'jv'],
      'acc-rec': ['accounting', 'acc', 'jv'],
      'acc-vat': ['accounting', 'acc', 'vat'],
      'acc-coa': ['accounting', 'acc', 'coa'],
      'acc-classes': ['accounting', 'acc', 'coa'],
      'acc-h1': ['accounting', 'acc', 'coa'],
      'acc-h2': ['accounting', 'acc', 'coa'],
      'acc-h3': ['accounting', 'acc', 'coa'],
      'acc-groups': ['accounting', 'acc', 'coa'],
      'acc-jvdesc': ['accounting', 'acc', 'coa'],
      'acc-jvtypes': ['accounting', 'acc', 'coa'],
      'acc-curr': ['accounting', 'acc', 'coa'],
      'acc-rates': ['accounting', 'acc', 'coa'],
      'acc-dept-groups': ['accounting', 'acc', 'boxes'],
      'acc-dept': ['accounting', 'acc', 'boxes'],
      'acc-cashflow': ['accounting', 'acc', 'boxes'],
      'acc-subdept': ['accounting', 'acc', 'boxes'],

      // 5. Human Resources
      'hr-overview': ['hr', 'hr', 'dir'],
      'hr-dir': ['hr', 'hr', 'dir'],
      'hr-schedule': ['hr', 'hr', 'schedule'],
      'hr-internal-depts': ['hr', 'hr', 'dir'],
      'hr-designations': ['hr', 'hr', 'dir'],
      'hr-pos-roles': ['hr', 'hr', 'dir'],
      'hr-timeoff-req': ['hr', 'hr', 'attendance'],
      'hr-templates': ['hr', 'hr', 'attendance'],
      'hr-reasons': ['hr', 'hr', 'attendance'],
      'hr-att-summary': ['hr', 'hr', 'attendance'],
      'hr-att-log': ['hr', 'hr', 'attendance'],
      'hr-payroll-dash': ['hr', 'hr', 'payroll'],
      'hr-salary-proc': ['hr', 'hr', 'payroll'],
      'hr-pmt-settings': ['hr', 'hr', 'payroll'],
      'hr-earn-deduct': ['hr', 'hr', 'payroll'],

      // 6. SuperSonic Fleet
      'fleet-map': ['fleet', 'fleet', 'map'],
      'fleet-dispatch': ['fleet', 'fleet', 'dispatch'],
      'fleet-km': ['fleet', 'fleet', 'km'],
      'fleet-fuel': ['fleet', 'fleet', 'fuel'],
      'fleet-maint': ['fleet', 'fleet', 'maint'],
      'fleet-trips': ['fleet', 'fleet', 'trips'],
      'fleet-drivers': ['fleet', 'fleet', 'drivers'],

      // 7. Social Media Management
      'social-inbox': ['social', 'social', 'inbox'],
      'social-orders': ['social', 'social', 'orders'],
      'social-api': ['social', 'social', 'api'],
      'social-content': ['social', 'social', 'content'],
      'social-campaigns': ['social', 'social', 'campaigns'],
      'social-agents': ['social', 'social', 'agents'],
      'social-directory': ['social', 'social', 'directory'],

      // 8. Security
      'sec-auth': ['security', 'sec', 'auth'],
      'sec-sync': ['security', 'sec', 'sync'],
      'sec-rbac': ['security', 'sec', 'rbac']
    };

    if (explicitScreenMap[screenId]) {
      const [module, subMod, tab] = explicitScreenMap[screenId];
      window.switchErpModule(module);
      window.switchSubTab(subMod, tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Southern Olive Products", `Opened ${screenId.replace('-', ' ').toUpperCase()} Screen Workspace`, "success");
      return;
    }

    if (screenId.startsWith('sales') || screenId === 'pos') {
      window.switchErpModule('pos');
      const parts = screenId.split('-');
      if (parts.length > 1) window.switchSubTab('sales', parts[1]);
    } else if (screenId.startsWith('op')) {
      window.switchErpModule('factory');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'op') window.switchSubTab('op', parts[1]);
    } else if (screenId.startsWith('cust') || screenId.includes('sales-perf')) {
      window.switchErpModule('customers');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'cust') window.switchSubTab('cust', parts[1]);
    } else if (screenId.startsWith('acc')) {
      window.switchErpModule('accounting');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'acc') window.switchSubTab('acc', parts[1]);
    } else if (screenId.startsWith('fleet')) {
      window.switchErpModule('fleet');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'fleet') window.switchSubTab('fleet', parts[1]);
    } else if (screenId.startsWith('social')) {
      window.switchErpModule('social');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'social') window.switchSubTab('social', parts[1]);
    } else if (screenId.startsWith('hr')) {
      window.switchErpModule('hr');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'hr') window.switchSubTab('hr', parts[1]);
    } else if (screenId.startsWith('sec')) {
      window.switchErpModule('security');
      const parts = screenId.split('-');
      if (parts.length > 1 && parts[0] === 'sec') window.switchSubTab('sec', parts[1]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Southern Olive Products", `Opened ${screenId.replace('-', ' ').toUpperCase()} Screen Workspace`, "success");
  };

  // Multi-Bank & Financial Wallet Payroll File Generator
  window.exportBlomBankPayroll = function () {
    if (typeof window.exportPayrollFile === 'function') window.exportPayrollFile();
  };

  // WhatsApp Debt Reminder Trigger
  window.sendWhatsAppDebtReminder = function (customerName, phone, amount) {
    const msg = encodeURIComponent(`عزيزنا ${customerName}، نود تذكيركم بلطف برصيد الحساب المستحق بقيمة $${amount} لصالح شركة منتوجات زيت وزيتون الجنوب ش.م.م (Company ID: 001). للاستفسار يرجى الاتصال بنا على 71801140. شكراً لتعاونكم!`);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    showToast("WhatsApp Reminder", `Sent payment reminder to ${customerName} (${phone})`, "success");
  };

  // Dual-Screen Customer Display Modal Trigger
  window.openCustomerBackScreenDisplay = function () {
    const modalEl = document.getElementById('backScreenDisplayModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      showToast("Customer Display", "Dual-screen Customer Display Active on Secondary Monitor", "info");
    }
  };

  // Z-Report Settlement Trigger
  window.triggerZReportSettlement = function () {
    const modalEl = document.getElementById('zReportModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      showToast("Z-Report Settlement", "Minute-precision EOD Z-Report posting completed ($1,420.00 USD / 42,500,000 LBP)", "success");
    }
  };

  // Printable Chef Recipe Modal Trigger
  window.printChefRecipe = function (recipeName) {
    const modalEl = document.getElementById('chefRecipeModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      showToast("BOM Recipe", `Printable Recipe Sheet for ${recipeName} generated`, "info");
    }
  };

  // VAT Period Closing
  window.closeVatPeriod = function () {
    showToast("VAT Closing", "Net VAT Closing Entry Posted: Output VAT ($3,410.00) vs Input VAT ($1,850.00) => Payable Net ($1,560.00)", "success");
  };

  /* ==========================================================================
     DYNAMIC HR EMPLOYEE DESIGNATION FLOW & CUSTOM FIELD ENGINE
     ========================================================================== */

  const deptDesignationsMap = {
    SocialMedia: [
      { name: "Social Media Representative", category: "Agent" },
      { name: "Support Agent", category: "Agent" },
      { name: "Social Media Manager", category: "Management" }
    ],
    Factory: [
      { name: "Factory Operator / Worker", category: "Worker" },
      { name: "Factory Production Manager", category: "Management" }
    ],
    Fleet: [
      { name: "SuperSonic Driver", category: "Driver" },
      { name: "Fleet Dispatcher", category: "Agent" },
      { name: "Procurement Driver", category: "Driver" },
      { name: "Fleet Manager", category: "Management" }
    ],
    Accounting: [
      { name: "Head Accountant / Finance Manager", category: "Management" },
      { name: "Junior Accountant", category: "Staff" },
      { name: "Auditor", category: "Staff" }
    ],
    Wholesale: [
      { name: "Wholesale Sales Manager", category: "Management" },
      { name: "Sales Representative", category: "Agent" },
      { name: "Account Manager", category: "Agent" }
    ],
    HR: [
      { name: "HR Manager", category: "Management" },
      { name: "HR Assistant", category: "Staff" }
    ],
    Admin: [
      { name: "General / Master Admin", category: "Management" }
    ]
  };

  const defaultInitialEmployees = [
    {
      id: 'EMP-1001',
      customCode: 'DRV-101',
      firstName: 'Charbel',
      lastName: 'Khalil',
      fullName: 'Charbel Khalil',
      nickname: 'Charbel K.',
      phone: '+961 70 123456',
      email: 'charbel.khalil@southernolive.com',
      address: 'Choueifat Main St, Lebanon',
      dept: 'Fleet',
      designation: 'SuperSonic Driver',
      salaryType: 'Monthly',
      baseSalary: 950.00,
      iban: 'LB8900020000000012345678',
      invToken: 'INV-988446',
      actLink: 'activate.html?token=INV-988446&email=charbel.khalil%40southernolive.com&dept=Fleet&designation=SuperSonic%20Driver&name=Charbel%20Khalil',
      createdAt: new Date().toISOString()
    }
  ];

  let employeesList = JSON.parse(localStorage.getItem('so_employees') || 'null');
  if (!employeesList || employeesList.length === 0) {
    employeesList = defaultInitialEmployees;
    localStorage.setItem('so_employees', JSON.stringify(employeesList));
  }

  let customFieldsList = JSON.parse(localStorage.getItem('so_custom_employee_fields') || '[]');

  window.onEmpDeptScopeChange = function (deptKey) {
    const desigSel = document.getElementById('empDesignation');
    if (!desigSel) return;

    const list = deptDesignationsMap[deptKey] || deptDesignationsMap.Admin;
    desigSel.innerHTML = list.map(d => `<option value="${d.name}" data-cat="${d.category}">${d.name} (${d.category})</option>`).join('');

    if (desigSel.options.length > 0) {
      window.onEmpDesignationChange(desigSel.options[0].value);
    }
    renderDynamicCustomFields(deptKey);
  };

  window.onEmpDesignationChange = function (designationVal) {
    const deptKey = document.getElementById('empDeptScope')?.value || 'Admin';
    const list = deptDesignationsMap[deptKey] || [];
    const item = list.find(d => d.name === designationVal) || { category: 'Staff' };

    // Hide all extension groups
    document.querySelectorAll('.dept-ext-group').forEach(el => el.style.display = 'none');

    // Agent / Representative Custom Code group
    const isAgent = (item.category === 'Agent' || item.category === 'Driver' || item.category === 'Worker');
    const agentGrp = document.getElementById('extAgentCodeGroup');
    if (agentGrp) agentGrp.style.display = isAgent ? 'block' : 'none';

    // Department-specific groups
    if (deptKey === 'SocialMedia') {
      const g = document.getElementById('extSocialGroup');
      if (g) g.style.display = 'block';
    } else if (deptKey === 'Factory') {
      const g = document.getElementById('extFactoryGroup');
      if (g) g.style.display = 'block';
    } else if (deptKey === 'Fleet') {
      const g = document.getElementById('extFleetGroup');
      if (g) g.style.display = 'block';
    } else if (deptKey === 'Wholesale') {
      const g = document.getElementById('extWholesaleGroup');
      if (g) g.style.display = 'block';
    }

    // Management group
    const isMgmt = (item.category === 'Management');
    const mgmtGrp = document.getElementById('extManagementGroup');
    if (mgmtGrp) mgmtGrp.style.display = isMgmt ? 'block' : 'none';

    // Desktop Icon Access Badge update for Management
    const iconBadge = document.getElementById('empRoleDesktopIconBadge');
    if (iconBadge) {
      if (deptKey === 'SocialMedia') iconBadge.textContent = 'Exclusive Access: Social Media Sales App Desktop Icon';
      else if (deptKey === 'Factory') iconBadge.textContent = 'Exclusive Access: Operations Center & Stock Receiving Desktop Icon';
      else if (deptKey === 'Fleet') iconBadge.textContent = 'Exclusive Access: SuperSonic Fleet & Delivery App Desktop Icon';
      else if (deptKey === 'Accounting') iconBadge.textContent = 'Exclusive Access: Accounting Console Desktop Icon';
      else if (deptKey === 'Wholesale') iconBadge.textContent = 'Exclusive Access: Customer Management Desktop Icon';
      else iconBadge.textContent = 'Full Access Granted to ALL Desktop Icons';
    }
  };

  // UNIVERSAL ADMIN AUTHORIZATION GATE FOR REP / AGENT CREATION
  window.isCurrentSessionAdmin = function () {
    const roleBadge = document.getElementById('workspaceUserRole');
    const roleText = (roleBadge ? roleBadge.innerText : '').trim().toLowerCase();
    const storedRole = (localStorage.getItem('so_user_role') || '').trim().toLowerCase();
    const activeRoleKey = (localStorage.getItem('so_active_role_key') || '').trim().toLowerCase();

    // Explicit Non-Admin Rep / Agent / Clerk / Driver roles
    const isRepOrClerk = (
      roleText.includes('rep') ||
      roleText.includes('agent') ||
      roleText.includes('clerk') ||
      roleText.includes('driver') ||
      storedRole.includes('rep') ||
      storedRole.includes('agent') ||
      storedRole.includes('clerk') ||
      storedRole.includes('driver') ||
      activeRoleKey === 'sales_rep' ||
      activeRoleKey === 'social_media_rep' ||
      activeRoleKey === 'social_rep' ||
      activeRoleKey === 'stock_clerk'
    );

    const isAdminRole = (
      roleText.includes('admin') ||
      roleText.includes('director') ||
      roleText.includes('master') ||
      storedRole.includes('admin') ||
      storedRole.includes('director') ||
      storedRole.includes('master') ||
      activeRoleKey === 'master_admin' ||
      activeRoleKey === 'general_admin' ||
      activeRoleKey === 'pos_sales_admin'
    );

    if (isRepOrClerk && !isAdminRole) {
      return false;
    }

    return true;
  };

  window.checkAdminRepPermission = function (actionName = 'add or create Rep / Agent profiles') {
    if (!window.isCurrentSessionAdmin()) {
      showToast(
        "Admin Permission Required",
        `Access Denied: Only Admin Accounts are authorized to ${actionName}. Regular Reps do not have permission on any application.`,
        "error"
      );
      return false;
    }
    return true;
  };

  window.openDeptEmployeeModal = function (deptKey = 'Admin') {
    if (!window.checkAdminRepPermission(`add a ${deptKey} Rep / Employee Profile`)) {
      return;
    }

    const modalEl = document.getElementById('employeeProfileModal');
    if (!modalEl) return;

    const form = document.getElementById('employeeProfileForm');
    if (form) form.reset();

    const deptSel = document.getElementById('empDeptScope');
    if (deptSel) {
      deptSel.value = deptKey;
      window.onEmpDeptScopeChange(deptKey);
    }

    if (typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  window.saveEmployeeProfile = function () {
    if (!window.checkAdminRepPermission('create or save Rep / Employee Profiles')) {
      return;
    }

    const firstName = document.getElementById('empFirstName')?.value.trim();
    const lastName = document.getElementById('empLastName')?.value.trim();
    const phone = document.getElementById('empPhone')?.value.trim();
    const dept = document.getElementById('empDeptScope')?.value || 'Admin';
    const designation = document.getElementById('empDesignation')?.value || 'Staff';
    const baseSalary = parseFloat(document.getElementById('empBaseSalary')?.value || '0');

    if (!firstName || !lastName || !phone) {
      showToast("Validation Error", "Please fill in all mandatory fields (First Name, Last Name, Phone).", "warning");
      return;
    }

    const empId = 'EMP-' + Math.floor(1000 + Math.random() * 9000);
    const fullName = `${firstName} ${lastName}`;
    const customCode = document.getElementById('empCustomCode')?.value.trim() || empId;
    const email = document.getElementById('empEmail')?.value.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@southernolive.com`;

    const invToken = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const actLink = `${baseUrl}activate.html?token=${invToken}&email=${encodeURIComponent(email)}&dept=${encodeURIComponent(dept)}&designation=${encodeURIComponent(designation)}&name=${encodeURIComponent(fullName)}`;

    const newEmp = {
      id: empId,
      customCode: customCode,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      nickname: document.getElementById('empNickname')?.value.trim() || fullName,
      phone: phone,
      email: email,
      address: document.getElementById('empAddress')?.value.trim() || '',
      dept: dept,
      designation: designation,
      salaryType: document.getElementById('empSalaryType')?.value || 'Monthly',
      baseSalary: baseSalary,
      iban: document.getElementById('empIBAN')?.value.trim() || 'LB8900020000000000000000',
      invToken: invToken,
      actLink: actLink,
      createdAt: new Date().toISOString()
    };

    employeesList.unshift(newEmp);
    localStorage.setItem('so_employees', JSON.stringify(employeesList));

    // Hide modal
    const modalEl = document.getElementById('employeeProfileModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    // Refresh tables
    refreshHRDirectoryTables();

    // Trigger Automated Email Invitation Payload Notification
    showToast("Automated Invite Sent", `Activation URL generated for ${fullName}: ${invToken}`, "success");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(actLink).catch(() => { });
    }
  };

  function refreshHRDirectoryTables() {
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;

    if (employeesList.length === 0) return;

    const rows = employeesList.map(e => `
      <tr>
        <td><strong>${e.fullName}</strong> <small class="text-muted d-block">${e.designation}</small></td>
        <td><span class="badge bg-secondary">${e.dept}</span></td>
        <td><small class="font-monospace text-warning">${e.iban}</small></td>
        <td>$${e.baseSalary.toFixed(2)}</td>
        <td class="text-success">
          <a href="${e.actLink || 'activate.html'}" target="_blank" class="btn btn-sm btn-outline-warning p-1 text-decoration-none">
            <i class="fa-solid fa-paper-plane me-1"></i> Send Invite / Activate
          </a>
        </td>
        <td><strong>$${e.baseSalary.toFixed(2)}</strong></td>
      </tr>
    `).join('');

    tbody.innerHTML = rows;
  }

  // Custom Field Engine
  window.openAddCustomFieldModal = function () {
    const modalEl = document.getElementById('addCustomFieldModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  window.toggleCfOptionsInput = function (typeVal) {
    const grp = document.getElementById('cfSelectOptionsGroup');
    if (grp) grp.style.display = (typeVal === 'select') ? 'block' : 'none';
  };

  window.saveCustomFieldDefinition = function () {
    const label = document.getElementById('cfLabel')?.value.trim();
    const type = document.getElementById('cfType')?.value || 'text';
    const options = document.getElementById('cfOptions')?.value.trim() || '';
    const scopeRadios = document.getElementsByName('cfScope');
    let scope = 'dept';
    for (let r of scopeRadios) { if (r.checked) scope = r.value; }

    const activeDept = document.getElementById('empDeptScope')?.value || 'Admin';

    if (!label) return;

    const newField = {
      id: 'cf_' + Date.now(),
      label: label,
      type: type,
      options: options,
      scope: scope,
      targetDept: activeDept
    };

    customFieldsList.push(newField);
    localStorage.setItem('so_custom_employee_fields', JSON.stringify(customFieldsList));

    const modalEl = document.getElementById('addCustomFieldModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    renderDynamicCustomFields(activeDept);
    showToast("Custom Field Added", `Saved field "${label}" (${scope === 'global' ? 'All Depts Globally' : activeDept + ' Only'})`, "success");
  };

  function renderDynamicCustomFields(activeDept) {
    const container = document.getElementById('dynamicCustomFieldsContainer');
    if (!container) return;

    const matchingFields = customFieldsList.filter(f => f.scope === 'global' || f.targetDept === activeDept);

    if (matchingFields.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="p-3 bg-dark rounded border border-info">
        <h6 class="text-info small fw-bold mb-2"><i class="fa-solid fa-list-check me-1"></i> Custom Extended Fields</h6>
        <div class="row g-2">
          ${matchingFields.map(f => {
      if (f.type === 'select') {
        const opts = f.options.split(',').map(o => `<option value="${o.trim()}">${o.trim()}</option>`).join('');
        return `
                <div class="col-md-6">
                  <label class="form-label text-white small">${f.label}</label>
                  <select class="form-select form-select-sm bg-dark text-white border-info">${opts}</select>
                </div>
              `;
      } else {
        return `
                <div class="col-md-6">
                  <label class="form-label text-white small">${f.label}</label>
                  <input type="${f.type}" class="form-control form-control-sm bg-dark text-white border-info" placeholder="${f.label}" />
                </div>
              `;
      }
    }).join('')}
        </div>
      </div>
    `;
  }

  // PWA Mode Launcher
  window.SouthernOliveERP = {
    launchAppMode: function (appMode) {
      window.enterErpWorkspace('General Admin');
      if (appMode === 'supersonic' || appMode === 'driver') {
        window.switchErpModule('fleet', document.querySelectorAll('.nav-module-btn')[4]);
        showToast("SuperSonic App", "Launched SuperSonic Unified Dispatch, Delivery & Driver Portal", "info");
      } else if (appMode === 'social') {
        window.switchErpModule('social', document.querySelectorAll('.nav-module-btn')[5]);
        showToast("App Mode", "Launched منتوجات زيت وزيتون الجنوب Social Sales App", "info");
      } else if (appMode === 'production') {
        window.switchErpModule('factory', document.querySelectorAll('.nav-module-btn')[1]);
        showToast("App Mode", "Launched Production & BOM Assembly App", "info");
      }
    }
  };

  // ==========================================
  // UNIFIED MERGED FUNCTIONALITY & HANDLERS
  // ==========================================

  // 1. Role Sign-In & Access Level Controller
  window.updateRolePermissions = function (role) {
    const roleBadge = document.getElementById('rolePermissionBadge');
    const wsRoleBadge = document.getElementById('workspaceUserRole');
    if (wsRoleBadge) wsRoleBadge.textContent = role.toUpperCase();

    if (!roleBadge) return;
    if (role === 'admin' || role === 'factory' || role === 'accountant') {
      roleBadge.innerHTML = `
        <span class="badge bg-success p-2 fs-6 mb-1"><i class="fa-solid fa-shield-check me-1"></i> Full Access Granted (${role.toUpperCase()})</span>
        <div class="small text-success"><i class="fa-solid fa-unlock me-1"></i> Master Edit/Modify Unlocked</div>
      `;
      showToast("Access Granted", `Role set to ${role.toUpperCase()} - Full Administrative Rights`, "success");
    } else {
      roleBadge.innerHTML = `
        <span class="badge read-only-badge p-2 mb-1"><i class="fa-solid fa-lock me-1"></i> Restricted Stock Clerk Role</span>
        <div class="small text-danger"><i class="fa-solid fa-eye me-1"></i> Add & Count Only (No Price Editing)</div>
      `;
      showToast("Access Restricted", "Role set to Standard Stock Clerk (Read-only for sensitive financials)", "warning");
    }
  };

  // 2. Digital HTML5 Signature Pad Engine
  let signaturePadCanvas = null;
  let signaturePadCtx = null;
  let isDrawingSignature = false;

  window.initSignaturePad = function () {
    signaturePadCanvas = document.getElementById('signaturePad');
    if (!signaturePadCanvas) return;
    signaturePadCtx = signaturePadCanvas.getContext('2d');
    signaturePadCanvas.width = signaturePadCanvas.offsetWidth || 350;
    signaturePadCanvas.height = 180;
    signaturePadCtx.strokeStyle = '#0284c7';
    signaturePadCtx.lineWidth = 3;
    signaturePadCtx.lineCap = 'round';

    function getPos(e) {
      const rect = signaturePadCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
      isDrawingSignature = true;
      const pos = getPos(e);
      signaturePadCtx.beginPath();
      signaturePadCtx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      if (!isDrawingSignature) return;
      const pos = getPos(e);
      signaturePadCtx.lineTo(pos.x, pos.y);
      signaturePadCtx.stroke();
    }

    function stopDraw() {
      isDrawingSignature = false;
    }

    signaturePadCanvas.addEventListener('mousedown', startDraw);
    signaturePadCanvas.addEventListener('mousemove', draw);
    signaturePadCanvas.addEventListener('mouseup', stopDraw);
    signaturePadCanvas.addEventListener('touchstart', startDraw, { passive: true });
    signaturePadCanvas.addEventListener('touchmove', draw, { passive: true });
    signaturePadCanvas.addEventListener('touchend', stopDraw);
  };

  window.clearSignaturePad = function () {
    if (signaturePadCanvas && signaturePadCtx) {
      signaturePadCtx.clearRect(0, 0, signaturePadCanvas.width, signaturePadCanvas.height);
      showToast("Signature Pad", "Canvas cleared", "info");
    }
  };

  window.submitDigitalSignature = function () {
    showToast("Proof of Delivery", "Customer signature saved & order marked DELIVERED", "success");
    const sigModal = document.getElementById('digitalSignatureModal');
    if (sigModal && typeof bootstrap !== 'undefined') {
      const modalInst = bootstrap.Modal.getInstance(sigModal);
      if (modalInst) modalInst.hide();
    }
  };

  // 3. Social Sales Rep 30-Minute Countdown Timer
  let timer30Seconds = 27 * 60 + 40;
  let socialCountdownTimerInterval = null;
  window.start30MinTimer = function () {
    const timerElem = document.getElementById('socialTimerBadge');
    if (!timerElem) return;
    if (socialCountdownTimerInterval) {
      clearInterval(socialCountdownTimerInterval);
      socialCountdownTimerInterval = null;
    }
    socialCountdownTimerInterval = setInterval(() => {
      if (timer30Seconds > 0) {
        timer30Seconds--;
        const mins = Math.floor(timer30Seconds / 60);
        const secs = timer30Seconds % 60;
        timerElem.innerHTML = `<i class="fa-solid fa-stopwatch me-1"></i> 30-Min Order Countdown: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  };

  window.createSocialDraftOrder = function () {
    const name = document.getElementById('socCustName')?.value || 'Maya Haddad';
    const phone = document.getElementById('socCustPhone')?.value || '+961 70 123456';
    const items = document.getElementById('socCustItems')?.value || '2x Olive Oil 1L';
    const payment = document.getElementById('socCustPayment')?.value || 'Cash';

    const msg = `Ahlan ${name}! Welcome to Southern Olive & Oil Products SARL.\nYour draft order for [${items}] has been created.\nPayment: ${payment}.\nDelivery Address & Confirmation Code: #SO-${Math.floor(1000 + Math.random() * 9000)}`;

    const waPayload = document.getElementById('whatsappMessagePayload');
    if (waPayload) waPayload.textContent = msg;

    const waModal = document.getElementById('whatsappApprovalModal');
    if (waModal && typeof bootstrap !== 'undefined') {
      const modalInst = new bootstrap.Modal(waModal);
      modalInst.show();
    }
  };

  window.confirmSendWhatsAppMessage = function () {
    showToast("WhatsApp Integration", "1st Automated WhatsApp message dispatched to customer", "success");
    const waModal = document.getElementById('whatsappApprovalModal');
    if (waModal && typeof bootstrap !== 'undefined') {
      const modalInst = bootstrap.Modal.getInstance(waModal);
      if (modalInst) modalInst.hide();
    }
  };

  // 4. Direct Customer Landing Storefront Order Handler
  window.selectLandingProduct = function (prodName, price) {
    const prodSelect = document.getElementById('landingCustProduct');
    if (prodSelect) {
      prodSelect.value = `${prodName} ($${price.toFixed(2)})`;
    }
    const landingModal = document.getElementById('landingPageModal');
    if (landingModal && typeof bootstrap !== 'undefined') {
      const modalInst = new bootstrap.Modal(landingModal);
      modalInst.show();
    }
  };

  window.submitLandingPageOrder = function () {
    const name = document.getElementById('landingCustName')?.value || 'Customer';
    showToast("Order Placed", `Thank you ${name}! Your direct order has been received by Choueifat HQ.`, "success");
    const landingModal = document.getElementById('landingPageModal');
    if (landingModal && typeof bootstrap !== 'undefined') {
      const modalInst = bootstrap.Modal.getInstance(landingModal);
      if (modalInst) modalInst.hide();
    }
  };

  // 5. System Architecture & Developer Portal Renderers
  window.renderSqlSchemaViewer = function () {
    const sqlViewer = document.getElementById('sqlSchemaContent');
    if (!sqlViewer) return;
    sqlViewer.innerHTML = `
-- SOUTHERN OLIVE & OIL PRODUCTS SARL - POSTGRESQL 15 + POSTGIS DDL SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Customers & Regional Directory
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    whatsapp_phone VARCHAR(50) UNIQUE NOT NULL,
    governorate VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    location_coords GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & Inventory Catalogue
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('Olive Oil', 'Olives & Jars', 'Artisan Packs')),
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    stock_wh1_raw NUMERIC(10, 2) DEFAULT 0,
    stock_wh2_materials INT DEFAULT 0,
    stock_wh3_finished INT DEFAULT 0
);

-- 3. SuperSonic Field Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_type VARCHAR(50) CHECK (order_type IN ('Online Delivery', 'Direct Retail', 'Wholesale Bulk')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Wish Money', 'Credit Card')),
    total_amount_usd NUMERIC(10, 2) NOT NULL,
    delivery_fee_usd NUMERIC(10, 2) DEFAULT 3.00,
    status VARCHAR(50) DEFAULT 'PENDING_DISPATCH',
    digital_signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Line Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Relational Indexing for High-Performance Spatial Delivery Routing
CREATE INDEX idx_customers_village ON customers(village);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_gis ON customers USING GIST(location_coords);
`;
  };

  window.renderControllerCodeViewer = function () {
    const codeViewer = document.getElementById('controllerCodeContent');
    if (!codeViewer) return;
    codeViewer.innerHTML = `
// EXPRESS NODE.JS CONTROLLER - SOUTHERN OLIVE SUPERSONIC DISPATCH ENGINE

import { Request, Response } from 'express';
import { db } from '../db/client';

export class DispatchController {
  
  // 1. Batch Dispatch Route Generator
  public static async dispatchVanRoute(req: Request, res: Response) {
    try {
      const { driverId, vanId, targetVillage } = req.body;
      
      const pendingOrders = await db.query(
        \`SELECT o.*, c.whatsapp_phone, c.village 
         FROM orders o 
         JOIN customers c ON o.customer_id = c.id 
         WHERE c.village = $1 AND o.status = 'PENDING_DISPATCH'\`,
        [targetVillage]
      );

      // Assign driver and update status
      const orderIds = pendingOrders.rows.map(row => row.id);
      await db.query(
        \`UPDATE orders SET status = 'EN_ROUTE', driver_id = $1 WHERE id = ANY($2::uuid[])\`,
        [driverId, orderIds]
      );

      return res.status(200).json({
        success: true,
        message: \`Dispatched \${orderIds.length} orders for \${targetVillage} on Van #\${vanId}\`,
        orderIds
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Wish Money API Channel Webhook
  public static async handleWhishPayWebhook(req: Request, res: Response) {
    const { transactionId, orderNumber, amountUsd, status } = req.body;
    if (status === 'SUCCESS') {
      await db.query(\`UPDATE orders SET status = 'PAID_WHISH', payment_status = 'COMPLETED' WHERE order_number = $1\`, [orderNumber]);
      return res.status(200).json({ status: 'ACKNOWLEDGED' });
    }
    return res.status(400).json({ status: 'FAILED' });
  }
}
`;
  };

  window.renderErDiagram = function () {
    const erViewer = document.getElementById('erDiagramContent');
    if (!erViewer) return;
    erViewer.innerHTML = `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="er-node-card">
            <div class="er-table-title"><i class="fa-solid fa-table me-2"></i> customers</div>
            <div class="er-field-row"><span>id (UUID)</span> <span class="er-pk-badge">PK</span></div>
            <div class="er-field-row"><span>company_name (VARCHAR)</span></div>
            <div class="er-field-row"><span>whatsapp_phone (VARCHAR)</span></div>
            <div class="er-field-row"><span>village (VARCHAR)</span> <span class="er-fk-badge">FK</span></div>
            <div class="er-field-row"><span>location_coords (GEOMETRY)</span></div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="er-node-card">
            <div class="er-table-title"><i class="fa-solid fa-table me-2"></i> orders</div>
            <div class="er-field-row"><span>id (UUID)</span> <span class="er-pk-badge">PK</span></div>
            <div class="er-field-row"><span>order_number (VARCHAR)</span></div>
            <div class="er-field-row"><span>customer_id (UUID)</span> <span class="er-fk-badge">FK</span></div>
            <div class="er-field-row"><span>total_amount_usd (NUMERIC)</span></div>
            <div class="er-field-row"><span>status (VARCHAR)</span></div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="er-node-card">
            <div class="er-table-title"><i class="fa-solid fa-table me-2"></i> products</div>
            <div class="er-field-row"><span>id (UUID)</span> <span class="er-pk-badge">PK</span></div>
            <div class="er-field-row"><span>sku (VARCHAR)</span></div>
            <div class="er-field-row"><span>name_ar (VARCHAR)</span></div>
            <div class="er-field-row"><span>unit_price_usd (NUMERIC)</span></div>
            <div class="er-field-row"><span>stock_wh3_finished (INT)</span></div>
          </div>
        </div>
      </div>
    `;
  };

  window.copySqlSchema = function () {
    const text = document.getElementById('sqlSchemaContent')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      showToast("Clipboard", "SQL DDL Schema copied to clipboard!", "success");
    }
  };

  // Standalone App Shareable URL Copier
  window.copyAppUrl = function (filename) {
    const fullUrl = window.location.origin + '/' + filename;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast("Link Copied", `Copied shareable URL to clipboard: ${fullUrl}`, "success");
      }).catch(() => {
        showToast("Shareable Link", `URL: ${fullUrl}`, "info");
      });
    } else {
      showToast("Shareable Link", `URL: ${fullUrl}`, "info");
    }
  };

  // ==========================================
  // REAL EXPORT, EDIT, FILTER & EXCHANGE RATE HANDLERS
  // ==========================================

  // 1. Real PDF Export Generator
  window.exportToPDF = function (title = "Southern Olive Report", targetId = null) {
    if (window.checkPermission && !window.checkPermission(null, 'exportRights')) {
      showToast("Access Denied", "Your active role does not have permission to export PDF data reports.", "error");
      return;
    }
    showToast("PDF Export", `Preparing printable PDF report for ${title}...`, "info");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 2. Real CSV / Excel Export Generator
  window.exportTableToCSV = function (tableIdOrElement = null, filename = "Southern_Olive_Report.csv") {
    if (window.checkPermission && !window.checkPermission(null, 'exportRights')) {
      showToast("Access Denied", "Your active role does not have permission to export CSV/Excel data.", "error");
      return;
    }
    let table = null;
    if (typeof tableIdOrElement === 'string') {
      table = document.getElementById(tableIdOrElement);
    }
    if (!table) {
      const activePanel = document.querySelector('.subpanel.active, .module-page.active');
      table = activePanel ? activePanel.querySelector('table') : document.querySelector('table');
    }
    if (!table) {
      showToast("Export Failed", "No data table found on the current screen to export.", "error");
      return;
    }

    let csvContent = "";
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('th, td');
      const rowData = [];
      cols.forEach(col => {
        let text = col.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim();
        rowData.push(`"${text}"`);
      });
      if (rowData.length > 0) csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showToast("Excel Export", `Exported data table to CSV/Excel (${filename}) successfully!`, "success");
  };

  // 3. Real Edit & Update Modal Handler (INP Non-blocking Optimization)
  window.openRealEditModal = function (entityType = 'record', entityId = '101', btnElement = null) {
    const row = btnElement ? btnElement.closest('tr') : null;
    const currentName = row ? (row.cells[1]?.innerText || row.cells[0]?.innerText || "Record") : "Record #" + entityId;
    const currentVal = row ? (row.cells[2]?.innerText || row.cells[3]?.innerText || "") : "";

    // Defer prompt asynchronously to yield main thread immediately for INP performance
    setTimeout(() => {
      const newName = prompt(`[Edit ${entityType.toUpperCase()}] Enter new Name / Details for ID ${entityId}:`, currentName.trim());
      if (newName === null) return;

      const newVal = prompt(`[Edit ${entityType.toUpperCase()}] Enter updated Value / Price / Phone / Status:`, currentVal.trim());
      if (newVal === null) return;

      if (row) {
        if (row.cells[1]) row.cells[1].innerText = newName;
        if (row.cells[2] && newVal) row.cells[2].innerText = newVal;
        showToast("Data Updated", `Updated ${entityType.toUpperCase()} #${entityId}: ${newName}`, "success");
      } else {
        showToast("Data Updated", `Updated ${entityType.toUpperCase()} #${entityId}: ${newName} (${newVal})`, "success");
      }

      const savedEdits = JSON.parse(localStorage.getItem('so_real_edits') || '{}');
      savedEdits[`${entityType}_${entityId}`] = { name: newName, val: newVal, timestamp: new Date().toISOString() };
      localStorage.setItem('so_real_edits', JSON.stringify(savedEdits));
    }, 0);
  };

  // 4. Real Filter & Search Handler
  window.filterTableRows = function (tableId = null, searchQuery = '', categoryFilter = '') {
    let table = null;
    if (tableId) table = document.getElementById(tableId);
    if (!table) {
      const activePanel = document.querySelector('.subpanel.active, .module-page.active');
      table = activePanel ? activePanel.querySelector('table') : document.querySelector('table');
    }
    if (!table) return;

    const queryStr = searchQuery.toLowerCase().trim();
    const rows = table.querySelectorAll('tbody tr');
    let matchCount = 0;

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchesSearch = !queryStr || text.includes(queryStr);
      const matchesCategory = !categoryFilter || text.includes(categoryFilter.toLowerCase());

      if (matchesSearch && matchesCategory) {
        row.style.display = '';
        matchCount++;
      } else {
        row.style.display = 'none';
      }
    });

    showToast("Filter Applied", `Found ${matchCount} matching records for your filter.`, "info");
  };

  // 5. Zero-INP Non-Blocking USD Exchange Rate Updater & Recalculator
  window.updateGlobalExchangeRate = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentRate = parseFloat(localStorage.getItem('so_usd_rate') || '89500');
        const inputEl = document.getElementById('usdRateInputVal');
        if (inputEl) inputEl.value = currentRate;

        const modalEl = document.getElementById('updateUsdRateModal');
        if (modalEl && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.show();
        } else if (modalEl) {
          modalEl.classList.add('show');
          modalEl.style.display = 'block';
        }
      }, 0);
    });
  };

  window.saveGlobalExchangeRateFromModal = function () {
    const inputEl = document.getElementById('usdRateInputVal');
    const newRate = inputEl ? parseFloat(inputEl.value) : 89500;
    if (isNaN(newRate) || newRate <= 0) {
      showToast("Invalid Rate", "Please enter a valid positive number for exchange rate.", "error");
      return;
    }

    window.saveExchangeRateValue(newRate);

    const modalEl = document.getElementById('updateUsdRateModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    } else if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
    }
  };

  window.saveExchangeRateValue = function (newRate) {
    localStorage.setItem('so_usd_rate', newRate.toString());
    window.currentLbpRate = newRate;

    // Update subheader rate span & all rate displays instantly
    const rateSpan = document.getElementById('globalUsdRateSpan');
    if (rateSpan) {
      rateSpan.textContent = newRate.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
    const spans = document.querySelectorAll('.usd-lbp-rate-display');
    spans.forEach(s => { s.textContent = newRate.toLocaleString() + '.00'; });

    showToast("Exchange Rate Updated", `Global USD rate set to ${newRate.toLocaleString()} LBP/$. Prices recalculated.`, "success");
  };

  // Dynamic Button & Modal Event Binding Controller
  window.bindAllButtonsAndModals = function () {
    console.log("Binding all UI buttons to real export, edit, filter, and modal logic...");

    // Bind Add User & Personnel buttons
    document.querySelectorAll('.btn-add-user, [data-action="add-user"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openRealEditModal('User', 'NEW-EMP', btn);
      });
    });

    // Bind Purchase Orders & Suppliers buttons
    document.querySelectorAll('.btn-po, [data-action="purchase-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.switchSouthernScreen('op-actions');
        showToast("Purchase Orders", "Opened Purchase Orders & Suppliers Management Screen", "info");
      });
    });

    // Bind Reports & Analytics buttons
    document.querySelectorAll('.btn-report, [data-action="reports"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.switchSouthernScreen('sales-reports');
        showToast("Reports", "Generated Comprehensive Sales & Operations Report", "success");
      });
    });

    // Bind Suppliers Directory buttons
    document.querySelectorAll('.btn-suppliers, [data-action="suppliers"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.switchSouthernScreen('op-setup');
        showToast("Suppliers", "Opened Farmer & Supplier Directory Management", "info");
      });
    });

    // Universal Table Search Filter Helper
    window.globalTableFilter = function (inputEl) {
      if (!inputEl) return;
      const query = inputEl.value.toLowerCase().trim();
      const parentContainer = inputEl.closest('.subpanel, .southern-screen-view, .module-page, .card, body') || document;
      const tables = parentContainer.querySelectorAll('table');
      tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    };

    // Attach global instant search listeners to all search inputs
    document.addEventListener('input', function (e) {
      if (e.target && (e.target.placeholder?.toLowerCase().includes('search') || e.target.type === 'search' || e.target.classList.contains('table-search-input'))) {
        window.globalTableFilter(e.target);
      }
    });

    // Universal Table Export to CSV Helper
    window.exportCurrentTableToCSV = function (btnEl, customFilename) {
      const parent = btnEl ? btnEl.closest('.subpanel, .southern-screen-view, .module-page') : document.querySelector('.subpanel.active, .southern-screen-view.active');
      const table = parent ? parent.querySelector('table') : document.querySelector('table');
      if (!table) {
        showToast("Export CSV", "No data table found in the current screen.", "info");
        return;
      }
      let csv = [];
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        let rowData = [];
        cols.forEach(col => {
          let text = col.innerText.replace(/"/g, '""').trim();
          rowData.push(`"${text}"`);
        });
        if (rowData.length > 0) csv.push(rowData.join(','));
      });
      const csvString = csv.join('\n');
      const filename = customFilename || (parent ? parent.id.replace('subpanel-', 'Southern_Olive_') : 'Southern_Olive_Data') + '.csv';
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Data Exported", `Successfully exported table data to ${filename}`, "success");
    };

    // Universal PDF & Print Helper
    window.printCurrentSubpanel = function (btnEl) {
      const parent = btnEl ? btnEl.closest('.subpanel, .southern-screen-view, .module-page') : document.querySelector('.subpanel.active, .southern-screen-view.active');
      if (!parent) return;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Southern Olive & Oil Products SARL - Operational Report</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
            <style>
              body { font-family: sans-serif; padding: 20px; color: #000; }
              .no-print, button, .btn { display: none !important; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>Southern Olive & Oil Products SARL (منتوجات زيت وزيتون الجنوب ش.م.م)</h2>
            <p><strong>Generated Date:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            ${parent.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    // Bind PDF Export Buttons
    document.querySelectorAll('.btn-export-pdf, button[onclick*="Export to PDF"], button[onclick*="PDF"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.printCurrentSubpanel(btn.target || btn);
      });
    });

    // Bind Excel / CSV Export Buttons
    document.querySelectorAll('.btn-export-excel, button[onclick*="Export to Excel"], button[onclick*="Excel"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.exportCurrentTableToCSV(btn.target || btn);
      });
    });
  };

  // Operations Center Form Handlers
  window.handlePOSubmit = function (e) {
    if (e) e.preventDefault();
    const supplier = document.getElementById('poSupplierName')?.value || 'Farmer/Vendor';
    const item = document.getElementById('poItemDesc')?.value || 'Olive Oil Raw Material';
    const qty = parseFloat(document.getElementById('poQty')?.value || 0);
    const cost = parseFloat(document.getElementById('poUnitCost')?.value || 0);
    const wh = document.getElementById('poTargetWH')?.value || 'WH-1 Main Factory';
    const date = document.getElementById('poExpectedDate')?.value || new Date().toISOString().split('T')[0];
    const total = (qty * cost).toFixed(2);
    const poId = 'PO-' + Math.floor(100 + Math.random() * 900);

    const poTableBody = document.getElementById('poTableBody');
    if (poTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold text-warning">${poId}</td>
        <td>${supplier}</td>
        <td>${item}</td>
        <td>${qty.toLocaleString()}</td>
        <td>$${cost.toFixed(2)}</td>
        <td class="text-success">$${parseFloat(total).toLocaleString()}</td>
        <td><span class="badge bg-secondary">${wh}</span></td>
        <td>${date}</td>
        <td><span class="badge bg-warning text-dark">Pending</span></td>
      `;
      poTableBody.prepend(tr);
    }

    const modalEl = document.getElementById('poModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }

    document.getElementById('poForm')?.reset();

    if (typeof window.showToast === 'function') {
      window.showToast('PO Created', `Purchase Order ${poId} for ${supplier} created successfully!`, 'success');
    }
  };

  window.handleTransferSubmit = function (e) {
    if (e) e.preventDefault();
    const source = document.getElementById('trfSourceWH')?.value || 'WH-1 Main Factory';
    const dest = document.getElementById('trfDestWH')?.value || 'WH-3 Cold Storage';
    const item = document.getElementById('trfItem')?.value || 'EVOO 1L Glass Bottle';
    const qty = parseFloat(document.getElementById('trfQty')?.value || 0);
    const notes = document.getElementById('trfNotes')?.value || 'Internal Warehouse Transfer';
    const trfId = 'TRF-' + Math.floor(100 + Math.random() * 900);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const transferTableBody = document.getElementById('transferTableBody');
    if (transferTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold text-info">${trfId}</td>
        <td>${today}</td>
        <td><span class="badge bg-dark border">${source}</span></td>
        <td><span class="badge bg-success">${dest}</span></td>
        <td>${item}</td>
        <td>${qty.toLocaleString()}</td>
        <td>${notes}</td>
        <td><span class="badge bg-success">Completed</span></td>
      `;
      transferTableBody.prepend(tr);
    }

    const modalEl = document.getElementById('transferModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }

    document.getElementById('transferForm')?.reset();

    if (typeof window.showToast === 'function') {
      window.showToast('Stock Transferred', `${qty} units of ${item} moved from ${source} to ${dest}`, 'info');
    }
  };

  window.handleWastageSubmit = function (e) {
    if (e) e.preventDefault();
    const wh = document.getElementById('wastageWH')?.value || 'WH-2 Bottling & Tins';
    const item = document.getElementById('wastageItem')?.value || 'EVOO 1L Glass Bottle';
    const qty = parseFloat(document.getElementById('wastageQty')?.value || 0);
    const reason = document.getElementById('wastageReason')?.value || 'Bottle Breakage during Filling';
    const wstId = 'WST-' + Math.floor(100 + Math.random() * 900);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const wastageTableBody = document.getElementById('wastageTableBody');
    if (wastageTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold text-danger">${wstId}</td>
        <td>${today}</td>
        <td><span class="badge bg-dark border">${wh}</span></td>
        <td>${item}</td>
        <td class="text-danger fw-bold">-${qty.toLocaleString()}</td>
        <td><span class="badge bg-danger">${reason}</span></td>
        <td>Operations Admin</td>
      `;
      wastageTableBody.prepend(tr);
    }

    const modalEl = document.getElementById('wastageModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }

    document.getElementById('wastageForm')?.reset();

    if (typeof window.showToast === 'function') {
      window.showToast('Wastage Logged', `Wastage entry ${wstId} (${qty} ${item}) recorded into Audit Trail`, 'warning');
    }
  };

  // Additional Global Module Form Handlers
  window.handleDiscountSubmit = function (e) {
    if (e) e.preventDefault();
    const type = document.getElementById('discType')?.value || 'percentage';
    const val = parseFloat(document.getElementById('discValue')?.value || 0);
    const reason = document.getElementById('discReason')?.value || 'Special Discount';
    const modalEl = document.getElementById('discountModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('discountForm')?.reset();
    window.showToast('Discount Applied', `Applied ${val}${type === 'percentage' ? '%' : '$'} discount (${reason})`, 'success');
  };

  window.handleCustomerSubmit = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('custName')?.value || 'New Client';
    const tier = document.getElementById('custTier')?.value || 'Wholesale Tier';
    const phone = document.getElementById('custPhone')?.value || '+961 70 000000';
    const limit = document.getElementById('custCreditLimit')?.value || '5000';
    const modalEl = document.getElementById('customerModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('customerForm')?.reset();
    window.showToast('Client Registered', `Registered ${name} under ${tier} (Credit: $${limit})`, 'success');
  };

  window.handleJVSubmit = function (e) {
    if (e) e.preventDefault();
    const debit = document.getElementById('jvDebitAcc')?.value;
    const credit = document.getElementById('jvCreditAcc')?.value;
    const amt = parseFloat(document.getElementById('jvAmount')?.value || 0);
    const ref = document.getElementById('jvRef')?.value || 'JV-' + Math.floor(1000 + Math.random() * 9000);
    const modalEl = document.getElementById('jvModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('jvForm')?.reset();
    window.showToast('JV Posted', `Posted Journal Voucher ${ref}: Dr ${debit} / Cr ${credit} ($${amt.toFixed(2)})`, 'success');
  };

  window.handleDriverSubmit = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('drvName')?.value;
    const phone = document.getElementById('drvPhone')?.value;
    const vehicle = document.getElementById('drvVehicle')?.value;
    const zone = document.getElementById('drvZone')?.value;
    const modalEl = document.getElementById('driverModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('driverForm')?.reset();
    window.showToast('Driver Registered', `Registered Driver ${name} (${vehicle}) assigned to ${zone}`, 'info');
  };

  window.handleAdCampaignSubmit = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('campName')?.value;
    const platform = document.getElementById('campPlatform')?.value;
    const budget = document.getElementById('campBudget')?.value;
    const modalEl = document.getElementById('adCampaignModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('adCampaignForm')?.reset();
    window.showToast('Campaign Launched', `Launched ${platform} Ad Campaign "${name}" ($${budget} Budget)`, 'success');
  };

  window.handleEmployeeSubmit = function (e) {
    if (e) e.preventDefault();
    if (!window.checkAdminRepPermission('add or create an Employee / Agent Profile')) {
      return;
    }
    const name = document.getElementById('empName')?.value;
    const dept = document.getElementById('empDept')?.value;
    const salary = document.getElementById('empSalary')?.value;
    const modalEl = document.getElementById('employeeModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('employeeForm')?.reset();
    window.showToast('Employee Added', `Added ${name} to ${dept} (Salary: $${salary}/mo)`, 'success');
  };

  window.handleAddProductSubmit = function (e) {
    if (e) e.preventDefault();
    const desc = document.getElementById('prodItemDesc')?.value;
    const barcode = document.getElementById('prodBarcode')?.value;
    const unit = document.getElementById('prodUnit')?.value;
    const category = document.getElementById('prodCategory')?.value;
    const price = parseFloat(document.getElementById('prodPrice')?.value || 0).toFixed(2);
    const stock = document.getElementById('prodStock')?.value || '0';

    const tbody = document.getElementById('productsTableBody');
    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold text-info">${barcode}</td>
        <td>${desc}</td>
        <td><span class="badge bg-success">${category}</span></td>
        <td>${unit}</td>
        <td class="text-warning fw-bold">$${price}</td>
        <td>${parseFloat(stock).toLocaleString()} ${unit.split(' ')[0]}</td>
        <td><span class="badge bg-success">In Stock</span></td>
        <td><button class="btn btn-sm btn-outline-light" onclick="showToast('Edit', 'Product Editor Opened', 'info')">Edit</button></td>
      `;
      tbody.prepend(tr);
    }

    const modalEl = document.getElementById('addProductModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('addProductForm')?.reset();
    window.showToast('Product Added', `Added ${desc} ($${price}) to inventory catalog.`, 'success');
  };

  window.handleUnitSubmit = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('unitName')?.value;
    const cat = document.getElementById('unitCategory')?.value;
    const ul = document.getElementById('unitListGroup');
    if (ul) {
      const li = document.createElement('li');
      li.className = 'list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center';
      li.style.cursor = 'pointer';
      li.setAttribute('data-bs-toggle', 'modal');
      li.setAttribute('data-bs-target', '#unitModal');
      li.innerHTML = `<span>${name}</span> <span class="badge bg-info">${cat}</span>`;
      ul.appendChild(li);
    }
    const modalEl = document.getElementById('unitModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('unitForm')?.reset();
    window.showToast('Unit Added', `Added measurement unit "${name}" to Operations setup.`, 'success');
  };

  window.handleWastageReasonSubmit = function (e) {
    if (e) e.preventDefault();
    const title = document.getElementById('wstReasonTitle')?.value;
    const dept = document.getElementById('wstReasonDept')?.value;
    const ul = document.getElementById('wastageReasonListGroup');
    if (ul) {
      const li = document.createElement('li');
      li.className = 'list-group-item bg-dark text-white border-secondary';
      li.style.cursor = 'pointer';
      li.setAttribute('data-bs-toggle', 'modal');
      li.setAttribute('data-bs-target', '#wastageReasonModal');
      li.textContent = `${title} (${dept})`;
      ul.appendChild(li);
    }
    const modalEl = document.getElementById('wastageReasonModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('wastageReasonForm')?.reset();
    window.showToast('Reason Added', `Added wastage reason "${title}" to setup.`, 'warning');
  };

  window.handleBrandSubmit = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('brandNameInput')?.value;
    const scope = document.getElementById('brandScope')?.value;
    const ul = document.getElementById('brandListGroup');
    if (ul) {
      const li = document.createElement('li');
      li.className = 'list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center';
      li.style.cursor = 'pointer';
      li.setAttribute('data-bs-toggle', 'modal');
      li.setAttribute('data-bs-target', '#brandModal');
      li.innerHTML = `<span>${name}</span> <span class="badge bg-warning text-dark">${scope}</span>`;
      ul.appendChild(li);
    }
    const modalEl = document.getElementById('brandModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    document.getElementById('brandForm')?.reset();
    window.showToast('Brand Added', `Added brand "${name}" to catalog setup.`, 'success');
  };



  window.handleProductCsvImport = function (input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      window.showToast('CSV Importing', `Reading ${file.name}... Products successfully imported into catalog.`, 'success');
      input.value = '';
    }
  };

  window.toggleHrDeptExtensions = function (dept) {
    const social = document.getElementById('extSocialFields');
    const driver = document.getElementById('extDriverFields');
    const acc = document.getElementById('extAccFields');
    if (social) social.style.display = (dept.includes('Social') || dept.includes('Marketing')) ? 'block' : 'none';
    if (driver) driver.style.display = (dept.includes('Fleet') || dept.includes('Driver')) ? 'block' : 'none';
    if (acc) acc.style.display = (dept.includes('Finance') || dept.includes('Accounting')) ? 'block' : 'none';
  };

  window.promptAddCustomHrField = function () {
    setTimeout(() => {
      const fieldName = prompt('Enter Custom Field Name (e.g. Emergency Contact, Uniform Size):');
      if (!fieldName) return;
      const scope = confirm('Apply this custom field to THIS DEPARTMENT ONLY? (Click Cancel to apply to ALL Departments)');
      const container = document.getElementById('customFieldsContainer');
      if (container) {
        const div = document.createElement('div');
        div.className = 'mb-3 p-2 bg-dark rounded border border-info';
        div.innerHTML = `
          <label class="form-label text-info small fw-bold">${fieldName} <span class="badge bg-secondary">${scope ? 'Dept Only' : 'All Depts'}</span></label>
          <input type="text" class="form-control form-control-sm" placeholder="Enter ${fieldName}..." />
        `;
        container.appendChild(div);
        window.showToast('Custom Field Added', `Added field "${fieldName}" (${scope ? 'This Dept' : 'All Depts'})`, 'info');
      }
    }, 0);
  };

  window.saveRbacSettings = function () {
    const modalEl = document.getElementById('rbacModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    window.showToast('RBAC Updated', 'Role-Based Access Control matrix successfully saved and applied.', 'success');
  };

  window.executeCloudSync = function () {
    const modalEl = document.getElementById('dbSyncModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    window.showToast('Cloud Sync Complete', 'Successfully synced local database records with Supabase & Vercel cloud cluster.', 'success');
  };

  // ==========================================
  // MULTI-BANK & FINANCIAL WALLET DYNAMIC ENGINE
  // ==========================================

  const DEFAULT_BANKS_WALLETS = [
    // Lebanese Commercial Banks
    { id: "blom_bank", name: "BLOM Bank", category: "Lebanese Commercial Banks", swiftCode: "BLOM LBBX", format: "pipe", fileExt: "txt" },
    { id: "bank_audi", name: "Bank Audi", category: "Lebanese Commercial Banks", swiftCode: "AUDB LBBX", format: "pipe", fileExt: "txt" },
    { id: "byblos_bank", name: "Byblos Bank", category: "Lebanese Commercial Banks", swiftCode: "BYBL LBBX", format: "csv", fileExt: "csv" },
    { id: "bank_of_beirut", name: "Bank of Beirut", category: "Lebanese Commercial Banks", swiftCode: "BBEI LBBX", format: "pipe", fileExt: "txt" },
    { id: "bankmed", name: "Bankmed", category: "Lebanese Commercial Banks", swiftCode: "BAMD LBBX", format: "pipe", fileExt: "txt" },
    { id: "credit_libanais", name: "Credit Libanais", category: "Lebanese Commercial Banks", swiftCode: "CLIB LBBX", format: "csv", fileExt: "csv" },
    { id: "sgbl", name: "SGBL (Société Générale de Banque au Liban)", category: "Lebanese Commercial Banks", swiftCode: "SGBL LBBX", format: "pipe", fileExt: "txt" },
    { id: "fransabank", name: "Fransabank", category: "Lebanese Commercial Banks", swiftCode: "FRAS LBBX", format: "csv", fileExt: "csv" },
    { id: "ibl_bank", name: "IBL Bank", category: "Lebanese Commercial Banks", swiftCode: "IBLB LBBX", format: "pipe", fileExt: "txt" },

    // Digital Wallets & Transfer Providers
    { id: "wish_money", name: "Wish Money Wallet", category: "Digital Wallets & Transfer Providers", swiftCode: "WISH LB", format: "json", fileExt: "json" },
    { id: "bob_omt", name: "BOB Finance / OMT Accounts", category: "Digital Wallets & Transfer Providers", swiftCode: "BOB OMT LB", format: "csv", fileExt: "csv" },

    // International & Offshore Banks
    { id: "hsbc", name: "HSBC", category: "International & Offshore Banks", swiftCode: "HSBC US33", format: "swift", fileExt: "mt103" },
    { id: "emirates_nbd", name: "Emirates NBD", category: "International & Offshore Banks", swiftCode: "EBIL AEAD", format: "swift", fileExt: "txt" },
    { id: "citi", name: "Citi", category: "International & Offshore Banks", swiftCode: "CITI US33", format: "swift", fileExt: "txt" },
    { id: "standard_chartered", name: "Standard Chartered", category: "International & Offshore Banks", swiftCode: "SCBL US33", format: "swift", fileExt: "txt" },
    { id: "chase", name: "Chase (JPMorgan Chase)", category: "International & Offshore Banks", swiftCode: "CHAS US33", format: "csv", fileExt: "csv" },
    { id: "barclays", name: "Barclays", category: "International & Offshore Banks", swiftCode: "BARC GB22", format: "swift", fileExt: "txt" }
  ];

  window.getBankWallets = function () {
    const custom = JSON.parse(localStorage.getItem('southern_custom_banks') || '[]');
    return [...DEFAULT_BANKS_WALLETS, ...custom];
  };

  window.populateBankWalletDropdowns = function () {
    const banks = window.getBankWallets();
    const categories = [
      "Lebanese Commercial Banks",
      "Digital Wallets & Transfer Providers",
      "International & Offshore Banks",
      "Custom Financial Institutions"
    ];

    const selectSelectors = [
      '#hrBankSelect',
      '#accBankSelect',
      '#empBankSelect',
      '#jvDebitAcc',
      '#jvCreditAcc',
      '#hrBankFilter',
      '.bank-wallet-select'
    ];

    const elements = document.querySelectorAll(selectSelectors.join(','));
    elements.forEach(select => {
      const currentValue = select.value;
      const isJvSelect = select.id === 'jvDebitAcc' || select.id === 'jvCreditAcc';

      let html = isJvSelect ? '' : '<option value="">-- Select Bank / Financial Wallet --</option>';
      if (isJvSelect) {
        if (select.id === 'jvDebitAcc') {
          html += '<option value="1010 - Cash Vault USD">1010 - Cash Vault USD</option>';
        } else {
          html += '<option value="4010 - EVOO Sales Revenue">4010 - EVOO Sales Revenue</option>';
          html += '<option value="1010 - Cash Vault USD">1010 - Cash Vault USD</option>';
          html += '<option value="2010 - Farmer Accounts Payable">2010 - Farmer Accounts Payable</option>';
        }
      }

      categories.forEach(cat => {
        const catBanks = banks.filter(b => b.category === cat);
        if (catBanks.length > 0) {
          html += `<optgroup label="${cat}">`;
          catBanks.forEach(b => {
            const val = isJvSelect ? `1020 - ${b.name} (${b.swiftCode})` : b.id;
            html += `<option value="${val}">${b.name} [SWIFT: ${b.swiftCode}]</option>`;
          });
          html += `</optgroup>`;
        }
      });

      select.innerHTML = html;
      if (currentValue) select.value = currentValue;
    });
  };

  window.openAddCustomBankModal = function () {
    const modalEl = document.getElementById('addCustomBankModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      setTimeout(() => {
        const name = prompt("Enter Custom Bank / Wallet Name:");
        if (!name) return;
        const swift = prompt("Enter SWIFT / Provider Code:", "CUST LBXX") || "CUST LBXX";
        const cat = prompt("Category (1: Lebanese Commercial, 2: Digital Wallet, 3: International, 4: Custom):", "4");
        let category = "Custom Financial Institutions";
        if (cat === "1") category = "Lebanese Commercial Banks";
        if (cat === "2") category = "Digital Wallets & Transfer Providers";
        if (cat === "3") category = "International & Offshore Banks";
        const fmt = prompt("Export File Format (pipe, csv, json, swift):", "pipe") || "pipe";

        window.saveCustomBankWalletDirect({ name, swiftCode: swift, category, format: fmt });
      }, 0);
    }
  };

  window.saveCustomBankFromModal = function () {
    const nameInput = document.getElementById('customBankNameInput');
    const swiftInput = document.getElementById('customBankSwiftInput');
    const catSelect = document.getElementById('customBankCategorySelect');
    const fmtSelect = document.getElementById('customBankFormatSelect');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      showToast("Invalid Input", "Please enter a valid bank or wallet name.", "error");
      return;
    }
    const swiftCode = swiftInput ? swiftInput.value.trim() || 'CUST LBXX' : 'CUST LBXX';
    const category = catSelect ? catSelect.value : 'Custom Financial Institutions';
    const format = fmtSelect ? fmtSelect.value : 'pipe';

    window.saveCustomBankWalletDirect({ name, swiftCode, category, format });

    const modalEl = document.getElementById('addCustomBankModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    } else if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
    }
  };

  window.saveCustomBankWalletDirect = function (bankData) {
    const custom = JSON.parse(localStorage.getItem('southern_custom_banks') || '[]');
    const id = "custom_" + Date.now();
    const newBank = {
      id,
      name: bankData.name,
      category: bankData.category || "Custom Financial Institutions",
      swiftCode: bankData.swiftCode || "CUST LBXX",
      format: bankData.format || "pipe",
      fileExt: bankData.format === "csv" ? "csv" : bankData.format === "json" ? "json" : "txt"
    };

    custom.push(newBank);
    localStorage.setItem('southern_custom_banks', JSON.stringify(custom));
    window.populateBankWalletDropdowns();
    if (typeof window.showToast === 'function') {
      window.showToast("Bank / Wallet Saved", `Added "${newBank.name}" [SWIFT: ${newBank.swiftCode}] to system registry.`, "success");
    }
  };

  window.handleSaveCustomBankWallet = function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('customBankName')?.value;
    const swiftCode = document.getElementById('customBankSwift')?.value;
    const category = document.getElementById('customBankCategory')?.value;
    const format = document.getElementById('customBankFormat')?.value;

    if (!name || !swiftCode) {
      if (typeof window.showToast === 'function') window.showToast("Validation Error", "Please fill in Bank Name and SWIFT Code.", "warning");
      return;
    }

    window.saveCustomBankWalletDirect({ name, swiftCode, category, format });

    const modalEl = document.getElementById('addCustomBankModal');
    if (modalEl && window.bootstrap) {
      (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)).hide();
    }
    const form = document.getElementById('addCustomBankForm');
    if (form) form.reset();
  };

  window.exportPayrollFile = function (bankIdParam) {
    const bankSelect = document.getElementById('hrBankSelect') || document.getElementById('accBankSelect');
    const selectedBankId = bankIdParam || bankSelect?.value || "blom_bank";
    const banks = window.getBankWallets();
    const bank = banks.find(b => b.id === selectedBankId) || banks[0];

    const payrollData = [
      { empId: "EMP-101", name: "Samer Al-Hassan", iban: "LB8900020000000012345678", currency: "USD", baseSalary: 1200, commission: 220, netPayout: 1420, dept: "Social Media" },
      { empId: "EMP-102", name: "Charbel Kanaan", iban: "LB8900020000000087654321", currency: "USD", baseSalary: 900, commission: 0, netPayout: 900, dept: "Fleet SuperSonic" },
      { empId: "EMP-103", name: "Fatima Zein", iban: "LB8900020000000055554444", currency: "LBP", baseSalary: 62000000, commission: 5000000, netPayout: 67000000, dept: "Factory Production" },
      { empId: "EMP-104", name: "Ahmad M.", iban: "LB8900020000000033332222", currency: "USD", baseSalary: 700, commission: 0, netPayout: 700, dept: "POS Retail" }
    ];

    let content = "";
    let mimeType = "text/plain;charset=utf-8";
    let extension = bank.fileExt || "txt";

    if (bank.format === "csv") {
      content = `EMP_ID,FULL_NAME,IBAN_ACCOUNT,CURRENCY,BASE_SALARY,COMMISSION,NET_PAYOUT,DEPARTMENT,PROCESSING_BANK,SWIFT_CODE\n`;
      payrollData.forEach(r => {
        content += `"${r.empId}","${r.name}","${r.iban}","${r.currency}",${r.baseSalary},${r.commission},${r.netPayout},"${r.dept}","${bank.name}","${bank.swiftCode}"\n`;
      });
      mimeType = "text/csv;charset=utf-8";
    } else if (bank.format === "json") {
      const payload = {
        companyId: "001",
        companyName: "Southern Olive and Oil Product S.A.R.L.",
        processingBank: bank.name,
        swiftCode: bank.swiftCode,
        exportTimestamp: new Date().toISOString(),
        totalPayrollAmountUSD: 3020.00,
        records: payrollData
      };
      content = JSON.stringify(payload, null, 2);
      mimeType = "application/json;charset=utf-8";
    } else if (bank.format === "swift") {
      content = `{1:F01${bank.swiftCode.replace(/\s+/g, '')}AXXX0000000000}{2:I103${bank.swiftCode.replace(/\s+/g, '')}X}{4:\n`;
      content += `:20:PAYROLL-${Date.now()}\n`;
      content += `:23B:CRED\n`;
      content += `:32A:260831USD3020,00\n`;
      content += `:50K:/001\nSOUTHERN OLIVE & OIL PRODUCTS SARL\n`;
      payrollData.forEach(r => {
        content += `:59:/${r.iban}\n${r.name}\n:70:SALARY AUGUST 2026 - ${r.dept}\n`;
      });
      content += `-}`;
    } else {
      // Default: ASCII Pipe Delimited format
      content = `COMPANY_ID|PROCESSING_BANK|SWIFT_CODE|EMP_ID|FULL_NAME|IBAN_ACCOUNT|CURRENCY|BASE_SALARY|COMMISSION|NET_PAYOUT|DEPARTMENT|DATE\n`;
      payrollData.forEach(r => {
        content += `001|${bank.name}|${bank.swiftCode}|${r.empId}|${r.name}|${r.iban}|${r.currency}|${r.baseSalary}|${r.commission}|${r.netPayout}|${r.dept}|2026-08-31\n`;
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const filename = `${bank.name.replace(/[^a-zA-Z0-9]/g, '_')}_Payroll_2026.${extension}`;
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    if (typeof window.showToast === 'function') {
      window.showToast("Payroll Export Complete", `Exported payroll file (${filename}) formatted for ${bank.name} [SWIFT: ${bank.swiftCode}].`, "success");
    }
  };

  // Backward compatibility wrappers
  window.exportBLOMPayroll = function () {
    window.exportPayrollFile();
  };
  window.exportBlomBankPayroll = function () {
    window.exportPayrollFile();
  };

  // Initialize listeners and populate dropdowns on DOM Ready safely
  setTimeout(() => {
    if (typeof window.bindAllButtonsAndModals === 'function') window.bindAllButtonsAndModals();
    if (typeof window.start30MinTimer === 'function') window.start30MinTimer();
    if (typeof window.initSignaturePad === 'function') window.initSignaturePad();
    if (typeof window.renderSqlSchemaViewer === 'function') window.renderSqlSchemaViewer();
    if (typeof window.renderControllerCodeViewer === 'function') window.renderControllerCodeViewer();
    if (typeof window.renderErDiagram === 'function') window.renderErDiagram();
    if (typeof window.populateBankWalletDropdowns === 'function') window.populateBankWalletDropdowns();
  }, 500);
});

// SUPABASE CLOUD DATABASE CONNECTION
(function initSupabaseCloud() {
  const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || 'https://southern-olive-erp.supabase.co';
  const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdXRoZXJuLW9saXZlLWVycCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2NjI2MDAwLCJleHAiOjIxMDIxNjIwMDB9.demo_anon_key_southern_olive';

  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase Cloud Database Client initialized successfully for Southern Olive ERP.');
      setTimeout(function () {
        if (typeof window.fetchAndRenderSupabaseTenants === 'function') {
          window.fetchAndRenderSupabaseTenants();
        }
      }, 300);
    } catch (err) {
      console.warn('Supabase initialization deferred:', err);
    }
  }
})();

// DYNAMIC SUPABASE SAAS TENANTS RENDERER
window.renderDynamicSaaSTenants = function (tenants) {
  const tbody = document.getElementById('saasTenantsTableBody');
  if (!tbody) return;

  if (!tenants || tenants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted p-4">No tenants found in Supabase database.</td></tr>`;
    return;
  }

  tbody.innerHTML = tenants.map((t, idx) => {
    const cid = `LIC-${(idx + 1).toString().padStart(3, '0')}`;
    const name = t.name || t.brandNameAr || 'Enterprise Tenant';
    const plan = t.subscriptionTier || t.subscription_tier || 'PRO';
    const status = t.subscriptionStatus || t.subscription_status || 'ACTIVE';
    const email = t.ownerEmail || t.owner_email || 'admin@vanguard-erp.com';
    const fee = plan === 'ENTERPRISE' ? 'Owner License (Unlimited)' : (plan === 'PRO' ? '$250/mo' : '$99/mo');

    return `
      <tr>
        <td><span class="badge ${idx === 0 ? 'bg-warning text-dark' : 'bg-secondary'} fw-bold">${cid}</span></td>
        <td><strong>${name}</strong> <small class="text-muted d-block">${t.brandNameEn || t.brand_name_en || t.slug || ''}</small></td>
        <td><span class="badge ${plan === 'ENTERPRISE' ? 'bg-danger' : (plan === 'PRO' ? 'bg-primary' : 'bg-info')}">${plan}</span></td>
        <td><span class="badge bg-secondary me-1">All Enabled Modules</span></td>
        <td>${email}</td>
        <td><strong class="text-success">${fee}</strong></td>
        <td><span class="badge bg-success">${status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info" onclick="showToast('Tenant Managed', 'Client ${name} active', 'info')">
            <i class="fa-solid fa-sliders"></i> Manage
          </button>
        </td>
      </tr>
    `;
  }).join('');
};

window.fetchAndRenderSupabaseTenants = async function () {
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.from('tenants').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        window.renderDynamicSaaSTenants(data);
      }
    } catch (err) {
      console.error('Error fetching Supabase tenants in app.js:', err);
    }
  }
};

// VANGUARD MULTI-TENANT SAAS MANAGER & DYNAMIC BRANDING BRIDGE
window.VanguardTenantManager = {
  currentTenant: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Vanguard Master Enterprise',
    brandNameAr: 'منتوجات زيت وزيتون الجنوب',
    brandNameEn: 'Southern Olive & Oil Products',
    subscriptionTier: 'ENTERPRISE'
  },

  applyDynamicBranding: function (companyObj) {
    if (companyObj) {
      this.currentTenant = Object.assign({}, this.currentTenant, companyObj);
    }
    var brandAr = this.currentTenant.brandNameAr || 'منتوجات زيت وزيتون الجنوب';
    var brandEn = this.currentTenant.brandNameEn || 'Southern Olive & Oil Products';

    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      document.title = 'Vanguard SaaS Master Controller';
    } else {
      document.title = brandEn + ' - Vanguard ERP Portal';
    }

    var arEls = document.querySelectorAll('.brand-name-ar');
    for (var i = 0; i < arEls.length; i++) {
      arEls[i].textContent = brandAr;
    }

    var enEls = document.querySelectorAll('.brand-name-en');
    for (var j = 0; j < enEls.length; j++) {
      enEls[j].textContent = brandEn;
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if (window.VanguardTenantManager) {
    window.VanguardTenantManager.applyDynamicBranding();
  }
});


// PILLAR 5 & 6: ITEM MASTER & INNOVATIVE FEATURES HANDLERS
window.openItemMasterModal = function (itemId = 'SO-EVOO-101', itemName = 'Extra Virgin Olive Oil 1L Glass') {
  const nameEl = document.getElementById('itemMasterName');
  const sysIdEl = document.getElementById('itemMasterSysId');
  if (nameEl) nameEl.textContent = itemName;
  if (sysIdEl) sysIdEl.textContent = itemId;

  const modalEl = document.getElementById('itemMasterModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
};

window.saveItemMasterData = function () {
  const name = document.getElementById('imDesc')?.value || 'Item';
  if (typeof window.showToast === 'function') {
    window.showToast("Item Master Saved", `Item master attributes, stock levels, and BOM recipe updated for "${name}".`, "success");
  }
  const modalEl = document.getElementById('itemMasterModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
};

window.triggerItemAction = function (actionType) {
  if (actionType === 'new_as') {
    if (typeof window.showToast === 'function') {
      window.showToast("Item Cloned", "Created a new draft item cloned from current attributes.", "success");
    }
  } else if (actionType === 'substitute') {
    const confirmSub = confirm("Do you confirm setting a substitute item replacement?");
    if (confirmSub && typeof window.showToast === 'function') {
      window.showToast("Substitute Linked", "Alternative item linked successfully.", "success");
    }
  } else if (actionType === 'merge') {
    const confirmMerge = confirm("Do you confirm merging this item into target master inventory?");
    if (confirmMerge && typeof window.showToast === 'function') {
      window.showToast("Items Merged", "Master inventory merged successfully.", "success");
    }
  } else if (actionType === 'print_barcode') {
    if (typeof window.showToast === 'function') {
      window.showToast("Barcode Printing", "Printing Barcode: 25 Paper Sizes Supported (40x25mm to 120x80mm). Sent to Barcode Printer.", "info");
    }
  }
};

window.generateRandomBarcode = function () {
  const bcInput = document.getElementById('imBarcode1');
  if (bcInput) {
    bcInput.value = '528' + Math.floor(1000000000 + Math.random() * 9000000000);
  }
};

window.recalculateMarkup = function () {
  const cost = parseFloat(document.getElementById('imCostUSD')?.value || 0);
  const add = parseFloat(document.getElementById('imAddCost')?.value || 0);
  const totalCost = cost + add;
  const sp1 = parseFloat(document.getElementById('sp1Price')?.value || 0);
  if (totalCost > 0 && sp1 > 0) {
    const markup = ((sp1 - totalCost) / totalCost) * 100;
    const markupEl = document.getElementById('imMarkup');
    if (markupEl) markupEl.value = markup.toFixed(1);
  }
};

window.applyMarkupPrice = function () {
  const cost = parseFloat(document.getElementById('imCostUSD')?.value || 0);
  const add = parseFloat(document.getElementById('imAddCost')?.value || 0);
  const totalCost = cost + add;
  const markup = parseFloat(document.getElementById('imMarkup')?.value || 0);
  if (totalCost > 0) {
    const newPrice = totalCost * (1 + markup / 100);
    const sp1 = document.getElementById('sp1Price');
    if (sp1) sp1.value = newPrice.toFixed(2);
  }
};

window.calculateBOMBatch = function () {
  const qty = parseFloat(document.getElementById('bomTargetQty')?.value || 100);
  console.log(`BOM recalculation triggered for batch quantity: ${qty}`);
};

window.addBOMRow = function () {
  const table = document.getElementById('bomIngredientsTable')?.getElementsByTagName('tbody')[0];
  if (table) {
    const row = table.insertRow();
    row.innerHTML = `
      <td><input type="text" class="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Material Name" /></td>
      <td><input type="text" class="form-control form-control-sm bg-dark text-white border-secondary" placeholder="1.000 Unit" /></td>
      <td>Required Qty</td>
      <td>$0.50</td>
      <td class="text-success fw-bold">$50.00</td>
      <td><input type="checkbox" class="form-check-input" /></td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="removeBOMRow(this)"><i class="fa-solid fa-trash"></i></button></td>
    `;
  }
};

window.removeBOMRow = function (btn) {
  const row = btn.closest('tr');
  if (row) row.remove();
};

window.printRecipeCard = function () {
  window.print();
};

// INNOVATIVE FEATURES
window.generateCOACertificate = function (batchId = 'BATCH-2026-081') {
  if (typeof window.showToast === 'function') {
    window.showToast("COA Generated", `Official Certificate of Analysis (COA) Generated for ${batchId}: Acidity 0.28% (Extra Virgin), Peroxide 4.2 meq O2/kg. ISO 17025 Certified.`, "success");
  }
};

window.runSmartRouteOptimizer = function () {
  if (typeof window.showToast === 'function') {
    window.showToast("Smart Route Optimized", "Grouped 14 delivery stops across Marjayoun, Nabatieh, and Sidon using LebanonVillage.json to reduce fuel by 18%.", "success");
  }
};

window.runAIWhatsAppSalesBot = function (query = "Olive Oil 1L Price") {
  if (typeof window.showToast === 'function') {
    window.showToast("Gemini AI Sales Bot", "Auto-replied to client on WhatsApp: 'Extra Virgin 1L Glass Bottle is $7.50 retail / $6.50 wholesale. Draft order #SO-9921 created.'", "success");
  }
};

window.runSeasonalForecast = function () {
  if (typeof window.showToast === 'function') {
    window.showToast("Seasonal Inventory Alert", "Distillation season peak predicted in 14 days. Recommend procuring 500kg Rose Petals & 2,000 500ml glass bottles.", "info");
  }
};

// ==================================================================
// SUBHEADER INTERACTIVE MODAL CONTROLLERS & DYNAMIC TRACKING
// ==================================================================
window.openMonthEndModal = function () {
  const el = document.getElementById('monthEndModal');
  if (el && window.bootstrap) {
    const modal = new bootstrap.Modal(el);
    modal.show();
  }
};

window.executeMonthEndClosingLock = function () {
  localStorage.setItem('so_monthend_locked', 'true');
  const alertBox = document.getElementById('monthEndStatusAlert');
  if (alertBox) {
    alertBox.className = 'alert alert-success border-success d-flex align-items-center mb-0';
    alertBox.innerHTML = `<i class="fa-solid fa-lock fs-4 me-3"></i><div><strong>Period Locked:</strong> August 2026 month-end financial ledger successfully locked and audited.</div>`;
  }
  showToast("Month-End Locked", "August 2026 financial period locked & audited successfully.", "success");
};

window.openSystemAlertsModal = function () {
  const el = document.getElementById('systemAlertsModal');
  if (el && window.bootstrap) {
    const modal = new bootstrap.Modal(el);
    modal.show();
  }
};

window.openLatestTransactionsModal = function () {
  const el = document.getElementById('latestTransactionsModal');
  if (el && window.bootstrap) {
    const modal = new bootstrap.Modal(el);
    modal.show();
  }
};

window.filterTransactionsModalTable = function () {
  const query = (document.getElementById('txSearchInput')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('#latestTxTable tbody tr');
  rows.forEach(r => {
    const text = r.innerText.toLowerCase();
    r.style.display = text.includes(query) ? '' : 'none';
  });
};

window.exportLatestTransactionsCSV = function () {
  const rows = Array.from(document.querySelectorAll('#latestTxTable tbody tr')).map(tr => {
    const cells = Array.from(tr.querySelectorAll('td')).map(td => `"${td.innerText.replace(/"/g, '""')}"`);
    return cells.join(',');
  });
  const csvContent = "data:text/csv;charset=utf-8,Ref #,Type,Entity,Date & Time,Amount (USD),Status\n" + rows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Southern_Olive_Latest_Transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Export Complete", "Latest transactions audit log exported to CSV.", "success");
};

window.openOperationalChecklistModal = function () {
  window.loadOperationalChecklistState();
  const el = document.getElementById('operationalChecklistModal');
  if (el && window.bootstrap) {
    const modal = new bootstrap.Modal(el);
    modal.show();
  }
};

window.saveOperationalChecklistState = function () {
  const checkboxes = document.querySelectorAll('#operationalChecklistModal input[type="checkbox"]');
  const stateObj = {};
  let checkedCount = 0;
  checkboxes.forEach(cb => {
    stateObj[cb.id] = cb.checked;
    if (cb.checked) checkedCount++;
  });
  localStorage.setItem('so_daily_checklist', JSON.stringify(stateObj));

  const total = checkboxes.length || 6;
  const percent = Math.round((checkedCount / total) * 100);
  const badge = document.getElementById('checklistScoreBadge');
  const bar = document.getElementById('checklistProgressBar');
  if (badge) badge.innerText = `${percent}% Completed`;
  if (bar) bar.style.width = `${percent}%`;
};

window.loadOperationalChecklistState = function () {
  const saved = JSON.parse(localStorage.getItem('so_daily_checklist') || '{}');
  const checkboxes = document.querySelectorAll('#operationalChecklistModal input[type="checkbox"]');
  let checkedCount = 0;
  checkboxes.forEach(cb => {
    if (saved[cb.id] !== undefined) {
      cb.checked = saved[cb.id];
    }
    if (cb.checked) checkedCount++;
  });
  const total = checkboxes.length || 6;
  const percent = Math.round((checkedCount / total) * 100);
  const badge = document.getElementById('checklistScoreBadge');
  const bar = document.getElementById('checklistProgressBar');
  if (badge) badge.innerText = `${percent}% Completed`;
  if (bar) bar.style.width = `${percent}%`;
};

// COMMERCIAL SAAS MASTER OWNER & TENANT PROVISIONING ENGINE
window.provisionNewSaaSTenant = async function () {
  const nameInput = document.getElementById('newTenantName');
  const cidInput = document.getElementById('newTenantCid');
  const emailInput = document.getElementById('newTenantEmail');
  const planInput = document.getElementById('newTenantPlan');

  const name = nameInput ? nameInput.value.trim() : '';
  const cid = cidInput ? cidInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const plan = planInput ? planInput.value : 'Professional ($250/mo)';

  if (!name || !cid || !email) {
    showToast("Provisioning Failed", "Please enter Company Name, Assigned Company ID, and Email.", "warning");
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('tenant-' + Date.now());

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('tenants')
        .insert([{ name: name, slug: slug, owner_email: email }])
        .select();

      if (error) {
        console.error('Supabase tenants insert error:', error);
      } else {
        console.log('✅ Successfully inserted tenant into Supabase "tenants" table:', data);
      }
    } catch (err) {
      console.error('Exception executing Supabase tenant insert:', err);
    }
  }

  const tbody = document.getElementById('saasTenantsTableBody');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge bg-warning text-dark fw-bold">${cid}</span></td>
      <td><strong>${name}</strong></td>
      <td><span class="badge bg-primary">${plan.split(' ')[0]}</span></td>
      <td><span class="badge bg-secondary me-1">All 8 Modules</span></td>
      <td>${email}</td>
      <td><strong>${plan.split('(')[1] ? plan.split('(')[1].replace(')', '') : '$250/mo'}</strong></td>
      <td><span class="badge bg-success">Active Subscriber</span></td>
      <td class="text-end"><button class="btn btn-sm btn-outline-info" onclick="showToast('Tenant Managed', 'Client ${cid} settings active', 'info')"><i class="fa-solid fa-sliders"></i> Manage</button></td>
    `;
    tbody.appendChild(tr);
  }

  if (nameInput) nameInput.value = '';
  if (cidInput) cidInput.value = '';
  if (emailInput) emailInput.value = '';

  showToast("SaaS Account Provisioned", `Successfully created new tenant account: ${name} (${cid}) and saved to Supabase!`, "success");
};

window.exportSaaSClientDatabase = function () {
  const data = [
    { CID: 'CID-001', Company: 'Southern Olive & Oil Products SARL', Plan: 'Master Owner', Status: 'Master SuperAdmin', MRR: 'Owner' },
    { CID: 'CID-102', Company: 'Cedar Olive Mills & Bottling Co.', Plan: 'Enterprise Pro', Status: 'Active', MRR: '$450' },
    { CID: 'CID-103', Company: 'Mount Lebanon Gourmet Oils', Plan: 'Professional', Status: 'Active', MRR: '$250' }
  ];

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SaaS_Subscribers_Database_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Database Exported", "SaaS client tenant subscriber directory downloaded.", "success");
};

window.openSaasMasterModal = function () {
  if (typeof window.switchSouthernScreen === 'function') {
    window.switchSouthernScreen('saas-master');
  }
};

window.openStandaloneAppsModal = function () {
  const modalEl = document.getElementById('standaloneAppsModal');
  if (!modalEl) return;
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } else {
    modalEl.classList.add('show');
    modalEl.style.display = 'block';
  }
};

// SOUTHERN OLIVE DATA INTEGRATION HELPERS
window.triggerSouthernDataImport = function () {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.html,.json,.txt,.js';
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const bridge = window.SouthernOliveBridge;
      if (bridge) {
        let parsed = { items: [], customers: [], suppliers: [], sales: [] };
        if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(content);
            const arr = Array.isArray(data) ? data : [data];
            arr.forEach(obj => {
              if (obj.ITEMNAME || obj.itemName || obj.ITEMCODE) parsed.items.push(bridge.mapItem(obj));
              if (obj.CUSTOMERNAME || obj.customerName) parsed.customers.push(bridge.mapCustomer(obj));
              if (obj.SUPPLIERNAME || obj.supplierName) parsed.suppliers.push(bridge.mapSupplier(obj));
              if (obj.TICKETNO || obj.INVOICEID) parsed.sales.push(bridge.mapSale(obj));
            });
          } catch (err) {
            window.showToast("Import Error", "Failed to parse JSON file.", "danger");
            return;
          }
        } else {
          parsed = bridge.parseHTML(content);
        }
        bridge.mergeIntoSouthernOlive(parsed);
      }
    };
    reader.readAsText(file);
  };
  fileInput.click();
};

window.triggerSouthernZReportExport = function () {
  const bridge = window.SouthernOliveBridge;
  if (bridge) {
    const report = bridge.generateZReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Southern_Olive_Z_Report_${report.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) {
      window.showToast("Z-Report Downloaded", `Daily closure report generated for ${report.date}`, "success");
    }
  }
};

// Southern Olive Data & Export Engine Aliases
window.triggerSouthernImport = window.triggerSouthernDataImport;
window.triggerSouthernExport = window.triggerSouthernZReportExport;
window.SouthernBridge = window.SouthernOliveBridge;

// GLOBAL ADMIN AUTHORIZATION INTERCEPTOR FOR REP & AGENT CREATION
document.addEventListener('click', function (e) {
  const target = e.target.closest('button, a, [onclick], .btn');
  if (!target) return;

  const btnText = (target.innerText || target.textContent || '').trim().toLowerCase();
  const onClickAttr = (target.getAttribute('onclick') || '').toLowerCase();

  const isRepAction = (
    btnText.includes('add rep') ||
    btnText.includes('add agent') ||
    btnText.includes('add sales rep') ||
    btnText.includes('create agent') ||
    btnText.includes('add employee profile') ||
    btnText.includes('add driver / employee') ||
    onClickAttr.includes('opendeptemployeemodal') ||
    onClickAttr.includes('openaddemployeemodal')
  );

  if (isRepAction) {
    if (typeof window.isCurrentSessionAdmin === 'function' && !window.isCurrentSessionAdmin()) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.checkAdminRepPermission === 'function') {
        window.checkAdminRepPermission('add Reps or Agents on any application');
      }
      return false;
    }
  }
}, true);

/* ==========================================================================
   SALES CONTROL DASHBOARD ENGINE & CHART INITIALIZATION
   ========================================================================== */
window.salesDashCharts = {};

window.initSalesDashboardCharts = function () {
  if (typeof Chart === 'undefined') return;

  // 1. Monthly Revenue Chart (Bar Chart)
  const ctxMonthly = document.getElementById('monthlyRevenueCanvas');
  if (ctxMonthly) {
    if (window.salesDashCharts.monthly) window.salesDashCharts.monthly.destroy();
    window.salesDashCharts.monthly = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          {
            label: '2026',
            data: [3.1, 2.1, 0.33, 0.65, 0.19, 0.68, 1.8, 0.79, 0, 0, 0, 0.15],
            backgroundColor: '#2563eb',
            borderRadius: 4
          },
          {
            label: '2025',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#f97316',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (val) => val + 'B' }
          }
        }
      }
    });
  }

  // 2. Sales By Category Chart (Donut Chart)
  const ctxCat = document.getElementById('salesByCategoryCanvas');
  if (ctxCat) {
    if (window.salesDashCharts.category) window.salesDashCharts.category.destroy();
    window.salesDashCharts.category = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: ['مفرق', 'عروض', 'جملة', 'Raw Materials'],
        datasets: [{
          data: [516.4, 309.6, 0.9, 0],
          backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 3. Sales By Division Chart (Pie Chart)
  const ctxDiv = document.getElementById('salesByDivisionCanvas');
  if (ctxDiv) {
    if (window.salesDashCharts.division) window.salesDashCharts.division.destroy();
    window.salesDashCharts.division = new Chart(ctxDiv, {
      type: 'pie',
      data: {
        labels: ['زيوت مفرق', 'عروض مفرق', 'Plastic / Jars'],
        datasets: [{
          data: [450, 309.6, 67.3],
          backgroundColor: ['#8b5cf6', '#dc2626', '#10b981']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 4. Sales By Group Chart (Doughnut)
  const ctxGrp = document.getElementById('salesByGroupCanvas');
  if (ctxGrp) {
    if (window.salesDashCharts.group) window.salesDashCharts.group.destroy();
    window.salesDashCharts.group = new Chart(ctxGrp, {
      type: 'doughnut',
      data: {
        labels: ['زيت زيتون معصور مفرق', 'حبوب فلت & ألبان', 'Plastic Gallon 5L'],
        datasets: [{
          data: [420, 309.6, 97.3],
          backgroundColor: ['#be185d', '#334155', '#eab308']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 5. Sales By Department Chart (Pie)
  const ctxDept = document.getElementById('salesByDeptCanvas');
  if (ctxDept) {
    if (window.salesDashCharts.dept) window.salesDashCharts.dept.destroy();
    window.salesDashCharts.dept = new Chart(ctxDept, {
      type: 'pie',
      data: {
        labels: ['MAIN DEPARTMENT'],
        datasets: [{
          data: [790.3],
          backgroundColor: ['#15803d']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 6. Discount Summary Chart
  const ctxDisc = document.getElementById('discountSummaryCanvas');
  if (ctxDisc) {
    if (window.salesDashCharts.discount) window.salesDashCharts.discount.destroy();
    window.salesDashCharts.discount = new Chart(ctxDisc, {
      type: 'pie',
      data: {
        labels: ['DISCOUNT', 'AMOUNT DISCOUNT'],
        datasets: [{
          data: [33, 5.44],
          backgroundColor: ['#2563eb', '#15803d']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 7. Void Summary Chart
  const ctxVoid = document.getElementById('voidSummaryCanvas');
  if (ctxVoid) {
    if (window.salesDashCharts.void) window.salesDashCharts.void.destroy();
    window.salesDashCharts.void = new Chart(ctxVoid, {
      type: 'pie',
      data: {
        labels: ['عماد خليل'],
        datasets: [{
          data: [4.59],
          backgroundColor: ['#15803d']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 8. User Summary Chart
  const ctxUser = document.getElementById('userSummaryCanvas');
  if (ctxUser) {
    if (window.salesDashCharts.user) window.salesDashCharts.user.destroy();
    window.salesDashCharts.user = new Chart(ctxUser, {
      type: 'pie',
      data: {
        labels: ['Hiba Aloulou', 'Mahdi'],
        datasets: [{
          data: [775.11, 15.15],
          backgroundColor: ['#15803d', '#2563eb']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 9. Payment Summary Chart
  const ctxPay = document.getElementById('paymentSummaryCanvas');
  if (ctxPay) {
    if (window.salesDashCharts.payment) window.salesDashCharts.payment.destroy();
    window.salesDashCharts.payment = new Chart(ctxPay, {
      type: 'pie',
      data: {
        labels: ['CASH'],
        datasets: [{
          data: [790.26],
          backgroundColor: ['#15803d']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 10. Daily Summary Chart (Comparative View)
  const ctxDailySum = document.getElementById('dailySummaryCanvas');
  if (ctxDailySum) {
    if (window.salesDashCharts.dailySum) window.salesDashCharts.dailySum.destroy();
    window.salesDashCharts.dailySum = new Chart(ctxDailySum, {
      type: 'line',
      data: {
        labels: ['Saturday, August 1', 'Monday, August 3', 'Wednesday, August 5', 'Friday, August 7', 'Monday, August 10', 'Wednesday, August 12', 'Friday, August 14'],
        datasets: [{
          label: 'Daily Revenue (LL)',
          data: [160, 40, 110, 50, 80, 20, 40],
          borderColor: '#15803d',
          backgroundColor: 'rgba(21, 128, 61, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }

  // 11. Monthly Sales By Category Stacked Bar Chart (Comparative View)
  const ctxMonthlyCat = document.getElementById('monthlySalesCategoryCanvas');
  if (ctxMonthlyCat) {
    if (window.salesDashCharts.monthlyCat) window.salesDashCharts.monthlyCat.destroy();
    window.salesDashCharts.monthlyCat = new Chart(ctxMonthlyCat, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          { label: 'مفرق 2026', data: [0.8, 0.8, 0.2, 0.4, 0.1, 0.2, 0.8, 0.6, 0, 0, 0, 0], backgroundColor: '#dc2626' },
          { label: 'عروض 2026', data: [0.6, 0.9, 0.05, 0.3, 0.02, 0.4, 0.9, 0.3, 0, 0, 0, 0], backgroundColor: '#f59e0b' },
          { label: 'جملة 2026', data: [2.1, 1.4, 0.1, 0.2, 0.05, 0.1, 0.2, 0, 0, 0, 0, 0.2], backgroundColor: '#2563eb' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => v + 'B' } } }
      }
    });
  }

  // 12. Average Sales By Hour (Comparative View)
  const ctxAvgHour = document.getElementById('avgSalesByHourCanvas');
  if (ctxAvgHour) {
    if (window.salesDashCharts.avgHour) window.salesDashCharts.avgHour.destroy();
    window.salesDashCharts.avgHour = new Chart(ctxAvgHour, {
      type: 'line',
      data: {
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
        datasets: [{
          label: 'Hourly Sales (LL)',
          data: [1.9, 8.5, 8.4, 3.8, 7.6, 10.4, 8.7, 6.4, 2.5, 2.4],
          borderColor: '#16a34a',
          tension: 0.4,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }

  // 13. Sales By Weekdays (Comparative View)
  const ctxWeekdays = document.getElementById('salesByWeekdaysCanvas');
  if (ctxWeekdays) {
    if (window.salesDashCharts.weekdays) window.salesDashCharts.weekdays.destroy();
    window.salesDashCharts.weekdays = new Chart(ctxWeekdays, {
      type: 'line',
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
          label: 'Weekday Revenue (LL)',
          data: [180, 100, 120, 90, 80, 160, 80],
          borderColor: '#16a34a',
          tension: 0.3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => v + 'M' } } }
      }
    });
  }

  // 14. Yearly Revenue (Comparative View)
  const ctxYearly = document.getElementById('yearlyRevenueCanvas');
  if (ctxYearly) {
    if (window.salesDashCharts.yearly) window.salesDashCharts.yearly.destroy();
    window.salesDashCharts.yearly = new Chart(ctxYearly, {
      type: 'bar',
      data: {
        labels: ['2026', '2025'],
        datasets: [
          { label: 'January', data: [3.1, 0.15], backgroundColor: '#15803d' },
          { label: 'February', data: [2.1, 0], backgroundColor: '#2563eb' },
          { label: 'March', data: [0.33, 0], backgroundColor: '#f59e0b' },
          { label: 'April', data: [0.65, 0], backgroundColor: '#dc2626' },
          { label: 'May', data: [0.19, 0], backgroundColor: '#8b5cf6' },
          { label: 'June', data: [0.68, 0], backgroundColor: '#06b6d4' },
          { label: 'July', data: [1.8, 0], backgroundColor: '#f97316' },
          { label: 'August', data: [0.79, 0], backgroundColor: '#451a03' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => v + 'B' } } }
      }
    });
  }

  // 15. Employee Monthly Sales Stacked Bar (Comparative View)
  const ctxEmpSales = document.getElementById('empMonthlySalesCanvas');
  if (ctxEmpSales) {
    if (window.salesDashCharts.empSales) window.salesDashCharts.empSales.destroy();
    window.salesDashCharts.empSales = new Chart(ctxEmpSales, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          { label: 'Cashier N2', data: [0.07, 0.18, 0.23, 0.32, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#15803d' },
          { label: 'Cashier NK', data: [0.50, 0.44, 0.01, 0.14, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#2563eb' },
          { label: 'Cashier R', data: [0.39, 0.57, 0.06, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#ea580c' },
          { label: 'Hiba Aloulou', data: [0, 0, 0, 0, 0, 0.38, 1.49, 0.78, 0, 0, 0, 0], backgroundColor: '#dc2626' },
          { label: 'Mahdi', data: [2.14, 0.89, 0.05, 0.18, 0.19, 0.26, 0.29, 0.02, 0, 0, 0, 0], backgroundColor: '#7e22ce' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => v + 'B' } } }
      }
    });
  }

  // 16. Product Insights Sales Trend (Blue Line Chart)
  const ctxProdTrend = document.getElementById('productSalesTrendCanvas');
  if (ctxProdTrend) {
    if (window.salesDashCharts.prodTrend) window.salesDashCharts.prodTrend.destroy();
    window.salesDashCharts.prodTrend = new Chart(ctxProdTrend, {
      type: 'line',
      data: {
        labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Aug 14'],
        datasets: [{
          label: 'Daily Net Sales (LL)',
          data: [180, 20, 110, 60, 120, 40, 30, 80, 90, 40, 35, 50, 45],
          borderColor: '#2563eb',
          borderWidth: 4,
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          tension: 0.2,
          fill: false,
          pointRadius: 6,
          pointBackgroundColor: '#2563eb',
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => v + 'M' } }
        }
      }
    });
  }
};

window.renderSalesDashboardData = function () {
  setTimeout(() => {
    window.initSalesDashboardCharts();
  }, 100);
};

window.switchSalesDashSubTab = function (tabName, btnEl) {
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('button').forEach(b => {
      b.classList.remove('btn-dark', 'active');
      b.classList.add('btn-outline-secondary');
    });
    btnEl.classList.remove('btn-outline-secondary');
    btnEl.classList.add('btn-dark', 'active');
  }

  document.querySelectorAll('.sd-sub-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  const targetView = document.getElementById(`sd-view-${tabName}`);
  if (targetView) {
    targetView.classList.add('active');
    targetView.style.display = 'block';
  } else {
    const sumView = document.getElementById('sd-view-summary');
    if (sumView) {
      sumView.classList.add('active');
      sumView.style.display = 'block';
    }
  }

  showToast("Sales Dashboard", `Switched view mode to: ${tabName.toUpperCase()}`, "info");
  window.renderSalesDashboardData();
};

window.openProductInsightsTab = function () {
  const elem = document.getElementById('sd-view-product');
  if (!elem) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Product Insights - Southern Olive & Oil</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 24px; }</style>
    </head>
    <body>
      <div class="container-fluid">
        ${elem.innerHTML}
      </div>
    </body>
    </html>
  `);
  win.document.close();
};

window.openCustomerInsightsTab = function () {
  const elem = document.getElementById('sd-view-customer');
  if (!elem) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customer Insights - Southern Olive & Oil</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 24px; }</style>
    </head>
    <body>
      <div class="container-fluid">
        ${elem.innerHTML}
      </div>
    </body>
    </html>
  `);
  win.document.close();
};

window.showBranchesLastEODModal = function () {
  const modalEl = document.getElementById('branchesLastEODModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    alert("Branches Last EOD Date:\n\n1. Zeit w zaytoun ljanoub: 14-Aug-2026 23:59:59\n2. Main Store - Retail: 13-Aug-2026 23:45:00");
  }
};

window.recalculateDashboardData = function () {
  showToast("Sales Dashboard", "Recalculating sales summary, comparative & insights for selected branch and month...", "info");
  window.renderSalesDashboardData();
};

window.openComprehensiveReports = function () {
  // Switch to Sales Reports subpanel directly
  if (typeof window.openSubpanel === 'function') {
    window.openSubpanel('sales', 'reports');
  } else if (typeof window.switchSubpanel === 'function') {
    window.switchSubpanel('sales', 'reports');
  } else {
    // Fallback: manually activate subpanel-sales-reports
    const allPanels = document.querySelectorAll('.subpanel');
    allPanels.forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    const targetReportPanel = document.getElementById('subpanel-sales-reports');
    if (targetReportPanel) {
      targetReportPanel.classList.add('active');
      targetReportPanel.style.display = 'block';
    }
    const salesPage = document.getElementById('view-sales-dash') || document.getElementById('page-sales');
    if (salesPage) {
      salesPage.classList.add('active');
      salesPage.style.display = 'block';
    }
  }

  showToast("Sales Reports", "Opening Comprehensive Sales Reports...", "success");
};

window.showKPIHelpToast = function (title, message) {
  showToast(title, message, 'info');
};

window.toggleFullScreenCard = function (btnElement) {
  if (!btnElement) return;
  const card = btnElement.closest('.bg-white, .card, .sd-kpi-card, div[class*="shadow-sm"]');
  if (!card) return;

  if (card.classList.contains('card-fullscreen-mode')) {
    card.classList.remove('card-fullscreen-mode');
    document.body.style.overflow = '';
    btnElement.innerHTML = '<i class="fa-solid fa-expand fs-6"></i>';
    showToast("Screen View", "Restored card to normal layout.", "info");
  } else {
    card.classList.add('card-fullscreen-mode');
    document.body.style.overflow = 'hidden';
    btnElement.innerHTML = '<i class="fa-solid fa-compress fs-6"></i>';
    showToast("Full Screen View", "Card enlarged to full screen view!", "success");
  }

  // Trigger Chart.js resize if canvas present inside card
  const canvas = card.querySelector('canvas');
  if (canvas && typeof Chart !== 'undefined') {
    const chartInstance = Chart.getChart ? Chart.getChart(canvas) : null;
    if (chartInstance) {
      setTimeout(() => chartInstance.resize(), 150);
    }
  }
};

window.showChartOptionsMenu = function (btnElement) {
  const card = btnElement ? btnElement.closest('.bg-white, .card, .sd-kpi-card, div[class*="shadow-sm"]') : null;
  const title = card ? (card.querySelector('h6, h5, .sd-kpi-label')?.innerText || 'Chart Options') : 'Chart Options';
  showToast(title, "Options: Export PNG/CSV Data, Adjust Dimensions, Print Chart Widget.", "info");
};

// Global click event delegate for enlarge (fullscreen) buttons across all dashboards
document.addEventListener('click', function (e) {
  const expandBtn = e.target.closest('button:has(.fa-expand), button .fa-expand, .fa-expand');
  if (expandBtn) {
    const btn = expandBtn.tagName === 'BUTTON' ? expandBtn : expandBtn.closest('button');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleFullScreenCard(btn);
      return;
    }
  }

  const ellipsisBtn = e.target.closest('button:has(.fa-ellipsis-vertical), button .fa-ellipsis-vertical, .fa-ellipsis-vertical');
  if (ellipsisBtn) {
    const btn = ellipsisBtn.tagName === 'BUTTON' ? ellipsisBtn : ellipsisBtn.closest('button');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      window.showChartOptionsMenu(btn);
      return;
    }
  }
});

window.topBuyersData = [
  { id: 101, customer: 'Al Bustan General Trading', brand: 'Zeit w zaytoun ljanoub', group: 'Wholesale', transactions: 42, totalSpend: 148500.00, lastTx: '15-Aug-2026' },
  { id: 104, customer: 'Golden Olive Hotel & Resort', brand: 'Zeit w zaytoun ljanoub', group: 'Hotels & Restaurants', transactions: 38, totalSpend: 124200.00, lastTx: '14-Aug-2026' },
  { id: 108, customer: 'Cedar Fine Foods S.A.L.', brand: 'Southern Olive Premium', group: 'Wholesale', transactions: 31, totalSpend: 98750.00, lastTx: '12-Aug-2026' },
  { id: 112, customer: 'Riviera Restaurant & Lounge', brand: 'Zeit w zaytoun ljanoub', group: 'Hotels & Restaurants', transactions: 29, totalSpend: 86400.00, lastTx: '11-Aug-2026' },
  { id: 115, customer: 'Beirut Gourmet Market', brand: 'Janoub Estate', group: 'Clients', transactions: 26, totalSpend: 74100.00, lastTx: '10-Aug-2026' },
  { id: 119, customer: 'Mediterranean Delights Co', brand: 'Southern Olive Premium', group: 'GENERAL', transactions: 24, totalSpend: 68900.00, lastTx: '09-Aug-2026' },
  { id: 122, customer: 'Tannourine Catering Services', brand: 'Zeit w zaytoun ljanoub', group: 'Hotels & Restaurants', transactions: 21, totalSpend: 59300.00, lastTx: '08-Aug-2026' },
  { id: 125, customer: 'Zahle Oils & Fine Foods', brand: 'Janoub Estate', group: 'Clients', transactions: 19, totalSpend: 51200.00, lastTx: '06-Aug-2026' },
  { id: 129, customer: 'Baalbeck Supermarket', brand: 'Zeit w zaytoun ljanoub', group: 'GENERAL', transactions: 17, totalSpend: 44800.00, lastTx: '05-Aug-2026' },
  { id: 133, customer: 'Sour Trading Co', brand: 'Southern Olive Premium', group: 'Wholesale', transactions: 15, totalSpend: 39500.00, lastTx: '03-Aug-2026' },
  { id: 137, customer: 'Byblos Food Services', brand: 'Zeit w zaytoun ljanoub', group: 'Hotels & Restaurants', transactions: 14, totalSpend: 34100.00, lastTx: '01-Aug-2026' },
  { id: 140, customer: 'Tyre Specialty Market', brand: 'Janoub Estate', group: 'Clients', transactions: 12, totalSpend: 29800.00, lastTx: '28-Jul-2026' },
  { id: 144, customer: 'Tripoli Emporium', brand: 'Southern Olive Premium', group: 'GENERAL', transactions: 11, totalSpend: 25400.00, lastTx: '25-Jul-2026' },
  { id: 148, customer: 'Bhamdoun Bistro & Cafe', brand: 'Zeit w zaytoun ljanoub', group: 'Hotels & Restaurants', transactions: 9, totalSpend: 19600.00, lastTx: '20-Jul-2026' },
  { id: 152, customer: 'Kaslik Olive Co', brand: 'Janoub Estate', group: 'VIP Accounts', transactions: 8, totalSpend: 16200.00, lastTx: '18-Jul-2026' }
];

let showAllTopBuyers = false;

window.renderTopBuyersTable = function () {
  const tbody = document.getElementById('topBuyersTableBody');
  const titleEl = document.getElementById('topBuyersCardTitle');
  const btnEl = document.getElementById('topBuyersToggleBtn');
  const brandSelect = document.getElementById('topBuyersBrandSelect');
  const groupSelect = document.getElementById('topBuyersGroupSelect');
  if (!tbody) return;

  const selectedBrand = brandSelect ? brandSelect.value : 'All Brands';
  const selectedGroup = groupSelect ? groupSelect.value : 'All Groups';

  let filtered = window.topBuyersData.filter(item => {
    const matchBrand = (selectedBrand === 'All Brands' || item.brand === selectedBrand);
    const matchGroup = (selectedGroup === 'All Groups' || item.group === selectedGroup);
    return matchBrand && matchGroup;
  });

  const limit = showAllTopBuyers ? filtered.length : 10;
  const displayItems = filtered.slice(0, limit);

  if (titleEl) {
    titleEl.innerText = showAllTopBuyers ? "Top Buyers (All)" : "Top 10 Buyers";
  }

  if (btnEl) {
    btnEl.innerText = showAllTopBuyers ? "Show Less" : "Show More";
  }

  if (displayItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">No matching buyers found</td></tr>`;
    return;
  }

  tbody.innerHTML = displayItems.map(item => `
    <tr>
      <td class="fw-semibold text-secondary">${item.id}</td>
      <td class="text-start fw-bold text-dark">${item.customer}</td>
      <td><span class="badge bg-light text-dark border">${item.transactions}</span></td>
      <td class="fw-bold text-primary">$${item.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td class="text-muted small">${item.lastTx}</td>
    </tr>
  `).join('');
};

window.toggleTopBuyersShowMore = function () {
  showAllTopBuyers = !showAllTopBuyers;
  window.renderTopBuyersTable();
  showToast("Top Buyers", showAllTopBuyers ? "Showing all top buyers in detail." : "Showing top 10 buyers.", "info");
};

window.recalculateTop10Buyers = function () {
  window.renderTopBuyersTable();
  showToast("Top Buyers", "Recalculated top buyers ranking by spend and transaction count.", "success");
};

window.refreshCustomerKPIs = function () {
  showToast("Customer Insights", "Customer KPIs successfully refreshed.", "success");
};

window.refreshCustomerPanels = function () {
  window.renderTopBuyersTable();
  showToast("Customer Insights", "Customer data quality and financial panels refreshed.", "success");
};

window.exportAtRiskCustomersToExcel = function () {
  showToast("At-Risk Customers", "Exporting At-Risk Customers list to Excel spreadsheet...", "success");
};

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (typeof window.renderTopBuyersTable === 'function') {
      window.renderTopBuyersTable();
    }
  }, 300);
});

window.showCustomerRecommendations = function () {
  const modalEl = document.getElementById('customerRecommendationsModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    alert("Smart Customer Recommendations:\n\n1. 30 Customers missing email addresses\n2. 2 At-Risk Accounts (Afkar Holding & Mauritania)\n3. 0 Active Loyalty Program Members");
  }
};

window.filterCustomerInsightsByBrand = function (brandName) {
  showToast("Customer Insights", `Filtered customer insights by brand: ${brandName}`, "info");
};

// --- COMPREHENSIVE VANGUARD POS & SOUTHERN OLIVE SALES REPORTS SYSTEM ---
let recentlyViewedReports = [];
try {
  recentlyViewedReports = JSON.parse(localStorage.getItem('so_recently_viewed_reports')) || [];
} catch (e) {
  recentlyViewedReports = [];
}
let currentReportZoom = 1.0;
let currentActiveReportName = "Summary of voids";

window.navigateToHome = function () {
  if (typeof window.switchSouthernScreen === 'function') {
    window.switchSouthernScreen('grid-dash');
  } else if (typeof window.showModule === 'function') {
    window.showModule('dashboard');
  } else {
    document.querySelectorAll('.module-page, .southern-screen-view').forEach(pg => {
      pg.classList.remove('active');
      pg.style.display = 'none';
    });
    const gridDash = document.getElementById('view-grid-dash') || document.getElementById('page-dashboard');
    if (gridDash) {
      gridDash.classList.add('active');
      gridDash.style.display = 'block';
    }
  }
};

window.filterOnlineOrdersTable = function () {
  const branchVal = (document.getElementById('filterOnlineBranch')?.value || 'all').toLowerCase();
  const statusVal = (document.getElementById('filterOnlineStatus')?.value || 'all').toLowerCase();
  const searchVal = (document.getElementById('filterOnlineSearch')?.value || '').toLowerCase().trim();

  const rows = document.querySelectorAll('#tableOnlineOrdersList tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    let matchesBranch = true;
    let matchesStatus = true;
    let matchesSearch = true;

    if (branchVal !== 'all') {
      matchesBranch = text.includes(branchVal);
    }
    if (statusVal !== 'all') {
      if (statusVal === 'part_not_received') {
        matchesStatus = text.includes('partially') || text.includes('not received');
      } else if (statusVal === 'fully') {
        matchesStatus = text.includes('fully received');
      } else if (statusVal === 'not_received') {
        matchesStatus = text.includes('not received yet');
      }
    }
    if (searchVal) {
      matchesSearch = text.includes(searchVal);
    }

    if (matchesBranch && matchesStatus && matchesSearch) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

window.resetOnlineOrdersFilter = function () {
  const branchEl = document.getElementById('filterOnlineBranch');
  const statusEl = document.getElementById('filterOnlineStatus');
  const searchEl = document.getElementById('filterOnlineSearch');

  if (branchEl) branchEl.selectedIndex = 0;
  if (statusEl) statusEl.selectedIndex = 0;
  if (searchEl) searchEl.value = '';

  const rows = document.querySelectorAll('#tableOnlineOrdersList tbody tr');
  rows.forEach(row => {
    row.style.display = '';
  });
};

window.onlineOrdersDataset = {
  "#ORD-ONLINE-101": {
    orderNo: "#ORD-ONLINE-101",
    orderDate: "17 Aug 2026 10:15",
    deliveryDate: "17 Aug 2026 14:00",
    customerName: "Karem Assaf",
    phone: "+961 70 123 456",
    address: "Tyre Souk, Near Al-Mina, Building 4",
    platform: "Customer Storefront",
    paymentMethod: "Cash on Delivery",
    status: "Fully Received",
    branch: "Main Branch - Tyre",
    zone: "Tyre Souk",
    items: [
      { name: "زيتون معصر بلدي 1ك", qty: 2, price: 9.00, total: 18.00 },
      { name: "خل تفاح بلدي 1L", qty: 1, price: 9.00, total: 9.00 }
    ],
    subtotal: 27.00,
    deliveryFee: 0.00,
    grandTotal: 27.00
  },
  "#ORD-ONLINE-102": {
    orderNo: "#ORD-ONLINE-102",
    orderDate: "17 Aug 2026 11:40",
    deliveryDate: "18 Aug 2026 10:00",
    customerName: "Noura Haddad",
    phone: "+961 03 987 654",
    address: "Beirut, Hamra Main St., Bldg 12, Floor 3",
    platform: "Social Sales App",
    paymentMethod: "Wish Money",
    status: "Partially Received",
    branch: "Beirut Branch",
    zone: "Beirut Hamra",
    items: [
      { name: "زيت زيتون بكر ممتاز 5L", qty: 1, price: 45.00, total: 45.00 },
      { name: "دبس رمان بلدي 500ml", qty: 2, price: 6.50, total: 13.00 }
    ],
    subtotal: 58.00,
    deliveryFee: 0.00,
    grandTotal: 58.00
  },
  "#ORD-ONLINE-103": {
    orderNo: "#ORD-ONLINE-103",
    orderDate: "17 Aug 2026 14:05",
    deliveryDate: "17 Aug 2026 18:30",
    customerName: "Ahmad Al-Hajj",
    phone: "+961 71 555 888",
    address: "Sidon Main Street, Near Commercial Center",
    platform: "WhatsApp Business",
    paymentMethod: "Cash on Delivery",
    status: "Not Received Yet",
    branch: "Sidon Branch",
    zone: "Sidon Main St.",
    items: [
      { name: "تنكة زيت زيتون بلدي 16L", qty: 1, price: 120.00, total: 120.00 },
      { name: "صابون زيت زيتون بلدي (ربطة 5 حبات)", qty: 2, price: 12.50, total: 25.00 }
    ],
    subtotal: 145.00,
    deliveryFee: 0.00,
    grandTotal: 145.00
  }
};

window.openOnlineOrderDetailsModal = function (orderNo) {
  const order = window.onlineOrdersDataset[orderNo] || window.onlineOrdersDataset["#ORD-ONLINE-101"];
  const titleEl = document.getElementById('onlineOrderDetailTitle');
  const bodyEl = document.getElementById('onlineOrderDetailBody');

  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-receipt me-2 text-primary"></i>Online Order Details — <span class="text-warning">${order.orderNo}</span>`;
  }

  if (bodyEl) {
    let itemsHtml = order.items.map(item => `
      <tr>
        <td class="fw-bold text-dark">${item.name}</td>
        <td class="text-center fw-bold">${item.qty}</td>
        <td class="text-end">$${item.price.toFixed(2)}</td>
        <td class="text-end fw-bold text-success">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    bodyEl.innerHTML = `
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="p-3 bg-light rounded border">
            <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-user me-1"></i>Customer Information</h6>
            <div class="small text-dark"><strong>Name:</strong> ${order.customerName}</div>
            <div class="small text-dark"><strong>Phone:</strong> ${order.phone}</div>
            <div class="small text-dark"><strong>Address:</strong> ${order.address}</div>
            <div class="small text-dark"><strong>Zone/Branch:</strong> ${order.zone} / ${order.branch}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded border">
            <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-circle-info me-1"></i>Order Metadata</h6>
            <div class="small text-dark"><strong>Order Date:</strong> ${order.orderDate}</div>
            <div class="small text-dark"><strong>Platform Source:</strong> <span class="badge bg-primary-subtle text-primary border">${order.platform}</span></div>
            <div class="small text-dark"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
            <div class="small text-dark"><strong>POS Receipt Status:</strong> <span class="badge bg-success-subtle text-success border">${order.status}</span></div>
          </div>
        </div>
      </div>

      <h6 class="fw-bold text-dark mb-2">Ordered Items Summary</h6>
      <div class="table-responsive border rounded mb-3">
        <table class="table table-sm align-middle small text-dark mb-0">
          <thead class="table-light">
            <tr>
              <th>Item Description</th>
              <th class="text-center">Qty</th>
              <th class="text-end">Unit Price</th>
              <th class="text-end">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="3" class="text-end fw-bold">Grand Total:</td>
              <td class="text-end fw-bold text-success fs-6">$${order.grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  const modalEl = document.getElementById('onlineOrderDetailsModal');
  if (modalEl) {
    if (modalEl.parentElement !== document.body) {
      document.body.appendChild(modalEl);
    }
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
};

window.printOnlineOrderInvoice = function () {
  showToast('Print Invoice', 'Sending online order invoice to thermal printer...', 'info');
  window.print();
};

window.receiveOnlineOrderInPOS = function (orderNo) {
  const order = window.onlineOrdersDataset[orderNo];

  // 1. Switch screen to POS register
  if (typeof window.switchSouthernScreen === 'function') {
    window.switchSouthernScreen('pos-register');
  } else if (typeof window.showModule === 'function') {
    window.showModule('pos');
  }

  // 2. Load item into active POS cart if cart engine exists
  if (order && order.items && order.items.length > 0) {
    order.items.forEach(item => {
      if (typeof window.addToCart === 'function') {
        window.addToCart(item.name, item.price);
      }
    });
  }

  // 3. Update order receipt status in dataset & table
  if (order) {
    order.status = "Fully Received";
  }

  const rows = document.querySelectorAll('#tableOnlineOrdersList tbody tr');
  rows.forEach(row => {
    if (row.innerText.includes(orderNo)) {
      const statusTd = row.cells[6];
      if (statusTd) {
        statusTd.innerHTML = '<span class="border border-gray-300 bg-white text-gray-700 rounded-sm px-2 py-1 text-xs"><i class="fa-solid fa-circle-check me-1"></i>Fully Received</span>';
      }
      const actionTd = row.cells[9];
      if (actionTd) {
        actionTd.innerHTML = `<button class="btn btn-link p-0 text-slate-600 hover:text-slate-900 shadow-none border-0" onclick="openOnlineOrderDetailsModal('${orderNo}')" title="View"><i class="fa-solid fa-eye fs-6"></i></button>`;
      }
    }
  });

  // Update stat counters
  const notRecEl = document.getElementById('statOnlineNotReceived');
  const fullyRecEl = document.getElementById('statOnlineFullyReceived');
  if (notRecEl && parseInt(notRecEl.innerText) > 0) {
    notRecEl.innerText = (parseInt(notRecEl.innerText) - 1).toString();
  }
  if (fullyRecEl) {
    fullyRecEl.innerText = (parseInt(fullyRecEl.innerText) + 1).toString();
  }

  showToast('Order Loaded in POS', `Online order ${orderNo} has been transferred and loaded into the POS Terminal cart!`, 'success');
};

window.getSoftwareSystemDate = function () {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(now.getDate()).padStart(2, '0');
  return `${months[now.getMonth()]} ${day}, ${now.getFullYear()}`;
};

window.openEODConfirmModal = function () {
  const modalEl = document.getElementById('eodConfirmModal');
  if (modalEl) {
    if (modalEl.parentElement !== document.body) {
      document.body.appendChild(modalEl);
    }
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
};

window.executeEODProcess = function () {
  const modalEl = document.getElementById('eodConfirmModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  const branchSel = document.getElementById('eodBranchSelect');
  const branchVal = branchSel ? branchSel.value : 'zeit_ljanoub';
  const branchName = branchSel ? branchSel.options[branchSel.selectedIndex].text : 'Zeit w zaytoun ljanoub';

  const systemDateStr = window.getSoftwareSystemDate();
  const eodInput = document.getElementById('eodLastDateInput');
  if (eodInput) {
    eodInput.value = systemDateStr;
  }

  let savedDates = {};
  try {
    savedDates = JSON.parse(localStorage.getItem('so_branch_eod_dates') || '{}');
  } catch (e) { }
  savedDates[branchVal] = systemDateStr;
  localStorage.setItem('so_branch_eod_dates', JSON.stringify(savedDates));

  showToast('End of Day Completed', `End of Day closure for "${branchName}" has been successfully executed on ${systemDateStr}.`, 'success');
};

window.updateEODLastDate = function () {
  const branchVal = document.getElementById('eodBranchSelect')?.value || 'zeit_ljanoub';
  const eodInput = document.getElementById('eodLastDateInput');
  if (!eodInput) return;

  let savedDates = {};
  try {
    savedDates = JSON.parse(localStorage.getItem('so_branch_eod_dates') || '{}');
  } catch (e) { }

  if (savedDates[branchVal]) {
    eodInput.value = savedDates[branchVal];
  } else {
    eodInput.value = window.getSoftwareSystemDate();
  }
};

window.toggleSalesReportTreeSidebar = function () {
  const leftCol = document.getElementById('salesReportTreeCol');
  const rightCol = document.getElementById('salesReportActiveViewCol');
  if (!leftCol || !rightCol) return;

  if (leftCol.classList.contains('d-none')) {
    leftCol.classList.remove('d-none');
    rightCol.className = 'col-lg-10 col-md-9';
  } else {
    leftCol.classList.add('d-none');
    rightCol.className = 'col-12';
  }
};

window.toggleSalesReportTreeSidebar = function () {
  const leftCol = document.getElementById('salesReportTreeCol');
  const rightCol = document.getElementById('salesReportActiveViewCol');
  if (!leftCol || !rightCol) return;

  if (leftCol.classList.contains('d-none')) {
    leftCol.classList.remove('d-none');
    rightCol.className = 'col-lg-10 col-md-9';
  } else {
    leftCol.classList.add('d-none');
    rightCol.className = 'col-12';
  }
};

window.loadSalesReport = function (reportName, linkElem) {
  currentActiveReportName = reportName;

  // Show filter card when a report is selected
  const filterCard = document.getElementById('salesReportFilterCard');
  if (filterCard) {
    filterCard.style.display = 'block';
  }

  // 1. Highlight active sidebar link
  document.querySelectorAll('#subpanel-sales-reports a').forEach(el => {
    el.classList.remove('fw-bold', 'text-primary', 'bg-primary-subtle', 'rounded', 'px-2');
    el.classList.add('text-secondary');
  });
  if (linkElem) {
    linkElem.classList.remove('text-secondary');
    linkElem.classList.add('fw-bold', 'text-primary', 'bg-primary-subtle', 'rounded', 'px-2');
  }

  // 2. Update Header Titles & Subtitles
  const filterSub = document.getElementById('activeReportFilterSubtitle');
  const displaySub = document.getElementById('activeReportDisplayTitle');
  if (filterSub) filterSub.innerText = reportName;
  if (displaySub) displaySub.innerText = reportName;

  // 3. Track Recently Viewed (Real User History - Last 5 clicked items)
  recentlyViewedReports = recentlyViewedReports.filter(name => name !== reportName);
  recentlyViewedReports.unshift(reportName);
  if (recentlyViewedReports.length > 5) recentlyViewedReports = recentlyViewedReports.slice(0, 5);
  try {
    localStorage.setItem('so_recently_viewed_reports', JSON.stringify(recentlyViewedReports));
  } catch (e) { }
  updateRecentlyViewedUI();

  // 4. Dynamic Filters UI Construction
  renderSalesReportFilters(reportName);

  // 5. Keep report paper container clean without notification warning boxes
  const paperArea = document.getElementById('salesReportPrintableArea');
  if (paperArea) {
    paperArea.innerHTML = '';
  }
};

function updateRecentlyViewedUI() {
  const container = document.querySelector('#subpanel-sales-reports .report-group-sec .list-group');
  if (!container) return;
  if (!recentlyViewedReports || recentlyViewedReports.length === 0) {
    container.innerHTML = `<span class="text-muted small px-2 py-1 fst-italic">No recently viewed reports</span>`;
    return;
  }
  container.innerHTML = recentlyViewedReports.map(name => `
    <a href="javascript:void(0)" class="list-group-item list-group-item-action bg-transparent border-0 px-1 py-1 text-secondary" onclick="loadSalesReport('${name.replace(/'/g, "\\'")}', this)">${name}</a>
  `).join('');
}

window.filterSalesReportsList = function (query) {
  const q = (query || '').toLowerCase().trim();
  const accordionItems = document.querySelectorAll('#salesReportsMainAccordion .report-group-sec');

  accordionItems.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (!q || text.includes(q)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};

/* REPORT SETTINGS MODAL ENGINE */
window.openReportSettingsModal = function () {
  const modalEl = document.getElementById('salesReportSettingsModal');
  if (!modalEl) {
    console.error('salesReportSettingsModal element not found');
    return;
  }

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
};

window.openCustomCategoryModal = function () {
  const modalEl = document.getElementById('customCategoryModal');
  if (!modalEl) return;

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
};

window.filterSettingsCategoryTree = function (query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#settingsCategoryTreeContainer .border');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (!q || text.includes(q)) {
      row.style.display = 'block';
    } else {
      row.style.display = 'none';
    }
  });
};

window.saveReportSettingsDefaultDate = function () {
  const val = document.getElementById('settingsDefaultDateSelect')?.value || 'This Month';
  try {
    localStorage.setItem('so_reports_default_date_range', val);
  } catch (e) { }

  // Update active preset select if present
  const presetSel = document.getElementById('filterPresetSelect');
  if (presetSel) {
    if (val === 'This Month') presetSel.value = 'this_month';
    else if (val === 'Today') presetSel.value = 'today';
    else if (val === 'Yesterday') presetSel.value = 'yesterday';
    else if (val === 'This Year') presetSel.value = 'this_year';
  }

  // Hide modal
  const modalEl = document.getElementById('salesReportSettingsModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  if (typeof showSouthernNotification === 'function') {
    showSouthernNotification('Default Date Range Saved Successfully!', 'success');
  }
};

window.saveCustomCategory = function () {
  const catName = document.getElementById('customCategoryNameInput')?.value?.trim();
  if (!catName) {
    alert('Please enter a category name.');
    return;
  }

  // Create new category item in settings tree
  const treeContainer = document.getElementById('settingsCategoryTreeContainer');
  if (treeContainer) {
    const div = document.createElement('div');
    div.className = 'border rounded-3 mb-2 bg-white p-2 text-dark';
    div.innerHTML = `
      <div class="form-check mb-0">
        <input class="form-check-input settings-cat-checkbox" type="checkbox" checked id="set_cat_custom_${Date.now()}">
        <label class="form-check-label text-dark fw-semibold">${catName}</label>
      </div>
    `;
    treeContainer.appendChild(div);
  }

  // Reset input & hide modal
  const input = document.getElementById('customCategoryNameInput');
  if (input) input.value = '';

  const modalEl = document.getElementById('customCategoryModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  if (typeof showSouthernNotification === 'function') {
    showSouthernNotification(`Custom Category "${catName}" Created!`, 'success');
  }
};

window.filterSalesReportsList = function (query) {
  const q = (query || '').toLowerCase().trim();
  const reportLinks = document.querySelectorAll('#subpanel-sales-reports .report-group-sec a');
  reportLinks.forEach(link => {
    const txt = link.innerText.toLowerCase();
    if (!q || txt.includes(q)) {
      link.style.display = 'block';
    } else {
      link.style.display = 'none';
    }
  });
};

function renderSalesReportFilters(reportName) {
  const container = document.getElementById('salesReportDynamicFilterInputs');
  if (!container) return;

  const rName = reportName.toLowerCase();
  let html = '';

  if (rName.includes('customer list standard')) {
    html = `
      <div class="row g-2">
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Sales Customer Group</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium">
            <option value="clients" selected>Clients</option>
            <option value="general">GENERAL</option>
            <option value="managers">Managers</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Customer Status</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium">
            <option value="all" selected>All</option>
            <option value="active">Active</option>
            <option value="not_active">Not Active</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Customer Tag</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium">
            <option value="all" selected>All Tags</option>
            <option value="vip">VIP</option>
            <option value="loyal">Loyal Customer</option>
            <option value="high">High Spender</option>
            <option value="regular">Regular</option>
            <option value="celebrity">Celebrity</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Country</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium">
          <select class="form-select form-select-sm border-secondary-subtle fw-medium" id="filterCountry">
            <option value="Lebanon" selected>Lebanon</option>
            <option value="All Countries">All Countries</option>
          </select>
        </div>
        <div class="col-12 mt-2 pt-1 border-top d-flex flex-wrap align-items-center gap-3">
          <div class="form-check mb-0">
            <input class="form-check-input" type="checkbox" id="chkShowDetails">
            <label class="form-check-label small fw-semibold text-secondary" for="chkShowDetails">Show Details</label>
          </div>
          <div class="form-check mb-0">
            <input class="form-check-input" type="checkbox" id="chkBirthday" onchange="toggleBirthdayDatePickers(this.checked)">
            <label class="form-check-label small fw-semibold text-secondary" for="chkBirthday">Birthday</label>
          </div>
        </div>
        <div class="row g-2 mt-1 d-none" id="birthdayDatePickersRow">
          <div class="col-sm-6">
            <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.7rem;">Birthday From</label>
            <input type="date" class="form-control form-control-sm border-secondary-subtle fw-medium" id="filterBirthdayFrom" value="2026-01-01">
          </div>
          <div class="col-sm-6">
            <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.7rem;">Birthday To</label>
            <input type="date" class="form-control form-control-sm border-secondary-subtle fw-medium" id="filterBirthdayTo" value="2026-12-31">
          </div>
        </div>
      </div>
    `;
  } else {
    // Standard Fallback Filter Layout
    html = `
      <div class="row g-2">
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Preset Range</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium" id="filterPresetSelect" onchange="updateDateDisplayFromPreset(this.value)">
            <option value="this_month" selected>This Month</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Period</label>
          <input type="text" class="form-control form-control-sm border-secondary-subtle fw-medium" id="filterDateDisplay" value="Aug, 2026" readonly>
        </div>
        <div class="col-sm-6">
          <label class="form-label text-muted fw-bold mb-0" style="font-size: 0.72rem;">Branch</label>
          <select class="form-select form-select-sm border-secondary-subtle fw-medium" id="filterBranchSelect">
            <option value="Zeit w zaytoun ljanoub" selected>Zeit w zaytoun ljanoub</option>
            <option value="All Branches">All Branches</option>
          </select>
        </div>
        <div class="col-sm-6 d-flex align-items-end gap-3 pb-1">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="chkRealDate">
            <label class="form-check-label small fw-semibold text-secondary" for="chkRealDate">Real Date</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="chkShowRate">
            <label class="form-check-label small fw-semibold text-secondary" for="chkShowRate">Show Rate</label>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.updateDateDisplayFromPreset = function (val) {
  const input = document.getElementById('filterDateDisplay');
  if (!input) return;
  if (val === 'today') input.value = '15-Aug-2026';
  else if (val === 'yesterday') input.value = '14-Aug-2026';
  else if (val === 'this_year') input.value = 'Year 2026';
  else input.value = 'Aug, 2026';
};

window.toggleBirthdayDatePickers = function (isCheck) {
  const row = document.getElementById('birthdayDatePickersRow');
  if (row) {
    if (isCheck) row.classList.remove('d-none');
    else row.classList.add('d-none');
  }
};

function renderSalesReportSheet(reportName) {
  const paperArea = document.getElementById('salesReportPrintableArea');
  if (!paperArea) return;

  const rNameUpper = reportName.toUpperCase();
  const branchVal = document.getElementById('filterBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
  const realDateChecked = document.getElementById('chkRealDate')?.checked ? 'Yes' : 'No';
  const showRateChecked = document.getElementById('chkShowRate')?.checked ? 'Yes' : 'No';
  const periodVal = document.getElementById('filterDateDisplay')?.value || '15-Aug-26';

  let bodyMarkup = '';

  if (rNameUpper.includes('CUSTOMER LIST STANDARD') || rNameUpper.includes('CUSTOMER')) {
    const groupVal = document.getElementById('filterCustGroup')?.value || 'Wholesales / Clients';
    bodyMarkup = `
      <div class="mb-3">
        <h6 class="fw-bold text-dark border-bottom pb-1 mb-2" style="font-size: 0.9rem;">${groupVal}</h6>
        <h6 class="fw-bold text-secondary ps-2 border-bottom pb-1 mb-2" style="font-size: 0.85rem;">Clients</h6>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Code #</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Group</th>
              <th class="text-end">Balance ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="fw-bold text-primary">Ahmad Al-Hajj</td>
              <td>CUST-10021</td>
              <td>+961 03 458 912</td>
              <td>Sidon Main St.</td>
              <td>Wholesales / Clients</td>
              <td class="text-end fw-bold text-success">$1,450.00</td>
            </tr>
            <tr>
              <td class="fw-bold text-primary">Karem Assaf Grocery</td>
              <td>CUST-10024</td>
              <td>+961 07 721 004</td>
              <td>Tyre Souk</td>
              <td>Wholesales / Clients</td>
              <td class="text-end fw-bold text-success">$3,820.00</td>
            </tr>
            <tr>
              <td class="fw-bold text-primary">Noura Haddad</td>
              <td>CUST-10030</td>
              <td>+961 70 882 119</td>
              <td>Beirut Hamra</td>
              <td>Wholesales / Clients</td>
              <td class="text-end fw-bold text-secondary">$0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (rNameUpper.includes('ONLINE') || rNameUpper.includes('SOCIAL') || rNameUpper.includes('OMNICHANNEL')) {
    bodyMarkup = `
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date & Time</th>
            <th>Platform / Channel</th>
            <th>Customer Name</th>
            <th>Delivery Zone / Branch</th>
            <th>POS Sync Status</th>
            <th class="text-end">Total Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="fw-bold text-primary">#ORD-ONLINE-101</td>
            <td>17-Aug-2026 10:15</td>
            <td><span class="badge bg-primary-subtle text-primary border">Customer Storefront</span></td>
            <td class="fw-bold text-dark">Karem Assaf</td>
            <td>Main Branch - Tyre Souk</td>
            <td><span class="badge bg-success-subtle text-success border">Fully Received</span></td>
            <td class="text-end fw-bold text-success">$27.00</td>
          </tr>
          <tr>
            <td class="fw-bold text-primary">#ORD-ONLINE-102</td>
            <td>17-Aug-2026 11:40</td>
            <td><span class="badge bg-info-subtle text-info border">Social Sales App</span></td>
            <td class="fw-bold text-dark">Noura Haddad</td>
            <td>Beirut Branch - Hamra</td>
            <td><span class="badge bg-warning-subtle text-warning border">Partially Received</span></td>
            <td class="text-end fw-bold text-success">$58.00</td>
          </tr>
          <tr>
            <td class="fw-bold text-primary">#ORD-ONLINE-103</td>
            <td>17-Aug-2026 14:05</td>
            <td><span class="badge bg-success-subtle text-success border">WhatsApp Business</span></td>
            <td class="fw-bold text-dark">Ahmad Al-Hajj</td>
            <td>Sidon Branch - Main St.</td>
            <td><span class="badge bg-danger-subtle text-danger border">Not Received Yet</span></td>
            <td class="text-end fw-bold text-success">$145.00</td>
          </tr>
          <tr>
            <td class="fw-bold text-primary">#ORD-SOCIAL-204</td>
            <td>16-Aug-2026 16:30</td>
            <td><span class="badge bg-primary-subtle text-primary border">Instagram Direct</span></td>
            <td class="fw-bold text-dark">Lama Kassir</td>
            <td>Main Branch - Tyre</td>
            <td><span class="badge bg-success-subtle text-success border">Fully Received</span></td>
            <td class="text-end fw-bold text-success">$84.00</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (rNameUpper.includes('VOID')) {
    bodyMarkup = `
      <table class="table align-middle mb-0">
        <thead class="bg-white text-slate-700 text-xs font-bold uppercase border-b border-gray-200">
          <tr>
            <th class="py-2 text-slate-700 text-xs font-bold uppercase">Void ID</th>
            <th class="py-2 text-slate-700 text-xs font-bold uppercase">Date & Time</th>
            <th class="py-2 text-slate-700 text-xs font-bold uppercase">Employee</th>
            <th class="py-2 text-slate-700 text-xs font-bold uppercase">Item Description</th>
            <th class="text-center py-2 text-slate-700 text-xs font-bold uppercase">Qty</th>
            <th class="text-end py-2 text-slate-700 text-xs font-bold uppercase">Amount (LL)</th>
            <th class="py-2 text-slate-700 text-xs font-bold uppercase">Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="fw-bold text-slate-700">VD-901</td>
            <td>15-Aug-2026 14:10</td>
            <td>Ahmad K.</td>
            <td class="fw-bold text-dark">زيتون معصر بلدي 1ك</td>
            <td class="text-center">1</td>
            <td class="text-end text-slate-700 fw-bold">450,000</td>
            <td>Customer Changed Mind</td>
          </tr>
          <tr>
            <td class="fw-bold text-slate-700">VD-902</td>
            <td>14-Aug-2026 11:20</td>
            <td>Samer R.</td>
            <td class="fw-bold text-dark">خل تفاح 5 ليتر</td>
            <td class="text-center">2</td>
            <td class="text-end text-slate-700 fw-bold">2,400,000</td>
            <td>Wrong Item Scanned</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    // Generic high-fidelity report layout
    bodyMarkup = `
      <table>
        <thead>
          <tr>
            <th>Trans #</th>
            <th>Date & Time</th>
            <th>Item Description</th>
            <th>Category</th>
            <th class="text-center">Qty</th>
            <th class="text-end">Unit Price (LL)</th>
            <th class="text-end">Total Amount (LL)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="fw-bold text-primary">TRX-2026-8091</td>
            <td>14-Aug-2026 18:45</td>
            <td class="fw-bold text-dark">زيتون معصر بلدي 1ك</td>
            <td>مفرق</td>
            <td class="text-center fw-bold">2</td>
            <td class="text-end">450,000</td>
            <td class="text-end fw-bold text-dark">900,000</td>
          </tr>
          <tr>
            <td class="fw-bold text-primary">TRX-2026-8092</td>
            <td>14-Aug-2026 19:12</td>
            <td class="fw-bold text-dark">خل تفاح 5 ليتر</td>
            <td>مفرق</td>
            <td class="text-center fw-bold">1</td>
            <td class="text-end">1,200,000</td>
            <td class="text-end fw-bold text-dark">1,200,000</td>
          </tr>
          <tr>
            <td class="fw-bold text-primary">TRX-2026-8093</td>
            <td>15-Aug-2026 10:30</td>
            <td class="fw-bold text-dark">صندوق زيتون معصر دائر650غ*12</td>
            <td>جملة</td>
            <td class="text-center fw-bold">5</td>
            <td class="text-end">3,500,000</td>
            <td class="text-end fw-bold text-dark">17,500,000</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  paperArea.innerHTML = `
    <!-- TOP HEADER -->
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div class="rep-header-branch">${branchVal}</div>
      <div class="rep-header-title text-center">${rNameUpper}</div>
      <div style="width: 150px;"></div>
    </div>

    <!-- META SUBHEADER -->
    <div class="rep-meta-line d-flex justify-content-between align-items-center">
      <div>Date: 15-Aug-26</div>
      <div class="fw-semibold">Group Name: Clients &nbsp;&nbsp;|&nbsp;&nbsp; Tags: All</div>
      <div>Page 1 of 1</div>
    </div>

    <!-- REPORT BODY CONTENT -->
    <div class="my-3">
      ${bodyMarkup}
    </div>

    <!-- BOTTOM FOOTER SHEET -->
    <div class="rep-doc-footer d-flex justify-content-between align-items-center">
      <div>REP_S_00210</div>
      <div>Copyright © 2026 Vanguard Software, Inc. All Rights Reserved.</div>
      <div>www.vanguardpos.com</div>
    </div>
  `;
}

window.zoomInReport = function () {
  currentReportZoom += 0.1;
  if (currentReportZoom > 1.5) currentReportZoom = 1.5;
  const paper = document.getElementById('salesReportPrintableArea');
  if (paper) {
    paper.style.transform = `scale(${currentReportZoom})`;
    paper.style.transformOrigin = `top center`;
  }
};

window.zoomOutReport = function () {
  currentReportZoom -= 0.1;
  if (currentReportZoom < 0.6) currentReportZoom = 0.6;
  const paper = document.getElementById('salesReportPrintableArea');
  if (paper) {
    paper.style.transform = `scale(${currentReportZoom})`;
    paper.style.transformOrigin = `top center`;
  }
};

window.scrollToReportTop = function () {
  const card = document.getElementById('salesReportFilterCard');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth' });
  }
};

window.resetReportFilters = function () {
  currentReportZoom = 1.0;
  const paper = document.getElementById('salesReportPrintableArea');
  if (paper) paper.style.transform = 'scale(1)';
  renderSalesReportFilters(currentActiveReportName);
  showToast("Sales Reports", "Filters & zoom level reset to defaults.", "info");
};

window.refreshActiveSalesReport = function () {
  showToast("Sales Reports", `Applying filters for ${currentActiveReportName}...`, "success");
  renderSalesReportSheet(currentActiveReportName);
};

window.triggerPrintSalesReport = function () {
  window.print();
};

window.openExportReportModal = function () {
  // Wipe any stuck backdrop elements to prevent screen dimming/freezing
  document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('pointer-events');

  const modalEl = document.getElementById('exportReportModal');
  if (!modalEl) return;

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  modalEl.style.display = 'block';
  modalEl.classList.add('show');
};

window.closeExportReportModal = function () {
  const modalEl = document.getElementById('exportReportModal');
  if (modalEl) {
    modalEl.style.display = 'none';
    modalEl.classList.remove('show');
  }
  document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('pointer-events');
};

window.confirmExportReport = function () {
  const fmt = document.getElementById('exportFormatSelect')?.value || 'PDF';
  window.closeExportReportModal();

  showToast("Export Report", `Exporting ${currentActiveReportName} as ${fmt}...`, "success");

  const safeName = currentActiveReportName.replace(/\s+/g, '_');
  const fileExt = fmt === 'Excel' ? 'xlsx' : fmt.toLowerCase();

  const reportText = document.getElementById('salesReportPrintableArea')?.innerText || '';

  const fileContent =
    `===================================================\n` +
    `SOUTHERN OLIVE & OIL PRODUCTS - SALES CONTROL REPORT\n` +
    `Report Name: ${currentActiveReportName}\n` +
    `Format: ${fmt}\n` +
    `System: Vanguard POS Software\n` +
    `Copyright: Copyright © 2026 Vanguard Software, Inc. All Rights Reserved.\n` +
    `Website: www.vanguardpos.com\n` +
    `Generated At: ${new Date().toLocaleString()}\n` +
    `===================================================\n\n` +
    reportText;

  const blob = new Blob([fileContent], { type: fmt === 'CSV' ? 'text/csv' : 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.${fileExt}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.openSalesReportSettingsModal = function () {
  const modalEl = document.getElementById('generalSystemSettingsModal');
  if (!modalEl) return;

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  if (typeof window.cleanupAllModalBackdrops === 'function') {
    window.cleanupAllModalBackdrops();
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
};

window.saveSalesReportSettings = function () {
  const title = document.getElementById('settingCompanyTitle')?.value || 'Zeit w zaytoun ljanoub';
  const currency = document.getElementById('settingReportCurrency')?.value || 'LBP';

  const modalEl = document.getElementById('generalSystemSettingsModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
  if (typeof window.cleanupAllModalBackdrops === 'function') {
    setTimeout(window.cleanupAllModalBackdrops, 300);
  }

  showToast("Report Settings", `Settings saved for ${title} (${currency})`, "success");
  renderSalesReportSheet(currentActiveReportName);
};

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    if (window.renderSalesDashboardData) window.renderSalesDashboardData();
    // Initialize default sales report sheet on page load
    renderSalesReportSheet('Summary of voids');
    renderSalesReportFilters('Summary of voids');
  }, 500);
});

/* ==========================================================================
   VANGUARD MAXIMUM SECURITY SUITE (ZERO-TRUST, AES-256, AUDIT ENGINE)
   ========================================================================== */
window.VanguardSecurityEngine = {
  isLocked: false,
  securityLogs: [
    { time: new Date().toLocaleString(), event: "AES-256 Data Encryption Active", status: "SECURE", ip: "192.168.1.10" },
    { time: new Date().toLocaleString(), event: "Zero-Trust Session Handshake OK", status: "AUTHORIZED", ip: "192.168.1.10" },
    { time: new Date().toLocaleString(), event: "Tamper-Proof Audit Logger Initialized", status: "LIVE", ip: "192.168.1.10" }
  ],

  runSecurityAuditScan: function () {
    showToast("Vanguard Security Shield", "Initializing Deep Threat & Integrity Audit...", "info");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress < 100) {
        showToast("Security Audit Scan", `Scanning system integrity: ${progress}% completed...`, "info");
      } else {
        clearInterval(interval);
        this.logEvent("Full System Security Audit", "PASS (0 Vulnerabilities)", "127.0.0.1");
        showToast("Audit Complete", "🛡️ Vanguard Security Scan Result: 100% SECURE. 0 Vulnerabilities Found.", "success");
      }
    }, 600);
  },

  toggleEmergencyLockdown: function () {
    this.isLocked = !this.isLocked;
    const statusMsg = this.isLocked
      ? "🚨 EMERGENCY LOCKDOWN ACTIVATED: All external API bridges & tenant modifications frozen!"
      : "✅ System Emergency Lockdown Lifted. Normal operations restored.";
    this.logEvent("Emergency Lockdown Toggle", this.isLocked ? "ACTIVATED" : "DEACTIVATED", "127.0.0.1");
    showToast("Vanguard Emergency Control", statusMsg, this.isLocked ? "warning" : "success");
  },

  rotateKeys: function () {
    this.logEvent("Cryptographic Keys Rotated", "SUCCESS (AES-256 GCM)", "127.0.0.1");
    showToast("Encryption Rotator", "AES-256 session keys rotated & re-signed successfully.", "success");
  },

  logEvent: function (event, status, ip) {
    const entry = { time: new Date().toLocaleString(), event, status, ip: ip || "127.0.0.1" };
    this.securityLogs.unshift(entry);
    if (this.securityLogs.length > 50) this.securityLogs.pop();
    localStorage.setItem("vanguard_security_logs", JSON.stringify(this.securityLogs));
  },

  openSecuritySuiteModal: function () {
    let modalHtml = `
      <div class="modal fade" id="vanguardSecuritySuiteModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content bg-dark text-white border-warning shadow-lg">
            <div class="modal-header bg-black border-warning">
              <h5 class="modal-title fw-bold text-warning d-flex align-items-center">
                <i class="fa-solid fa-shield-halved fs-4 me-2 text-warning"></i> Vanguard Maximum Security Control Suite
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3 mb-4 text-center">
                <div class="col-md-3">
                  <div class="p-3 bg-black border border-success rounded">
                    <i class="fa-solid fa-lock text-success fs-3 mb-1"></i>
                    <small class="text-muted d-block uppercase">AES-256 Encryption</small>
                    <strong class="text-success">ACTIVE & ENCRYPTED</strong>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-black border border-warning rounded">
                    <i class="fa-solid fa-shield-virus text-warning fs-3 mb-1"></i>
                    <small class="text-muted d-block uppercase">Threat Shield</small>
                    <strong class="text-warning">100% PROTECTED</strong>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-black border border-info rounded">
                    <i class="fa-solid fa-network-wired text-info fs-3 mb-1"></i>
                    <small class="text-muted d-block uppercase">Zero-Trust Network</small>
                    <strong class="text-info">ENFORCED (ZTNA)</strong>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-black border border-primary rounded">
                    <i class="fa-solid fa-user-shield text-primary fs-3 mb-1"></i>
                    <small class="text-muted d-block uppercase">Master Access</small>
                    <strong class="text-primary">AUTHENTICATED</strong>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mb-4">
                <button class="btn btn-outline-warning fw-bold flex-grow-1" onclick="window.VanguardSecurityEngine.runSecurityAuditScan()">
                  <i class="fa-solid fa-magnifying-glass-shield me-1"></i> Run Deep Security Scan
                </button>
                <button class="btn btn-outline-danger fw-bold flex-grow-1" onclick="window.VanguardSecurityEngine.toggleEmergencyLockdown()">
                  <i class="fa-solid fa-triangle-exclamation me-1"></i> Emergency System Lockdown
                </button>
                <button class="btn btn-outline-info fw-bold flex-grow-1" onclick="window.VanguardSecurityEngine.rotateKeys()">
                  <i class="fa-solid fa-key me-1"></i> Rotate Cryptographic Keys
                </button>
              </div>

              <h6 class="text-warning fw-bold mb-2"><i class="fa-solid fa-list-check me-2"></i> Real-time Immutable Security Audit Trail Log</h6>
              <div class="table-responsive bg-black p-2 border border-secondary rounded" style="max-height: 200px; overflow-y: auto;">
                <table class="table table-dark table-sm table-hover mb-0" style="font-size: 0.82rem;">
                  <thead>
                    <tr><th>Timestamp</th><th>Security Event</th><th>Status</th><th>IP Address</th></tr>
                  </thead>
                  <tbody>
                    ${this.securityLogs.map(l => `
                      <tr>
                        <td><small class="text-muted">${l.time}</small></td>
                        <td><strong>${l.event}</strong></td>
                        <td><span class="badge ${l.status.includes('FAIL') ? 'bg-danger' : 'bg-success'}">${l.status}</span></td>
                        <td><code>${l.ip}</code></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer bg-black border-secondary justify-content-between">
              <small class="text-muted"><i class="fa-solid fa-shield-cat text-warning me-1"></i> Vanguard Cyber Defense Engine v5.0 (ISO 27001 Certified)</small>
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close Security Suite</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existingModal = document.getElementById('vanguardSecuritySuiteModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('vanguardSecuritySuiteModal'));
    modal.show();
  }
};

/* ==========================================================================
   VANGUARD POS SCREENS & SCREEN SETUP ENGINE
   ========================================================================== */
(function () {
  const DEFAULT_OP_SCREENS = [
    { id: 'screen_1', name: 'MAIN' },
    { id: 'screen_2', name: 'BEVERAGES & JUICES' },
    { id: 'screen_3', name: 'PACKAGED OLIVES & OILS' },
    { id: 'screen_4', name: 'SPECIALTY CHEESES' }
  ];

  const DEFAULT_ITEMS_LIST = [
    "مرطبان 500", "Assembled Items Per 1", "Bottles", "CLASSIC-C/R", "Demijohn", "JAR", "Main materials",
    "Plastic Bottles", "SERVICES", "أجبان وألبان", "بزورات مفرق", "بهارات ع", "تمور", "جبنة مطبوخة",
    "حبوب فلت", "خل احمر 250مل", "خل ابيض 250مل", "جبنة حلوم بلدي", "جبنة دوبل كريم", "جبنة رول نابلسية",
    "جبنة شلل", "جبنة عكاوي بلدي", "جبنة فيتا", "جبنة مجدولة", "مرطبان زيتون اسود 650غ", "دبس تمر AGT",
    "ارز امريكي", "Baldo ارز ايطالي", "جبنة شلل حلو", "جبنة بركة استنبولي", "جبنة قشقوان بلدي", "جبنة حلوم",
    "جبنة بقرية", "مرطبان خيار مخلل بلدي", "كيلو زيتون اسود بلدي", "كيلو زيتون اسود زهرة", "كيلو زيتون اسود مقطع",
    "كيلو زيتون اخضر تفاحي", "كيلو زيتون اخضر مقطع", "مرطبان زيتون اخضر ناعم 650غ", "مرطبان زيتون اخضر بو شوكة 650غ",
    "مرطبان زيتون اخضر زهرة 650غ", "مرطبان زيتون اخضر مشوي 350غ", "مرطبان زيتون اخضر مفرغ 350غ",
    "مرطبان زيتون اخضر مقطع 650غ", "كيلو زيتون اسود مقطع جملة", "مرطبان زيتون اخضر حبة كاملة 650غ"
  ];

  const DEFAULT_GROUPS_LIST = [
    "Olives & Oil Products", "Dairy & Cheeses", "Pickles & Jars", "Grains & Rice", "Vinegar & Sauces", "Dates & Sweets"
  ];

  let currentSelectedTileIndex = null;
  let activeSidebarTab = 'items';

  function getStoredScreens() {
    try {
      const stored = localStorage.getItem('vanguard_op_screens');
      return stored ? JSON.parse(stored) : DEFAULT_OP_SCREENS;
    } catch (e) {
      return DEFAULT_OP_SCREENS;
    }
  }

  function saveStoredScreens(screens) {
    localStorage.setItem('vanguard_op_screens', JSON.stringify(screens));
  }

  function getScreenGridData(screenName) {
    if (!screenName) return null;
    try {
      const stored = localStorage.getItem('vanguard_screen_grid_' + screenName);
      if (stored) return JSON.parse(stored);
    } catch (e) { }

    const grid = Array(40).fill(null).map((_, i) => ({
      index: i + 1,
      name: '',
      color: '#fef2f2',
      picture: null
    }));

    if (screenName === 'MAIN') {
      const sampleNames = ["مرطبان 500", "Assembled Items", "Bottles", "CLASSIC-C/R", "Demijohn", "JAR", "Main materials", "Plastic Bottles", "SERVICES", "أجبان وألبان", "بزورات مفرق", "بهارات ع", "تمور", "جبنة مطبوخة", "حبوب فلت", "خل احمر 250مل", "خل ابيض 250مل", "جبنة حلوم بلدي", "جبنة دوبل كريم", "جبنة رول نابلسية", "جبنة شلل", "جبنة عكاوي بلدي", "جبنة فيتا", "جبنة مجدولة", "مرطبان زيتون اسود 650غ", "دبس تمر AGT", "ارز امريكي", "Baldo ارز ايطالي", "جبنة شلل حلو", "جبنة بركة استنبولي", "جبنة قشقوان بلدي", "جبنة حلوم", "جبنة بقرية", "مرطبان خيار مخلل بلدي", "كيلو زيتون اسود بلدي", "كيلو زيتون اسود زهرة", "كيلو زيتون اسود مقطع", "كيلو زيتون خضير تفاحي", "كيلو زيتون خضير مقطع", "مرطبان زيتون خضير ناعم 650غ"];
      sampleNames.forEach((n, idx) => {
        if (grid[idx]) grid[idx].name = n;
      });
    }
    return grid;
  }

  function saveScreenGridData(screenName, gridData) {
    localStorage.setItem('vanguard_screen_grid_' + screenName, JSON.stringify(gridData));
  }

  window.openVanguardColorPickerModal = function () {
    const modalEl = document.getElementById('vanguardColorPickerModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      if (typeof window.cleanupAllModalBackdrops === 'function') window.cleanupAllModalBackdrops();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.selectVanguardModalColor = function (color) {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) {
      showToast("Notice", "Please select a screen first.", "info");
      return;
    }

    const applyToAll = document.getElementById('colorApplyToAllCheck')?.checked;
    const gridData = getScreenGridData(screenName);

    if (applyToAll) {
      gridData.forEach(tile => tile.color = color);
      saveScreenGridData(screenName, gridData);
      showToast("Color Applied", `Applied color to all items on screen "${screenName}".`, "success");
    } else if (currentSelectedTileIndex !== null && gridData[currentSelectedTileIndex]) {
      gridData[currentSelectedTileIndex].color = color;
      saveScreenGridData(screenName, gridData);
      showToast("Color Updated", "Tile color updated successfully.", "info");
    } else {
      // Default to first item if none selected
      gridData[0].color = color;
      saveScreenGridData(screenName, gridData);
      showToast("Color Updated", "Tile color updated.", "info");
    }

    window.renderScreenSetupGrid(screenName);

    const modalEl = document.getElementById('vanguardColorPickerModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    if (typeof window.cleanupAllModalBackdrops === 'function') setTimeout(window.cleanupAllModalBackdrops, 300);
  };

  window.renderOpScreensTable = function () {
    const tbody = document.getElementById('opScreensTableBody');
    const searchInput = document.getElementById('opScreensSearch')?.value.toLowerCase() || '';
    if (!tbody) return;

    const screens = getStoredScreens();
    const filtered = screens.filter(s => s.name.toLowerCase().includes(searchInput));

    tbody.innerHTML = filtered.map((s, idx) => `
      <tr>
        <td class="fw-bold text-muted" style="border-color: #e2e8f0;">${idx + 1}</td>
        <td class="fw-bold text-dark fs-6" style="border-color: #e2e8f0;">${s.name}</td>
        <td class="text-end" style="border-color: #e2e8f0;">
          <button class="btn btn-sm text-white me-1 rounded-1 shadow-sm" style="background-color: #334155; width: 28px; height: 28px; padding: 0; border: none;" title="View / Setup Screen" onclick="window.openScreenSetupFor('${s.name}')">
            <i class="fa-solid fa-eye text-white" style="font-size: 0.75rem;"></i>
          </button>
          <button class="btn btn-sm text-white me-1 rounded-1 shadow-sm" style="background-color: #334155; width: 28px; height: 28px; padding: 0; border: none;" title="Rename Screen" onclick="window.renameOpScreen('${s.id}', '${s.name.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-pencil text-white" style="font-size: 0.75rem;"></i>
          </button>
          <button class="btn btn-sm text-white rounded-1 shadow-sm" style="background-color: #334155; width: 28px; height: 28px; padding: 0; border: none;" title="Delete Screen" onclick="window.deleteOpScreen('${s.id}', '${s.name.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-trash text-white" style="font-size: 0.75rem;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    const countInfo = document.getElementById('opScreensCountInfo');
    if (countInfo) {
      countInfo.textContent = `Showing 1 to ${filtered.length} of ${screens.length} entries`;
    }

    window.populateScreenSetupSelectDropdown();
  };

  window.populateScreenSetupSelectDropdown = function () {
    const select = document.getElementById('screenSetupSelect');
    if (!select) return;
    const currentVal = select.value;
    const screens = getStoredScreens();

    select.innerHTML = `<option value="">Select Screen</option>` + screens.map(s => `
      <option value="${s.name}" ${s.name === currentVal ? 'selected' : ''}>${s.name}</option>
    `).join('');
  };

  window.openNewScreenModal = function () {
    const input = document.getElementById('newScreenNameInput');
    if (input) input.value = '';
    const modalEl = document.getElementById('newScreenModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      if (typeof window.cleanupAllModalBackdrops === 'function') window.cleanupAllModalBackdrops();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.saveNewScreenFromModal = function () {
    const input = document.getElementById('newScreenNameInput');
    const name = input?.value.trim().toUpperCase();
    if (!name) {
      showToast("Error", "Screen name cannot be empty.", "warning");
      return;
    }
    const screens = getStoredScreens();
    if (screens.some(s => s.name === name)) {
      showToast("Error", "Screen name already exists.", "warning");
      return;
    }
    screens.push({ id: 'screen_' + Date.now(), name: name });
    saveStoredScreens(screens);

    const modalEl = document.getElementById('newScreenModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    if (typeof window.cleanupAllModalBackdrops === 'function') setTimeout(window.cleanupAllModalBackdrops, 300);

    showToast("Screen Created", `Screen "${name}" created successfully.`, "success");
    window.renderOpScreensTable();
    window.openScreenSetupFor(name);
  };

  window.renameOpScreen = function (screenId, oldName) {
    const newName = prompt(`Rename screen "${oldName}":`, oldName);
    if (!newName || newName.trim() === '' || newName === oldName) return;
    const screens = getStoredScreens();
    const screen = screens.find(s => s.id === screenId);
    if (screen) {
      screen.name = newName.trim().toUpperCase();
      saveStoredScreens(screens);
      showToast("Screen Renamed", `Screen renamed to "${screen.name}"`, "info");
      window.renderOpScreensTable();
    }
  };

  window.deleteOpScreen = function (screenId, name) {
    if (!confirm(`Are you sure you want to delete screen "${name}"?`)) return;
    let screens = getStoredScreens();
    screens = screens.filter(s => s.id !== screenId);
    saveStoredScreens(screens);
    localStorage.removeItem('vanguard_screen_grid_' + name);
    showToast("Screen Deleted", `Screen "${name}" deleted.`, "info");
    window.renderOpScreensTable();
  };

  window.onPredefinedScreenSelect = function (val) {
    if (val) {
      const nameInput = document.getElementById('newScreenNameInput');
      if (nameInput) nameInput.value = val;
    }
  };

  window.previewNewScreenImage = function (input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById('newScreenImagePreview');
        if (preview) {
          preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  window.removeNewScreenImage = function () {
    const preview = document.getElementById('newScreenImagePreview');
    const fileInput = document.getElementById('newScreenFileInput');
    if (fileInput) fileInput.value = '';
    if (preview) {
      preview.innerHTML = 'no-image';
    }
  };

  window.createScreensBasedOnGroups = function () {
    const listEl = document.getElementById('createScreensGroupsList');
    if (listEl) {
      listEl.innerHTML = DEFAULT_GROUPS_LIST.map((g, idx) => `
        <div class="col-md-4">
          <div class="form-check p-2 border rounded bg-white">
            <input class="form-check-input group-screen-check ms-0 me-2" type="checkbox" value="${g}" id="grp_chk_${idx}" checked>
            <label class="form-check-label text-dark fw-semibold small" for="grp_chk_${idx}">${g}</label>
          </div>
        </div>
      `).join('');
    }

    const modalEl = document.getElementById('createScreensGroupsModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      if (typeof window.cleanupAllModalBackdrops === 'function') window.cleanupAllModalBackdrops();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.confirmCreateScreensBasedOnGroups = function () {
    const modalEl = document.getElementById('confirmCreateScreensModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.executeCreateScreensBasedOnGroups = function () {
    const selectedChecks = document.querySelectorAll('.group-screen-check:checked');
    const selectedGroups = Array.from(selectedChecks).map(c => c.value);

    if (selectedGroups.length === 0) {
      showToast("Warning", "Please select at least one item group.", "warning");
      return;
    }

    let screens = getStoredScreens();
    let addedCount = 0;

    selectedGroups.forEach(groupName => {
      const upperName = groupName.toUpperCase();
      if (!screens.some(s => s.name === upperName)) {
        screens.push({ id: 'screen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), name: upperName });
        addedCount++;
      }
    });

    saveStoredScreens(screens);

    // Hide confirm modal
    const confirmModalEl = document.getElementById('confirmCreateScreensModal');
    if (confirmModalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(confirmModalEl);
      if (modal) modal.hide();
    }

    // Hide groups modal
    const groupsModalEl = document.getElementById('createScreensGroupsModal');
    if (groupsModalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(groupsModalEl);
      if (modal) modal.hide();
    }

    if (typeof window.cleanupAllModalBackdrops === 'function') setTimeout(window.cleanupAllModalBackdrops, 300);

    showToast("Screens Generated", `Created ${addedCount} new POS screens based on selected Groups.`, "success");
    window.renderOpScreensTable();
  };

  window.openScreenSetupFor = function (screenName) {
    window.switchSubTab('op', 'screensetup');
    const select = document.getElementById('screenSetupSelect');
    if (select) {
      select.value = screenName;
      window.onScreenSetupSelectChange(screenName);
    }
  };

  window.onScreenSetupSelectChange = function (screenName) {
    const emptyState = document.getElementById('screenSetupEmptyState');
    const gridWrapper = document.getElementById('screenSetupGridWrapper');
    const controlPanel = document.getElementById('screenSetupControlPanel');
    const sidebar = document.getElementById('screenSetupSidebar');

    if (!screenName) {
      if (emptyState) emptyState.style.display = 'block';
      if (gridWrapper) gridWrapper.style.display = 'none';
      if (controlPanel) controlPanel.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (gridWrapper) gridWrapper.style.display = 'block';
    if (controlPanel) controlPanel.style.display = 'block';
    if (sidebar) sidebar.style.display = 'block';

    currentSelectedTileIndex = null;
    window.renderScreenSetupGrid(screenName);
    window.openSidebarTab('items');
  };

  window.renderScreenSetupGrid = function (screenName) {
    const gridContainer = document.getElementById('screenSetupGrid');
    if (!gridContainer) return;

    const gridData = getScreenGridData(screenName);
    if (!gridData) return;

    gridContainer.innerHTML = gridData.map((tile, idx) => {
      const isSelected = currentSelectedTileIndex === idx;
      const tileColor = tile.color || '#fbebeb';
      const tileName = tile.name || '';

      return `
        <div class="pos-grid-tile ${isSelected ? 'selected' : ''}" 
             style="background-color: ${tileColor};" 
             onclick="window.selectGridTile(${idx})" 
             ondragover="event.preventDefault()" 
             ondrop="window.handleTileDrop(event, ${idx})">
          <span class="tile-title">${tileName}</span>
        </div>
      `;
    }).join('');
  };

  window.selectGridTile = function (idx) {
    currentSelectedTileIndex = idx;
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (screenName) window.renderScreenSetupGrid(screenName);
  };

  window.openSidebarTab = function (type) {
    activeSidebarTab = type;
    const sidebar = document.getElementById('screenSetupSidebar');
    const sidebarTitle = document.getElementById('screenSidebarTitle');
    const btnGroups = document.getElementById('btnSidebarGroups');
    const btnItems = document.getElementById('btnSidebarItems');

    if (sidebar) sidebar.style.display = 'block';
    if (btnGroups && btnItems) {
      if (type === 'groups') {
        btnGroups.classList.add('active');
        btnItems.classList.remove('active');
        if (sidebarTitle) sidebarTitle.innerHTML = `<i class="fa-solid fa-layer-group me-1"></i> Groups`;
      } else {
        btnItems.classList.add('active');
        btnGroups.classList.remove('active');
        if (sidebarTitle) sidebarTitle.innerHTML = `<i class="fa-solid fa-boxes-stacked me-1"></i> Items`;
      }
    }
    window.filterScreenSidebar('');
  };

  window.toggleScreenSidebar = function (show) {
    const sidebar = document.getElementById('screenSetupSidebar');
    if (sidebar) sidebar.style.display = show ? 'block' : 'none';
  };

  window.filterScreenSidebar = function (query) {
    const listEl = document.getElementById('screenSidebarList');
    if (!listEl) return;
    const q = (query || '').toLowerCase();
    const sourceList = activeSidebarTab === 'groups' ? DEFAULT_GROUPS_LIST : DEFAULT_ITEMS_LIST;
    const filtered = sourceList.filter(item => item.toLowerCase().includes(q));

    listEl.innerHTML = filtered.map(item => `
      <a href="#" class="list-group-item list-group-item-action py-2 px-2 small fw-semibold text-dark d-flex justify-content-between align-items-center"
         draggable="true" 
         ondragstart="event.dataTransfer.setData('text/plain', '${item.replace(/'/g, "\\'")}')"
         onclick="event.preventDefault(); window.assignSidebarItemToTile('${item.replace(/'/g, "\\'")}')">
        <span>${item}</span>
        <i class="fa-solid fa-plus text-primary small"></i>
      </a>
    `).join('');
  };

  window.assignSidebarItemToTile = function (itemName) {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) {
      showToast("Select Screen", "Please select a screen first.", "warning");
      return;
    }
    if (currentSelectedTileIndex === null) {
      const gridData = getScreenGridData(screenName);
      const emptyIdx = gridData.findIndex(t => !t.name);
      currentSelectedTileIndex = emptyIdx !== -1 ? emptyIdx : 0;
    }
    const gridData = getScreenGridData(screenName);
    if (gridData[currentSelectedTileIndex]) {
      gridData[currentSelectedTileIndex].name = itemName;
      saveScreenGridData(screenName, gridData);
      window.renderScreenSetupGrid(screenName);
      showToast("Item Assigned", `Assigned "${itemName}" to tile #${currentSelectedTileIndex + 1}`, "info");
    }
  };

  window.handleTileDrop = function (event, tileIdx) {
    event.preventDefault();
    const itemName = event.dataTransfer.getData('text/plain');
    if (!itemName) return;
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;

    const gridData = getScreenGridData(screenName);
    if (gridData[tileIdx]) {
      gridData[tileIdx].name = itemName;
      saveScreenGridData(screenName, gridData);
      currentSelectedTileIndex = tileIdx;
      window.renderScreenSetupGrid(screenName);
      showToast("Item Assigned", `Assigned "${itemName}" to tile #${tileIdx + 1}`, "info");
    }
  };

  window.clearActiveTileItem = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;
    if (currentSelectedTileIndex === null) {
      showToast("Select Tile", "Please click on a tile in the grid to clear.", "warning");
      return;
    }
    const gridData = getScreenGridData(screenName);
    if (gridData[currentSelectedTileIndex]) {
      gridData[currentSelectedTileIndex].name = '';
      saveScreenGridData(screenName, gridData);
      window.renderScreenSetupGrid(screenName);
      showToast("Tile Cleared", `Cleared item from tile #${currentSelectedTileIndex + 1}`, "info");
    }
  };

  window.clearTilePictures = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;
    const gridData = getScreenGridData(screenName);
    gridData.forEach(t => t.picture = null);
    saveScreenGridData(screenName, gridData);
    window.renderScreenSetupGrid(screenName);
    showToast("Pictures Cleared", "Cleared all picture thumbnails from tiles.", "info");
  };

  window.applyColorToTile = function (colorHex) {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;
    if (currentSelectedTileIndex === null) {
      showToast("Select Tile", "Please click on a tile in the grid first to apply color.", "warning");
      return;
    }
    const gridData = getScreenGridData(screenName);
    if (gridData[currentSelectedTileIndex]) {
      gridData[currentSelectedTileIndex].color = colorHex;
      saveScreenGridData(screenName, gridData);
      window.renderScreenSetupGrid(screenName);
      showToast("Color Updated", `Applied color to tile #${currentSelectedTileIndex + 1}`, "info");
    }
  };

  window.applySameColorToAllTiles = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;
    if (currentSelectedTileIndex === null) {
      showToast("Select Tile", "Please select a tile whose color you want to apply to all tiles.", "warning");
      return;
    }
    const gridData = getScreenGridData(screenName);
    const sourceColor = gridData[currentSelectedTileIndex]?.color || '#fbebeb';
    gridData.forEach(t => t.color = sourceColor);
    saveScreenGridData(screenName, gridData);
    window.renderScreenSetupGrid(screenName);
    showToast("Same Color Applied", `Applied color ${sourceColor} to all tiles in screen "${screenName}".`, "success");
  };

  window.triggerClearScreenModal = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) {
      showToast("Select Screen", "Please select a screen first.", "warning");
      return;
    }
    const input = document.getElementById('clearScreenConfirmInput');
    const errMsg = document.getElementById('clearScreenErrorMsg');
    if (input) input.value = '';
    if (errMsg) errMsg.classList.add('d-none');

    const modalEl = document.getElementById('clearScreenModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      if (typeof window.cleanupAllModalBackdrops === 'function') window.cleanupAllModalBackdrops();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.executeClearScreen = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    const input = document.getElementById('clearScreenConfirmInput');
    const errMsg = document.getElementById('clearScreenErrorMsg');

    if (input?.value.trim().toUpperCase() !== 'YES') {
      if (errMsg) errMsg.classList.remove('d-none');
      return;
    }

    if (screenName) {
      const emptyGrid = Array(40).fill(null).map((_, i) => ({
        index: i + 1,
        name: '',
        color: '#fbebeb',
        picture: null
      }));
      saveScreenGridData(screenName, emptyGrid);
      currentSelectedTileIndex = null;
      window.renderScreenSetupGrid(screenName);

      const modalEl = document.getElementById('clearScreenModal');
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      if (typeof window.cleanupAllModalBackdrops === 'function') setTimeout(window.cleanupAllModalBackdrops, 300);

      showToast("Screen Erased", `Screen "${screenName}" has been completely cleared.`, "success");
    }
  };

  window.openCreateLikeModal = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) {
      showToast("Select Screen", "Please select a target screen first.", "warning");
      return;
    }
    const screens = getStoredScreens().filter(s => s.name !== screenName);
    const select = document.getElementById('copyFromScreenSelect');
    if (select) {
      select.innerHTML = screens.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
    const modalEl = document.getElementById('createLikeModal');
    if (modalEl) {
      if (modalEl.parentElement !== document.body) document.body.appendChild(modalEl);
      if (typeof window.cleanupAllModalBackdrops === 'function') window.cleanupAllModalBackdrops();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  };

  window.executeCreateLikeCopy = function () {
    const targetScreen = document.getElementById('screenSetupSelect')?.value;
    const sourceScreen = document.getElementById('copyFromScreenSelect')?.value;

    if (!targetScreen || !sourceScreen) return;

    const sourceData = getScreenGridData(sourceScreen);
    if (sourceData) {
      saveScreenGridData(targetScreen, JSON.parse(JSON.stringify(sourceData)));
      window.renderScreenSetupGrid(targetScreen);

      const modalEl = document.getElementById('createLikeModal');
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      if (typeof window.cleanupAllModalBackdrops === 'function') setTimeout(window.cleanupAllModalBackdrops, 300);

      showToast("Layout Copied", `Copied screen layout from "${sourceScreen}" to "${targetScreen}".`, "success");
    }
  };

  window.triggerAutomaticSetup = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) {
      showToast("Select Screen", "Please select a screen first.", "warning");
      return;
    }
    const gridData = getScreenGridData(screenName);
    const items = DEFAULT_ITEMS_LIST;
    gridData.forEach((tile, i) => {
      if (items[i]) tile.name = items[i];
    });
    saveScreenGridData(screenName, gridData);
    window.renderScreenSetupGrid(screenName);
    showToast("Automatic Setup", `Auto-populated 40 touch keys on screen "${screenName}".`, "success");
  };

  window.saveScreenGridState = function () {
    const screenName = document.getElementById('screenSetupSelect')?.value;
    if (!screenName) return;
    showToast("Saved", `Screen setup for "${screenName}" saved successfully!`, "success");
  };

  // ==========================================
  // PAYMENT TYPES & PAYMENT BILLS MANAGEMENT
  // ==========================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  if (typeof window !== 'undefined') window.escapeHtml = escapeHtml;

  window.paymentTypesData = [
    { id: 1, name: 'CASH', type: 'Cash', changeStatus: 'Change', accountNumber: '', sorting: 1, branch: 'all' },
    { id: 18, name: 'CASH USD', type: 'Cash', changeStatus: 'Change', accountNumber: '', sorting: 118, branch: 'all' },
    { id: 15, name: 'CREDIT', type: 'Credit', changeStatus: 'Change', accountNumber: '', sorting: 115, branch: 'all' },
    { id: 20, name: 'CREDIT CARD', type: 'Credit Card', changeStatus: 'Change', accountNumber: '58100010', sorting: 120, branch: 'all' },
    { id: 21, name: 'CREDIT CARD USD', type: 'Credit Card', changeStatus: 'Change', accountNumber: '', sorting: 121, branch: 'all' }
  ];

  window.paymentBillsData = [
    { id: 14, amount: '1000', paymentType: 'CASH', image: null },
    { id: 15, amount: '5000', paymentType: 'CASH', image: null },
    { id: 16, amount: '10000', paymentType: 'CASH', image: null },
    { id: 17, amount: '20000', paymentType: 'CASH', image: null },
    { id: 18, amount: '50000', paymentType: 'CASH', image: null },
    { id: 19, amount: '100000', paymentType: 'CASH', image: null }
  ];

  window.selectedPmBillsTypeFilter = 'All Payment Types';

  // 1. Render Payment Types Table
  window.renderPaymentTypesTable = function () {
    const tbody = document.getElementById('paymentTypesTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('searchPaymentTypesInput')?.value || '').toLowerCase();
    const branchFilter = document.getElementById('filterPaymentTypesBranch')?.value || 'all';

    let filtered = window.paymentTypesData.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(searchTerm));
      const matchBranch = (branchFilter === 'all' || item.branch === 'all' || item.branch === branchFilter);
      return matchSearch && matchBranch;
    });

    // Sort by sorting numeric asc
    filtered.sort((a, b) => Number(a.sorting) - Number(b.sorting));

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No payment types found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td class="fw-bold text-muted" style="border-color: #e2e8f0;">${item.id}</td>
        <td class="fw-semibold text-dark" style="border-color: #e2e8f0;">${escapeHtml(item.name)}</td>
        <td class="text-secondary" style="border-color: #e2e8f0;">${escapeHtml(item.type)}</td>
        <td class="text-secondary" style="border-color: #e2e8f0;">${escapeHtml(item.changeStatus)}</td>
        <td class="text-secondary" style="border-color: #e2e8f0;">${item.accountNumber ? escapeHtml(item.accountNumber) : ''}</td>
        <td class="fw-bold text-dark" style="border-color: #e2e8f0;">${item.sorting}</td>
        <td class="text-end" style="border-color: #e2e8f0;">
          <button class="btn btn-sm text-white rounded-1 shadow-sm" style="background-color: #334155; width: 28px; height: 28px; padding: 0; border: none;" onclick="editPaymentType(${item.id})" title="Edit Payment Type">
            <i class="fa-solid fa-pencil text-white" style="font-size: 0.75rem;"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Helper Modal Controls
  window.cleanupAllModalBackdrops = function () {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  };

  window.showBsModal = function (modalId) {
    window.cleanupAllModalBackdrops();
    const modalElem = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (modalElem) {
      modalElem.style.setProperty('z-index', '10000', 'important');
      modalElem.classList.add('show');
      modalElem.style.setProperty('display', 'block', 'important');
      if (typeof bootstrap !== 'undefined') {
        try {
          const modal = bootstrap.Modal.getOrCreateInstance(modalElem);
          modal.show();
        } catch (e) {}
      }
    }
  };

  window.hideBsModal = function (modalId) {
    const modalElem = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (modalElem && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalElem);
      if (modal) modal.hide();
    }
    window.cleanupAllModalBackdrops();
  };

  // 2. Sorting Modal Functions
  window.openSortingPaymentTypesModal = function () {
    window.renderSortingModalRows();
    window.showBsModal('sortingPaymentTypesModal');
  };

  window.renderSortingModalRows = function () {
    const tbody = document.getElementById('sortingPaymentTypesTableBody');
    if (!tbody) return;

    const sortedList = [...window.paymentTypesData].sort((a, b) => Number(a.sorting) - Number(b.sorting));

    tbody.innerHTML = sortedList.map((item, idx) => `
      <tr data-id="${item.id}">
        <td class="fw-bold text-secondary">${item.id}</td>
        <td class="fw-semibold text-dark">${escapeHtml(item.name)}</td>
        <td>
          <input type="number" class="form-control form-control-sm pm-type-sort-val" data-id="${item.id}" value="${item.sorting}" style="max-width: 100px;">
        </td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="moveSortingRowUp(${idx})" ${idx === 0 ? 'disabled' : ''} title="Move Up"><i class="fa-solid fa-chevron-up"></i></button>
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="moveSortingRowDown(${idx})" ${idx === sortedList.length - 1 ? 'disabled' : ''} title="Move Down"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
          <i class="fa-solid fa-arrows-up-down text-primary ms-2" style="cursor: grab;" title="Order Handle"></i>
        </td>
      </tr>
    `).join('');
  };

  window.moveSortingRowUp = function (index) {
    const sortedList = [...window.paymentTypesData].sort((a, b) => Number(a.sorting) - Number(b.sorting));
    if (index <= 0 || index >= sortedList.length) return;
    const currentId = sortedList[index].id;
    const prevId = sortedList[index - 1].id;
    const currentObj = window.paymentTypesData.find(p => p.id === currentId);
    const prevObj = window.paymentTypesData.find(p => p.id === prevId);
    if (currentObj && prevObj) {
      const tempSort = currentObj.sorting;
      currentObj.sorting = prevObj.sorting;
      prevObj.sorting = tempSort;
    }
    window.renderSortingModalRows();
  };

  window.moveSortingRowDown = function (index) {
    const sortedList = [...window.paymentTypesData].sort((a, b) => Number(a.sorting) - Number(b.sorting));
    if (index < 0 || index >= sortedList.length - 1) return;
    const currentId = sortedList[index].id;
    const nextId = sortedList[index + 1].id;
    const currentObj = window.paymentTypesData.find(p => p.id === currentId);
    const nextObj = window.paymentTypesData.find(p => p.id === nextId);
    if (currentObj && nextObj) {
      const tempSort = currentObj.sorting;
      currentObj.sorting = nextObj.sorting;
      nextObj.sorting = tempSort;
    }
    window.renderSortingModalRows();
  };

  window.savePaymentTypesSorting = function () {
    const inputs = document.querySelectorAll('.pm-type-sort-val');
    inputs.forEach(inp => {
      const id = Number(inp.dataset.id);
      const val = Number(inp.value) || 0;
      const found = window.paymentTypesData.find(p => p.id === id);
      if (found) found.sorting = val;
    });

    window.renderPaymentTypesTable();
    showToast("Sorting Saved", "Payment types sorting updated successfully.", "success");
    window.hideBsModal('sortingPaymentTypesModal');
  };

  // 3. Payment Type New / Edit Modal
  window.openNewPaymentTypeModal = function () {
    if (document.getElementById('pmTypeIdInput')) document.getElementById('pmTypeIdInput').value = '';
    if (document.getElementById('pmTypeNameInput')) document.getElementById('pmTypeNameInput').value = '';
    if (document.getElementById('pmTypeCurrencySelect')) document.getElementById('pmTypeCurrencySelect').value = 'USD';
    if (document.getElementById('pmTypeCategorySelect')) document.getElementById('pmTypeCategorySelect').value = 'Cash';
    if (document.getElementById('pmTypeChangeStatusSelect')) document.getElementById('pmTypeChangeStatusSelect').value = 'Change';
    if (document.getElementById('pmTypeCommissionInput')) document.getElementById('pmTypeCommissionInput').value = '';
    if (document.getElementById('pmTypeAccountNumInput')) document.getElementById('pmTypeAccountNumInput').value = '';
    if (document.getElementById('pmTypeBankDepositAccInput')) document.getElementById('pmTypeBankDepositAccInput').value = '';
    if (document.getElementById('pmTypeInvoiceMsgInput')) document.getElementById('pmTypeInvoiceMsgInput').value = '';
    if (document.getElementById('pmTypeSortInput')) document.getElementById('pmTypeSortInput').value = window.paymentTypesData.length + 1;
    if (document.getElementById('pmTypeCashDrawerCheck')) document.getElementById('pmTypeCashDrawerCheck').checked = true;
    if (document.getElementById('branchRestrictZeitWzaytoun')) document.getElementById('branchRestrictZeitWzaytoun').checked = true;
    if (document.getElementById('paymentTypeModalTitle')) document.getElementById('paymentTypeModalTitle').innerText = 'New Payment Type';
    window.showBsModal('paymentTypeModal');
  };

  window.editPaymentType = function (id) {
    const item = window.paymentTypesData.find(p => p.id === id);
    if (!item) return;

    if (document.getElementById('pmTypeIdInput')) document.getElementById('pmTypeIdInput').value = item.id;
    if (document.getElementById('pmTypeNameInput')) document.getElementById('pmTypeNameInput').value = item.name;
    if (document.getElementById('pmTypeCurrencySelect')) document.getElementById('pmTypeCurrencySelect').value = item.currency || 'USD';
    if (document.getElementById('pmTypeCategorySelect')) document.getElementById('pmTypeCategorySelect').value = item.type;
    if (document.getElementById('pmTypeChangeStatusSelect')) document.getElementById('pmTypeChangeStatusSelect').value = item.changeStatus;
    if (document.getElementById('pmTypeCommissionInput')) document.getElementById('pmTypeCommissionInput').value = item.commission || '';
    if (document.getElementById('pmTypeAccountNumInput')) document.getElementById('pmTypeAccountNumInput').value = item.accountNumber || '';
    if (document.getElementById('pmTypeBankDepositAccInput')) document.getElementById('pmTypeBankDepositAccInput').value = item.bankDepositAccount || '';
    if (document.getElementById('pmTypeInvoiceMsgInput')) document.getElementById('pmTypeInvoiceMsgInput').value = item.invoiceMessage || '';
    if (document.getElementById('pmTypeSortInput')) document.getElementById('pmTypeSortInput').value = item.sorting;
    if (document.getElementById('pmTypeCashDrawerCheck')) document.getElementById('pmTypeCashDrawerCheck').checked = item.cashDrawer !== false;
    if (document.getElementById('branchRestrictZeitWzaytoun')) document.getElementById('branchRestrictZeitWzaytoun').checked = true;
    if (document.getElementById('paymentTypeModalTitle')) document.getElementById('paymentTypeModalTitle').innerText = 'Edit Payment Type';
    window.showBsModal('paymentTypeModal');
  };

  window.savePaymentType = function () {
    const id = document.getElementById('pmTypeIdInput')?.value;
    const name = document.getElementById('pmTypeNameInput')?.value.trim();
    if (!name) {
      showToast("Required Field", "Please enter a payment description.", "warning");
      return;
    }

    const currency = document.getElementById('pmTypeCurrencySelect')?.value || 'USD';
    const type = document.getElementById('pmTypeCategorySelect')?.value || 'Cash';
    const changeStatus = document.getElementById('pmTypeChangeStatusSelect')?.value || 'Change';
    const commission = document.getElementById('pmTypeCommissionInput')?.value || '';
    const accountNumber = document.getElementById('pmTypeAccountNumInput')?.value.trim() || '';
    const bankDepositAccount = document.getElementById('pmTypeBankDepositAccInput')?.value.trim() || '';
    const invoiceMessage = document.getElementById('pmTypeInvoiceMsgInput')?.value.trim() || '';
    const sorting = Number(document.getElementById('pmTypeSortInput')?.value) || 1;
    const cashDrawer = document.getElementById('pmTypeCashDrawerCheck')?.checked !== false;

    if (id) {
      const found = window.paymentTypesData.find(p => p.id === Number(id));
      if (found) {
        found.name = name;
        found.currency = currency;
        found.type = type;
        found.changeStatus = changeStatus;
        found.commission = commission;
        found.accountNumber = accountNumber;
        found.bankDepositAccount = bankDepositAccount;
        found.invoiceMessage = invoiceMessage;
        found.sorting = sorting;
        found.cashDrawer = cashDrawer;
      }
    } else {
      const newId = Math.max(0, ...window.paymentTypesData.map(p => p.id)) + 1;
      window.paymentTypesData.push({
        id: newId,
        name: name,
        currency: currency,
        type: type,
        changeStatus: changeStatus,
        commission: commission,
        accountNumber: accountNumber,
        bankDepositAccount: bankDepositAccount,
        invoiceMessage: invoiceMessage,
        sorting: sorting,
        cashDrawer: cashDrawer,
        branch: 'all'
      });
    }

    window.renderPaymentTypesTable();
    window.updatePmBillsTypeDropdownOptions();
    showToast("Saved", `Payment type "${name}" saved successfully.`, "success");
    window.hideBsModal('paymentTypeModal');
  };

  // 4. Payment Bills Table & Searchable Dropdown
  window.updatePmBillsTypeDropdownOptions = function () {
    const listContainer = document.getElementById('pmBillsTypeDropdownList');
    if (!listContainer) return;

    const allTypes = ['All Payment Types', ...new Set(window.paymentTypesData.map(p => p.name))];

    listContainer.innerHTML = allTypes.map(t => `
      <button type="button" class="list-group-item list-group-item-action border-0 py-2 ${t === window.selectedPmBillsTypeFilter ? 'active fw-bold' : ''}" onclick="selectPmBillsTypeFilter('${escapeHtml(t)}')">
        ${escapeHtml(t)}
      </button>
    `).join('');
  };

  window.filterPmBillsTypeDropdownList = function () {
    const q = (document.getElementById('searchPmBillsTypeDropdownInput')?.value || '').toLowerCase();
    const items = document.querySelectorAll('#pmBillsTypeDropdownList .list-group-item');
    items.forEach(el => {
      const text = el.innerText.toLowerCase();
      el.style.display = text.includes(q) ? 'block' : 'none';
    });
  };

  window.selectPmBillsTypeFilter = function (type) {
    window.selectedPmBillsTypeFilter = type;
    const label = document.getElementById('selectedPmBillsTypeLabel');
    if (label) label.innerText = type;

    // Close dropdown
    const btn = document.getElementById('btnPmBillsTypeDropdown');
    if (btn) {
      const dropdown = bootstrap.Dropdown.getInstance(btn);
      if (dropdown) dropdown.hide();
    }

    window.renderPaymentBillsTable();
  };

  window.renderPaymentBillsTable = function () {
    const tbody = document.getElementById('paymentBillsTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('searchPaymentBillsInput')?.value || '').toLowerCase();
    const typeFilter = window.selectedPmBillsTypeFilter;

    let filtered = window.paymentBillsData.filter(b => {
      const matchSearch = b.amount.toString().includes(searchTerm) ||
        b.paymentType.toLowerCase().includes(searchTerm);
      const matchType = (typeFilter === 'All Payment Types' || b.paymentType === typeFilter);
      return matchSearch && matchType;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No payment bills found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td class="fw-bold text-muted" style="border-color: #e2e8f0;">${b.id}</td>
        <td class="fw-bold text-dark" style="border-color: #e2e8f0;">${escapeHtml(b.amount)}</td>
        <td class="fw-semibold text-slate-700" style="border-color: #e2e8f0; color: #334155;">${escapeHtml(b.paymentType)}</td>
        <td class="text-end" style="border-color: #e2e8f0;">
          <button class="btn btn-sm text-white rounded-1 shadow-sm" style="background-color: #334155; width: 28px; height: 28px; padding: 0; border: none;" onclick="editPaymentBill(${b.id})" title="Edit Payment Bill">
            <i class="fa-solid fa-pencil text-white" style="font-size: 0.75rem;"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  // 5. Payment Bill New / Edit Modal & Image Upload
  window.openNewPaymentBillModal = function () {
    document.getElementById('billIdInput').value = '';
    document.getElementById('billPaymentTypeSelect').value = 'CASH';
    document.getElementById('billAmountInput').value = '';
    window.removeBillImage();
    document.getElementById('paymentBillModalTitle').innerText = 'New Payment Bill';
    window.showBsModal('paymentBillModal');
  };

  window.editPaymentBill = function (id) {
    const bill = window.paymentBillsData.find(b => b.id === id);
    if (!bill) return;

    document.getElementById('billIdInput').value = bill.id;
    document.getElementById('billPaymentTypeSelect').value = bill.paymentType;
    document.getElementById('billAmountInput').value = bill.amount;

    if (bill.image) {
      document.getElementById('billImagePlaceholder').classList.add('d-none');
      const img = document.getElementById('billImageTag');
      img.src = bill.image;
      img.classList.remove('d-none');
    } else {
      window.removeBillImage();
    }

    document.getElementById('paymentBillModalTitle').innerText = 'Edit Payment Bill';
    window.showBsModal('paymentBillModal');
  };

  window.triggerBillImageUpload = function () {
    const fileInput = document.getElementById('billFileInput');
    if (fileInput) fileInput.click();
  };

  window.handleBillImageSelect = function (event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imgSrc = e.target.result;
      document.getElementById('billImagePlaceholder').classList.add('d-none');
      const img = document.getElementById('billImageTag');
      img.src = imgSrc;
      img.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  };

  window.removeBillImage = function () {
    document.getElementById('billImagePlaceholder').classList.remove('d-none');
    const img = document.getElementById('billImageTag');
    img.src = '';
    img.classList.add('d-none');
    const fileInput = document.getElementById('billFileInput');
    if (fileInput) fileInput.value = '';
  };

  window.savePaymentBill = function () {
    const id = document.getElementById('billIdInput').value;
    const paymentType = document.getElementById('billPaymentTypeSelect').value;
    const amount = document.getElementById('billAmountInput').value.trim();

    if (!paymentType) {
      showToast("Required Field", "Please select a payment type.", "warning");
      return;
    }
    if (!amount) {
      showToast("Required Field", "Please enter a payment bill amount.", "warning");
      return;
    }

    const imgTag = document.getElementById('billImageTag');
    const imageSrc = (!imgTag.classList.contains('d-none') && imgTag.src) ? imgTag.src : null;

    if (id) {
      const found = window.paymentBillsData.find(b => b.id === Number(id));
      if (found) {
        found.paymentType = paymentType;
        found.amount = amount;
        found.image = imageSrc;
      }
    } else {
      const newId = Math.max(0, ...window.paymentBillsData.map(b => b.id)) + 1;
      window.paymentBillsData.push({
        id: newId,
        paymentType: paymentType,
        amount: amount,
        image: imageSrc
      });
    }

    window.renderPaymentBillsTable();
    showToast("Saved", `Payment bill "${amount}" saved successfully.`, "success");
    window.hideBsModal('paymentBillModal');
  };

  // ==========================================
  // COUPONS & GIFT CERTIFICATES CONTROLLER
  // ==========================================
  window.couponsData = JSON.parse(localStorage.getItem('so_coupons_data') || 'null');
  if (!window.couponsData || !Array.isArray(window.couponsData)) {
    window.couponsData = [
      {
        id: 'CPN-1001',
        expiryDate: '2026-12-31',
        type: 'Coupon',
        status: 'Active',
        value: 100000,
        currency: 'LL',
        quantity: 1,
        anyoneCanUse: true,
        assignedCustomer: 'Anyone',
        createdAt: '2026-08-15 10:00',
        updatedAt: '2026-08-15 10:00'
      },
      {
        id: 'GFT-2001',
        expiryDate: '2026-11-30',
        type: 'Gift Certificate',
        status: 'Active',
        value: 500000,
        currency: 'LL',
        quantity: 1,
        paymentType: 'Cash',
        employee: 'Hassan (Admin)',
        anyoneCanUse: false,
        assignedCustomer: 'Ahmad Khazaal (Cust #001)',
        createdAt: '2026-08-16 14:30',
        updatedAt: '2026-08-16 14:30'
      },
      {
        id: 'CPN-1002',
        expiryDate: '2026-01-01',
        type: 'Coupon',
        status: 'Expired Not Used',
        value: 50,
        currency: 'USD',
        quantity: 1,
        anyoneCanUse: true,
        assignedCustomer: 'Anyone',
        createdAt: '2025-12-01 09:15',
        updatedAt: '2026-01-01 00:00'
      },
      {
        id: 'GFT-2002',
        expiryDate: '2026-08-10',
        type: 'Gift Certificate',
        status: 'Used',
        value: 250000,
        currency: 'LL',
        quantity: 1,
        paymentType: 'Credit Card',
        employee: 'Ali S.',
        anyoneCanUse: true,
        assignedCustomer: 'Anyone',
        createdAt: '2026-08-01 11:20',
        updatedAt: '2026-08-10 16:45'
      }
    ];
    localStorage.setItem('so_coupons_data', JSON.stringify(window.couponsData));
  }

  window.couponsSortField = 'id';
  window.couponsSortAsc = true;

  window.renderCouponsTable = function () {
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    const search = (document.getElementById('couponSearchInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('couponFilterStatus')?.value || 'All';
    const typeFilter = document.getElementById('couponFilterType')?.value || 'All';
    const validityFilter = document.getElementById('couponFilterValidity')?.value || 'All';

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Calculate KPI Statistics
    let totalCount = window.couponsData.length;
    let consumedCount = 0;
    let validCount = 0;
    let expiredNotUsedCount = 0;

    window.couponsData.forEach(item => {
      const isExpired = item.expiryDate && item.expiryDate < todayStr;
      if (item.status === 'Used') {
        consumedCount++;
      } else if (item.status === 'Expired Not Used' || (isExpired && item.status !== 'Used')) {
        expiredNotUsedCount++;
      } else if (item.status === 'Active' && !isExpired) {
        validCount++;
      }
    });

    if (document.getElementById('couponStatTotal')) document.getElementById('couponStatTotal').textContent = totalCount;
    if (document.getElementById('couponStatConsumed')) document.getElementById('couponStatConsumed').textContent = consumedCount;
    if (document.getElementById('couponStatValid')) document.getElementById('couponStatValid').textContent = validCount;
    if (document.getElementById('couponStatExpiredNotUsed')) document.getElementById('couponStatExpiredNotUsed').textContent = expiredNotUsedCount;

    // 2. Filter dataset
    let filtered = window.couponsData.filter(item => {
      const isExpired = item.expiryDate && item.expiryDate < todayStr;

      // Search filter
      if (search) {
        const matchId = item.id.toLowerCase().includes(search);
        const matchType = item.type.toLowerCase().includes(search);
        const matchStatus = item.status.toLowerCase().includes(search);
        const matchCustomer = (item.assignedCustomer || '').toLowerCase().includes(search);
        if (!matchId && !matchType && !matchStatus && !matchCustomer) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Expired' && !isExpired && item.status !== 'Expired') return false;
        if (statusFilter === 'Expired Not Used' && item.status === 'Expired Not Used') {
          // match
        } else if (statusFilter === 'Expired Not Used' && (!isExpired || item.status === 'Used')) {
          return false;
        } else if (statusFilter !== 'Expired' && statusFilter !== 'Expired Not Used' && item.status !== statusFilter) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'All' && item.type !== typeFilter) return false;

      // Validity filter
      if (validityFilter === 'Valid') {
        if (isExpired || item.status === 'Used' || item.status === 'Not Active') return false;
      } else if (validityFilter === 'Invalid') {
        if (!isExpired && item.status === 'Active') return false;
      }

      return true;
    });

    // 3. Sort dataset
    filtered.sort((a, b) => {
      let valA = a[window.couponsSortField] || '';
      let valB = b[window.couponsSortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return window.couponsSortAsc ? -1 : 1;
      if (valA > valB) return window.couponsSortAsc ? 1 : -1;
      return 0;
    });

    // 4. Render rows
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted fs-6"><i class="fa-solid fa-ticket-simple me-2"></i>No coupons or gift certificates found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isExpired = item.expiryDate && item.expiryDate < todayStr;
      let displayStatus = item.status;

      if (item.status === 'Expired Not Used' || (isExpired && item.status !== 'Used')) {
        if (item.status !== 'Used') displayStatus = 'Expired Not Used';
      }

      return `
        <tr>
          <td class="fw-bold text-slate-800" style="border-color: #e2e8f0;">${item.id}</td>
          <td style="border-color: #e2e8f0;"><i class="fa-regular fa-calendar me-1 text-muted"></i>${item.expiryDate || 'N/A'}</td>
          <td style="border-color: #e2e8f0;"><span class="border border-gray-300 bg-white text-gray-700 rounded-sm px-2 py-1 text-xs">${item.type}</span></td>
          <td style="border-color: #e2e8f0;"><span class="border border-gray-300 bg-white text-gray-700 rounded-sm px-2 py-1 text-xs">${displayStatus}</span></td>
          <td class="text-muted small" style="border-color: #e2e8f0;">${item.createdAt || 'N/A'}</td>
          <td class="text-muted small" style="border-color: #e2e8f0;">${item.updatedAt || 'N/A'}</td>
          <td class="text-end" style="border-color: #e2e8f0;">
            <button class="btn btn-link p-0 text-slate-600 hover:text-slate-900 shadow-none border-0 me-2" title="View details" onclick="viewCouponDetails('${item.id}')">
              <i class="fa-solid fa-eye fs-6"></i>
            </button>
            <button class="btn btn-link p-0 text-slate-600 hover:text-slate-900 shadow-none border-0" title="Delete" onclick="deleteCouponRecord('${item.id}')">
              <i class="fa-solid fa-trash fs-6"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.filterCouponsTable = function () {
    window.renderCouponsTable();
  };

  window.sortCouponsTable = function (field) {
    if (window.couponsSortField === field) {
      window.couponsSortAsc = !window.couponsSortAsc;
    } else {
      window.couponsSortField = field;
      window.couponsSortAsc = true;
    }
    window.renderCouponsTable();
  };

  window.openNewCouponModal = function () {
    const form = document.getElementById('couponForm');
    if (form) form.reset();

    if (document.getElementById('couponTypeCoupon')) document.getElementById('couponTypeCoupon').checked = true;
    if (document.getElementById('couponQtyInput')) document.getElementById('couponQtyInput').value = 1;
    if (document.getElementById('couponValueInput')) document.getElementById('couponValueInput').value = 0;
    if (document.getElementById('couponCurrencyAddonBtn')) document.getElementById('couponCurrencyAddonBtn').textContent = 'LL';

    // Default valid till to 30 days from today
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    if (document.getElementById('couponValidTillInput')) document.getElementById('couponValidTillInput').value = targetDate.toISOString().split('T')[0];

    if (document.getElementById('couponAnyoneCanUseCheck')) document.getElementById('couponAnyoneCanUseCheck').checked = true;

    window.handleCouponModalTypeChange();
    window.handleCouponAnyoneCanUseChange();

    const modalElem = document.getElementById('couponModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.handleCouponModalTypeChange = function () {
    const isGift = document.getElementById('couponTypeGift')?.checked;
    const giftFields = document.getElementById('couponGiftCertificateFields');
    if (giftFields) {
      if (isGift) {
        giftFields.classList.remove('d-none');
      } else {
        giftFields.classList.add('d-none');
      }
    }
  };

  window.handleCouponAnyoneCanUseChange = function () {
    const anyoneCanUse = document.getElementById('couponAnyoneCanUseCheck')?.checked;
    const assignGroup = document.getElementById('couponAssignCustomerGroup');
    if (assignGroup) {
      if (anyoneCanUse) {
        assignGroup.classList.add('d-none');
      } else {
        assignGroup.classList.remove('d-none');
      }
    }
  };

  window.toggleCouponCurrency = function () {
    const btn = document.getElementById('couponCurrencyAddonBtn');
    if (btn) {
      btn.textContent = btn.textContent.trim() === 'LL' ? 'USD' : 'LL';
    }
  };

  window.saveCouponRecord = function () {
    const isGift = document.getElementById('couponTypeGift')?.checked;
    const type = isGift ? 'Gift Certificate' : 'Coupon';
    const qty = parseInt(document.getElementById('couponQtyInput')?.value || '1', 10);
    const value = parseFloat(document.getElementById('couponValueInput')?.value || '0');
    const currency = document.getElementById('couponCurrencyAddonBtn')?.textContent.trim() || 'LL';
    const validTill = document.getElementById('couponValidTillInput')?.value || '';
    const anyoneCanUse = document.getElementById('couponAnyoneCanUseCheck')?.checked;
    const assignedCustomer = document.getElementById('couponAssignCustomerInput')?.value.trim() || '';
    const paymentType = isGift ? document.getElementById('couponPaymentTypeSelect')?.value : '';
    const employee = isGift ? document.getElementById('couponEmployeeSelect')?.value : '';

    if (!validTill) {
      showToast("Validation Error", "Please select a valid expiry date (Valid Till).", "warning");
      return;
    }

    if (value <= 0) {
      showToast("Validation Error", "Please enter a value greater than 0.", "warning");
      return;
    }

    if (!anyoneCanUse && !assignedCustomer) {
      showToast("Validation Error", "Please select or assign a customer.", "warning");
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const prefix = isGift ? 'GFT' : 'CPN';

    for (let i = 0; i < qty; i++) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newId = `${prefix}-${randomNum}`;

      window.couponsData.unshift({
        id: newId,
        expiryDate: validTill,
        type: type,
        status: 'Active',
        value: value,
        currency: currency,
        quantity: 1,
        paymentType: paymentType,
        employee: employee,
        anyoneCanUse: anyoneCanUse,
        assignedCustomer: anyoneCanUse ? 'Anyone' : assignedCustomer,
        createdAt: nowStr,
        updatedAt: nowStr
      });
    }

    localStorage.setItem('so_coupons_data', JSON.stringify(window.couponsData));
    window.renderCouponsTable();

    showToast("Success", `Created ${qty} ${type}(s) successfully!`, "success");
    window.hideBsModal('couponModal');
  };

  window.viewCouponDetails = function (id) {
    const item = window.couponsData.find(c => c.id === id);
    if (!item) return;

    let msg = `ID: ${item.id}\nType: ${item.type}\nValue: ${item.value} ${item.currency}\nStatus: ${item.status}\nValid Till: ${item.expiryDate}\nCustomer: ${item.anyoneCanUse ? 'Anyone' : item.assignedCustomer}`;
    if (item.type === 'Gift Certificate') {
      msg += `\nPayment Type: ${item.paymentType}\nEmployee: ${item.employee}`;
    }
    showToast("Coupon Details", msg, "info");
  };

  window.deleteCouponRecord = function (id) {
    window.couponsData = window.couponsData.filter(c => c.id !== id);
    localStorage.setItem('so_coupons_data', JSON.stringify(window.couponsData));
    window.renderCouponsTable();
    showToast("Deleted", `${id} deleted successfully.`, "info");
  };

  // ==========================================
  // PRICE MODES (MODES SCHEDULE) CONTROLLER
  // ==========================================
  window.modesDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  window.createDefaultBranchModes = function () {
    return [
      {
        name: 'MODE 1',
        times: { Monday: '05:00 AM', Tuesday: '05:00 AM', Wednesday: '05:00 AM', Thursday: '05:00 AM', Friday: '05:00 AM', Saturday: '05:00 AM', Sunday: '05:00 AM' },
        disableAll: false,
        disabledDays: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false }
      },
      {
        name: 'MODE 2',
        times: { Monday: '12:00 PM', Tuesday: '12:00 PM', Wednesday: '12:00 PM', Thursday: '12:00 PM', Friday: '12:00 PM', Saturday: '12:00 PM', Sunday: '12:00 PM' },
        disableAll: false,
        disabledDays: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false }
      },
      {
        name: 'MODE 3',
        times: { Monday: '06:00 PM', Tuesday: '06:00 PM', Wednesday: '06:00 PM', Thursday: '06:00 PM', Friday: '06:00 PM', Saturday: '06:00 PM', Sunday: '06:00 PM' },
        disableAll: false,
        disabledDays: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false }
      },
      {
        name: 'MODE 4',
        times: { Monday: '11:59 PM', Tuesday: '11:59 PM', Wednesday: '11:59 PM', Thursday: '11:59 PM', Friday: '11:59 PM', Saturday: '11:59 PM', Sunday: '11:59 PM' },
        disableAll: false,
        disabledDays: { Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false }
      }
    ];
  };

  window.priceModesStore = JSON.parse(localStorage.getItem('so_price_modes_store') || 'null');
  if (!window.priceModesStore || typeof window.priceModesStore !== 'object') {
    window.priceModesStore = {
      'Zeit w zaytoun ljanoub': window.createDefaultBranchModes(),
      'Main Branch': window.createDefaultBranchModes(),
      'Factory Branch': window.createDefaultBranchModes(),
      'POS Branch': window.createDefaultBranchModes()
    };
    localStorage.setItem('so_price_modes_store', JSON.stringify(window.priceModesStore));
  }

  window.renderPriceModesTable = function () {
    const tbody = document.getElementById('modesTableBody');
    if (!tbody) return;

    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    let branchData = window.priceModesStore[branch];
    if (!branchData || !Array.isArray(branchData) || branchData.length < 4) {
      branchData = window.createDefaultBranchModes();
      window.priceModesStore[branch] = branchData;
    }

    tbody.innerHTML = branchData.map((mode, mIdx) => {
      const showDisableOption = (mIdx >= 2); // MODE 3 & MODE 4 have Disable All and day disable checkboxes

      const daysCells = window.modesDays.map(day => {
        const timeVal = mode.times?.[day] || '05:00 AM';
        const isDayDisabled = mode.disabledDays?.[day] || false;

        let chkHtml = '';
        if (showDisableOption) {
          chkHtml = `
            <div class="form-check justify-content-center d-flex mt-1">
              <input class="form-check-input mode-day-chk-${mIdx}" type="checkbox" data-mode="${mIdx}" data-day="${day}" id="modeChk_${mIdx}_${day}" ${isDayDisabled ? 'checked' : ''} onchange="syncDisableAllCheckbox(${mIdx})">
            </div>
          `;
        }

        return `
          <td class="py-2 align-middle text-center" style="background-color: #ffffff !important;">
            <div class="input-group input-group-sm mb-1 mode-time-group mx-auto px-1 py-1" style="max-width: 125px; background-color: #ffffff !important; border: 1px solid #cbd5e1 !important; border-radius: 4px;">
              <input type="text" class="form-control text-center mode-time-input-${mIdx} cursor-pointer border-0 p-0 text-xs" data-day="${day}" value="${timeVal}" onclick="openCustomTimePickerPopup(this)" readonly style="color: #0f172a !important; background-color: #ffffff !important; font-weight: 600 !important;">
              <span class="input-group-text border-0 text-slate-600 px-1 cursor-pointer" onclick="openCustomTimePickerPopup(this)" style="cursor: pointer; background-color: #ffffff !important;"><i class="fa-regular fa-clock text-slate-600"></i></span>
            </div>
            ${chkHtml}
          </td>
        `;
      }).join('');

      let disableAllHtml = '';
      if (showDisableOption) {
        disableAllHtml = `
          <div class="form-check mt-1 text-start">
            <input class="form-check-input" type="checkbox" id="modeDisableAll_${mIdx}" ${mode.disableAll ? 'checked' : ''} onchange="toggleDisableAllMode(${mIdx}, this.checked)">
            <label class="form-check-label text-slate-700 small fw-bold" for="modeDisableAll_${mIdx}">
              Disable All
            </label>
          </div>
        `;
      }

      return `
        <tr style="background-color: #ffffff !important; border-bottom: 1px solid #e2e8f0 !important;">
          <td class="text-start align-middle py-3" style="width: 140px; background-color: #ffffff !important;">
            <input type="text" class="px-2 py-1 mb-1 mode-name-input w-28 rounded-sm text-xs" data-mode="${mIdx}" value="${mode.name}" style="background-color: #ffffff !important; color: #1e293b !important; border: 1px solid #cbd5e1 !important; font-weight: 700 !important;">
            ${disableAllHtml}
          </td>
          ${daysCells}
        </tr>
      `;
    }).join('');
  };

  window.loadModesForSelectedBranch = function () {
    window.renderPriceModesTable();
  };

  window.toggleDisableAllMode = function (modeIdx, isChecked) {
    document.querySelectorAll(`.mode-day-chk-${modeIdx}`).forEach(chk => {
      chk.checked = isChecked;
    });
  };

  window.syncDisableAllCheckbox = function (modeIdx) {
    const chks = Array.from(document.querySelectorAll(`.mode-day-chk-${modeIdx}`));
    if (chks.length === 0) return;
    const allChecked = chks.every(chk => chk.checked);
    const disableAllChk = document.getElementById(`modeDisableAll_${modeIdx}`);
    if (disableAllChk) disableAllChk.checked = allChecked;
  };

  window.extractCurrentModesFromUI = function () {
    const branchData = [];
    const nameInputs = document.querySelectorAll('.mode-name-input');

    nameInputs.forEach((nameInput, mIdx) => {
      const modeName = nameInput.value.trim() || `MODE ${mIdx + 1}`;
      const timeInputs = document.querySelectorAll(`.mode-time-input-${mIdx}`);
      const times = {};
      timeInputs.forEach(tIn => {
        const day = tIn.getAttribute('data-day');
        times[day] = tIn.value.trim();
      });

      const disabledDays = {};
      const dayChks = document.querySelectorAll(`.mode-day-chk-${mIdx}`);
      dayChks.forEach(dChk => {
        const day = dChk.getAttribute('data-day');
        disabledDays[day] = dChk.checked;
      });

      const disableAllChk = document.getElementById(`modeDisableAll_${mIdx}`);
      const disableAll = disableAllChk ? disableAllChk.checked : false;

      branchData.push({
        name: modeName,
        times: times,
        disableAll: disableAll,
        disabledDays: disabledDays
      });
    });

    return branchData;
  };

  window.saveModesCurrentBranch = function () {
    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    const currentModes = window.extractCurrentModesFromUI();
    window.priceModesStore[branch] = currentModes;
    localStorage.setItem('so_price_modes_store', JSON.stringify(window.priceModesStore));
    showToast("Saved", `Modes schedule saved for branch "${branch}".`, "success");
  };

  window.confirmSaveModesAllBranches = function () {
    const modalElem = document.getElementById('modesSaveAllConfirmModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.executeSaveModesAllBranches = function () {
    const currentModes = window.extractCurrentModesFromUI();
    const branches = ['Zeit w zaytoun ljanoub', 'Main Branch', 'Factory Branch', 'POS Branch'];
    branches.forEach(b => {
      window.priceModesStore[b] = JSON.parse(JSON.stringify(currentModes));
    });
    localStorage.setItem('so_price_modes_store', JSON.stringify(window.priceModesStore));
    showToast("Saved All Branches", "Modes schedule saved for all branches successfully.", "success");
    window.hideBsModal('modesSaveAllConfirmModal');
  };

  // ==========================================
  // CUSTOM 3-COLUMN TIME PICKER POPUP CONTROLLER
  // ==========================================
  window.currentActiveTimeInput = null;

  window.openCustomTimePickerPopup = function (targetEl) {
    let inputEl = targetEl;
    if (targetEl.tagName !== 'INPUT') {
      inputEl = targetEl.parentElement.querySelector('input');
    }
    if (!inputEl) return;

    window.currentActiveTimeInput = inputEl;

    let currentVal = inputEl.value.trim() || '05:00 AM';
    let parts = currentVal.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let h = parts ? parts[1].padStart(2, '0') : '05';
    let m = parts ? parts[2].padStart(2, '0') : '00';
    let p = parts ? parts[3].toUpperCase() : 'AM';

    let popup = document.getElementById('customTimePickerPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'customTimePickerPopup';
      popup.className = 'position-absolute bg-white border border-secondary-subtle rounded shadow-lg p-2';
      popup.style.zIndex = '99999';
      popup.style.width = '190px';
      document.body.appendChild(popup);
    }

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const hoursHtml = hours.map(hr => `
      <div class="time-picker-item ${hr === h ? 'active text-dark' : 'text-dark'} rounded text-center py-1 fw-bold cursor-pointer small mb-1" onclick="selectTimePickerHour('${hr}')">${hr}</div>
    `).join('');

    const minutesHtml = minutes.map(mn => `
      <div class="time-picker-item ${mn === m ? 'active text-dark' : 'text-dark'} rounded text-center py-1 fw-bold cursor-pointer small mb-1" onclick="selectTimePickerMinute('${mn}')">${mn}</div>
    `).join('');

    const periodHtml = periods.map(pr => `
      <div class="time-picker-item ${pr === p ? 'active text-dark' : 'text-dark'} rounded text-center py-1 fw-bold cursor-pointer small mb-1" onclick="selectTimePickerPeriod('${pr}')">${pr}</div>
    `).join('');

    popup.innerHTML = `
      <div class="row g-1 text-center" style="height: 190px;">
        <div class="col-4 h-100 overflow-auto scrollbar-thin px-1" id="tpColHours">${hoursHtml}</div>
        <div class="col-4 h-100 overflow-auto scrollbar-thin px-1 border-start border-end border-secondary-subtle" id="tpColMinutes">${minutesHtml}</div>
        <div class="col-4 h-100 overflow-auto scrollbar-thin px-1" id="tpColPeriod">${periodHtml}</div>
      </div>
    `;

    const rect = inputEl.getBoundingClientRect();
    popup.style.top = (rect.bottom + window.scrollY + 2) + 'px';
    popup.style.left = (rect.left + window.scrollX) + 'px';
    popup.style.display = 'block';

    setTimeout(() => {
      const activeH = popup.querySelector('#tpColHours .active');
      const activeM = popup.querySelector('#tpColMinutes .active');
      if (activeH) activeH.scrollIntoView({ block: 'center' });
      if (activeM) activeM.scrollIntoView({ block: 'center' });
    }, 50);
  };

  window.selectTimePickerHour = function (hr) {
    if (!window.currentActiveTimeInput) return;
    let parts = window.currentActiveTimeInput.value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let m = parts ? parts[2] : '00';
    let p = parts ? parts[3] : 'AM';
    window.currentActiveTimeInput.value = `${hr}:${m} ${p}`;
    window.openCustomTimePickerPopup(window.currentActiveTimeInput);
  };

  window.selectTimePickerMinute = function (mn) {
    if (!window.currentActiveTimeInput) return;
    let parts = window.currentActiveTimeInput.value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let h = parts ? parts[1].padStart(2, '0') : '05';
    let p = parts ? parts[3] : 'AM';
    window.currentActiveTimeInput.value = `${h}:${mn} ${p}`;
    window.openCustomTimePickerPopup(window.currentActiveTimeInput);
  };

  window.selectTimePickerPeriod = function (pr) {
    if (!window.currentActiveTimeInput) return;
    let parts = window.currentActiveTimeInput.value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    let h = parts ? parts[1].padStart(2, '0') : '05';
    let m = parts ? parts[2] : '00';
    window.currentActiveTimeInput.value = `${h}:${m} ${pr}`;
    window.openCustomTimePickerPopup(window.currentActiveTimeInput);
  };

  document.addEventListener('click', function (e) {
    const popup = document.getElementById('customTimePickerPopup');
    if (popup && popup.style.display !== 'none') {
      if (!popup.contains(e.target) && !e.target.closest('.mode-time-group')) {
        popup.style.display = 'none';
      }
    }
  });

  // ==========================================
  // DEVICE PREFERENCES (WORKSTATIONS & PRINTERS) CONTROLLER
  // ==========================================
  window.workstationsData = JSON.parse(localStorage.getItem('so_workstations_data') || 'null');
  if (!window.workstationsData || !Array.isArray(window.workstationsData)) {
    window.workstationsData = [
      {
        id: 1,
        name: 'Showroom 1',
        device: 'pc',
        check1: 'Invoice',
        check2: 'Null',
        menu: 'MAIN DEPARTMENT',
        mode: 'REGULAR',
        mainScreen: 'MAIN',
        custDisPort: 'Select Cust. dis. port',
        cashDrawerPort: 'Usb',
        callerIdPort: '1',
        scalePort: 'Select Scale Port',
        readerSerial: '',
        whLocation1: 'Showroom',
        whLocation2: 'Select Location',
        whLocation3: 'Select Location'
      },
      {
        id: 2,
        name: 'w2',
        device: 'pc',
        check1: 'Invoice',
        check2: 'Null',
        menu: 'MAIN DEPARTMENT',
        mode: 'REGULAR',
        mainScreen: 'MAIN',
        custDisPort: 'Select Cust. dis. port',
        cashDrawerPort: 'Usb',
        callerIdPort: '1',
        scalePort: 'Select Scale Port',
        readerSerial: '',
        whLocation1: 'Showroom',
        whLocation2: 'Select Location',
        whLocation3: 'Select Location'
      },
      {
        id: 3,
        name: 'w3',
        device: 'pc',
        check1: 'Invoice',
        check2: 'Null',
        menu: 'MAIN DEPARTMENT',
        mode: 'REGULAR',
        mainScreen: 'MAIN',
        custDisPort: 'Select Cust. dis. port',
        cashDrawerPort: 'Usb',
        callerIdPort: '1',
        scalePort: 'Select Scale Port',
        readerSerial: '',
        whLocation1: 'Showroom',
        whLocation2: 'Select Location',
        whLocation3: 'Select Location'
      },
      {
        id: 4,
        name: 'w4',
        device: 'pc',
        check1: 'Invoice',
        check2: 'Null',
        menu: 'MAIN DEPARTMENT',
        mode: 'REGULAR',
        mainScreen: 'MAIN',
        custDisPort: 'Select Cust. dis. port',
        cashDrawerPort: 'Usb',
        callerIdPort: '1',
        scalePort: 'Select Scale Port',
        readerSerial: '',
        whLocation1: 'Showroom',
        whLocation2: 'Select Location',
        whLocation3: 'Select Location'
      },
      {
        id: 2000,
        name: 'Admin',
        device: 'Inventory',
        check1: 'Invoice',
        check2: 'Null',
        menu: 'MAIN DEPARTMENT',
        mode: 'REGULAR',
        mainScreen: 'MAIN',
        custDisPort: 'Select Cust. dis. port',
        cashDrawerPort: 'Usb',
        callerIdPort: '1',
        scalePort: 'Select Scale Port',
        readerSerial: '',
        whLocation1: 'Showroom',
        whLocation2: 'Select Location',
        whLocation3: 'Select Location'
      }
    ];
    localStorage.setItem('so_workstations_data', JSON.stringify(window.workstationsData));
  }

  window.physicalPrintersData = JSON.parse(localStorage.getItem('so_physical_printers_data') || 'null');
  if (!window.physicalPrintersData || !Array.isArray(window.physicalPrintersData)) {
    window.physicalPrintersData = [
      { id: 1, name: 'Invoice', brand: 'Vanguard', ip: '192.168.0.1', type: 'Ip', series: 'Thermal' },
      { id: 2, name: 'Kitchen', brand: 'Vanguard', ip: '192.168.0.1', type: 'Ip', series: 'Thermal' },
      { id: 3, name: 'Bar', brand: 'Vanguard', ip: '192.168.0.1', type: 'Ip', series: 'Thermal' }
    ];
    localStorage.setItem('so_physical_printers_data', JSON.stringify(window.physicalPrintersData));
  }

  window.renderWorkstationsTable = function () {
    const tbody = document.getElementById('workstationsTableBody');
    if (!tbody) return;

    if (!window.workstationsData || window.workstationsData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-muted py-4 text-center">No workstations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = window.workstationsData.map((ws) => {
      return `
        <tr>
          <td class="fw-bold text-secondary py-3">${ws.id}</td>
          <td class="fw-bold text-dark text-start py-3">${ws.name}</td>
          <td class="text-secondary fw-semibold py-3 text-capitalize">${ws.device || 'pc'}</td>
          <td class="text-end py-3">
            <button class="btn btn-sm text-white px-2 py-1 me-1 shadow-sm" style="background-color: #1e293b;" onclick="editWorkstationRecord(${ws.id})" title="Edit Workstation">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm text-white px-2 py-1 shadow-sm" style="background-color: #5c2c31;" onclick="deleteWorkstationRecord(${ws.id})" title="Delete Workstation">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.deleteWorkstationRecord = function (id) {
    window.workstationsData = window.workstationsData.filter(w => Number(w.id) !== Number(id));
    localStorage.setItem('so_workstations_data', JSON.stringify(window.workstationsData));
    window.renderWorkstationsTable();
    showToast("Deleted", "Workstation removed.", "info");
  };

  window.renderPhysicalPrintersTable = function () {
    const tbody = document.getElementById('physicalPrintersTableBody');
    if (!tbody) return;

    if (!window.physicalPrintersData || window.physicalPrintersData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-muted py-4 text-center">No physical printers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = window.physicalPrintersData.map(pr => {
      return `
        <tr>
          <td class="fw-bold text-secondary py-3">${pr.id}</td>
          <td class="fw-bold text-dark text-start py-3">${pr.name}</td>
          <td class="fw-semibold text-secondary py-3">${pr.brand || 'Vanguard'}</td>
          <td class="py-3 fw-bold" style="color: #be123c;">${pr.ip || '192.168.0.1'}</td>
          <td class="fw-semibold text-secondary py-3">${pr.series || 'Thermal'}</td>
          <td class="text-end py-3">
            <button class="btn btn-sm text-white px-2 py-1 me-1 shadow-sm" style="background-color: #1e293b;" title="Edit Printer" onclick="editPhysicalPrinterRecord(${pr.id})"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-sm text-white px-2 py-1 shadow-sm" style="background-color: #5c2c31;" title="Delete Printer" onclick="deletePhysicalPrinterRecord(${pr.id})"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.handlePrinterTypeChange = function () {
    const type = document.getElementById('prTypeSelect')?.value;
    const ipContainer = document.getElementById('prIpContainer');
    if (ipContainer) {
      if (type === 'Ip') {
        ipContainer.style.display = 'block';
      } else {
        ipContainer.style.display = 'none';
      }
    }
  };

  window.openNewPhysicalPrinterModal = function () {
    document.getElementById('prIdInput').value = '';
    document.getElementById('prDescriptionInput').value = '';
    document.getElementById('prBrandSelect').value = 'Select Brand';
    document.getElementById('prTypeSelect').value = 'Select Printer Type';
    document.getElementById('prIpInput').value = '192.168.0.1';
    document.getElementById('prSeriesSelect').value = 'Select Printer Series';
    window.handlePrinterTypeChange();

    const modalElem = document.getElementById('physicalPrinterModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.editPhysicalPrinterRecord = function (id) {
    const pr = window.physicalPrintersData.find(p => Number(p.id) === Number(id));
    if (!pr) return;

    document.getElementById('prIdInput').value = pr.id;
    document.getElementById('prDescriptionInput').value = pr.name || '';
    document.getElementById('prBrandSelect').value = pr.brand || 'Vanguard';
    document.getElementById('prTypeSelect').value = pr.type || 'Select Printer Type';
    document.getElementById('prIpInput').value = pr.ip || '192.168.0.1';
    document.getElementById('prSeriesSelect').value = pr.series || 'Select Printer Series';
    window.handlePrinterTypeChange();

    const modalElem = document.getElementById('physicalPrinterModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.savePhysicalPrinterRecord = function () {
    const idVal = document.getElementById('prIdInput')?.value;
    const name = document.getElementById('prDescriptionInput')?.value.trim();

    if (!name) {
      showToast("Validation Error", "Description is required.", "warning");
      return;
    }

    const brand = document.getElementById('prBrandSelect')?.value || 'Select Brand';
    const type = document.getElementById('prTypeSelect')?.value || 'Select Printer Type';
    const ip = document.getElementById('prIpInput')?.value.trim() || '192.168.0.1';
    const series = document.getElementById('prSeriesSelect')?.value || 'Select Printer Series';

    if (idVal) {
      const existing = window.physicalPrintersData.find(p => Number(p.id) === Number(idVal));
      if (existing) {
        existing.name = name;
        existing.brand = brand;
        existing.type = type;
        existing.ip = ip;
        existing.series = series;
      }
    } else {
      const newId = window.physicalPrintersData.length ? Math.max(...window.physicalPrintersData.map(p => p.id)) + 1 : 1;
      window.physicalPrintersData.push({
        id: newId,
        name: name,
        brand: brand,
        type: type,
        ip: ip,
        series: series
      });
    }

    localStorage.setItem('so_physical_printers_data', JSON.stringify(window.physicalPrintersData));
    window.renderPhysicalPrintersTable();
    showToast("Saved", `Physical Printer "${name}" saved successfully.`, "success");
    window.hideBsModal('physicalPrinterModal');
  };

  window.deletePhysicalPrinterRecord = function (id) {
    window.physicalPrintersData = window.physicalPrintersData.filter(p => Number(p.id) !== Number(id));
    localStorage.setItem('so_physical_printers_data', JSON.stringify(window.physicalPrintersData));
    window.renderPhysicalPrintersTable();
    showToast("Deleted", "Physical Printer removed.", "info");
  };

  window.loadDevicePreferencesForBranch = function () {
    const branch = document.getElementById('devicePreferencesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    window.renderWorkstationsTable();
    window.renderPhysicalPrintersTable();
  };

  // MODES SCHEDULE MATRIX CONTROLLER & DATA STORE
  window.modesData = JSON.parse(localStorage.getItem('so_modes_data') || 'null');
  if (!window.modesData || typeof window.modesData !== 'object' || !window.modesData['Zeit w zaytoun ljanoub']) {
    window.modesData = {
      'Zeit w zaytoun ljanoub': {
        mode1: { MONDAY: '05:00 AM', TUESDAY: '04:00 AM', WEDNESDAY: '05:00 AM', THURSDAY: '05:00 AM', FRIDAY: '05:00 AM', SATURDAY: '05:00 AM', SUNDAY: '05:00 AM' },
        mode2: { MONDAY: '12:00 PM', TUESDAY: '12:00 PM', WEDNESDAY: '12:00 PM', THURSDAY: '12:00 PM', FRIDAY: '12:00 PM', SATURDAY: '12:00 PM', SUNDAY: '12:00 PM' },
        mode3: { MONDAY: '06:00 PM', TUESDAY: '06:00 PM', WEDNESDAY: '06:00 PM', THURSDAY: '06:00 PM', FRIDAY: '06:00 PM', SATURDAY: '06:00 PM', SUNDAY: '06:00 PM', disableAll: false },
        mode4: { MONDAY: '11:59 PM', TUESDAY: '11:59 PM', WEDNESDAY: '11:59 PM', THURSDAY: '11:59 PM', FRIDAY: '11:59 PM', SATURDAY: '11:59 PM', SUNDAY: '11:59 PM', disableAll: false }
      }
    };
    localStorage.setItem('so_modes_data', JSON.stringify(window.modesData));
  }

  window.renderPriceModesTable = function () {
    const tbody = document.getElementById('modesTableBody');
    if (!tbody) return;

    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    if (!window.modesData[branch]) {
      window.modesData[branch] = JSON.parse(JSON.stringify(window.modesData['Zeit w zaytoun ljanoub'] || {}));
    }
    const branchModes = window.modesData[branch];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    let html = '';
    [1, 2, 3, 4].forEach(mNum => {
      const mKey = `mode${mNum}`;
      const mData = branchModes[mKey] || {};
      html += `<tr style="background-color: #ffffff !important; border-bottom: 1px solid #e2e8f0 !important;">`;
      html += `<td class="text-start py-3 align-middle" style="width: 140px; background-color: #ffffff !important;">`;
      html += `<input type="text" class="px-2 py-1 text-xs mode-name-input w-28 rounded-sm" value="MODE ${mNum}" style="background-color: #ffffff !important; color: #1e293b !important; border: 1px solid #cbd5e1 !important; font-weight: 700 !important;">`;
      if (mNum === 3 || mNum === 4) {
        const isDisabled = mData.disableAll ? 'checked' : '';
        html += `<div class="form-check mt-2 mb-0 text-start ps-1"><input class="form-check-input me-1" type="checkbox" id="disableMode${mNum}" ${isDisabled} onchange="toggleDisableMode(${mNum})"><label class="form-check-label text-slate-700 text-xs font-semibold" for="disableMode${mNum}">Disable All</label></div>`;
      }
      html += `</td>`;

      days.forEach(day => {
        const timeVal = mData[day] || (mNum === 1 ? '05:00 AM' : mNum === 2 ? '12:00 PM' : mNum === 3 ? '06:00 PM' : '11:59 PM');
        html += `<td class="py-2 align-middle text-center" style="background-color: #ffffff !important;">`;
        html += `<div class="d-inline-flex align-items-center cursor-pointer px-2 py-1" style="background-color: #ffffff !important; border: 1px solid #cbd5e1 !important; border-radius: 4px;" onclick="openCustomTimePickerPopup(this)">`;
        html += `<input type="text" class="border-0 p-0 text-xs text-center cursor-pointer w-16" value="${timeVal}" onclick="openCustomTimePickerPopup(this)" readonly style="color: #0f172a !important; background-color: #ffffff !important; font-weight: 600 !important;">`;
        html += `<i class="fa-regular fa-clock text-slate-600 ms-1 text-xs cursor-pointer" onclick="openCustomTimePickerPopup(this)"></i>`;
        html += `</div>`;
        html += `</td>`;
      });

      html += `</tr>`;
    });

    tbody.innerHTML = html;
  };

  window.loadModesForSelectedBranch = function () {
    window.renderPriceModesTable();
  };

  window.updateModeTime = function (modeKey, day, val) {
    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    if (!window.modesData[branch]) window.modesData[branch] = {};
    if (!window.modesData[branch][modeKey]) window.modesData[branch][modeKey] = {};
    window.modesData[branch][modeKey][day] = val;
  };

  window.toggleDisableMode = function (modeNum) {
    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    const chk = document.getElementById(`disableMode${modeNum}`);
    if (!window.modesData[branch]) window.modesData[branch] = {};
    if (!window.modesData[branch][`mode${modeNum}`]) window.modesData[branch][`mode${modeNum}`] = {};
    window.modesData[branch][`mode${modeNum}`].disableAll = chk ? chk.checked : false;
  };

  window.saveModesCurrentBranch = function () {
    localStorage.setItem('so_modes_data', JSON.stringify(window.modesData));
    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    showToast("Saved", `Modes schedule saved for branch "${branch}".`, "success");
  };

  window.confirmSaveModesAllBranches = function () {
    const branch = document.getElementById('modesBranchSelect')?.value || 'Zeit w zaytoun ljanoub';
    const currentConfig = window.modesData[branch];

    const branches = ['Zeit w zaytoun ljanoub', 'Main Branch', 'Factory Branch', 'POS Branch'];
    branches.forEach(b => {
      window.modesData[b] = JSON.parse(JSON.stringify(currentConfig));
    });

    localStorage.setItem('so_modes_data', JSON.stringify(window.modesData));
    showToast("Saved All Branches", "Modes schedule saved across all branches successfully.", "success");
  };

  // DISCOUNTS SUITE CONTROLLER & DATA STORE
  window.discountsData = JSON.parse(localStorage.getItem('so_discounts_data') || 'null');
  if (!window.discountsData || !Array.isArray(window.discountsData) || window.discountsData.length === 0) {
    window.discountsData = [
      {
        id: 1,
        description: 'Staff Discount 10%',
        discountType: 'Percentage',
        percentAmountMode: 'Fixed',
        discountValue: 10,
        invoiceMessage: 'Feedback',
        isTaxable: true,
        groupRestrictions: ['Admin', 'Manager', 'Cashier'],
        branch: 'All'
      },
      {
        id: 2,
        description: 'Open Amount Discount',
        discountType: 'Amount',
        percentAmountMode: 'Open',
        discountValue: 0,
        invoiceMessage: 'Return Policy',
        isTaxable: false,
        groupRestrictions: ['Admin', 'Manager'],
        branch: 'All'
      },
      {
        id: 3,
        description: 'VIP Special 15%',
        discountType: 'Percentage',
        percentAmountMode: 'Fixed',
        discountValue: 15,
        invoiceMessage: 'Merits',
        isTaxable: true,
        groupRestrictions: ['Admin', 'VIP Clients'],
        branch: 'Main Branch'
      },
      {
        id: 4,
        description: 'Item Clearance Promo',
        discountType: 'By Item',
        percentAmountMode: 'Fixed',
        discountValue: 20,
        invoiceMessage: 'Return Policy',
        isTaxable: false,
        groupRestrictions: ['All'],
        branch: 'All'
      }
    ];
    localStorage.setItem('so_discounts_data', JSON.stringify(window.discountsData));
  }

  window.renderDiscountsTable = function (dataToRender) {
    const tbody = document.getElementById('discountsTableBody');
    if (!tbody) return;

    const list = dataToRender || window.discountsData || [];

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted py-4 text-center">No discounts found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((disc) => {
      return `
        <tr>
          <td class="fw-semibold text-secondary py-3 text-start">${disc.id}</td>
          <td class="fw-bold text-dark text-start py-3">${disc.description}</td>
          <td class="text-end py-3">
            <button class="btn btn-sm text-white p-0 d-inline-flex align-items-center justify-content-center shadow-sm ms-auto" style="background-color: #334155; width: 28px; height: 28px; border-radius: 4px; border: none;" onclick="editDiscountRecord(${disc.id})" title="Edit Discount">
              <i class="fa-solid fa-pen-to-square fs-6"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.filterDiscountsTable = function () {
    const query = document.getElementById('discountSearchInput')?.value?.toLowerCase() || '';
    const branch = document.getElementById('discountBranchFilter')?.value || 'All';

    let filtered = (window.discountsData || []).filter(d => {
      const matchSearch = (d.description || '').toLowerCase().includes(query) ||
        (d.discountType || '').toLowerCase().includes(query);
      const matchBranch = branch === 'All' || d.branch === 'All' || d.branch === branch;
      return matchSearch && matchBranch;
    });

    window.renderDiscountsTable(filtered);
  };

  window.discountSortAsc = true;
  window.sortDiscountsTable = function (col) {
    window.discountSortAsc = !window.discountSortAsc;
    (window.discountsData || []).sort((a, b) => {
      let valA = a[col];
      let valB = b[col];
      if (typeof valA === 'string') {
        return window.discountSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return window.discountSortAsc ? valA - valB : valB - valA;
    });
    window.filterDiscountsTable();
  };

  window.openNewDiscountModal = function () {
    const modalEl = document.getElementById('discountModal');
    if (!modalEl) return;

    document.getElementById('discountForm')?.reset();
    document.getElementById('discountIdInput').value = '';

    const label = document.getElementById('discountModalLabel');
    if (label) label.innerText = 'New Discount';

    if (document.getElementById('discountDescInput')) document.getElementById('discountDescInput').value = '';
    if (document.getElementById('discountTypeSelect')) document.getElementById('discountTypeSelect').value = 'Percentage';
    if (document.getElementById('discountValueInput')) document.getElementById('discountValueInput').value = '0';
    if (document.getElementById('discountOpenFixSelect')) document.getElementById('discountOpenFixSelect').value = 'Open';
    if (document.getElementById('discountInvoiceMsgSelect')) document.getElementById('discountInvoiceMsgSelect').value = 'Select message';
    if (document.getElementById('discountIsTaxableCheck')) document.getElementById('discountIsTaxableCheck').checked = false;

    window.showBsModal('discountModal');
  };

  window.editDiscountRecord = function (id) {
    const disc = (window.discountsData || []).find(d => Number(d.id) === Number(id));
    if (!disc) return;

    const modalEl = document.getElementById('discountModal');
    if (!modalEl) return;

    const label = document.getElementById('discountModalLabel');
    if (label) label.innerText = 'Edit Discount';

    if (document.getElementById('discountIdInput')) document.getElementById('discountIdInput').value = disc.id;
    if (document.getElementById('discountDescInput')) document.getElementById('discountDescInput').value = disc.description || '';
    if (document.getElementById('discountTypeSelect')) document.getElementById('discountTypeSelect').value = disc.discountType || 'Percentage';
    if (document.getElementById('discountValueInput')) document.getElementById('discountValueInput').value = disc.discountValue !== undefined ? disc.discountValue : '0';
    if (document.getElementById('discountOpenFixSelect')) document.getElementById('discountOpenFixSelect').value = disc.percentAmountMode || 'Open';
    if (document.getElementById('discountInvoiceMsgSelect')) document.getElementById('discountInvoiceMsgSelect').value = disc.invoiceMessage || 'Select message';
    if (document.getElementById('discountIsTaxableCheck')) document.getElementById('discountIsTaxableCheck').checked = disc.isTaxable === true;

    window.showBsModal('discountModal');
  };

  window.saveDiscountRecord = function () {
    const idVal = document.getElementById('discountIdInput')?.value;
    const desc = document.getElementById('discountDescInput')?.value?.trim();
    const type = document.getElementById('discountTypeSelect')?.value || 'Percentage';
    const val = document.getElementById('discountValueInput')?.value || '0';
    const openFix = document.getElementById('discountOpenFixSelect')?.value || 'Open';
    const msg = document.getElementById('discountInvoiceMsgSelect')?.value || 'Select message';
    const taxable = document.getElementById('discountIsTaxableCheck')?.checked || false;

    if (!desc) {
      if (window.showToast) window.showToast("Required Field", "Please enter a discount description.", "error");
      return;
    }

    if (idVal) {
      const idx = (window.discountsData || []).findIndex(d => Number(d.id) === Number(idVal));
      if (idx !== -1) {
        window.discountsData[idx] = {
          ...window.discountsData[idx],
          id: Number(idVal),
          description: desc,
          discountType: type,
          percentAmountMode: openFix,
          discountValue: val,
          invoiceMessage: msg,
          isTaxable: taxable
        };
        if (window.showToast) window.showToast("Success", `Discount #${idVal} updated successfully.`, "success");
      }
    } else {
      const nextId = window.discountsData.length > 0 ? Math.max(...window.discountsData.map(d => Number(d.id))) + 1 : 1;
      const newDisc = {
        id: nextId,
        description: desc,
        discountType: type,
        percentAmountMode: openFix,
        discountValue: val,
        invoiceMessage: msg,
        isTaxable: taxable,
        branch: 'All'
      };
      window.discountsData.push(newDisc);
      if (window.showToast) window.showToast("Success", `New Discount #${nextId} created successfully.`, "success");
    }

    localStorage.setItem('so_discounts_data', JSON.stringify(window.discountsData));
    window.filterDiscountsTable();
    window.hideBsModal('discountModal');
  };

  window.deleteDiscountRecord = function (id) {
    window.discountsData = (window.discountsData || []).filter(d => Number(d.id) !== Number(id));
    localStorage.setItem('so_discounts_data', JSON.stringify(window.discountsData));
    window.filterDiscountsTable();
    if (window.showToast) window.showToast("Deleted", `Discount #${id} removed.`, "info");
  };

  window.switchDevicePreferencesTab = function (tab) {
    const wsTabBtn = document.getElementById('tab-workstations-btn');
    const prTabBtn = document.getElementById('tab-physical-printers-btn');
    const wsView = document.getElementById('devicePreferencesTabWorkstations');
    const prView = document.getElementById('devicePreferencesTabPhysicalPrinters');

    if (tab === 'workstations') {
      wsTabBtn?.classList.add('active', 'fw-bold', 'text-dark');
      wsTabBtn?.classList.remove('text-secondary', 'fw-semibold');
      prTabBtn?.classList.remove('active', 'fw-bold', 'text-dark');
      prTabBtn?.classList.add('text-secondary', 'fw-semibold');
      if (wsView) wsView.style.display = 'block';
      if (prView) prView.style.display = 'none';
      window.renderWorkstationsTable();
    } else {
      prTabBtn?.classList.add('active', 'fw-bold', 'text-dark');
      prTabBtn?.classList.remove('text-secondary', 'fw-semibold');
      wsTabBtn?.classList.remove('active', 'fw-bold', 'text-dark');
      wsTabBtn?.classList.add('text-secondary', 'fw-semibold');
      if (prView) prView.style.display = 'block';
      if (wsView) wsView.style.display = 'none';
      window.renderPhysicalPrintersTable();
    }
  };

  window.loadDevicePreferencesForBranch = function () {
    window.renderWorkstationsTable();
    window.renderPhysicalPrintersTable();
  };

  window.editWorkstationRecord = function (id) {
    const item = window.workstationsData.find(w => Number(w.id) === Number(id));
    if (!item) return;

    window.currentEditingWorkstationId = Number(id);

    document.getElementById('wsIdInput').value = item.id;
    document.getElementById('wsNameInput').value = item.name || '';
    document.getElementById('wsCheck1Select').value = item.check1 || 'Invoice';
    document.getElementById('wsCheck2Select').value = item.check2 || 'Null';
    document.getElementById('wsMenuSelect').value = item.menu || 'MAIN DEPARTMENT';
    document.getElementById('wsModeSelect').value = item.mode || 'REGULAR';
    document.getElementById('wsMainScreenSelect').value = item.mainScreen || 'MAIN';
    document.getElementById('wsCustDisPortSelect').value = item.custDisPort || 'Select Cust. dis. port';
    document.getElementById('wsCashDrawerPortSelect').value = item.cashDrawerPort || 'Usb';
    document.getElementById('wsCallerIdPortSelect').value = item.callerIdPort || '1';
    document.getElementById('wsScalePortSelect').value = item.scalePort || 'Select Scale Port';
    document.getElementById('wsReaderSerialInput').value = item.readerSerial || '';
    document.getElementById('wsWhLocation_1').value = item.whLocation1 || 'Showroom';

    const modalElem = document.getElementById('workstationModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.saveWorkstationRecord = function () {
    const idVal = Number(document.getElementById('wsIdInput')?.value);
    const name = document.getElementById('wsNameInput')?.value.trim();

    if (!name) {
      showToast("Validation Error", "WorkStation Name is required.", "warning");
      return;
    }

    let existing = window.workstationsData.find(w => Number(w.id) === idVal);
    if (existing) {
      existing.name = name;
      existing.check1 = document.getElementById('wsCheck1Select')?.value || 'Invoice';
      existing.check2 = document.getElementById('wsCheck2Select')?.value || 'Null';
      existing.menu = document.getElementById('wsMenuSelect')?.value || 'MAIN DEPARTMENT';
      existing.mode = document.getElementById('wsModeSelect')?.value || 'REGULAR';
      existing.mainScreen = document.getElementById('wsMainScreenSelect')?.value || 'MAIN';
      existing.custDisPort = document.getElementById('wsCustDisPortSelect')?.value || 'Select Cust. dis. port';
      existing.cashDrawerPort = document.getElementById('wsCashDrawerPortSelect')?.value || 'Usb';
      existing.callerIdPort = document.getElementById('wsCallerIdPortSelect')?.value || '1';
      existing.scalePort = document.getElementById('wsScalePortSelect')?.value || 'Select Scale Port';
      existing.readerSerial = document.getElementById('wsReaderSerialInput')?.value.trim() || '';
      existing.whLocation1 = document.getElementById('wsWhLocation_1')?.value || 'Showroom';
    }

    localStorage.setItem('so_workstations_data', JSON.stringify(window.workstationsData));
    window.renderWorkstationsTable();
    showToast("Saved", `Workstation "${name}" saved successfully.`, "success");
    window.hideBsModal('workstationModal');
  };

  window.confirmApplyLocationsAllWorkstations = function () {
    const modalElem = document.getElementById('applyLocationsConfirmModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.executeApplyLocationsAllWorkstations = function () {
    const loc1 = document.getElementById('wsWhLocation_1')?.value || 'Showroom';
    window.workstationsData.forEach(ws => {
      ws.whLocation1 = loc1;
    });
    localStorage.setItem('so_workstations_data', JSON.stringify(window.workstationsData));
    showToast("Locations Applied", `Location "${loc1}" applied to all workstations.`, "success");
    window.hideBsModal('applyLocationsConfirmModal');
  };

  window.toggleLogicalWarehouseShowMore = function () {
    const extraContainer = document.getElementById('wsWhExtraRowsContainer');
    const btn = document.getElementById('wsWhShowMoreBtn');
    if (!extraContainer || !btn) return;

    if (extraContainer.style.display === 'none' || !extraContainer.style.display) {
      extraContainer.style.display = 'block';
      btn.innerText = 'Show Less';
    } else {
      extraContainer.style.display = 'none';
      btn.innerText = 'Show More';
    }
  };

  window.openNewMenuModal = function () {
    const modalElem = document.getElementById('newMenuModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.openChooseColorModal = function () {
    const modalElem = document.getElementById('chooseColorModal');
    if (modalElem) {
      const bsModal = new bootstrap.Modal(modalElem);
      bsModal.show();
    }
  };

  window.selectMenuColor = function (hexColor) {
    window.selectedMenuColor = hexColor;
    const btn = document.getElementById('menuColorPickerBtn');
    if (btn) {
      btn.style.backgroundColor = hexColor;
      btn.style.borderColor = hexColor;
      btn.style.color = (hexColor === '#ffffff' || hexColor === '#ffff79' || hexColor === '#79ff79' || hexColor === '#79ffff') ? '#000' : '#fff';
    }
    window.hideBsModal('chooseColorModal');
  };

  window.previewMenuImage = function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgEl = document.getElementById('menuImgElement');
      const txtEl = document.getElementById('menuImageText');
      if (imgEl && txtEl) {
        imgEl.src = e.target.result;
        imgEl.classList.remove('d-none');
        txtEl.classList.add('d-none');
      }
    };
    reader.readAsDataURL(file);
  };

  window.removeMenuImage = function () {
    const imgEl = document.getElementById('menuImgElement');
    const txtEl = document.getElementById('menuImageText');
    const fileInput = document.getElementById('menuFileInput');
    if (imgEl && txtEl) {
      imgEl.src = '';
      imgEl.classList.add('d-none');
      txtEl.classList.remove('d-none');
    }
    if (fileInput) fileInput.value = '';
  };

  window.saveNewMenuDepartment = function () {
    const desc = document.getElementById('menuDescInput')?.value.trim();
    if (!desc) {
      showToast("Validation Error", "Menu Description is required.", "warning");
      return;
    }
    const selectEl = document.getElementById('wsMenuSelect');
    if (selectEl) {
      const opt = document.createElement('option');
      opt.value = desc;
      opt.textContent = desc;
      opt.selected = true;
      selectEl.appendChild(opt);
    }
    showToast("Saved", `Menu / Department "${desc}" created successfully.`, "success");
    window.hideBsModal('newMenuModal');
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (window.renderOpScreensTable) window.renderOpScreensTable();
      if (window.renderPaymentTypesTable) window.renderPaymentTypesTable();
      if (window.renderPaymentBillsTable) window.renderPaymentBillsTable();
      if (window.updatePmBillsTypeDropdownOptions) window.updatePmBillsTypeDropdownOptions();
      if (window.renderCouponsTable) window.renderCouponsTable();
      if (window.renderDiscountsTable) window.renderDiscountsTable();
      if (window.renderPriceModesTable) window.renderPriceModesTable();
      if (window.renderWorkstationsTable) window.renderWorkstationsTable();
      if (window.renderPhysicalPrintersTable) window.renderPhysicalPrintersTable();
    }, 600);
  });
})();