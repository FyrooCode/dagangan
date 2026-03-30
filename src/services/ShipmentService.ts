import { supabase } from '@/lib/supabase'

export const shipmentService = {
  // 1. Ambil daftar semua pengiriman + Detail Partner
  async getAll() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (
          name, 
          address, 
          markup_fixed
        )
      `)
      .order('shipment_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 2. Simpan Pengiriman Baru (Header + Details)
  async create(shipmentData: any, items: any[]) {
    const { data: shipment, error: sError } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()
      .single()

    if (sError) throw sError

    const details = items.map(item => ({
      shipment_id: shipment.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_at_time: item.unit_price 
    }))

    const { error: dError } = await supabase
      .from('shipment_details')
      .insert(details)

    if (dError) throw dError

    return shipment
  },

  // 3. Ambil Detail Nota (Mode Edit & View)
  async getById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (*),
        shipment_details (
          *,
          products (name, unit)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // 4. Update Pengiriman (Update Header + Re-insert Details)
  async update(id: string, shipmentData: any, items: any[]) {
    const { error: sError } = await supabase
      .from('shipments')
      .update(shipmentData)
      .eq('id', id)

    if (sError) throw sError

    const { error: delError } = await supabase
      .from('shipment_details')
      .delete()
      .eq('shipment_id', id)

    if (delError) throw delError

    const details = items.map(item => ({
      shipment_id: id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_at_time: item.unit_price
    }))

    const { error: dError } = await supabase
      .from('shipment_details')
      .insert(details)

    if (dError) throw dError
    return true
  },

  // 5. Hapus Pengiriman
  async delete(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}