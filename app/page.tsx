'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  GitCommit, 
  Clock 
} from 'lucide-react';
import InviteModal from '@/components/InviteModal';

export default function UnifiedDashboard() {
  const { docs, users, invitations, logs } = useData();
  const { currentUser, currentRole, isAdmin } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const router = useRouter();

  // Redirige a la central de proyectos estilo Blackboard si no hay usuario autenticado
  useEffect(() => {
    if (!currentUser) {
      router.push('/projects');
    }
  }, [currentUser, router]);

  // Evita el parpadeo de contenido mientras redirige
  if (!currentUser) {
    return null;
  }

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0d1b33] to-[#07162c] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conectado como {currentUser.name} ({currentRole})</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Central de Inteligencia & Predicción Inmobiliaria
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Plataforma integral que combina el <strong>motor algorítmico de predicción de precios</strong>, un <strong>CMS de informes periciales y metodologías con versionado de commits</strong>, y <strong>control de acceso por invitación vía correo electrónico estilo GitHub</strong>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/predictor"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Abrir Predictor de Precios</span>
            </Link>

            {isAdmin ? (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Invitar por Correo</span>
              </button>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
                Solo el Administrador puede invitar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Predictor Engine Status */}
        <Link
          href="/predictor"
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Motor Predictor
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">3 Datasets</span>
            <span className="text-xs text-emerald-400 font-medium">● Operativo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Casas, Departamentos y Locales</p>
        </Link>

        {/* CMS Reports */}
        <Link
          href="/docs"
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Informes en el CMS
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{docs.length}</span>
            <span className="text-xs text-slate-400">publicaciones</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Metodología y estudios de mercado</p>
        </Link>

        {/* Active Members */}
        <Link
          href="/colaboradores"
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Colaboradores
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{users.length}</span>
            <span className="text-xs text-indigo-400 font-medium">autorizados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Admins, Tasadores e Inversionistas</p>
        </Link>

        {/* Pending Invites */}
        <Link
          href="/colaboradores"
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Invitaciones por Correo
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingInvites.length}</span>
            <span className="text-xs text-amber-400 font-medium">pendientes de aceptar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Acceso por token único de 7 días</p>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent CMS Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Informes Técnicos & Metodología de Tasación (CMS)</span>
            </h2>
            <Link
              href="/docs"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Ver todos ({docs.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30">
                        {doc.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        v{doc.currentVersion} • {doc.versions.length} commits de tasación
                      </span>
                    </div>
                    <Link
                      href={`/docs/${doc.id}`}
                      className="block text-base font-bold text-white hover:text-blue-400 transition"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">{doc.authorName}</span>
                    <span>•</span>
                    <span>Actualizado: {doc.updatedAt}</span>
                  </div>
                  <Link
                    href={`/docs/${doc.id}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                  >
                    Consultar informe <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick link to the predictor */}
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">¿Necesitas estimar el valor de un inmueble?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Utiliza el motor de regresión con gráficos interactivos para calcular valores en soles por m², habitaciones y zona.
              </p>
            </div>
            <Link
              href="/predictor"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 whitespace-nowrap transition"
            >
              Ir al Predictor &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: GitHub-style Access Explanation & Logs */}
        <div className="space-y-6">
          {/* Card for Academic Demonstration */}
          <div className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-slate-950/60 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Acceso estilo GitHub por Correo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Como <strong>Administrador Central</strong>, tú decides quién puede entrar a la plataforma:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
              <li>Ingresas el correo institucional o personal del invitado.</li>
              <li>Le asignas un rol: <strong>Tasador (Editor)</strong> o <strong>Inversionista (Lector)</strong>.</li>
              <li>El sistema emite un <strong>token único</strong> y un enlace directo.</li>
              <li>El usuario acepta la invitación y se activa con sus permisos correspondientes.</li>
            </ul>

            <Link
              href="/colaboradores"
              className="mt-2 inline-flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver Panel de Colaboradores</span>
            </Link>
          </div>

          {/* Activity / Audit Feed */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Registro de Actividad en Tiempo Real</span>
            </h3>

            <div className="space-y-3.5">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 p-1 rounded-full bg-slate-800 text-blue-400 shrink-0">
                    <GitCommit className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-200 leading-snug">{log.description}</p>
                    <p className="text-[11px] text-slate-500">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}