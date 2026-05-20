# 白狼このは公式サイト V3 制作プロンプト

## 目的

白狼このはさんの公式サイトを、既存のV3デザインを基準にブラッシュアップする。  
デモサイトではなく、活動中タレントの「公式サイト」として見える品質にする。

## 全体トーン

- ミント、シルバー、白を中心にした明るい配色
- ステッカー、ピクセル、ウィンドウUI、キラキラ、リボン、肉球チャームを使う
- かわいい加工文字、ゲームUI、配信画面の雰囲気を混ぜる
- ただし子どもっぽくしすぎず、公式サイトとして読める余白と視認性を保つ
- キャラクターの新規生成はしない
- 立ち絵、ロゴ、ちびキャラ、SNSアイコン、YouTubeサムネなど既存素材を使う
- 追加生成する場合は背景、ステッカー、UI枠、装飾素材のみに限定する
- GIFは使わず、CSSアニメーションと軽いJavaScriptで動かす

## トップ演出

- ロード画面はゲーム風の `Now Loading...`
- ロード後にサイトが組み上がるように、UI枠、ロゴ、立ち絵、ステッカーが順番に出る
- トップはロゴと大きな立ち絵を主役にする
- スマホでは全身を小さく見せるのではなく、半身アップで「顔」になる構図にする
- 背景は淡いミントのグリッド、窓UI、テープ、ステッカー、キラキラが重なっている感じ
- スクロールやマウス移動に合わせて背景色、ステッカー、立ち絵が少し反応する
- 動きは派手すぎず、常に画面が少し生きている程度にする

## MOVIEセクションの弾幕演出プロンプト

YouTubeアーカイブのカードを中心に、配信コメントがかわいいステッカーとして飛び出してくるMOVIEセクションを作ってください。

演出は、ニコニコ風に文字が横へ流れるだけではなく、動画ウィンドウの周囲にコメントバブルがポンポン出現する形にします。  
コメントは大きめで、白フチ、ミント、淡いピンク、クリーム色のステッカー風。  
角丸のピル型、少し傾いた配置、影、白い縁取り、ぷるっとした拡大縮小を入れてください。

コメント例:

- このはー！
- ないすー！
- おしゃべり助かる
- えらい！
- かわいい！
- 初見です
- GG!
- かまって！
- 天才かも
- 応援してる

動き:

- それぞれのコメントが別々の位置から、少し遅延して出現する
- `opacity: 0` から始まり、`scale(0.72)` で小さく出て、`scale(1.08)` まで跳ねて、最後に少し上へ抜けながら消える
- 6秒前後のループで、コメントごとに `animation-delay` をずらす
- 配置は左上、右上、中央上、右中央、左下、右下などに分散する
- 動画サムネイルの顔や重要なテキストを完全に隠さない
- スマホでは表示数を6個程度に減らし、文字サイズも少し抑える
- `prefers-reduced-motion` では弾幕の移動を止める、または最低限のフェードにする

見た目:

- コメントの文字は太く、丸く、かわいいフォント
- 文字色は濃いグレー寄りのミント、くすみピンク、淡いブラウンを使う
- 背景は半透明白からミント、ピンク、クリームへの淡いグラデーション
- 影は柔らかく、ステッカーが浮いているようにする
- 画面全体の雰囲気は「配信中のコメントが魔法みたいに飛び出してくる」感じ

実装イメージ:

```html
<div class="movie-danmaku" aria-hidden="true">
  <span>このはー！</span>
  <span>ないすー！</span>
  <span>おしゃべり助かる</span>
  <span>えらい！</span>
  <span>かわいい！</span>
  <span>初見です</span>
  <span>GG!</span>
  <span>かまって！</span>
  <span>天才かも</span>
  <span>応援してる</span>
</div>
```

