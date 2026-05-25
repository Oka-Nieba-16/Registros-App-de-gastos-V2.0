import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './config/firebase'
import { getUserProfile } from './config/firebaseService'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Toast from './components/Toast'

const G = '#0D6E56'

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState('login') // 'login' | 'register'
  const [toast, setToast] = useState('')

  const say = m => setToast(m)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const prof = await getUserProfile(currentUser.uid)
        setProfile(prof)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setProfile(null)
      say('✓ Sesión cerrada')
    } catch (e) {
      say('⚠ Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f3',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
          <p style={{ color: '#888', fontSize: 14 }}>Cargando FinanzApp...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 430,
        margin: '0 auto',
        background: '#f5f5f3',
        minHeight: '100vh'
      }}>
        <Toast msg={toast} onDone={() => setToast('')} />
        {showAuth === 'login'
          ? <Login onSuccess={() => say('✓ Bienvenido')} onSwitchToRegister={() => setShowAuth('register')} say={say} />
          : <Register onSuccess={() => { say('✓ Cuenta creada'); setShowAuth('login') }} onSwitchToLogin={() => setShowAuth('login')} say={say} />
        }
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 430,
      margin: '0 auto',
      background: '#f5f5f3',
      minHeight: '100vh'
    }}>
      <Toast msg={toast} onDone={() => setToast('')} />
      <Dashboard user={user} profile={profile} onLogout={handleLogout} say={say} />
    </div>
  )
}
