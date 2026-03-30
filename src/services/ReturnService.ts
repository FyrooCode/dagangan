import { supabase } from '@/lib/supabase'

export const returnService = {
  // Ambil data gabungan untuk 3 Tab
  async getAllCombined() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        partners (name),
        returns (
          id,
          return_date,
          return_details (
            id,
            product_id,
            quantity_returned,
            products (name, unit)
          )
        )
      `)
      .order('shipment_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        id, return_date, notes,
        shipments (id, shipment_date, partners (name)),
        return_details (id, product_id, quantity_returned, products (name, unit))
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(returnData: any, items: any[]) {
    const { data: retHeader, error: rError } = await supabase
      .from('returns')
      .insert([returnData])
      .select().single()
    if (rError) throw rError

    const details = items.map(item => ({
      return_id: retHeader.id,
      product_id: item.product_id,
      quantity_returned: item.quantity_returned
    }))

    const { error: dError } = await supabase.from('return_details').insert(details)
    if (dError) throw dError
    return retHeader
  },

  async delete(id: string) {
    const { error } = await supabase.from('returns').delete().eq('id', id)
    if (error) throw error
    return true
  }
}