import { supabase } from '@/lib/supabase'

export const paymentService = {
  // Ambil semua nota dengan relasi Partners, Shipment Details, Payments, dan Returns Detail
  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (name, address),
        payments (payment_date, amount_received),
        shipment_details (
          product_id,
          quantity,
          unit_price_at_time
        ),
        returns (
          id,
          return_date,
          return_details (
            id,
            product_id,
            quantity_returned,
            products (name)
          )
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
          })
        })
      }

      return { 
        ...s, 
        tgl_lunas: tglLunas,
        total_received: totalReceived,
        total_retur_nominal: totalReturNominal,
        estimasi_bersih: Number(s.total_amount) - totalReturNominal
      }
    })
  },

  // Fungsi sakti: Tandai Lunas (Double Action)
  // Kita tambahkan parameter amount agar yang dicatat adalah nominal yang sudah dipotong retur
  async markAsPaid(shipment: any, amountReceived: number) {
    // 1. Masukkan ke tabel payments sebagai record kas masuk
    const { error: pError } = await supabase
      .from('payments')
      .insert([{
        shipment_id: shipment.id,
        amount_received: amountReceived, 
        payment_date: new Date().toISOString()
      }])

    if (pError) throw pError

    // 2. Update status di tabel shipments jadi 'paid'
    const { error: sError } = await supabase
      .from('shipments')
      .update({ status: 'paid' })
      .eq('id', shipment.id)

    if (sError) throw sError

    return true
  },

  // Batalkan pelunasan (jika salah klik)
  async unmarkAsPaid(shipmentId: string) {
    // 1. Hapus record di payments
    const { error: pError } = await supabase
      .from('payments')
      .delete()
      .eq('shipment_id', shipmentId)

    if (pError) throw pError
      
    // 2. Balikin status ke pending
    const { error: sError } = await supabase
      .from('shipments')
      .update({ status: 'pending' })
      .eq('id', shipmentId)

    if (sError) throw sError

    return true
  }
}