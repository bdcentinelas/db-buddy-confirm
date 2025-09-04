-- Crear tipos ENUM para roles de usuario y estados de vehículo
CREATE TYPE user_role AS ENUM ('admin', 'dirigente', 'superadmin');
CREATE TYPE vehicle_status AS ENUM ('disponible', 'en_viaje', 'en_mantenimiento', 'inactivo');

-- Crear tabla organizations (tenants)
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla profiles (extensión de auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    dni TEXT UNIQUE,
    address TEXT,
    operating_barrio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla vehicles (flota vehicular)
CREATE TABLE public.vehicles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    assigned_dirigente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    license_plate TEXT NOT NULL UNIQUE,
    description TEXT,
    capacity INTEGER,
    status vehicle_status NOT NULL DEFAULT 'disponible',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla mobilized_voters (votantes movilizados)
CREATE TABLE public.mobilized_voters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    registered_by_dirigente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    phone TEXT,
    destination_school TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Crear trigger para actualizar updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Función para manejar nuevos usuarios registrados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Los nuevos usuarios deben ser asignados a una organización por un admin
    -- Por ahora, se creará sin organization_id y role, que será asignado después
    INSERT INTO public.profiles (id, organization_id, role, full_name)
    VALUES (
        NEW.id,
        -- Temporalmente NULL hasta que un admin asigne la organización
        COALESCE((NEW.raw_user_meta_data ->> 'organization_id')::UUID, gen_random_uuid()),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'dirigente'::user_role),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Crear trigger para manejar nuevos usuarios
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobilized_voters ENABLE ROW LEVEL SECURITY;

-- Crear función de seguridad para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Crear función de seguridad para obtener la organization_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- ======= POLÍTICAS RLS PARA ORGANIZATIONS =======
-- Solo superadmins pueden ver todas las organizaciones
CREATE POLICY "Superadmins can view all organizations"
    ON public.organizations FOR SELECT
    USING (public.get_current_user_role() = 'superadmin');

-- Admins pueden ver solo su organización
CREATE POLICY "Admins can view their organization"
    ON public.organizations FOR SELECT
    USING (id = public.get_current_user_organization_id());

-- Solo superadmins pueden crear organizaciones
CREATE POLICY "Superadmins can create organizations"
    ON public.organizations FOR INSERT
    WITH CHECK (public.get_current_user_role() = 'superadmin');

-- ======= POLÍTICAS RLS PARA PROFILES =======
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins pueden ver todos los perfiles de su organización
CREATE POLICY "Admins can view organization profiles"
    ON public.profiles FOR SELECT
    USING (
        public.get_current_user_role() = 'admin' 
        AND organization_id = public.get_current_user_organization_id()
    );

-- Superadmins pueden ver todos los perfiles
CREATE POLICY "Superadmins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.get_current_user_role() = 'superadmin');

-- Admins pueden crear perfiles (dirigentes) en su organización
CREATE POLICY "Admins can create dirigentes in their organization"
    ON public.profiles FOR INSERT
    WITH CHECK (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
        AND role = 'dirigente'
    );

-- Superadmins pueden crear cualquier perfil
CREATE POLICY "Superadmins can create any profile"
    ON public.profiles FOR INSERT
    WITH CHECK (public.get_current_user_role() = 'superadmin');

-- Los usuarios pueden actualizar su propio perfil (campos limitados)
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins pueden actualizar perfiles de su organización
CREATE POLICY "Admins can update organization profiles"
    ON public.profiles FOR UPDATE
    USING (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );

-- ======= POLÍTICAS RLS PARA VEHICLES =======
-- Dirigentes pueden ver solo los vehículos asignados a ellos
CREATE POLICY "Dirigentes can view assigned vehicles"
    ON public.vehicles FOR SELECT
    USING (
        public.get_current_user_role() = 'dirigente'
        AND assigned_dirigente_id = auth.uid()
    );

-- Admins pueden ver todos los vehículos de su organización
CREATE POLICY "Admins can view organization vehicles"
    ON public.vehicles FOR SELECT
    USING (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );

-- Admins pueden crear vehículos en su organización
CREATE POLICY "Admins can create vehicles in their organization"
    ON public.vehicles FOR INSERT
    WITH CHECK (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );

-- Dirigentes pueden actualizar el estado de sus vehículos asignados
CREATE POLICY "Dirigentes can update their assigned vehicles status"
    ON public.vehicles FOR UPDATE
    USING (
        public.get_current_user_role() = 'dirigente'
        AND assigned_dirigente_id = auth.uid()
    );

-- Admins pueden actualizar todos los vehículos de su organización
CREATE POLICY "Admins can update organization vehicles"
    ON public.vehicles FOR UPDATE
    USING (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );

-- ======= POLÍTICAS RLS PARA MOBILIZED_VOTERS =======
-- Dirigentes pueden ver solo los votantes que ellos registraron
CREATE POLICY "Dirigentes can view their registered voters"
    ON public.mobilized_voters FOR SELECT
    USING (
        public.get_current_user_role() = 'dirigente'
        AND registered_by_dirigente_id = auth.uid()
    );

-- Admins pueden ver todos los votantes de su organización
CREATE POLICY "Admins can view organization voters"
    ON public.mobilized_voters FOR SELECT
    USING (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );

-- Dirigentes pueden registrar nuevos votantes en su organización
CREATE POLICY "Dirigentes can register voters in their organization"
    ON public.mobilized_voters FOR INSERT
    WITH CHECK (
        public.get_current_user_role() = 'dirigente'
        AND organization_id = public.get_current_user_organization_id()
        AND registered_by_dirigente_id = auth.uid()
    );

-- Dirigentes pueden actualizar los votantes que ellos registraron
CREATE POLICY "Dirigentes can update their registered voters"
    ON public.mobilized_voters FOR UPDATE
    USING (
        public.get_current_user_role() = 'dirigente'
        AND registered_by_dirigente_id = auth.uid()
    );

-- Admins pueden actualizar todos los votantes de su organización
CREATE POLICY "Admins can update organization voters"
    ON public.mobilized_voters FOR UPDATE
    USING (
        public.get_current_user_role() = 'admin'
        AND organization_id = public.get_current_user_organization_id()
    );