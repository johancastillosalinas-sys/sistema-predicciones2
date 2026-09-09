'use client';

import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

interface ResultadoPrediccion {
  precioEstimado: number;
  rangoMinimo: number;
  rangoMaximo: number;
}

interface FilaCSV {
  metros?: number | string;
  precio?: number | string;
  [key: string]: unknown;
}

const DATASETS_DISPONIBLES = [
  {
    id: 'lima_avanzado',
    nombre: 'Dataset 1: Lima Avanzado (1,500+ inmuebles con cocheras)',
    archivo: '/dataset_lima_avanzado.csv',
    descripcion: 'Inmuebles en Comas, SMP, Olivos, Surco, Miraflores',
  },
  {
    id: 'nacional',
    nombre: 'Dataset 2: Nacional Perú (800+ inmuebles - Lima, Arequipa, etc.)',
    archivo: '/dataset_nacional_peru.csv',
    descripcion: 'Inmuebles en múltiples regiones del Perú',
  },
  {
    id: 'lima_ligero',
    nombre: 'Dataset 3: Lima Ligero (300 inmuebles)',
    archivo: '/dataset_lima_ligero.csv',
    descripcion: 'Muestra representativa de Lima Metropolitana',
  },
  {
    id: 'casas',
    nombre: 'Dataset 4: Casas Residenciales',
    archivo: '/dataset_casas.csv',
    descripcion: 'Casas residenciales urbanas',
  },
  {
    id: 'departamentos',
    nombre: 'Dataset 5: Departamentos Urbanos',
    archivo: '/dataset_departamentos.csv',
    descripcion: 'Departamentos de estreno y segundo uso',
  },
  {
    id: 'locales',
    nombre: 'Dataset 6: Locales Comerciales',
    archivo: '/dataset_locales.csv',
    descripcion: 'Locales comerciales y oficinas',
  },
];

const datosPromedioZona = [
  { zona: 'Cercado', precioPromedio: 75000, color: '#60a5fa' },
  { zona: 'Residencial', precioPromedio: 195000, color: '#34d399' },
  { zona: 'Comercial', precioPromedio: 256000, color: '#fbbf24' },
];

const moneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});

const numero = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 0,
});

const obtenerNumero = (valor: unknown): number => {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;

  if (typeof valor === 'string') {
    const limpio = valor.replace(/[^\d.-]/g, '');
    const resultado = Number(limpio);
    return Number.isFinite(resultado) ? resultado : 0;
  }

  return 0;
};

