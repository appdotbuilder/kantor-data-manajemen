import { type LoginInput, type LoginResponse } from '../schema';

const VALID_EMAIL = 'kwarran.pagerbaang@gmail.com';
const VALID_PASSWORD = 'Pgb112815';

export const login = async (input: LoginInput): Promise<LoginResponse> => {
  try {
    // Check credentials
    if (input.email === VALID_EMAIL && input.password === VALID_PASSWORD) {
      return {
        success: true,
        message: 'Login berhasil',
        user: {
          email: input.email
        }
      };
    } else {
      return {
        success: false,
        message: 'Email atau password salah'
      };
    }
  } catch (error) {
    console.error('Login failed:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat login'
    };
  }
};