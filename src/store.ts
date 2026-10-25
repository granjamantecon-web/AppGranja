import { Prices, Reservation, Expense } from './types';

// ============================================
// CÁLCULOS DE PRECIOS
// ============================================
export function calculatePrice(prices: Prices, eggType: 'gallina' | 'pato', quantity: 'media_docena' | 'docena'): number {
  if (eggType === 'gallina') {
    return quantity === 'docena' ? prices.gallina_docena : prices.gallina_media_docena;
  }
  return quantity === 'docena' ? prices.pato_docena : prices.pato_media_docena;
}

export function getEggsPerUnit(quantity: 'media_docena' | 'docena'): number {
  return quantity === 'docena' ? 12 : 6;
}

// ============================================
// GENERACIÓN DE IDs (solo para uso local temporal)
// ============================================
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// CÁLCULOS FINANCIEROS
// ============================================
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

// ============================================
// CATEGORÍAS DE GASTOS
// ============================================
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
