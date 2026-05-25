import React from 'react'

const G = '#0D6E56'
const A = '#BA7517'
const R = '#A32D2D'
const GL = '#E1F5EE'
const PC = ['#1D9E75', '#378ADD', '#BA7517', '#D4537E', '#7F77DD', '#D85A30', '#639922', '#185FA5']

const fm = n => `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const mLabel = ym => { const [y, m] = ym.split('-'); return new Date(y, m - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8',
    padding: '1rem', marginBottom: '.75rem', ...style
  }}>{children}</div>
)
const Dot = ({ c, s = 8 }) => <span style={{ width: s, height: s, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
const Stat = ({ label, value, small, color }) => (
  <div style={{ background: '#f5f5f3', borderRadius: 8, padding: small ? '.5rem .65rem' : '.6rem .8rem' }}>
    <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</p>
    <p style={{ fontSize: small ? 13 : 17, fontWeight: 500, color: color || '#1a1a1a' }}>{value}</p>
  </div>
)
const Pill = ({ ok, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
    borderRadius: 20, fontSize: 11, fontWeight: 500, background: ok ? GL : '#FCEBEB', color: ok ? G : R
  }}>{children}</span>
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

function getSett(balIn) {
  const b = balIn.map((v, i) => ({ i, v: parseFloat(v.toFixed(2)) })), res = []
  for (let k = 0; k < 50; k++) {
    b.sort((a, c) => c.v - a.v)
    const cr = b[0], db = b[b.length - 1]
    if (cr.v < 0.01 || db.v > -0.01) break
    const amt = Math.min(cr.v, -db.v)
    if (amt < 0.01) break
    res.push({ from: db.i, to: cr.i, amount: amt })
    cr.v = parseFloat((cr.v - amt).toFixed(2))
    db.v = parseFloat((db.v + amt).toFixed(2))
  }
  return res
}

const inputSt = {
  width: '100%', padding: '9px 11px', border: '0.5px solid #ddd', borderRadius: 8,
  fontSize: 14, background: '#f5f5f3', color: '#1a1a1a', fontFamily: 'inherit',
  marginBottom: 10, boxSizing: 'border-box', outline: 'none',
}

export default function ResumenTab({ project }) {
  const exps = project.expenses || []
  const people = project.people || []
  const months = [...new Set(exps.map(e => e.fecha.slice(0, 7)))].sort().reverse()
  const [selMonth, setSelMonth] = React.useState(months[0] || '')

  if (!exps.length) return <Empty icon="ti-chart-off" text="Sin gastos registrados" />

  const { corr, pago, bal } = getBal(people, exps)
  const setts = getSett([...bal])
  const totalG = exps.reduce((a, e) => a + e.monto, 0)
  const curM = selMonth || months[0] || ''
  const mEx = exps.filter(e => e.fecha.startsWith(curM))
  const mb = getBal(people, mEx)
  const ms = getSett([...mb.bal])

  return <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
      <Stat label="Gasto total" value={fm(totalG)} />
      <Stat label="Meses" value={months.length} />
    </div>

    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
      <i className="ti ti-user-dollar" style={{ marginRight: 5 }} />Balance por persona
    </p>
    {people.map((p, i) => (
      <div key={i} style={{
        background: '#fff', borderRadius: 10, border: '0.5px solid #e8e8e8',
        borderTop: `3px solid ${PC[i % PC.length]}`, padding: '.75rem', marginBottom: '.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Dot c={PC[i % PC.length]} /><p style={{ fontWeight: 500, fontSize: 14 }}>{p}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <Stat label="Correspondía" value={fm(corr[i])} small />
          <Stat label="Pagó" value={fm(pago[i])} small color={G} />
          <Stat label="Balance" value={(bal[i] > 0.005 ? '+' : '') + fm(bal[i])} small
            color={bal[i] > 0.005 ? G : bal[i] < -0.005 ? R : '#888'} />
        </div>
      </div>
    ))}

    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, marginTop: 4 }}>
      <i className="ti ti-arrows-exchange" style={{ marginRight: 5 }} />Liquidaciones para saldar cuentas
    </p>
    <Card>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
        Mínimo de transferencias para saldar todas las deudas
      </p>
      {setts.length === 0
        ? <Pill ok><i className="ti ti-check" />Sin deudas — todos al día</Pill>
        : setts.map((t, k) => (
          <div key={k} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 10px', background: '#f8f8f6', borderRadius: 8, marginBottom: 5
          }}>
            <Dot c={PC[t.from % PC.length]} /><span style={{ fontSize: 13, flex: 1 }}>{people[t.from]}</span>
            <i className="ti ti-arrow-right" style={{ fontSize: 14, color: '#aaa' }} />
            <Dot c={PC[t.to % PC.length]} /><span style={{ fontSize: 13, flex: 1 }}>{people[t.to]}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: A }}>{fm(t.amount)}</span>
          </div>
        ))
      }
    </Card>

    {months.length > 0 && (
      <>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
          <i className="ti ti-calendar" style={{ marginRight: 5 }} />Detalle por mes
        </p>
        <select style={{ ...inputSt, marginBottom: 10 }} value={curM} onChange={e => setSelMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{mLabel(m)}</option>)}
        </select>

        {mEx.length > 0 && (
          <Card>
            <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>{mLabel(curM)}</p>
            {people.map((p, i) => {
              const d = mb.bal[i]
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center', gap: 5, padding: '5px 0',
                  borderBottom: i < people.length - 1 ? '0.5px solid #f5f5f5' : 'none'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Dot c={PC[i % PC.length]} s={7} /><span style={{ fontSize: 12 }}>{p}</span>
                  </span>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    Tocó {fm(mb.corr[i])} · Pagó {fm(mb.pago[i])}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: d > 0.005 ? G : d < -0.005 ? R : '#888'
                  }}>
                    {d > 0.005 ? '+' : ''}{fm(d)}
                  </span>
                </div>
              )
            })}
            <div style={{ marginTop: 10 }}>
              {ms.length === 0
                ? <Pill ok><i className="ti ti-check" />Sin deudas este mes</Pill>
                : ms.map((t, k) => (
                  <div key={k} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', background: '#f8f8f6', borderRadius: 8, marginBottom: 4, fontSize: 12
                  }}>
                    <Dot c={PC[t.from % PC.length]} s={7} />{people[t.from]}
                    <i className="ti ti-arrow-right" style={{ color: '#ccc' }} />
                    <Dot c={PC[t.to % PC.length]} s={7} /><span style={{ flex: 1 }}>{people[t.to]}</span>
                    <strong>{fm(t.amount)}</strong>
                  </div>
                ))
              }
            </div>
          </Card>
        )}
      </>
    )}
  </>
}
