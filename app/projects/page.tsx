'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadedProjects from '@/components/UploadedProjects';
import { Building2, BrainCircuit, LineChart, Layers, ArrowRight, Lock, BookOpen, Search } from 'lucide-react';

const projects = [
  {
    id: 'realestate-predict',
    title: 'RealEstate Predict',
    subtitle: 'Sistema inteligente para estimar el precio de bienes raíces a partir de las características de una propiedad.',
    icon: Building2,
    badge: 'Operativo',
    active: true,
  },
  {
    id: 'credit-risk',
    title: 'CloudOps',
    subtitle: 'Evaluación algorítmica de riesgo crediticio e historial financiero para aprobación de préstamos.',
    icon: LineChart,
    badge: 'Operativo',
    active: true,
  },
  {
    id: 'demand-forecasting',
    title: 'Demand Forecasting',
    subtitle: 'Modelo predictivo de cadena de suministro e inventario para empresas retail y distribución.',
    icon: BrainCircuit,
    badge: 'Próximamente',
    active: false,
  },
  {
    id: 'nlp-contract-cms',
    title: 'Contract NLP CMS',
    subtitle: 'Gestor documental con procesamiento de lenguaje natural para auditoría legal de contratos.',
    icon: Layers,
    badge: 'Próximamente',
    active: false,
  },
];

export default function ProjectsCentral() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'realestate-predict') {
      router.push('/login');
    } else if (projectId === 'credit-risk') {
      // Redirige a tu segundo proyecto alojado en Vercel
      window.open('https://cloud-ops-dashboard-tau.vercel.app/login', '_blank');
    }
  };

  const q = query.trim().toLowerCase();
  const visible = projects.filter((p) => !q || `${p.title} ${p.subtitle}`.toLowerCase().includes(q));
  const operativos = projects.filter((p) => p.active).length;

  return (
    <div className="min-h-screen bg-[#070A12] text-white px-6 py-10 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Cabecera */}
        <header className="p-8 rounded-3xl bg-gradient-to-r from-[#0D1322] via-[#111A2E] to-[#0D1322] border border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Central de Proyectos & Módulos Académicos</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Gestor de Portafolio e Inteligencia Artificial</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Accede a los módulos predictivos, informes técnicos y datasets de tu cuenta, o sube tu propio proyecto en formato ZIP.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-2xl font-black text-emerald-400">{operativos}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Operativos</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-2xl font-black text-slate-300">{projects.length - operativos}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">En desarrollo</p>
            </div>
          </div>
        </header>

        {/* Buscador */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyecto…"
            className="w-full bg-[#0D1322] border border-slate-800 focus:border-blue-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500"
          />
        </div>

        {/* Proyectos del portafolio */}
        <section className="space-y-5">
          <div className="flex items-end justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-lg font-bold">Proyectos del portafolio</h2>
              <p className="text-xs text-slate-400 mt-1">Módulos desarrollados y publicados.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded-full px-3 py-1">
              {visible.length} {visible.length === 1 ? 'proyecto' : 'proyectos'}
            </span>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Ningún proyecto coincide con la búsqueda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {visible.map((proj) => {
                const Icon = proj.icon;
                return (
                  <div
                    key={proj.id}
                    onClick={() => proj.active && handleSelectProject(proj.id)}
                    className={`group h-full p-5 rounded-2xl border transition-all flex flex-col ${
                      proj.active
                        ? 'bg-[#0D1322]/80 border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer'
                        : 'bg-[#0D1322]/40 border-slate-800/40 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${proj.active ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        proj.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {proj.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mt-4 group-hover:text-blue-400 transition">{proj.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed flex-1">{proj.subtitle}</p>
                    <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      {proj.active ? (
                        <>
                          <span className="text-blue-400 font-semibold">Ingresar al sistema</span>
                          <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Módulo bloqueado</span>
                          <span className="text-slate-600">En desarrollo</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Proyectos subidos por el usuario */}
        <UploadedProjects query={query} />
      </div>
    </div>
  );
}