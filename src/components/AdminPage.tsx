import { useState } from 'react';
import {
  DollarSign, Package, ClipboardList, BarChart3, Plus, Trash2,
  CheckCircle, XCircle, Edit2, Save, X, TrendingUp, TrendingDown,
  ArrowLeft
} from 'lucide-react';
import { Prices, Stock, Reservation, Expense } from '../types';
import { expenseCategories, getTotalIncome, getTotalExpenses, getBalance } from '../store';

interface AdminPageProps {
  prices: Prices;
  stock: Stock;
  reservations: Reservation[];
  expenses: Expense[];
  onUpdatePrices: (prices: Prices) => void;
  onUpdateStock: (stock: Stock) => void;
  onUpdateReservationStatus: (id: string, status: Reservation['status']) => void;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onBack: () => void;
}

type AdminTab = 'prices' | 'stock' | 'reservations' | 'finance';

export default function AdminPage({
  prices,
  stock,
  reservations,
  expenses,
  onUpdatePrices,
  onUpdateStock,
  onUpdateReservationStatus,
  onAddExpense,
  onDeleteExpense,
  onBack,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('reservations');
  const [editPrices, setEditPrices] = useState(prices);
  const [editingPrices, setEditingPrices] = useState(false);
  const [stockGallina, setStockGallina] = useState(stock.gallina);
  const [stockPato, setStockPato] = useState(stock.pato);
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add');
  const [stockAmount, setStockAmount] = useState(0);
  const [stockType, setStockType] = useState<'gallina' | 'pato'>('gallina');

  // Expense form
  const [expCategory, setExpCategory] = useState(expenseCategories[0]);
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const totalIncome = getTotalIncome(reservations);
  const totalExpenses = getTotalExpenses(expenses);
  const balance = getBalance(reservations, expenses);

  const pendingReservations = reservations.filter(r => r.status === 'pendiente');
  const completedReservations = reservations.filter(r => r.status === 'recogido');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelado');

  const handleSavePrices = () => {
    onUpdatePrices(editPrices);
    setEditingPrices(false);
  };

  const handleStockUpdate = () => {
    if (stockAmount <= 0) return;
    const newStock = { ...stock };
    if (stockAction === 'add') {
      newStock[stockType] += stockAmount;
    } else {
      newStock[stockType] = Math.max(0, newStock[stockType] - stockAmount);
    }
    onUpdateStock(newStock);
    setStockAmount(0);
    setStockGallina(newStock.gallina);
    setStockPato(newStock.pato);
  };

  const handleAddExpense = () => {
    if (!expDescription.trim() || !expAmount || parseFloat(expAmount) <= 0) return;
    onAddExpense({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      category: expCategory,
      description: expDescription.trim(),
      amount: parseFloat(expAmount),
      date: expDate,
    });
    setExpDescription('');
    setExpAmount('');
  };

  const tabs = [
    { id: 'reservations' as AdminTab, label: 'Reservas', icon: ClipboardList, count: pendingReservations.length },
    { id: 'prices' as AdminTab, label: 'Precios', icon: DollarSign },
    { id: 'stock' as AdminTab, label: 'Stock', icon: Package },
    { id: 'finance' as AdminTab, label: 'Finanzas', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-green-600 px-3 py-1 rounded-full">Ingresos: {totalIncome.toFixed(2)}€</span>
            <span className="bg-red-600 px-3 py-1 rounded-full">Gastos: {totalExpenses.toFixed(2)}€</span>
            <span className={`px-3 py-1 rounded-full ${balance >= 0 ? 'bg-emerald-600' : 'bg-orange-600'}`}>
              Balance: {balance.toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* Pending */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
                <h2 className="font-bold text-yellow-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Pendientes ({pendingReservations.length})
                </h2>
              </div>
              {pendingReservations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay reservas pendientes</div>
              ) : (
                <div className="divide-y">
                  {pendingReservations.map((r) => (
                    <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800">{r.customerName} — {r.customerPhone}</p>
                        <p className="text-sm text-gray-500">
                          {r.units} {r.quantity === 'docena' ? 'docena(s)' : 'media(s) docena(s)'} de {r.eggType} — {r.totalPrice.toFixed(2)}€
                        </p>
                        <p className="text-sm text-gray-500">
                          📅 {r.pickupDate} a las {r.pickupTime}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateReservationStatus(r.id, 'recogido')}
                          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Recogido
                        </button>
                        <button
                          onClick={() => onUpdateReservationStatus(r.id, 'cancelado')}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <h2 className="font-bold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Recogidas ({completedReservations.length})
                </h2>
              </div>
              {completedReservations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay reservas recogidas</div>
              ) : (
                <div className="divide-y max-h-64 overflow-y-auto">
                  {completedReservations.map((r) => (
                    <div key={r.id} className="p-4">
                      <p className="font-medium text-gray-800">{r.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {r.units} {r.quantity === 'docena' ? 'docena(s)' : 'media(s) docena(s)'} de {r.eggType} — {r.totalPrice.toFixed(2)}€ — {r.pickupDate} {r.pickupTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancelled */}
            {cancelledReservations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                  <h2 className="font-bold text-red-800 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Canceladas ({cancelledReservations.length})
                  </h2>
                </div>
                <div className="divide-y max-h-48 overflow-y-auto">
                  {cancelledReservations.map((r) => (
                    <div key={r.id} className="p-4">
                      <p className="font-medium text-gray-800">{r.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {r.units} {r.quantity === 'docena' ? 'docena(s)' : 'media(s) docena(s)'} de {r.eggType} — {r.pickupDate} {r.pickupTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Precios
              </h2>
              {!editingPrices ? (
                <button
                  onClick={() => { setEditPrices(prices); setEditingPrices(true); }}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPrices(false)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleSavePrices}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Gallina */}
              <div className="border border-amber-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🐔 Huevos de Gallina</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Docena (€)</label>
                    {editingPrices ? (
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={editPrices.gallina_docena}
                        onChange={(e) => setEditPrices({ ...editPrices, gallina_docena: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-amber-600">{prices.gallina_docena.toFixed(2)}€</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Media docena (€)</label>
                    {editingPrices ? (
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={editPrices.gallina_media_docena}
                        onChange={(e) => setEditPrices({ ...editPrices, gallina_media_docena: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-amber-600">{prices.gallina_media_docena.toFixed(2)}€</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pato */}
              <div className="border border-blue-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🦆 Huevos de Pato</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Docena (€)</label>
                    {editingPrices ? (
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={editPrices.pato_docena}
                        onChange={(e) => setEditPrices({ ...editPrices, pato_docena: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">{prices.pato_docena.toFixed(2)}€</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Media docena (€)</label>
                    {editingPrices ? (
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={editPrices.pato_media_docena}
                        onChange={(e) => setEditPrices({ ...editPrices, pato_media_docena: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">{prices.pato_media_docena.toFixed(2)}€</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* Current Stock */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🐔 Stock de Gallina</h3>
                <p className="text-4xl font-bold text-amber-600">{stock.gallina}</p>
                <p className="text-gray-500">huevos disponibles</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🦆 Stock de Pato</h3>
                <p className="text-4xl font-bold text-blue-600">{stock.pato}</p>
                <p className="text-gray-500">huevos disponibles</p>
              </div>
            </div>

            {/* Add/Remove Stock */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                Modificar Stock
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de huevo</label>
                  <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value as 'gallina' | 'pato')}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="gallina">🐔 Gallina</option>
                    <option value="pato">🦆 Pato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Acción</label>
                  <select
                    value={stockAction}
                    onChange={(e) => setStockAction(e.target.value as 'add' | 'remove')}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="add">➕ Añadir al stock</option>
                    <option value="remove">➖ Quitar del stock</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Cantidad de huevos</label>
                <input
                  type="number"
                  min="1"
                  value={stockAmount || ''}
                  onChange={(e) => setStockAmount(parseInt(e.target.value) || 0)}
                  placeholder="Ej: 24"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={handleStockUpdate}
                disabled={stockAmount <= 0}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {stockAction === 'add' ? '➕ Añadir' : '➖ Quitar'} {stockAmount} huevos de {stockType}
              </button>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ingresos totales</p>
                    <p className="text-3xl font-bold text-green-600">{totalIncome.toFixed(2)}€</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">{completedReservations.length + pendingReservations.length} ventas realizadas</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Gastos totales</p>
                    <p className="text-3xl font-bold text-red-600">{totalExpenses.toFixed(2)}€</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">{expenses.length} gastos registrados</p>
              </div>
              <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${balance >= 0 ? 'border-emerald-500' : 'border-orange-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {balance.toFixed(2)}€
                    </p>
                  </div>
                  <BarChart3 className={`w-8 h-8 ${balance >= 0 ? 'text-emerald-400' : 'text-orange-400'}`} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{balance >= 0 ? 'Beneficio' : 'Pérdidas'}</p>
              </div>
            </div>

            {/* Add Expense */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                Registrar Gasto
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    placeholder="Ej: Pienso 25kg"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleAddExpense}
                disabled={!expDescription.trim() || !expAmount || parseFloat(expAmount) <= 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Añadir gasto
              </button>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="font-bold text-gray-800">Historial de Gastos</h2>
              </div>
              {expenses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay gastos registrados</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Categoría</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Descripción</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Importe</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {expenses.sort((a, b) => b.date.localeCompare(a.date)).map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{exp.date}</td>
                          <td className="px-4 py-3">
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{exp.category}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">{exp.description}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-600">-{exp.amount.toFixed(2)}€</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => onDeleteExpense(exp.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
