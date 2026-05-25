import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RT, Legend as RL,
  Cell, PieChart, Pie, ResponsiveContainer,
} from 'recharts'

const G = '#0D6E56'
const RC = {
  'Alimentación': '#1D9E75', 'Vivienda': '#378ADD', 'Transporte': '#BA7517',
  'Salud': '#D4537E', 'Educación': '#7F77DD', 'Entretenimiento': '#D85A30',
  'Ropa': '#639922', 'Viajes': '#185FA5', 'Servicios': '#888780',
  'Deudas': '#E24B4A', 'Ahorro': '#0F6E56', 'Otros': '#5F5E5A',
}
const PC = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#7F77DD', '#D85A30', '#639922', '#185FA5']

const fm = n => `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const mLabel = ym => { const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }
const mShort = ym => { const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleString('es-ES', { month: 'short' }).replace('.', '') + "'" + y.slice(2) }

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8',
    padding: '1rem', marginBottom: '.75rem', ...style
  }}>{children}</div>
)
const Empty = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#888', fontSize: 14 }}>
    <i className={`ti ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />{text}
  </div>
)

function getBal(people, expenses) {
  const n = people.length, corr = Array(n).fill(0), pago = Array(n).fill(0)
  expenses.forEach(e => {
    const pcts = e.pcts?.length === n ? e.pcts : Array(n).fill(100 / n)
    const pagos = e.pagos?.length === n ? e.pagos : Array(n).fill(0)
    pcts.forEach((p, i) => { corr[i] += (e.monto * (p || 0)) / 100 })
    pagos.forEach((p, i) => { pago[i] += (p || 0) })
  })
  return { corr, pago, bal: corr.map((c, i) => pago[i] - c) }
}

const inputSt = {
  width: '100%', padding: '9px 11px', border: '0.5px solid #ddd', borderRadius: 8,
  fontSize: 14, background: '#f5f5f3', color: '#1a1a1a', fontFamily: 'inherit',
  marginBottom: 10, boxSizing: 'border-box', outline: 'none',
}

export default function GraficosTab({ project }) {
  const exps = project.expenses || []
  const people = project.people || []
  const months = useMemo(() => [...new Set(exps.map(e => e.fecha.slice(0, 7)))].sort(), [exps])
  const [chartMonth, setChartMonth] = React.useState('all')

  const filt = chartMonth === 'all' ? exps : exps.filter(e => e.fecha.startsWith(chartMonth))

  if (!exps.length) return <Empty icon="ti-chart-off" text="Agrega gastos para ver los gráficos" />

  const byRubro = {}
  filt.forEach(e => { byRubro[e.rubro] = (byRubro[e.rubro] || 0) + e.monto })
  const total = filt.reduce((a, e) => a + e.monto, 0) || 1
  const rk = Object.entries(byRubro).sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, pct: ((value / total) * 100).toFixed(1) }))

  const sortedM = [...new Set(exps.map(e => e.fecha.slice(0, 7)))].sort()
  const barData = sortedM.map(m => {
    const me = exps.filter(e => e.fecha.startsWith(m))
    const row = { mes: mShort(m) }
    people.forEach((p, i) => {
      row[p] = parseFloat(me.reduce((a, e) => a + ((e.monto * ((e.pcts && e.pcts[i]) || 0)) / 100), 0).toFixed(2))
    })
    return row
  })

  const { corr, pago } = getBal(people, filt)
  const cmpData = people.map((p, i) => ({
    name: p,
    'Correspondía': parseFloat(corr[i].toFixed(2)),
    'Pagó': parseFloat(pago[i].toFixed(2))
  }))

  return <>
    {months.length > 0 && (
      <select style={{ ...inputSt, marginBottom: 10 }} value={chartMonth} onChange={e => setChartMonth(e.target.value)}>
        <option value="all">Todos los meses</option>
        {months.map(m => <option key={m} value={m}>{mLabel(m)}</option>)}
      </select>
    )}

    <Card>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        <i className="ti ti-chart-donut" style={{ marginRight: 5 }} />Gastos por rubro
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={rk} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={48} outerRadius={82}
            label={({ name, pct }) => `${pct}%`} labelLine={false}>
            {rk.map((r, i) => <Cell key={i} fill={RC[r.name] || '#888'} />)}
          </Pie>
          <RT formatter={v => fm(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
        {rk.map(r => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: RC[r.name] || '#888', flexShrink: 0 }} />
            {r.name} <strong style={{ color: '#1a1a1a' }}>{r.pct}%</strong>
          </div>
        ))}
      </div>
    </Card>

    {sortedM.length > 1 && (
      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
          <i className="ti ti-trending-up" style={{ marginRight: 5 }} />Tendencia mensual
        </p>
        <ResponsiveContainer width="100%" height={Math.max(180, sortedM.length * 36 + 60)}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `S/.${v}`} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="mes" tick={{ fontSize: 10 }} width={40} />
            <RT formatter={v => fm(v)} />
            <RL iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            {people.map((p, i) => <Bar key={p} dataKey={p} stackId="a" fill={PC[i % PC.length]} />)}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    )}

    <Card>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        <i className="ti ti-scale" style={{ marginRight: 5 }} />Pagado vs. correspondido
      </p>
      <ResponsiveContainer width="100%" height={Math.max(120, people.length * 50 + 60)}>
        <BarChart data={cmpData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={v => `S/.${v}`} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
          <RT formatter={v => fm(v)} />
          <RL iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Correspondía" fill="#9FE1CB" />
          <Bar dataKey="Pagó" fill={G} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </>
}
