import { supabase } from '@/lib/supabase'

export const mobileDashboardService = {
  async getMobileDashboardData(month?: number, year?: number) {
    let query = supabase
      .from('shipments')
      .select(`
        id,
        shipment_date,
        total_amount,
        status,
        shipment_details (
          product_id,
          unit_price_at_time,
          quantity,
          products (name)
        ),
        returns (return_details (quantity_returned, product_id))
      `)

    if (month !== undefined && year !== undefined) {
      const startMonth = String(month).padStart(2, '0')
      const startDate = `${year}-${startMonth}-01`
      
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${startMonth}-${String(lastDay).padStart(2, '0')}T23:59:59.999`
      
      query = query.gte('shipment_date', startDate).lte('shipment_date', endDate)
    }

    const { data: shipments, error: shipmentError } = await query
      .select(`
        id,
        shipment_date,
        total_amount,
        status,
        shipment_details (
          product_id,
          unit_price_at_time,
          quantity,
          products (name)
        ),
        returns (return_details (quantity_returned, product_id)),
        payments (amount_received, payment_date)
      `)

    if (shipmentError) throw shipmentError

    let totalOmzet = 0
    let totalPendapatan = 0
    let totalPiutang = 0
    let totalSisaUang = 0
    const dailyTrend: Record<string, number> = {}
    const productSalesValue: Record<string, number> = {}
    const productQtySold: Record<string, number> = {}
    const productReturns: Record<string, number> = {}

    ;(shipments || []).forEach((item: any) => {
      const amount = Number(item.total_amount) || 0
      totalOmzet += amount

      let returnAmount = 0
      const currentShipmentReturns: Record<string, number> = {}
      if (item.returns) {
        item.returns.forEach((ret: any) => {
          ret.return_details?.forEach((rd: any) => {
            const price = item.shipment_details?.find((sd: any) => sd.product_id === rd.product_id)?.unit_price_at_time || 0
            const nominal = (rd.quantity_returned || 0) * price
            returnAmount += nominal
            
            const productName = item.shipment_details?.find((sd: any) => sd.product_id === rd.product_id)?.products?.name || 'Unknown'
            productReturns[productName] = (productReturns[productName] || 0) + (rd.quantity_returned || 0)
            currentShipmentReturns[rd.product_id] = (currentShipmentReturns[rd.product_id] || 0) + (rd.quantity_returned || 0)
          })
        })
      }

      const netAmount = amount - returnAmount
      totalSisaUang += returnAmount

      // Track Daily Omzet by Shipment Date in Local Timezone
      if (item.shipment_date) {
        const d = new Date(item.shipment_date)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        dailyTrend[dateStr] = (dailyTrend[dateStr] || 0) + amount
      }

      // Handle Payments for this specific shipment
      let shipmentReceived = 0
      if (item.payments) {
        item.payments.forEach((p: any) => {
          const pAmount = Number(p.amount_received) || 0
          shipmentReceived += pAmount
          totalPendapatan += pAmount
        })
      }

      totalPiutang += Math.max(netAmount - shipmentReceived, 0)

      // Calculate product stats for this shipment, subtracting returns
      item.shipment_details?.forEach((sd: any) => {
        const name = sd.products?.name || 'Unknown'
        const returnedQty = currentShipmentReturns[sd.product_id] || 0
        const soldQty = Math.max((sd.quantity || 0) - returnedQty, 0)
        
        if (soldQty > 0) {
          productSalesValue[name] = (productSalesValue[name] || 0) + (soldQty * (sd.unit_price_at_time || 0))
          productQtySold[name] = (productQtySold[name] || 0) + soldQty
        }
      })
    })

    const countPending = (shipments || []).filter((item: any) => item.status !== 'paid').length
    const countLunas = (shipments || []).filter((item: any) => item.status === 'paid').length
    const countTotal = (shipments || []).length

    const chartData = Object.keys(dailyTrend)
      .map(date => ({ x: new Date(date).getTime(), y: dailyTrend[date] ?? 0 }))
      .filter(d => !isNaN(d.x))
      .sort((a, b) => a.x - b.x)

    const topProductsValue = Object.keys(productSalesValue)
      .map(name => ({ name, total: productSalesValue[name] ?? 0 }))
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
      .slice(0, 5)

    const topReturns = Object.keys(productReturns)
      .map(name => ({ name, qty: productReturns[name] ?? 0 }))
      .sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0))
      .slice(0, 5)

    const allProductQty = Object.keys(productQtySold)
      .map(name => ({ name, qty: productQtySold[name] ?? 0 }))
      .sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0))

    return {
      totalOmzet,
      totalPendapatan,
      totalPiutang,
      totalSisaUang,
      countPending,
      countLunas,
      countTotal,
      chartData,
      topProductsValue,
      topReturns,
      allProductQty,
    }
  },
}