```css
.movie-danmaku {
  position: absolute;
  inset: -34px -2vw auto;
  min-height: 500px;
  pointer-events: none;
  z-index: 7;
}

.movie-danmaku span {
  position: absolute;
  display: inline-grid;
  min-height: 48px;
  place-items: center;
  border: 3px solid rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 7px 18px;
  color: #4d6c72;
  background: linear-gradient(135deg, rgba(255,255,255,.94), rgba(200,247,237,.78));
  box-shadow:
    0 14px 0 rgba(255,255,255,.38),
    0 22px 34px rgba(70,104,109,.16),
    0 0 0 4px rgba(200,247,237,.28);
  font-family: var(--cute);
  font-size: clamp(1.12rem, 2.1vw, 1.72rem);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  text-shadow: 0 2px 0 #fff, 0 5px 0 rgba(115,203,184,.22);
  animation: danmaku-pop 6.4s cubic-bezier(.18,.88,.24,1) infinite;
}

.movie-danmaku span:nth-child(3n+2) {
  color: #7f5d72;
  background: linear-gradient(135deg, #fff, rgba(242,223,232,.9));
}

.movie-danmaku span:nth-child(3n) {
  color: #6f6750;
  background: linear-gradient(135deg, #fff, rgba(255,248,219,.95));
}

.movie-danmaku span:nth-child(1) { left: 4%; top: 14%; rotate: -5deg; animation-delay: -.2s; }
.movie-danmaku span:nth-child(2) { right: 5%; top: 17%; rotate: 5deg; animation-delay: -1.1s; }
.movie-danmaku span:nth-child(3) { left: 30%; top: 1%; rotate: -3deg; animation-delay: -1.9s; }
.movie-danmaku span:nth-child(4) { right: 24%; top: 46%; rotate: 4deg; animation-delay: -2.8s; }
.movie-danmaku span:nth-child(5) { left: 15%; top: 58%; rotate: -4deg; animation-delay: -3.6s; }
.movie-danmaku span:nth-child(6) { right: 36%; top: 72%; rotate: 3deg; animation-delay: -4.4s; }

@keyframes danmaku-pop {
  0% {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(.72);
    filter: blur(2px);
  }
  12% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1.08);
    filter: blur(0);
  }
  26% {
    opacity: 1;
    transform: translate3d(0, -4px, 0) scale(1);
  }
  72% {
    opacity: 1;
    transform: translate3d(0, -12px, 0) scale(1.02);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -34px, 0) scale(.9);
  }
}

@media (max-width: 760px) {
  .movie-danmaku span {
    min-height: 38px;
    padding: 6px 13px;
    font-size: .9rem;
  }

  .movie-danmaku span:nth-child(n+7) {
    display: none;
  }
}
```

## YouTubeサムネ演出

- MOVIEセクションでは最新アーカイブのサムネイルをメインに表示する
- 可能ならYouTube APIやJSONから新しいものを自動で読む
- 自動取得が難しい場合は `youtube-archives.json` のような手動更新JSONを読み込む
- サムネイルはトップではなくMOVIEセクション周辺で飛ばす
- サムネイルは大きくしすぎず、動画ウィンドウの世界観を強める装飾として使う

## 実装時の注意

- 公式ロゴは白背景でも読めるように、周囲に白い面、影、薄い縁取りを入れる
- 見出しは英語を大きく、日本語説明は短くする
- プロフィールの立ち絵は枠なしで大きく見せる
- 「プロフィールのビジュアル説明」など説明臭い文章は入れない
- 文言は少なめでよい
- キャッチは次の程度に抑える

```text
ゲームとおしゃべりが大好き。
かまってちゃんのさみしがり屋オオカミ
```

## 完成基準

- スマホのファーストビューでキャラクターが強く見える
- ローディング、トップ、MOVIE、プロフィールのどこかに常に動きがある
- 弾幕がかわいく、広告動画でも目に留まる
- 画像が荒く見えない
- テキストが不自然に改行されない
- 公式サイトとして見える
- 既存版を壊さず、別フォルダ・別URLで公開できる
