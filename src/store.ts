import { AppState, Prices, Stock, Reservation, Expense } from './types';

const STORAGE_KEY = 'granja-huevos-data';

const defaultPrices: Prices = {
  gallina_docena: 4.50,
  gallina_media_docena: 2.50,
  pato_docena: 6.00,
  pato_media_docena: 3.50,
};

const defaultStock: Stock = {
  gallina: 120,
  pato: 60,
};

const defaultState: AppState = {
  prices: defaultPrices,
  stock: defaultStock,
  reservations: [],
  expenses: [],
};

export function loadState(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return defaultState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculatePrice(prices: Prices, eggType: 'gallina' | 'pato', quantity: 'media_docena' | 'docena'): number {
  if (eggType === 'gallina') {
    return quantity === 'docena' ? prices.gallina_docena : prices.gallina_media_docena;
  }
  return quantity === 'docena' ? prices.pato_docena : prices.pato_media_docena;
}

export function getEggsPerUnit(quantity: 'media_docena' | 'docena'): number {
  return quantity === 'docena' ? 12 : 6;
}

export function getTotalIncome(reservations: Reservation[]): number {
  return reservations
    .filter(r => r.status !== 'cancelado')
    .reduce((sum, r) => sum + r.totalPrice, 0);
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getBalance(reservations: Reservation[], expenses: Expense[]): number {
  return getTotalIncome(reservations) - getTotalExpenses(expenses);
}

export const expenseCategories = [
  'Pienso',
  'Bebederos',
  'Comederos',
  'Medicamentos',
  'Material de limpieza',
  'Transporte',
  'Instalaciones',
  'Otros',
];
