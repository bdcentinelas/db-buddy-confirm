import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { full_name, email, password, dni, address, operating_barrio, organization_id } = await req.json()

    // Validar que el usuario que invoca la función es un ADMINISTRADOR autenticado
    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verificar que el usuario tiene rol de admin en la organización
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin' || profile.organization_id !== organization_id) {
      return new Response(
        JSON.stringify({ error: 'No autorizado: se requieren permisos de administrador' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Validar campos requeridos
    if (!full_name || !email || !password || !dni || !operating_barrio) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validar formato de DNI (solo números)
    if (!/^\d+$/.test(dni)) {
      return new Response(
        JSON.stringify({ error: 'El DNI debe contener solo números' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verificar si el email ya existe
    const { data: existingUser, error: existingUserError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (existingUser && existingUser.user) {
      return new Response(
        JSON.stringify({ error: 'El email ya está registrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verificar si el DNI ya existe
    const { data: existingDni, error: existingDniError } = await supabase
      .from('profiles')
      .select('dni')
      .eq('dni', dni)
      .eq('organization_id', organization_id)
      .single()

    if (existingDni) {
      return new Response(
        JSON.stringify({ error: 'El DNI ya está registrado en esta organización' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Crear el usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'No se pudo crear el usuario' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Crear el perfil del dirigente
    const { error: profileInsertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        dni,
        address,
        operating_barrio,
        organization_id,
        role: 'dirigente'
      })

    if (profileInsertError) {
      // Si falla la creación del perfil, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return new Response(
        JSON.stringify({ error: profileInsertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})