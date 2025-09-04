import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DirigenteLayout from '@/components/DirigenteLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotifier } from '@/hooks/useNotifier';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from 'lucide-react';

// Tipos de datos
type VehicleStatus = 'disponible' | 'en_viaje' | 'en_mantenimiento' | 'inactivo';

interface Vehicle {
  id: string;
  license_plate: string;
  description?: string;
  status: VehicleStatus;
  capacity?: number;
}

const DirigenteVehiclesPage: React.FC = () => {
  const { profile } = useAuth();
  const { showError } = useNotifier();
  const queryClient = useQueryClient();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Fetch vehicles assigned to the current dirigente
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-vehicles', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('assigned_dirigente_id', profile.id)
        .eq('organization_id', profile.organization_id);

      if (error) {
        throw error;
      }

      return data as Vehicle[];
    },
    enabled: !!profile,
  });

  // Update vehicle status mutation
  const updateVehicleStatus = useMutation({
    mutationFn: async ({ vehicleId, status }: { vehicleId: string; status: VehicleStatus }) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Estado del vehículo actualizado');
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el estado del vehículo';
      showError(errorMessage);
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setVehicles(data);
    }
  }, [data]);

  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    updateVehicleStatus.mutate({ vehicleId, status: newStatus });
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'en_viaje':
        return 'bg-blue-100 text-blue-800';
      case 'en_mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VehicleStatus) => {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'en_viaje':
        return 'En Viaje';
      case 'en_mantenimiento':
        return 'En Mantenimiento';
      case 'inactivo':
        return 'Inactivo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <DirigenteLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Vehículos</h1>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DirigenteLayout>
    );
  }

  if (error) {
    return (
      <DirigenteLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Vehículos</h1>
          <div className="text-center py-20">
            <p className="text-red-500">Error al cargar los vehículos</p>
          </div>
        </div>
      </DirigenteLayout>
    );
  }

  return (
    <DirigenteLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Vehículos</h1>
        
        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aún no tienes vehículos asignados</h3>
            <p className="text-muted-foreground mb-4">
              Contacta a tu administrador para que te asigne vehículos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    {vehicle.license_plate}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicle.description && (
                    <p className="text-gray-600">{vehicle.description}</p>
                  )}
                  
                  {vehicle.capacity && (
                    <p className="text-sm text-gray-500">
                      Capacidad: {vehicle.capacity} pasajeros
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Estado:
                    </span>
                    <Select
                      value={vehicle.status}
                      onValueChange={(newStatus) => 
                        handleStatusChange(vehicle.id, newStatus as VehicleStatus)
                      }
                      disabled={updateVehicleStatus.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="en_viaje">En Viaje</SelectItem>
                        <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Estado actual:
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DirigenteLayout>
  );
};

export default DirigenteVehiclesPage;