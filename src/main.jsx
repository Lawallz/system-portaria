import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { condominios } from "./condominios";
import { demoPeople } from "./demo";
import "./style.css";

const KEY = "system-portaria-prototipo-v2";
const types = ["Proprietário", "Morador", "Visitante", "Prestador", "Colaborador"];
const authorizations = ["Interfone com morador", "Pré-liberação", "Morador presencial", "Zeladoria", "Cadastro confirmado", "Outro"];
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
    setAuthorizedBy(""); setDetail(""); setCompany(companies[0]); setOtherCompany(""); setDestination(destinations[0]); setOtherDestination("");
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
      autorizacao: isPackage ? null : authorization,
      autorizador: isPackage ? null : authorizedBy.trim(),
      resultado: isPackage ? outcome : null, motivo: isPackage && outcome === "Não recebida" ? actualReason : null,
      destino: isPackage && outcome === "Recebida" ? actualDestination : null, empresa: isPackage ? actualCompany : null,
      tamanho: isPackage && outcome === "Recebida" ? size : null, tipoEncomenda: isPackage && outcome === "Recebida" ? (packageType === "Outros" ? otherPackageType.trim() : packageType) : null,
      detalhe: detail.trim(), criadoEm: new Date().toISOString(),
      envioWhatsapp: sendRequested ? "Simulado" : "Não solicitado"
    };
    save({ ...data, registros: [record, ...data.registros] });
    setModal(null); setMessage(sendRequested ? "Encomenda salva · envio ao WhatsApp simulado com sucesso. Nenhuma mensagem real foi enviada." : "Registro salvo neste navegador."); setTab("Histórico");
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
      {demo.length > 0 && <div className="notice demo-notice">Unidade de demonstração: telefones fictícios; o botão Salvar e enviar ao WhatsApp apenas simula o envio.</div>}
      {message && <p role="status" className="success">{message}</p>}
      <div className="tabs"><button className={tab === "Pessoas" ? "active" : ""} onClick={() => setTab("Pessoas")}>Pessoas cadastradas</button><button className={tab === "Histórico" ? "active" : ""} onClick={() => setTab("Histórico")}>Histórico ({records.length})</button></div>
      {tab === "Pessoas" ? <><div className="section-head"><h3>Pessoas da unidade</h3><span className="muted">Encomendas e liberações diretamente em cada cadastro</span></div>{people.length ? <div className="cards">{people.map(p => <div className="person" key={p.id}><div className="person-top"><span className="avatar">{p.nome[0].toUpperCase()}</span><div><strong>{p.nome}</strong><small>{p.tipo} · {p.telefone || "Sem telefone"}</small></div></div><div className="actions"><button onClick={() => openRecord("Liberação", p)}>Registrar liberação</button><button onClick={() => openRecord("Encomenda", p)}>Encomenda</button></div></div>)}</div> : <div className="empty">Ainda não há pessoas cadastradas nesta unidade. Cadastre a primeira abaixo.</div>}
      <form className="register" onSubmit={addPerson}><h3>Adicionar pessoa à unidade</h3><div className="form-grid"><label>Nome<input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome ou identificação" /></label><label>Perfil<select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></label><label>Telefone (opcional)<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Use apenas dados fictícios" /></label></div><button type="submit">Cadastrar pessoa</button></form></> :
      <div className="history">{records.length ? records.map(r => <div className="entry" key={r.id}>
        <div className="entry-icon">{r.acao === "Encomenda" ? "▣" : "↗"}</div>
        <div className="entry-body"><strong>{r.acao} · {r.pessoaNome}</strong>
          <p>{r.categoria}{r.resultado ? " · " + r.resultado : ""}{r.motivo ? " · " + r.motivo : ""}{r.autorizacao ? " · " + r.autorizacao : ""}{r.autorizador ? " · Autorizado por " + r.autorizador : ""}{r.destino ? " · " + r.destino : ""}{r.empresa ? " · " + r.empresa : ""}{r.detalhe ? " · " + r.detalhe : ""}</p>
          {r.envioWhatsapp === "Simulado" && <small className="simulated">✓ Envio ao WhatsApp simulado · nenhuma mensagem real enviada</small>}
        </div><time>{new Date(r.criadoEm).toLocaleString("pt-BR")}</time>
      </div>) : <div className="empty">Nenhum registro nesta unidade ainda.</div>}</div>}
      </>}</>}
      </div>
    </main>
    {modal && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="dialog" onSubmit={addRecord}><div className="dialog-head"><div><div className="eyebrow">{condo.nome.toUpperCase()} · UNIDADE {unit}</div><h2>Registrar {modal.action.toLowerCase()}</h2><p>{modal.person?.nome || "Selecione o destinatário"}</p></div><button type="button" className="close" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
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
    </> : <><label>Tipo de movimentação<select value={detail} onChange={e => setDetail(e.target.value)} required><option value="">Selecione</option><option>Entrada</option><option>Saída</option></select></label><label>Forma de autorização<select value={authorization} onChange={e => setAuthorization(e.target.value)}>{authorizations.map(x => <option key={x}>{x}</option>)}</select></label><label>Quem autorizou / confirmou<input value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} placeholder="Nome ou função, quando aplicável" /></label></>}
    {modal.action === "Encomenda" && <label>Observação (opcional)<textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="Informações adicionais" /></label>}<div className="dialog-actions"><button type="button" className="outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit" value="save">Salvar</button>{modal.action === "Encomenda" && <button type="submit" value="send" disabled={!modal.person || !(modal.person.id.startsWith("demo-") || validPhone(modal.person.telefone))}>Salvar e enviar ao WhatsApp</button>}</div></form></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);

