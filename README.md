# NEXO 2031 — Inteligência Comercial Preditiva com Visão Computacional

[![HTML5](https://img.shields.io/badge/Frontend-HTML5_%2F_JS-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![TailwindCSS](https://img.shields.io/badge/Estilo-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TensorFlow.js](https://img.shields.io/badge/IA_no_Navegador-TensorFlow.js_4.22-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![COCO-SSD](https://img.shields.io/badge/Detec%C3%A7%C3%A3o-COCO--SSD_2.2-10B981)](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
[![LGPD](https://img.shields.io/badge/Privacidade-LGPD_Anonimizado-2563EB)](#-privacidade-lgpd-e-contexto-acadêmico)

Prototipação web SaaS de inteligência comercial preditiva aplicada ao varejo e shopping centers (**Capim Dourado Shopping**), combinando **Visão Computacional em tempo real no navegador**, análise espacial por **Mapas de Calor**, **Recomendações Estratégicas de IA**, **Circuitos Cooperativos de 3 Lojas** e relatórios comparativos **Antes x Depois**.

> **Aviso de Privacidade e Conformidade LGPD:** Todo o processamento visual ocorre localmente no navegador do usuário de forma agregada e anonimizada. Não há gravação de imagens em servidor, reconhecimento facial, coleta de biometria ou rastreamento individual de consumidores.

---

## 🚀 Como Executar o Projeto

A aplicação foi construída como uma interface web autônoma (`nexo_2031_dashboard_webDEUS.html`), **sem necessidade de instalar backend, banco de dados ou Docker**.

### Pré-requisitos

- Navegador moderno atualizado (**Google Chrome**, **Microsoft Edge**, **Brave** ou **Firefox**) com aceleração de hardware (WebGL) habilitada.
- Conexão com a internet para carregar as bibliotecas via CDN (**Tailwind CSS**, **Google Fonts Inter**, **TensorFlow.js** e o modelo **COCO-SSD**).
- O arquivo de vídeo de teste **`ytdown_gzlCw6Ds`** (formato `.mp4`, `.webm` ou `.mov`) salvo no computador para validação na aba de câmeras.

### Passo a Passo para Abrir

1. Clone ou baixe este repositório para a sua máquina.
2. Localize o arquivo principal **`nexo_2031_dashboard_webDEUS.html`** na raiz do projeto.
3. Escolha uma das formas abaixo para abrir:
   - **Abertura Direta:** Dê um duplo clique no arquivo `nexo_2031_dashboard_webDEUS.html` para abri-lo diretamente no seu navegador padrão.
   - **Via Servidor Local (Recomendado):** No VS Code, clique com o botão direito sobre `nexo_2031_dashboard_webDEUS.html` e selecione **"Open with Live Server"** (ou execute `python -m http.server 8080` no terminal na pasta do arquivo e acesse `http://localhost:8080/nexo_2031_dashboard_webDEUS.html`).

---

## 🎥 Como Testar a Visão Computacional com o Vídeo `ytdown_gzlCw6Ds`

O módulo **Câmeras** executa detecção real de pessoas utilizando **TensorFlow.js + COCO-SSD (`mobilenet_v2`)** diretamente no navegador do usuário.

### Passo 1: Acessar a Aba de Câmeras
1. No menu lateral esquerdo (**Navegação do Sistema**), clique em **Câmeras** (`Monitoramento & Vídeo`, identificada com a etiqueta azul **`Teste`**).
2. Na primeira abertura, aguarde alguns segundos enquanto o sistema carrega e aquece o modelo de IA no navegador (o indicador **`Modelo de IA pronto`** aparecerá ao lado do título da câmera).

### Passo 2: Carregar o Vídeo de Teste (`ytdown_gzlCw6Ds`)
1. Clique no botão azul **"Fazer Upload de Vídeo (.mp4, .webm, .mov)"** — ou arraste e solte o arquivo diretamente na área pontilhada abaixo dos botões.
2. Selecione no seu computador o vídeo de teste **`ytdown_gzlCw6Ds`** (ex.: `ytdown_gzlCw6Ds.mp4`).
3. Assim que o arquivo for carregado:
   - Os contadores (**Pessoas Agora**, **Entradas** e **Saídas**) são zerados automaticamente para iniciar a medição desde o primeiro quadro.
   - O selo da câmera muda para **`Visão Computacional Ativa (COCO-SSD)`** e a reprodução inicia em loop.

### Passo 3: O que Observar Durante a Execução
- **Detecção Anonimizada (`Bounding Boxes`):** O modelo identifica apenas pessoas (`person`), desenha cantoneiras de rastreamento com identificador temporário (`Pessoa #01`, `Pessoa #02`, etc.), percentual de confiança e aplica uma **tarja escura de anonimização** sobre a região superior da cabeça.
- **Classificação por Zonas da Loja:** Usando a posição dos pés de cada pessoa detectada, o sistema calcula em tempo real a ocupação de três zonas delimitadas na imagem:
  - **Vitrine** (polígono azul à esquerda)
  - **Corredor Central** (polígono verde ao centro)
  - **Caixa** (polígono amarelo à direita)
- **Alerta Automático da IA:** O card lateral **Alerta da IA** monitora o tempo de permanência (*dwell time*) e dispara avisos automáticos quando detecta pessoas paradas analisando produtos na vitrine ou alta concentração na zona.

### Controles Interativos da Tela de Câmeras

| Controle | Função |
|---|---|
| **Pausar / Reproduzir** | Pausa o vídeo e a inferência da IA simultaneamente, mantendo as caixas do último quadro analisado congeladas na tela para inspeção. |
| **Bounding Boxes (OpenCV)** | Ativa ou desativa a exibição das caixas de detecção, IDs e selos de confiança sobre o vídeo. |
| **Linhas de Zona** | Ativa ou desativa o desenho tracejado das áreas **Vitrine**, **Corredor Central** e **Caixa**. |
| **Confiança mín. (`30%` a `95%`)** | Ajusta o limiar mínimo de certeza exigido para validar uma detecção de pessoa (padrão: `55%`). |
| **Usar Simulação Demo (Sem Arquivo)** | Alterna para um cenário arquitetônico simulado em Canvas com silhuetas animadas caso queira testar a interface sem arquivo de vídeo. |

---

## 🧭 Guia das 6 Telas do Sistema

A barra lateral esquerda permite navegar entre todos os módulos operacionais da plataforma:

1. **Painel (`Visão Geral`)**
   - Exibe os 4 indicadores consolidados da loja (**Visitantes**, **Interações**, **Vendas** e **Conversão**), um gráfico de linha interativo de movimentação horária (**10h às 22h**, com pico às **18h**) e um banner de oportunidade detectada pela IA.
   - No cabeçalho superior, permite alternar o contexto entre **Loja 01 — Roupas**, **Loja 02 — Calçados** e **Loja 03 — Acessórios**.

2. **Câmeras (`Monitoramento & Vídeo`)**
   - Ambiente de validação de visão computacional com suporte ao vídeo **`ytdown_gzlCw6Ds`** ou simulação demo, contagem em tempo real e barras de ocupação por setor.

3. **Mapa (`Mapa de Calor`)**
   - Apresenta a **Planta Mix do Capim Dourado Shopping (1º Pavimento — Térreo, `38.800,50 m²`)** em vetor CAD sincronizado 1:1 com a camada térmica (com suporte opcional para importar o arquivo `.pdf` original).
   - Permite alternar entre os períodos **Hoje**, **Horário de Pico 18h** e **Manhã**, aplicar **Zoom/Arraste (Pan)**, ajustar a opacidade do calor e clicar nos **Pins de Fluxo** (*Praça Alimentação / C&A*, *Outback / Acesso Sul*, *Renner*, *Cinemark / STZ*) para inspecionar fluxo/hora e tempo de permanência.

4. **IA (`Recomendações`)**
   - Lista 3 oportunidades estratégicas geradas pelo cruzamento entre fluxo de câmeras e vendas do PDV (*Reposicionar acessórios na vitrine*, *Ajustar equipe no horário de pico* e *Criar campanha com loja vizinha*).
   - Permite clicar em **Iniciar Teste Controlado** (atualizando o contador de **Testes Ativos**) ou **Rejeitar** cada sugestão.

5. **Circuito (`Circuito de 3 Lojas`)**
   - Gerencia a campanha cooperativa **Missão Moda**, conectando **Loja 1 — Roupas**, **Loja 2 — Calçados** e **Loja 3 — Acessórios**.
   - Conta com o botão **Simular Check-in por QR Code**, que incrementa em tempo real o contador de clientes que concluíram o roteiro para resgate do benefício (**Cupom de 15% + Pontos**).

6. **Relatórios (`Antes x Depois`)**
   - Avalia o impacto das intervenções em **Visitas (`+18%`)** e **Conversão (`+3,2 p.p.`)** com filtro de janela temporal (**Últimos 30, 14 ou 7 dias**), gráficos comparativos de barras (*Fluxo*, *Permanência* e *Vendas*) e tabela de status das campanhas.

---

## 📁 Estrutura do Repositório

```text
├── nexo_2031_dashboard_webDEUS.html   # Aplicação web completa (Interface + IA COCO-SSD + Planta Mix)
├── ytdown_gzlCw6Ds.mp4                # Vídeo local de teste para validação da visão computacional
└── README.md                          # Documentação de uso e testes do sistema
```

---

## 🔒 Privacidade, LGPD e Contexto Acadêmico

Projeto desenvolvido como solução de **Inteligência Comercial Preditiva com Visão Computacional** aplicada ao varejo físico. Em estrita conformidade com a **LGPD**, o protótipo utiliza apenas contagens numéricas agregadas, coordenadas espaciais anônimas e mascaramento visual sobre a região facial durante o processamento em tempo real, garantindo que nenhum dado pessoal sensível ou biométrico seja capturado ou armazenado.
