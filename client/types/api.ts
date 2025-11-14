export interface LoginRequest {
  Email: string;
  PassWord: string;
}

export interface LoginResponse {
  InternStatusCode: number;
  message: string;
  user: {
    id: number;
    Name: string;
    email: string;
  };
  token: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  passWord: string;
  profirePictureUrl?: string;
  biography?: string;
  favoriteRecipesId?: string;
}

export interface SignupResponse {
  InternStatusCode: number;
  message: string;
  user: {
    id: number;
    Name: string;
    email: string;
    CreatedAt: string;
    ProfirePictureUrl?: string;
    Biography?: string;
    FavoriteRecipesID?: string;
  };
}

export interface CreateRecipeRequest {
  UserID: number;
  Title: string;
  Ingredients: string[];
  Instructions: string;
  ImageUrl?: string;
  VideoUrl?: string;
  PreparationTime?: number;
  Portions?: number;
  IsPublic: boolean;
  Categories: string[];
}

export interface CreateRecipeResponse {
  internStatusCode: number;
  returnMessage: string;
  returnObject: Recipe;
  totalItems?: number;
  pageNumbers?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface Recipe {
  Id: number;
  UserID: number;
  Title: string;
  Ingredients: string[];
  Instructions: string;
  ImageUrl?: string;
  VideoUrl?: string;
  CreatedAt: string;
  AvaliationsCount: number;
  IsPublic: boolean;
  AverageRating: number;
  Categories: string[];
  Portions?: number;
  PreparationTime?: number;
}

export interface ReadRecipeDto {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string | null;
  averageRating: number;
  categories: string[];
  preparationTime?: number | null;
}

export interface RecipesResponse {
  internStatusCode: number;
  returnMessage: string;
  returnObject: ReadRecipeDto[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAvaliationDto {
  recipeId: number;
  rating: number;
  userId: number;
  content: string;
}

export interface AvaliationResponse {
  internStatusCode: number;
  returnMessage: string;
  Data: Avaliation;
}

export interface Avaliation {
  Id: number;
  RecipeId: number;
  Rating: number;
  UserId: number;
  Content: string;
  CreatedAt: string;
}

export interface User {
  id: number;
  name: string;
  profirePictureUrl?: string;
  biography?: string;
}

export interface AvaliationWithAuthor {
  Id: number;
  RecipeId: number;
  Rating: number;
  UserId: number;
  Content: string;
  CreatedAt: string;
  Author?: User;
}

export interface RecipeDetailResponse {
  id: number;
  userID: number;
  title: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  avaliationsCount: number;
  isPublic: boolean;
  averageRating: number;
  categories: string[];
  portions?: number;
  preparationTime?: number;
  author: {
    id: number;
    name: string;
    profirePictureUrl?: string;
    biography?: string;
  };
}

export interface AvaliationsResponse {
  internStatusCode: number;
  returnMessage: string;
  returnObject: Avaliation[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}