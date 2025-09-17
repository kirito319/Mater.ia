import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileLayout } from '@/components/MobileLayout';
import { EnrolledCourses } from '@/components/EnrolledCourses';
import Courses from './Courses';
import Certificates from './Certificates';
const Education = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'mis-cursos';
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabTitles: Record<string, string> = {
    'mis-cursos': 'Mis Cursos',
    'explorar': 'Explorar',
    'certificaciones': 'Certificaciones'
  };
  const currentTitle = tabTitles[activeTab] ?? 'Mis Cursos';
  return <MobileLayout title="Educación" hideHeader={true}>
      <div className="container-padding section-spacing min-h-screen bg-[#555555]">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4 -ml-2 text-white bg-[#3e3e3e] hover:bg-[#2e2e2e]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-responsive-2xl font-bold text-white text-center">{currentTitle}</h1>
          
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
          {/* Top sticky section with tab navigation */}
          <div className="sticky top-0 z-10 bg-[#555555] pt-2">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-[#3e3e3e] border-0">
              <TabsTrigger value="mis-cursos" className="text-xs sm:text-sm data-[state=active]:bg-[#0c96de] data-[state=active]:text-white text-white/80">
                Mis Cursos
              </TabsTrigger>
              <TabsTrigger value="explorar" className="text-xs sm:text-sm data-[state=active]:bg-[#0c96de] data-[state=active]:text-white text-white/80">
                Explorar
              </TabsTrigger>
              <TabsTrigger value="certificaciones" className="text-xs sm:text-sm data-[state=active]:bg-[#0c96de] data-[state=active]:text-white text-white/80">
                Certificaciones
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 pb-32">
            <TabsContent value="mis-cursos" className="space-y-4 mt-4">
              <EnrolledCourses />
            </TabsContent>
            
            <TabsContent value="explorar" className="space-y-4 mt-4">
              <div className="bg-[#3e3e3e] p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Cursos Disponibles
                </h2>
                <Courses hideLayout />
              </div>
            </TabsContent>
            
            <TabsContent value="certificaciones" className="space-y-4 mt-4">
              <div className="bg-[#3e3e3e] p-4 rounded-lg">
                
                <Certificates hideLayout />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MobileLayout>;
};
export default Education;