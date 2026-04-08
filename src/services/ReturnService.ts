import { supabase } from '@/lib/supabase'

export const returnService = {
  // Ambil data gabungan untuk 3 Tab (Antrean, Diisi, Selesai)
  async getAllCombined() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (
          name,
          address
        ),
        payments (
          payment_date,
          amount_received
        ),
        returns (
          id,
          return_date,
          return_details (
            id,
            product_id,
            quantity_returned,
            products (name, unit)
          )
        ),
        shipment_details (
          product_id,
          unit_price_at_time
        )
      `)
      .order('shipment_date', { ascending: false })
    
    if (error) throw error
    
    // Compute enriched fields
    return data.map((s: any) => {
      let tglLunas = null
      let totalReceived = 0
      let totalReturNominal = 0
      let detailSisa: any[] = []

      // 1. Hitung Pembayaran
      if (s.payments && s.payments.length > 0) {
        totalReceived = s.payments.reduce((acc: number, p: any) => acc + Number(p.amount_received || 0), 0)
        if (s.status === 'paid') {
          const dates = s.payments.map((p: any) => new Date(p.payment_date).getTime())
          tglLunas = new Date(Math.max(...dates)).toISOString()
        }
      }

      // 2. Hitung Nominal Retur (Barang Sisa)
      if (s.returns && s.returns.length > 0) {
        s.returns.forEach((ret: any) => {
          ret.return_details.forEach((rd: any) => {
            const shipDetail = s.shipment_details.find((sd: any) => sd.product_id === rd.product_id)
            const price = shipDetail ? Number(shipDetail.unit_price_at_time) : 0
            const nominal = Number(rd.quantity_returned) * price
            totalReturNominal += nominal
            
            if (rd.quantity_returned > 0) {
              detailSisa.push({
                name: rd.products.name,
                qty: rd.quantity_returned,
                unit: rd.products.unit,
                nominal: nominal
              })
            }
          })
        })
      }

      return { 
        ...s, 
        tgl_lunas: tglLunas,
        total_received: totalReceived,
        total_retur_nominal: totalReturNominal,
        estimasi_bersih: Number(s.total_amount) - totalReturNominal,
        list_sisa: detailSisa
      }
    })
  },

  // Ambil detail spesifik data retur
  async getById(id: string) {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        id, 
        return_date, 
        notes,
        shipments (
          id, 
          shipment_date, 
          partners (name)
        ),
        return_details (
          id, 
          product_id, 
          quantity_returned, 
          products (name, unit)
        )
      `)
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  },

  // Simpan data retur baru
  async create(returnData: any, items: any[]) {
    // 1. Insert Header Retur
    const { data: retHeader, error: rError } = await supabase
      .from('returns')
      .insert([returnData])
      .select()
      .single()
      
    if (rError) throw rError

    // 2. Insert Detail Retur
    const details = items.map(item => ({
      return_id: retHeader.id,
      product_id: item.product_id,
      quantity_returned: item.quantity_returned
    }))

    const { error: dError } = await supabase
      .from('return_details')
      .insert(details)
      
    if (dError) throw dError
    
    return retHeader
  },

  // Hapus data retur
  async delete(id: string) {
    const { error } = await supabase
      .from('returns')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}