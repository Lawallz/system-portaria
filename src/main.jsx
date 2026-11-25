import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { condominios } from "./condominios";
import "./style.css";

const KEY = "system-portaria-prototipo-v1";
const tipos = ["Morador", "Visitante", "Prestador", "Colaborador"];
const autorizacoes = ["Interfone com morador", "Pré-liberação", "Morador presencial", "Zeladoria", "Cadastro confirmado", "Outro"];
const destinos = ["Armário", "Gaveta", "Coletada pelo morador", "Coletada pelo zelador", "Mesinha", "Clausura", "Centro de medição", "Outro local"];
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function readData() { try { return JSON.parse(localStorage.getItem(KEY)) || { pessoas: [], registros: [] }; } catch { return { pessoas: [], registros: [] }; } }
function App() {
  const [data, setData] = useState(readData);
  const [query, setQuery] = useState("");
  const [condominio, setCondominio] = useState(null);
  const [unidade, setUnidade] = useState("");
  const [unidadeAberta, setUnidadeAberta] = useState("");
  const [aba, setAba] = useState("Pessoas");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Morador");
  const [documento, setDocumento] = useState("");
  const [modal, setModal] = useState(null);
  const [autorizacao, setAutorizacao] = useState(autorizacoes[0]);
  const [autorizador, setAutorizador] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [destino, setDestino] = useState(destinos[0]);
  const [empresa, setEmpresa] = useState("");
  const [tamanho, setTamanho] = useState("Pequena");
  const [tipoEncomenda, setTipoEncomenda] = useState("Pacote");
  const [mensagem, setMensagem] = useState("");
  const filtered = useMemo(() => condominios.filter(c => normalize(c.nome).includes(normalize(query.trim()))), [query]);
  const pessoas = data.pessoas.filter(p => p.condominioId === condominio?.id && p.unidade === unidadeAberta);
  const registros = data.registros.filter(r => r.condominioId === condominio?.id && r.unidade === unidadeAberta);
  function save(next) { setData(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function addPessoa(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    save({ ...data, pessoas: [...data.pessoas, { id: crypto.randomUUID(), condominioId: condominio.id, unidade: unidadeAberta, nome: nome.trim(), tipo, documento: documento.trim() }] });
    setNome(""); setDocumento(""); setMensagem("Pessoa cadastrada nesta unidade.");
  }
  function addRegistro(e) {
    e.preventDefault();
    const isPackage = modal.acao === "Encomenda";
    const registro = {
      id: crypto.randomUUID(), condominioId: condominio.id, unidade: unidadeAberta,
      pessoaId: modal.pessoa?.id || null, pessoaNome: modal.pessoa?.nome || "Destinatário não cadastrado",
      categoria: isPackage ? "Encomenda" : modal.pessoa?.tipo, acao: modal.acao,
      autorizacao: isPackage ? null : autorizacao,
      autorizador: isPackage ? null : autorizador.trim(),
      destino: isPackage ? destino : null, empresa: isPackage ? empresa.trim() : null,
      tamanho: isPackage ? tamanho : null, tipoEncomenda: isPackage ? tipoEncomenda.trim() : null,
      detalhe: detalhe.trim(), criadoEm: new Date().toISOString()
    };
    save({ ...data, registros: [registro, ...data.registros] });
    setModal(null); setDetalhe(""); setAutorizador(""); setEmpresa("");
    setMensagem("Registro salvo neste navegador.");
    setAba("Histórico");
  }
  function chooseCondo(c) { setCondominio(c); setUnidade(""); setUnidadeAberta(""); setMensagem(""); setAba("Pessoas"); }
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">◆</span><div><strong>system<span>portaria</span></strong><small>Central de operações</small></div></div>
      <div className="side-heading">CONDOMÍNIOS <span>{condominios.length}</span></div>
      <input aria-label="Buscar condomínio" placeholder="Buscar condomínio..." value={query} onChange={e => setQuery(e.target.value)} />
      <div className="condo-list">{filtered.map(c => <button key={c.id} className={condominio?.id === c.id ? "condo selected" : "condo"} onClick={() => chooseCondo(c)}><span className="condo-mark">{c.nome.slice(0, 1).toUpperCase()}</span><span>{c.nome}</span><span className="chev">›</span></button>)}{!filtered.length && <p className="muted">Nenhum condomínio encontrado.</p>}</div>
      <div className="side-footer">Protótipo local · sem sincronização</div>
    </aside>
    <main>
      <header><div className="crumb">Operações <span>/</span> {condominio?.nome || "Visão geral"} {unidadeAberta && <> <span>/</span> Unidade {unidadeAberta}</>}</div><span className="status">● Ambiente de demonstração</span></header>
      <div className="content">
      {!condominio ? <><div className="eyebrow">SISTEMA DE PORTARIA</div><h1>Um fluxo mais simples para cada atendimento.</h1><p className="lead">Selecione um condomínio à esquerda para localizar uma unidade, consultar pessoas e registrar movimentações.</p><div className="welcome-grid"><div className="tile"><strong>{condominios.length}</strong><span>Condomínios cadastrados</span></div><div className="tile"><strong>01</strong><span>Unidade por atendimento</span></div><div className="tile"><strong>03</strong><span>Ações rápidas por pessoa</span></div></div><div className="notice">Os nomes foram cadastrados como você informou. Cadastros e registros feitos aqui ficam somente neste navegador.</div></> :
      <><div className="eyebrow">CONDOMÍNIO SELECIONADO</div><h1>{condominio.nome}</h1><p className="lead">Localize a unidade para iniciar o atendimento.</p>
      <form className="search-unit" onSubmit={e => { e.preventDefault(); if (unidade.trim()) { setUnidadeAberta(unidade.trim()); setMensagem(""); setAba("Pessoas"); } }}><label htmlFor="unit">Número ou identificação da unidade</label><div className="search-row"><input id="unit" autoComplete="off" placeholder="Ex.: 101, bloco A / 42" value={unidade} onChange={e => setUnidade(e.target.value)} /><button type="submit">Abrir unidade →</button></div></form>
      {unidadeAberta && <><div className="unit-heading"><div><div className="eyebrow">ATENDIMENTO EM ANDAMENTO</div><h2>Unidade {unidadeAberta}</h2><span className="muted">{condominio.nome} · {pessoas.length} pessoa(s) cadastrada(s)</span></div><button className="outline" onClick={() => { setModal({ acao: "Encomenda", pessoa: null }); setMensagem(""); }}>+ Registrar encomenda</button></div>
      {mensagem && <p role="status" className="success">{mensagem}</p>}
      <div className="tabs"><button className={aba === "Pessoas" ? "active" : ""} onClick={() => setAba("Pessoas")}>Pessoas cadastradas</button><button className={aba === "Histórico" ? "active" : ""} onClick={() => setAba("Histórico")}>Histórico ({registros.length})</button></div>
      {aba === "Pessoas" ? <><div className="section-head"><h3>Pessoas da unidade</h3><span className="muted">Ações disponíveis diretamente no cadastro</span></div>{pessoas.length ? <div className="cards">{pessoas.map(p => <div className="person" key={p.id}><div className="person-top"><span className="avatar">{p.nome[0].toUpperCase()}</span><div><strong>{p.nome}</strong><small>{p.tipo}{p.documento ? " · Documento cadastrado" : ""}</small></div></div><div className="actions"><button onClick={() => setModal({ acao: "Entrada", pessoa: p })}>Entrada</button><button onClick={() => setModal({ acao: "Saída", pessoa: p })}>Saída</button><button onClick={() => setModal({ acao: "Encomenda", pessoa: p })}>Encomenda</button></div></div>)}</div> : <div className="empty">Ainda não há pessoas cadastradas nesta unidade. Cadastre a primeira abaixo.</div>}
      <form className="register" onSubmit={addPessoa}><h3>Adicionar pessoa à unidade</h3><div className="form-grid"><label>Nome<input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo ou identificação" /></label><label>Perfil<select value={tipo} onChange={e => setTipo(e.target.value)}>{tipos.map(t => <option key={t}>{t}</option>)}</select></label><label>Documento (opcional neste protótipo)<input value={documento} onChange={e => setDocumento(e.target.value)} placeholder="Não informe dados reais aqui" /></label></div><button type="submit">Cadastrar pessoa</button></form></> :
      <div className="history">{registros.length ? registros.map(r => <div className="entry" key={r.id}><div className="entry-icon">{r.acao === "Encomenda" ? "▣" : r.acao === "Entrada" ? "↘" : "↗"}</div><div><strong>{r.acao} · {r.pessoaNome}</strong><p>{r.categoria}{r.autorizacao ? " · " + r.autorizacao : ""}{r.autorizador ? " · Autorizado por " + r.autorizador : ""}{r.destino ? " · " + r.destino : ""}{r.empresa ? " · " + r.empresa : ""}{r.detalhe ? " · " + r.detalhe : ""}</p></div><time>{new Date(r.criadoEm).toLocaleString("pt-BR")}</time></div>) : <div className="empty">Nenhum registro nesta unidade ainda.</div>}</div>}
      </>}</>}
      </div>
    </main>
    {modal && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><form className="dialog" onSubmit={addRegistro}><div className="dialog-head"><div><div className="eyebrow">UNIDADE {unidadeAberta}</div><h2>Registrar {modal.acao.toLowerCase()}</h2><p>{modal.pessoa?.nome || "Sem pessoa selecionada"}</p></div><button type="button" className="close" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
    {modal.acao === "Encomenda" ? <><label>Destinatário<select value={modal.pessoa?.id || ""} onChange={e => setModal({ ...modal, pessoa: pessoas.find(p => p.id === e.target.value) || null })}><option value="">Destinatário não cadastrado</option>{pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label><div className="form-grid"><label>Tipo<input value={tipoEncomenda} onChange={e => setTipoEncomenda(e.target.value)} /></label><label>Tamanho<select value={tamanho} onChange={e => setTamanho(e.target.value)}>{["Pequena","Média","Grande"].map(x => <option key={x}>{x}</option>)}</select></label></div><label>Empresa que entregou<input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex.: Mercado Livre" /></label><label>Onde ficou ou quem coletou<select value={destino} onChange={e => setDestino(e.target.value)}>{destinos.map(x => <option key={x}>{x}</option>)}</select></label><p className="hint">A notificação ao morador ainda não está integrada.</p></> : <><label>Forma de autorização<select value={autorizacao} onChange={e => setAutorizacao(e.target.value)}>{autorizacoes.map(x => <option key={x}>{x}</option>)}</select></label><label>Quem autorizou / confirmou<input value={autorizador} onChange={e => setAutorizador(e.target.value)} placeholder="Nome ou função, quando aplicável" /></label></>}
    <label>Observação (opcional)<textarea value={detalhe} onChange={e => setDetalhe(e.target.value)} placeholder="Informações adicionais do atendimento" /></label><div className="dialog-actions"><button type="button" className="outline" onClick={() => setModal(null)}>Cancelar</button><button type="submit">Salvar registro</button></div></form></div>}
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);
