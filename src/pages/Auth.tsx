import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { useAuthHook } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const signInSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type SignInFormData = z.infer<typeof signInSchema>;

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const { signIn, loading } = useAuthHook();
  const [showPassword, setShowPassword] = useState(false);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSignIn = async (data: SignInFormData) => {
    const { error } = await signIn(data.email, data.password);
    if (!error) {
      // Navigation will happen automatically via AuthProvider
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Header con Logo MATER.IA */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {/* Logo MATER.IA exactamente como en la imagen - tres cuadrados formando L */}
            <div className="flex items-end">
              <div className="w-8 h-8 bg-blue-400 rounded mr-1"></div>
              <div className="w-8 h-8 bg-green-400 rounded"></div>
            </div>
            <div className="absolute -top-4 left-7">
              <div className="w-8 h-8 bg-purple-400 rounded"></div>
            </div>
          </div>
          <div className="ml-4 flex items-center">
            <span 
              className="font-bold text-gray-900"
              style={{
                fontSize: '32px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              MATER
            </span>
            <span 
              className="font-bold text-gray-900"
              style={{
                fontSize: '36px', 
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              .I
            </span>
            <span 
              className="font-bold text-gray-900"
              style={{
                fontSize: '30px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              A
            </span>
          </div>
        </div>
        <p 
          className="font-medium text-sm"
          style={{
            color: '#9CA3AF',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          ED-TECH DOCENTE
        </p>
      </div>

      {/* Contenedor de Login */}
      <div className="w-full max-w-md">
        <div 
          className="rounded-lg p-8 shadow-sm"
          style={{ 
            backgroundColor: '#F5F5F5',
            border: '1px solid #D0D0D0'
          }}
        >
          <h2 
            className="text-center mb-6 font-semibold"
            style={{
              fontSize: '20px',
              color: '#2D2D2D',
              fontWeight: 600,
              marginBottom: '24px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Inicio de Sesión
          </h2>
          
          <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="block text-left"
                style={{
                  fontSize: '14px',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                {...signInForm.register('email')}
                className="w-full bg-white rounded text-black"
                style={{
                  border: '1px solid #6B7280',
                  padding: '12px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#000000'
                }}
              />
              {signInForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="block text-left"
                style={{
                  fontSize: '14px',
                  color: '#2D2D2D',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Contraseña
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  {...signInForm.register('password')}
                  className="w-full bg-white rounded pr-10"
                  autoComplete="current-password"
                  style={{
                    border: '1px solid #6B7280',
                    padding: '12px',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    color: '#000000',
                    outline: 'none',
                    borderRadius: '4px',
                    fontFamily: 'Montserrat, sans-serif',
                    width: '100%',
                    display: 'block'
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full text-white font-semibold"
              disabled={loading}
              style={{
                backgroundColor: '#4A4A4A',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '16px',
                fontFamily: 'Montserrat, sans-serif',
                borderRadius: '25px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          {/* Links al final */}
          <div 
            className="flex justify-between"
            style={{
              marginTop: '24px',
              fontSize: '12px'
            }}
          >
            <button 
              className="text-gray-600 hover:text-gray-800 underline"
              style={{ 
                color: '#2D2D2D',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '12px'
              }}
            >
              Olvide mi Contraseña
            </button>
            <button 
              className="text-gray-600 hover:text-gray-800 underline"
              style={{ 
                color: '#2D2D2D',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '12px'
              }}
            >
              Registrarme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
