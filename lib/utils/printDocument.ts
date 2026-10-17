export function printElementById(elementId: string, title: string = 'Vanguard Document') {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Print Error: Element #${elementId} not found.`);
    return;
  }

  const existingIframe = document.getElementById('vanguard-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'vanguard-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  // Clone element to strip hidden, sr-only, and off-screen positioning classes
  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.classList.remove('hidden', 'sr-only', 'invisible', 'opacity-0', 'fixed');
  // Strip offscreen utility classes if present
  Array.from(cloned.classList).forEach((cls) => {
    if (cls.includes('[-9999px]') || cls.startsWith('left-') || cls.startsWith('top-') || cls === 'hidden') {
      cloned.classList.remove(cls);
    }
  });
  cloned.style.display = 'block';
  cloned.style.visibility = 'visible';
  cloned.style.opacity = '1';
  cloned.style.position = 'static';
  cloned.style.left = 'auto';
  cloned.style.top = 'auto';
  cloned.style.width = '100%';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm 6mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
            overflow: visible !important;
            height: auto !important;
          }
          #${elementId}, .printable-document, .vanguard-printable {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          body * {
            visibility: visible !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          body > *:last-child,
          #${elementId} > *:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .no-print, button { display: none !important; }
        </style>
      </head>
      <body>
        ${cloned.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
  }, 300);
}
