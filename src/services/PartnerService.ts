import { supabase } from '@/lib/supabase'

export const partnerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(partnerData: { name: string; address: string; markup_fixed: number }) {
    const { data, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()
    
    if (error) throw error
    return data
  },

  async update(id: string, partnerData: { name: string; address: string; markup_fixed: number }) {
    const { data, error } = await supabase
      .from('partners')
      .update(partnerData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}