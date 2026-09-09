'use client';

import { useRouter } from 'next/navigation';
import { 
  Building2, 
  BrainCircuit, 
  LineChart, 
  Layers, 
  ArrowRight, 
  Lock, 
  BookOpen 
} from 'lucide-react';

export default function ProjectsCentral() {
  const router = useRouter(); // Corregido: useRouter() en lugar de Router()

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'realestate-predict') {
      router.push('/login');
    }
  };

  const projects = [
    {
      id: 'realestate-predict',
      title: 'RealEstate Predict',
      subtitle: 'Sistema inteligente para estimar el precio de bienes raíces a partir de las características de una propiedad.',
      icon: Building2,
      badge: 'Operativo',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      active: true,
    },
    {
      id: 'credit-risk',
      title: 'CreditRisk Analysis',
      subtitle: 'Evaluación algorítmica de riesgo crediticio e historial financiero para aprobación de préstamos.',
      icon: LineChart,
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      active: false,
    },
    {
      id: 'demand-forecasting',
      title: 'Demand Forecasting',
      subtitle: 'Modelo predictivo de cadena de suministro e inventario para empresas retail y distribución.',
      icon: BrainCircuit,
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      active: false,
    },
    {
      id: 'nlp-contract-cms',
      title: 'Contract NLP CMS',
      subtitle: 'Gestor documental con procesamiento de lenguaje natural para auditoría legal de contratos.',
      icon: Layers,
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Banner Informativo Superior (Estilo Blackboard) */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0D1322] via-[#111A2E] to-[#0D1322] border border-slate-800 shadow-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Central de Proyectos & Módulos Académicos</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Bienvenido al Gestor de Portafolio e Inteligencia Artificial
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Selecciona uno de los contenedores de proyectos para acceder a las tareas, informes técnicos, datasets y módulos predictivos asignados a tu cuenta.
          </p>
        </div>

        {/* Cuadrícula de 4 Bloques / Cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const Icon = proj.icon;
            return (
              <div
                key={proj.id}
                onClick={() => proj.active && handleSelectProject(proj.id)}
                className={`group p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  proj.active
                    ? 'bg-[#0D1322]/80 border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer'
                    : 'bg-[#0D1322]/40 border-slate-800/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${
                      proj.active 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${proj.badgeColor}`}>
                      {proj.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {proj.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  {proj.active ? (
                    <>
                      <span className="text-blue-400 font-semibold">Ingresar al sistema</span>
                      <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Módulo Bloqueado
                      </span>
                      <span className="text-slate-600">En desarrollo</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}