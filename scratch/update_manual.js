const fs = require('fs');
const path = require('path');

const manualHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>دليل المستخدم الشامل - منظومة فاندغارد المؤسسية SARL</title>
  
  <!-- Google Fonts: Cairo & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  
  <!-- FontAwesome 6 Pro Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <!-- Bootstrap 5 RTL CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css">

  <style>
    :root {
      --primary-color: #d97706;
      --secondary-color: #b45309;
      --olive-green: #65a30d;
      --dark-bg: #121824;
      --card-bg: #1a2232;
      --text-main: #1e293b;
      --border-color: #cbd5e1;
    }

    body {
      font-family: 'Cairo', sans-serif;
      background-color: #f8fafc;
      color: var(--text-main);
      line-height: 1.7;
      padding: 0;
      margin: 0;
    }

    .manual-paper {
      max-width: 920px;
      margin: 30px auto;
      background: #ffffff;
      padding: 45px 55px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .manual-header {
      border-bottom: 3px solid var(--primary-color);
      padding-bottom: 25px;
      margin-bottom: 35px;
    }

    .manual-logo-img {
      height: 60px;
      width: auto;
      border-radius: 50%;
    }

    .badge-enterprise {
      background-color: var(--primary-color);
      color: #ffffff;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .manual-section-title {
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 1.25rem;
      font-weight: 800;
      margin-top: 40px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-right: 6px solid var(--olive-green);
    }

    .feature-card {
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 15px;
    }

    .feature-icon {
      color: var(--olive-green);
      font-size: 1.4rem;
      margin-left: 10px;
    }

    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 25px;
    }

    .table-custom th {
      background-color: #1e293b;
      color: #ffffff;
      padding: 12px;
      text-align: right;
      font-size: 0.95rem;
    }

    .table-custom td {
      padding: 12px;
      border: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }

    .table-custom tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .floating-print-btn {
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 9999;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff;
      border: none;
      padding: 14px 26px;
      border-radius: 50px;
      font-weight: 800;
      box-shadow: 0 10px 25px rgba(217, 119, 6, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    }

    .floating-print-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(217, 119, 6, 0.6);
      color: #ffffff;
    }

    @media print {
      body {
        background-color: #ffffff;
      }
      .manual-paper {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .floating-print-btn {
        display: none !important;
      }
      .manual-section-title {
        background: #b45309 !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      th {
        background-color: #1e293b !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- FLOATING ACTION BUTTON TO GENERATE & DOWNLOAD PDF -->
  <button class="floating-print-btn" onclick="window.print()" title="تحميل أو طباعة الدليل بصيغة PDF">
    <i class="fa-solid fa-file-pdf fs-5"></i>
    <span>تحميل / طباعة الدليل (PDF)</span>
  </button>

  <div class="manual-paper">
    
    <!-- HEADER SECTION -->
    <div class="manual-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="d-flex align-items-center gap-3">
        <img src="assets/images/vanguard_logo.png" alt="Vanguard Logo" class="manual-logo-img shadow-sm" style="border: 2px solid #f59e0b;" />
        <div>
          <h2 class="fw-bold mb-1" style="color: #0f172a;">دليل المستخدم الشامل والنظام التشغيلي (User Manual)</h2>
          <span class="text-muted fw-semibold">منظومة فاندغارد المؤسسية - شركة منتوجات زيت وزيتون الجنوب ش.م.م (Vanguard Software Inc. / Southern Olive SARL)</span>
        </div>
      </div>
      <div>
        <span class="badge-enterprise"><i class="fa-solid fa-certificate me-1"></i> الإصدار المعتمد Vanguard Enterprise v5.0</span>
      </div>
    </div>

    <!-- DOCUMENT SUMMARY METADATA -->
    <div class="row g-3 mb-4 p-3 rounded" style="background-color: #f1f5f9; border: 1px solid #cbd5e1;">
      <div class="col-md-3">
        <small class="text-muted d-block">المطور والمالك:</small>
        <strong style="color: #0f172a;">Vanguard Software Inc.</strong>
      </div>
      <div class="col-md-3">
        <small class="text-muted d-block">اسم المرخّص له:</small>
        <strong style="color: #0f172a;">منتوجات زيت وزيتون الجنوب SARL</strong>
      </div>
      <div class="col-md-3">
        <small class="text-muted d-block">معرّف الترخيص (CID):</small>
        <strong class="text-warning">CID-22901 (Southern Olive Master)</strong>
      </div>
      <div class="col-md-3">
        <small class="text-muted d-block">مستوى الأمان والدرع:</small>
        <strong class="text-success"><i class="fa-solid fa-shield-halved me-1"></i> Vanguard Max Security Shield (AES-256)</strong>
      </div>
    </div>

    <!-- SECTION 1: INTRODUCTION & OVERVIEW -->
    <div class="manual-section-title">
      <i class="fa-solid fa-circle-info"></i>
      <span>1. المقدمة والتعريف بالنظام (Vanguard ERP Platform)</span>
    </div>
    <p>
      مرحباً بك في <strong>منظومة فاندغارد لإدارة المؤسسات والشركات (Vanguard Software Inc.)</strong>، المنظومة السحابية المتكاملة المخصصة لإدارة كافة العمليات التشغيلية، الإنتاجية، الماليّة، واللوجستية لمعاصر الزيتون، مصانع التعبئة، وتجار التجزئة والجملة.
    </p>
    <p>
      تم تطوير هذه المنظومة وفق <strong>أعلى المعايير البرمجية والأمنية العالمية (Vanguard Enterprise Architecture)</strong> وتتميز بنواة تشغيلية مزدوجة أوفلاين/أونلاين (Offline-First Dual Engine) مع الربط السحابي المباشر، وتغطية 8 موديولات تشغيلية متكاملة.
    </p>

    <!-- SECTION 2: TOP HEADER & NAVIGATION DESIGN -->
    <div class="manual-section-title">
      <i class="fa-solid fa-window-maximize"></i>
      <span>2. الهيكل العلوي والشريط التفاعلي (Top System Header & Subheader)</span>
    </div>
    <p>
      يتميز الشريط العلوي الرئيسي بمنظومة <strong>فاندغارد (84px Height)</strong> بهيكلية ثلاثية متناسقة توفر أفضل تجربة استخدام وتنقل سريع:
    </p>
    <ul>
      <li><strong>الجهة اليسرى (Left Section)</strong>: تضم زر القائمة الجانبية (☰) بالإضافة إلى شارة <strong>شعار فاندغارد (Vanguard Software Medallion Badge)</strong> التي تتيح إمكانية فتح <strong>مركز الأمان الشامل (Vanguard Maximum Security Suite)</strong> فور الضغط عليها.</li>
      <li><strong>الوسط (Center Section)</strong>: يضم اسم المشروع والشركة المترخصة (<strong>منتوجات زيت وزيتون الجنوب ش.م.م - Southern Olive SARL</strong>) مع الشعار الدائري الخاص بها في منتصف الشاشة.</li>
      <li><strong>الجهة اليمنى (Right Section)</strong>: تضم أزرار التفاعل السريع (<strong>مركز التطبيقات المستقلة Standalone Apps Hub</strong>، <strong>الرئيسية 🏠</strong>، <strong>الرسائل ✉️</strong>، <strong>الإعدادات ⚙️</strong>، <strong>شارة مستخدم المالك الرئيسي Master Owner</strong>، وزر <strong>تسجيل الخروج 🚪</strong>).</li>
    </ul>

    <!-- SECTION 3: VANGUARD MAXIMUM SECURITY SUITE -->
    <div class="manual-section-title">
      <i class="fa-solid fa-shield-halved"></i>
      <span>3. جناح الأمان والحماية القصوى (Vanguard Maximum Security Control Suite)</span>
    </div>
    <p>
      يحتوي نظام <strong>فاندغارد</strong> على محرك حماية وأمان متقدم يعمل بنظام <strong>Zero-Trust Network Access (ZTNA)</strong> وشهادة <strong>ISO 27001</strong> العالمية:
    </p>
    <div class="row g-3 my-2">
      <div class="col-md-6">
        <div class="feature-card border-success">
          <h6 class="fw-bold text-success"><i class="fa-solid fa-lock feature-icon text-success"></i> التشفير القوي (AES-256 GCM Encryption)</h6>
          <small class="text-muted">تشفير تلقائي لكافة البيانات المخزنة محلياً وسحابياً وفواتير المبيعات وسجلات الزبائن ومنع أي اختراق أو تلاعب.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card border-warning">
          <h6 class="fw-bold text-warning"><i class="fa-solid fa-shield-virus feature-icon text-warning"></i> الفحص الأمني المباشر (Deep Security Audit)</h6>
          <small class="text-muted">زر فحص بضغط بنقرة واحدة لفحص سلامة الملفات والأذونات وتدقيق سلامة السجلات وحظر ثغرات الشفرات.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card border-danger">
          <h6 class="fw-bold text-danger"><i class="fa-solid fa-triangle-exclamation feature-icon text-danger"></i> الإغلاق الطارئ (Emergency System Lockdown)</h6>
          <small class="text-muted">زر تجميد طارئ بنقرة واحدة يقفل جميع الربط البرمجي الخارجي وحركات البيانات فوراً في حالات الطوارئ.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card border-info">
          <h6 class="fw-bold text-info"><i class="fa-solid fa-list-check feature-icon text-info"></i> سجل التدقيق غير القابل للتعديل (Immutable Audit Log)</h6>
          <small class="text-muted">سجل مباشر يسجل كافة العمليات، الأوقات، عناوين الـ IP، والأحداث الأمنية بأسلوب غير قابل للتزوير.</small>
        </div>
      </div>
    </div>

    <!-- SECTION 4: CATEGORY GRID DASHBOARD -->
    <div class="manual-section-title">
      <i class="fa-solid fa-border-all"></i>
      <span>4. لوحة التحكم والكتل المقطعة (Category Grid Dashboard - 5-Column Matrix)</span>
    </div>
    <p>
      تضم <strong>لوحة الكروت المقطعة (Category Grid Dashboard)</strong> مصفوفة من 5 أعمدة موزعة على 7 كتل تشغيلية تحتوي على 35 كرت خيار تفاعلي بألوان تعبيرية مميزة وخلفيات زيتونية فاخرة:
    </p>

    <div class="row g-3 my-2">
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #f59e0b;"><i class="fa-solid fa-chart-line feature-icon" style="color: #f59e0b;"></i> 1. Overview (نظرة عامة)</h6>
          <small class="text-muted">لوحة التحليلات الذهبية، التقارير النيلية، الفعاليات الوردية، التذكيرات الفيروزية، وأعمار ديون الزبائن البنفسجية.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #10b981;"><i class="fa-solid fa-sack-dollar feature-icon" style="color: #10b981;"></i> 2. Billing (الفواتير والمبيعات)</h6>
          <small class="text-muted">دليل الزبائن السماوي، عروض الأسعار، مبيعات الكاشير الخضراء، إيصالات التوصيل البرتقالية، والمقبوضات.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #ef4444;"><i class="fa-solid fa-filter feature-icon" style="color: #ef4444;"></i> 3. Movements (حركات البضائع)</h6>
          <small class="text-muted">تلفيات البضائع الحمراء، تجميع الأصناف والـ BOM، تسويات المخزون، وطلبات النقل بين الفروع.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #2563eb;"><i class="fa-solid fa-box-open feature-icon" style="color: #2563eb;"></i> 4. Procurements (المشتريات والتموين)</h6>
          <small class="text-muted">دليل المنتجات والخدمات الذهبية، دليل الموردين، إعادة الطلب التلقائية، وأوامر الشراء الزرقاء.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #ea580c;"><i class="fa-solid fa-truck-fast feature-icon" style="color: #ea580c;"></i> 5. SuperSonic Fleet (الأسطول والتوصيل)</h6>
          <small class="text-muted">خريطة الـ GPS المباشرة، ورديات السائقين، سجلات المحروقات الحمراء، وتسويات الـ COD النقدي.</small>
        </div>
      </div>
      <div class="col-md-6">
        <div class="feature-card">
          <h6 class="fw-bold" style="color: #22c55e;"><i class="fa-solid fa-comments feature-icon" style="color: #22c55e;"></i> 6. Social Media (المبيعات الاجتماعية)</h6>
          <small class="text-muted">صندوق رسائل واتساب الأخضر، مسودات الطلبات البرتقالية، عمولات المندوبين، وتحليلات حملات الإعلانات.</small>
        </div>
      </div>
      <div class="col-md-12">
        <div class="feature-card border-warning">
          <h6 class="fw-bold text-warning"><i class="fa-solid fa-shapes feature-icon"></i> 7. Standalone Apps (التطبيقات المستقلة)</h6>
          <small class="text-muted">روابط سريعة لتطبيق الشاشة اللمسية للبيع POS Touch، متجر الزبائن الإلكتروني، تطبيق استلام البضائع، وتطبيق أسطول التوصيل.</small>
        </div>
      </div>
    </div>

    <!-- SECTION 5: THE 8 OPERATIONAL MODULES -->
    <div class="manual-section-title">
      <i class="fa-solid fa-cubes"></i>
      <span>5. موديولات النظام الـ 8 الشاملة (System Modules)</span>
    </div>

    <table class="table-custom">
      <thead>
        <tr>
          <th>الموديول</th>
          <th>الوظيفة الرئيسية</th>
          <th>أبرز الميزات والعمليات</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Operations Center</strong></td>
          <td>إدارة الإنتاج وتعبئة الزيت</td>
          <td>معاصر الزيتون، تركيبات المنتجات (BOM)، التسويات، وتسليم البضائع.</td>
        </tr>
        <tr>
          <td><strong>2. Sales Control & POS</strong></td>
          <td>المبيعات ونقاط البيع</td>
          <td>الكاشير السريع، الفواتير بالدولار والليرة، تقارير Z-Report والوردية.</td>
        </tr>
        <tr>
          <td><strong>3. SuperSonic Fleet</strong></td>
          <td>إدارة الأسطول والتوصيل</td>
          <td>تتبع الخريطة GPS، ورديات السائقين، استلام التوقيع والـ COD النقدي.</td>
        </tr>
        <tr>
          <td><strong>4. Social Media Sales</strong></td>
          <td>التجارة عبر الوسائط الاجتماعية</td>
          <td>صندوق رسائل واتساب وانستغرام، مسودات الطلبات، وتتبع عمولات المندوبين.</td>
        </tr>
        <tr>
          <td><strong>5. Customer Directory</strong></td>
          <td>إدارة الزبائن والديون</td>
          <td>دليل الزبائن، أعمار الديون (30/60/90 يوم)، وتحصيل المقبوضات.</td>
        </tr>
        <tr>
          <td><strong>6. Accounting & Finance</strong></td>
          <td>المحاسبة والمالية</td>
          <td>سعر صرف الدولار اليومي (89,500 LBP)، ميزان المراجعة، الأرباح والخسائر.</td>
        </tr>
        <tr>
          <td><strong>7. Human Resources</strong></td>
          <td>الموارد البشرية والرواتب</td>
          <td>سجلات الموظفين، مسيرات الرواتب، السلفيات، ومتابعة الدوام.</td>
        </tr>
        <tr>
          <td><strong>8. Security & Permissions</strong></td>
          <td>الأمان والتراخيص</td>
          <td>تحديد الأدوار (Admin, Cashier, Driver)، وتدقيق سجل الأحداث Security Audit.</td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION 6: SAAS MASTER OWNER & LICENSING HUB -->
    <div class="manual-section-title">
      <i class="fa-solid fa-crown"></i>
      <span>6. دليل مالك النظام والتراخيص التجاري (Vanguard SaaS Master Controller)</span>
    </div>
    <p>
      إذا كنت ترغب في بيع أو تأجير المنظومة لمعاصر أخرى أو شركات توزيع، يمكنك استخدام <strong>لوحة تحكم المالِك الرئيسي (👑 Vanguard SaaS Master Controller / vanguard-admin.html)</strong>:
    </p>
    <ul>
      <li><strong>رمز الشركة الموحد (Company ID)</strong>: بيانات كل شركة مشتركة معزولة تماماً بتقنية Row-Level Security (RLS).</li>
      <li><strong>خطط الاشتراكات</strong>:
        <ul>
          <li><strong>Starter Plan ($150/mo)</strong>: مبيعات ونقطة بيع ومخزون.</li>
          <li><strong>Professional Plan ($250/mo)</strong>: مبيعات، نقاط بيع، حسابات، وسوشيال ميديا.</li>
          <li><strong>Enterprise Plan ($450/mo)</strong>: كافة الموديولات الـ 8 + تتبع الأسطول بالـ GPS والمتجر الإلكتروني.</li>
        </ul>
      </li>
      <li><strong>إنشاء حساب زبون جديد</strong>: ادخل اسم الشركة والـ CID والإيميل، وسيتم توليد الحساب فوراً.</li>
      <li><strong>تصدير دليل المشتركين</strong>: بضغطة زر واحدة بملف JSON منظم.</li>
    </ul>

    <!-- SECTION 7: PRINTING & PDF CONVERSION GUIDE -->
    <div class="manual-section-title">
      <i class="fa-solid fa-print"></i>
      <span>7. طريقة طباعة وحفظ الدليل بصيغة PDF عالية الجودة</span>
    </div>
    <ol>
      <li>اضغط على الزر العائم في الأسفل: <strong>"تحميل / طباعة الدليل (PDF)"</strong>.</li>
      <li>في شاشة الطباعة الخاصة بالمتصفح، اختر <strong>Destination -> Save as PDF (حفظ بتنسيق PDF)</strong>.</li>
      <li>تأكد من اختيار <strong>Layout -> Portrait</strong> وتفعيل خيار <strong>Background graphics (رسومات الخلفية)</strong> للحفاظ على الألوان والأيقونات والخطوط.</li>
      <li>اضغط <strong>Save (حفظ)</strong> وحدد مكان الحفظ على جهازك أو هاتفك.</li>
    </ol>

    <!-- FOOTER SECTION -->
    <div class="text-center mt-5 pt-4 border-top border-secondary text-muted">
      <p class="mb-1"><strong>جميع الحقوق محفوظة © 2026 Vanguard Software Inc. / منتوجات زيت وزيتون الجنوب ش.م.م</strong></p>
      <small>Vanguard Enterprise Architecture v5.0 | Certified Master SaaS License Holder</small>
    </div>

  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../user_manual_ar.html'), manualHtml, { encoding: 'utf8' });
console.log('user_manual_ar.html updated successfully with UTF-8 encoding!');
