export type EggType = 'gallina' | 'pato';
export type EggQuantity = 'media_docena' | 'docena';

export interface Prices {
  gallina_docena: number;
  gallina_media_docena: number;
  pato_docena: number;
  pato_media_docena: number;
}

export interface Stock {
  gallina: number;
  pato: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  eggType: EggType;
  quantity: EggQuantity;
  units: number;
  pickupDate: string;
  pickupTime: string;
  totalPrice: number;
  status: 'pendiente' | 'recogido' | 'cancelado';
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface AppState {
  prices: Prices;
  stock: Stock;
  reservations: Reservation[];
  expenses: Expense[];
}
