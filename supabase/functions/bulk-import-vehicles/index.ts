import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VehicleData {
  license_plate: string
  description: string
  capacity: number
}

interface BulkImportRequest {
  vehicles: VehicleData[]
}

serve(async (req) => {
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el cuerpo de la solicitud
    const { vehicles }: BulkImportRequest = await req.json()

    // Validar que se recibieron vehículos
    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No se recibieron vehículos para importar',
          errors: ['El cuerpo de la solicitud debe contener un array de vehículos']
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validar y procesar cada vehículo
    const validatedVehicles: VehicleData[] = []
    const errors: string[] = []

    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i]
      const rowNum = i + 2 // +2 porque la fila 1 es el encabezado

      // Validar campos requeridos
      if (!vehicle.license_plate || !vehicle.license_plate.toString().trim()) {
        errors.push(`Fila ${rowNum}: La patente es requerida`)
        continue
      }

      // Validar formato de patente
      const licensePlate = vehicle.license_plate.toString().trim().toUpperCase()
      if (!/^[A-Z0-9]{3,6}$/.test(licensePlate)) {
        errors.push(`Fila ${rowNum}: Formato de patente inválido (ej: ABC123)`)
        continue
      }

      // Validar capacidad
      const capacity = parseInt(vehicle.capacity.toString())
      if (isNaN(capacity) || capacity < 1) {
        errors.push(`Fila ${rowNum}: La capacidad debe ser un número mayor a 0`)
        continue
      }

      // Validar descripción
      if (!vehicle.description || !vehicle.description.toString().trim()) {
        errors.push(`Fila ${rowNum}: La descripción es requerida`)
        continue
      }

      // Verificar si la patente ya existe en la base de datos
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('license_plate', licensePlate)
        .single()

      if (existingVehicle) {
        errors.push(`Fila ${rowNum}: La patente ${licensePlate} ya existe en la base de datos`)
        continue
      }

      // Si todo es válido, agregar a los datos válidos
      validatedVehicles.push({
        license_plate: licensePlate,
        description: vehicle.description.toString().trim(),
        capacity: capacity
      })
    }

    // Si hay errores, devolverlos
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Se encontraron errores en los datos',
          errors,
          importedCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Insertar los vehículos validados en la base de datos
    const { data, error: insertError } = await supabase
      .from('vehicles')
      .insert(validatedVehicles.map(vehicle => ({
        ...vehicle,
        status: 'disponible' as const,
        organization_id: 'organization-id-placeholder' // Esto se obtendría del contexto de autenticación
      })))
      .select()

    if (insertError) {
      console.error('Error al insertar vehículos:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Error al insertar los vehículos en la base de datos',
          errors: [insertError.message],
          importedCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Devolver respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Se importaron ${validatedVehicles.length} vehículos exitosamente`,
        importedCount: validatedVehicles.length,
        importedVehicles: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en la función bulk-import-vehicles:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        errors: [error.message],
        importedCount: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})