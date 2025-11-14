export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Recipe {
    id: string;
    title: string;
    image: string;
    rating: number;
    author: User;
    tags: string[];
}

export interface RecipeCardProps {
    id: string;
    title: string;
    image: string;
    tags: string[];
}