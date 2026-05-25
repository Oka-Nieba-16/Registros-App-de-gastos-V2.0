import { useState, useEffect, useMemo } from 'react'
import { getUserProjects, createProject, deleteProject, onProjectUpdate, getProject } from '../config/firebaseService'
import ProjectView from '../components/ProjectView'
import ProjectList from '../components/ProjectList'

const G = '#0D6E56'
const GL = '#E1F5EE'

export default function Dashboard({ user, profile, onLogout, say }) {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [creating, setCreating] = useState(false)

  // Cargar proyectos del usuario
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
      setLoading(false)
    }
    loadProjects()
  }, [user.uid])

  // Suscribirse a actualizaciones en tiempo real del proyecto seleccionado
  useEffect(() => {
    if (!selectedProject) return
    const unsubscribe = onProjectUpdate(selectedProject.id, (updatedProject) => {
      setSelectedProject(updatedProject)
      setProjects(p => p.map(proj => proj.id === updatedProject.id ? updatedProject : proj))
    })
    return () => unsubscribe()
  }, [selectedProject?.id])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!projectName.trim()) {
      say('⚠ Ingresa un nombre para el proyecto')
      return
    }

    setCreating(true)
    const { ok, projectId, error } = await createProject(user.uid, projectName.trim())
    setCreating(false)

    if (ok) {
      const newProject = await getProject(projectId)
      setProjects([...projects, newProject])
      setProjectName('')
      setShowCreateForm(false)
      say(`✓ Proyecto "${projectName}" creado`)
    } else {
      say('⚠ Error: ' + error)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return

    const { ok } = await deleteProject(projectId, user.uid)
    if (ok) {
      setProjects(projects.filter(p => p.id !== projectId))
      if (selectedProject?.id === projectId) setSelectedProject(null)
      say('✓ Proyecto eliminado')
    } else {
      say('⚠ Error al eliminar')
    }
  }

  // Si hay proyecto seleccionado, mostrar vista del proyecto
  if (selectedProject) {
    return (
      <ProjectView
        project={selectedProject}
        user={user}
        profile={profile}
        onBack={() => setSelectedProject(null)}
        onDelete={() => handleDeleteProject(selectedProject.id)}
        onLogout={onLogout}
        say={say}
      />
    )
  }

  // Mostrar lista de proyectos
  return (
    <div>
      {/* Header */}
      <div style={{
        background: G,
        padding: '1.5rem',
        color: '#fff',
        borderBottom: `0.5px solid ${G}30`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
              <i className="ti ti-wallet" style={{ marginRight: 8 }} />Mis Proyectos
            </h1>
            <p style={{ fontSize: 12, opacity: 0.85 }}>👋 Hola, {profile?.name || 'Usuario'}</p>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 12px',
              border: '0.5px solid rgba(255,255,255,.3)',
              borderRadius: 8,
              background: 'rgba(255,255,255,.1)',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <i className="ti ti-logout" />Salir
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '1.5rem' }}>
        {/* Crear proyecto */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              background: G,
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <i className="ti ti-folder-plus" />Crear nuevo proyecto
          </button>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '0.5px solid #e8e8e8',
            padding: '1.5rem',
            marginBottom: 16
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
              <i className="ti ti-folder-plus" style={{ marginRight: 6, color: G }} />
              Crear proyecto
            </h3>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Ej: Casa 2026, Viaje a Lima"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid #ddd',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 10,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: G,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.5 : 1
                  }}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: '#f5f5f3',
                    color: '#888',
                    border: '0.5px solid #ddd',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de proyectos */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            <p>Cargando proyectos...</p>
          </div>
        ) : projects.length > 0 ? (
          <ProjectList
            projects={projects}
            onSelectProject={setSelectedProject}
            onDeleteProject={handleDeleteProject}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#fff',
            borderRadius: 12,
            border: '0.5px solid #e8e8e8'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
            <p style={{ color: '#888', fontSize: 14 }}>No tienes proyectos aún</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Crea uno para comenzar a registrar gastos</p>
          </div>
        )}
      </div>
    </div>
  )
}
