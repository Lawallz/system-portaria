# System Portaria

Primeira etapa do sistema de portaria: seleção entre 53 condomínios informados, busca por nome, abertura de unidade e cadastro demonstrativo de pessoas e ocorrências no navegador.

## Executar

```bash
npm install
npm run dev
```

## Escopo desta etapa

- Selecionar condomínio e informar unidade (número ou identificação livre).
- Ver pessoas cadastradas na unidade, criar cadastros de moradores, visitantes, prestadores e colaboradores.
- Registrar entrada, saída e recebimento de encomenda pela própria unidade, com horário automático e opções de autorização ou destino.
- Guardar os registros localmente no navegador para avaliação de fluxo.

**Atenção:** armazenamento local é apenas um protótipo: não sincroniza operadores, não autentica usuários e não serve para dados pessoais reais. Antes de operar portarias, implementar banco persistente, autenticação e permissões, auditoria imutável, isolamento por condomínio, proteção de dados e integração de notificações. A lista contém 53 nomes, embora a estimativa inicial tenha sido 52; confirmar nomes e grafias posteriormente.

Nenhuma notificação é enviada nesta etapa. Delivery não faz parte do fluxo.
