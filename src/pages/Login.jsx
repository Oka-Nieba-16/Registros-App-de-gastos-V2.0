import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'
import Toast from '../components/Toast'

const G = '#0D6E56'
const R = '#A32D2D'
const GL = '#E1F5EE'

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
  transition: 'all 0.2s',
}

const Btn = ({ children, onClick, disabled, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '100%',
      padding: 12,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      border: 'none',
      background: G,
      color: '#fff',
      transition: 'all 0.2s',
      ...style
    }}
  >
    {children}
  </button>
)

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    border: '0.5px solid #e8e8e8',
    padding: '1.5rem',
    marginBottom: '1rem',
    ...style
  }}>
    {children}
  </div>
)

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setToast('⚠ Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setToast('✓ ¡Bienvenido!')
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      const errors = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
      }
      setToast('⚠ ' + (errors[error.code] || 'Error al iniciar sesión'))
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#f5f5f3', minHeight: '100vh' }}>
      <Toast msg={toast} onDone={() => setToast('')} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: 16,
            background: GL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <span style={{ fontSize: 32 }}>💰</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>FinanzApp</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Control de gastos compartido</p>
        </div>

        <Card>
          <p style={{ fontWeight: 500, fontSize: 16, marginBottom: 18, color: '#1a1a1a' }}>
            <i className="ti ti-login" style={{ marginRight: 8, color: G }} />
            Iniciar sesión
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={inputSt}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              style={inputSt}
            />
            <Btn disabled={loading}>
              {loading
                ? <><i className="ti ti-loader-2" /> Iniciando.....</>
                : <><i className="ti ti-login" style={{ marginRight: 6 }} />Entrar</>
              }
            </Btn>
          </form>
        </Card>

        <Card style={{ background: '#f9f9f9', border: `0.5px solid ${GL}` }}>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 1.6 }}>
            ¿No tienes cuenta? <strong>Crea una nueva</strong>
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              border: `0.5px solid ${G}`,
              background: 'transparent',
              color: G,
              transition: 'all 0.2s'
            }}
          >
            <i className="ti ti-user-plus" style={{ marginRight: 6 }} />
            Crear cuenta
          </button>
        </Card>
      </div>
    </div>
  )
}
