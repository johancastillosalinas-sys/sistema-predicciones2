'use client';

import React from 'react';
import { DataProvider } from '@/context/DataContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from './Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#08111f] text-slate-100 font-sans selection:bg-blue-500/25 selection:text-blue-200">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-[#060c17] py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>InmoPredict • Plataforma de Inteligencia Inmobiliaria & Central de Información</p>
              <p className="font-mono text-[11px] text-slate-400">
                Modelo de Colaboradores & Invitaciones por Correo estilo GitHub
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </DataProvider>
  );
}

