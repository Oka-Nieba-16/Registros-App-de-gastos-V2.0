import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { getUserProjects, createProject } from '../config/firebaseService'
import GastosTab from '../components/GastosTab'
import GraficosTab from '../components/GraficosTab'
import ResumenTab from '../components/ResumenTab'
import Toast from '../components/Toast'
import NewProjectModal from '../components/NewProjectModal'

const G = '#0D6E56'
const GL = '#E1F5EE'
const R = '#A32D2D'
const A = '#BA7517'

const Btn = ({ children, onClick, variant = 'primary', disabled, style }) => {
  const v = {
    primary: { background: G, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: G, border: `0.5px solid ${G}` },
    ghost: { background: 'transparent', color: '#888', border: 'none' },
    danger: { background: '#FCEBEB', color: R, border: `0.5px solid ${R}` },
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
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
        ...v[variant],
        ...style
      }}
    >
      {children}
    </button>
  )
}

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    border: '0.5px solid #e8e8e8',
    padding: '1rem',
    marginBottom: '.75rem',
    ...style
  }}>
    {children}
  </div>
)

const Empty = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#888', fontSize: 14 }}>
    <i className={`ti ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
    {text}
  </div>
)

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [tab, setTab] = useState('gastos')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    const userProjects = await getUserProjects(user.uid)
    setProjects(userProjects)
    if (userProjects.length > 0) {
      setSelectedProject(userProjects[0])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      setToast('⚠ Error al cerrar sesión')
    }
  }

  const handleCreateProject = async (projectName) => {
    const { ok, projectId, error } = await createProject(user.uid, projectName, [])
    if (ok) {
      setShowNewProject(false)
      setToast('✓ Proyecto creado')
      await loadProjects()
    } else {
      setToast('⚠ Error: ' + error)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f3'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '4px solid #eee',
            borderTop: `4px solid ${G}`,
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#888' }}>Cargando proyectos...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (!selectedProject) {
    return (
      <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#f5f5f3', minHeight: '100vh' }}>
        <Toast msg={toast} onDone={() => setToast('')} />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>Mis Proyectos</h1>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: 8,
                background: R,
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <i className="ti ti-logout" style={{ marginRight: 4 }} />
              Salir
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Btn onClick={() => setShowNewProject(true)}>
              <i className="ti ti-folder-plus" style={{ marginRight: 6 }} />
              Crear nuevo proyecto
            </Btn>
          </div>

          {projects.length > 0 ? (
            <div>
              {projects.map((proj) => (
                <Card key={proj.id} style={{ cursor: 'pointer', borderLeft: `4px solid ${G}` }}
                  onClick={() => setSelectedProject(proj)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 24 }}>📊</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{proj.name}</p>
                      <p style={{ fontSize: 12, color: '#888' }}
                      >
                        {proj.members?.length || 1} miembro{(proj.members?.length || 1) > 1 ? 's' : ''} · {proj.expenses?.length || 0} gasto{(proj.expenses?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <i className="ti ti-chevron-right" style={{ color: '#aaa' }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty icon="ti-folder-off" text="No tienes proyectos. Crea uno para comenzar" />
          )}
        </div>

        <NewProjectModal
          show={showNewProject}
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreateProject}
        />
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 430, margin: '0 auto', background: '#f5f5f3', minHeight: '100vh' }}>
      <Toast msg={toast} onDone={() => setToast('')} />

      {/* Header */}
      <div style={{ background: G, padding: '1rem', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 24,
                padding: 0,
                marginBottom: 4
              }}
            >
              <i className="ti ti-arrow-left" />
            </button>
            <p style={{ fontSize: 17, fontWeight: 600 }}>
              <i className="ti ti-wallet" style={{ marginRight: 7 }} />{selectedProject.name}
            </p>
            <p style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
              {selectedProject.members?.length || 1} miembros · {selectedProject.expenses?.length || 0} gastos
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,.2)',
              border: 'none',
              borderRadius: 7,
              padding: '8px 12px',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <i className="ti ti-logout" />
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '0.5px solid #eee',
        position: 'sticky',
        top: 100,
        zIndex: 9
      }}>
        {[['gastos', 'ti-list', 'Gastos'], ['graficos', 'ti-chart-pie', 'Gráficos'], ['resumen', 'ti-scale', 'Resumen']].map(([k, ic, lb]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderBottom: `2px solid ${tab === k ? G : 'transparent'}`,
              background: 'transparent',
              color: tab === k ? G : '#888',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: tab === k ? 500 : 400
            }}
          >
            <i className={`ti ${ic}`} style={{ display: 'block', fontSize: 17 }} />{lb}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0.85rem' }}>
        {tab === 'gastos' && <GastosTab project={selectedProject} onUpdate={loadProjects} toast={setToast} />}
        {tab === 'graficos' && <GraficosTab project={selectedProject} />}
        {tab === 'resumen' && <ResumenTab project={selectedProject} />}
      </div>

      {/* New Project Button */}
      <div style={{ position: 'fixed', bottom: 16, right: 16 }}>
        <button
          onClick={() => setShowNewProject(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: G,
            color: '#fff',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(13, 110, 86, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="ti ti-plus" />
        </button>
      </div>

      <NewProjectModal
        show={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}
