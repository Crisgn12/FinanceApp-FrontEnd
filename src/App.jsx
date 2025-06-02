import Sidebar from "./components/sidebar"
import NavigationBar from "./components/NavigationBar"
import Dashboard from "./pages/Dashboard"
import Transacciones from "./pages/Transacciones"
import Calendario from "./pages/Calendario"
import Metas from "./pages/Metas"
import Categorias from "./pages/Categorias"
import Reportes from "./pages/Reportes"
import CrearAhorro from "./pages/CrearAhorro"
import TablaAhorros from "./pages/TablaAhorros"
import Layout from "./components/templates/Layout"
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Transacciones" element={<Transacciones />} />
          <Route path="/Calendario" element={<Calendario />} />
          <Route path="/Metas" element={<Metas />} />
          <Route path="/Categorias" element={<Categorias />} />
          <Route path="/Reportes" element={<Reportes />} />
          <Route path="/CrearAhorro" element={<CrearAhorro />} />
          <Route path="/TablaAhorros" element={<TablaAhorros />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
