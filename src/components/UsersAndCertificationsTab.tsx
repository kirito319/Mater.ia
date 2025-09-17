import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserX, Trash2, Mail } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
interface User {
  id: string;
  nombre: string | null;
  apellido: string | null;
  created_at: string;
}
interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  fecha_inscripcion: string;
  progreso: number;
  completado: boolean;
  courses?: {
    titulo: string;
  };
  profiles?: {
    nombre: string | null;
    apellido: string | null;
  };
}
interface Certification {
  id: string;
  numero_certificado: string;
  fecha_emision: string;
  verificado: boolean;
  url_certificado: string | null;
  marcado_como_enviado: boolean;
  user_id: string;
  course_id: string;
  courses?: {
    titulo: string;
  };
  profiles?: {
    nombre: string | null;
    apellido: string | null;
  };
}
export function UsersAndCertificationsTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const {
        data: usersData,
        error: usersError
      } = await supabase.from('profiles').select('id, nombre, apellido, created_at, user_id').order('created_at', {
        ascending: false
      });
      if (usersError) throw usersError;

      // Fetch enrollments with related data
      const {
        data: enrollmentsData,
        error: enrollmentsError
      } = await supabase.from('enrollments').select(`
          id,
          user_id,
          course_id,
          fecha_inscripcion,
          progreso,
          completado,
          courses (titulo)
        `).order('fecha_inscripcion', {
        ascending: false
      });
      if (enrollmentsError) throw enrollmentsError;

      // Fetch certifications with related data
      const {
        data: certificationsData,
        error: certificationsError
      } = await supabase.from('certifications').select(`
          id,
          numero_certificado,
          fecha_emision,
          verificado,
          url_certificado,
          marcado_como_enviado,
          user_id,
          course_id,
          courses (titulo)
        `).order('fecha_emision', {
        ascending: false
      });
      if (certificationsError) throw certificationsError;

      // Get ALL profiles - this ensures we have complete data
      const {
        data: profilesData,
        error: profilesError
      } = await supabase.from('profiles').select('user_id, nombre, apellido').order('created_at', {
        ascending: false
      });
      if (profilesError) {
        console.error('Profile fetch error:', profilesError);
        throw profilesError;
      }

      // Create profile lookup map
      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Add profile data to enrollments with better fallback
      const enrichedEnrollments = enrollmentsData?.map(enrollment => {
        const profile = profileMap.get(enrollment.user_id);
        return {
          ...enrollment,
          profiles: profile || {
            nombre: null,
            apellido: null
          }
        };
      }) || [];

      // Add profile data to certifications with better fallback
      const enrichedCertifications = certificationsData?.map(cert => {
        const profile = profileMap.get(cert.user_id);
        return {
          ...cert,
          profiles: profile || {
            nombre: null,
            apellido: null
          }
        };
      }) || [];
      setUsers(usersData || []);
      setEnrollments(enrichedEnrollments);
      setCertifications(enrichedCertifications);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };
  const toggleCertificateStatus = async (certificationId: string, currentStatus: boolean) => {
    try {
      const {
        error
      } = await supabase.from('certifications').update({
        marcado_como_enviado: !currentStatus
      }).eq('id', certificationId);
      if (error) throw error;
      toast.success(`Certificado marcado como ${!currentStatus ? 'enviado' : 'no enviado'}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast.error('Error al actualizar el estado del certificado');
    }
  };
  const kickUserFromCourse = async (enrollmentId: string, userName: string, courseName: string) => {
    try {
      // Get enrollment details first
      const {
        data: enrollment,
        error: enrollmentError
      } = await supabase.from('enrollments').select('user_id, course_id').eq('id', enrollmentId).single();
      if (enrollmentError) throw enrollmentError;

      // Delete in the correct order to respect foreign key constraints
      // 1. Delete user progress records
      const {
        error: progressError
      } = await supabase.from('user_progress').delete().eq('enrollment_id', enrollmentId);
      if (progressError) throw progressError;

      // 2. Delete quiz attempts
      const {
        error: attemptsError
      } = await supabase.from('slide_attempts').delete().eq('enrollment_id', enrollmentId);
      if (attemptsError) throw attemptsError;

      // 3. Delete certificates for this user and course
      const {
        error: certError
      } = await supabase.from('certifications').delete().eq('user_id', enrollment.user_id).eq('course_id', enrollment.course_id);
      if (certError) throw certError;

      // 4. Finally delete the enrollment
      const {
        error: deleteError
      } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
      if (deleteError) throw deleteError;
      toast.success(`${userName} fue expulsado del curso "${courseName}" y su progreso fue reiniciado`);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error kicking user:', error);
      toast.error('Error al expulsar al usuario del curso');
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Section */}
        <Card className="bg-background/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-slate-50">Usuarios Registrados</CardTitle>
            <CardDescription className="text-slate-50">
              Total: {users.length} usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(user => <div key={user.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-50">
                      {user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : 'Sin nombre'}
                    </p>
                    <p className="text-sm text-zinc-50">
                      Registrado: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Section */}
        <Card className="bg-background/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-slate-50">Inscripciones</CardTitle>
            <CardDescription className="text-slate-50">
              Total: {enrollments.length} inscripciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {enrollments.map(enrollment => <div key={enrollment.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-zinc-50">
                        {enrollment.profiles?.nombre || enrollment.profiles?.apellido ? `${enrollment.profiles?.nombre || ''} ${enrollment.profiles?.apellido || ''}`.trim() : 'Usuario sin nombre'}
                      </p>
                      <p className="text-sm text-slate-50">
                        Curso: {enrollment.courses?.titulo || 'Curso no encontrado'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-zinc-50">
                          Progreso: {enrollment.progreso}%
                        </p>
                        <p className={`text-xs ${enrollment.completado ? 'text-green-600' : 'text-orange-600'}`}>
                          {enrollment.completado ? 'Completado' : 'En progreso'}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-50">
                        Inscrito: {new Date(enrollment.fecha_inscripcion).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur text-red-600 hover:bg-red-50">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Expulsar del curso?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres expulsar a{' '}
                              <strong>
                                {enrollment.profiles?.nombre || enrollment.profiles?.apellido ? `${enrollment.profiles?.nombre || ''} ${enrollment.profiles?.apellido || ''}`.trim() : 'este usuario'}
                              </strong>{' '}
                              del curso "{enrollment.courses?.titulo}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => kickUserFromCourse(enrollment.id, enrollment.profiles?.nombre || enrollment.profiles?.apellido ? `${enrollment.profiles?.nombre || ''} ${enrollment.profiles?.apellido || ''}`.trim() : 'Usuario', enrollment.courses?.titulo || 'curso')} className="bg-red-600 hover:bg-red-700">
                              Expulsar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Certifications Section */}
      <Card className="bg-background/80 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-gray-50">Certificados Emitidos</CardTitle>
          <CardDescription className="text-slate-50">
            Total: {certifications.length} certificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {certifications.map(cert => <div key={cert.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-50">
                      {cert.profiles?.nombre || cert.profiles?.apellido ? `${cert.profiles?.nombre || ''} ${cert.profiles?.apellido || ''}`.trim() : 'Usuario sin nombre'}
                    </p>
                    <p className="text-sm text-zinc-50">
                      Curso: {cert.courses?.titulo || 'Curso no encontrado'}
                    </p>
                    <p className="text-xs text-zinc-50">
                      Emitido: {new Date(cert.fecha_emision).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-mono text-zinc-50">
                        {cert.numero_certificado}
                      </p>
                      <p className={`text-xs ${cert.verificado ? 'text-green-600' : 'text-red-600'}`}>
                        {cert.verificado ? 'Verificado' : 'No verificado'}
                      </p>
                    </div>
                    <Button onClick={() => toggleCertificateStatus(cert.id, cert.marcado_como_enviado)} size="sm" variant={cert.marcado_como_enviado ? "secondary" : "default"} className={cert.marcado_como_enviado ? "" : "bg-blue-600 hover:bg-blue-700 text-white"}>
                      <Mail className="h-4 w-4 mr-1" />
                      {cert.marcado_como_enviado ? 'Marcar como No Enviado' : 'Enviado a Correo'}
                    </Button>
                  </div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}