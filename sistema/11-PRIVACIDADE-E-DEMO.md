# 11 — Privacidade, IA, câmeras e limites da demonstração

## 1. Declaração obrigatória ao usuário e ao avaliador

> **Ambiente de demonstração:** os indicadores, mapas de calor, câmeras e recomendações apresentados pelo NEXO 2031 são simulados ou derivados de dados fictícios. O protótipo não captura imagens reais, não reconhece pessoas, não rastreia visitantes e não dispõe de modelo preditivo treinado em dados reais.

Exibir versão resumida desse aviso de forma visível em painel, monitoramento, mapa, recomendações e circuitos (não apenas em termos de uso escondidos).

## 2. Capacidade real no MVP vs representação conceitual

| Funcionalidade | MVP demonstrável | Fora do MVP |
|---|---|---|
| Entrada/saída de visitantes | Série diária DEMO persistida | Contador conectado a câmera real |
| Feed de câmera | Placeholder estático e status SIMULATED | RTSP, upload, streaming de pessoas |
| Mapa de calor | Grade sintética por loja/dia com escala | Detecção de movimento por pixels em produção |
| Recomendações | Regras e hipóteses transparentes (`RULE_BASED_DEMO`) | ML treinado ou predição estatisticamente validada |
| Experimentos | Comparar números agregados de janelas | Provar causalidade da ação |
| Circuitos | Campanha e conclusão agregada inventada | Rastrear cliente entre lojas ou emitir cupom verdadeiro |

**Linguagem apropriada:** “recomendação baseada em regras de demonstração”; “mapa de calor simulado”; “estimativas agregadas de exemplo”; “comparação observacional”. **Evitar:** “a IA detectou pessoas ao vivo”, “identificamos o perfil do consumidor”, “a campanha causou aumento de 18%”.

## 3. Modelo de dados consciente de privacidade

- Armazenar somente atributos da loja/usuário autenticado, métricas por período, zonas e experimentos.
- Nenhuma tabela de visitantes, rostos, placas, IDs persistentes de compradores ou trajetórias pessoais.
- Mesmo que o objetivo futuro mencione visão computacional, não incluir código/configuração que inicie captura sem projeto e avaliação específicos.
- Dados de login de `LOJISTA` e `ADMIN` são dados pessoais de usuários da ferramenta; proteger senhas, acessos, logs, backups e retenção.
- Métricas ficcionais são marcadas com `data_origin=DEMO` e não podem ser confundidas com dados coletados.

## 4. LGPD e câmeras reais em projetos futuros

Uma extensão para câmeras reais exigiria avaliação jurídica e técnica específica: base legal adequada, transparência aos titulares, minimização, necessidade e proporcionalidade, segurança, limitação de finalidade, retenção e descarte, direitos dos titulares, contratos com operadores e eventual avaliação de impacto. Imagens identificáveis podem constituir dados pessoais; certos tratamentos biométricos podem envolver dados sensíveis. Não afirmar conformidade automática com a LGPD apenas porque um modelo é executado localmente.

## 5. Regras explicáveis sugeridas para o módulo M04

**Exemplos de hipóteses, não de predição validada:**

| Regra demonstrativa | Evidência agregada | Sugestão exibida | Limite |
|---|---|---|---|
| Fluxo alto com baixa conversão | mais visitantes que período anterior e conversão menor | reforçar atendimento em horário de pico | associação, não causa |
| Zona central com intensidade elevada | intensidade sintética alta na área central | testar reposicionamento de acessórios | sem saber interesse individual |
| Região de provadores com intensidade baixa | intensidade média baixa no período | revisar sinalização do provador | sem inferir motivação do cliente |
| Vendas caindo com fluxo estável | vendas menores e visitantes semelhantes | revisar vitrine, mix e comunicação | não garante aumento de receita |

O backend pode calcular essas hipóteses de métricas agregadas, mas **todas** devem exibir `generation_method=RULE_BASED_DEMO` até existir um motor mais avançado documentado e validado.

## 6. Checklist ético antes da apresentação

- [ ] Nenhuma tela sugere câmera real ativa.
- [ ] Badge DEMO aparece em todas as métricas fictícias.
- [ ] Nenhuma identidade, gênero, emoção ou faixa etária é inferida.
- [ ] Conclusão de circuito é agregada e simulada.
- [ ] As recomendações mostram hipótese/evidência e não alegam precisão de ML.
- [ ] Resultados de experimentos dizem que correlação não comprova causalidade.
- [ ] API bloqueia acesso a dados de outra loja.
- [ ] Senhas/segredos não estão no Git, prints ou logs.

## 7. Evolução futura (somente proposta)

Uma possível etapa posterior seria testar contagem de pessoas **em dados sintéticos ou vídeos autorizados** em processamento isolado, demonstrando acurácia, segurança e descarte de mídia; ainda não faz parte do contrato e não deve ser incluída sem nova análise de riscos, escopo, consentimentos/base legal e documentação.
