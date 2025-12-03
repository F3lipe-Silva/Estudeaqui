
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
 id: string;
 email: string;
 name?: string;
}

interface AuthContextType {
 user: User | null;
 loading: boolean;
 logIn: (credentials: any) => Promise<any>;
 signUp: (credentials: any) => Promise<any>;
 logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
   // Check if user is logged in on initial load
   const storedUser = localStorage.getItem('user');
   if (storedUser) {
     try {
       const parsedUser = JSON.parse(storedUser);
       setUser(parsedUser);
     } catch (error) {
       console.error('Error parsing stored user:', error);
     }
   }
   setLoading(false);

   // Handle route changes based on auth state
   if (window.location.pathname === '/login' && storedUser) {
     router.push('/');
   } else if (window.location.pathname !== '/login' && !storedUser) {
     router.push('/login');
   }
 }, [router]);

 const logIn = async (credentials: any): Promise<any> => {
   setLoading(true);
   try {
     // Simulate login - in a real app you would validate credentials against a backend
     // For demo purposes, we'll just create a user object
     if (credentials.isGoogle) {
       // Simulate Google login
       const mockUser = {
         id: 'google-user-' + Math.random().toString(36).substr(2, 9),
         email: credentials.email || 'user@gmail.com',
         name: credentials.name || 'Google User'
       };
       
       localStorage.setItem('user', JSON.stringify(mockUser));
       setUser(mockUser);
       router.push('/');
     } else {
       // Simulate regular login
       const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
       const foundUser = Object.values(storedUsers).find((user: any) =>
         user.email === credentials.email && user.password === credentials.password
       );
       
       if (foundUser) {
         localStorage.setItem('user', JSON.stringify(foundUser));
         setUser(foundUser);
         router.push('/');
       } else {
         throw new Error('Credenciais inválidas');
       }
     }
   } catch (error: any) {
     throw error;
   } finally {
     setLoading(false);
   }
 };

 const signUp = async (credentials: any): Promise<any> => {
   setLoading(true);
   try {
     // Check if user already exists
     const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
     if (storedUsers[credentials.email]) {
       throw new Error('Usuário já existe');
     }
     
     // Create new user
     const newUser = {
       id: 'user-' + Math.random().toString(36).substr(2, 9),
       email: credentials.email,
       name: credentials.email.split('@')[0] // Use part of email as name
     };
     
     // Store user in localStorage
     storedUsers[credentials.email] = {
       ...newUser,
       password: credentials.password
     };
     
     localStorage.setItem('users', JSON.stringify(storedUsers));
     localStorage.setItem('user', JSON.stringify(newUser));
     setUser(newUser);
     router.push('/');
   } catch (error: any) {
     throw error;
   } finally {
     setLoading(false);
   }
 };

 const logOut = async (): Promise<any> => {
   setLoading(true);
   // Clear user data from localStorage
   localStorage.removeItem('user');
   setUser(null);
   setLoading(false);
   router.push('/login');
 };

 return (
   <AuthContext.Provider value={{
     user,
     loading,
     logIn,
     signUp,
     logOut
   }}>
     {children}
   </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (context === undefined) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
}
