import { Link } from "react-router-dom";

export default function UnloggedHeader() {
  return (
    <header className="bg-sky-blue w-full">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/3efcea8e628458afe98cbacc68a314a978cad282?width=84" 
            alt="Chef hat icon" 
            className="w-10 h-10"
          />
          <span className="text-[29px] font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cozinhe Comigo
          </span>
        </Link>
        
        <nav className="flex items-center gap-3">
          <Link 
            to="/" 
            className="px-5 py-3.5 text-black/50 hover:text-black transition-colors font-medium text-base"
          >
            Home
          </Link>
          <Link 
            to="/receitas" 
            className="px-5 py-3.5 text-black/50 hover:text-black transition-colors font-medium text-base"
          >
            Receitas
          </Link>
          <Link 
            to="/signup" 
            className="px-5 py-3.5 text-black/50 hover:text-black transition-colors font-medium text-base"
          >
            Cadastrar
          </Link>
          <Link
            to={"/login"} 
            className="px-5 py-3.5 bg-dark-brown text-white rounded-lg hover:bg-light-brown transition-colors font-medium text-base">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
