import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'
import { createUserProfile } from '../config/firebaseService'
import Toast from '../components/Toast'

const G = '#0D6E56'
const GL = '#E1F5EE'
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

const Btn = ({ children, onClick, disabled }) => (
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
      color: '#fff'
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

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setToast('⚠ Completa todos los campos')
      return
    }
    if (password !== confirmPassword) {
      setToast('⚠ Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setToast('⚠ La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(user.uid, email, name)
      setToast('✓ ¡Cuenta creada exitosamente!')
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      const errors = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'Contraseña muy débil'
      }
      setToast('⚠ ' + (errors[error.code] || 'Error al registrar'))
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
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Crear nueva cuenta</p>
        </div>

        <Card>
          <p style={{ fontWeight: 500, fontSize: 16, marginBottom: 18, color: '#1a1a1a' }}>
            <i className="ti ti-user-plus" style={{ marginRight: 8, color: G }} />
            Registrarse
          </p>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              style={inputSt}
            />
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
              placeholder="Contraseña (min. 6 caracteres)"
              style={inputSt}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              style={inputSt}
            />
            <Btn disabled={loading}>
              {loading
                ? <><i className="ti ti-loader-2" /> Creando cuenta...</>
                : <><i className="ti ti-user-plus" style={{ marginRight: 6 }} />Crear cuenta</>
              }
            </Btn>
          </form>
        </Card>

        <Card style={{ background: '#f9f9f9', border: `0.5px solid ${GL}` }}>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
            ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              border: `0.5px solid ${G}`,
              background: 'transparent',
              color: G
            }}
          >
            <i className="ti ti-login" style={{ marginRight: 6 }} />
            Ir a iniciar sesión
          </button>
        </Card>
      </div>
    </div>
  )
}
