import { supabase } from './supabase';
import { Prices, Stock, Reservation, Expense } from '../types';

// ============================================
// PRECIOS
// ============================================
export async function fetchPrices(): Promise<Prices | null> {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching prices:', error);
    return null;
  }
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    gallina_docena: Number(row.gallina_docena),
    gallina_media_docena: Number(row.gallina_media_docena),
    pato_docena: Number(row.pato_docena),
    pato_media_docena: Number(row.pato_media_docena),
  };
}

export async function updatePrices(prices: Prices): Promise<boolean> {
  // Actualizar la primera fila (la más reciente)
  const { data: existing } = await supabase
    .from('prices')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('prices')
      .update({
        gallina_docena: prices.gallina_docena,
        gallina_media_docena: prices.gallina_media_docena,
        pato_docena: prices.pato_docena,
        pato_media_docena: prices.pato_media_docena,
      })
      .eq('id', existing[0].id);

    if (error) {
      console.error('Error updating prices:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('prices')
      .insert(prices);

    if (error) {
      console.error('Error inserting prices:', error);
      return false;
    }
  }
  return true;
}

// ============================================
// STOCK
// ============================================
export async function fetchStock(): Promise<Stock | null> {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching stock:', error);
    return null;
  }
  if (!data || data.length === 0) return null;

  return {
    gallina: data[0].gallina,
    pato: data[0].pato,
  };
}

export async function updateStock(stock: Stock): Promise<boolean> {
  const { data: existing } = await supabase
    .from('stock')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('stock')
      .update({ gallina: stock.gallina, pato: stock.pato })
      .eq('id', existing[0].id);

    if (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('stock')
      .insert(stock);

    if (error) {
      console.error('Error inserting stock:', error);
      return false;
    }
  }
  return true;
}

// ============================================
// RESERVAS
// ============================================
export async function fetchReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return (data || []).map(mapReservation);
}

export async function createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      customer_name: reservation.customerName,
      customer_phone: reservation.customerPhone,
      egg_type: reservation.eggType,
      quantity: reservation.quantity,
      units: reservation.units,
      pickup_date: reservation.pickupDate,
      pickup_time: reservation.pickupTime,
      total_price: reservation.totalPrice,
      status: reservation.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    return null;
  }

  return mapReservation(data);
}

export async function updateReservationStatus(id: string, status: Reservation['status']): Promise<boolean> {
  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating reservation:', error);
    return false;
  }
  return true;
}

// ============================================
// GASTOS
// ============================================
export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return (data || []).map(mapExpense);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    return null;
  }

  return mapExpense(data);
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
  return true;
}

// ============================================
// AUTENTICACIÓN
// ============================================
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ============================================
// HELPERS - Mapeo de BD a tipos de la app
// ============================================
function mapReservation(row: any): Reservation {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    eggType: row.egg_type,
    quantity: row.quantity,
    units: row.units,
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapExpense(row: any): Expense {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
  };
}
