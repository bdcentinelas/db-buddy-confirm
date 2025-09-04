import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createOpenAI } from 'https://esm.sh/@ai-sdk/openai@1.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ElectoralAssistantRequest {
  question: string
}

serve(async (req) => {
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase con service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el cuerpo de la solicitud
    const { question }: ElectoralAssistantRequest = await req.json()

    // Validar que se recibió una pregunta
    if (!question || !question.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'La pregunta es requerida',
          errors: ['El cuerpo de la solicitud debe contener un campo "question" con el texto de la consulta']
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validar que el usuario que invoca la función está autenticado
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado: se requiere un token de autenticación' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado: token inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verificar que el usuario tiene rol de admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'No autorizado: se requieren permisos de administrador' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Obtener contexto de la base de datos
    const organizationId = profile.organization_id

    // Obtener datos de votantes movilizados
    const { data: voters, error: votersError } = await supabase
      .from('mobilized_voters')
      .select('*')
      .eq('organization_id', organizationId)

    if (votersError) {
      console.error('Error al obtener votantes:', votersError)
      return new Response(
        JSON.stringify({ error: 'Error al obtener datos de votantes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Obtener datos de dirigentes
    const { data: dirigentes, error: dirigentesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('role', 'dirigente')

    if (dirigentesError) {
      console.error('Error al obtener dirigentes:', dirigentesError)
      return new Response(
        JSON.stringify({ error: 'Error al obtener datos de dirigentes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Obtener datos de vehículos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('organization_id', organizationId)

    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError)
      return new Response(
        JSON.stringify({ error: 'Error al obtener datos de vehículos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Construir contexto para la IA
    const totalVoters = voters?.length || 0
    const totalDirigentes = dirigentes?.length || 0
    const totalVehicles = vehicles?.length || 0

    // Calcular rendimiento por dirigente
    const dirigentePerformance = dirigentes?.map(dirigente => {
      const dirigenteVoters = voters?.filter(voter => voter.registered_by_dirigente_id === dirigente.id) || []
      return {
        name: dirigente.full_name,
        voters_count: dirigenteVoters.length,
        dni: dirigente.dni,
        operating_barrio: dirigente.operating_barrio || 'No especificado'
      }
    }) || []

    // Contar vehículos por estado
    const vehiclesByStatus = vehicles?.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Construir el prompt para la IA
    const context = `
Contexto actual de la movilización electoral:

Datos generales:
- Total de votantes movilizados: ${totalVoters}
- Total de dirigentes activos: ${totalDirigentes}
- Total de vehículos en flota: ${totalVehicles}

Rendimiento por dirigente:
${dirigentePerformance.map(d => `- ${d.name} (${d.dni}): ${d.voters_count} votantes, barrio: ${d.operating_barrio}`).join('\n')}

Estado de la flota vehicular:
${Object.entries(vehiclesByStatus).map(([status, count]) => `- ${status}: ${count} vehículos`).join('\n')}

Preguntas frecuentes y datos relevantes:
- Los dirigentes están operando principalmente en los barrios: ${[...new Set(dirigentePerformance.map(d => d.operating_barrio))].join(', ')}
- El promedio de votantes por dirigente es: ${totalDirigentes > 0 ? Math.round(totalVoters / totalDirigentes) : 0}
- Disponibilidad de vehículos: ${vehiclesByStatus.disponible || 0} disponibles de ${totalVehicles} totales
`

    const prompt = `
Eres un asistente experto en análisis de datos electorales. Tu tarea es responder preguntas sobre la movilización electoral basándote únicamente en los datos proporcionados.

${context}

Pregunta del usuario: "${question}"

Por favor, proporciona una respuesta clara, concisa y basada únicamente en los datos anteriores. Si la pregunta no puede responderse con los datos disponibles, indícalo amablemente y sugiere qué información adicional podría ser útil.

Formato de respuesta:
- Respuesta directa a la pregunta
- Datos relevantes que respaldan tu respuesta
- Si aplica, recomendaciones o insights basados en los datos
`

    // Crear cliente de DeepSeek usando la API Key segura
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY no configurada')
      return new Response(
        JSON.stringify({ error: 'Error de configuración: API key de IA no disponible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Usar OpenAI-compatible client para DeepSeek
    const deepseek = createOpenAI({
      apiKey: deepseekApiKey,
      baseURL: 'https://api.deepseek.com/v1'
    })

    // Llamar a la API de DeepSeek
    const startTime = Date.now()
    const { choices } = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en análisis de datos electorales. Proporciona respuestas basadas únicamente en los datos proporcionados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })

    const responseTime = Date.now() - startTime

    const answer = choices[0]?.message?.content || 'No pude generar una respuesta'

    // Devolver respuesta exitosa
    return new Response(
      JSON.stringify({ 
        answer,
        response_time_ms: responseTime,
        data_context: {
          total_voters: totalVoters,
          total_dirigentes: totalDirigentes,
          total_vehicles: totalVehicles,
          dirigente_performance: dirigentePerformance,
          vehicles_by_status: vehiclesByStatus
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en la función ask-electoral-assistant:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        errors: [error.message]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})