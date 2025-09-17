import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, Calendar, Mail, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from '@/components/MobileLayout';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
interface CertificateProps {
  hideLayout?: boolean;
}
interface Certificate {
  id: string;
  numero_certificado: string;
  fecha_emision: string;
  verificado: boolean;
  url_certificado: string | null;
  course_id: string;
  marcado_como_enviado: boolean;
  courses?: {
    titulo: string;
  };
}
const Certificates = ({
  hideLayout = false
}: CertificateProps) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;
      try {
        const {
          data,
          error
        } = await supabase.from('certifications').select(`
            *,
            courses (
              titulo
            )
          `).eq('user_id', user.id).order('fecha_emision', {
          ascending: false
        });
        if (error) {
          console.error('Error fetching certificates:', error);
          return;
        }
        setCertificates(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleDownload = (url: string, certificateNumber: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const certificatesList = <>
      {loading ? <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div> : certificates.length === 0 ? <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aún no tienes certificados
          </h3>
          <p className="text-muted-foreground mb-4">
            Completa cursos para obtener tus primeros certificados
          </p>
          <Link to="/education?tab=explorar">
            <Button>Explorar Cursos</Button>
          </Link>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => <Card key={cert.id} className="bg-card border">
              <CardContent className="p-6 bg-[#3d3d3d]">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-primary" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Verificado
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {cert.courses?.titulo || 'Curso Completado'}
                </h3>
                <p className="mb-3 text-zinc-50 text-xs">
                  Certificado #{cert.numero_certificado}
                </p>
                <p className="text-xs mb-4 text-zinc-50">
                  Emitido el {new Date(cert.fecha_emision).toLocaleDateString()}
                </p>
                <div className="space-y-3">
                  {cert.url_certificado && <Button size="sm" variant="outline" className="w-full touch-target" onClick={() => window.open(cert.url_certificado, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>}
                  <div className="flex items-center justify-center p-2 rounded-md bg-[#6fffc1]">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium text-zinc-950">
                      {cert.marcado_como_enviado ? "¡Revisa tu Correo!" : "Procesando"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </>;
  if (hideLayout) {
    return certificatesList;
  }
  return <MobileLayout title="Certificados">
      <div className="container-padding section-spacing">
        <div className="mb-6">
          <h1 className="text-responsive-2xl font-bold text-foreground mb-2">
            Mis Certificados
          </h1>
          <p className="text-muted-foreground text-responsive-base">
            Descarga y comparte tus logros
          </p>
        </div>
        {certificatesList}
      </div>
    </MobileLayout>;
};
export default Certificates;