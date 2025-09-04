import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotifier } from '@/hooks/useNotifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos para los datos del dirigente
interface Dirigente {
  id: string;
  full_name: string;
  dni: string | null;
  address: string | null;
  operating_barrio: string | null;
  role: 'dirigente' | 'admin' | 'superadmin';
  vehicles_count: number;
  created_at: string;
}

const DirigentesPage = () => {
  const { profile } = useAuth();
  const { showError, showSuccess } = useNotifier();
  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDirigente, setEditingDirigente] = useState<Dirigente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state para nuevo dirigente
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    dni: '',
    address: '',
    operating_barrio: ''
  });

  // Form state para edición
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    dni: '',
    address: '',
    operating_barrio: ''
  });

  // Cargar dirigentes desde Supabase
  const loadDirigentes = async () => {
    setLoading(true);
    try {
      // Primero obtener los dirigentes
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .eq('role', 'dirigente')
        .order('full_name');

      if (profilesError) {
        throw profilesError;
      }

      // Luego obtener el contador de vehículos para cada dirigente
      const dirigentesWithCount = await Promise.all(
        (profilesData || []).map(async (dirigente) => {
          const { count, error: countError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_dirigente_id', dirigente.id);

          if (countError) {
            console.error('Error contando vehículos:', countError);
            return { ...dirigente, vehicles_count: 0 };
          }

          return { ...dirigente, vehicles_count: count || 0 };
        })
      );

      setDirigentes(dirigentesWithCount);
    } catch (error) {
      console.error('Error cargando dirigentes:', error);
      showError('Error al cargar los dirigentes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar dirigentes
  const filteredDirigentes = dirigentes.filter(dirigente => {
    const matchesSearch = dirigente.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dirigente.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dirigente.operating_barrio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Manejar cambios en el formulario de nuevo dirigente
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar envío del formulario de nuevo dirigente
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validar campos requeridos
      if (!formData.full_name || !formData.email || !formData.password || !formData.dni || !formData.operating_barrio) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Formato de email inválido');
        return;
      }

      // Validar formato de DNI (solo números)
      if (!/^\d+$/.test(formData.dni)) {
        toast.error('El DNI debe contener solo números');
        return;
      }

      // Llamar a la Edge Function para crear el dirigente
      const { data, error } = await supabase.functions.invoke('create-dirigente', {
        body: {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          dni: formData.dni,
          address: formData.address,
          operating_barrio: formData.operating_barrio,
          organization_id: profile?.organization_id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      showSuccess('Dirigente creado exitosamente');
      
      // Resetear formulario y cerrar diálogo
      setFormData({
        full_name: '',
        email: '',
        password: '',
        dni: '',
        address: '',
        operating_barrio: ''
      });
      setIsAddDialogOpen(false);
      
      // Recargar la lista de dirigentes
      loadDirigentes();
    } catch (error: any) {
      console.error('Error creando dirigente:', error);
      showError(error.message || 'Error al crear el dirigente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición de dirigente
  const handleEdit = (dirigente: Dirigente) => {
    setEditingDirigente(dirigente);
    setEditFormData({
      full_name: dirigente.full_name,
      dni: dirigente.dni,
      address: dirigente.address || '',
      operating_barrio: dirigente.operating_barrio || ''
    });
    setIsEditDialogOpen(true);
  };

  // Manejar actualización de dirigente
  const handleUpdate = async () => {
    if (!editingDirigente) return;

    try {
      // Validar campos requeridos
      if (!editFormData.full_name || !editFormData.dni || !editFormData.operating_barrio) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      // Validar formato de DNI (solo números)
      if (!/^\d+$/.test(editFormData.dni)) {
        toast.error('El DNI debe contener solo números');
        return;
      }

      // Actualizar el dirigente
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          dni: editFormData.dni,
          address: editFormData.address,
          operating_barrio: editFormData.operating_barrio
        })
        .eq('id', editingDirigente.id);

      if (error) {
        throw error;
      }

      showSuccess('Dirigente actualizado exitosamente');
      
      // Cerrar diálogo y recargar datos
      setIsEditDialogOpen(false);
      setEditingDirigente(null);
      loadDirigentes();
    } catch (error: any) {
      console.error('Error actualizando dirigente:', error);
      showError(error.message || 'Error al actualizar el dirigente');
    }
  };

  // Manejar eliminación de dirigente
  const handleDelete = async (dirigenteId: string) => {
    try {
      // Verificar si el dirigente tiene vehículos asignados
      const dirigente = dirigentes.find(d => d.id === dirigenteId);
      if (dirigente && dirigente.vehicles_count > 0) {
        toast.error('No se puede eliminar un dirigente con vehículos asignados');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', dirigenteId);

      if (error) {
        throw error;
      }

      showSuccess('Dirigente eliminado exitosamente');
      loadDirigentes();
    } catch (error: any) {
      console.error('Error eliminando dirigente:', error);
      showError(error.message || 'Error al eliminar el dirigente');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDirigentes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold">Gestión de Dirigentes</h1>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Nuevo Dirigente
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, DNI o barrio de operación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabla de Dirigentes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Dirigentes</CardTitle>
            <CardDescription>
              Gestiona los perfiles de dirigentes de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Barrio de Operación</TableHead>
                    <TableHead>Vehículos Asignados</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDirigentes.map((dirigente) => (
                    <TableRow key={dirigente.id}>
                      <TableCell className="font-medium">
                        {dirigente.full_name}
                      </TableCell>
                      <TableCell>{dirigente.dni}</TableCell>
                      <TableCell>{dirigente.operating_barrio}</TableCell>
                      <TableCell>
                        <Badge variant={dirigente.vehicles_count > 0 ? 'default' : 'secondary'}>
                          {dirigente.vehicles_count} {dirigente.vehicles_count === 1 ? 'vehículo' : 'vehículos'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dirigente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dirigente.id)}
                            disabled={dirigente.vehicles_count > 0}
                            className={dirigente.vehicles_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredDirigentes.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No se encontraron dirigentes' : 'No hay dirigentes registrados'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Intenta ajustar tus términos de búsqueda.'
                    : '¡Crea el primer dirigente para comenzar a gestionar tu equipo!'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nuevo Dirigente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal Crear Nuevo Dirigente */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Dirigente</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo dirigente para agregarlo a tu organización.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nombre Completo *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleFormChange('full_name', e.target.value)}
                placeholder="Juan Pérez"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="juan.perez@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                placeholder="••••••••"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dni" className="text-right">
                DNI *
              </Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => handleFormChange('dni', e.target.value)}
                placeholder="12345678"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Dirección
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="Calle Falsa 123"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operating_barrio" className="text-right">
                Barrio de Operación *
              </Label>
              <Input
                id="operating_barrio"
                value={formData.operating_barrio}
                onChange={(e) => handleFormChange('operating_barrio', e.target.value)}
                placeholder="Centro"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Dirigente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Dirigente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Dirigente</DialogTitle>
            <DialogDescription>
              Modifica la información del dirigente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_full_name" className="text-right">
                Nombre Completo *
              </Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => handleEditFormChange('full_name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_dni" className="text-right">
                DNI *
              </Label>
              <Input
                id="edit_dni"
                value={editFormData.dni}
                onChange={(e) => handleEditFormChange('dni', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_address" className="text-right">
                Dirección
              </Label>
              <Input
                id="edit_address"
                value={editFormData.address}
                onChange={(e) => handleEditFormChange('address', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_operating_barrio" className="text-right">
                Barrio de Operación *
              </Label>
              <Input
                id="edit_operating_barrio"
                value={editFormData.operating_barrio}
                onChange={(e) => handleEditFormChange('operating_barrio', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdate}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirigentesPage;