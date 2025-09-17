import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Phone, Camera } from 'lucide-react';
import { MobileLayout } from '@/components/MobileLayout';

interface Profile {
  id: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_nacimiento: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...formData,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados correctamente",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const nombre = formData.nombre || user?.email?.charAt(0) || 'U';
    const apellido = formData.apellido?.charAt(0) || '';
    return `${nombre}${apellido}`.toUpperCase();
  };

  if (loading) {
    return (
      <MobileLayout title="Perfil">
        <div className="container-padding">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Perfil">
      <div className="container-padding section-spacing max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y preferencias de cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900">Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={profile?.avatar_url || ''} 
                      alt="Foto de perfil" 
                    />
                    <AvatarFallback className="text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full p-2"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {formData.nombre && formData.apellido 
                    ? `${formData.nombre} ${formData.apellido}`
                    : 'Usuario'
                  }
                </h3>
                <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
                <Button variant="outline" disabled className="w-full">
                  Cambiar Foto
                  <small className="block text-xs text-gray-500 mt-1">
                    (Próximamente)
                  </small>
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-gray-900">Información de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">ID de Usuario</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {user?.id?.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Miembro desde</p>
                    <p className="text-sm text-gray-600">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'No disponible'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900">Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre" className="text-gray-900">
                        Nombre
                      </Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        placeholder="Tu nombre"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido" className="text-gray-900">
                        Apellido
                      </Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        placeholder="Tu apellido"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono" className="text-gray-900">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        placeholder="+52 123 456 7890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fecha_nacimiento" className="text-gray-900">
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="text-gray-900">
                      Biografía
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Cuéntanos un poco sobre ti..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="min-w-[120px]"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-gray-900">Configuración de Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cambiar Contraseña</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Para cambiar tu contraseña, te enviaremos un enlace a tu correo electrónico.
                    </p>
                    <Button variant="outline" disabled>
                      Solicitar Cambio de Contraseña
                      <small className="block text-xs text-gray-500 mt-1">
                        (Próximamente)
                      </small>
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Eliminar Cuenta</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Una vez que elimines tu cuenta, no hay vuelta atrás. Se perderán todos tus datos.
                    </p>
                    <Button variant="destructive" disabled>
                      Eliminar Cuenta
                      <small className="block text-xs text-gray-300 mt-1">
                        (Próximamente)
                      </small>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;