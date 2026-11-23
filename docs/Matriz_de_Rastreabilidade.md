# Matriz de Rastreabilidade e Arquitetura de Requisitos — AnalisaAI

**Projeto:** AnalisaAI — Identificação de Plantas Tóxicas  
**Instituição:** Universidade Federal do Ceará (UFC) — Campus Crateús / IFCE — Campus Crateús  
**Semestre:** 2026.2  
**Versão do Documento:** v2.0 (Atualizado em 23/11/2026)

**Equipe 9:**
- Allan Cristtian Soares Fialho — 510136
- Ana Cecília Marinho de Paiva — 569481
- Antonio Geovani Cardoso Loureiro — 588053
- Cauã Farias de Oliveira — 540832
- Davi Kelton Rodrigues Lima — 565809
- Maria Eduarda Gomes Araujo — 566733
- Raniel Batista Sousa — 571548
- Ronie de Souza Almeida — 567263

---

## 1. GLOSSÁRIO

* **LLM (Large Language Model):** Modelo de Inteligência Artificial baseado em linguagem natural utilizado no sistema para processar as imagens enviadas e identificar as espécies de plantas e seus riscos associados.
* **LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018):** Legislação brasileira que rege o tratamento de dados pessoais, exigindo consentimento explícito dos usuários para coleta e armazenamento de informações.
* **PIN / Senha:** Credencial numérica ou alfanumérica de segurança utilizada para autenticação e validação de operações sensíveis do usuário na plataforma.
* **Produtor Rural (Cliente):** Ator externo que utiliza a aplicação no campo para capturar, enviar e consultar análises de plantas potencialmente tóxicas para o gado ou animais de criação.
* **Técnico Agrícola:** Ator interno que contribui com informações sobre espécies de plantas, revisa identificações realizadas pela inteligência artificial e valida informações antes de sua inclusão na base oficial.
* **Planta Tóxica:** Espécie vegetal que possui princípios ativos capazes de causar danos à saúde ou levar à morte animais de criação e seres humanos.
* **Base de Conhecimento:** Conjunto de registros de espécies de plantas, compostos por imagens, nomes popular e científico, características, toxicidade e animais afetados, mantido pelo sistema. Somente registros validados compõem a base oficial.
* **Status de Validação:** Estado de um registro de espécie na base de conhecimento, podendo ser `pendente`, `revisado` ou `validado`.
* **Processamento Assíncrono:** Forma de processamento em que a análise da imagem é executada em segundo plano, sem bloquear a interface, sendo o usuário informado quando o resultado estiver disponível.
* **Log:** Registro de eventos do sistema, como acessos, envios, erros e ações administrativas, utilizado para identificação de falhas e acompanhamento do uso da plataforma.

---

## 2. PERFIS DE ACESSO

1. **Cliente (Produtor Rural):** Perfil externo responsável por realizar o cadastro na plataforma, atualizar seus dados cadastrais, capturar e enviar imagens de plantas via câmera ou galeria, consultar o histórico de análises, consultar informações sobre as espécies e gerenciar sua sessão de login.
2. **Técnico Agrícola (Interno):** Perfil interno responsável por contribuir com a base de conhecimento do sistema. Pode enviar imagens de plantas, cadastrar informações sobre espécies (nome popular, nome científico, características, toxicidade, animais afetados), revisar e corrigir identificações realizadas pela inteligência artificial e validar informações antes de sua inclusão na base oficial. Suas contas são criadas exclusivamente pelo Superadministrador.
3. **Administrador (Interno):** Perfil com privilégios de gestão. É responsável por cadastrar novos administradores pelo painel de controle, listar e buscar clientes cadastrados, bloquear ou desbloquear usuários e monitorar o uso da plataforma através de dashboards de métricas.
4. **Superadministrador (Super Admin):** Perfil de gestão de nível superior e controle do ecossistema. Possui acesso irrestrito a todas as funcionalidades do sistema e é o único perfil com permissão para cadastrar, editar, conceder privilégios ou revogar acessos de novos Administradores e Técnicos Agrícolas no painel de controle. Também é responsável por gerenciar as informações das espécies, acompanhar os registros (logs) e a utilização do sistema e acessar as configurações administrativas.

