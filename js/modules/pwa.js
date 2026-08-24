/**
 * Vanguard ERP - PWA & SHORTCUT APP HANDLER
 * Manages service worker registration, PWA install prompts, device auto-detection, and smart role-based app installation.
 */

window.SouthernOlivePWA = (function () {
  let deferredPrompt = null;

  function init() {
    registerServiceWorker();
    setupInstallListeners();
    checkUrlAppMode();
    applyDeviceResponsiveClasses();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        console.log('PWA Service Worker registered:', reg.scope);
      }).catch(err => {
        console.warn('PWA SW registration failed:', err);
      });
    }
  }

  function detectDeviceType() {
    const ua = navigator.userAgent || '';
    const width = window.innerWidth;
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 768) {
      return 'mobile';
    } else if (/iPad|Tablet/i.test(ua) || (width >= 768 && width <= 1024)) {
      return 'tablet';
    }
    return 'desktop';
  }

  function applyDeviceResponsiveClasses() {
    const deviceType = detectDeviceType();
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    document.body.classList.add(`device-${deviceType}`);

    if (deviceType === 'mobile' || deviceType === 'tablet') {
      document.body.classList.add('mobile-app-layout');
    }
  }

  function setupInstallListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtns = document.querySelectorAll('.pwa-install-btn');
      installBtns.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.onclick = triggerInstall;
      });
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (window.showToast) {
        window.showToast("App Installed", "Vanguard ERP shortcut installed successfully!", "success");
      }
    });
  }

  function getRolePwaLabel(dept, designation) {
    const device = detectDeviceType();
    const d = (dept || '').toLowerCase();
    const des = (designation || '').toLowerCase();

    if (d.includes('fleet') || des.includes('driver')) {
      return "Install SuperSonic Delivery App";
    } else if (d.includes('social') || des.includes('rep') || des.includes('agent')) {
      return "Install Social Sales App";
    } else if (d.includes('factory') || des.includes('worker') || des.includes('stock')) {
      return "Install Stock & Operations App";
    } else {
      return device === 'desktop' ? "Install Desktop ERP App" : "Install Mobile Management App";
    }
  }

  function triggerInstall() {
    if (!deferredPrompt) {
      return false;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      }
      deferredPrompt = null;
    });
    return true;
  }

  function checkUrlAppMode() {
    const params = new URLSearchParams(window.location.search);
    const appMode = params.get('app');
    if (appMode) {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if (window.SouthernOliveERP && window.SouthernOliveERP.launchAppMode) {
            window.SouthernOliveERP.launchAppMode(appMode);
          }
        }, 500);
      });
    }
  }

  return {
    init: init,
    detectDeviceType: detectDeviceType,
    getRolePwaLabel: getRolePwaLabel,
    triggerInstall: triggerInstall
  };
})();

