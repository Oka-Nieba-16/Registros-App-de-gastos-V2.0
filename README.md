# 💰 FinanzApp v2.0

Control de gastos personales y compartidos con autenticación y Firebase Firestore.

## 🚀 Inicio rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase

Edita `src/config/firebase.js` y pega tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id",
}
```

#### Cómo obtener las credenciales:
1. Ve a https://console.firebase.google.com
2. Crea un proyecto (o usa uno existente)
3. Ve a **Configuración ⚙** → **Tus apps** → **SDK Web**
4. Copia los valores

### 3. Configurar Firestore

**En Firebase Console:**
- Ve a **Build** → **Firestore Database** → **Crear base de datos**
- Selecciona región más cercana
- En la pestaña **Reglas**, pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /projects/{projectId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    match /projects/{projectId} {
      allow read, write: if resource.data.members.contains(request.auth.uid);
    }
  }
}
```

### 4. Configurar Autenticación

**En Firebase Console:**
- Ve a **Build** → **Authentication**
- Habilita **Email/Password**
- Opcionalmente: **Google**, **GitHub**, **Apple**

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

### 6. Publicar en producción

#### Opción A: Firebase Hosting (recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run deploy
```

#### Opción B: Netlify
```bash
npm run build
# Arrastra la carpeta dist/ a netlify.com/drop
```

#### Opción C: Vercel
```bash
npm run build
# Conecta tu repositorio en vercel.com
```

---

## 📱 Instalar como PWA

### iPhone (Safari)
1. Abre la app en Safari
2. Toca **Compartir**
3. Selecciona **"Agregar a pantalla de inicio"**

### Android (Chrome)
1. Abre la app en Chrome
2. Toca el menú ⋮
3. Selecciona **"Instalar aplicación"**

### Desktop (PWA)
- Chrome: Icono de instalación en la barra de direcciones
- Edge: Menú → **Aplicaciones** → **Instalar esta aplicación**

---

## 🎯 Características

- ✅ Autenticación con Email/Password
- ✅ Crear proyectos privados
- ✅ Invitar participantes
- ✅ Registrar gastos compartidos
- ✅ Calcular liquidaciones automáticas
- ✅ Gráficos en tiempo real
- ✅ Sincronización en vivo
- ✅ Instalable como PWA
- ✅ Acceso desde web y móvil
- ✅ Datos guardados en la nube

---

## 🛠 Stack

- React 18 + Vite
- Firebase Authentication
- Firebase Firestore
- React Router
- Recharts
- Tabler Icons

---

## 📋 Estructura del proyecto

```
finanzapp/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración Firebase
│   ├── pages/
│   │   ├── Login.jsx            # Inicio de sesión
│   │   ├── Register.jsx         # Registro
│   │   └── Dashboard.jsx        # Panel principal
│   ├── components/
│   │   ├── GastosTab.jsx        # Tabla de gastos
│   │   ├── GraficosTab.jsx      # Gráficos
│   │   └── ResumenTab.jsx       # Resumen liquidaciones
│   ├── App.jsx                  # Componente principal
│   └── main.jsx                 # Punto de entrada
├── index.html
├── manifest.json                # Configuración PWA
├── package.json
└── vite.config.js
```

---

## 🔐 Seguridad

- Contraseñas encriptadas por Firebase
- Autenticación obligatoria
- Datos privados por usuario
- Proyectos compartidos con miembros específicos

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Firebase esté configurado correctamente
2. Revisa la consola del navegador (F12)
3. Consulta la documentación de Firebase: https://firebase.google.com/docs
