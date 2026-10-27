import type { ReactNode } from "react";
import type { Screen, Role, NavigationItem } from "../types/navigation";
import { colors } from "../constants/theme";
import { Icon, type IconName } from "../components/ui/Icon";
import logo from "../assets/logo.jpg";
interface MainLayoutProps {children:ReactNode;screen:Screen;role:Role;isPublic:boolean;currentLabel:string;visibleNav:NavigationItem[];onNavigate:(s:Screen)=>void;onLogout:()=>void}
const icons: Partial<Record<Screen,IconName>>={client:"home",reserve:"calendar","my-reservations":"search",admin:"home",daily:"calendar",tables:"table"};
export function MainLayout({children,screen,role,isPublic,currentLabel,visibleNav,onNavigate,onLogout}:MainLayoutProps) {
  if(isPublic)return <main style={{color:colors.ink,background:colors.paper}}>{children}</main>;
  return <div className="min-h-dvh" style={{background:colors.cream,color:colors.ink}}>
    <header className="border-b bg-white px-4 sm:px-6" style={{borderColor:colors.border}}><div className="max-w-6xl mx-auto flex min-h-20 items-center justify-between gap-3"><button type="button" onClick={()=>onNavigate(role==="admin"?"admin":"client")} className="flex items-center gap-3 min-h-12 text-left"><img src={logo} alt="" className="h-11 w-11 rounded-xl object-cover"/><span><strong className="block font-brand text-base sm:text-xl">Pizzaria Di Napoli</strong><span className="block text-xs" style={{color:colors.muted}}>{role==="admin"?"Área da equipe":"Reservas todos os dias"}</span></span></button>{role==="admin"&&<button type="button" onClick={onLogout} className="flex items-center justify-center gap-2 min-h-12 px-3 text-sm"><Icon name="logout" size={18}/>Sair</button>}</div></header>
    <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="hidden lg:block py-8 pr-5"><nav aria-label="Menu principal" className="grid gap-2">{visibleNav.map(n=><button type="button" key={n.screen} onClick={()=>onNavigate(n.screen)} aria-current={screen===n.screen?"page":undefined} className="flex items-center gap-3 text-left min-h-12 rounded-xl px-4 text-sm" style={{background:screen===n.screen?colors.redLight:"transparent",color:screen===n.screen?colors.redDark:colors.ink}}><Icon name={icons[n.screen]??"home"} size={20}/>{n.label}</button>)}</nav></aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:py-8 pb-28 lg:pb-10" aria-label={currentLabel}>{children}</main>
    </div>
    <nav aria-label="Menu principal no celular" className="mobile-nav fixed z-20 bottom-0 inset-x-0 grid grid-cols-3 border-t bg-white lg:hidden" style={{borderColor:colors.border}}>{visibleNav.map(n=><button key={n.screen} type="button" onClick={()=>onNavigate(n.screen)} aria-current={screen===n.screen?"page":undefined} className="flex flex-col items-center justify-center gap-1 px-1 py-3 min-h-16 text-[11px] font-medium" style={{color:screen===n.screen?colors.redDark:colors.muted,background:screen===n.screen?colors.redLight:"white"}}><Icon name={icons[n.screen]??"home"} size={22}/>{n.label}</button>)}</nav>
  </div>;
}
