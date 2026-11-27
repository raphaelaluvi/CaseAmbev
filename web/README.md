# Site — Occasion Intelligence (React + Vite)

Rodar (com a API ligada em `localhost:8000`):
```bash
npm install
npm run dev
```
Abre em http://localhost:5173.

## Onde mexer em quê

```
web/
├── index.html                  título da aba e link da fonte (Manrope, Google Fonts)
├── public/
│   ├── br_uf.json              malha dos estados do IBGE (desenho do mapa)
│   ├── hero-guarana-pizza.jpg  foto da abertura
│   ├── logo.png                símbolo da barra do topo
│   ├── icone-*.png / .svg      ícones dos canais (casa, delivery, ponto de consumo)
│   └── favicon* / apple-touch-icon.png   ícones da aba do navegador
└── src/
    ├── main.tsx                ponto de entrada (carrega os estilos globais e o App)
    ├── App.tsx                 A PÁGINA: ordem das seções de cima para baixo
    │
    ├── styles/
    │   ├── tokens.css          ★ CORES, fonte, arredondamento, sombra (troque o tema aqui)
    │   └── base.css            cartão branco, botões, textos, barras (usados em todo lugar)
    │
    ├── secoes/                 cada bloco grande da página (um "ato")
    │   ├── SecaoMapa.tsx       ato 1: título + mapa + ranking
    │   ├── SecaoJobs.tsx       ato 2: título + explorador de jobs
    │   └── SecaoSimulador.tsx  ato 3: título + formulário + resultado
    │
    ├── components/             peças menores, cada uma com o seu CSS ao lado
    │   ├── layout/             BarraTopo (menu), Hero (frase + foto), Kpis (números do topo), Rodape
    │   ├── comum/              CabecalhoSecao (número + título), Comparacao (barra × Brasil), Contador, IconeCanal, Revelar
    │   ├── mapa/               MapaBrasil (mapa clicável), RankingUF (tabela)
    │   ├── jobs/               ExploradorJobs (achados clicáveis, ranking animado e detalhe do job)
    │   └── simulador/          FormularioContexto (campos + previsão do tempo), Resultado (score, recomendação, plano, job)
    │
    ├── hooks/
    │   └── useSimulador.ts     o "estado" da página: contexto escolhido, resposta da API, clima
    ├── services/
    │   └── api.ts              chamadas à API (/predict, /clima, /oportunidades) e os tipos dos dados
    └── utils/
        ├── constantes.ts       opções dos campos (dias, refeições, locais, UFs) e o contexto padrão
        ├── cenarios.ts         cenários rápidos do simulador
        ├── jobs.ts             perfil típico de cada job
        └── formatar.ts         formatação de % e datas
```

### Exemplos rápidos
| Quero… | Arquivo |
|---|---|
| trocar uma cor do site | `src/styles/tokens.css` |
| mudar o título grande ou a foto do topo | `src/components/layout/Hero.tsx` |
| mudar os números do topo | `src/components/layout/Kpis.tsx` |
| mudar os cenários rápidos | `src/utils/cenarios.ts` |
| mudar o texto do menu | `src/components/layout/BarraTopo.tsx` |
| mudar a ordem das seções ou tirar uma | `src/App.tsx` |
| editar os achados da seção 2 | `LENTES` em `src/components/jobs/ExploradorJobs.tsx` |
| mudar o visual do mapa | `src/components/mapa/mapa.css` (cores: `--seq-1` a `--seq-5` em `tokens.css`) |
| mudar campos do formulário | `src/components/simulador/FormularioContexto.tsx` (opções em `utils/constantes.ts`) |
| mudar o cartão da recomendação ou do score | `src/components/simulador/Resultado.tsx` |
| mudar o contexto que aparece ao abrir | `CONTEXTO_PADRAO` em `src/utils/constantes.ts` |

### Regra de organização
- **Seção** (`secoes/`) = um bloco grande da página, monta componentes e escreve os textos daquele bloco.
- **Componente** (`components/`) = uma peça reutilizável; recebe dados por *props* e não chama a API.
- Só o **hook** `useSimulador` guarda estado e chama a API (via `services/api.ts`).
