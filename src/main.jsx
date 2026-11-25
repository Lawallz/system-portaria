import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { condominios } from "./condominios";
import { demoPeople } from "./demo";
import "./style.css";

const KEY = "system-portaria-prototipo-v2";
const types = ["Proprietário", "Morador", "Visitante", "Prestador", "Colaborador"];
const authorizations = ["Interfone com morador", "Pré-liberação", "Morador presencial", "Zeladoria", "Cadastro confirmado", "Outro"];
const destinations = ["Armário", "Gaveta", "Coletada pelo morador", "Coletada pelo zelador", "Mesinha", "Clausura", "Centro de medição", "Outro local"];
const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function initialData() {
  try {
    const current = JSON.parse(localStorage.getItem(KEY));
    if (current && Array.isArray(current.pessoas) && Array.isArray(current.registros)) return current;
    const previous = JSON.parse(localStorage.getItem("system-portaria-prototipo-v1"));
    if (previous && Array.isArray(previous.pessoas) && Array.isArray(previous.registros)) return previous;
  } catch {}
  return { pessoas: [], registros: [] };
}
function App() {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [condo, setCondo] = useState(null);
  const [unitInput, setUnitInput] = useState("");
  const [unit, setUnit] = useState("");
  const [tab, setTab] = useState("Pessoas");
  const [name, setName] = useState("");
  const [type, setType] = useState("Morador");
  const [phone, setPhone] = useState("");
  const [modal, setModal] = useState(null);
  const [authorization, setAuthorization] = useState(authorizations[0]);
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [detail, setDetail] = useState("");
  const [destination, setDestination] = useState(destinations[0]);
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("Pequena");
  const [packageType, setPackageType] = useState("Pacote");
  const [message, setMessage] = useState("");
  const filtered = condominios.filter(c => normalize(c.nome).includes(normalize(query.trim())) || String(condominios.indexOf(c)).includes(query.trim()) && query.trim() !== "");
  const demo = condo?.id === "cond-001" && unit === "77" ? demoPeople : [];
  const custom = data.pessoas.filter(p => p.condominioId === condo?.id && p.unidade === unit);
  const people = [...demo.filter(p => !custom.some(c => c.id === p.id)), ...custom];
  const records = data.registros.filter(r => r.condominioId === condo?.id && r.unidade === unit);
  function save(next) { setData(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function addPerson(event) {
    event.preventDefault();
    if (!name.trim()) return;
    save({ ...data, pessoas: [...data.pessoas, { id: crypto.randomUUID(), condominioId: condo.id, unidade: unit, nome: name.trim(), tipo: type, telefone: phone.trim() }] });
    setName(""); setPhone(""); setMessage("Pessoa cadastrada nesta unidade, somente neste navegador.");
  }
  function openRecord(action, person = null) {
    setModal({ action, person });
    setAuthorization(person?.tipo === "Visitante" ? "Interfone com morador" : person?.tipo === "Proprietário" || person?.tipo === "Morador" ? "Cadastro confirmado" : "Pré-liberação");
    setAuthorizedBy(""); setDetail(""); setCompany(""); setDestination(destinations[0]);
    setSize("Pequena"); setPackageType("Pacote");
  }
  function addRecord(event) {
    event.preventDefault();
    const isPackage = modal.action === "Encomenda";
    const person = modal.person;
    const record = {
      id: crypto.randomUUID(), condominioId: condo.id, unidade: unit,
      pessoaId: person?.id || null, pessoaNome: person?.nome || "Destinatário não cadastrado",
      categoria: isPackage ? "Encomenda" : person?.tipo, acao: modal.action,
      autorizacao: isPackage ? null : authorization,
      autorizador: isPackage ? null : authorizedBy.trim(),
      destino: isPackage ? destination : null, empresa: isPackage ? company.trim() : null,
      tamanho: isPackage ? size : null, tipoEncomenda: isPackage ? packageType.trim() : null,
      detalhe: detail.trim(), criadoEm: new Date().toISOString()
    };
    save({ ...data, registros: [record, ...data.registros] });
    setModal(null); setMessage("Registro salvo neste navegador."); setTab("Histórico");
  }
  function selectCondo(c) { setCondo(c); setUnit(""); setUnitInput(""); setTab("Pessoas"); setMessage(""); }
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">◆</span><div><strong>system<span>portaria</span></strong><small>Central de operações</small></div></div>
      <div className="side-heading">CONDOMÍNIOS <span>{condominios.length} · 0–52</span></div>
      <input aria-label="Buscar condomínio" placeholder="Buscar nome ou número..." value={query} onChange={e => setQuery(e.target.value)} />
      <div className="condo-list">{filtered.map(c => <button key={c.id} className={condo?.id === c.id ? "condo selected" : "condo"} onClick={() => selectCondo(c)}><span className="condo-mark">{condominios.indexOf(c)}</span><span>{c.nome}</span><span className="chev">›</span></button>)}{filtered.length === 0 && <p className="muted">Nenhum condomínio encontrado.</p>}</div>
      <div className="side-footer">Protótipo local · sem sincronização</div>
    </aside>
    <main>
      <header><div className="crumb">Operações <span>/</span> {condo?.nome || "Visão geral"} {unit && <> <span>/</span> Unidade {unit}</>}</div><span className="status">● Ambiente de demonstração</span></header>
      <div className="content">
      {!condo ? <><div className="eyebrow">SISTEMA DE PORTARIA</div><h1>Um fluxo mais simples para cada atendimento.</h1><p className="lead">Selecione um condomínio para localizar uma unidade e registrar movimentações sem redigitar os dados de cada pessoa.</p><div className="welcome-grid"><div className="tile"><strong>0</strong><span>Rendall · empresa</span></div><div className="tile"><strong>52</strong><span>Condomínios atendidos</span></div><div className="tile"><strong>77</strong><span>Unidade de demonstração</span></div></div><div className="notice">Para testar: selecione Rendall (0) e abra a unidade 77. Os dados e registros são demonstrativos e ficam neste navegador.</div></> :
      <><div className="eyebrow">CONDOMÍNIO {condominios.indexOf(condo)} {condo.id === "cond-001" ? "· EMPRESA" : ""}</div><h1>{condo.nome}</h1><p className="lead">Pesquise uma unidade para ver pessoas e lançar atendimentos.</p>
      <form className="search-unit" onSubmit={e => { e.preventDefault(); if (unitInput.trim()) { setUnit(unitInput.trim()); setMessage(""); setTab("Pessoas"); } }}><label htmlFor="unit">Número ou identificação da unidade</label><div className="search-row"><input id="unit" autoComplete="off" placeholder={condo.id === "cond-001" ? "Ex.: 77" : "Ex.: 101, bloco A / 42"} value={unitInput} onChange={e => setUnitInput(e.target.value)} /><button type="submit">Abrir unidade →</button></div>{condo.id === "cond-001" && <p className="hint">Unidade de demonstração: 77</p>}</form>
      {unit && <><div className="unit-heading"><div><div className="eyebrow">ATENDIMENTO EM ANDAMENTO</div><h2>Unidade {unit}</h2><span className="muted">{condo.nome} · {people.length} pessoa(s) cadastrada(s)</span></div><button className="outline" onClick={() => openRecord("Encomenda")}>+ Registrar encomenda</button></div>
      {demo.length > 0 && <div className="notice demo-notice">Dados demonstrativos da unidade 77: nomes fornecidos por você; perfis e telefones fictícios. Nenhuma mensagem será enviada.</div>}
      {message && <p role="status" className="success">{message}</p>}
      <div className="tabs"><button className={tab === "Pessoas" ? "active" : ""} onClick={() => setTab("Pessoas")}>Pessoas cadastradas</button><button className={tab === "Histórico" ? "active" : ""} onClick={() => setTab("Histórico")}>Histórico ({records.length})</button></div>
      {tab === "Pessoas" ? <><div className="section-head"><h3>Pessoas da unidade</h3><span className="muted">Encomendas e liberações diretamente em cada cadastro</span></div>{people.length ? <div className="cards">{people.map(p => <div className="person" key={p.id}><div className="person-top"><span className="avatar">{p.nome[0].toUpperCase()}</span><div><strong>{p.nome}</strong><small>{p.tipo} · {p.telefone || "Sem telefone"}</small></div></div><div className="actions"><button onClick={() => openRecord("Liberação", p)}>Registrar liberação</button><button onClick={() => openRecord("Encomenda", p)}>Encomenda</button></div></div>)}</div> : <div className="empty">Ainda não há pessoas cadastradas nesta unidade. Cadastre a primeira abaixo.</div>}
      <form className="register" onSubmit={addPerson}><h3>Adicionar pessoa à unidade</h3><div className="form-grid"><label>Nome<input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome ou identificação" /></label><label>Perfil<select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></label><label>Telefone (opcional)<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Use apenas dados fictícios" /></label></div><button type="submit">Cadastrar pessoa</button></form></> :
      <div className="history">{records.length ? records.map(r => <div className="entry" key={r.id}><div className="entry-icon">{r.acao === "Encomenda" ? "▣" : "↗"}</div><div><strong>{r.acao} · {r.pessoaNome}</strong><p>{r.categoria}{r.autorizacao ? " · " + r.autorizacao : ""}{r.autorizador ? " · Autorizado por " + r.autorizador : ""}{r.destino ? " · " + r.destino : ""}{r.empresa ? " · " + r.empresa : ""}{r.detalhe ? " · " + r.detalhe : ""}</p></div><time>{new Date(r.criadoEm).toLocaleString("pt-BR")}</time></div>) : <div className="empty">Nenhum registro nesta unidade ainda.</div>}</div>}
      </>}</>}
      </div>
    </main>
    {modal && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="dialog" onSubmit={addRecord}><div className="dialog-head"><div><div className="eyebrow">{condo.nome.toUpperCase()} · UNIDADE {unit}</div><h2>Registrar {modal.action.toLowerCase()}</h2><p>{modal.person?.nome || "Selecione o destinatário"}</p></div><button type="button" className="close" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
    <div className="prefill"><strong>Dados do cadastro</strong><span>{modal.person ? modal.person.nome + " · " + modal.person.tipo + " · " + (modal.person.telefone || "Sem telefone") : "Unidade " + unit}</span><small>Condomínio e unidade preenchidos automaticamente; horário registrado ao salvar.</small></div>
    {modal.action === "Encomenda" ? <><label>Destinatário<select value={modal.person?.id || ""} onChange={e => setModal({ ...modal, person: people.find(p => p.id === e.target.value) || null })}><option value="">Destinatário não cadastrado</option>{people.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label><div className="form-grid"><label>Tipo<input value={packageType} onChange={e => setPackageType(e.target.value)} /></label><label>Tamanho<select value={size} onChange={e => setSize(e.target.value)}>{["Pequena","Média","Grande"].map(x => <option key={x}>{x}</option>)}</select></label></div><label>Empresa que entregou<input value={company} onChange={e => setCompany(e.target.value)} placeholder="Ex.: Mercado Livre" /></label><label>Onde ficou ou quem coletou<select value={destination} onChange={e => setDestination(e.target.value)}>{destinations.map(x => <option key={x}>{x}</option>)}</select></label><p className="hint">Notificações ainda não estão integradas.</p></> : <><label>Tipo de movimentação<select value={detail} onChange={e => setDetail(e.target.value)} required><option value="">Selecione</option><option>Entrada</option><option>Saída</option></select></label><label>Forma de autorização<select value={authorization} onChange={e => setAuthorization(e.target.value)}>{authorizations.map(x => <option key={x}>{x}</option>)}</select></label><label>Quem autorizou / confirmou<input value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} placeholder="Nome ou função, quando aplicável" /></label></>}
    {modal.action === "Encomenda" && <label>Observação (opcional)<textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="Informações adicionais" /></label>}<div className="dialog-actions"><button type="button" className="outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit">Salvar registro</button></div></form></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);

