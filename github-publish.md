# GitHub Pages 公開手順

## 公開先

- GitHubアカウント: `nextonestepinfo-ops`
- リポジトリ名: `hearing-form`
- 公開URLの想定: `https://nextonestepinfo-ops.github.io/hearing-form/`

既存リポジトリに混ぜると営業用フォームの場所が分かりにくくなるため、基本は独立リポジトリで作る。

## 1. Apps Scriptを先に用意する

1. 追記先スプレッドシートを開く。
2. `拡張機能` → `Apps Script` を開く。
3. `apps-script/Code.gs` の内容を貼り付ける。
4. `デプロイ` → `新しいデプロイ` → `ウェブアプリ` を選ぶ。
5. 実行ユーザーは `自分`、アクセスできるユーザーはまず `全員` にする。
6. WebアプリURLをコピーする。

## 2. フォーム側へURLを入れる

`script.js` のここを差し替える。

```js
appsScriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
```

例:

```js
appsScriptUrl: "https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec",
```

## 3. GitHubにアップロード

GitHubで `nextonestepinfo-ops/hearing-form` を作成してから、下記をリポジトリ直下に入れる。

アップロードするファイル:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`
- `github-publish.md`
- `apps-script/Code.gs`
- `preview-desktop.png`
- `preview-mobile.png`

Codexから作業する場合は、リポジトリ作成後にこのフォルダの中身をそのままアップロードする。

## 4. GitHub Pagesを有効化

1. GitHubのリポジトリを開く。
2. `Settings`
3. `Pages`
4. `Build and deployment`
5. `Source` を `Deploy from a branch`
6. `Branch` を `main` / `/root` にする。
7. `Save`

## 5. テスト

1. 公開URLを開く。
2. テスト回答を送信する。
3. スプレッドシートの `ヒアリング入力` タブに1行追加されるか確認する。

失敗した場合は、Apps Scriptの `実行数` と `ログ` を見る。
