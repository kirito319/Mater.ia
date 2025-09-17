import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { useAuthHook } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const signUpSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const { signIn, signUp, loading } = useAuthHook();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellido: '',
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
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

  const onSignUp = async (data: SignUpFormData) => {
    const { error } = await signUp(data.email, data.password, data.nombre, data.apellido);
    if (!error) {
      setActiveTab('signin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pixel EdTech</h1>
          <p className="text-muted-foreground">Tu plataforma de aprendizaje digital</p>
        </div>

        <Card className="backdrop-blur-sm bg-background/80 border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">¡Comencemos!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Inicia sesión o crea tu cuenta para comenzar a aprender
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Correo Electrónico
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tu@email.com"
                      {...signInForm.register('email')}
                      className="bg-background/50 text-white placeholder:text-gray-400"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground">
                      <Lock className="inline w-4 h-4 mr-2" />
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        {...signInForm.register('password')}
                        className="bg-background/50 text-white placeholder:text-gray-400 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-nombre" className="text-foreground">
                        <User className="inline w-4 h-4 mr-2" />
                        Nombre
                      </Label>
                      <Input
                        id="signup-nombre"
                        placeholder="Tu nombre"
                        {...signUpForm.register('nombre')}
                        className="bg-background/50 text-white placeholder:text-gray-400"
                      />
                      {signUpForm.formState.errors.nombre && (
                        <p className="text-sm text-destructive">
                          {signUpForm.formState.errors.nombre.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-apellido" className="text-foreground">
                        Apellido
                      </Label>
                      <Input
                        id="signup-apellido"
                        placeholder="Tu apellido"
                        {...signUpForm.register('apellido')}
                        className="bg-background/50 text-white placeholder:text-gray-400"
                      />
                      {signUpForm.formState.errors.apellido && (
                        <p className="text-sm text-destructive">
                          {signUpForm.formState.errors.apellido.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Correo Electrónico
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      {...signUpForm.register('email')}
                      className="bg-background/50 text-white placeholder:text-gray-400"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">
                      <Lock className="inline w-4 h-4 mr-2" />
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        {...signUpForm.register('password')}
                        className="bg-background/50 text-white placeholder:text-gray-400 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-foreground">
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirma tu contraseña"
                      {...signUpForm.register('confirmPassword')}
                      className="bg-background/50 text-white placeholder:text-gray-400"
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  );
};

export default Auth;