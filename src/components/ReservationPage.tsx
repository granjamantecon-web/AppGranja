import { useState } from 'react';
import { Calendar, Clock, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { Prices, Stock, Reservation, EggType, EggQuantity } from '../types';
import { calculatePrice, getEggsPerUnit, generateId } from '../store';

interface ReservationPageProps {
  prices: Prices;
  stock: Stock;
  onReserve: (reservation: Reservation) => void;
  onBack: () => void;
}

export default function ReservationPage({ prices, stock, onReserve, onBack }: ReservationPageProps) {
  const [step, setStep] = useState(1);
  const [eggType, setEggType] = useState<EggType>('gallina');
  const [quantity, setQuantity] = useState<EggQuantity>('docena');
  const [units, setUnits] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const pricePerUnit = calculatePrice(prices, eggType, quantity);
  const totalPrice = pricePerUnit * units;
  const eggsNeeded = getEggsPerUnit(quantity) * units;
  const availableStock = stock[eggType];

  const maxUnits = Math.floor(availableStock / getEggsPerUnit(quantity));

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate.toISOString().split('T')[0];
  };

  const handleConfirm = () => {
    if (!customerName.trim()) {
      setError('Por favor, introduce tu nombre.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Por favor, introduce tu teléfono.');
      return;
    }
    if (!pickupDate) {
      setError('Por favor, selecciona una fecha de recogida.');
      return;
    }
    if (!pickupTime) {
      setError('Por favor, selecciona una hora de recogida.');
      return;
    }
    if (eggsNeeded > availableStock) {
      setError('No hay suficiente stock disponible.');
      return;
    }

    const reservation: Reservation = {
      id: generateId(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      eggType,
      quantity,
      units,
      pickupDate,
      pickupTime,
      totalPrice,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    onReserve(reservation);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Reserva confirmada!</h2>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-gray-600"><span className="font-medium">Nombre:</span> {customerName}</p>
            <p className="text-gray-600"><span className="font-medium">Producto:</span> {eggsNeeded} huevos de {eggType}</p>
            <p className="text-gray-600"><span className="font-medium">Recogida:</span> {pickupDate} a las {pickupTime}</p>
            <p className="text-gray-600"><span className="font-medium">Total:</span> {totalPrice.toFixed(2)}€</p>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Te esperamos en la granja. El pago se realiza en el momento de la recogida.
          </p>
          <button
            onClick={onBack}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-full transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reservar Huevos</h1>
          <p className="text-gray-600">Sigue los pasos para hacer tu reserva</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-amber-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Product */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              Elige tu producto
            </h2>

            {/* Tipo de huevo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de huevo</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setEggType('gallina'); setUnits(1); }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    eggType === 'gallina'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🐔</div>
                  <div className="font-bold text-gray-800">Gallina</div>
                  <div className="text-sm text-gray-500">Stock: {stock.gallina}</div>
                </button>
                <button
                  onClick={() => { setEggType('pato'); setUnits(1); }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    eggType === 'pato'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🦆</div>
                  <div className="font-bold text-gray-800">Pato</div>
                  <div className="text-sm text-gray-500">Stock: {stock.pato}</div>
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Cantidad</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setQuantity('docena'); setUnits(1); }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    quantity === 'docena'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-800">Docena</div>
                  <div className="text-sm text-gray-500">12 unidades</div>
                  <div className="text-lg font-bold text-amber-600 mt-1">
                    {calculatePrice(prices, eggType, 'docena').toFixed(2)}€
                  </div>
                </button>
                <button
                  onClick={() => { setQuantity('media_docena'); setUnits(1); }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    quantity === 'media_docena'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-800">Media docena</div>
                  <div className="text-sm text-gray-500">6 unidades</div>
                  <div className="text-lg font-bold text-amber-600 mt-1">
                    {calculatePrice(prices, eggType, 'media_docena').toFixed(2)}€
                  </div>
                </button>
              </div>
            </div>

            {/* Unidades */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Número de {quantity === 'docena' ? 'docenas' : 'medias docenas'} (máx. {maxUnits})
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUnits(Math.max(1, units - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 w-12 text-center">{units}</span>
                <button
                  onClick={() => setUnits(Math.min(maxUnits, units + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total: {eggsNeeded} huevos — {totalPrice.toFixed(2)}€
              </p>
            </div>

            <button
              onClick={() => { setError(''); setStep(2); }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-full transition-all"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Fecha y hora de recogida
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Puedes reservar con hasta 14 días de antelación.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setPickupTime(time)}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                      pickupTime === time
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setError(''); setStep(1); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full transition-all"
              >
                ← Atrás
              </button>
              <button
                onClick={() => { setError(''); setStep(3); }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-full transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-600" />
              Tus datos y confirmación
            </h2>

            {/* Resumen */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Resumen del pedido</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>🥚 {eggsNeeded} huevos de {eggType} ({units} {quantity === 'docena' ? 'docena(s)' : 'media(s) docena(s)'})</p>
                <p>📅 {pickupDate || 'Sin fecha'} a las {pickupTime || '--:--'}</p>
                <p className="text-lg font-bold text-amber-700 mt-2">Total: {totalPrice.toFixed(2)}€</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="600 123 456"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setError(''); setStep(2); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full transition-all"
              >
                ← Atrás
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-all"
              >
                ✓ Confirmar reserva
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
