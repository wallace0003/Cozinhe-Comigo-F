export default function Footer() {
  return (
    <footer className="bg-dark-brown w-full py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-9">
          <div className="flex items-center gap-2">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/3efcea8e628458afe98cbacc68a314a978cad282?width=84" 
              alt="Chef hat icon" 
              className="w-10 h-10"
            />
            <span className="text-white text-[29px] font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Cozinhe Comigo
            </span>
          </div>
          
          <p className="text-white text-base font-medium tracking-tight">
            © 2025 - 2025 Cozinhe Comigo
          </p>
          
          <a 
            href="https://github.com/JnSGoncalves/Cozinhe-Comigo/wiki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/23bf95cb13024af62181981a7df4bbfb72797a9b?width=72" 
              alt="GitHub" 
              className="w-9 h-8"
            />
          </a>
        </div>
        
        <div className="border-t border-white/50 w-full max-w-[863px] mx-auto" />
      </div>
    </footer>
  );
}
