/**
 * Print utility to print only a specific HTML element or modal card
 * @param {HTMLElement|string} target - DOM Element or selector to print
 * @param {string} title - Document title for the printed document
 */
export function printSpecificElement(target, title = 'Warehouse Document') {
  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element) {
    window.print()
    return
  }

  // Create an isolated hidden iframe for printing
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'

  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()

  // Collect all stylesheet links and style tags from current document
  let stylesHtml = ''
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML
  })

  // Write content to iframe document
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${stylesHtml}
        <style>
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 16px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          }
          .no-print, button {
            display: none !important;
          }
          @page {
            margin: 12mm;
            size: auto;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `)
  doc.close()

  // Wait for styles to load then trigger print and cleanup
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (e) {
      console.error('Print error:', e)
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }
  }, 350)
}