---

## 3. REGRAS DE NEGÓCIO (RN)

* **RN01 - Unicidade de Contato:** Cada número de telefone cadastrado deve ser único no sistema, servindo como identificador principal para autenticação.
* **RN02 - Validação de Imagem:** O sistema deve rejeitar o envio de arquivos que ultrapassem 10 MB, estejam fora dos formatos JPG/PNG ou possuam resolução inferior a 300x300 pixels.
* **RN03 - Obrigatoriedade de Consentimento (LGPD):** O cadastro de novos clientes só pode ser efetivado mediante o aceite explícito dos Termos de Uso e da Política de Privacidade.
* **RN04 - Restrição de Criação de Contas Internas:** Contas administrativas e de técnicos agrícolas não podem ser criadas por auto-cadastro público; sua criação e gerenciamento são restritos exclusivamente a usuários com perfil de Superadministrador por meio do painel de gestão.
* **RN05 - Segurança de Credenciais:** As senhas ou PINs numéricos cadastrados devem possuir obrigatoriamente no mínimo 6 caracteres para mitigar riscos de ataques de força bruta.
* **RN06 - Ciclo de Validação de Espécies:** Todo registro de espécie deve seguir o ciclo de status `pendente`, `revisado` e `validado`, nessa ordem. Registros novos são criados com o status `pendente`. Quando reprovado na validação, o registro retorna ao status `pendente`, acompanhado de justificativa.
* **RN07 - Informação de Técnico Não é Verdade Automática:** Nenhuma informação cadastrada por técnico agrícola deve ser considerada verdadeira automaticamente. Somente registros com status `validado` compõem a base oficial e são exibidos aos clientes.
* **RN08 - Cadastro Mínimo de Espécie:** O cadastro de uma espécie exige, no mínimo, o nome da espécie (popular ou científico) e ao menos uma imagem válida, conforme RN02.
* **RN09 - Espécie sem Identificação Definitiva:** É permitido cadastrar uma espécie sem identificação definitiva. Nesse caso, o registro deve ser sinalizado como "identificação não definitiva" e permanecer com o status `pendente` até sua revisão.
* **RN10 - Prevenção de Duplicidade:** O sistema deve evitar cadastros duplicados de usuários (RN01) e de espécies (mesmo nome popular ou científico), bem como solicitações duplicadas de análise de imagem decorrentes de envios repetidos.

---

## 4. CRITÉRIOS DE CLASSIFICAÇÃO DE IMPORTÂNCIA

Para atender ao escopo central do **AnalisaAI** (identificação segura de plantas tóxicas no campo e curadoria confiável da base de conhecimento), os requisitos foram classificados nos seguintes níveis de importância:

* **Importante (Prioridade Alta / Core do Produto):** Requisitos indispensáveis ao fluxo principal de captura/envio de imagem, análise por IA, autenticação segura e validação técnica das espécies.
* **Complementar (Prioridade Média / Suporte Operacional):** Requisitos de apoio à gestão administrativa, recuperação de acesso, manutenção de perfil e monitoramento operacional.

---

## 5. REQUISITOS FUNCIONAIS (RFs) E DE CONTRATO

