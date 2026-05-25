import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'
import { createUserProfile } from '../config/firebaseService'

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

export default function Register({ onSuccess, onSwitchToLogin, say }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(userCredential.user.uid, email, name)
      onSuccess()
    } catch (e) {
      const errorMsg = e.code === 'auth/email-already-in-use'
        ? 'Este email ya está registrado'
        : e.code === 'auth/invalid-email'
          ? 'Email inválido'
          : 'Error al crear la cuenta'
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
          <i className="ti ti-user-plus" style={{ fontSize: 32, color: G }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>Crear cuenta</h1>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Únete a FinanzApp hoy</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #e8e8e8', padding: '1.5rem', marginBottom: '1rem' }}>
        <form onSubmit={handleRegister}>
          <Lbl>Nombre completo</Lbl>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            style={inputSt}
          />

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

          <Lbl>Confirmar contraseña</Lbl>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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

          <Btn onClick={handleRegister} disabled={loading} loading={loading}>
            {loading
              ? <><i className="ti ti-loader-2" />Creando cuenta...</>
              : <><i className="ti ti-user-check" />Crear cuenta</>
            }
          </Btn>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'transparent',
            border: 'none',
            color: G,
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Inicia sesión aquí
        </button>
      </div>
    </div>
  )
}
