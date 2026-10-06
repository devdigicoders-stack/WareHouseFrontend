import * as XLSX from 'xlsx'
import { printSpecificElement } from './printHelper'

/**
 * Export structured JSON data directly to a genuine, uncorrupted Excel (.xlsx) file
 * @param {Array<Object>} data - Array of row objects
 * @param {string} fileName - Destination filename (without extension)
 * @param {string} sheetName - Excel worksheet tab name
 */
export function exportToExcel(data, fileName = 'Warehouse_Export', sheetName = 'WMS_Data') {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export')
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))

    // Write file as binary .xlsx
    XLSX.writeFile(workbook, `${fileName.replace(/\.xlsx$/i, '')}.xlsx`)
    return true
  } catch (err) {
    console.error('Excel export error:', err)
    throw err
  }
}

/**
 * Export data to UTF-8 CSV with standard headers and quotes
 * Supports either (headers, rows, fileName) or (arrayOfObjects, fileName)
 */
export function exportToCSV(arg1, arg2, arg3 = 'Warehouse_Extract') {
  try {
    let csvContent = '\uFEFF' // UTF-8 BOM

    if (Array.isArray(arg1) && typeof arg1[0] === 'object' && !Array.isArray(arg1[0])) {
      // arrayOfObjects mode
      const data = arg1
      const fileName = arg2 || 'Warehouse_Extract'
      const headers = Object.keys(data[0] || {})
      const rows = data.map((item) => headers.map((k) => item[k] ?? ''))
      csvContent += [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${fileName.replace(/\.csv$/i, '')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } else {
      // headers, rows mode
      const headers = arg1 || []
      const rows = arg2 || []
      const fileName = arg3 || 'Warehouse_Extract'

      csvContent += [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${fileName.replace(/\.csv$/i, '')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    }
  } catch (err) {
    console.error('CSV export error:', err)
    throw err
  }
}

/**
 * Trigger clean Printable view for PDF export / print
 */
export function exportToPDF(selector, title = 'Warehouse Report') {
  return printSpecificElement(selector, title)
}

/**
 * Render structured dataset into a clean temporary printable table and trigger browser Print / Save-as-PDF
 */
export function printOrExportPDF(data, title = 'Warehouse Report', subtitle = 'Official Warehouse Extract') {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      window.print()
      return true
    }

    const headers = Object.keys(data[0] || {})
    const rowsHtml = data
      .map(
        (row, idx) =>
          `<tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 6px 8px; font-weight: bold; color: #64748b;">${idx + 1}</td>
            ${headers.map((h) => `<td style="padding: 6px 8px; color: #1e293b;">${row[h] ?? '-'}</td>`).join('')}
          </tr>`
      )
      .join('')

    const printableHtml = `
      <div id="dynamic-pdf-export-container" style="font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #0f172a;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a;">CENTRAL WAREHOUSE SYSTEM</h1>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${title} • ${subtitle}</p>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <p style="margin: 0;">Generated: ${new Date().toLocaleString('en-IN')}</p>
            <p style="margin: 2px 0 0 0; font-weight: bold; color: #059669;">Verified Official Audit</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 10px; text-transform: uppercase; color: #475569;">
              <th style="padding: 8px;">#</th>
              ${headers.map((h) => `<th style="padding: 8px;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
          <span>Report Records Count: ${data.length}</span>
          <span>Authorized Warehouse Supervisor Signature: _______________________</span>
        </div>
      </div>
    `

    let container = document.getElementById('dynamic-pdf-export-container')
    if (container) container.remove()
    const wrapper = document.createElement('div')
    wrapper.innerHTML = printableHtml
    document.body.appendChild(wrapper)
    printSpecificElement('#dynamic-pdf-export-container', title)
    setTimeout(() => wrapper.remove(), 2000)
    return true
  } catch (err) {
    console.error('PDF export error:', err)
    window.print()
  }
}