| Código | Requisito Funcional | Classificação | Atores Envolvidos | Regras Relacionadas | RNFs Aplicados | Rota da API (Contract Endpoint) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RF001** | Cadastro de Usuários | **Importante** | Cliente, Técnico Agrícola, Administrador, Superadmin | RN01, RN03, RN04, RN05, RN10 | RNF001, RNF012, RNF014 | `POST /api/v1/users/register`<br>`POST /api/v1/superadmin/users` |
| **RF002** | Login no Sistema | **Importante** | Cliente, Técnico Agrícola, Administrador, Superadmin | RN01, RN05 | RNF001, RNF004, RNF009, RNF011 | `POST /api/v1/auth/login` |
| **RF003** | Realizar Envio de Imagens | **Importante** | Cliente, Técnico Agrícola | RN02, RN10 | RNF005, RNF006, RNF008, RNF010, RNF012, RNF015 | `POST /api/v1/plants/analyze` |
| **RF004** | Validação de Formato e Tamanho | **Importante** | Cliente, Técnico Agrícola | RN02 | RNF006, RNF014, RNF015 | `POST /api/v1/plants/analyze` |
| **RF005** | Identificação das Plantas (IA) | **Importante** | Cliente, Técnico Agrícola, API | RN02 | RNF001, RNF002, RNF007, RNF010, RNF011 | `GET /api/v1/plants/analyze/{id}` |
| **RF006** | Configuração de Perfil | Complementar | Cliente, Técnico Agrícola | RN01, RN05 | RNF001, RNF014 | `PUT /api/v1/users/profile` |
| **RF007** | Listagem de Histórico | **Importante** | Cliente | - | RNF001, RNF004, RNF005 | `GET /api/v1/plants/history` |
| **RF008** | Logout do Sistema | Complementar | Cliente, Técnico Agrícola, Administrador, Superadmin | - | RNF001, RNF004 | `POST /api/v1/auth/logout` |
| **RF009** | Gerenciar Usuários | Complementar | Administrador, Superadmin | RN04 | RNF001, RNF004, RNF011 | `GET /api/v1/admin/users`<br>`PATCH /api/v1/admin/users/{id}/status`<br>`DELETE /api/v1/superadmin/users/{id}` |
| **RF010** | Monitoramento do Uso do Sistema | Complementar | Administrador, Superadmin | - | RNF001, RNF004, RNF011 | `GET /api/v1/admin/metrics`<br>`GET /api/v1/admin/logs` |
| **RF011** | Recuperação de Senha ou PIN | Complementar | Cliente, Técnico Agrícola, Administrador, Superadmin | RN01, RN05 | RNF001, RNF009, RNF011, RNF014 | `POST /api/v1/auth/recover-password` |
| **RF012** | Cadastro de Espécies | **Importante** | Técnico Agrícola, Superadmin | RN02, RN06, RN07, RN08, RN09, RN10 | RNF001, RNF004, RNF012, RNF013, RNF014 | `POST /api/v1/species` |
| **RF013** | Revisão e Validação de Espécies | **Importante** | Técnico Agrícola, Superadmin | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `PATCH /api/v1/species/{id}/status` |
| **RF014** | Revisão de Identificações da IA | **Importante** | Técnico Agrícola | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `GET /api/v1/technician/analyses`<br>`PUT /api/v1/technician/analyses/{id}/review` |
| **RF015** | Consulta de Informações sobre Espécies | **Importante** | Cliente, Técnico Agrícola, Superadmin | RN06, RN07 | RNF001, RNF004, RNF005 | `GET /api/v1/species`<br>`GET /api/v1/species/{id}` |
| **RF016** | Gerenciamento de Espécies e Configurações | Complementar | Superadmin | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `PUT /api/v1/species/{id}`<br>`DELETE /api/v1/species/{id}`<br>`GET /api/v1/superadmin/settings`<br>`PUT /api/v1/superadmin/settings` |

---

## 6. REQUISITOS NÃO FUNCIONAIS (RNFs)

