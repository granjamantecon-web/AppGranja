import { useState, useEffect } from 'react';
import { Egg, ShieldCheck, Home } from 'lucide-react';
import { AppState, Reservation, Expense } from './types';
import { loadState, saveState, generateId } from './store';
import HomePage from './components/HomePage';
import ReservationPage from './components/ReservationPage';
import AdminPage from './components/AdminPage';

type Page = 'home' | 'reservation' | 'admin';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [state, setState] = useState<AppState>(loadState);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Persist state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleReserve = (reservation: Reservation) => {
    // Update stock
    const eggsPerUnit = reservation.quantity === 'docena' ? 12 : 6;
    const totalEggs = eggsPerUnit * reservation.units;
    const newStock = { ...state.stock };
    newStock[reservation.eggType] = Math.max(0, newStock[reservation.eggType] - totalEggs);

    setState({
      ...state,
      reservations: [...state.reservations, reservation],
      stock: newStock,
    });
  };

  const handleUpdatePrices = (prices: AppState['prices']) => {
    setState({ ...state, prices });
  };

  const handleUpdateStock = (stock: AppState['stock']) => {
    setState({ ...state, stock });
  };

  const handleUpdateReservationStatus = (id: string, status: Reservation['status']) => {
    const reservations = state.reservations.map(r =>
      r.id === id ? { ...r, status } : r
    );

    // If cancelled, restore stock
    if (status === 'cancelado') {
      const reservation = state.reservations.find(r => r.id === id);
      if (reservation && reservation.status !== 'cancelado') {
        const eggsPerUnit = reservation.quantity === 'docena' ? 12 : 6;
        const totalEggs = eggsPerUnit * reservation.units;
        const newStock = { ...state.stock };
        newStock[reservation.eggType] += totalEggs;
        setState({ ...state, reservations, stock: newStock });
        return;
      }
    }

    setState({ ...state, reservations });
  };

  const handleAddExpense = (expense: Expense) => {
    setState({
      ...state,
      expenses: [...state.expenses, expense],
    });
  };

  const handleDeleteExpense = (id: string) => {
    setState({
      ...state,
      expenses: state.expenses.filter(e => e.id !== id),
    });
  };

  const handleAdminLogin = () => {
    // Simple password check (in production, use proper auth)
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPage('admin');
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const navigateToAdmin = () => {
    if (isAdmin) {
      setPage('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

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
            <button
              onClick={navigateToAdmin}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === 'admin' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
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
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => { setAdminPassword(e.target.value); setLoginError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Contraseña"
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAdminLogin(false); setAdminPassword(''); setLoginError(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Entrar
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Contraseña por defecto: admin123
            </p>
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
