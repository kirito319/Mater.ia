import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit3, GripVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Module {
  id: string;
  course_id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  slides_count?: number;
}

interface ModuleManagerProps {
  courseId: string;
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string | null) => void;
  onModulesUpdate: () => void;
}

export const ModuleManager = ({ 
  courseId, 
  selectedModuleId, 
  onSelectModule, 
  onModulesUpdate 
}: ModuleManagerProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [newModule, setNewModule] = useState({ titulo: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_slides(count)
        `)
        .eq('course_id', courseId)
        .order('orden');

      if (error) throw error;

      const modulesWithCount = data?.map(module => ({
        ...module,
        slides_count: module.course_slides?.[0]?.count || 0
      })) || [];

      setModules(modulesWithCount);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los módulos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createModule = async () => {
    if (!newModule.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título del módulo es requerido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextOrder = modules.length + 1;
      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          titulo: newModule.titulo,
          descripcion: newModule.descripcion,
          orden: nextOrder
        })
        .select()
        .single();

      if (error) throw error;

      setNewModule({ titulo: '', descripcion: '' });
      setShowCreateForm(false);
      await fetchModules();
      onModulesUpdate();
      
      toast({
        title: "¡Módulo creado!",
        description: "El nuevo módulo se ha creado correctamente.",
      });
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el módulo.",
        variant: "destructive",
      });
    }
  };

  const updateModule = async (module: Module) => {
    try {
      const { error } = await supabase
        .from('course_modules')
        .update({
          titulo: module.titulo,
          descripcion: module.descripcion
        })
        .eq('id', module.id);

      if (error) throw error;

      setEditingModule(null);
      await fetchModules();
      onModulesUpdate();
      
      toast({
        title: "¡Módulo actualizado!",
        description: "El módulo se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el módulo.",
        variant: "destructive",
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      // First delete all slides in this module
      const { error: slidesError } = await supabase
        .from('course_slides')
        .delete()
        .eq('module_id', moduleId);

      if (slidesError) throw slidesError;

      // Then delete the module
      const { error: moduleError } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId);

      if (moduleError) throw moduleError;

      // Clear selection if deleted module was selected
      if (selectedModuleId === moduleId) {
        onSelectModule(null);
      }

      await fetchModules();
      onModulesUpdate();
      
      toast({
        title: "¡Módulo eliminado!",
        description: "El módulo y todo su contenido se han eliminado.",
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el módulo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-pixel-light shadow-xl mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-pixel-dark">Gestión de Módulos</CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="bg-pixel-orange hover:bg-pixel-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Módulo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Module Selector */}
        <div>
          <Label>Módulo Activo</Label>
          <Select value={selectedModuleId || ""} onValueChange={onSelectModule}>
            <SelectTrigger className="bg-white border-pixel-light">
              <SelectValue placeholder="Selecciona un módulo para editar" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.titulo} ({module.slides_count} slides)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Module Form */}
        {showCreateForm && (
          <Card className="border-pixel-orange bg-pixel-light/10">
            <CardHeader>
              <CardTitle className="text-lg">Crear Nuevo Módulo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-module-title">Título del Módulo</Label>
                <Input
                  id="new-module-title"
                  value={newModule.titulo}
                  onChange={(e) => setNewModule(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Introducción al Tema"
                  className="bg-white border-pixel-light"
                />
              </div>
              <div>
                <Label htmlFor="new-module-description">Descripción</Label>
                <Textarea
                  id="new-module-description"
                  value={newModule.descripcion}
                  onChange={(e) => setNewModule(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el contenido de este módulo..."
                  className="bg-white border-pixel-light"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={createModule} className="bg-pixel-orange hover:bg-pixel-dark text-white">
                  Crear Módulo
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules List */}
        <div className="space-y-2">
          <Label>Módulos Existentes</Label>
          {modules.map((module) => (
            <div
              key={module.id}
              className={`p-4 border rounded-lg transition-colors ${
                selectedModuleId === module.id 
                  ? 'border-pixel-orange bg-pixel-orange/10' 
                  : 'border-pixel-light bg-white/50'
              }`}
            >
              {editingModule?.id === module.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingModule.titulo}
                    onChange={(e) => setEditingModule({ ...editingModule, titulo: e.target.value })}
                    className="bg-white border-pixel-light"
                  />
                  <Textarea
                    value={editingModule.descripcion}
                    onChange={(e) => setEditingModule({ ...editingModule, descripcion: e.target.value })}
                    className="bg-white border-pixel-light"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateModule(editingModule)}
                      className="bg-pixel-orange hover:bg-pixel-dark text-white"
                    >
                      Guardar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingModule(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-pixel-dark">{module.titulo}</h4>
                    <p className="text-sm text-gray-600">{module.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {module.slides_count} slides • Orden: {module.orden}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectModule(module.id)}
                      className={selectedModuleId === module.id ? 'bg-pixel-orange text-white' : ''}
                    >
                      {selectedModuleId === module.id ? 'Activo' : 'Editar Slides'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingModule(module)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el módulo "{module.titulo}" y todos sus slides.
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteModule(module.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};