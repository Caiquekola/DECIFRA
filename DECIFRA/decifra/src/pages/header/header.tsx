import './header.css';

function Header(): React.ReactElement {
  return (
    <header>
      <div className="left-icons">
        <div className="icon">
          {/* Ícone 1 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="currentColor" className="bi bi-arrow-down-square" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
          </svg>
        </div>
        <div className="icon">
          {/* Ícone 2 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26"
            fill="currentColor" className="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
            <path d="M11 2a1 1 0 0 1 1-1h2..."/>
          </svg>
        </div>
      </div>''

      <h1>DECIFRA</h1>

      <div className="right-icons">
        <div className="icon">
          {/* Ícone engrenagem 1 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
            <path d="M8 4.754a3.246 3.246 0..."/>
          </svg>
        </div>
        <div className="icon">
          {/* Ícone engrenagem 2 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
            <path d="M8 4.754a3.246 3.246 0..."/>
          </svg>
        </div>
      </div>
    </header>
  )
}

export default Header;
