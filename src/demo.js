// Apenas nomes foram informados. Perfis restantes e telefones são fictícios.
// Documentos e telefones são valores sintéticos usados apenas na demonstração.
const entries = [
  ["Pedro", "Visitante"], ["Lincoln", "Morador"], ["Gustavo", "Morador"],
  ["Richard", "Proprietário"], ["Jerry", "Visitante"], ["Fernanda", "Visitante"],
  ["Murillo", "Visitante"], ["Renato", "Visitante"], ["Lucas", "Visitante"]
];
export const demoPeople = entries.map(([nome, tipo], index) => ({
  id: `demo-rendall-77-${index + 1}`,
  condominioId: "cond-001", unidade: "77", nome, tipo,
  telefone: `(11) 90000-00${String(index + 1).padStart(2, "0")}`,
  veiculo: index < 4 ? `DEMO-${String(index + 1).padStart(3, "0")}` : "",
  rg: `DEMO-RG-${String(index + 1).padStart(3, "0")}`,
  cpf: `DEMO-CPF-${String(index + 1).padStart(3, "0")}`,
  moradorVinculado: index === 4 ? "Richard" : tipo === "Visitante" ? "Gustavo" : "",
  situacao: index === 4 ? "Direta" : index === 7 ? "Proibido" : tipo === "Visitante" ? "Interfonar" : "Cadastro confirmado"
}));
