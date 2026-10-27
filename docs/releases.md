# Publicação de releases

As versões do aplicativo são publicadas como **GitHub Releases** no repositório
[Minervas-Digitais/projeto-manamano](https://github.com/Minervas-Digitais/projeto-manamano).
Cada release concentra o APK, a versão e as notas de mudança.

## Versionamento

- A versão do aplicativo fica em `frontend/app.json`, no campo `expo.version`, e segue SemVer
  (`MAJOR.MINOR.PATCH`).
- A tag da release deve ser exatamente a mesma versão, sem prefixo `v`.
- O `android.versionCode` também deve ser incrementado a cada release para que o Android permita a
  atualização sobre a versão anterior.
- A primeira release é a `0.0.0`.
- As notas ficam na descrição da release; não existe `CHANGELOG.md` no repositório.

## Passo a passo

1. Gere o APK e defina a versão com o script de release:

   ```bash
   npm run release:android -w frontend -- --bump <major|minor|patch>
   ```

   Escolha o bump conforme SemVer. Sem `--bump`, a versão atual é mantida
   (útil para builds de teste). O script atualiza `expo.version` e incrementa `android.versionCode`
   em `frontend/app.json`.

2. O APK fica em `frontend/dist/manamano.apk`, já com o nome usado pela landing page.
3. Crie uma GitHub Release com a tag igual à versão publicada.
4. Anexe o APK à release com o nome `manamano.apk`. Esse nome é usado pelo link de download da
   landing page.
5. Escreva as notas usando o [template de release](./release-template.md).
6. Publique como uma release normal, sem marcar como _draft_ ou _pre-release_. O endpoint
   `releases/latest` ignora esses estados e o aplicativo não os enxergaria como atualização.

## Versão mínima suportada

A linha `Versão mínima suportada: **x.y.z**` do template é lida pelo backend, que calcula o status
de atualização no `GET /version`. Se a versão instalada estiver abaixo desse valor, a atualização
passa a ser obrigatória. Enquanto não houver necessidade de bloquear o uso, mantenha o valor igual ou
abaixo da versão mais antiga ainda suportada.

O backend consulta a release mais recente no GitHub e mantém a resposta em cache por alguns minutos.
Por isso, uma release recém-publicada pode levar alguns minutos para aparecer como atualização.

## Landing page

A página de download aponta para o asset mais recente:

```text
https://github.com/Minervas-Digitais/projeto-manamano/releases/latest/download/manamano.apk
```

Por isso, o APK anexado à release precisa manter o nome `manamano.apk`.
