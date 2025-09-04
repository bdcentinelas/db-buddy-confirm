import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DirigentesPage from '../DirigentesPage';

// Mock del contexto de autenticación
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    profile: {
      id: 'test-admin-id',
      full_name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      organization_id: 'test-org-id'
    },
    user: { id: 'test-user-id' }
  })
}));

// Mock de Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    functions: {
      invoke: jest.fn()
    }
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  };
};

describe('DirigentesPage - Creación de Dirigente', () => {
  beforeEach(() => {
    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test('debería mostrar el botón "Crear Nuevo Dirigente"', () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    expect(screen.getByRole('button', { name: /crear nuevo dirigente/i })).toBeInTheDocument();
  });

  test('debería abrir el modal al hacer clic en "Crear Nuevo Dirigente"', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    const createButton = screen.getByRole('button', { name: /crear nuevo dirigente/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/crear nuevo dirigente/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre completo \*/i)).toBeInTheDocument();
    });
  });

  test('debería requerir todos los campos obligatorios', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Intentar enviar el formulario vacío
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/todos los campos son requeridos/i)).toBeInTheDocument();
    });
  });

  test('debería validar el formato del email', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Ingresar email inválido
    const emailInput = screen.getByLabelText(/email \*/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    
    // Intentar enviar
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
    });
  });

  test('debería validar el formato del DNI', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Ingresar DNI con caracteres no numéricos
    const dniInput = screen.getByLabelText(/dni \*/i);
    fireEvent.change(dniInput, { target: { value: '12345678a' } });
    
    // Intentar enviar
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el dni debe contener solo números/i)).toBeInTheDocument();
    });
  });

  test('debería llamar a la Edge Function con datos correctos al enviar formulario válido', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Mock de la Edge Function
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: 'juan.perez@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/barrio de operación \*/i), {
      target: { value: 'Centro' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-dirigente', {
        body: {
          full_name: 'Juan Pérez',
          email: 'juan.perez@example.com',
          password: 'password123',
          dni: '12345678',
          address: '',
          operating_barrio: 'Centro',
          organization_id: 'test-org-id'
        }
      });
    });
  });

  test('debería mostrar error si la Edge Function falla', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Mock de la Edge Function que falla
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { error: 'El email ya está registrado' },
      error: null
    });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: 'juan.perez@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/barrio de operación \*/i), {
      target: { value: 'Centro' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el email ya está registrado/i)).toBeInTheDocument();
    });
  });

  test('debería cerrar el modal y resetear el formulario después de crear exitosamente', async () => {
    const { wrapper } = createWrapper();
    render(<DirigentesPage />, { wrapper });
    
    // Mock de la Edge Function exitosa
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Abrir el modal
    fireEvent.click(screen.getByRole('button', { name: /crear nuevo dirigente/i }));
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: 'juan.perez@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña \*/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/barrio de operación \*/i), {
      target: { value: 'Centro' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /crear dirigente/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/dirigente creado exitosamente/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/nombre completo \*/i)).not.toBeInTheDocument();
    });
  });
});