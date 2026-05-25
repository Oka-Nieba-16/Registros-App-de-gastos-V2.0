import { useState, useEffect, useMemo } from 'react'
import { addExpense, updateExpense, deleteExpense } from '../config/firebaseService'
import { onProjectUpdate } from '../config/firebaseService'

const G = '#0D6E56'
const GL = '#E1F5EE'
const A = '#BA7517'
const R = '#A32D2D'
const RL2 = '#FCEBEB'
const PC = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#7F77DD', '#D85A30', '#639922', '#185FA5']

const RUBROS = [
  'Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Educación',
  'Entretenimiento', 'Ropa', 'Viajes', 'Servicios', 'Deudas', 'Ahorro', 'Otros',
]

const RC = {
  'Alimentación': '#1D9E75', 'Vivienda': '#378ADD', 'Transporte': '#BA7517',
  'Salud': '#D4537E', 'Educación': '#7F77DD', 'Entretenimiento': '#D85A30',
  'Ropa': '#639922', 'Viajes': '#185FA5', 'Servicios': '#888780',
  'Deudas': '#E24B4A', 'Ahorro': '#0F6E56', 'Otros': '#5F5E5A',
}

const fm = n => `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const today = () => new Date().toISOString().slice(0, 10)
const mLabel = ym => { const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }
const defPcts = n => { const b = Math.floor(100 / n), r = 100 - b * (n - 1); return Array.from({ length: n }, (_, i) => i === n - 1 ? r : b) }

const inputSt = {
  width: '100%', padding: '9px 11px',
  border: '0.5px solid #ddd', borderRadius: 8,
  fontSize: 14, background: '#f5f5f3', color: '#1a1a1a',
  fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box', outline: 'none',
}

const Dot = ({ c, s = 8 }) => <span style={{ width: s, height: s, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
const Lbl = ({ children }) => <label style={{ fontSize: 12, color: '#888', marginBottom: 3, display: 'block', fontWeight: 500 }}>{children}</label>
const Inp = p => <input {...p} style={{ ...inputSt, ...p.style }} />
const Dv = () => <div style={{ borderTop: '0.5px solid #eee', margin: '.65rem 0' }} />
const Card = ({ children, style }) => <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '1rem', marginBottom: '.75rem', ...style }}>{children}</div>
const Stat = ({ label, value, small, color }) => (
  <div style={{ background: '#f5f5f3', borderRadius: 8, padding: small ? '.5rem .65rem' : '.6rem .8rem' }}>
    <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</p>
    <p style={{ fontSize: small ? 13 : 17, fontWeight: 500, color: color || '#1a1a1a' }}>{value}</p>
  </div>
)
const Pill = ({ ok, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
    borderRadius: 20, fontSize: 11, fontWeight: 500, background: ok ? GL : RL2, color: ok ? G : R
  }}>{children}</span>
)
const Btn = ({ children, onClick, variant = 'primary', disabled, style }) => {
  const v = {
    primary: { background: G, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: G, border: `0.5px solid ${G}` },
    danger: { background: RL2, color: R, border: `0.5px solid ${R}` },
  }
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        ...v[variant], ...style
      }}>
      {children}
    </button>
  )
}
const DashBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', padding: 8, border: `0.5px dashed ${G}`,
    borderRadius: 8, background: 'transparent', color: G, fontSize: 13, marginBottom: 12, cursor: 'pointer'
  }}>
    {children}
  </button>
)
const Empty = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#888', fontSize: 14 }}>
    <i className={`ti ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
    {text}
  </div>
)

