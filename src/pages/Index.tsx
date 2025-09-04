import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Shield, Users, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Vote className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Sistema de Gestión de
              <span className="text-primary block">Movilización Electoral</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Plataforma integral para coordinar y monitorear la movilización de votantes 
              con arquitectura multi-tenant segura y análisis en tiempo real.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base">
                  Acceder al Sistema
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diseñado para maximizar la eficiencia operativa el día de las elecciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-success/10 rounded-lg w-fit">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Gestión Multi-Tenant</CardTitle>
                <CardDescription>
                  Arquitectura SaaS que permite a múltiples campañas operar 
                  de forma independiente y segura.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-info/10 rounded-lg w-fit">
                  <BarChart3 className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Dashboard en Tiempo Real</CardTitle>
                <CardDescription>
                  Monitoreo instantáneo de la movilización con métricas 
                  y visualizaciones inteligentes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-warning/10 rounded-lg w-fit">
                  <Shield className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Seguridad Avanzada</CardTitle>
                <CardDescription>
                  Políticas de seguridad a nivel de fila (RLS) que garantizan 
                  aislamiento total de datos entre organizaciones.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Roles de Usuario
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tres niveles de acceso diseñados para diferentes necesidades operativas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Dirigente</CardTitle>
                <CardDescription>
                  Usuario operativo en campo con interfaz mobile-first 
                  para registro rápido de votantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Registro de votantes movilizados</li>
                  <li>• Gestión de vehículos asignados</li>
                  <li>• Interfaz optimizada para móvil</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Administrador</CardTitle>
                <CardDescription>
                  Coordinador regional con acceso completo al dashboard 
                  de inteligencia electoral.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Dashboard completo de métricas</li>
                  <li>• Gestión de dirigentes y flota</li>
                  <li>• Asistente de IA electoral</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-primary">Superadministrador</CardTitle>
                <CardDescription>
                  Gestión a nivel SaaS para la administración 
                  de múltiples organizaciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Gestión de tenants</li>
                  <li>• Métricas globales del sistema</li>
                  <li>• Configuración de infraestructura</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para optimizar tu movilización electoral?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a las organizaciones que ya confían en nuestro sistema 
            para maximizar la participación ciudadana.
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-12 px-8 text-base">
              Comenzar Ahora
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Sistema de Gestión de Movilización Electoral</p>
            <p className="mt-1">Arquitectura segura • Multi-tenant • Tiempo real</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
