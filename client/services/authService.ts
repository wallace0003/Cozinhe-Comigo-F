import { api } from '@/lib/api';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post('/User/login', credentials);
  },

  async register(userData: SignupRequest): Promise<SignupResponse> {
    return api.post('/User', userData);
  },

  async getUserById(id: number): Promise<any> {
    return api.get(`/User/${id}`);
  },
};