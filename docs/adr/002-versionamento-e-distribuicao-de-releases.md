# Versionamento e distribuição de releases do aplicativo

## Status

**Status atual:** Aceita

## Contexto

Existia uma mecânica de registro de versões no backend: ele mantinha a versão ativa do aplicativo,
o número de build e as notas, guardava apenas os três registros mais recentes e permitia que o
aplicativo consultasse se havia atualização. O download, porém, era feito a partir de um arquivo APK
fixo, sobrescrito a cada build, sem preservar o binário publicado.

Essa mecânica era funcional, mas não atendia ao histórico de releases pretendido:

- limitava o histórico aos três registros mais recentes, descartando os anteriores;
- não preservava os binários publicados;
- não formava um changelog público por versão;
- comparava o número de build, e não a versão SemVer.

Como o aplicativo nunca foi disponibilizado em produção, não há compromisso com um histórico
anterior de versões. Por isso, essa mecânica será substituída por uma estratégia mais robusta,
baseada em GitHub Releases. A nova estratégia precisa ser simples o suficiente para ser executada
manualmente e, ao mesmo tempo, estabelecer regras que possam ser automatizadas no futuro sem quebra
de compatibilidade.

## Decisão

Adotar **Semantic Versioning (SemVer)**, no formato `MAJOR.MINOR.PATCH`, e utilizar **GitHub
Releases** como canal de publicação e histórico das versões do aplicativo.

### Versionamento

- As versões seguem o formato `MAJOR.MINOR.PATCH`, sem prefixo `v` (por exemplo, `0.0.0`,
  `0.1.0`, `0.1.1`).
- Enquanto o projeto estiver em desenvolvimento inicial (`MAJOR` igual a `0`), a API pública ainda é
  considerada instável e mudanças incompatíveis podem ocorrer em versões `MINOR`.
- A versão do aplicativo é definida em `frontend/app.json`, no campo `expo.version`, e deve ser
  idêntica à versão da release publicada, garantindo que a verificação de atualização funcione
  corretamente.
- A primeira release será a `0.0.0`, representando o estado atual do projeto e servindo como marco
  inicial do histórico de versões. Ela não indica estabilidade.

### Publicação

