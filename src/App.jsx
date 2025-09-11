import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Carga from './pages/Carga'
import Notas from './pages/Notas'
import Estadisticas from './pages/Estadisticas'
import Login from './pages/Login'
import RutaProtegida from './components/RutaProtegida'
import { ContextProvider } from './context/ContextConfig'
import { usePwaUpdater } from './components/Update'

const App = () => {
  const { showReload, update } = usePwaUpdater();
  return (
    <div>
      {showReload && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: '#005CA2',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span>¡Nueva versión disponible!</span>
          <button
            onClick={update}
            style={{
              backgroundColor: 'white',
              color: '#005CA2',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
        </div>
      )}
      <ContextProvider>
        <Routes>
          <Route element={<RutaProtegida />}>
            <Route path="/ingreso" element={<Home />}>
              {/* <Route path="login" element={<Login />} /> */}
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route path="carga" element={<Carga />} />
              <Route path="notas" element={<Notas />} />
            </Route>
          </Route>
        </Routes>
      </ContextProvider>
    </div>
  )
}

export default App