import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IUser } from '../../domain/models/IUser';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, clave: string) => Promise<IUser>;
  logout: () => Promise<void>;
  upgrade: (
    ruc: string,
    razonSocial: string,
    nombreComercial: string,
    direccionFiscal: string,
    referenciaRecojo?: string,
    googleMapsUrl?: string,
    telefono?: string
  ) => Promise<IUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authRepository = new AuthRepository();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Intentar recuperar la sesión guardada al arrancar la aplicación
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (correo: string, clave: string): Promise<IUser> => {
    const loggedUser = await authRepository.login(correo, clave);
    setUser(loggedUser);
    localStorage.setItem('auth_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const logout = async () => {
    try {
      await authRepository.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
    }
  };

  const upgrade = async (
    ruc: string,
    razonSocial: string,
    nombreComercial: string,
    direccionFiscal: string,
    referenciaRecojo?: string,
    googleMapsUrl?: string,
    telefono?: string
  ): Promise<IUser> => {
    const upgradedUser = await authRepository.upgradeToComercio(
      ruc,
      razonSocial,
      nombreComercial,
      direccionFiscal,
      referenciaRecojo,
      googleMapsUrl,
      telefono
    );
    setUser(upgradedUser);
    localStorage.setItem('auth_user', JSON.stringify(upgradedUser));
    return upgradedUser;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, upgrade }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
