import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DirigenteRegisterPage from '../DirigenteRegisterPage';

// Mock del contexto de autenticación
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    profile: {
      id: 'test-dirigente-id',
      full_name: 'Dirigente Test',
      email: 'dirigente@test.com',
      role: 'dirigente',
      organization_id: 'test-org-id'
    },
    user: { id: 'test-user-id' }
  })
}));

// Mock de Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
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

describe('VoterRegistrationPage - Registro de Votantes', () => {
  beforeEach(() => {
    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test('debería mostrar el formulario de registro de votantes', () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    expect(screen.getByText(/registrar votante/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dni \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/escuela de destino \*/i)).toBeInTheDocument();
  });

  test('debería requerir todos los campos obligatorios', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Intentar enviar el formulario vacío
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Verificar que los campos obligatorios tengan mensajes de error
      expect(screen.getByText(/nombre completo es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/dni es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/teléfono es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/escuela de destino es requerida/i)).toBeInTheDocument();
    });
  });

  test('debería validar el formato del DNI (solo números)', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Ingresar DNI con caracteres no numéricos
    const dniInput = screen.getByLabelText(/dni \*/i);
    fireEvent.change(dniInput, { target: { value: '12345678a' } });
    
    // Intentar enviar
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/el dni debe contener solo números/i)).toBeInTheDocument();
    });
  });

  test('debería llamar a supabase.from("mobilized_voters").insert con datos correctos al enviar formulario válido', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Mock de la inserción exitosa
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ data: [{ id: 'voter-id' }], error: null }))
    });
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '098765432' }
    });
    fireEvent.change(screen.getByLabelText(/escuela de destino \*/i), {
      target: { value: 'Escuela Central' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Verificar que se llamó a supabase.from("mobilized_voters").insert
      expect(supabase.from).toHaveBeenCalledWith('mobilized_voters');
      
      const insertMock = (supabase.from as jest.Mock).mock.results[0].value.insert;
      expect(insertMock).toHaveBeenCalledWith({
        full_name: 'Juan Pérez',
        dni: '12345678',
        phone: '098765432',
        destination_school: 'Escuela Central',
        organization_id: 'test-org-id',
        registered_by_dirigente_id: 'test-dirigente-id'
      });
    });
  });

  test('debería mostrar error si la inserción falla', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Mock de la inserción que falla
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Error al registrar votante' } }))
    });
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '098765432' }
    });
    fireEvent.change(screen.getByLabelText(/escuela de destino \*/i), {
      target: { value: 'Escuela Central' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error al registrar votante/i)).toBeInTheDocument();
    });
  });

  test('debería limpiar el formulario después de un registro exitoso', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Mock de la inserción exitosa
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ data: [{ id: 'voter-id' }], error: null }))
    });
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '098765432' }
    });
    fireEvent.change(screen.getByLabelText(/escuela de destino \*/i), {
      target: { value: 'Escuela Central' }
    });
    
    // Verificar que los campos tienen valores
    expect(screen.getByLabelText(/nombre completo \*/i)).toHaveValue('Juan Pérez');
    expect(screen.getByLabelText(/dni \*/i)).toHaveValue('12345678');
    expect(screen.getByLabelText(/teléfono \*/i)).toHaveValue('098765432');
    expect(screen.getByLabelText(/escuela de destino \*/i)).toHaveValue('Escuela Central');
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Verificar que el formulario se limpió
      expect(screen.getByLabelText(/nombre completo \*/i)).toHaveValue('');
      expect(screen.getByLabelText(/dni \*/i)).toHaveValue('');
      expect(screen.getByLabelText(/teléfono \*/i)).toHaveValue('');
      expect(screen.getByLabelText(/escuela de destino \*/i)).toHaveValue('');
    });
  });

  test('debería mostrar indicador de carga durante el envío', async () => {
    const { wrapper } = createWrapper();
    render(<DirigenteRegisterPage />, { wrapper });
    
    // Mock de la inserción con retraso
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn(() => new Promise(resolve => setTimeout(() => resolve({ data: [{ id: 'voter-id' }], error: null }), 100)))
    });
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre completo \*/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/dni \*/i), {
      target: { value: '12345678' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono \*/i), {
      target: { value: '098765432' }
    });
    fireEvent.change(screen.getByLabelText(/escuela de destino \*/i), {
      target: { value: 'Escuela Central' }
    });
    
    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /registrar votante/i });
    fireEvent.click(submitButton);
    
    // Verificar que el botón muestra indicador de carga
    expect(submitButton).toHaveTextContent(/registrando/i);
    
    // Esperar a que termine la operación
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/registrar votante/i);
    });
  });
});