"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  History,
  UserPlus,
  LogOut,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Shield,
  BarChart3,
  Settings,
  DoorOpen,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Entradas", href: "/dashboard/entradas", icon: DoorOpen },
  { name: "Alunos", href: "/dashboard/alunos", icon: Users },
  { name: "Turmas", href: "/dashboard/turmas", icon: BookOpen },
  { name: "Professores", href: "/dashboard/professores", icon: GraduationCap },
  { name: "Histórico", href: "/dashboard/historico", icon: History },
  { name: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
  { name: "Novo Aluno", href: "/dashboard/alunos/novo", icon: UserPlus },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const currentPage = menuItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href)
  );

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] font-sans">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-[#0d0d0d] flex flex-col justify-between transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div>
          <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 bg-[#c8102e] rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-white font-bold text-sm leading-tight">SENAI Monitor</p>
                <p className="text-white/30 text-xs">v2.0</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                    isActive
                      ? "bg-[#c8102e] text-white"
                      : "text-white/40 hover:text-white hover:bg-white/8"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {isActive && <ChevronRight size={14} className="opacity-60" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
              <div className="w-8 h-8 bg-[#c8102e]/20 rounded-full flex items-center justify-center text-[#c8102e] text-xs font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">Admin SENAI</p>
                <p className="text-white/30 text-xs truncate">admin@senai.br</p>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition w-full ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm">Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-white/20 hover:text-white/50 transition w-full mt-1 ${collapsed ? "justify-center" : ""}`}
          >
            <span className="text-xs">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span className="text-xs">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{currentPage?.name ?? "Dashboard"}</h1>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>SENAI Monitor</span>
              <ChevronRight size={10} />
              <span>{currentPage?.name ?? "Dashboard"}</span>
            </div>
          </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-700 font-medium">Sistema Online</span>
              </div>
            </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
