-- Fix authentication flow issues

-- First, check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_org_id UUID := '00000000-0000-0000-0000-000000000000';
    user_org_id UUID;
    user_role_value user_role;
BEGIN
    -- Verificar si la organización especificada existe, sino usar la por defecto
    user_org_id := (NEW.raw_user_meta_data ->> 'organization_id')::UUID;
    
    IF user_org_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.organizations WHERE id = user_org_id
    ) THEN
        user_org_id := default_org_id;
    END IF;

    -- Determinar el rol del usuario
    user_role_value := COALESCE(
        (NEW.raw_user_meta_data ->> 'role')::user_role,
        'dirigente'::user_role
    );

    -- Insertar el perfil
    INSERT INTO public.profiles (id, organization_id, role, full_name)
    VALUES (
        NEW.id,
        user_org_id,
        user_role_value,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- En caso de error, intentar inserción mínima
        INSERT INTO public.profiles (id, organization_id, role, full_name)
        VALUES (
            NEW.id,
            default_org_id,
            'dirigente'::user_role,
            COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
        );
        RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure we have a default organization
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization')
ON CONFLICT (id) DO NOTHING;

-- Add a policy for the trigger to work properly (service role needs to insert into profiles)
DROP POLICY IF EXISTS "Service role can create profiles during signup" ON public.profiles;
CREATE POLICY "Service role can create profiles during signup"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);