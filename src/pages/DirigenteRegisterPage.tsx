import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DirigenteLayout from '@/components/DirigenteLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Esquema de validación con Zod
const voterSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es requerido'),
  dni: z.string().min(1, 'El DNI es requerido').regex(/^\d+$/, 'El DNI debe contener solo números'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  destination_school: z.string().min(1, 'La escuela de destino es requerida'),
});

type VoterFormData = z.infer<typeof voterSchema>;

const DirigenteRegisterPage: React.FC = () => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VoterFormData>({
    resolver: zodResolver(voterSchema),
    defaultValues: {
      full_name: '',
      dni: '',
      phone: '',
      destination_school: '',
    },
  });

  const onSubmit = async (data: VoterFormData) => {
    if (!profile) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('mobilized_voters')
        .insert({
          full_name: data.full_name,
          dni: data.dni,
          phone: data.phone,
          destination_school: data.destination_school,
          organization_id: profile.organization_id,
          registered_by_dirigente_id: profile.id,
        });

      if (error) {
        throw error;
      }

      // Mostrar notificación de éxito
      toast.success('Votante Registrado');
      
      // Limpiar el formulario automáticamente
      reset();
      
    } catch (error: unknown) {
      console.error('Error al registrar votante:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar votante';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DirigenteLayout>
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar Votante</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre Completo */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="full_name"
              {...register('full_name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Juan Pérez"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* DNI */}
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
              DNI *
            </label>
            <input
              type="tel"
              id="dni"
              {...register('dni')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="12345678"
              inputMode="numeric"
            />
            {errors.dni && (
              <p className="mt-1 text-sm text-red-600">{errors.dni.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="098765432"
              inputMode="numeric"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Escuela de Destino */}
          <div>
            <label htmlFor="destination_school" className="block text-sm font-medium text-gray-700 mb-2">
              Escuela de Destino *
            </label>
            <input
              type="text"
              id="destination_school"
              {...register('destination_school')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Escuela Central"
            />
            {errors.destination_school && (
              <p className="mt-1 text-sm text-red-600">{errors.destination_school.message}</p>
            )}
          </div>

          {/* Botón de envío fijo en la parte inferior */}
          <div className="fixed bottom-20 left-4 right-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Votante'}
            </button>
          </div>
        </form>
      </div>
    </DirigenteLayout>
  );
};

export default DirigenteRegisterPage;