* **RNF001 - Tempo de resposta do sistema (Desempenho) [Complementar]:** O sistema deve apresentar resposta para operações de cadastro, login e carregamento de telas em no máximo 3 segundos, considerando conexão estável com a internet.
* **RNF002 - Tempo de processamento da análise da imagem (Desempenho) [Importante]:** O sistema deve retornar o resultado da identificação da planta em no máximo 10 segundos após o envio da imagem pelo cliente.
* **RNF003 - Disponibilidade da plataforma (Disponibilidade) [Complementar]:** O sistema deve possuir disponibilidade mínima de 99% ao mês, exceto em períodos de manutenção programada.
* **RNF004 - Controle de acesso (Segurança) [Importante]:** O sistema deve restringir o acesso às funcionalidades de administração apenas para usuários logados com perfil de Administrador ou Superadministrador. A Área do Técnico deve ser acessível apenas por perfil de Técnico Agrícola ou Superadministrador.
* **RNF005 - Responsividade da interface (Usabilidade) [Complementar]:** O sistema deve adaptar corretamente sua interface para dispositivos móveis e computadores com largura mínima de 360px.
* **RNF006 - Compatibilidade de Imagens (Confiabilidade) [Importante]:** O sistema deve permitir apenas o envio de imagens nos formatos JPG e PNG com tamanho máximo de 10 MB e resolução mínima de 300x300px.
* **RNF007 - Tratamento em caso de falha (Confiabilidade) [Importante]:** Em caso de falha na comunicação com o serviço de inferência da LLM ou indisponibilidade do modelo de IA, o sistema deve exibir mensagem de erro em no máximo 5 segundos.
* **RNF008 - Suporte a Operação Offline e Sincronização (Confiabilidade / Usabilidade) [Importante]:** O sistema deve suportar funcionamento parcial em modo offline, permitindo capturar fotos no campo sem internet, armazenando em cache local para envio automático posterior sem gerar solicitações duplicadas.
* **RNF009 - Proteção contra Força Bruta (Segurança) [Complementar]:** O sistema deve implementar bloqueio temporário de conta (ex.: 15 minutos após 5 tentativas consecutivas erradas de login).
* **RNF010 - Processamento assíncrono das análises (Desempenho / Usabilidade) [Importante]:** O sistema deve processar análises de imagem em segundo plano sem bloquear a interface, permitindo uso contínuo enquanto notifica o término da inferência.
* **RNF011 - Registro de logs (Manutenibilidade / Segurança) [Complementar]:** O sistema deve registrar logs completos de acessos, erros, envios, análises, validações e ações administrativas, em conformidade com a LGPD (sem gravar senhas ou PINs).
* **RNF012 - Prevenção de duplicidade (Confiabilidade) [Complementar]:** O sistema deve evitar cadastros e solicitações duplicadas de usuários, espécies e análises.
* **RNF013 - Rastreabilidade da base de conhecimento (Segurança / Qualidade de dados) [Importante]:** O sistema deve registrar autor, data e histórico completo de alterações e trocas de status de cada espécie.
* **RNF014 - Validação de formulários (Usabilidade / Segurança) [Complementar]:** O sistema deve validar dados no cliente e no servidor, exibindo mensagens claras e preservando campos já preenchidos.
* **RNF015 - Tratamento da câmera em dispositivos móveis (Usabilidade) [Complementar]:** Tratamento otimizado de câmera mobile (permissões, preferência por câmera traseira e orientação de imagem).

---

## 7. MATRIZ DE RASTREABILIDADE MATRICIAL (REQUISITOS, IMPLEMENTAÇÃO E TESTES)

> **Nota de preenchimento:** Os requisitos classificados como **Importante** estão destacados abaixo com suas respectivas regras, RNFs, contratos de API e campos reservados para vinculação direta com os módulos implementados e casos de teste executados no repositório.

