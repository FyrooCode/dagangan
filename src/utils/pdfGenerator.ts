import { generate } from '@pdfme/generator'
import { text, table } from '@pdfme/schemas'
import type { Template } from '@pdfme/common'

const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
const formatDate = (date: string) => !date ? '-' : new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

export const exportRekapToPDF = async (reportData: any, periodName: string) => {
  const baseTableConfig = {
    showHead: true,
    tableStyles: {
      borderWidth: 0,
      borderColor: '#000000',
    },
    headStyles: {
      fontSize: 11,
      characterSpacing: 0,
      alignment: 'center',
      verticalAlignment: 'middle',
      lineHeight: 1,
      fontColor: '#ffffff',
      borderColor: '',
      backgroundColor: '#2980ba',
      borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 6, right: 6, bottom: 6, left: 6 }
    },
    bodyStyles: {
      fontSize: 10,
      characterSpacing: 0,
      alignment: 'left',
      verticalAlignment: 'middle',
      lineHeight: 1,
      fontColor: '#333333',
      borderColor: '#dddddd',
      backgroundColor: '#ffffff',
      alternateBackgroundColor: '#f5f5f5',
      borderWidth: { top: 0, right: 0, bottom: 0.1, left: 0 },
      padding: { top: 6, right: 6, bottom: 6, left: 6 }
    },
    columnStyles: {}
  }

  // Common Header Components for every page
  const createPageHeader = (pageTitle: string, yOffset = 15) => [
    { name: `compName_${pageTitle}`, type: 'text', position: { x: 15, y: yOffset }, width: 90, height: 10, fontSize: 20, fontColor: '#2980ba' },
    { name: `docType_${pageTitle}`, type: 'text', position: { x: 105, y: yOffset + 2 }, width: 90, height: 10, fontSize: 14, alignment: 'right', fontColor: '#333333' },
    { name: `periodInfo_${pageTitle}`, type: 'text', position: { x: 105, y: yOffset + 10 }, width: 90, height: 12, fontSize: 10, alignment: 'right', fontColor: '#7f8c8d', lineHeight: 1.2 },
    { name: `divider_${pageTitle}`, type: 'text', position: { x: 15, y: yOffset + 20 }, width: 180, height: 0.5, backgroundColor: '#2980ba' }
  ]

  // Setup Template Structure
  // We use blank PDF with specific margins to allow automatic page breaks for tables
  const template: Template = {
    basePdf: { width: 210, height: 297, padding: [15, 15, 20, 15] },
    schemas: [
      // HALAMAN 1: Ringkasan Eksekutif
      [
        ...createPageHeader('p1'),
        { name: 'summaryTitle', type: 'text', position: { x: 15, y: 35 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        { 
          name: 'summaryTable', 
          type: 'table', 
          position: { x: 15, y: 45 }, 
          width: 180, 
          height: 30,
          ...baseTableConfig,
          headWidthPercentages: [20, 20, 20, 20, 20],
          columnStyles: {
            0: { alignment: 'left' }, 1: { alignment: 'left' }, 2: { alignment: 'left' }, 3: { alignment: 'left' }, 4: { alignment: 'left' }
          },
          head: ['Total Pengiriman', 'Potongan Sisa', 'Tagihan Bersih', 'Kas Masuk', 'Sisa Piutang']
        }
      ],
      // HALAMAN 2: Rincian Toko & Log Nota
      [
        ...createPageHeader('p2'),
        { name: 'tokoTitle', type: 'text', position: { x: 15, y: 35 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        { 
          name: 'tokoTable', 
          type: 'table', 
          position: { x: 15, y: 45 }, 
          width: 180, 
          height: 30,
          ...baseTableConfig,
          headWidthPercentages: [40, 20, 20, 20],
          columnStyles: {
            0: { alignment: 'left' }, 1: { alignment: 'left' }, 2: { alignment: 'left' }, 3: { alignment: 'left' }
          },
          head: ['Nama Toko', 'Tagihan Bersih', 'Sudah Setor', 'Sisa Tagihan']
        },
        { name: 'notaTitle', type: 'text', position: { x: 15, y: 95 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        { 
          name: 'notaTable', 
          type: 'table', 
          position: { x: 15, y: 105 }, 
          width: 180, 
          height: 30,
          ...baseTableConfig,
          headWidthPercentages: [15, 15, 20, 15, 20, 15],
          columnStyles: {
            0: { alignment: 'left' }, 1: { alignment: 'left' }, 2: { alignment: 'left' }, 3: { alignment: 'left' }, 4: { alignment: 'left' }, 5: { alignment: 'left' }
          },
          head: ['Tgl Kirim', 'No Nota', 'Kirim Kotor', 'Retur', 'Terima Bersih', 'Status']
        }
      ],
      // HALAMAN 3: Performa Produk
      [
        ...createPageHeader('p3'),
        { name: 'produkTitle', type: 'text', position: { x: 15, y: 35 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        { 
          name: 'produkTable', 
          type: 'table', 
          position: { x: 15, y: 45 }, 
          width: 180, 
          height: 30,
          ...baseTableConfig,
          headWidthPercentages: [35, 15, 15, 15, 20],
          columnStyles: {
            0: { alignment: 'left' }, 1: { alignment: 'center' }, 2: { alignment: 'center' }, 3: { alignment: 'center' }, 4: { alignment: 'left' }
          },
          head: ['Nama Produk', 'Dikirim', 'Diretur', 'Laku (Net)', 'Estimasi Nilai']
        }
      ]
    ]
  }

  // --- DATA PREPARATION ---
  const currentPrintDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const periodText = `Periode: ${periodName}\nDicetak: ${currentPrintDate}`
  const compAddress = "Sistem Dagangan\nAplikasi Rekapitulasi Otomatis\nDivisi Keuangan & Logistik"

  // 1. Summary Data
  const summaryRows = [[
    formatRp(reportData.ringkasan.total_pengiriman),
    formatRp(reportData.ringkasan.total_potongan_sisa),
    formatRp(reportData.ringkasan.tagihan_bersih),
    formatRp(reportData.ringkasan.kas_masuk),
    formatRp(reportData.ringkasan.sisa_piutang)
  ]]

  const noteText = `Catatan Laporan:\nLaporan ini merangkum total pergerakan barang dan uang untuk periode pengiriman ${periodName}. Nilai Tagihan Bersih didapat setelah dikurangi barang yang diretur/sisa.`

  // 2. Toko Data
  const tokoRows = reportData.piutang_toko.map((t: any) => [
    t.nama_toko || '-',
    formatRp(t.tagihan_bersih),
    formatRp(t.sudah_setor),
    formatRp(t.sisa_tagihan)
  ])

  // 3. Nota Data
  const notaRows = reportData.log_nota.map((n: any) => [
    formatDate(n.tgl_kirim),
    n.no_nota.substring(0, 8).toUpperCase(),
    formatRp(n.kirim_kotor),
    formatRp(n.retur || 0),
    formatRp(n.terima_bersih),
    n.status === 'paid' || n.status === 'LUNAS' ? 'LUNAS' : 'PENDING'
  ])

  // 4. Produk Data
  const produkRows = reportData.performa_produk.map((p: any) => [
    p.nama_produk,
    String(p.dikirim),
    String(p.diretur),
    String(p.laku_net),
    formatRp(p.estimasi_nilai)
  ])

  // Provide inputs to template
  const inputs = [{
    // Page 1
    compName_p1: 'DAGANGAN', docType_p1: 'BUKU REKAPITULASI', periodInfo_p1: periodText, divider_p1: '',
    summaryTitle: 'Ringkasan Eksekutif & Arus Kas',
    summaryTable: JSON.stringify(summaryRows),
    
    // Page 2
    compName_p2: 'DAGANGAN', docType_p2: 'BUKU REKAPITULASI', periodInfo_p2: periodText, divider_p2: '',
    tokoTitle: 'Rincian Piutang Per Toko',
    tokoTable: JSON.stringify(tokoRows.length > 0 ? tokoRows : [['-', '-', '-', '-']]),
    notaTitle: 'Log Nota Pengiriman',
    notaTable: JSON.stringify(notaRows.length > 0 ? notaRows : [['-', '-', '-', '-', '-', '-']]),
    
    // Page 3
    compName_p3: 'DAGANGAN', docType_p3: 'BUKU REKAPITULASI', periodInfo_p3: periodText, divider_p3: '',
    produkTitle: 'Performa & Pergerakan Produk',
    produkTable: JSON.stringify(produkRows.length > 0 ? produkRows : [['-', '-', '-', '-', '-']])
  }]

  try {
    const pdf = await generate({
      template,
      inputs,
      plugins: { text, table }
    })

    // Download
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Rekap_Bulanan_${periodName.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw error
  }
}
