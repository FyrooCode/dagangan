import { supabase } from '@/lib/supabase'

export const mobileDashboardService = {
  async getMobileDashboardData() {
    const { data: shipments, error: shipmentError } = await supabase
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
      totalOmzet += Number(item.total_amount) || 0

      let returnAmount = 0
      if (item.returns) {
        item.returns.forEach((ret: any) => {
          ret.return_details?.forEach((rd: any) => {
            const price = item.shipment_details?.find((sd: any) => sd.product_id === rd.product_id)?.unit_price_at_time || 0
            returnAmount += (rd.quantity_returned || 0) * price
            const productName = item.shipment_details?.find((sd: any) => sd.product_id === rd.product_id)?.products?.name || 'Unknown'
            productReturns[productName] = (productReturns[productName] || 0) + (rd.quantity_returned || 0)
          })
        })
      }

      const netAmount = (Number(item.total_amount) || 0) - returnAmount

      if (item.status === 'paid') {
        totalPendapatan += netAmount
        item.shipment_details?.forEach((sd: any) => {
          const name = sd.products?.name || 'Unknown'
          productSalesValue[name] = (productSalesValue[name] || 0) + ((sd.quantity || 0) * (sd.unit_price_at_time || 0))
          productQtySold[name] = (productQtySold[name] || 0) + (sd.quantity || 0)
        })
      } else {
        totalPiutang += Math.max(netAmount, 0)
      }

      totalSisaUang += returnAmount

      if (item.shipment_date) {
        dailyTrend[item.shipment_date] = (dailyTrend[item.shipment_date] || 0) + netAmount
      }
    })

    const countPending = (shipments || []).filter((item: any) => item.status !== 'paid').length
    const countLunas = (shipments || []).filter((item: any) => item.status === 'paid').length

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
      chartData,
      topProductsValue,
      topReturns,
      allProductQty,
    }
  },
}
