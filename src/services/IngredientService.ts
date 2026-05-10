import { supabase } from '@/lib/supabase'

export const ingredientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },

  async create(formData: { name: string; unit: string }) {
    const { data, error } = await supabase
      .from('ingredients')
      .insert([formData])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, formData: { name: string; unit: string }) {
    const { data, error } = await supabase
      .from('ingredients')
      .update(formData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }
}
