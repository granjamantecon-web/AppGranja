import { Egg, MapPin, Clock, Phone, Leaf } from 'lucide-react';
import { Prices, Stock } from '../types';

interface HomePageProps {
  prices: Prices;
  stock: Stock;
  onReserve: () => void;
}

export default function HomePage({ prices, stock, onReserve }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6">
            <Egg className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Huevos de la Granja
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Huevos frescos de gallina y pato, criadas al aire libre en nuestra granja familiar.
            Reserva y recoge directamente del productor.
          </p>
          <button
            onClick={onReserve}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🥚 Hacer una reserva
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-green-50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">100% Natural</h3>
              <p className="text-gray-600">Nuestras gallinas y patos se crían al aire libre con alimentación natural.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-amber-50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Siempre Frescos</h3>
              <p className="text-gray-600">Recoge tus huevos el mismo día. Máxima frescura garantizada.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-blue-50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Km 0</h3>
              <p className="text-gray-600">Producto local, directo de nuestra granja a tu mesa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nuestros Productos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Gallina */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <div className="text-5xl mb-4">🐔</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Huevos de Gallina</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Docena (12 uds)</span>
                  <span className="text-2xl font-bold text-amber-600">{prices.gallina_docena.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Media docena (6 uds)</span>
                  <span className="text-2xl font-bold text-amber-600">{prices.gallina_media_docena.toFixed(2)}€</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">
                  ✓ Stock disponible: {stock.gallina} huevos
                </span>
              </div>
            </div>

            {/* Pato */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="text-5xl mb-4">🦆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Huevos de Pato</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Docena (12 uds)</span>
                  <span className="text-2xl font-bold text-blue-600">{prices.pato_docena.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Media docena (6 uds)</span>
                  <span className="text-2xl font-bold text-blue-600">{prices.pato_media_docena.toFixed(2)}€</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">
                  ✓ Stock disponible: {stock.pato} huevos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">¿Cómo funciona?</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Elige tus huevos</h3>
                <p className="text-gray-600">Selecciona entre huevos de gallina o pato, en docenas o medias docenas.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Reserva fecha y hora</h3>
                <p className="text-gray-600">Escoge el día y la hora que mejor te convenga para recoger tu pedido.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Recoge en la granja</h3>
                <p className="text-gray-600">Pasa a recoger tus huevos frescos el día reservado. ¡Pago en mano!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contacto</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-amber-400" />
              <span className="text-lg">+34 600 123 456</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-amber-400" />
              <span className="text-lg">Camino de la Granja, s/n</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-400" />
              <span className="text-lg">Lun-Sáb: 8:00 - 20:00</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
