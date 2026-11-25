import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { condominios } from "./condominios";
import { demoPeople } from "./demo";
import "./style.css";

const KEY = "system-portaria-prototipo-v2";
const types = ["Proprietário", "Morador", "Visitante", "Prestador", "Colaborador"];
const authorizationByType = {
  Proprietário: ["Cadastro confirmado", "Interfone com morador", "Zeladoria", "Outro"],
  Morador: ["Cadastro confirmado", "Interfone com morador", "Zeladoria", "Outro"],
  Visitante: ["Interfone com morador", "Pré-liberação informada", "Morador presencial", "Zeladoria", "Outro"],
  Prestador: ["Interfone com morador", "Pré-liberação informada", "Morador presencial", "Zeladoria", "Outro"],
  Colaborador: ["Pré-liberação informada", "Zeladoria", "Interfone com morador", "Outro"]
};
const serviceTypes = ["Limpeza", "Manutenção", "Reforma", "Instalação", "Entrega de serviço", "Outro"];
const destinations = ["Armário", "Gaveta", "Coletada pelo morador", "Coletada pelo zelador", "Mesinha", "Clausura", "Centro de medição", "Outro local"];
const companies = ["Mercado Livre", "Correios", "Compra online", "Shopee", "Amazon", "Shein", "AliExpress", "Outros"];
const reasons = ["Entregador retornou com a encomenda devido à pressa", "Precisava de palavra-chave e o morador não atendeu", "Sem contato com a unidade", "Morador recusou a entrega", "Outros"];
const phoneDigits = value => (value || "").replace(/\D/g, "");
const validPhone = value => { const digits = phoneDigits(value); return (digits.length === 10 || digits.length === 11) && /^[1-9][0-9]/.test(digits) && !/^(\d)\1+$/.test(digits); };
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
  const unitRef = useRef(null);
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const [condo, setCondo] = useState(null);
  const [unitInput, setUnitInput] = useState("");
  const [unit, setUnit] = useState("");
  const [tab, setTab] = useState("Pessoas");
  const [name, setName] = useState("");
  const [type, setType] = useState("Morador");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [lookup, setLookup] = useState("");
  const [section, setSection] = useState("Atendimento");
  const [newRule, setNewRule] = useState("");
  const [modal, setModal] = useState(null);
  const [authorization, setAuthorization] = useState("Interfone com morador");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [otherAuthorization, setOtherAuthorization] = useState("");
  const [otherApprover, setOtherApprover] = useState("");
  const [movement, setMovement] = useState("Entrada");
  const [serviceType, setServiceType] = useState(serviceTypes[0]);
  const [otherService, setOtherService] = useState("");
  const [detail, setDetail] = useState("");
  const [destination, setDestination] = useState(destinations[0]);
  const [company, setCompany] = useState("");
  const [otherCompany, setOtherCompany] = useState("");
  const [outcome, setOutcome] = useState("Recebida");
  const [reason, setReason] = useState(reasons[0]);
  const [otherReason, setOtherReason] = useState("");
  const [otherDestination, setOtherDestination] = useState("");
  const [size, setSize] = useState("Pequena");
  const [packageType, setPackageType] = useState("Pacote");
  const [otherPackageType, setOtherPackageType] = useState("");
  const [message, setMessage] = useState("");
  const filtered = condominios.filter(c => normalize(c.nome).includes(normalize(query.trim())) || String(condominios.indexOf(c)).includes(query.trim()) && query.trim() !== "");
  const demo = condo?.id === "cond-001" && unit === "77" ? demoPeople : [];
  const custom = data.pessoas.filter(p => p.condominioId === condo?.id && p.unidade === unit);
  const people = [...demo.filter(p => !custom.some(c => c.id === p.id)), ...custom];
  const condoPeople = [...(condo?.id === "cond-001" ? demoPeople : []), ...data.pessoas.filter(p => p.condominioId === condo?.id)];
  const lookupResults = lookup.trim() ? condoPeople.filter(p => normalize(p.nome).includes(normalize(lookup.trim())) || normalize(p.veiculo || "").includes(normalize(lookup.trim()))) : [];
  const condoRecords = data.registros.filter(r => r.condominioId === condo?.id);
  const condoRules = data.regras?.[condo?.id] || [];
  const residents = people.filter(p => p.tipo === "Morador" || p.tipo === "Proprietário");
  const records = data.registros.filter(r => r.condominioId === condo?.id && r.unidade === unit);
  useEffect(() => { if (modal) dialogRef.current?.querySelector("select, input, button.close")?.focus(); }, [modal?.action]);
  useEffect(() => { if (condo && section === "Atendimento" && !unit) unitRef.current?.focus(); }, [condo?.id, section]);
  function moveList(event, selector, axis = "vertical") {
    const direction = axis === "horizontal" ? { ArrowRight: 1, ArrowLeft: -1 }[event.key] : { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!direction) return;
    const items = [...event.currentTarget.querySelectorAll(selector)];
    const current = items.indexOf(document.activeElement);
    if (current < 0 || !items.length) return;
    event.preventDefault();
    items[(current + direction + items.length) % items.length].focus();
  }
  function save(next) { setData(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function addPerson(event) {
    event.preventDefault();
    if (!name.trim()) return;
    save({ ...data, pessoas: [...data.pessoas, { id: crypto.randomUUID(), condominioId: condo.id, unidade: unit, nome: name.trim(), tipo: type, telefone: phone.trim(), veiculo: vehicle.trim().toUpperCase() }] });
    setName(""); setPhone(""); setVehicle(""); setMessage("Pessoa cadastrada nesta unidade, somente neste navegador.");
  }
  function openRecord(action, person = null) {
    setModal({ action, person });
    const initialAuthorization = (authorizationByType[person?.tipo] || authorizationByType.Visitante)[0];
    setAuthorization(initialAuthorization);
    setAuthorizedBy("");
    setOtherAuthorization(""); setOtherApprover(""); setMovement("Entrada"); setServiceType(serviceTypes[0]); setOtherService("");
    setDetail(""); setCompany(companies[0]); setOtherCompany(""); setDestination(destinations[0]); setOtherDestination("");
    setOutcome("Recebida"); setReason(reasons[0]); setOtherReason("");
    setSize("Pequena"); setPackageType("Pacote"); setOtherPackageType("");
  }
  function addRecord(event) {
    event.preventDefault();
    const isPackage = modal.action === "Encomenda";
    const person = modal.person;
    const actualCompany = company === "Outros" ? otherCompany.trim() : company;
    const actualDestination = destination === "Outro local" ? otherDestination.trim() : destination;
    const actualReason = reason === "Outros" ? otherReason.trim() : reason;
    const canSimulateSend = isPackage && person && (person.id.startsWith("demo-") || validPhone(person.telefone));
    const sendRequested = event.nativeEvent.submitter?.value === "send";
    if (sendRequested && !canSimulateSend) return;
    const record = {
      id: crypto.randomUUID(), condominioId: condo.id, unidade: unit,
      pessoaId: person?.id || null, pessoaNome: person?.nome || "Destinatário não cadastrado",
      categoria: isPackage ? "Encomenda" : person?.tipo, acao: modal.action,
      autorizacao: isPackage ? null : authorization === "Outro" ? otherAuthorization.trim() : authorization,
      autorizador: isPackage ? null : authorization === "Cadastro confirmado" ? person.nome : authorization === "Zeladoria" ? "Zeladoria" : authorizedBy === "Outro" ? otherApprover.trim() : authorizedBy || null,
      movimentacao: isPackage ? null : movement,
      servico: !isPackage && (person.tipo === "Prestador" || person.tipo === "Colaborador") ? (serviceType === "Outro" ? otherService.trim() : serviceType) : null,
      resultado: isPackage ? outcome : null, motivo: isPackage && outcome === "Não recebida" ? actualReason : null,
      destino: isPackage && outcome === "Recebida" ? actualDestination : null, empresa: isPackage ? actualCompany : null,
      tamanho: isPackage && outcome === "Recebida" ? size : null, tipoEncomenda: isPackage && outcome === "Recebida" ? (packageType === "Outros" ? otherPackageType.trim() : packageType) : null,
      detalhe: isPackage ? detail.trim() : "", criadoEm: new Date().toISOString(),
      envioWhatsapp: sendRequested ? "Simulado" : "Não solicitado"
    };
    save({ ...data, registros: [record, ...data.registros] });
    setModal(null); setMessage(sendRequested ? "Encomenda salva · envio ao WhatsApp simulado com sucesso. Nenhuma mensagem real foi enviada." : "Registro salvo neste navegador."); setTab("Histórico");
  }
  function selectCondo(c) { setCondo(c); setUnit(""); setUnitInput(""); setTab("Pessoas"); setSection("Atendimento"); setLookup(""); setMessage(""); }
  function addRule(event) {
    event.preventDefault();
    if (!newRule.trim()) return;
    save({ ...data, regras: { ...data.regras, [condo.id]: [...condoRules, { id: crypto.randomUUID(), texto: newRule.trim() }] } });
    setNewRule("");
  }
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
      <><div className="eyebrow">CONDOMÍNIO {condominios.indexOf(condo)} {condo.id === "cond-001" ? "· EMPRESA" : ""}</div><h1>{condo.nome}</h1><p className="lead">Encontre uma unidade, morador ou veículo e registre o atendimento.</p>
      <nav className="section-nav" aria-label="Seções do condomínio" onKeyDown={e => moveList(e, "button", "horizontal")}>{["Atendimento", "Encomendas", "Liberações", "Regras"].map(item => <button key={item} className={section === item ? "active" : ""} onClick={() => setSection(item)}>{item}</button>)}</nav>
      {section === "Regras" ? <div className="section-panel"><h2>Regras · {condo.nome}</h2><p className="muted">Cadastre orientações específicas deste condomínio para consultar durante o atendimento. Armazenamento local de demonstração.</p>{condoRules.length ? <div className="rule-list">{condoRules.map((rule, index) => <div className="rule-row" key={rule.id}><span>{index + 1}</span><p>{rule.texto}</p><button className="outline" type="button" aria-label={`Remover regra ${index + 1}`} onClick={() => save({ ...data, regras: { ...data.regras, [condo.id]: condoRules.filter(item => item.id !== rule.id) } })}>Remover</button></div>)}</div> : <div className="empty">Nenhuma regra cadastrada para este condomínio.</div>}<form className="rule-form" onSubmit={addRule}><label>Nova regra<textarea required value={newRule} onChange={e => setNewRule(e.target.value)} placeholder="Ex.: prestadores entram somente com autorização da zeladoria" /></label><button type="submit">Adicionar regra</button></form></div> :
      section === "Encomendas" || section === "Liberações" ? <div className="section-panel"><div className="section-head"><h2>{section} · {condo.nome}</h2><button className="outline" onClick={() => setSection("Atendimento")}>Abrir atendimento</button></div>{condoRecords.filter(r => section === "Encomendas" ? r.acao === "Encomenda" : r.acao !== "Encomenda").length ? condoRecords.filter(r => section === "Encomendas" ? r.acao === "Encomenda" : r.acao !== "Encomenda").map(r => <div className="entry" key={r.id}><div className="entry-icon">{r.acao === "Encomenda" ? "▣" : "↗"}</div><div className="entry-body"><strong>{r.pessoaNome} · unidade {r.unidade}</strong><p>{r.acao}{r.movimentacao ? " · " + r.movimentacao : ""}{r.resultado ? " · " + r.resultado : ""}{r.destino ? " · " + r.destino : ""}{r.autorizacao ? " · " + r.autorizacao : ""}</p></div><time>{new Date(r.criadoEm).toLocaleString("pt-BR")}</time></div>) : <div className="empty">Nenhum registro de {section.toLowerCase()} neste condomínio.</div>}</div> : <>
      <div className="lookup"><label htmlFor="person-search">Buscar pessoa ou veículo no condomínio</label><input id="person-search" value={lookup} onChange={e => setLookup(e.target.value)} onKeyDown={e => { if (e.key === "ArrowDown" && lookupResults.length) { e.preventDefault(); e.currentTarget.parentElement.querySelector(".lookup-results button")?.focus(); } else if (e.key === "Enter" && lookupResults.length) { e.preventDefault(); const p = lookupResults[0]; setUnit(p.unidade); setUnitInput(p.unidade); setTab("Pessoas"); setLookup(""); } }} placeholder="Nome do morador ou identificação do veículo" /><small className="keyboard-hint">Digite e pressione Enter para abrir o primeiro resultado; ↓ percorre a lista.</small>{lookup.trim() && <div className="lookup-results" onKeyDown={e => { if (e.key === "Escape") { document.getElementById("person-search")?.focus(); return; } moveList(e, "button"); }}>{lookupResults.length ? lookupResults.map(p => <button key={p.id} type="button" onClick={() => { setUnit(p.unidade); setUnitInput(p.unidade); setTab("Pessoas"); setLookup(""); }}><strong>{p.nome}</strong><span>{p.tipo} · unidade {p.unidade}{p.veiculo ? " · veículo " + p.veiculo : ""}</span><span>Ver unidade →</span></button>) : <p className="muted">Nenhuma pessoa ou veículo encontrado neste condomínio.</p>}</div>}</div>
      <form className="search-unit" onSubmit={e => { e.preventDefault(); if (unitInput.trim()) { setUnit(unitInput.trim()); setMessage(""); setTab("Pessoas"); } }}><label htmlFor="unit">Número ou identificação da unidade</label><div className="search-row"><input id="unit" ref={unitRef} autoComplete="off" placeholder={condo.id === "cond-001" ? "Ex.: 77" : "Ex.: 101, bloco A / 42"} value={unitInput} onChange={e => setUnitInput(e.target.value)} /><button type="submit">Abrir unidade →</button></div>{condo.id === "cond-001" && <p className="hint">Unidade de demonstração: 77</p>}</form>
      {unit && <><div className="unit-heading"><div><div className="eyebrow">ATENDIMENTO EM ANDAMENTO</div><h2>Unidade {unit}</h2><span className="muted">{condo.nome} · {people.length} pessoa(s) cadastrada(s)</span></div><button className="outline" onClick={() => openRecord("Encomenda")}>+ Registrar encomenda</button></div>
      {demo.length > 0 && <div className="notice demo-notice">Unidade de demonstração: telefones fictícios; o botão Salvar e enviar ao WhatsApp apenas simula o envio.</div>}
      {message && <p role="status" className="success">{message}</p>}
      <div className="tabs"><button className={tab === "Pessoas" ? "active" : ""} onClick={() => setTab("Pessoas")}>Pessoas cadastradas</button><button className={tab === "Histórico" ? "active" : ""} onClick={() => setTab("Histórico")}>Histórico ({records.length})</button></div>
      {tab === "Pessoas" ? <><div className="section-head"><h3>Pessoas da unidade</h3><span className="muted">Tab percorre os botões · ↑ ↓ muda de pessoa · ← → alterna a ação · Enter abre</span></div>{people.length ? <div className="people-list" onKeyDown={e => { const keys = { ArrowDown: 1, ArrowUp: -1 }; if (keys[e.key]) { const buttons = [...e.currentTarget.querySelectorAll(".person .actions button")]; const current = buttons.indexOf(document.activeElement); if (current >= 0) { e.preventDefault(); const next = current + keys[e.key] * 2; buttons[(next + buttons.length) % buttons.length]?.focus(); } } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const buttons = [...e.currentTarget.querySelectorAll(".person .actions button")]; const current = buttons.indexOf(document.activeElement); if (current >= 0) { e.preventDefault(); buttons[(current ^ 1)]?.focus(); } } }}>{people.map(p => <div className="person" key={p.id}><div className="person-top"><span className="avatar">{p.nome[0].toUpperCase()}</span><div className="person-info"><strong>{p.nome}</strong><small>{p.tipo} · {p.telefone || "Sem telefone"}{p.veiculo ? " · Veículo " + p.veiculo : ""}</small></div></div><div className="actions"><button title={`Registrar liberação de ${p.nome}`} aria-label={`Registrar liberação de ${p.nome}`} onClick={() => openRecord("Liberação", p)}>↗ <span>Liberação</span></button><button title={`Registrar encomenda para ${p.nome}`} aria-label={`Registrar encomenda para ${p.nome}`} onClick={() => openRecord("Encomenda", p)}>▣ <span>Encomenda</span></button></div></div>)}</div> : <div className="empty">Ainda não há pessoas cadastradas nesta unidade. Cadastre a primeira abaixo.</div>}
      <form className="register" onSubmit={addPerson}><h3>Adicionar pessoa à unidade</h3><div className="form-grid person-form-grid"><label>Nome<input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome ou identificação" /></label><label>Perfil<select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></label><label>Telefone (opcional)<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Use apenas dados fictícios" /></label><label>Veículo (opcional)<input value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="Identificação ou placa" /></label></div><button type="submit">Cadastrar pessoa</button></form></> :
      <div className="history">{records.length ? records.map(r => <div className="entry" key={r.id}>
        <div className="entry-icon">{r.acao === "Encomenda" ? "▣" : "↗"}</div>
        <div className="entry-body"><strong>{r.acao} · {r.pessoaNome}</strong>
          <p>{r.categoria}{r.movimentacao ? " · " + r.movimentacao : ""}{r.servico ? " · " + r.servico : ""}{r.resultado ? " · " + r.resultado : ""}{r.motivo ? " · " + r.motivo : ""}{r.autorizacao ? " · " + r.autorizacao : ""}{r.autorizador ? " · Autorizado por " + r.autorizador : ""}{r.destino ? " · " + r.destino : ""}{r.empresa ? " · " + r.empresa : ""}{r.detalhe ? " · " + r.detalhe : ""}</p>
          {r.envioWhatsapp === "Simulado" && <small className="simulated">✓ Envio ao WhatsApp simulado · nenhuma mensagem real enviada</small>}
        </div><time>{new Date(r.criadoEm).toLocaleString("pt-BR")}</time>
      </div>) : <div className="empty">Nenhum registro nesta unidade ainda.</div>}</div>}
      </>}</>}</>}
      </div>
    </main>
    {modal && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="dialog" ref={dialogRef} onSubmit={addRecord} onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); setModal(null); } }}><div className="dialog-head"><div><div className="eyebrow">{condo.nome.toUpperCase()} · UNIDADE {unit}</div><h2>Registrar {modal.action.toLowerCase()}</h2><p>{modal.person?.nome || "Selecione o destinatário"}</p></div><button type="button" className="close" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
    <div className="prefill"><strong>Dados do cadastro</strong><span>{modal.person ? modal.person.nome + " · " + modal.person.tipo + " · " + (modal.person.telefone || "Sem telefone") : "Unidade " + unit}</span><small>Condomínio e unidade preenchidos automaticamente; horário registrado ao salvar.</small></div>
    {modal.action === "Encomenda" ? <>
      <label>Destinatário<select value={modal.person?.id || ""} onChange={e => setModal({ ...modal, person: people.find(p => p.id === e.target.value) || null })}><option value="">Destinatário não cadastrado</option>{people.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
      <div className="choice-group" role="group" aria-label="Resultado da entrega"><button type="button" className={outcome === "Recebida" ? "chosen" : ""} onClick={() => setOutcome("Recebida")}>✓ Encomenda recebida</button><button type="button" className={outcome === "Não recebida" ? "chosen" : ""} onClick={() => setOutcome("Não recebida")}>↩ Não recebida</button></div>
      <label>Empresa que entregou<select value={company} onChange={e => setCompany(e.target.value)}>{companies.map(x => <option key={x}>{x}</option>)}</select></label>
      {company === "Outros" && <label>Qual empresa?<input required value={otherCompany} onChange={e => setOtherCompany(e.target.value)} placeholder="Nome da empresa" /></label>}
      {outcome === "Recebida" ? <>
        <div className="form-grid"><label>Tipo<select value={packageType} onChange={e => setPackageType(e.target.value)}>{["Pacote", "Envelope", "Caixa", "Sacola", "Documento", "Outros"].map(x => <option key={x}>{x}</option>)}</select></label><label>Tamanho<select value={size} onChange={e => setSize(e.target.value)}>{["Pequena","Média","Grande"].map(x => <option key={x}>{x}</option>)}</select></label></div>
        {packageType === "Outros" && <label>Qual tipo?<input required value={otherPackageType} onChange={e => setOtherPackageType(e.target.value)} placeholder="Tipo da encomenda" /></label>}
        <label>Onde ficou ou quem coletou<select value={destination} onChange={e => setDestination(e.target.value)}>{destinations.map(x => <option key={x}>{x}</option>)}</select></label>
        {destination === "Outro local" && <label>Qual local?<input required value={otherDestination} onChange={e => setOtherDestination(e.target.value)} placeholder="Local da encomenda" /></label>}
      </> : <><label>Motivo de não recebimento<select value={reason} onChange={e => setReason(e.target.value)}>{reasons.map(x => <option key={x}>{x}</option>)}</select></label>{reason === "Outros" && <label>Qual motivo?<input required value={otherReason} onChange={e => setOtherReason(e.target.value)} placeholder="Descreva o motivo" /></label>}</>}
      <p className="hint">O envio por WhatsApp é uma simulação nesta versão. Nenhuma mensagem real será enviada.</p>
    </> : <>
      <div className="choice-group" role="group" aria-label="Movimentação"><button type="button" className={movement === "Entrada" ? "chosen" : ""} onClick={() => setMovement("Entrada")}>↘ Entrada</button><button type="button" className={movement === "Saída" ? "chosen" : ""} onClick={() => setMovement("Saída")}>↗ Saída</button></div>
      {(modal.person?.tipo === "Prestador" || modal.person?.tipo === "Colaborador") && <><label>Tipo de serviço<select value={serviceType} onChange={e => setServiceType(e.target.value)}>{serviceTypes.map(x => <option key={x}>{x}</option>)}</select></label>{serviceType === "Outro" && <label>Qual serviço?<input required value={otherService} onChange={e => setOtherService(e.target.value)} /></label>}</>}
      <label>Como foi liberado?<select value={authorization} onChange={e => { setAuthorization(e.target.value); setAuthorizedBy(""); }}>{(authorizationByType[modal.person?.tipo] || authorizationByType.Visitante).map(x => <option key={x}>{x}</option>)}</select></label>
      {authorization === "Outro" && <label>Qual tipo de liberação?<input required value={otherAuthorization} onChange={e => setOtherAuthorization(e.target.value)} /></label>}
      {!["Cadastro confirmado", "Zeladoria"].includes(authorization) && <label>Quem liberou?<select value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} required><option value="" disabled>Selecione</option>{residents.filter(p => p.id !== modal.person?.id).map(p => <option key={p.id} value={p.nome}>{p.nome} · {p.tipo}</option>)}<option value="Outro">Outra pessoa / função</option></select></label>}
      {authorizedBy === "Outro" && !["Cadastro confirmado", "Zeladoria"].includes(authorization) && <label>Nome ou função de quem liberou<input required value={otherApprover} onChange={e => setOtherApprover(e.target.value)} /></label>}
      {authorization === "Pré-liberação informada" && <p className="hint">A pré-liberação ainda não é verificada por cadastro automático. Confirme a autorização antes de salvar.</p>}
    </>}
    {modal.action === "Encomenda" && <label>Observação (opcional)<textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="Informações adicionais" /></label>}<div className="dialog-actions"><button type="button" className="outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" value="save">Salvar</button>{modal.action === "Encomenda" && <button type="submit" value="send" disabled={!modal.person || !(modal.person.id.startsWith("demo-") || validPhone(modal.person.telefone))}>Salvar e enviar ao WhatsApp</button>}</div></form></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);