- Cada versão é publicada como uma GitHub Release no repositório
  [Minervas-Digitais/projeto-manamano](https://github.com/Minervas-Digitais/projeto-manamano), com
  tag no formato `MAJOR.MINOR.PATCH`.
- Os executáveis (APK) são anexados como assets da release.
- A landing page e qualquer outro ponto de distribuição devem direcionar o download para o asset da
  release correspondente, em vez de depender de um arquivo fixo no servidor.

### Changelog

- As notas de cada versão são escritas manualmente na descrição da respectiva GitHub Release.
- Não será mantido um `CHANGELOG.md` separado no repositório neste momento; a própria release é a
  fonte de verdade do histórico.
- As notas utilizam as categorias do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
  quando aplicáveis: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` e `Security`. Categorias
  sem itens na versão são omitidas.

### Verificação de atualizações

- O aplicativo consulta o backend do projeto no endpoint `GET /version?current=<versão instalada>`
  para obter a versão mais recente e o status da atualização.
- O backend consulta a API REST do GitHub no endpoint
  `GET https://api.github.com/repos/Minervas-Digitais/projeto-manamano/releases/latest` e devolve a
  versão mais recente, a versão mínima suportada, as URLs da release e do APK e o status calculado.
- O backend compara a versão instalada com a versão da release, interpretando ambas como SemVer, e
  devolve `current`, `optional` ou `required`.
- A API do GitHub limita o número de requisições não autenticadas por IP. Para evitar atingir esse
  limite, o backend mantém um cache da última resposta e reutiliza a informação em vez de consultar a
  API a cada abertura do aplicativo.
- A consulta não deve bloquear a inicialização nem impedir o funcionamento offline. Falhas de rede,
  indisponibilidade ou limite de requisições são tratadas como ausência de atualização.

### Atualizações obrigatórias

- A verificação deve considerar duas referências: `latest`, a versão mais recente publicada, e
  `minimum`, a versão mínima ainda suportada.
- A tag da release mais recente define `latest`. O valor de `minimum` deve ser publicado junto da
  release e atualizado pelo responsável pela publicação, sem exigir uma nova versão do aplicativo.
- Versões instaladas abaixo de `minimum` devem ser tratadas como atualização obrigatória, impedindo
  o uso até que a atualização seja feita. Versões entre `minimum` e `latest` recebem apenas o aviso
  de atualização disponível.
- Enquanto não houver necessidade de forçar atualização, `minimum` deve permanecer igual ou inferior
  à versão mais antiga ainda suportada.

### Escopo

- A estratégia atende inicialmente às necessidades atuais de distribuição do aplicativo.
- O build é executado localmente, sem serviços de build em nuvem, e a publicação é manual neste
  momento.
- Não há exigência de automação de CI/CD. A automação pode ser adicionada posteriormente sem alterar
  as decisões de versionamento, changelog ou verificação de atualização.

## Alternativas consideradas

- **Changelog versionado no repositório (`CHANGELOG.md`).** Facilita a leitura das mudanças dentro do
  código e o histórico em PRs, mas duplica a informação já publicada na release e exige manutenção em
  dois lugares. Como as notas interessam principalmente a quem consome a release, e não apenas a
  quem trabalha no repositório, as notas na release atendem melhor.

- **Geração automática de versão e changelog (semantic-release, Changesets ou similar).** Reduz erro
  humano e garante consistência, porém depende de pipeline de CI/CD, convenção rígida de commits e
  configuração de credenciais. É custo desproporcional para o processo manual atual.

- **Atualizações OTA via Expo Updates.** Permitiria entregar mudanças de JavaScript sem novo APK,
  mas não substitui a distribuição de binários (mudanças nativas continuam exigindo nova build) e
  adiciona um serviço e um fluxo de publicação extras. Pode ser reavaliado quando houver demanda por
  atualizações mais frequentes.

- **Evoluir o registro de versões existente no backend.** Permitiria reaproveitar a mecânica atual,
  mas exigiria armazenar os binários ou integrá-los a um serviço de arquivos e manter o serviço
  disponível para essa função. GitHub Releases oferece histórico, assets e API pública de consulta
  sem esse esforço adicional.

## Consequências

- Passa a existir uma fonte única e rastreável da versão publicada, com o binário correspondente
  preservado no GitHub Releases.
- O download deixa de depender de um arquivo fixo sobrescrito a cada build e passa a apontar para o
  asset da versão publicada.
- A verificação de atualização passa a depender do backend do projeto, que centraliza o cache da
  consulta à API pública do GitHub e o cálculo do status de atualização.
- A mecânica anterior de registro de versões no backend foi removida junto com esta decisão.
- Como a publicação é manual, a consistência entre a versão do aplicativo, a tag, o asset e as notas
  depende do processo do responsável pela release; erros de digitação podem causar verificação de
  atualização incorreta.
- A API do GitHub impõe limite de requisições para chamadas não autenticadas e pode ficar
  indisponível; a verificação de atualização é, por isso, um recurso auxiliar, nunca um requisito
  para o funcionamento do aplicativo.
- O cache no backend reduz o consumo desse limite, mas não elimina o risco de indisponibilidade da
  API do GitHub. Se o limite se mostrar um problema, será necessário autenticar as consultas ou
  adotar outra fonte de versão.
- Como o endpoint `releases/latest` ignora releases marcadas como _draft_ ou _pre-release_, versões
  nesses estados não serão oferecidas como atualização.
- A definição de `minimum` exige disciplina no processo de release: se ficar desatualizada, pode
  bloquear usuários indevidamente ou deixar de bloquear versões incompatíveis.
- Versionar em `0.x` comunica que a API e o formato dos dados ainda podem mudar; a promoção para
  `1.0.0` deve marcar o início de uma fase estável do produto.
