import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let reg of registrations) {
      if (reg.scope.includes('/ingreso/')) {
        console.log("Desregistrando service worker de /ingreso");
        reg.unregister();
      }
    }
  });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />,
  </BrowserRouter>
)
