import { useState } from "react";
import type { Screen } from "../../types/navigation";
import { colors, inputClass } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import logo from "../../assets/logo.jpg";
export function Login({go,onLogin}: {go:(s:Screen)=>void;onLogin:(username:string,password:string)=>boolean}) {
  const [username,setUsername]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  return <div className="grid min-h-dvh lg:grid-cols-2">
    <section className="flex flex-col justify-center items-center px-6 py-8 lg:p-12 text-white" style={{background:colors.red}}><img src={logo} alt="Pizzaria Di Napoli" className="h-16 w-16 lg:h-28 lg:w-28 rounded-2xl object-cover"/><h1 className="mt-4 font-brand text-2xl lg:text-4xl text-center">Pizzaria Di Napoli</h1><p className="mt-3 text-sm text-center text-white/90">Espaço de trabalho da equipe e administração.</p><div className="hidden lg:grid gap-3 mt-8 text-sm"><p className="flex items-center gap-3"><Icon name="calendar"/>Aberto todos os dias</p><p className="flex items-center gap-3"><Icon name="utensils"/>Rodízio de quarta a sábado</p><p className="flex items-center gap-3"><Icon name="truck"/>Delivery para Cocal do Sul</p></div></section>
    <section className="flex items-center justify-center px-5 py-8 lg:p-12"><div className="w-full max-w-sm"><h2 className="text-2xl font-semibold">Acesso da equipe</h2><p className="mt-2 mb-6 text-sm" style={{color:colors.muted}}>Entre com seu usuário e senha.</p>
      <form className="grid gap-4" onSubmit={e=>{e.preventDefault(); if(!onLogin(username,password))setError("Usuário ou senha incorretos.");}}>
        <div><label htmlFor="staff-username" className="block mb-2 text-sm font-medium">Usuário</label><input id="staff-username" required autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} placeholder="Seu usuário" value={username} onChange={e=>setUsername(e.target.value)}/></div>
        <div><label htmlFor="staff-password" className="block mb-2 text-sm font-medium">Senha</label><input id="staff-password" required autoComplete="current-password" className={inputClass} type="password" value={password} onChange={e=>setPassword(e.target.value)}/></div>
        {error&&<p role="alert" className="text-sm" style={{color:colors.redDark}}>{error}</p>}<Button primary full type="submit">Entrar</Button>
      </form><div className="mt-5 rounded-xl p-4 text-xs" style={{background:colors.cream}}><strong>Ambiente de demonstração</strong><p className="mt-1">Usuário: equipe · Senha: napoli-demo</p><p className="mt-2">A autenticação real será feita pelo servidor. Este endereço separado não substitui essa proteção.</p></div><div className="mt-4"><Button full onClick={()=>go("client")}>Voltar ao site</Button></div>
    </div></section>
  </div>;
}
