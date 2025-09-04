import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Car,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos para los datos del vehículo
interface Vehicle {
  id: string;
  license_plate: string;
  description: string;
  capacity: number;
  status: 'disponible' | 'en_viaje' | 'en_mantenimiento' | 'inactivo';
  assigned_dirigente_id?: string;
  assigned_dirigente_name?: string;
  created_at: string;
}

// Tipos para los datos del dirigente
interface Dirigente {
  id: string;
  full_name: string;
  dni: string | null;
  operating_barrio: string | null;
}

const FleetPage = () => {
  const { profile } = useAuth();
  const { showError, showSuccess } = useNotifier();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dirigentes, setDirigentes] = useState<Dirigente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    license_plate: '',
    description: '',
    capacity: '',
    status: 'disponible' as 'disponible' | 'en_viaje' | 'en_mantenimiento' | 'inactivo',
    assigned_dirigente_id: ''
  });

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para descargar la plantilla de ejemplo
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        license_plate: 'ABC123',
        description: 'Toyota Hilux 2020',
        capacity: 5
      },
      {
        license_plate: 'DEF456',
        description: 'VW Amarok 2019',
        capacity: 6
      }
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehículos');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'plantilla_vehiculos.xlsx');
  };

  // Función para manejar la subida del archivo Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    setIsImporting(true);
    setImportErrors([]);

    try {
      // Leer el archivo Excel
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validar y procesar los datos
          const processedData = validateAndProcessExcelData(jsonData);
          
          if (processedData.errors.length > 0) {
            setImportErrors(processedData.errors);
            toast.error(`Se encontraron ${processedData.errors.length} errores en el archivo`);
          } else {
            // Llamar a la Edge Function para importar los datos
            await importVehicles(processedData.validData);
            toast.success('Vehículos importados exitosamente');
            setIsImportDialogOpen(false);
            loadVehicles();
          }
        } catch (error) {
          console.error('Error procesando el archivo:', error);
          showError('Error al procesar el archivo Excel');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      showError('Error al subir el archivo');
      setIsImporting(false);
    }
  };

  // Función para validar y procesar los datos del Excel
  const validateAndProcessExcelData = (data: any[]) => {
    const validData = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 porque la fila 1 es el encabezado y los arrays son 0-indexed

      // Validar campos requeridos
      if (!row.license_plate || !row.license_plate.toString().trim()) {
        errors.push(`Fila ${rowNum}: La patente es requerida`);
        continue;
      }

      // Validar formato de patente
      const licensePlate = row.license_plate.toString().trim().toUpperCase();
      if (!/^[A-Z0-9]{3,6}$/.test(licensePlate)) {
        errors.push(`Fila ${rowNum}: Formato de patente inválido (ej: ABC123)`);
        continue;
      }

      // Validar capacidad
      const capacity = parseInt(row.capacity);
      if (isNaN(capacity) || capacity < 1) {
        errors.push(`Fila ${rowNum}: La capacidad debe ser un número mayor a 0`);
        continue;
      }

      // Validar descripción
      if (!row.description || !row.description.toString().trim()) {
        errors.push(`Fila ${rowNum}: La descripción es requerida`);
        continue;
      }

      // Si todo es válido, agregar a los datos válidos
      validData.push({
        license_plate: licensePlate,
        description: row.description.toString().trim(),
        capacity: capacity
      });
    }

    return { validData, errors };
  };

  // Función para importar vehículos usando la Edge Function
  const importVehicles = async (vehicles: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-import-vehicles', {
        body: { vehicles }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.errors && data.errors.length > 0) {
        setImportErrors(data.errors);
        throw new Error('Algunos vehículos no pudieron ser importados');
      }

      toast.success(`${data.importedCount} vehículos importados exitosamente`);
    } catch (error) {
      console.error('Error importando vehículos:', error);
      showError('Error al importar vehículos');
      throw error;
    }
  };

  // Cargar dirigentes disponibles
  const loadDirigentes = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, dni, operating_barrio')
        .eq('organization_id', profile?.organization_id)
        .eq('role', 'dirigente')
        .order('full_name');

      if (error) {
        throw error;
      }

      setDirigentes(data || []);
    } catch (error) {
      console.error('Error cargando dirigentes:', error);
      showError('Error al cargar los dirigentes');
    }
  };

  // Cargar vehículos desde Supabase
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          assigned_dirigente:profiles!assigned_dirigente_id (
            full_name
          )
        `)
        .eq('organization_id', profile?.organization_id);

      if (error) {
        throw error;
      }

      // Mapear los datos para incluir el nombre del dirigente asignado
      const vehiclesWithDirigente = data.map(vehicle => ({
        ...vehicle,
        assigned_dirigente_name: vehicle.assigned_dirigente?.full_name || null
      }));

      setVehicles(vehiclesWithDirigente);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
      showError('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vehículos
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Manejar cambios en el formulario
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      const vehicleData = {
        license_plate: formData.license_plate,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        organization_id: profile?.organization_id,
        assigned_dirigente_id: formData.assigned_dirigente_id || null
      };

      if (isEdit && editingVehicle) {
        // Actualizar vehículo
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) {
          throw error;
        }

        toast.success('Vehículo actualizado exitosamente');
      } else {
        // Insertar nuevo vehículo
        const { error } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (error) {
          throw error;
        }

        toast.success('Vehículo agregado exitosamente');
      }

      // Resetear formulario y cerrar diálogo
      setFormData({
        license_plate: '',
        description: '',
        capacity: '',
        status: 'disponible',
        assigned_dirigente_id: ''
      });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      
      // Recargar la lista de vehículos
      loadVehicles();
    } catch (error: any) {
      console.error('Error guardando vehículo:', error);
      showError(error.message || 'Error al guardar el vehículo');
    }
  };

  // Manejar eliminación de vehículo
  const handleDelete = async (vehicleId: string) => {
    try {
      // Aquí iría la llamada a Supabase para eliminar el vehículo
      // await supabase.from('vehicles').delete().eq('id', vehicleId);
      toast.success('Vehículo eliminado exitosamente');
      loadVehicles();
    } catch (error) {
      showError('Error al eliminar el vehículo');
    }
  };

  // Manejar edición de vehículo
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      license_plate: vehicle.license_plate,
      description: vehicle.description,
      capacity: vehicle.capacity.toString(),
      status: vehicle.status as 'disponible' | 'en_viaje' | 'en_mantenimiento' | 'inactivo',
      assigned_dirigente_id: vehicle.assigned_dirigente_id || ''
    });
    setIsEditDialogOpen(true);
  };

  // Obtener color para el badge de estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'default';
      case 'en_viaje':
        return 'secondary';
      case 'en_mantenimiento':
        return 'destructive';
      case 'inactivo':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Obtener texto para el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'en_viaje':
        return 'En Viaje';
      case 'en_mantenimiento':
        return 'Mantenimiento';
      case 'inactivo':
        return 'Inactivo';
      default:
        return status;
    }
  };

  // Cargar datos al montar el componente
  useState(() => {
    loadVehicles();
    loadDirigentes();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold">Gestión de Flota Vehicular</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar desde Excel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Vehículo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por patente o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="en_viaje">En Viaje</SelectItem>
                <SelectItem value="en_mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla de Vehículos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vehículos</CardTitle>
            <CardDescription>
              Gestiona la flota vehicular de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Dirigente Asignado</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.license_plate}
                      </TableCell>
                      <TableCell>{vehicle.description}</TableCell>
                      <TableCell>{vehicle.capacity} pasajeros</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                          {getStatusText(vehicle.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.assigned_dirigente_name || 'Sin asignar'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(vehicle.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredVehicles.length === 0 && (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No se encontraron vehículos' : 'No hay vehículos en la flota'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar tus filtros o términos de búsqueda.'
                    : '¡Agrega el primero para comenzar a gestionar tu flota!'
                  }
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Vehículo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal Agregar Vehículo */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo vehículo para agregarlo a la flota.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="license_plate" className="text-right">
                Patente
              </Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                onChange={(e) => handleFormChange('license_plate', e.target.value)}
                placeholder="ABC123"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Modelo, marca, color"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacidad
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleFormChange('capacity', e.target.value)}
                placeholder="5"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_viaje">En Viaje</SelectItem>
                  <SelectItem value="en_mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => handleSubmit()}>
              Agregar Vehículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Vehículo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>
              Modifica la información del vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_license_plate" className="text-right">
                Patente
              </Label>
              <Input
                id="edit_license_plate"
                value={formData.license_plate}
                onChange={(e) => handleFormChange('license_plate', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_description" className="text-right">
                Descripción
              </Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_capacity" className="text-right">
                Capacidad
              </Label>
              <Input
                id="edit_capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleFormChange('capacity', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_status" className="text-right">
                Estado
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_viaje">En Viaje</SelectItem>
                  <SelectItem value="en_mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => handleSubmit(true)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Importar desde Excel */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Importar Vehículos desde Excel</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel con los vehículos que deseas importar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {/* Área de arrastre y clic */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Haz clic para seleccionar un archivo o arrástralo aquí
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato: .xlsx o .xls (máximo 10MB)
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla
              </Button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Columnas requeridas: license_plate, description, capacity</span>
              </div>
            </div>

            {/* Indicador de carga */}
            {isImporting && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span>Procesando archivo...</span>
              </div>
            )}

            {/* Mostrar errores de importación */}
            {importErrors.length > 0 && (
              <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                <h4 className="text-sm font-medium text-destructive mb-2">
                  Errores encontrados ({importErrors.length}):
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importErrors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              {importErrors.length > 0 ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!isImporting && importErrors.length === 0 && (
              <Button onClick={() => fileInputRef.current?.click()}>
                Seleccionar Archivo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetPage;