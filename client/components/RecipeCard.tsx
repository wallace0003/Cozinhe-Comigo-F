import { Link } from "react-router-dom";
import { RecipeCardProps } from "@/types/recipe";

const tagColors: { [key: string]: { bg: string; text: string } } = {
  main: { bg: "#8673A1", text: "#fff" },
  dessert: { bg: "#A03472", text: "#fff" },
  pasta: { bg: "#F3A505", text: "#000" },
  salad: { bg: "#57C785", text: "#000" },
  vegetarian: { bg: "#5E4C5A", text: "#fff" },
  favorites: { bg: "#355070", text: "#fff" },
  easy: { bg: "#FFE2D1", text: "#000" },
  snack: { bg: "#DA5552", text: "#fff" },
  lowcarb: { bg: "#4A90A4", text: "#fff" },
  lactosefree: { bg: "#8BB174", text: "#000" },
  seafood: { bg: "#2E86AB", text: "#fff" },
  breakfast: { bg: "#F7B32B", text: "#000" }  
};

const tagLabels: { [key: string]: string } = {
  main: "Prato Principal",
  dessert: "Sobremesa",
  pasta: "Massa", 
  salad: "Salada",
  vegetarian: "Vegetariana",
  easy: "Fácil",
  snack: "Lanche",
  lowcarb: "Low Carb",
  lactosefree: "Sem Lactose",
  seafood: "Frutos do Mar",
  breakfast: "Café da Manhã"
};

export default function RecipeCard({ 
  id, 
  title, 
  image, 
  tags 
}: RecipeCardProps) {

  const displayedTags = tags.slice(0, 2);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div 
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      <div className="p-4 flex flex-col gap-3">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {displayedTags.map((tag) => {
            const tagConfig = tagColors[tag] || { bg: "#666", text: "#fff" };
            return (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: tagConfig.bg,
                  color: tagConfig.text
                }}
              >
                {tagLabels[tag] || tag}
              </span>
            );
          })}
          {tags.length > 2 && (
            <span className="text-xs text-gray-500">
              +{tags.length - 2}
            </span>
          )}
        </div>
        
        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
          {title}
        </h3>
        
        {/* Metadados */}
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold">metadados a serem</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">implementados</span>
          </div>
        </div>
        
        {/* Link para detalhes */}
        <Link 
          to={`/receita/${id}`}
          className="text-light-brown font-bold text-sm underline opacity-100 hover:text-dark-brown transition-colors mt-2"
        >
          Leia mais
        </Link>
      </div>
    </div>
  );
}