import { supabase } from '@/lib/supabase'

export const paymentService = {
  // Ambil semua nota dengan relasi Partners, Shipment Details, dan Returns Detail
  async getAllShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (name),
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
    return data
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