import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { inventory, sales } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

type LineItemDraft = {
  id: string
  item_id: string
  warehouse_id: string
  unit_id: string
  qty: number
  unit_price_minor: number
  discount_minor: number
  tax_minor: number
  description?: string
}

export default function NewOrder() {
  const navigate = useNavigate()

  const [loadingRefs, setLoadingRefs] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<unknown | null>(null)

  const [customers, setCustomers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  const [customerId, setCustomerId] = useState('')
  const [orderDate, setOrderDate] = useState(todayISO())
  const [expectedShipDate, setExpectedShipDate] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')

  const [lines, setLines] = useState<LineItemDraft[]>(() => [
    {
      id: crypto.randomUUID(),
      item_id: '',
      warehouse_id: '',
      unit_id: '',
      qty: 1,
      unit_price_minor: 0,
      discount_minor: 0,
      tax_minor: 0,
      description: '',
    },
  ])

  useEffect(() => {
    const run = async () => {
      setLoadingRefs(true)
      setError(null)
      try {
        const [custRes, itemsRes, whRes, unitRes] = await Promise.all([
          sales.customers.list({ limit: 200 }),
          inventory.items.list({ limit: 200 }),
          inventory.warehouses.list(),
          inventory.units.list(),
        ])

        setCustomers(custRes.data.data?.customers ?? custRes.data.data ?? [])
        setItems(itemsRes.data.data?.items ?? itemsRes.data.data ?? [])
        setWarehouses(whRes.data.data ?? [])
        setUnits(unitRes.data.data ?? [])
      } catch (e) {
        setError(e)
      } finally {
        setLoadingRefs(false)
      }
    }
    run()
  }, [])

  const totals = useMemo(() => {
    let subtotal = 0
    let tax = 0
    let discount = 0
    for (const l of lines) {
      subtotal += (Number(l.qty) || 0) * (Number(l.unit_price_minor) || 0)
      tax += Number(l.tax_minor) || 0
      discount += Number(l.discount_minor) || 0
    }
    return {
      subtotal,
      tax,
      discount,
      total: subtotal + tax - discount,
    }
  }, [lines])

  const canSubmit = useMemo(() => {
    if (submitting || loadingRefs) return false
    if (!customerId) return false
    const validLines = lines.filter((l) => l.item_id && l.warehouse_id && l.unit_id)
    if (!validLines.length) return false
    return validLines.every((l) => (Number(l.qty) || 0) > 0)
  }, [customerId, lines, submitting, loadingRefs])

  const updateLine = (id: string, patch: Partial<LineItemDraft>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        item_id: '',
        warehouse_id: '',
        unit_id: '',
        qty: 1,
        unit_price_minor: 0,
        discount_minor: 0,
        tax_minor: 0,
        description: '',
      },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)))
  }

  const handleCreate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        customer_id: customerId,
        order_date: orderDate,
        expected_ship_date: expectedShipDate || null,
        billing_address: billingAddress || null,
        shipping_address: shippingAddress || null,
        notes: notes || null,
        items: lines
          .filter((l) => l.item_id && l.warehouse_id && l.unit_id)
          .map((l) => ({
            item_id: l.item_id,
            warehouse_id: l.warehouse_id,
            unit_id: l.unit_id,
            qty: Number(l.qty) || 0,
            unit_price_minor: Number(l.unit_price_minor) || 0,
            discount_minor: Number(l.discount_minor) || 0,
            tax_minor: Number(l.tax_minor) || 0,
            description: l.description || null,
          })),
      }

      const res = await sales.orders.create(payload)
      const created = res.data.data ?? res.data
      navigate(`/sales/orders/${created.id}`)
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">New Sales Order</h1>
            <p className="text-[var(--text-secondary)]">Create a draft order</p>
          </div>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleCreate}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={18} />
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        {loadingRefs ? (
          <div className="py-6 text-center text-[var(--text-secondary)]">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expected Ship Date</label>
              <input
                type="date"
                value={expectedShipDate}
                onChange={(e) => setExpectedShipDate(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Billing Address</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)]">
          <h2 className="font-semibold">Line Items</h2>
          <button
            type="button"
            onClick={addLine}
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50"
          >
            + Add line
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Warehouse</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Unit</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Rate (minor)</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Tax</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Discount</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {lines.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <select
                      value={l.item_id}
                      onChange={(e) => updateLine(l.id, { item_id: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                    >
                      <option value="">Select item</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} ({it.sku})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.warehouse_id}
                      onChange={(e) => updateLine(l.id, { warehouse_id: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name ?? w.code ?? w.id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.unit_id}
                      onChange={(e) => updateLine(l.id, { unit_id: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                    >
                      <option value="">Select unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.code ?? u.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-[var(--border)] rounded-lg text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={l.unit_price_minor}
                      onChange={(e) => updateLine(l.id, { unit_price_minor: Number(e.target.value) })}
                      className="w-32 px-3 py-2 border border-[var(--border)] rounded-lg text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={l.tax_minor}
                      onChange={(e) => updateLine(l.id, { tax_minor: Number(e.target.value) })}
                      className="w-28 px-3 py-2 border border-[var(--border)] rounded-lg text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={l.discount_minor}
                      onChange={(e) => updateLine(l.id, { discount_minor: Number(e.target.value) })}
                      className="w-28 px-3 py-2 border border-[var(--border)] rounded-lg text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(l.id)}
                      className="p-2 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} className="text-[var(--danger)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[var(--border-strong)] flex items-center justify-end gap-6 text-sm">
          <div className="text-[var(--text-secondary)]">
            Subtotal: <span className="text-[var(--text-primary)] font-medium">{totals.subtotal}</span>
          </div>
          <div className="text-[var(--text-secondary)]">
            Tax: <span className="text-[var(--text-primary)] font-medium">{totals.tax}</span>
          </div>
          <div className="text-[var(--text-secondary)]">
            Discount: <span className="text-[var(--text-primary)] font-medium">{totals.discount}</span>
          </div>
          <div className="text-[var(--text-secondary)]">
            Total: <span className="text-[var(--text-primary)] font-semibold">{totals.total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