// Global Sub-App Sharing & Installation Helpers for Mobile & Tablets
window.shareSubApp = function (appUrl, appTitle) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1';
  const liveProductionOrigin = 'https://southern-olive-oil-products.vercel.app';
  const baseOrigin = isLocalhost ? liveProductionOrigin : window.location.origin;
  const cleanAppPath = appUrl.startsWith('/') ? appUrl : '/' + appUrl;
  const fullUrl = baseOrigin + cleanAppPath;

  if (navigator.share) {
    navigator.share({
      title: appTitle + ' - Southern Olive & Oil Products',
      text: 'Open ' + appTitle + ' app:',
      url: fullUrl
    }).catch(err => console.log('Share canceled:', err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(fullUrl).then(() => {
      if (typeof window.showToast === 'function') {
        window.showToast('Link Copied 📋', appTitle + ' share link copied to clipboard:\n' + fullUrl, 'success');
      } else {
        alert('Link copied to clipboard!\n' + fullUrl);
      }
    });
  } else {
    prompt('Copy share link for ' + appTitle + ':', fullUrl);
  }
};

window.installSubApp = function (appUrl, appTitle) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1';
  const liveProductionOrigin = 'https://southern-olive-oil-products.vercel.app';
  const baseOrigin = isLocalhost ? liveProductionOrigin : window.location.origin;
  const cleanAppPath = appUrl.startsWith('/') ? appUrl : '/' + appUrl;
  const fullUrl = baseOrigin + cleanAppPath;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullUrl).catch(() => { });
  }

  // Check if browser native PWA installation prompt is ready
  if (window.SouthernOlivePWA && typeof window.SouthernOlivePWA.triggerInstall === 'function') {
    const prompted = window.SouthernOlivePWA.triggerInstall();
    if (prompted) return;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Render a high-contrast install instruction modal
  let modalEl = document.getElementById('pwa-custom-install-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pwa-custom-install-modal';
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background: #0f172a; color: #ffffff; border: 2px solid #10b981; border-radius: 16px;">
        <div class="modal-header border-bottom border-secondary" style="background: #1e293b;">
          <h5 class="modal-title fw-bold text-success">
            <i class="fa-solid fa-download me-2"></i> تثبيت تطبيق ${appTitle}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center p-4">
          <div class="mb-3">
            <i class="fa-solid fa-mobile-screen-button text-success" style="font-size: 3rem;"></i>
          </div>
          <h6 class="fw-bold mb-3" style="color: #fefae0;">رابط التطبيق جاهز للتثبيت والعمل بشكل مستقر</h6>
          <div class="p-3 mb-3 text-start rounded" style="background: #1e293b; border: 1px solid #334155; font-size: 0.9rem;">
            ${isIOS ? `
              <p class="mb-2 text-warning fw-bold"><i class="fa-solid fa-apple me-1"></i> خطوات التثبيت على الآيفون / الآيباد (Safari):</p>
              <ol class="mb-0 ps-3">
                <li>تم نسخ رابط التطبيق المباشر إلى الحافظة.</li>
                <li>اضغط على زر <strong>مشاركة (Share <i class="fa-solid fa-share-nodes"></i>)</strong> في أسفل الشاشة.</li>
                <li>اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
              </ol>
            ` : `
              <p class="mb-2 text-success fw-bold"><i class="fa-solid fa-android me-1"></i> خطوات التثبيت على الأندرويد / الكمبيوتر (Chrome/Edge):</p>
              <ol class="mb-0 ps-3">
                <li>تم نسخ رابط التطبيق المباشر إلى الحافظة.</li>
                <li>اضغط على <strong>القائمة (3 نقاط <i class="fa-solid fa-ellipsis-vertical"></i>)</strong> أعلى المتصفح.</li>
                <li>اختر <strong>تثبيت التطبيق (Install App)</strong> أو <strong>إضافة للشاشة الرئيسية</strong>.</li>
              </ol>
            `}
          </div>
          <div class="d-flex gap-2">
            <a href="${fullUrl}" target="_blank" class="btn btn-success fw-bold flex-fill">
              <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> فتح التطبيق الآن
            </a>
            <button type="button" class="btn btn-outline-light flex-fill" data-bs-dismiss="modal">إغلاق</button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.bootstrap && window.bootstrap.Modal) {
    const bsModal = new window.bootstrap.Modal(modalEl);
    bsModal.show();
  } else {
    const msg = isIOS
      ? '📱 لتثبيت "' + appTitle + '" على الآيفون:\n\n1. افتح الرابط في Safari:\n' + fullUrl + '\n2. اضغط Share -> Add to Home Screen'
      : '📱 لتثبيت "' + appTitle + '" على الأندرويد/الكمبيوتر:\n\n1. افتح الرابط في Chrome:\n' + fullUrl + '\n2. اضغط القائمة (3 نقاط) -> Install App / إضافة للشاشة الرئيسية';
    alert(msg);
  }
};

// Auto initialize on script load
document.addEventListener('DOMContentLoaded', () => {
  window.SouthernOlivePWA.init();
});
