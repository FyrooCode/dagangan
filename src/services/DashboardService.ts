import { supabase } from '@/lib/supabase'

export const dashboardService = {
  async getDashboardData() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        id,
        shipment_date,
        total_amount,
        status,
        returns (
          return_details (quantity_returned, product_id)
        ),
        shipment_details (
          product_id, 
          unit_price_at_time, 
          quantity,
          products (name) 
        )
      `)
      .order('shipment_date', { ascending: true })

    if (error) throw error

    let stats = { omzetLunas: 0, piutangPending: 0, totalSisaUang: 0, countLunas: 0, countPending: 0 }
    const dailyTrend: Record<string, number> = {}
    const productSalesValue: Record<string, number> = {} // Untuk Top Omzet
    const productQtySold: Record<string, number> = {}    // Untuk Total Terjual (Qty)
    const productReturns: Record<string, number> = {}     // Untuk Total Retur

    data.forEach((s: any) => {
      let returnAmount = 0
      
      // Hitung Retur per Produk
      if (s.returns) {
        s.returns.forEach((ret: any) => {
          ret.return_details?.forEach((rd: any) => {
            const price = s.shipment_details.find((sd: any) => sd.product_id === rd.product_id)?.unit_price_at_time || 0
            returnAmount += (rd.quantity_returned * price)
            
            // Stats Retur per Item
            const pName = s.shipment_details.find((sd: any) => sd.product_id === rd.product_id)?.products?.name || 'Unknown'
            productReturns[pName] = (productReturns[pName] || 0) + rd.quantity_returned
          })
        })
      }

      const netAmount = s.total_amount - returnAmount
      
      if (s.status === 'paid') {
        stats.omzetLunas += netAmount
        stats.countLunas++
        
        // Hitung Terjual (Qty & Omzet) - Hanya yang Lunas
        s.shipment_details.forEach((sd: any) => {
          const productName = sd.products?.name || 'Unknown'
          productSalesValue[productName] = (productSalesValue[productName] || 0) + (sd.quantity * sd.unit_price_at_time)
          productQtySold[productName] = (productQtySold[productName] || 0) + sd.quantity
        })
      } else {
        stats.piutangPending += netAmount
        stats.countPending++
      }
      stats.totalSisaUang += returnAmount

      if (s.shipment_date) {
        dailyTrend[s.shipment_date] = (dailyTrend[s.shipment_date] || 0) + netAmount
      }
    })

    // Format Data untuk Chart
    const chartData = Object.keys(dailyTrend).map(date => ({
      x: new Date(date).getTime(),
      y: dailyTrend[date] ?? 0
    })).filter(d => !isNaN(d.x)).sort((a, b) => a.x - b.x)

    const topProductsValue = Object.keys(productSalesValue)
      .map(name => ({ name, total: productSalesValue[name] ?? 0 }))
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0)).slice(0, 5)

    const allProductQty = Object.keys(productQtySold)
      .map(name => ({ name, qty: productQtySold[name] ?? 0 }))
      .sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0))

    const topReturns = Object.keys(productReturns)
      .map(name => ({ name, qty: productReturns[name] ?? 0 }))
      .sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0)).slice(0, 5)

    return { stats, chartData, topProductsValue, allProductQty, topReturns }
  }
}