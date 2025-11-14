import { api } from '@/lib/api';
import { CreateRecipeRequest, CreateRecipeResponse, RecipesResponse, CreateAvaliationDto, AvaliationResponse, RecipeDetailResponse, AvaliationsResponse } from '@/types/api';

export const recipeService = {
  // GET /Recipe - Listar receitas com filtros
  async getRecipes(params?: {
    id?:number;
    PageSize?: number;
    PageNumber?: number;
    TitleSearch?: string;
    Categories?: string[];
    MinRating?: number;
    MaxRating?: number;
    MinPreparationTime?: number;
    MaxPreparationTime?: number;
    MinPortions?: number;
    MaxPortions?: number;
    UserId?: number;
    SortBy?: string;
    SortDescending?: boolean;
    FullResult?: boolean;
  }): Promise<RecipesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/Recipe?${queryString}` : '/Recipe';
    
    return api.get(endpoint);
  },

  // GET /Recipe/{id} - Obter receita por ID
  // GET /Recipe/{id} - Obter receita por ID
  async getRecipeById(id: number): Promise<any> {
    try {
      const res = await api.get(`/Recipe?id=${id}`);

      if (!res) {
        // Retorna um shape seguro quando não há resposta
        return { internStatusCode: -1, returnMessage: 'Empty response from API', returnObject: null };
      }

      if (res && res.returnObject) {
        const r: any = res.returnObject;

        // normaliza e garante um fallback para author (a API pode não retornar esse objeto)
        const normalized = {
          ...r,
          author: r.author ?? {
            name: r?.author?.name ?? `Cozinheiro ${r.userID ?? r.userId ?? ''}`,
            // algumas variações possíveis de nome do campo de imagem: profirePictureUrl / profilePictureUrl
            profirePictureUrl: r?.author?.profirePictureUrl ?? r?.author?.profilePictureUrl ?? null,
            profilePictureUrl: r?.author?.profilePictureUrl ?? r?.author?.profirePictureUrl ?? null,
            biography: r?.author?.biography ?? null,
          },
          // garante createdAt como string (consistente com code que usa new Date(...))
          createdAt: (r.createdAt ?? r.CreatedAt ?? '').toString(),
        };

        return {
          ...res,
          returnObject: normalized,
        };
      }

      // Se não houver returnObject, retorna um shape seguro
      return { ...res, returnObject: null };
    } catch (err: any) {
      console.error('Error in getRecipeById:', err);
      const message = err?.body?.returnMessage || err?.message || 'Erro ao buscar receita';
      return { internStatusCode: -1, returnMessage: message, returnObject: null, __error: err };
    }
  },

  // POST /Recipe - Criar receita
  async createRecipe(recipeData: CreateRecipeRequest): Promise<CreateRecipeResponse> {
    return api.post('/Recipe', recipeData);
  },

  // POST /Comments - Criar avaliação
  async createAvaliation(avaliationData: CreateAvaliationDto): Promise<AvaliationResponse> {
    return api.post('/Comments', avaliationData);
  },

  // GET /Comments - Listar avaliações de uma receita
  async getAvaliations(recipeId: number, pageSize: number = 10, pageNumber: number = 1): Promise<AvaliationsResponse> {
    const res = await api.get(`/Comments?RecipeId=${recipeId}&PageSize=${pageSize}&PageNumber=${pageNumber}`);

    // Normaliza as propriedades da resposta para o formato esperado pelo frontend
    if (res && res.returnObject && Array.isArray(res.returnObject)) {
      const normalized = res.returnObject.map((r: any) => ({
        Id: r.Id ?? r.id,
        RecipeId: r.RecipeId ?? r.recipeId,
        Rating: r.Rating ?? r.rating,
        UserId: r.UserId ?? r.userId,
        Content: r.Content ?? r.content,
        CreatedAt: (r.CreatedAt ?? r.createdAt)?.toString(),
        Author: r.Author ?? r.author
      }));

      return {
        ...res,
        returnObject: normalized
      } as AvaliationsResponse;
    }

    return res;
  },

  // GET /User/{id} - Obter usuário por ID
  async getUserById(id: number): Promise<any> {
    return api.get(`/User/${id}`);
  },
};