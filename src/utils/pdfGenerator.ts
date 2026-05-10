import { generate } from '@pdfme/generator'
import { text, table } from '@pdfme/schemas'
import type { Template } from '@pdfme/common'

const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
const formatDate = (date: string) => !date ? '-' : new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })

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
      // HALAMAN 1: Ringkasan Eksekutif (Dashboard View)
      [
        ...createPageHeader('p1'),
        { name: 'summaryTitle', type: 'text', position: { x: 15, y: 35 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        
        // Metric 1: Pengiriman (Omzet)
        { name: 'omzetLabel', type: 'text', position: { x: 15, y: 48 }, width: 85, height: 6, fontSize: 9, fontColor: '#ffffff', backgroundColor: '#2980ba', alignment: 'center', verticalAlignment: 'middle' },
        { name: 'omzetValue', type: 'text', position: { x: 15, y: 54 }, width: 85, height: 16, fontSize: 16, fontColor: '#2c3e50', backgroundColor: '#f1f5f9', alignment: 'center', verticalAlignment: 'middle' },

        // Metric 2: Retur
        { name: 'returLabel', type: 'text', position: { x: 110, y: 48 }, width: 85, height: 6, fontSize: 9, fontColor: '#ffffff', backgroundColor: '#e74c3c', alignment: 'center', verticalAlignment: 'middle' },
        { name: 'returValue', type: 'text', position: { x: 110, y: 54 }, width: 85, height: 16, fontSize: 16, fontColor: '#2c3e50', backgroundColor: '#fdf2f2', alignment: 'center', verticalAlignment: 'middle' },

        // Metric 3: Tagihan Bersih
        { name: 'netLabel', type: 'text', position: { x: 15, y: 78 }, width: 85, height: 6, fontSize: 9, fontColor: '#ffffff', backgroundColor: '#27ae60', alignment: 'center', verticalAlignment: 'middle' },
        { name: 'netValue', type: 'text', position: { x: 15, y: 84 }, width: 85, height: 16, fontSize: 16, fontColor: '#2c3e50', backgroundColor: '#f0fdf4', alignment: 'center', verticalAlignment: 'middle' },

        // Metric 4: Kas Masuk
        { name: 'kasLabel', type: 'text', position: { x: 110, y: 78 }, width: 85, height: 6, fontSize: 9, fontColor: '#ffffff', backgroundColor: '#16a085', alignment: 'center', verticalAlignment: 'middle' },
        { name: 'kasValue', type: 'text', position: { x: 110, y: 84 }, width: 85, height: 16, fontSize: 16, fontColor: '#2c3e50', backgroundColor: '#f1faf8', alignment: 'center', verticalAlignment: 'middle' },

        // Metric 5: Piutang
        { name: 'piutangLabel', type: 'text', position: { x: 15, y: 108 }, width: 180, height: 6, fontSize: 10, fontColor: '#ffffff', backgroundColor: '#f39c12', alignment: 'center', verticalAlignment: 'middle' },
        { name: 'piutangValue', type: 'text', position: { x: 15, y: 114 }, width: 180, height: 18, fontSize: 20, fontColor: '#2c3e50', backgroundColor: '#fef9f1', alignment: 'center', verticalAlignment: 'middle' },

        // Box for notes/info
        { name: 'noteBox', type: 'text', position: { x: 15, y: 145 }, width: 180, height: 20, fontSize: 10, fontColor: '#7f8c8d', backgroundColor: '#f9f9f9', lineHeight: 1.4, padding: { top: 5, right: 5, bottom: 5, left: 5 } }
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
          headWidthPercentages: [35, 22, 22, 21],
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
          headWidthPercentages: [16, 12, 20, 18, 20, 14],
          columnStyles: {
            0: { alignment: 'left' }, 1: { alignment: 'left' }, 2: { alignment: 'left' }, 3: { alignment: 'left' }, 4: { alignment: 'left' }, 5: { alignment: 'left' }
          },
          head: ['Tgl Kirim', 'No Nota', 'Kirim Kotor', 'Retur', 'Terima Bersih', 'Status']
        }
      ],
      // HALAMAN 3: Performa Produk (Leaderboards View)
      [
        ...createPageHeader('p3'),
        { name: 'produkTitle', type: 'text', position: { x: 15, y: 35 }, width: 180, height: 8, fontSize: 14, fontColor: '#2c3e50' },
        
        { name: 'bestSellerTitle', type: 'text', position: { x: 15, y: 55 }, width: 180, height: 6, fontSize: 12, fontColor: '#27ae60' },
        { name: 'best1', type: 'text', position: { x: 15, y: 65 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#f0fdf4', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
        { name: 'best2', type: 'text', position: { x: 15, y: 82 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#f0fdf4', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
        { name: 'best3', type: 'text', position: { x: 15, y: 99 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#f0fdf4', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
        
        { name: 'worstTitle', type: 'text', position: { x: 15, y: 130 }, width: 180, height: 6, fontSize: 12, fontColor: '#e74c3c' },
        { name: 'worst1', type: 'text', position: { x: 15, y: 140 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#fdf2f2', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
        { name: 'worst2', type: 'text', position: { x: 15, y: 157 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#fdf2f2', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
        { name: 'worst3', type: 'text', position: { x: 15, y: 174 }, width: 180, height: 14, fontSize: 11, backgroundColor: '#fdf2f2', verticalAlignment: 'middle', padding: { left: 5, right: 5 } },
      ]
    ]
  }

  // --- DATA PREPARATION ---
  const currentPrintDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const periodText = `Periode: ${periodName}\nDicetak: ${currentPrintDate}`
  const compAddress = "Sistem Dagangan\nAplikasi Rekapitulasi Otomatis\nDivisi Keuangan & Logistik"

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

  // 4. Produk Data (Sort for Top 3)
  const allProducts = reportData.performa_produk || []
  const topTerlaris = [...allProducts].sort((a, b) => b.estimasi_nilai - a.estimasi_nilai).slice(0, 3)
  const topRetur = [...allProducts].sort((a, b) => b.diretur - a.diretur).slice(0, 3)

  const formatProductRow = (prod: any, type: 'omzet' | 'retur', rank: number) => {
    if (!prod) return '-'
    if (type === 'omzet') return `#${rank}   ${prod.nama_produk}   |   Terjual: ${prod.laku_net} pcs   |   Estimasi Omzet: ${formatRp(prod.estimasi_nilai)}`
    return `#${rank}   ${prod.nama_produk}   |   Dikembalikan: ${prod.diretur} pcs`
  }

  // Provide inputs to template
  const inputs = [{
    // Page 1
    compName_p1: 'DAGANGAN', docType_p1: 'BUKU REKAPITULASI', periodInfo_p1: periodText, divider_p1: '',
    summaryTitle: 'Ringkasan Eksekutif & Arus Kas',
    omzetLabel: 'TOTAL PENGIRIMAN (KOTOR)',
    omzetValue: formatRp(reportData.ringkasan.total_pengiriman),
    returLabel: 'TOTAL POTONGAN SISA',
    returValue: formatRp(reportData.ringkasan.total_potongan_sisa),
    netLabel: 'TAGIHAN BERSIH',
    netValue: formatRp(reportData.ringkasan.tagihan_bersih),
    kasLabel: 'KAS MASUK (DITERIMA)',
    kasValue: formatRp(reportData.ringkasan.kas_masuk),
    piutangLabel: 'SISA PIUTANG (GANTUNG)',
    piutangValue: formatRp(reportData.ringkasan.sisa_piutang),
    noteBox: noteText,
    
    // Page 2
    compName_p2: 'DAGANGAN', docType_p2: 'BUKU REKAPITULASI', periodInfo_p2: periodText, divider_p2: '',
    tokoTitle: 'Rincian Piutang Per Toko',
    tokoTable: JSON.stringify(tokoRows.length > 0 ? tokoRows : [['-', '-', '-', '-']]),
    notaTitle: 'Log Nota Pengiriman',
    notaTable: JSON.stringify(notaRows.length > 0 ? notaRows : [['-', '-', '-', '-', '-', '-']]),
    
    // Page 3
    compName_p3: 'DAGANGAN', docType_p3: 'BUKU REKAPITULASI', periodInfo_p3: periodText, divider_p3: '',
    produkTitle: 'Sorotan Performa Produk',
    bestSellerTitle: 'Top 3 Produk Terlaris (Berdasarkan Nilai Net)',
    best1: formatProductRow(topTerlaris[0], 'omzet', 1),
    best2: formatProductRow(topTerlaris[1], 'omzet', 2),
    best3: formatProductRow(topTerlaris[2], 'omzet', 3),
    worstTitle: 'Top 3 Produk Paling Banyak Diretur',
    worst1: formatProductRow(topRetur[0], 'retur', 1),
    worst2: formatProductRow(topRetur[1], 'retur', 2),
    worst3: formatProductRow(topRetur[2], 'retur', 3),
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
