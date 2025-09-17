import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthHook = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, nombre: string, apellido: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nombre,
            apellido,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Error",
            description: "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al registrarse",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu correo electrónico para confirmar tu cuenta.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Error de autenticación",
            description: "Correo electrónico o contraseña incorrectos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al iniciar sesión",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cerrar sesión. Intenta nuevamente.",
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    loading,
  };
};