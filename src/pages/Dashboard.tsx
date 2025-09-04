import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { groupVotersByHour } from '@/lib/dashboardUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Car, Vote, Settings, LogOut, UserCheck, Activity, MapPin, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AIAssistantChat from '@/components/AIAssistantChat';

interface MobilizedVoter {
  id: string;
  full_name: string;
  dni: string;
  phone: string | null;
  destination_school: string | null;
  created_at: string;
  registered_by_dirigente_id: string;
}

interface Vehicle {
  id: string;
  license_plate: string;
  status: 'disponible' | 'en_viaje' | 'en_mantenimiento' | 'inactivo';
  assigned_dirigente_id: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
  operating_barrio: string | null;
}

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotifier();
  
  // Estados para los datos del dashboard
  const [totalVoters, setTotalVoters] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [activeDirigentes, setActiveDirigentes] = useState(0);
  const [votersByHour, setVotersByHour] = useState<{ hour: string; count: number }[]>([]);
  const [dirigentePerformance, setDirigentePerformance] = useState<{ name: string; count: number }[]>([]);
  const [coverageByBarrio, setCoverageByBarrio] = useState<{ barrio: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);

  // Función para obtener datos agregados
  const fetchDashboardData = async () => {
    if (!profile?.organization_id) return;

    try {
      // Total de votantes movilizados
      const { count: votersCount } = await supabase
        .from('mobilized_voters')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id);

      setTotalVoters(votersCount || 0);

      // Vehículos activos (en viaje)
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'en_viaje');

      setActiveVehicles(vehiclesData?.length || 0);

      // Dirigentes activos (registraron votantes en la última hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentVoters } = await supabase
        .from('mobilized_voters')
        .select('registered_by_dirigente_id')
        .eq('organization_id', profile.organization_id)
        .gte('created_at', oneHourAgo);

      const activeDirigenteIds = new Set(recentVoters?.map(v => v.registered_by_dirigente_id) || []);
      setActiveDirigentes(activeDirigenteIds.size);

      // Datos para gráfico de movilización por hora
      const { data: allVoters } = await supabase
        .from('mobilized_voters')
        .select('created_at')
        .eq('organization_id', profile.organization_id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const hourlyData = groupVotersByHour(allVoters || []);
      setVotersByHour(hourlyData);

      // Rendimiento por dirigente
      const { data: performanceData } = await supabase
        .from('mobilized_voters')
        .select(`
          registered_by_dirigente_id,
          profiles!inner (
            full_name
          )
        `)
        .eq('organization_id', profile.organization_id);

      const dirigenteCounts = new Map<string, string>();
      performanceData?.forEach(voter => {
        if (voter.profiles?.full_name) {
          dirigenteCounts.set(voter.registered_by_dirigente_id, voter.profiles.full_name);
        }
      });

      const performanceArray = Array.from(dirigenteCounts.entries()).map(([dirigenteId, name]) => {
        const count = performanceData?.filter(v => v.registered_by_dirigente_id === dirigenteId).length || 0;
        return { name, count };
      }).sort((a, b) => b.count - a.count);

      setDirigentePerformance(performanceArray);

      // Cobertura por barrio
      const { data: barrioData } = await supabase
        .from('mobilized_voters')
        .select(`
          registered_by_dirigente_id,
          profiles!inner (
            operating_barrio
          )
        `)
        .eq('organization_id', profile.organization_id);

      const barrioCounts = new Map<string, number>();
      barrioData?.forEach(voter => {
        const barrio = voter.profiles?.operating_barrio || 'No especificado';
        barrioCounts.set(barrio, (barrioCounts.get(barrio) || 0) + 1);
      });

      const coverageArray = Array.from(barrioCounts.entries()).map(([barrio, count]) => ({
        barrio,
        count
      })).sort((a, b) => b.count - a.count);

      setCoverageByBarrio(coverageArray);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };


  // Configurar suscripción a Realtime
  useEffect(() => {
    if (!profile?.organization_id) return;

    // Obtener datos iniciales
    fetchDashboardData();

    // Suscribirse a cambios en la tabla mobilized_voters
    const channel = supabase
      .channel('mobilized_voters_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mobilized_voters',
          filter: `organization_id=eq.${profile.organization_id}`
        },
        () => {
          // Actualizar datos cuando se inserte un nuevo votante
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id]);

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
              <h1 className="text-xl font-bold">Dashboard de Inteligencia Electoral</h1>
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
            Monitoreo en tiempo real de la operación de movilización
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Votantes Movilizados</CardTitle>
                  <Vote className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalVoters.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total acumulado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
                  <Car className="h-4 w-4 text-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeVehicles}</div>
                  <p className="text-xs text-muted-foreground">
                    En viaje actualmente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dirigentes Activos</CardTitle>
                  <Users className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeDirigentes}</div>
                  <p className="text-xs text-muted-foreground">
                    Última hora
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Visualizaciones de Datos */}
        {profile?.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Movilización por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Movilización por Hora</CardTitle>
                <CardDescription>
                  Votantes registrados en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : votersByHour.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
                    <p className="text-muted-foreground">
                      No se registraron votantes en las últimas 24 horas.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={votersByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de Cobertura por Barrio */}
            <Card>
              <CardHeader>
                <CardTitle>Cobertura por Barrio/Zona</CardTitle>
                <CardDescription>
                  Votantes registrados por zona de operación
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : coverageByBarrio.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
                    <p className="text-muted-foreground">
                      No se registraron votantes por zona de operación.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={coverageByBarrio.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="barrio" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabla de Rendimiento por Dirigente */}
        {profile?.role === 'admin' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rendimiento por Dirigente</CardTitle>
              <CardDescription>
                Ranking de dirigentes por cantidad de votantes registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : dirigentePerformance.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
                  <p className="text-muted-foreground">
                    No se registraron votantes por dirigente.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Dirigente</TableHead>
                      <TableHead className="text-right">Nº de Votantes Registrados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dirigentePerformance.map((dirigente, index) => (
                      <TableRow key={dirigente.name}>
                        <TableCell className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-2 text-primary" />
                          {dirigente.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">{dirigente.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sección de IA Placeholder */}
        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Asistente de IA Electoral
              </CardTitle>
              <CardDescription>
                Próximamente: Asistencia inteligente para toma de decisiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  La interfaz de chat con el asistente de IA estará disponible próximamente.
                  Podrás consultar sobre el estado de la movilización, generar informes y obtener recomendaciones estratégicas.
                </p>
                <div className="bg-background p-4 rounded border border-dashed border-muted-foreground/30">
                  <p className="text-sm text-muted-foreground">
                    [Interfaz de chat - Placeholder para futura integración con DeepSeek AI]
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Secciones para otros roles */}
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

        {/* Botón flotante para abrir chat de IA */}
        {profile?.role === 'admin' && (
          <Button
            onClick={() => setShowAIChat(true)}
            size="lg"
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        )}

        {/* Componente de chat de IA */}
        {profile?.role === 'admin' && (
          <AIAssistantChat
            isOpen={showAIChat}
            onClose={() => setShowAIChat(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;