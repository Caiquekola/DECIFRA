import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './pages/footer/footer'
import Game from './pages/gamefive/game'
import Header from './pages/header/header'
import Dashboard from './pages/dashboard/Dashboard' 
function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App