import {
  doc, setDoc, getDoc, getDocs, collection, query, where,
  updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot,
  addDoc, writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ═════════════════════════════════════════════════════════════
// USUARIOS
// ═════════════════════════════════════════════════════════════

export async function createUserProfile(userId, email, name) {
  try {
    await setDoc(doc(db, 'users', userId), {
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D6E56&color=fff`,
      createdAt: new Date().toISOString(),
      projects: [],
      lastLogin: new Date().toISOString()
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}

// ═════════════════════════════════════════════════════════════
// PROYECTOS
// ═════════════════════════════════════════════════════════════

export async function createProject(userId, projectName, members = []) {
  try {
    const projectData = {
      name: projectName,
      owner: userId,
      members: [userId, ...members],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    }
    const docRef = await addDoc(collection(db, 'projects'), projectData)
    
    // Agregar el proyecto al perfil del usuario
    await updateDoc(doc(db, 'users', userId), {
      projects: arrayUnion(docRef.id)
    })
    
    return { ok: true, projectId: docRef.id }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function getProject(projectId) {
  try {
    const snap = await getDoc(doc(db, 'projects', projectId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch {
    return null
  }
}

export async function getUserProjects(userId) {
  try {
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    )
    const snapshots = await getDocs(q)
    return snapshots.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (e) {
    console.error('Error getting projects:', e)
    return []
  }
}

export function onProjectUpdate(projectId, callback) {
  return onSnapshot(doc(db, 'projects', projectId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() })
    }
  })
}

export async function updateProjectName(projectId, newName) {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      name: newName,
      updatedAt: new Date().toISOString()
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function deleteProject(projectId, userId) {
  try {
    // Eliminar referencia del usuario
    await updateDoc(doc(db, 'users', userId), {
      projects: arrayRemove(projectId)
    })
    // Eliminar proyecto (solo si es el owner)
    await deleteDoc(doc(db, 'projects', projectId))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ═════════════════════════════════════════════════════════════
// MIEMBROS DEL PROYECTO
// ═════════════════════════════════════════════════════════════

export async function addMemberToProject(projectId, userEmail) {
  try {
    // Buscar el usuario por email
    const q = query(collection(db, 'users'), where('email', '==', userEmail))
    const snapshots = await getDocs(q)
    
    if (snapshots.empty) {
      return { ok: false, error: 'Usuario no encontrado' }
    }
    
    const userId = snapshots.docs[0].id
    const project = await getProject(projectId)
    
    if (project.members.includes(userId)) {
      return { ok: false, error: 'Este usuario ya es miembro' }
    }
    
    // Agregar miembro al proyecto
    await updateDoc(doc(db, 'projects', projectId), {
      members: arrayUnion(userId),
      updatedAt: new Date().toISOString()
    })
    
    // Agregar proyecto al usuario
    await updateDoc(doc(db, 'users', userId), {
      projects: arrayUnion(projectId)
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function removeMemberFromProject(projectId, userId) {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      members: arrayRemove(userId),
      updatedAt: new Date().toISOString()
    })
    
    await updateDoc(doc(db, 'users', userId), {
      projects: arrayRemove(projectId)
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ═════════════════════════════════════════════════════════════
// GASTOS
// ═════════════════════════════════════════════════════════════

export async function addExpense(projectId, expenseData) {
  try {
    const project = await getProject(projectId)
    const expenses = project.expenses || []
    
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      createdAt: new Date().toISOString()
    }
    
    expenses.push(newExpense)
    
    await updateDoc(doc(db, 'projects', projectId), {
      expenses,
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    })
    
    return { ok: true, expense: newExpense }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function updateExpense(projectId, expenseId, updatedData) {
  try {
    const project = await getProject(projectId)
    const expenses = project.expenses.map(e =>
      e.id === expenseId ? { ...e, ...updatedData, updatedAt: new Date().toISOString() } : e
    )
    
    await updateDoc(doc(db, 'projects', projectId), {
      expenses,
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function deleteExpense(projectId, expenseId) {
  try {
    const project = await getProject(projectId)
    const expenses = project.expenses.filter(e => e.id !== expenseId)
    
    await updateDoc(doc(db, 'projects', projectId), {
      expenses,
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function saveProject(projectId, projectData) {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...projectData,
      updatedAt: new Date().toISOString(),
      lastSaved: new Date().toISOString()
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
