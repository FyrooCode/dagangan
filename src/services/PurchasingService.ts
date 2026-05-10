import { supabase } from '@/lib/supabase'

export const purchasingService = {
  async getAll() {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, purchase_details(*, ingredients(*))')
      .order('purchase_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(header: any, details: any[]) {
    // 1. Insert Header
    const { data: purchase, error: hError } = await supabase
      .from('purchases')
      .insert([header])
      .select()
      .single()

    if (hError) throw hError

    // 2. Insert Details
    const detailsToInsert = details.map(d => ({
      purchase_id: purchase.id,
      ingredient_id: d.ingredient_id,
      quantity: d.quantity,
      cost_per_unit: d.cost_per_unit
    }))

    const { error: dError } = await supabase.from('purchase_details').insert(detailsToInsert)
    if (dError) throw dError

    return purchase
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }
}
