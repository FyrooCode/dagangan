import { supabase } from '@/lib/supabase'

export const shipmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (name, address, markup_fixed),
        payments (payment_date, amount_received),
        returns (
          id,
          return_details (
            quantity_returned,
            product_id,
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

    return data.map((s: any) => {
      let tglLunas = null
      let totalReceived = 0
      let totalReturNominal = 0
      let detailSisa: any[] = []

      // 1. Hitung Pembayaran
      if (s.payments && s.payments.length > 0) {
        totalReceived = s.payments.reduce((acc: number, p: any) => acc + Number(p.amount_received), 0)
        if (s.status === 'paid') {
          const dates = s.payments.map((p: any) => new Date(p.payment_date).getTime())
          tglLunas = new Date(Math.max(...dates)).toISOString()
        }
      }

      // 2. Hitung Nominal Retur (Barang Sisa)
      // Kita perlu harga barang saat pengiriman (dari shipment_details)
      if (s.returns && s.returns.length > 0) {
        s.returns.forEach((ret: any) => {
          ret.return_details.forEach((rd: any) => {
            // Cari harga satuan pas kirim buat barang ini
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

  async create(shipmentData: any, items: any[]) {
    const { data: shipment, error: sError } = await supabase.from('shipments').insert([shipmentData]).select().single()
    if (sError) throw sError
    const details = items.map(item => ({ shipment_id: shipment.id, product_id: item.product_id, quantity: item.quantity, unit_price_at_time: item.unit_price }))
    const { error: dError } = await supabase.from('shipment_details').insert(details)
    if (dError) throw dError
    return shipment
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('shipments').select(`*, partners (*), shipment_details (*, products (name, unit))`).eq('id', id).single()
    if (error) throw error
    return data
  },

  async update(id: string, shipmentData: any, items: any[]) {
    const { error: sError } = await supabase.from('shipments').update(shipmentData).eq('id', id)
    if (sError) throw sError
    const { error: delError } = await supabase.from('shipment_details').delete().eq('shipment_id', id)
    if (delError) throw delError
    const details = items.map(item => ({ shipment_id: id, product_id: item.product_id, quantity: item.quantity, unit_price_at_time: item.unit_price }))
    const { error: dError } = await supabase.from('shipment_details').insert(details)
    if (dError) throw dError
    return true
  },

  async delete(id: string) {
    const { error } = await supabase.from('shipments').delete().eq('id', id)
    if (error) throw error
    return true
  }
}