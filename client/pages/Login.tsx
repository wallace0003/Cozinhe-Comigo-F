import { authService } from "@/services/authService";
import { set } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.email.trim() || !formData.password.trim()) {
        setError("Por favor, preencha todos os campos.");
        return;
      }

      if (!formData.email.includes('@')) {
        setError("Por favor, insira um email válido.");
        return;
      }
      
      const response = await authService.login({
        Email: formData.email,
        PassWord: formData.password,
      });

      console.log("Login response:", response.InternStatusCode);
      if (response.message?.includes('successful')) {
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id.toString());
        localStorage.setItem('user', JSON.stringify(response.user));
        // Notify app that auth state changed (HeaderSwitcher listens to this)
        window.dispatchEvent(new Event('authChanged'));

        navigate('/');
      } else {
        setError(response.message || "Erro ao fazer login. Tente novamente.");
      }

    } catch (error: any) {
      console.error("Erro no login:", error);
      setError(error.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-brown p-4">
      <div className="w-full max-w-[1440px] h-[1024px] max-h-screen rounded-[40px] bg-dark-brown overflow-hidden flex">
        <div className="hidden lg:flex lg:w-[480px] relative flex-col justify-start pt-32 px-16 text-white">
          <div className="absolute inset-0 opacity-20 blur-[78px]">
            <div className="absolute w-[394px] h-[437px] bg-[#B88A68] opacity-48 top-[-77px] left-[19px] rounded-full" />
            <div className="absolute w-[500px] h-[502px] bg-sky-blue opacity-33 top-[212px] left-[-87px] rounded-full" />
            <div className="absolute w-[657px] h-[623px] bg-card-gray opacity-20 top-[671px] left-[-293px] rounded-full" />
          </div>

          <h1 className="text-[43px] font-bold leading-tight relative z-10 mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
            Encontre<br />
            milhares<br />
            de receitas
          </h1>

          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/a9f13d34498ffa9fb544fbed8c54828763522adf?width=1314"
            alt="Restaurant 3D Model"
            className="absolute bottom-[-203px] left-[-100px] w-[657px] h-[657px] object-contain z-10"
          />
        </div>

        <div className="flex-1 bg-white rounded-l-[40px] lg:rounded-l-none relative flex flex-col items-center px-6 lg:px-12 py-12 overflow-y-auto">
          <div className="w-full max-w-[735px]">
            <Link
              to="/">
              <div className="flex flex-col items-center gap-3 mb-16">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/6cc0bf456de4bcab6f500add6155f2c8fcd1ef1a?width=132"
                alt="Chef hat"
                className="w-16 h-16 drop-shadow-md"
              />
              <h2 className="text-[40px] font-bold text-[#212121] text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Cozinhe Comigo
              </h2>
            </div>
            </Link>
            

            <h1 className="text-[40px] font-bold text-[#434343] text-center mb-16" style={{ fontFamily: 'Inter, sans-serif' }}>
              Faça Login
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border border-gray-400 focus:outline-none focus:border-gray-600 peer"
                  placeholder=" "
                  disabled={isLoading}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-2 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border border-gray-400 focus:outline-none focus:border-gray-600 peer"
                  placeholder=" "
                  disabled={isLoading}
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-2 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Senha
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-20 bg-[#B88A68] hover:bg-[#A67A58] text-white text-[28px] font-bold rounded-lg transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>

              <p className="text-center text-lg pt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-gray-500">Novo por aqui? </span>
                <Link to="/signup" className="text-[#B88A68] hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
