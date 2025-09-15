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
  return (
    <div>
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