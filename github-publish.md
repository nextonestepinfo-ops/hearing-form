# GitHub Pages 公開手順

## 公開先

- GitHubアカウント: `nextonestepinfo-ops`
- リポジトリ名: `hearing-form`
- 店内業務用URL: `https://nextonestepinfo-ops.github.io/hearing-form/`
- Webサイト用URL: `https://nextonestepinfo-ops.github.io/hearing-form/website/`

既存リポジトリに混ぜると営業用フォームの場所が分かりにくくなるため、ヒアリングフォーム系はこのリポジトリにまとめる。

## 1. Apps Scriptを先に用意する

1. 追記先スプレッドシートを開く。
2. `拡張機能` → `Apps Script` を開く。
3. 使うフォームに合わせて `apps-script/Code.gs` または `website/apps-script/Code.gs` の内容を貼り付ける。
4. `デプロイ` → `新しいデプロイ` → `ウェブアプリ` を選ぶ。
5. 実行ユーザーは `自分`、アクセスできるユーザーはまず `全員` にする。
6. WebアプリURLをコピーする。

## 2. フォーム側へURLを入れる

対象フォームの `script.js` のここを差し替える。

```js
appsScriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
```

## 3. GitHubにアップロード

主なファイル:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`
- `github-publish.md`
- `apps-script/Code.gs`
- `website/index.html`
- `website/styles.css`
- `website/script.js`
- `website/README.md`
- `website/apps-script/Code.gs`

## 4. テスト

1. 公開URLを開く。
2. テスト回答を送信する。
3. スプレッドシートの `ヒアリング入力` タブに1行追加されるか確認する。

失敗した場合は、Apps Scriptの `実行数` と `ログ` を見る。
