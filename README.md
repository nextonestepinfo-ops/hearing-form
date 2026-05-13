# NosTechnology 店内業務ミニヒアリングフォーム

GitHub Pagesで公開できる静的フォームです。

送信データは Google Apps Script を経由して、Googleスプレッドシート `05_ヒアリングシート_実店舗テスト_2026-05` の `ヒアリング入力` タブへ追記します。

## ファイル

- `index.html`: 店内業務向け入力フォーム本体
- `styles.css`: 店内業務向け画面デザイン
- `script.js`: 店内業務向け入力チェック、送信処理、下書き保存
- `apps-script/Code.gs`: 店内業務向けGoogle Apps Script追記処理
- `github-publish.md`: GitHub Pages公開手順
- `website/`: Webサイト制作向けヒアリングフォーム

## 使い方

1. Googleスプレッドシートを開く。
2. `拡張機能` → `Apps Script` を開く。
3. 使うフォームに合わせて `apps-script/Code.gs` または `website/apps-script/Code.gs` の中身を貼り付けて保存する。
4. Apps ScriptをWebアプリとしてデプロイする。
5. 発行されたWebアプリURLを対象フォームの `script.js` の `CONFIG.appsScriptUrl` に入れる。
6. GitHub Pagesへ公開する。
7. テスト送信し、`ヒアリング入力` タブに1行追加されるか確認する。

## 送信先

スプレッドシート:

`https://docs.google.com/spreadsheets/d/1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M/edit`

追記タブ:

`ヒアリング入力`

## フォームURL

- 店内業務用: `https://nextonestepinfo-ops.github.io/hearing-form/`
- Webサイト用: `https://nextonestepinfo-ops.github.io/hearing-form/website/`

## 注意

- パスワード、ログイン情報、給与明細、顧客個人情報は入力しない。
- GitHub Pages側にGoogle認証情報は置かない。
- Apps Script URLが未設定の間は、送信内容はブラウザ内の下書きとして保存される。
