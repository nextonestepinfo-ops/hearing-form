# 白狼このは公式サイト V3 Official

既存版 `shirokami-konoha-site-template` と V2 `shirokami-konoha-site-template-v2-collage` を残したまま作成した、別バージョンの公式サイトです。

## V3の狙い

- MOVIEセクション周辺でサムネが浮遊する演出
- ローディング後にサイトが組み上がる演出
- トップビジュアルがドンと出るズームイン
- SNSアイコンのぷるぷる浮遊
- タグ文字のステッカー化
- MOVIEセクションの弾幕ポップ演出
- YouTube公式チャンネルの実アーカイブを表示
- 将来の量産に向けた `site-config.json` 駆動

## 主要ファイル

- `index.html`: 公式サイト本体
- `builder.html`: 次回以降の素材差し替え用ビルダープロトタイプ
- `site-config.json`: 名前、素材、SNS、タグ、YouTubeサムネ設定
- `youtube-archives.json`: 直近のYouTubeアーカイブ一覧
- `styles.css`: V3演出、レスポンシブ、ビルダーUI
- `script.js`: パスワードゲート、ロード演出、設定読み込み、YouTubeサムネ反映

## YouTubeサムネについて

初期状態は `youtube-archives.json` から直近の動画を読み込みます。

動画IDを `site-config.json` の `youtube.fallbackVideos` に入れると、`https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg` の形式でサムネを自動表示できます。

完全な「最新動画の自動反映」は、静的HTMLだけだとYouTube RSSのCORS制限を受けるため、`youtube.latestJsonUrl` に更新済みJSON、RSS変換API、自前プロキシのURLを入れる設計にしています。

## 公開パス案

`https://nextonestepinfo-ops.github.io/hearing-form/shirokami-konoha-site-template-v3-summon/`

確認用パスワードは既存版と同じ `konoha2026` です。