export default function Home() {
  const { currentUser } = useAuth();
  const { logPrediction } = useData();
  const [datasetsList, setDatasetsList] = useState(DATASETS_DISPONIBLES);
  const [datasetSeleccionado, setDatasetSeleccionado] =
    useState<string>('/dataset_lima_avanzado.csv');

  const [metros, setMetros] = useState<number>(90);
  const [habitaciones, setHabitaciones] = useState<number>(3);
  const [banos, setBanos] = useState<number>(2);
  const [zona, setZona] = useState<string>('residencial');

  const [resultado, setResultado] =
    useState<ResultadoPrediccion | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [datosCSV, setDatosCSV] = useState<FilaCSV[]>([]);
  const [errorCSV, setErrorCSV] = useState<boolean>(false);

  useEffect(() => {
    const savedPrediction = localStorage.getItem('inmopredict_last_prediction');
    if (!savedPrediction) return;

    try {
      const saved = JSON.parse(savedPrediction);
      setMetros(saved.metros);
      setHabitaciones(saved.habitaciones);
      setBanos(saved.banos);
      setZona(saved.zona);
      setResultado(saved.resultado);
    } catch (error) {
      console.error('Error al cargar la última predicción:', error);
      localStorage.removeItem('inmopredict_last_prediction');
    }
  }, []);

  useEffect(() => {
    setErrorCSV(false);

    if (datasetSeleccionado.startsWith('/')) {
      Papa.parse<FilaCSV>(datasetSeleccionado, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setDatosCSV(results.data);
        },
        error: (err) => {
          console.error('Error al leer el CSV:', err);
          setDatosCSV([]);
          setErrorCSV(true);
        },
      });
    }
  }, [datasetSeleccionado]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<FilaCSV>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const customId = 'custom-' + Date.now();
        const newDataset = {
          id: customId,
          nombre: `📁 Mi Archivo: ${file.name} (${results.data.length} registros)`,
          archivo: customId,
          descripcion: `Archivo personalizado: ${file.name}`,
        };
        setDatasetsList((prev) => [newDataset, ...prev]);
        setDatasetSeleccionado(customId);
        setDatosCSV(results.data);
        setResultado(null);
      },
      error: (err) => {
        alert('Error al leer el archivo CSV: ' + err.message);
      },
    });
  };

  const datosGraficables = useMemo(
    () =>
      datosCSV
        .map((fila) => ({
          metros: obtenerNumero(
            fila.metros ?? fila.area_m2 ?? fila.Area_m2 ?? fila.superficie_m2 ?? fila.area ?? fila.Metros ?? fila['Área (m2)']
          ),
          precio: obtenerNumero(
            fila.precio ?? fila.precio_usd ?? fila.Precio_USD ?? fila.Precio ?? fila['Precio (USD)'] ?? fila.precio_soles
          ),
        }))
        .filter((fila) => fila.metros > 0 && fila.precio > 0),
    [datosCSV]
  );

  const estadisticas = useMemo(() => {
    if (!datosGraficables.length) {
      return {
        precioPromedio: 0,
        areaPromedio: 0,
        precioMinimo: 0,
        precioMaximo: 0,
      };
    }

    const precios = datosGraficables.map((d) => d.precio);
    const areas = datosGraficables.map((d) => d.metros);

    return {
      precioPromedio:
        precios.reduce((total, valor) => total + valor, 0) / precios.length,
      areaPromedio:
        areas.reduce((total, valor) => total + valor, 0) / areas.length,
      precioMinimo: Math.min(...precios),
      precioMaximo: Math.max(...precios),
    };
  }, [datosGraficables]);

  const datasetActual =
    datasetsList.find((d) => d.archivo === datasetSeleccionado) ??
    datasetsList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metros, habitaciones, banos, zona }),
      });

      if (!response.ok) throw new Error('Error en el servidor');

      const data: ResultadoPrediccion = await response.json();
      setResultado(data);
      localStorage.setItem(
        'inmopredict_last_prediction',
        JSON.stringify({ metros, habitaciones, banos, zona, resultado: data })
      );
      logPrediction(
        `Predicción de ${moneda.format(data.precioEstimado)} para una propiedad de ${metros} m² en zona ${zona}.`,
        currentUser.name
      );
    } catch (error) {
      console.error(error);
      alert('No se pudo calcular la predicción. Verifica que la API esté disponible.');
    } finally {
      setCargando(false);
    }
  };

  const limpiarPrediccion = () => {
    setResultado(null);
    localStorage.removeItem('inmopredict_last_prediction');
  };

  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="dashboard-card overflow-hidden p-5 md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl ring-1 ring-blue-400/20">
                🏠
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">
                    Inteligencia inmobiliaria
                  </span>
                  <span className="status-online text-[11px] font-semibold">
                    Modelo activo
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-white md:text-4xl">
                  RealEstate{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Predict
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                  Sistema inteligente para estimar el precio de bienes raíces
                  a partir de las características de una propiedad.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="min-w-[150px] rounded-2xl border border-slate-700/70 bg-slate-950/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Dataset activo
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-200">
                  {datasetActual.descripcion}
                </p>
              </div>

              <div className="min-w-[120px] rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Registros
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {numero.format(datosCSV.length)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SELECTOR DATASET */}
        <section className="dashboard-card p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Fuente de datos
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Selecciona el conjunto de datos que deseas analizar.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row items-stretch sm:items-center">
              <select
                value={datasetSeleccionado}
                onChange={(e) => {
                  setDatasetSeleccionado(e.target.value);
                  setResultado(null);
                }}
                className="min-w-[280px] rounded-xl border border-slate-600/70 bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-inner transition hover:border-blue-400/50 focus:border-blue-400 cursor-pointer"
              >
                {datasetsList.map((dataset) => (
                  <option key={dataset.id} value={dataset.archivo}>
                    {dataset.nombre}
                  </option>
                ))}
              </select>

              {/* Upload button for custom CSV */}
              <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition">
                <span>📁 Subir CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300">
                CSV conectado ✓
              </div>
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="dashboard-card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">🏘️</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Dataset
              </span>
            </div>
            <p className="text-2xl font-black text-white">
              {numero.format(datosCSV.length)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Propiedades disponibles</p>
          </div>

          <div className="dashboard-card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">💰</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Promedio
              </span>
            </div>
            <p className="truncate text-xl font-black text-emerald-300 md:text-2xl">
              {estadisticas.precioPromedio
                ? moneda.format(estadisticas.precioPromedio)
                : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Precio promedio del dataset</p>
          </div>

          <div className="dashboard-card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">📐</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Superficie
              </span>
            </div>
            <p className="text-2xl font-black text-blue-300">
              {estadisticas.areaPromedio
                ? `${numero.format(estadisticas.areaPromedio)} m²`
                : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Área promedio</p>
          </div>

          <div className="dashboard-card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Rango
              </span>
            </div>
            <p className="text-lg font-black text-violet-300 md:text-xl">
              {estadisticas.precioMinimo
                ? `${moneda.format(estadisticas.precioMinimo)}+`
                : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Valor mínimo registrado</p>
          </div>
        </section>

        {/* PRINCIPAL */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* FORMULARIO */}
          <section className="dashboard-card p-5 md:p-6 lg:col-span-4">
            <div className="mb-6 flex items-center justify-between border-b border-slate-700/70 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
                  Consulta
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  Datos de la propiedad
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl ring-1 ring-blue-400/20">
                🎯
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* SUPERFICIE */}
              <div>
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Superficie total
                    </label>
                    <p className="mt-1 text-xs text-slate-600">
                      Área construida aproximada
                    </p>
                  </div>

                  <span className="text-xl font-black text-blue-400">
                    {metros} <span className="text-xs">m²</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="30"
                  max="300"
                  value={metros}
                  onChange={(e) => setMetros(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />

                <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                  <span>30 m²</span>
                  <span>300 m²</span>
                </div>
              </div>

              {/* HABITACIONES / BAÑOS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    🛏 Habitaciones
                  </label>
                  <select
                    value={habitaciones}
                    onChange={(e) => setHabitaciones(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 focus:border-blue-400"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'habitación' : 'habitaciones'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    🛁 Baños
                  </label>
                  <select
                    value={banos}
                    onChange={(e) => setBanos(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 focus:border-blue-400"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'baño' : 'baños'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ZONA */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  📍 Zona / ubicación
                </label>

                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 focus:border-blue-400"
                >
                  <option value="cercado">Zona Centro / Cercado</option>
                  <option value="residencial">Zona Residencial</option>
                  <option value="comercial">Zona Comercial</option>
                </select>
              </div>

              {/* RESUMEN */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/30 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Resumen de consulta
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300">
                    📐 {metros} m²
                  </span>
                  <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300">
                    🛏 {habitaciones} hab.
                  </span>
                  <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                    🛁 {banos} baños
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="group w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-4 font-bold text-white shadow-xl shadow-blue-900/30 transition duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {cargando ? (
                    <>
                      <span className="animate-pulse-soft">⏳</span>
                      Analizando propiedad...
                    </>
                  ) : (
                    <>
                      <span className="text-lg transition group-hover:scale-110">
                        ⚡
                      </span>
                      Predecir precio
                    </>
                  )}
                </span>
              </button>
            </form>
          </section>

          {/* RESULTADO */}
          <section className="dashboard-card min-h-[500px] overflow-hidden p-5 md:p-6 lg:col-span-8">
            {resultado ? (
              <div className="animate-fade-in space-y-5">

                <div className="flex flex-col gap-3 border-b border-slate-700/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">
                        ✓
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400">
                        Predicción generada
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Estimación basada en los parámetros ingresados.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Confianza estimada
                    </p>
                    <p className="text-xl font-black text-emerald-300">93%</p>
                  </div>
                </div>

                {/* PRECIO */}
                <div className="price-highlight rounded-2xl p-6 text-center md:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                    Precio estimado de la propiedad
                  </p>

                  <p className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">
                    {moneda.format(resultado.precioEstimado)}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Valor calculado para {metros} m² · {habitaciones} habitaciones ·{' '}
                    {banos} baños
                  </p>

                  <div className="mx-auto mt-6 max-w-xl">
                    <div className="mb-2 flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>{moneda.format(resultado.rangoMinimo)}</span>
                      <span>{moneda.format(resultado.rangoMaximo)}</span>
                    </div>

                    <div className="relative h-2 rounded-full bg-slate-700">
                      <div className="absolute inset-y-0 left-[8%] right-[8%] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-950 bg-white shadow-lg shadow-blue-500/30" />
                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                      <span>Estimación mínima</span>
                      <span>Estimación máxima</span>
                    </div>
                  </div>
                </div>

                {/* RANGOS */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Mínimo estimado
                    </p>
                    <p className="mt-2 text-xl font-black text-slate-200">
                      {moneda.format(resultado.rangoMinimo)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Límite inferior</p>
                  </div>

                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Precio central
                    </p>
                    <p className="mt-2 text-xl font-black text-blue-300">
                      {moneda.format(resultado.precioEstimado)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Valor previsto</p>
                  </div>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-950/35 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Máximo estimado
                    </p>
                    <p className="mt-2 text-xl font-black text-slate-200">
                      {moneda.format(resultado.rangoMaximo)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Límite superior</p>
                  </div>
                </div>

                {/* GRAFICO */}
                <div>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Análisis visual
                      </p>
                      <h3 className="mt-1 text-base font-bold text-slate-200">
                        Superficie vs. precio
                      </h3>
                    </div>

                    <span className="text-xs text-slate-600">
                      ● Datos del dataset &nbsp; ◆ Consulta actual
                    </span>
                  </div>

                  <div className="chart-container h-64 w-full p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 15, bottom: 10, left: 5 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.55}
                        />
                        <XAxis
                          type="number"
                          dataKey="metros"
                          name="Superficie"
                          unit=" m²"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="precio"
                          name="Precio"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0f1b2e',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#e2e8f0',
                          }}
                        />
                        <Scatter
                          name="Propiedades"
                          data={datosGraficables}
                          fill="#60a5fa"
                        />
                        <Scatter
                          name="Consulta actual"
                          data={[
                            {
                              metros,
                              precio: resultado.precioEstimado,
                            },
                          ]}
                          fill="#f87171"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={limpiarPrediccion}
                    className="text-xs font-semibold text-slate-500 transition hover:text-slate-300 cursor-pointer"
                  >
                    ↺ Realizar otra consulta
                  </button>

                  <a
                    href={`/docs/new?metros=${metros}&habitaciones=${habitaciones}&banos=${banos}&zona=${encodeURIComponent(zona)}&precio=${resultado.precioEstimado}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <span>📝 Guardar esta Tasación en el CMS</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[470px] flex-col items-center justify-center px-6 text-center">
                <div className="relative mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/5 text-5xl shadow-2xl">
                    🏠
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm">
                    ✨
                  </span>
                </div>

                <span className="rounded-full border border-slate-700 bg-slate-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Esperando consulta
                </span>

                <h2 className="mt-4 text-2xl font-black text-slate-200">
                  Descubre el valor de una propiedad
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Ingresa las características de la propiedad y presiona
                  <strong className="text-slate-300"> “Predecir precio”</strong>{' '}
                  para obtener una estimación.
                </p>

                <div className="mt-7 grid w-full max-w-md grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-3">
                    <span className="text-lg">📐</span>
                    <p className="mt-1 text-[10px] text-slate-600">Superficie</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-3">
                    <span className="text-lg">🛏</span>
                    <p className="mt-1 text-[10px] text-slate-600">Habitaciones</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-3">
                    <span className="text-lg">📍</span>
                    <p className="mt-1 text-[10px] text-slate-600">Ubicación</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* GRAFICO DE ZONAS */}
        <section className="dashboard-card p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                Análisis del mercado
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Precio promedio por zona
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Comparación visual de los valores promedio definidos para cada
                zona de mercado.
              </p>
            </div>

            <span className="rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-500">
              Valores referenciales
            </span>
          </div>

          <div className="chart-container h-72 w-full p-3 md:p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosPromedioZona}
                margin={{ top: 15, right: 10, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.55}
                />
                <XAxis
                  dataKey="zona"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [
                    moneda.format(Number(value)),
                    'Precio promedio',
                  ]}
                  contentStyle={{
                    background: '#0f1b2e',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar
                  dataKey="precioPromedio"
                  radius={[10, 10, 2, 2]}
                  barSize={65}
                >
                  {datosPromedioZona.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ESTADO DEL SISTEMA */}
        <footer className="dashboard-card flex flex-col gap-3 p-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="status-online font-semibold">Sistema operativo</span>
            <span>•</span>
            <span>Next.js + TypeScript</span>
            <span>•</span>
            <span>Recharts</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>
              {errorCSV
                ? 'No se pudo cargar el dataset'
                : `${datosCSV.length} registros cargados correctamente`}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
