# NosTechnology Webサイト制作ヒアリングフォーム

お客様に入力いただく、Web制作向けの静的ヒアリングフォームです。

- `index.html`: 15問構成のフォーム本体
- `script.js`: Google Apps Script送信とローカル下書き保存
- `styles.css`: フォーム用スタイル
- `apps-script/Code.gs`: 連携先Apps Script控え

回答は `siteNeeds` など既存の集計項目に加え、15問の詳細を `memo` にまとめて送信します。
