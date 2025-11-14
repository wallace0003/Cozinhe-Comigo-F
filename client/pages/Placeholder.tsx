import HeaderSwitcher from "@/components/HeaderSwitcher";
import Footer from "@/components/Footer";

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-sky-blue flex flex-col">
      <HeaderSwitcher />
      
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-black mb-6">{title}</h1>
          <p className="text-xl text-black/70 mb-8">
            Esta página está em desenvolvimento. 
          </p>
          <div className="bg-card-gray rounded-xl p-8">
            <p className="text-base text-black/60">
              Aguarde próximas atualizações!
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
