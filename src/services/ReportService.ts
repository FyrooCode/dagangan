import { supabase } from '@/lib/supabase'

export const reportService = {
  async getAvailablePeriods() {
    const { data, error } = await supabase
      .from('shipments')
      .select('shipment_date')
      .order('shipment_date', { ascending: false })
      
    if (error) throw error
    
    const periods: Record<number, number[]> = {}
    
    data.forEach(s => {
      if (s.shipment_date) {
        const date = new Date(s.shipment_date)
        const y = date.getFullYear()
        const m = date.getMonth() + 1
        
        if (!periods[y]) {
          periods[y] = []
        }
        if (!periods[y].includes(m)) {
          periods[y].push(m)
        }
      }
    })
    
    // Sort months descending for each year
    Object.keys(periods).forEach(y => {
      periods[Number(y)].sort((a, b) => b - a)
    })
    
    return periods
  },

  async getMonthlyData(year: number | null, month: number | null = null) {
    let query = supabase
      .from('shipments')
      .select(`
        *,
        partners (name),
        payments (amount_received),
        returns (
          return_details (quantity_returned, product_id)
        ),
        shipment_details (
          quantity, product_id, unit_price_at_time,
          products (name, base_price, unit)
        )
      `)
      
    if (year !== null) {
      const startMonth = month ? String(month).padStart(2, '0') : '01';
      const endMonth = month ? String(month).padStart(2, '0') : '12';
      const startDate = `${year}-${startMonth}-01`;
      
      // Get last day of the month
      const lastDay = new Date(year, month || 12, 0).getDate();
      const endDate = `${year}-${endMonth}-${String(lastDay).padStart(2, '0')}T23:59:59.999`;
      
      query = query.gte('shipment_date', startDate).lte('shipment_date', endDate)
    }

    const { data, error } = await query.order('shipment_date', { ascending: true })
    if (error) throw error
    
    return this.processReportData(data, year, month)
  },

  processReportData(shipments: any[], year: number | null, month: number | null) {
    let totalPengiriman = 0
    let totalPotonganSisa = 0
    let kasMasuk = 0
    
    const piutangToko: Record<string, any> = {}
    const logNota: any[] = []
    const performaProduk: Record<string, any> = {}

    shipments.forEach(s => {
      totalPengiriman += Number(s.total_amount || 0)
      
      let notaKasMasuk = 0
      if (s.payments) {
        s.payments.forEach((p: any) => {
          const amt = Number(p.amount_received || 0)
          kasMasuk += amt
          notaKasMasuk += amt
        })
      }

      let notaPotongan = 0
      if (s.returns) {
        s.returns.forEach((r: any) => {
          if (r.return_details) {
            r.return_details.forEach((rd: any) => {
              const shipDetail = s.shipment_details?.find((sd: any) => sd.product_id === rd.product_id)
              const price = shipDetail ? Number(shipDetail.unit_price_at_time) : 0
              notaPotongan += Number(rd.quantity_returned || 0) * price
            })
          }
        })
      }
      totalPotonganSisa += notaPotongan
      
      const terimaBersih = Number(s.total_amount || 0) - notaPotongan

      // Per Toko
      const partnerId = s.partner_id
      const partnerName = s.partners?.name || 'Unknown'
      if (!piutangToko[partnerId]) {
        piutangToko[partnerId] = {
          name: partnerName,
          total_kotor: 0,
          total_potongan: 0,
          sudah_setor: 0,
        }
      }
      piutangToko[partnerId].total_kotor += Number(s.total_amount || 0)
      piutangToko[partnerId].total_potongan += notaPotongan
      piutangToko[partnerId].sudah_setor += notaKasMasuk
      
      // Log Nota
      logNota.push({
        tgl_kirim: s.shipment_date,
        no_nota: s.id.substring(0, 5).toUpperCase(),
        kirim_kotor: Number(s.total_amount || 0),
        retur: notaPotongan,
        terima_bersih: terimaBersih,
        status: s.status === 'paid' ? 'LUNAS' : 'BELUM'
      })

      // Produk
      if (s.shipment_details) {
        s.shipment_details.forEach((sd: any) => {
          const prodId = sd.product_id
          const prodName = sd.products?.name || 'Unknown'
          if (!performaProduk[prodId]) {
            performaProduk[prodId] = {
              name: prodName,
              dikirim: 0,
              diretur: 0,
              base_price: Number(sd.products?.base_price || 0),
              unit_price: Number(sd.unit_price_at_time || 0)
            }
          }
          performaProduk[prodId].dikirim += Number(sd.quantity || 0)
        })
      }
      
      if (s.returns) {
        s.returns.forEach((r: any) => {
          if (r.return_details) {
            r.return_details.forEach((rd: any) => {
              const prodId = rd.product_id
              if (performaProduk[prodId]) {
                performaProduk[prodId].diretur += Number(rd.quantity_returned || 0)
              }
            })
          }
        })
      }
    })

    const tagihanBersih = totalPengiriman - totalPotonganSisa
    const sisaPiutang = tagihanBersih - kasMasuk

    const tablePiutangToko = Object.values(piutangToko).map((t: any) => {
      const tagihan_bersih = t.total_kotor - t.total_potongan
      return {
        nama_toko: t.name,
        tagihan_bersih: tagihan_bersih,
        sudah_setor: t.sudah_setor,
        sisa_tagihan: tagihan_bersih - t.sudah_setor
      }
    })

    const tableProduk = Object.values(performaProduk).map((p: any) => {
      const laku_net = p.dikirim - p.diretur
      return {
        nama_produk: p.name,
        dikirim: p.dikirim,
        diretur: p.diretur,
        laku_net: laku_net,
        estimasi_nilai: laku_net * p.unit_price
      }
    })

    return {
      ringkasan: {
        total_pengiriman: totalPengiriman,
        total_potongan_sisa: totalPotonganSisa,
        tagihan_bersih: tagihanBersih,
        kas_masuk: kasMasuk,
        sisa_piutang: sisaPiutang
      },
      piutang_toko: tablePiutangToko,
      log_nota: logNota,
      performa_produk: tableProduk
    }
  }
}
