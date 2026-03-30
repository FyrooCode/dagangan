import { supabase } from '@/lib/supabase'

export const productService = {
  // 1. Ambil semua produk (Real-time sort by created_at)
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 2. Simpan produk baru
  async create(productData: { name: string; base_price: number; unit: string }) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
    
    if (error) throw error
    return data
  },

  // 3. Update produk yang sudah ada
  async update(id: string, productData: { name: string; base_price: number; unit: string }) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  },

  // 4. Hapus produk
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}