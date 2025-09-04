import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Car, Vote, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'dirigente':
        return 'secondary';
      case 'superadmin':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'dirigente':
        return 'Dirigente';
      case 'superadmin':
        return 'Superadministrador';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Vote className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold">Sistema de Movilización Electoral</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <Badge variant={getRoleBadgeVariant(profile?.role || '')}>
                  {getRoleDisplayName(profile?.role || '')}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido, {profile?.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Dashboard principal del sistema de gestión electoral
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Votantes Movilizados</CardTitle>
              <Vote className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% desde ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dirigentes Activos</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">En la organización</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehículos Disponibles</CardTitle>
              <Car className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">De la flota total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Sistema operativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific sections */}
        {profile?.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Dirigentes</CardTitle>
                <CardDescription>
                  Administra los dirigentes de tu organización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar Dirigentes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de Flota</CardTitle>
                <CardDescription>
                  Administra los vehículos y asignaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Car className="w-4 h-4 mr-2" />
                  Gestionar Vehículos
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {profile?.role === 'dirigente' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Votante</CardTitle>
                <CardDescription>
                  Registra rápidamente un nuevo votante movilizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Vote className="w-4 h-4 mr-2" />
                  Nuevo Registro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mis Vehículos</CardTitle>
                <CardDescription>
                  Gestiona el estado de tus vehículos asignados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Ver Vehículos
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {profile?.role === 'superadmin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Organizaciones</CardTitle>
                <CardDescription>
                  Administra los tenants del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Gestionar Tenants
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Globales</CardTitle>
                <CardDescription>
                  Monitorea el rendimiento del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Ver Métricas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configuraciones avanzadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;