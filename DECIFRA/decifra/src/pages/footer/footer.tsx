import './footer.css';
import { Github } from 'lucide-react';

function Footer(): React.ReactElement {
    const startDate = new Date('2025-09-01');
    const today = new Date();
    var diffMs = today.getTime() - startDate.getTime();
    // Retorna em milisegundos sempre então tem que fazer a conversão
    var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return (
        <>
            <footer>
                <div>
                    <ul>
                        <li>
                            <a href="https://www.caiquekola.com.br/">
                               Decifra ©  Dia {diffDays} 
                            </a>
                        </li>
                        <li>
                            <a href="https://www.caiquekola.com.br"><Github />Caiquekola</a>
                        </li>
                    </ul>
            </div>
        </footer >
        </>)
}

export default Footer;