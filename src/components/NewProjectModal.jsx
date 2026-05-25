import { useState } from 'react'

const G = '#0D6E56'
const R = '#A32D2D'

const inputSt = {
  width: '100%',
  padding: '11px 13px',
  border: '0.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  background: '#f5f5f3',
  color: '#1a1a1a',
  fontFamily: 'inherit',
  marginBottom: 12,
  boxSizing: 'border-box',
  outline: 'none',
}

export default function NewProjectModal({ show, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    await onCreate(name)
    setName('')
    setLoading(false)
  }

  if (!show) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '1.5rem',
          width: '100%',
          maxWidth: 340
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 16 }}>
            <i className="ti ti-folder-plus" style={{ color: G, marginRight: 8 }} />
            Nuevo Proyecto
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Ej: "Casa 2026" o "Viaje a Lima"'
          style={inputSt}
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !name.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: 'none',
            background: G,
            color: '#fff'
          }}
        >
          {loading ? <><i className="ti ti-loader-2" /> Creando...</> : <><i className="ti ti-check" style={{ marginRight: 6 }} />Crear</> }
        </button>
      </div>
    </div>
  )
}
