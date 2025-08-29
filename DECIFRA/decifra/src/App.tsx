import './App.css'
import Footer from './pages/footer/footer'
import Game from './pages/gamefive/game'
import Header from './pages/header/header'


function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <Game />
      </main>
      <Footer />
    </div>
  );
}


export default App