function ExpItem({ e, people, onEdit, onDelete }) {
  const n = people.length, col = RC[e.rubro] || '#888'
  const pcts = e.pcts?.length === n ? e.pcts : defPcts(n)
  const pagos = e.pagos?.length === n ? e.pagos : Array(n).fill(0)
  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '0.5px solid #e8e8e8',
      padding: '.7rem', marginBottom: '.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <Dot c={col} />
            <span style={{
              fontSize: 11, fontWeight: 500, color: col,
              background: col + '18', border: `0.5px solid ${col}30`,
              borderRadius: 20, padding: '2px 8px'
            }}>{e.rubro}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{e.fecha}</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>{e.descripcion || '—'}</p>
          <p style={{ fontSize: 17, fontWeight: 500, color: G }}>{fm(e.monto)}</p>
        </div>
        <div style={{ display: 'flex', gap: 5, marginLeft: 6 }}>
          <button onClick={onEdit}
            style={{
              padding: '5px 9px', border: `0.5px solid ${G}`, borderRadius: 8,
              background: 'transparent', color: G, cursor: 'pointer'
            }}>
            <i className="ti ti-edit" />
          </button>
          <button onClick={onDelete}
            style={{
              padding: '5px 9px', border: `0.5px solid ${R}`, borderRadius: 6,
              background: 'transparent', color: R, cursor: 'pointer'
            }}>
            <i className="ti ti-trash" />
          </button>
        </div>
      </div>
      <div style={{ borderTop: '0.5px solid #f0f0f0', marginTop: 8, paddingTop: 6 }}>
        {people.map((p, i) => {
          const corr = (e.monto * (pcts[i] || 0)) / 100, diff = pagos[i] - corr
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center', gap: 5, padding: '4px 0',
              borderBottom: i < n - 1 ? '0.5px solid #f5f5f5' : 'none'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Dot c={PC[i % PC.length]} s={7} /><span style={{ fontSize: 12 }}>{p}</span>
              </span>
              <span style={{ fontSize: 11, color: '#888' }}>Tocó {fm(corr)} · Pagó {fm(pagos[i])}</span>
              {Math.abs(diff) > 0.005 &&
                <Pill ok={diff > 0}>{diff > 0 ? '+' : '-'}{fm(Math.abs(diff))}</Pill>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function GastosTab({ project, onUpdate, toast }) {
  const people = project.people || []
  const n = people.length
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState(null)
  const [filterMonth, setFilterMonth] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!project?.id) return
    const unsubscribe = onProjectUpdate(project.id, (updatedProject) => {
      if (onUpdate) onUpdate()
    })
    return () => unsubscribe && unsubscribe()
  }, [project?.id])

  const filt = filterMonth === 'all'
    ? project.expenses || []
    : (project.expenses || []).filter(e => e.fecha.startsWith(filterMonth))
  const total = filt.reduce((a, e) => a + e.monto, 0)
  const months = useMemo(() =>
    [...new Set((project.expenses || []).map(e => e.fecha.slice(0, 7)))].sort().reverse()
    , [project?.expenses])

  const pcts = formData?.pcts || defPcts(n)
  const pagos = formData?.pagos || Array(n).fill(0)
  const mt = parseFloat(formData?.monto) || 0
  const pctSum = pcts.reduce((a, b) => a + parseFloat(b || 0), 0)
  const pctOk = Math.abs(pctSum - 100) < 0.5

  const openForm = () => {
    setFormData({
      fecha: today(), rubro: 'Alimentación', descripcion: '',
      monto: '', pcts: defPcts(n), pagos: Array(n).fill(0)
    })
    setEditId(null)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormData(null)
  }

  const saveExpense = async () => {
    if (!formData?.monto || isNaN(formData.monto)) {
      toast('⚠ Monto inválido')
      return
    }
    if (Math.abs(pctSum - 100) > 0.5) {
      toast(`⚠ % debe sumar 100 (actual: ${pctSum.toFixed(1)}%)`)
      return
    }

    setLoading(true)
    const exp = {
      fecha: formData.fecha,
      rubro: formData.rubro,
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      pcts: formData.pcts.map(p => parseFloat(p) || 0),
      pagos: formData.pagos.map(p => parseFloat(p) || 0),
    }

    try {
      if (editId) {
        await updateExpense(project.id, editId, exp)
        toast('✓ Gasto actualizado')
      } else {
        await addExpense(project.id, exp)
        toast('✓ Gasto agregado')
      }
      setShowForm(false)
      setEditId(null)
      setFormData(null)
      if (onUpdate) onUpdate()
    } catch (error) {
      toast('⚠ Error: ' + error.message)
    }
    setLoading(false)
  }

  const deleteExp = async (id) => {
    if (confirm('¿Eliminar este gasto?')) {
      setLoading(true)
      try {
        await deleteExpense(project.id, id)
        toast('✓ Gasto eliminado')
        if (onUpdate) onUpdate()
      } catch (error) {
        toast('⚠ Error: ' + error.message)
      }
      setLoading(false)
    }
  }

  const editExp = (id) => {
    const e = (project.expenses || []).find(x => x.id === id)
    if (!e) return
    setFormData({
      fecha: e.fecha, rubro: e.rubro, descripcion: e.descripcion, monto: String(e.monto),
      pcts: e.pcts?.length === n ? [...e.pcts] : defPcts(n),
      pagos: e.pagos?.length === n ? [...e.pagos] : Array(n).fill(0)
    })
    setEditId(id)
    setShowForm(true)
  }

  const updPct = (i, v) => setFormData(f => { const pcts = [...f.pcts]; pcts[i] = Math.min(100, Math.max(0, parseFloat(v) || 0)); return { ...f, pcts } })
  const updPago = (i, v) => setFormData(f => { const pagos = [...f.pagos]; pagos[i] = parseFloat(v) || 0; return { ...f, pagos } })
  const distEq = () => setFormData(f => ({ ...f, pcts: defPcts(n) }))

  return <>
    {months.length > 0 && (
      <select style={{ ...inputSt, marginBottom: 10 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
        <option value="all">Todos los meses</option>
        {months.map(m => <option key={m} value={m}>{mLabel(m)}</option>)}
      </select>
    )}

    {filt.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Stat label="Total gastos" value={fm(total)} />
        <Stat label="Registros" value={filt.length} />
      </div>
    )}

    {!showForm && (
      <Btn onClick={openForm} style={{ marginBottom: 10 }}>
        <i className="ti ti-plus" style={{ marginRight: 6 }} />Agregar gasto
      </Btn>
    )}

    {showForm && formData && (
      <Card>
        <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>{editId ? 'Editar' : 'Nuevo'} gasto</p>
        <Lbl>Fecha</Lbl>
        <Inp type="date" value={formData.fecha} onChange={e => setFormData(f => ({ ...f, fecha: e.target.value }))} />
        <Lbl>Rubro</Lbl>
        <select style={inputSt} value={formData.rubro} onChange={e => setFormData(f => ({ ...f, rubro: e.target.value }))}>
          {RUBROS.map(r => <option key={r}>{r}</option>)}
        </select>
        <Lbl>Descripción</Lbl>
        <Inp value={formData.descripcion}
          onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))}
          placeholder="¿En qué se gastó?" />
        <Lbl>Monto total (S/.)</Lbl>
        <Inp type="number" value={formData.monto}
          onChange={e => setFormData(f => ({ ...f, monto: e.target.value }))}
          placeholder="0.00" min="0" step="0.01" />
        <Dv />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 500 }}>% por persona</p>
          <button onClick={distEq}
            style={{
              padding: '4px 10px', border: `0.5px solid ${G}`, borderRadius: 6,
              background: 'transparent', color: G, fontSize: 11, cursor: 'pointer'
            }}>
            <i className="ti ti-layout-distribute-horizontal" /> Igual
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 56px 1fr 72px', gap: 6,
          paddingBottom: 4, borderBottom: '0.5px solid #eee', marginBottom: 4
        }}>
          {['Persona', '%', 'Corresponde', 'Pagó'].map(h => (
            <span key={h} style={{
              fontSize: 10, color: '#888', fontWeight: 500,
              textAlign: h === 'Corresponde' || h === 'Pagó' ? 'right' : 'left'
            }}>{h}</span>
          ))}
        </div>

        {people.map((p, i) => {
          const corr = mt * (parseFloat(pcts[i]) || 0) / 100
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto 56px 1fr 72px',
              gap: 6, alignItems: 'center', padding: '5px 0', borderBottom: '0.5px solid #f5f5f5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Dot c={PC[i % PC.length]} /><span style={{ fontSize: 13 }}>{p}</span>
              </div>
              <input type="number" value={pcts[i]} min="0" max="100" step="1"
                onChange={e => updPct(i, e.target.value)}
                style={{ ...inputSt, margin: 0, padding: '4px 5px', fontSize: 12, textAlign: 'center' }} />
              <span style={{ fontSize: 12, color: G, fontWeight: 500, textAlign: 'right' }}>
                {mt > 0 ? fm(corr) : '—'}
              </span>
              <input type="number" value={pagos[i] || ''} placeholder="0" min="0" step="0.01"
                onChange={e => updPago(i, e.target.value)}
                style={{ ...inputSt, margin: 0, padding: '4px 5px', fontSize: 12, textAlign: 'right' }} />
            </div>
          )
        })}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: pctOk ? G : R }}>
            <i className={`ti ti-${pctOk ? 'check' : 'alert-triangle'}`} /> {pctSum.toFixed(0)}%
            {pctOk ? '' : ' (necesita 100%)'}
          </span>
          <span style={{ fontSize: 11, color: '#888' }}>
            Pagado: {fm(pagos.reduce((a, b) => a + parseFloat(b || 0), 0))}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={saveExpense} disabled={loading} style={{ flex: 1 }}>
            {loading ? <><i className="ti ti-loader-2" /> Guardando...</> : (editId ? 'Guardar cambios' : 'Agregar gasto')}
          </Btn>
          <Btn variant="outline" onClick={cancelForm}>Cancelar</Btn>
        </div>
      </Card>
    )}

    {[...filt].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(e => (
      <ExpItem key={e.id} e={e} people={people}
        onEdit={() => editExp(e.id)} onDelete={() => deleteExp(e.id)} />
    ))}

    {filt.length === 0 && !showForm && <Empty icon="ti-receipt-off" text="Sin gastos registrados" />}
  </>
}
