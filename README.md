# 🥚 Huevos de la Granja

Web para gestión de una granja familiar de venta de huevos. Permite a los clientes reservar huevos de gallina y pato, y al administrador gestionar precios, stock y finanzas.

## 🚀 Despliegue con Supabase + Vercel

### Paso 1: Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta (puedes usar GitHub).
2. Crea un nuevo proyecto:
   - **Name**: `granja-huevos` (o el que prefieras)
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: Elige la más cercana (ej: `West Europe` para España)
3. Espera a que el proyecto se inicialice (1-2 minutos).

### Paso 2: Configurar la base de datos

1. En el dashboard de Supabase, ve a **SQL Editor** (menú izquierdo).
2. Haz clic en **New Query**.
3. Copia y pega todo el contenido de `supabase/schema.sql`.
4. Haz clic en **Run** (o Ctrl+Enter).
5. Verifica que se han creado las tablas en **Table Editor**.

### Paso 3: Crear usuario administrador

1. Ve a **Authentication** > **Users** en el menú izquierdo.
2. Haz clic en **Add user** > **Create new user**.
3. Rellena:
   - **Email**: tu email (ej: `admin@granja.com`)
   - **Password**: una contraseña segura
   - Marca **Auto Confirm User**
4. Haz clic en **Create user**.

### Paso 4: Obtener credenciales

1. Ve a **Settings** (⚙️) > **API**.
2. Copia estos valores:
   - **Project URL**: algo como `https://abcdefghijk.supabase.co`
   - **anon public key**: una cadena larga que empieza por `eyJ...`

### Paso 5: Configurar el proyecto local

1. Clona o descarga este repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   cp .env.example .env
   ```
4. Edita `.env` con tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```

### Paso 6: Probar localmente

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Paso 7: Desplegar en Vercel

#### Opción A: Desde GitHub (recomendada)

1. Sube tu código a un repositorio de GitHub.
2. Ve a [https://vercel.com](https://vercel.com) y crea una cuenta (puedes usar GitHub).
3. Haz clic en **Add New** > **Project**.
4. Importa tu repositorio de GitHub.
5. Vercel detectará automáticamente que es un proyecto Vite.
6. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anon de Supabase
7. Haz clic en **Deploy**.
8. ¡Listo! Tu web estará disponible en `https://tu-proyecto.vercel.app`.

#### Opción B: Con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Añadir variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Desplegar a producción
vercel --prod
```

### Paso 8: Configurar dominio personalizado (opcional)

1. Compra un dominio (ej: `huevosdelagranja.es`) en cualquier registrador.
2. En Vercel, ve a tu proyecto > **Settings** > **Domains**.
3. Añade tu dominio y sigue las instrucciones para configurar los DNS.

---

## 📋 Estructura del proyecto

```
├── src/
│   ├── components/
│   │   ├── HomePage.tsx        # Página principal pública
│   │   ├── ReservationPage.tsx # Formulario de reserva
│   │   └── AdminPage.tsx       # Panel de administración
│   ├── lib/
│   │   ├── supabase.ts         # Cliente de Supabase
│   │   └── database.ts         # Funciones CRUD
│   ├── types.ts                # Tipos TypeScript
│   ├── store.ts                # Utilidades (precios, cálculos)
│   └── App.tsx                 # Componente principal
├── supabase/
│   └── schema.sql              # Esquema de la base de datos
├── .env.example                # Plantilla de variables de entorno
└── README.md                   # Este archivo
```

## 🔒 Seguridad

- La **anon key** de Supabase es pública y segura para usar en el frontend.
- La seguridad real está en las **RLS Policies** (Row Level Security) configuradas en `schema.sql`.
- Los clientes pueden:
  - ✅ Ver precios y stock
  - ✅ Crear reservas
- Solo el administrador autenticado puede:
  - ✅ Editar precios
  - ✅ Modificar stock
  - ✅ Gestionar reservas (marcar como recogidas/canceladas)
  - ✅ Ver y gestionar gastos

## 💰 Costes

| Concepto | Precio |
|----------|--------|
| Supabase (Free tier) | Gratis (hasta 500MB BD, 1GB archivos) |
| Vercel (Hobby) | Gratis |
| Dominio .es | ~10-15€/año |
| **Total** | **~1€/mes** |

## 🛠️ Tecnologías

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **Supabase** (PostgreSQL + Auth + RLS)
- **Vercel** para hosting

## 📞 Soporte

Si tienes problemas con el despliegue:
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
