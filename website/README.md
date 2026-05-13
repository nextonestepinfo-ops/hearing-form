# NosTechnology Webサイト制作ヒアリングフォーム

GitHub Pagesで公開できるWebサイト制作向けの静的ヒアリングフォームです。

回答は Google Apps Script 経由で、Googleスプレッドシート `05_ヒアリングシート_実店舗テスト_2026-05` の `ヒアリング入力` タブへ追記します。

## ファイル

- `index.html`: Webサイト制作ヒアリングフォーム本体
- `styles.css`: 画面デザイン
- `script.js`: 入力チェック、送信処理、下書き保存
- `../apps-script/Code.gs`: Google Apps Scriptに貼り付ける共通追記処理

## 使い方

1. Googleスプレッドシートを開く。
2. `拡張機能` → `Apps Script` を開く。
3. 1つ上の階層にある `apps-script/Code.gs` の中身を貼り付けて保存する。
4. Apps ScriptをWebアプリとしてデプロイする。
5. 発行されたWebアプリURLを `script.js` と `../script.js` の `CONFIG.appsScriptUrl` に入れる。
6. GitHub Pagesへ公開する。
7. テスト送信し、`ヒアリング入力` タブに1行追加されるか確認する。

## 公開URL

`https://nextonestepinfo-ops.github.io/hearing-form/website/`

## 注意

- ログイン情報、決済情報、顧客個人情報は入力しない。
- GitHub Pages側にGoogle認証情報は置かない。
- Apps Script URLが未設定の間は、送信内容はブラウザ内の下書きとして保存される。
- Apps Scriptは1本で店内業務用フォームとWebサイト用フォームの両方を受け付ける。
