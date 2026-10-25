import { useState, useEffect, useCallback } from 'react';
import { Egg, ShieldCheck, Home, LogOut, Loader2 } from 'lucide-react';
import { AppState, Reservation, Expense } from './types';
import * as db from './lib/database';
import HomePage from './components/HomePage';
import ReservationPage from './components/ReservationPage';
import AdminPage from './components/AdminPage';

type Page = 'home' | 'reservation' | 'admin';

const defaultState: AppState = {
  prices: {
    gallina_docena: 4.50,
    gallina_media_docena: 2.50,
    pato_docena: 6.00,
    pato_media_docena: 3.50,
  },
  stock: {
    gallina: 120,
    pato: 60,
  },
  reservations: [],
  expenses: [],
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Cargar datos iniciales desde Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prices, stock, reservations] = await Promise.all([
        db.fetchPrices(),
        db.fetchStock(),
        db.fetchReservations(),
      ]);

      setState({
        prices: prices || defaultState.prices,
        stock: stock || defaultState.stock,
        reservations,
        expenses: [], // Los gastos se cargan solo cuando el admin entra
      });
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar sesión al iniciar
  useEffect(() => {
    loadData();

    // Comprobar si hay sesión activa
    db.getSession().then((session) => {
      if (session) {
        setIsAdmin(true);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = db.onAuthStateChange((session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  // Cargar gastos cuando el admin entra
  useEffect(() => {
    if (isAdmin && page === 'admin') {
      db.fetchExpenses().then((expenses) => {
        setState(prev => ({ ...prev, expenses }));
      });
    }
  }, [isAdmin, page]);

  const handleReserve = async (reservation: Reservation) => {
    // Crear reserva en Supabase
    const created = await db.createReservation(reservation);
    if (!created) {
      alert('Error al crear la reserva. Inténtalo de nuevo.');
      return;
    }

    // Actualizar stock en Supabase
    const eggsPerUnit = reservation.quantity === 'docena' ? 12 : 6;
    const totalEggs = eggsPerUnit * reservation.units;
    const newStock = { ...state.stock };
    newStock[reservation.eggType] = Math.max(0, newStock[reservation.eggType] - totalEggs);
    await db.updateStock(newStock);

    // Actualizar estado local
    setState(prev => ({
      ...prev,
      reservations: [created, ...prev.reservations],
      stock: newStock,
    }));
  };

  const handleUpdatePrices = async (prices: AppState['prices']) => {
    const success = await db.updatePrices(prices);
    if (success) {
      setState(prev => ({ ...prev, prices }));
    } else {
      alert('Error al actualizar precios. Comprueba que tienes permisos de administrador.');
    }
  };

  const handleUpdateStock = async (stock: AppState['stock']) => {
    const success = await db.updateStock(stock);
    if (success) {
      setState(prev => ({ ...prev, stock }));
    } else {
      alert('Error al actualizar stock. Comprueba que tienes permisos de administrador.');
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: Reservation['status']) => {
    const success = await db.updateReservationStatus(id, status);
    if (!success) {
      alert('Error al actualizar la reserva.');
      return;
    }

    // Si se cancela, restaurar stock
    if (status === 'cancelado') {
      const reservation = state.reservations.find(r => r.id === id);
      if (reservation && reservation.status !== 'cancelado') {
        const eggsPerUnit = reservation.quantity === 'docena' ? 12 : 6;
        const totalEggs = eggsPerUnit * reservation.units;
        const newStock = { ...state.stock };
        newStock[reservation.eggType] += totalEggs;
        await db.updateStock(newStock);
        setState(prev => ({
          ...prev,
          reservations: prev.reservations.map(r => r.id === id ? { ...r, status } : r),
          stock: newStock,
        }));
        return;
      }
    }

    setState(prev => ({
      ...prev,
      reservations: prev.reservations.map(r => r.id === id ? { ...r, status } : r),
    }));
  };

  const handleAddExpense = async (expense: Expense) => {
    const created = await db.createExpense(expense);
    if (created) {
      setState(prev => ({
        ...prev,
        expenses: [created, ...prev.expenses],
      }));
    } else {
      alert('Error al registrar el gasto.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este gasto?')) return;
    const success = await db.deleteExpense(id);
    if (success) {
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id),
      }));
    } else {
      alert('Error al eliminar el gasto.');
    }
  };

  const handleAdminLogin = async () => {
    setLoginLoading(true);
    setLoginError('');

    const result = await db.signIn(loginEmail, loginPassword);
    if (result.success) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPage('admin');
      setLoginEmail('');
      setLoginPassword('');

      // Cargar gastos al entrar como admin
      const expenses = await db.fetchExpenses();
      setState(prev => ({ ...prev, expenses }));
    } else {
      setLoginError(result.error || 'Error al iniciar sesión');
    }
    setLoginLoading(false);
  };

  const handleAdminLogout = async () => {
    await db.signOut();
    setIsAdmin(false);
    setPage('home');
  };

  const navigateToAdmin = () => {
    if (isAdmin) {
      setPage('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Egg className="w-5 h-5 text-amber-600" />
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">Huevos de la Granja</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('home')}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === 'home' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <button
              onClick={() => setPage('reservation')}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === 'reservation' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Egg className="w-4 h-4" />
              <span className="hidden sm:inline">Reservar</span>
            </button>
            {isAdmin ? (
              <>
                <button
                  onClick={() => setPage('admin')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === 'admin' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={navigateToAdmin}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Acceso Administrador
            </h2>
            {loginError && (
              <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">{loginError}</p>
            )}
            <div className="space-y-3 mb-4">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                autoFocus
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Contraseña"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAdminLogin(false); setLoginEmail(''); setLoginPassword(''); setLoginError(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors"
                disabled={loginLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={loginLoading || !loginEmail || !loginPassword}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      {page === 'home' && (
        <HomePage
          prices={state.prices}
          stock={state.stock}
          onReserve={() => setPage('reservation')}
        />
      )}
      {page === 'reservation' && (
        <ReservationPage
          prices={state.prices}
          stock={state.stock}
          onReserve={handleReserve}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'admin' && isAdmin && (
        <AdminPage
          prices={state.prices}
          stock={state.stock}
          reservations={state.reservations}
          expenses={state.expenses}
          onUpdatePrices={handleUpdatePrices}
          onUpdateStock={handleUpdateStock}
          onUpdateReservationStatus={handleUpdateReservationStatus}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onBack={() => setPage('home')}
        />
      )}
    </div>
  );
}
