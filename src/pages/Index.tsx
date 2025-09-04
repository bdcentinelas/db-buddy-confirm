import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Shield, Users, BarChart3, ArrowRight, Activity, Car } from 'lucide-react';

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
              Plataforma Integral de
              <span className="text-primary block">Movilización Electoral</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Sistema SaaS con dashboard en tiempo real, gestión de flota,
              asistente de IA y registro mobile-first para maximizar tu participación electoral.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base">
                  Ver Demo del Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Probar Asistente de IA
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
                <div className="p-2 bg-info/10 rounded-lg w-fit">
                  <BarChart3 className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Dashboard en Tiempo Real</CardTitle>
                <CardDescription>
                  Monitoreo instantáneo con actualizaciones automáticas,
                  gráficos interactivos y métricas clave de movilización.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Asistente de IA Integrado</CardTitle>
                <CardDescription>
                  Chatbot con IA para análisis electoral,
                  recomendaciones estratégicas y respuestas inteligentes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-success/10 rounded-lg w-fit">
                  <Car className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Gestión de Flota Inteligente</CardTitle>
                <CardDescription>
                  Importación masiva desde Excel, seguimiento en tiempo real
                  y asignación optimizada de vehículos a dirigentes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-warning/10 rounded-lg w-fit">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Registro Mobile-First</CardTitle>
                <CardDescription>
                  Interfaz optimizada para dirigentes en campo con registro
                  rápido de votantes y validación en tiempo real.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-destructive/10 rounded-lg w-fit">
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle>Arquitectura Multi-Tenant</CardTitle>
                <CardDescription>
                  Instancias completamente aisladas para cada organización
                  con políticas de seguridad avanzadas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-2 bg-secondary/10 rounded-lg w-fit">
                  <Vote className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Análisis Predictivo</CardTitle>
                <CardDescription>
                  Cobertura por zona, rendimiento por dirigente y
                  recomendaciones basadas en datos históricos.
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

      {/* How It Works Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Cómo Funciona Nuestra Plataforma
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un proceso simple de 4 pasos para maximizar tu movilización electoral
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-primary/20 lg:h-32 lg:top-16 lg:-translate-y-16"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Configuración Inicial</h3>
              <p className="text-muted-foreground">
                Administradores configuran la campaña, definen zonas geográficas y cargan la flota vehicular mediante importación masiva desde Excel.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-primary/20 lg:h-32 lg:top-16 lg:-translate-y-16"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Asignación de Recursos</h3>
              <p className="text-muted-foreground">
                Dirigentes son asignados a zonas específicas y reciben vehículos con capacidad y estado monitoreado en tiempo real.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-primary/20 lg:h-32 lg:top-16 lg:-translate-y-16"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Registro en Campo</h3>
              <p className="text-muted-foreground">
                Dirigentes utilizan la interfaz mobile-first para registrar votantes movilizados con validación en tiempo real.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Monitoreo Estratégico</h3>
              <p className="text-muted-foreground">
                Administradores visualizan dashboards en tiempo real, reciben recomendaciones del asistente de IA y toman decisiones basadas en datos.
              </p>
            </div>
          </div>

          {/* Visual Demo Section */}
          <div className="mt-20 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Plataforma en Acción
              </h3>
              <p className="text-muted-foreground">
                Descubre cómo nuestras herramientas transforman tu operación electoral
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-background/50 rounded-lg p-6 mb-4 border border-border">
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-12 h-12 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Dashboard Inteligente</h4>
                  <p className="text-sm text-muted-foreground">
                    Métricas en tiempo real con actualizaciones automáticas y análisis predictivo
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-background/50 rounded-lg p-6 mb-4 border border-border">
                  <div className="w-full h-48 bg-gradient-to-br from-info/10 to-info/5 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-12 h-12 text-info" />
                  </div>
                  <h4 className="font-semibold mb-2">Asistente de IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Chatbot con IA para análisis electoral y recomendaciones estratégicas
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-background/50 rounded-lg p-6 mb-4 border border-border">
                  <div className="w-full h-48 bg-gradient-to-br from-success/10 to-success/5 rounded-lg flex items-center justify-center mb-4">
                    <Vote className="w-12 h-12 text-success" />
                  </div>
                  <h4 className="font-semibold mb-2">Registro Mobile</h4>
                  <p className="text-sm text-muted-foreground">
                    Interfaz optimizada para dirigentes en campo con registro ultrarrápido
                  </p>
                </div>
              </div>
            </div>
      {/* Testimonials and Results Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Confianza de Organizaciones Electorales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Organizaciones de todos los tamaños confían en nuestra plataforma para maximizar su impacto
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Organizaciones</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">180K+</div>
              <p className="text-muted-foreground">Votantes Movilizados</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-info mb-2">650+</div>
              <p className="text-muted-foreground">Dirigentes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">99.9%</div>
              <p className="text-muted-foreground">Disponibilidad del Sistema</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Movimiento Ciudadano</h4>
                  <p className="text-sm text-muted-foreground">Gran Organización</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "La plataforma nos permitió triplicar nuestra movilización electoral. El dashboard en tiempo real y el asistente de IA fueron game changers para nuestra estrategia."
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold">Coalición Progresista</h4>
                  <p className="text-sm text-muted-foreground">Mediana Organización</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "El registro mobile-first redujo nuestro tiempo de captura en un 70%. Nuestros dirigentes en campo amaron la simplicidad y velocidad del sistema."
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h4 className="font-semibold">Partido Local</h4>
                  <p className="text-sm text-muted-foreground">Pequeña Organización</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "Como organización pequeña, la escalabilidad multi-tenant nos permitió crecer sin preocuparnos por infraestructura. ¡Excelente ROI!"
              </p>
            </div>
          </div>

          {/* Case Studies */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Casos de Éxito Recientes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 text-left">
                <h4 className="text-xl font-semibold mb-4 text-primary">
                  Elecciones Regionales 2024 - Norte del País
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 15 organizaciones usando la plataforma simultáneamente</li>
                  <li>• 45 dirigentes movilizando 3,200 votantes</li>
                  <li>• 85 vehículos gestionados con importación masiva</li>
                  <li>• Reducción del 60% en costos de logística</li>
                  <li>• 99.7% de uptime durante el día electoral</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-8 text-left">
                <h4 className="text-xl font-semibold mb-4 text-success">
                  Elecciones Municipales 2024 - Capital
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 8 organizaciones con cobertura en 12 distritos</li>
                  <li>• 120 dirigentes en campo con mobile-first</li>
                  <li>• 7,500 votantes movilizados en 8 horas</li>
                  <li>• Asistente de IA procesó 200+ consultas estratégicas</li>
                  <li>• Cobertura del 92% en zonas objetivo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para maximizar tu participación electoral?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a las organizaciones que ya confían en nuestra plataforma integral
            con IA y dashboard en tiempo real.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base">
                Solicitar Demo Personalizada
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Ver Planes y Precios
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
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
export default Index;
