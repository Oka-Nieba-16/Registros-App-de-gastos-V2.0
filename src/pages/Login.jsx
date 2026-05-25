import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'

const G = '#0D6E56'
const R = '#A32D2D'
const GL = '#E1F5EE'

const inputSt = {
  width: '100%',
  padding: '11px 13px',
  border: '0.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  color: '#1a1a1a',
  fontFamily: 'inherit',
  marginBottom: 12,
  boxSizing: 'border-box',
  outline: 'none'
}

const Lbl = ({ children }) => (
  <label style={{ fontSize: 12, color: '#888', marginBottom: 6, display: 'block', fontWeight: 500 }}>
    {children}
  </label>
)

const Btn = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      width: '100%',
      padding: 12,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 500,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: G,
      color: '#fff',
      border: 'none',
      transition: 'all .2s'
    }}
  >
    {children}
  </button>
)

export default function Login({ onSuccess, onSwitchToRegister, say }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      onSuccess()
    } catch (e) {
      const errorMsg = e.code === 'auth/user-not-found'
        ? 'Usuario no encontrado'
        : e.code === 'auth/wrong-password'
          ? 'Contraseña incorrecta'
          : e.code === 'auth/invalid-email'
            ? 'Email inválido'
            : 'Error al iniciar sesión'
      setError(errorMsg)
      say('⚠ ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 68, height: 68, borderRadius: 16, background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <i className="ti ti-wallet" style={{ fontSize: 32, color: G }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>FinanzApp</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Inicia sesión para continuar</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '1.5rem', marginBottom: '1rem' }}>
        <form onSubmit={handleLogin}>
          <Lbl>Email</Lbl>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={inputSt}
          />

          <Lbl>Contraseña</Lbl>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputSt}
          />

          {error && (
            <div style={{
              background: '#FCEBEB',
              border: '0.5px solid ' + R,
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              fontSize: 12,
              color: R
            }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />
              {error}
            </div>
          )}

          <Btn onClick={handleLogin} disabled={loading} loading={loading}>
            {loading
              ? <><i className="ti ti-loader-2" />Iniciando sesión...</>
              : <><i className="ti ti-login" />Iniciar sesión</>
            }
          </Btn>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
        ¿No tienes cuenta?{' '}
        <button
          onClick={onSwitchToRegister}
          style={{
            background: 'transparent',
            border: 'none',
            color: G,
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Crear una aquí
        </button>
      </div>
    </div>
  )
}
