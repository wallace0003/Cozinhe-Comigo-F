import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderSwitcher from "@/components/HeaderSwitcher";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { ArrowLeft, Download, Heart, Star, AlertCircle, Loader } from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { RecipeDetailResponse, Avaliation } from "@/types/api";




export default function RecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeDetailResponse | null>(null);
  const [reviews, setReviews] = useState<Avaliation[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Função para carregar receita
  const fetchRecipe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!id) {
        setError("ID da receita não fornecido");
        return;
      }

      const recipeId = parseInt(id);
      const response = await recipeService.getRecipeById(recipeId);
      
      if (response.returnObject) {
        setRecipe(response.returnObject);
      } else {
        setError("Receita não encontrada");
      }
    } catch (err: any) {
      console.error("Erro ao carregar receita:", err);
      const errorMessage = err.body?.returnMessage || err.message || "Erro ao carregar receita";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar avaliações
  const fetchReviews = async () => {
    try {
      if (!id) return;

      const recipeId = parseInt(id);
      const response = await recipeService.getAvaliations(recipeId, 50, 1);
      
      if (response.returnObject && Array.isArray(response.returnObject)) {
        setReviews(response.returnObject);
      }
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    }
  };

  // Carrega receita e avaliações ao montar o componente
  useEffect(() => {
    if (id) {
      fetchRecipe();
      fetchReviews();
    }
  }, [id]);

  // Função para calcular tempo decorrido
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 30) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString("pt-BR");
  };

  // Função para submeter avaliação
  const handleSubmitReview = async () => {
    if (!recipe || userRating === 0 || !userComment.trim()) {
      setError("Por favor, preencha a avaliação e o comentário");
      return;
    }

    // Verificar se usuário está autenticado
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Você precisa estar autenticado para avaliar uma receita");
      navigate("/login");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setError(null);

      const avaliationData = {
        recipeId: recipe.id,
        rating: userRating,
        userId: parseInt(userId),
        content: userComment.trim(),
      };

      const response = await recipeService.createAvaliation(avaliationData);

      if (response.InternStatusCode === 0) { // 0 = sucesso
        // Adicionar avaliação à lista
        setReviews((prev) => [response.Data, ...prev]);
        setUserRating(0);
        setUserComment("");
        setSuccessMessage("Avaliação enviada com sucesso!");
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.ReturnMessage || "Erro ao enviar avaliação");
      }
    } catch (err: any) {
      console.error("Erro ao enviar avaliação:", err);
      const errorMessage = err.body?.returnMessage || err.message || "Erro ao enviar avaliação";
      setError(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-blue flex flex-col">
        <HeaderSwitcher />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-dark-brown" />
            <span className="text-lg text-dark-brown">Carregando receita...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Estado de erro
  if (error && !recipe) {
    return (
      <div className="min-h-screen bg-sky-blue flex flex-col">
        <HeaderSwitcher />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-dark-brown mb-2">Erro ao carregar receita</h2>
              <p className="text-dark-brown/70">{error}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-dark-brown text-white rounded-lg font-bold hover:bg-dark-brown/90 transition-colors"
            >
              Voltar
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Sem receita
  if (!recipe) {
    return (
      <div className="min-h-screen bg-sky-blue flex flex-col">
        <HeaderSwitcher />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg text-dark-brown">Receita não encontrada</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extrair imagens - tenta usar imageUrl como string ou array
  const images = recipe.imageUrl 
    ? (typeof recipe.imageUrl === 'string' ? [recipe.imageUrl] : recipe.imageUrl)
    : [];

  return (
    <div className="min-h-screen bg-sky-blue flex flex-col">
      <HeaderSwitcher />
      
      <main className="flex-1 max-w-[956px] w-full mx-auto px-6 py-10">
        <div className="bg-white rounded-lg p-3 flex flex-col gap-12">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-dark-brown" strokeWidth={1.5} />
            <span className="text-base font-bold text-dark-brown underline">Voltar</span>
          </button>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-5 h-5 text-green-500 flex-shrink-0">✓</div>
              <p className="text-sm text-green-700">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Cabeçalho da Receita */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {recipe.categories && recipe.categories.length > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium text-white tracking-tight bg-purple-600">
                  {recipe.categories[0]}
                </span>
              )}
              <span className="text-xs font-medium text-black/50 tracking-tight">
                Postada em: {new Date(recipe.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>

            <h1 className="text-5xl font-bold text-black">{recipe.title}</h1>

            <div className="flex items-center gap-4 bg-dark-brown rounded-lg p-2.5 w-fit">
              {recipe.author.profirePictureUrl && (
                <div
                  className="w-16 h-16 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${recipe.author.profirePictureUrl})` }}
                />
              )}
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight">
                  {recipe.author.name}
                </span>
                {recipe.author.biography && (
                  <span className="text-base text-white/60 tracking-tight">
                    {recipe.author.biography}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Galeria de Mídia */}
          <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-[424px] bg-dark-brown rounded-lg p-4 flex flex-col items-center gap-2">
              {/* Vídeo (se existir) */}
              {recipe.videoUrl && (
                <div className="w-full mb-4 relative">
                  <video
                    src={recipe.videoUrl}
                    controls
                    className="w-full h-48 rounded-lg object-cover bg-black"
                  />
                </div>
              )}

              {/* Carrossel de Imagens */}
              {images.length > 0 && (
                <>
                  <div className="w-full overflow-hidden">
                    <div
                      className="flex transition-transform duration-300"
                      style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                      {images.map((img, index) => (
                        <div key={index} className="w-full flex-shrink-0 px-3">
                          <div
                            className="w-full h-48 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url(${img})` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores do Carrossel */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 py-4">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-black w-4 h-4"
                              : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {images.length === 0 && !recipe.videoUrl && (
                <div className="w-full h-48 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                  Não implementado
                </div>
              )}
            </div>

            {/* Conteúdo da Receita */}
            <div className="w-full flex flex-col gap-8">
              <div>
                <h2 className="text-[34px] font-bold text-black mb-4">Ingredientes</h2>
                <div className="text-base leading-relaxed" style={{ fontFamily: "Merriweather, serif" }}>
                  {Array.isArray(recipe.ingredients) ? (
                    <ul className="list-disc pl-6">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="mb-2">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{recipe.ingredients}</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-[34px] font-bold text-black mb-4">Modo de Preparo</h2>
                <p
                  className="text-base leading-relaxed opacity-65 font-bold whitespace-pre-wrap"
                  style={{ fontFamily: "Merriweather, serif" }}
                >
                  {recipe.instructions}
                </p>
              </div>

              {recipe.portions && (
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Rendimento</h3>
                  <p className="text-base">{recipe.portions} porções</p>
                </div>
              )}

              {recipe.preparationTime && (
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Tempo de Preparo</h3>
                  <p className="text-base">{recipe.preparationTime} minutos</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => alert("Função de exportar ainda não implementada")}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-dark-brown text-white rounded-lg font-bold text-base hover:bg-dark-brown/90 transition-colors"
                >
                  Exportar
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert("Função de salvar ainda não implementada")}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-dark-brown text-white rounded-lg font-bold text-base hover:bg-dark-brown/90 transition-colors"
                >
                  Salvar
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => document.getElementById("avaliacao")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-dark-brown text-white rounded-lg font-bold text-base hover:bg-dark-brown/90 transition-colors"
                >
                  Avaliar
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Avaliações */}
        <h2 className="text-2xl font-bold text-black my-10">
          Avaliações {/* ({recipe.avaliationsCount}) */}
        </h2>

        {/* Lista de Avaliações */}
        <div className="flex flex-col gap-6 mb-10">
          {reviews.length > 0 ? (
            reviews.map((review, idx) => {
              const idKey = (review as any).Id ?? (review as any).id ?? `${recipe.id}-rev-${idx}`;
              const rating = Number((review as any).Rating ?? (review as any).rating ?? 0);
              const createdAt = (review as any).CreatedAt ?? (review as any).createdAt ?? "";
              const content = (review as any).Content ?? (review as any).content ?? "";
              const userId = (review as any).UserId ?? (review as any).userId ?? 0;
              const authorName = (review as any).Author?.name ?? (review as any).Author?.Name ?? `Cozinheiro ${userId}`;

              return (
                <div key={idKey} className="bg-white rounded-[32px_32px_32px_0] shadow-lg p-6 flex gap-5">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-900" style={{ fontFamily: "Roboto, sans-serif" }}>
                        {authorName}
                      </span>
                      <span className="text-lg text-gray-400" style={{ fontFamily: "Roboto, sans-serif" }}>
                        {createdAt ? getTimeAgo(String(createdAt)) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xl font-semibold">
                        <span className="text-yellow-400">{rating}</span>
                        <span className="text-gray-400">/5</span>
                      </span>
                    </div>
                    <p
                      className="text-base text-gray-900/60 leading-normal"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      {content}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          )}
        </div>

        {/* Formulário de Avaliação */}
        <div id="avaliacao" className="bg-white border-2 border-black/40 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="text-3xl transition-colors"
                  style={{ color: star <= userRating ? "#FCD34D" : "#D1D5DB" }}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-xl font-semibold text-black/70">Avalie</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-black/60 uppercase tracking-tight">
              Comentário
            </label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Digite aqui..."
              rows={6}
              className="w-full px-4 py-4 rounded-lg border border-black/30 text-base font-medium tracking-tight placeholder:text-black/40 placeholder:opacity-40 focus:outline-none focus:border-black/50 resize-none"
            />
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={isSubmittingReview}
            className="w-full px-5 py-3.5 bg-dark-brown text-white rounded-lg font-bold text-base hover:bg-dark-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingReview ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Enviando...
              </div>
            ) : (
              "Avaliar"
            )}
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