| ID RF | Requisito | Importância | Regras de Negócio (RN) | Requisitos Não Funcionais (RNF) | Funcionalidade / Endpoint Implementado | Caso de Teste / Evidência | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RF001** | Cadastro de Usuários | **Importante** | RN01, RN03, RN04, RN05, RN10 | RNF001, RNF012, RNF014 | `POST /api/v1/users/register`<br>`POST /api/v1/superadmin/users`<br>*(Vincular módulo/arquivo)* | `CT-RF001` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF002** | Login no Sistema | **Importante** | RN01, RN05 | RNF001, RNF004, RNF009, RNF011 | `POST /api/v1/auth/login`<br>*(Vincular módulo/arquivo)* | `CT-RF002` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF003** | Realizar Envio de Imagens | **Importante** | RN02, RN10 | RNF005, RNF006, RNF008, RNF010, RNF012, RNF015 | `POST /api/v1/plants/analyze`<br>*(Vincular módulo/arquivo)* | `CT-RF003` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF004** | Validação de Formato e Tamanho | **Importante** | RN02 | RNF006, RNF014, RNF015 | `POST /api/v1/plants/analyze`<br>*(Vincular validador de upload)* | `CT-RF004` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF005** | Identificação das Plantas (IA) | **Importante** | RN02 | RNF001, RNF002, RNF007, RNF010, RNF011 | `GET /api/v1/plants/analyze/{id}`<br>*(Vincular serviço LLM/IA)* | `CT-RF005` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF006** | Configuração de Perfil | Complementar | RN01, RN05 | RNF001, RNF014 | `PUT /api/v1/users/profile` | `CT-RF006` | Planejado / Backlogged |
| **RF007** | Listagem de Histórico | **Importante** | N/A | RNF001, RNF004, RNF005 | `GET /api/v1/plants/history`<br>*(Vincular módulo/arquivo)* | `CT-RF007` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF008** | Logout do Sistema | Complementar | N/A | RNF001, RNF004 | `POST /api/v1/auth/logout` | `CT-RF008` | Planejado / Backlogged |
| **RF009** | Gerenciar Usuários | Complementar | RN04 | RNF001, RNF004, RNF011 | `GET /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}/status`, `DELETE /api/v1/superadmin/users/{id}` | `CT-RF009` | Planejado / Backlogged |
| **RF010** | Monitoramento do Uso do Sistema | Complementar | N/A | RNF001, RNF004, RNF011 | `GET /api/v1/admin/metrics`, `GET /api/v1/admin/logs` | `CT-RF010` | Planejado / Backlogged |
| **RF011** | Recuperação de Senha ou PIN | Complementar | RN01, RN05 | RNF001, RNF009, RNF011, RNF014 | `POST /api/v1/auth/recover-password` | `CT-RF011` | Planejado / Backlogged |
| **RF012** | Cadastro de Espécies | **Importante** | RN02, RN06, RN07, RN08, RN09, RN10 | RNF001, RNF004, RNF012, RNF013, RNF014 | `POST /api/v1/species`<br>*(Vincular módulo/arquivo)* | `CT-RF012` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF013** | Revisão e Validação de Espécies | **Importante** | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `PATCH /api/v1/species/{id}/status`<br>*(Vincular módulo/arquivo)* | `CT-RF013` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF014** | Revisão de Identificações da IA | **Importante** | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `GET /api/v1/technician/analyses`<br>`PUT /api/v1/technician/analyses/{id}/review`<br>*(Vincular módulo/arquivo)* | `CT-RF014` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF015** | Consulta de Informações sobre Espécies | **Importante** | RN06, RN07 | RNF001, RNF004, RNF005 | `GET /api/v1/species`<br>`GET /api/v1/species/{id}`<br>*(Vincular módulo/arquivo)* | `CT-RF015` *(Vincular suíte/arquivo de teste)* | Em atualização |
| **RF016** | Gerenciamento de Espécies e Configurações | Complementar | RN06, RN07 | RNF001, RNF004, RNF011, RNF013 | `PUT /api/v1/species/{id}`, `DELETE /api/v1/species/{id}`, `GET /api/v1/superadmin/settings`, `PUT /api/v1/superadmin/settings` | `CT-RF016` | Planejado / Backlogged |

---

## 8. REGISTRO DE ALTERAÇÕES (CHANGELOG)

| Versão | Data | Autor(es) | Descrição das Alterações Realizadas |
| :--- | :--- | :--- | :--- |
| **v1.0** | — | Equipe 9 | Criação inicial da Matriz de Rastreabilidade e Arquitetura de Requisitos (Glossário, Perfis de Acesso, RNs, RFs, RNFs e mapeamento de rotas de API). |
| **v2.0** | 23/11/2026 | Equipe 9 | • Inclusão da classificação de importância (**Importante** vs. **Complementar**) para RFs e RNFs com foco no fluxo principal de identificação de plantas tóxicas e validação técnica.<br>• Expansão da Matriz de Rastreabilidade (Seção 7) para contemplar o vínculo entre requisitos, funcionalidades/endpoints implementados, casos de teste (`CT-RFxxx`) e status.<br>• Adição desta seção de registro de alterações para rastreabilidade documental da issue. |
