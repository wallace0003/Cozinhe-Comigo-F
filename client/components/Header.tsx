import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    // Notify other parts of the app
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

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
            to="/publicar" 
            className="px-5 py-3.5 text-black/50 hover:text-black transition-colors font-medium text-base"
          >
            Publicar
          </Link>
          <Link 
            to="/perfil" 
            className="px-5 py-3.5 text-black/50 hover:text-black transition-colors font-medium text-base"
          >
            Perfil
          </Link>
          <button onClick={handleLogout} className="px-5 py-3.5 bg-dark-brown text-white rounded-lg hover:bg-light-brown transition-colors font-medium text-base">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
