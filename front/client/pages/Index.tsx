import { useState, useEffect } from "react";
import HeaderSwitcher from "@/components/HeaderSwitcher";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { Search } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { recipeService } from "@/services/recipeService";

const categories = [
  { label: "Todas as receitas", value: "all" },
  { label: "Prato principal", value: "main" },
  { label: "Sobremesas", value: "dessert" },
  { label: "Massas", value: "pasta" },
  { label: "Saladas", value: "salad" },
  { label: "Vegetariana", value: "vegetarian" },
  { label: "Fácil", value: "easy" },
  { label: "Lanche", value: "snack" },
  { label: "Low Carb", value: "lowcarb" },
  { label: "Sem Lactose", value: "lactosefree" },
  { label: "Frutos do Mar", value: "seafood" },
  { label: "Café da Manhã", value: "breakfast" },

];

const backendCategoryForTag: { [key: string]: string } = {
  main: "Prato Principal",
  dessert: "Sobremesas",
  pasta: "Massas",
  salad: "Saladas",
  vegetarian: "Vegetariana",
  easy: "Fácil",
  snack: "Lanche",
  lowcarb: "Low Carb",
  lactosefree: "Sem Lactose",
  seafood: "Frutos do Mar",
  breakfast: "Café da Manhã",
};

function mapReadDtoToRecipe(dto: any): Recipe {
  const mapCategoryToTag = (cat: string) => {
    const found = Object.entries(backendCategoryForTag)
      .find(([, v]) => v.toLowerCase() === (cat ?? "").toLowerCase());
    if (found) return found[0];
    return (cat ?? "").toLowerCase().replace(/\s+/g, '');
  };

  return {
    id: String(dto.id),
    title: dto.title ?? "",
    image: dto.imageUrl ?? "https://images.unsplash.com/photo-1612690119274-8819a81c13a2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=435",
    tags: Array.isArray(dto.categories) ? dto.categories.map(mapCategoryToTag) : []
  } as unknown as Recipe;
}

export default function Index() {
  const [activeTag, setActiveTag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  //const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params: any = {
          PageSize: 50,
          PageNumber: 1,
        };

        if (searchTerm) params.TitleSearch = searchTerm;

        if (activeTag && activeTag !== "all") {
          const backendCat = backendCategoryForTag[activeTag];
          if (backendCat) params.Categories = [backendCat];
        }

        const res = await recipeService.getRecipes(params);
        // Caso a API retorne o formato do prompt:
        const items = res?.returnObject ?? [];
        const mapped = items.map((r: any) => mapReadDtoToRecipe(r));
        setRecipes(mapped);
        setTotalItems(res?.totalItems ?? mapped.length);
      } catch (err) {
        console.error("Erro ao buscar receitas:", err);
        setRecipes([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTag, searchTerm]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesTag = activeTag === "all" || recipe.tags.includes(activeTag);
    
    const matchesSearch = searchTerm === "" || 
                         recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-sky-blue flex flex-col">
      <HeaderSwitcher />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <h1 className="text-5xl font-bold text-black mb-10">Receitas</h1>
        
        <div className="bg-card-gray rounded-2xl px-4 py-2.5 flex items-center gap-2 max-w-[270px] mb-10">
          <Search className="w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-semibold text-black placeholder:text-black w-full"
          />
        </div>
        
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveTag(category.value)}
                className={`px-4 py-3 rounded-full text-base font-medium tracking-tight transition-colors ${
                  activeTag === category.value
                    ? "bg-black text-white"
                    : "bg-dark-brown text-white hover:bg-dark-brown/90"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown"></div>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="text-sm text-gray-600">
                {filteredRecipes.length} receita{filteredRecipes.length !== 1 ? 's' : ''} encontrada{filteredRecipes.length !== 1 ? 's' : ''}
                {activeTag !== "all" && ` na categoria "${categories.find(t => t.value === activeTag)?.label}"`}
                {searchTerm && ` para "${searchTerm}"`}
              </div>
              
              {/* Grid de receitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    image={recipe.image}
                    tags={recipe.tags}
                  />
                ))}
              </div>
              
              {/* Mensagem de lista vazia */}
              {filteredRecipes.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-600 mb-4">
                    {searchTerm || activeTag !== "all" 
                      ? "Nenhuma receita encontrada para os filtros aplicados." 
                      : "Nenhuma receita disponível no momento."}
                  </p>
                  {(searchTerm || activeTag !== "all") && (
                    <button 
                      onClick={() => {
                        setSearchTerm("");
                        setActiveTag("all");
                      }}
                      className="px-4 py-2 bg-dark-brown text-white rounded-lg hover:bg-light-brown transition-colors"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
