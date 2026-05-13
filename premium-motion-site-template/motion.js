const modes={
  lounge:{images:['https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=2000&q=82','https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=82'],brand:['AURORA','LOUNGE'],small:'AURORA LOUNGE',kicker:'NIGHT LOUNGE / PREMIUM SITE',lead:'写真、料金、出勤、予約導線を一つの体験として見せる、高単価向けのリッチ演出サイト。',cta:'来店予約',badge:'Tonight 20:00',liveTitle:'Premium Night',liveCopy:'今日のイベント、出勤、予約状況を最初の画面で見せます。',marquee:'AURORA LOUNGE / RESERVATION / CAST / SYSTEM / EVENT',conceptTitle:'空気感まで伝わる、予約につながるサイト。',conceptLead:'店舗の世界観、当日の情報、予約導線までを、スクロール演出と写真で自然につなぎます。',features:[['世界観設計','写真、色、言葉、動きをそろえて第一印象を強くします。'],['予約導線','LINE、電話、フォームなど、迷わず連絡できる入口を置きます。'],['更新しやすい情報','出勤、イベント、料金システムを差し替えやすい構成。'],['高級感の演出','ローディング、奥行き、横移動、常時モーションで印象を作ります。']],chapters:[['First View','開いた瞬間に、店の世界観を伝える。背景、写真、タイトルが奥行きを持って動きます。'],['System','料金、セット、指名、VIP席など、営業で聞かれる情報を見せやすく整理します。'],['Cast','キャストの魅力を写真と短いプロフィールで強く出します。'],['Reservation','雰囲気を見た後に、そのままLINE予約や電話へ進める導線を置きます。']],variant:'ラウンジ、カフェ、Vtuber、タレント系まで、写真と文言を差し替えるだけでなく、予約や問い合わせの流れも業種ごとに合わせます。',contactTitle:'雰囲気を見たまま、予約へ。',contactCopy:'LINE、電話、フォーム、SNSなど、相手の運用に合わせて一番使いやすい導線に差し替えられます。'},
  cafe:{images:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2000&q=82','https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=82'],brand:['AURORA','CAFE'],small:'AURORA CAFE',kicker:'CAFE / MENU / RESERVATION',lead:'季節メニュー、席の雰囲気、SNS導線、予約相談まで、カフェの魅力を写真中心で届けるサイト。',cta:'席を相談する',badge:'Today 11:00',liveTitle:'Seasonal Menu',liveCopy:'今週のおすすめ、席情報、テイクアウト導線を前面に出します。',marquee:'AURORA CAFE / SEASONAL MENU / TABLE / TAKEOUT / SNS',conceptTitle:'お店の温度感が、そのまま伝わる。',conceptLead:'メニューだけでは伝わらない空間、接客、こだわりを見せて、来店前の安心感を作ります。',features:[['季節メニュー','おすすめ、限定商品、ランチ情報をすぐ見つけられる位置に配置。'],['席・予約','席数、貸切、混雑しやすい時間帯などの相談導線を用意。'],['SNS連携','InstagramやLINEへの導線を自然に組み込みます。'],['小さな更新','今週のメニューや営業日を差し替えやすい構成にします。']],chapters:[['Mood','写真と余白で、入店前に店内の雰囲気が伝わる見え方にします。'],['Menu','季節メニュー、ランチ、テイクアウトを動きのあるカードで見せます。'],['Seat','席情報、貸切、混雑時間など、問い合わせ前の不安を減らします。'],['Contact','LINE、Instagram、電話など、店舗が使う連絡方法へつなげます。']],variant:'カフェでは、メニュー更新、席相談、SNS、テイクアウトなど、日々の運用が回る導線に寄せます。',contactTitle:'気になったら、そのまま席相談へ。',contactCopy:'予約フォーム、LINE、Instagram、電話など、店舗が実際に使える連絡方法に合わせます。'},
  vtuber:{images:['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2000&q=82','https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=82'],brand:['AURORA','LIVE'],small:'AURORA LIVE',kicker:'VTUBER / LIVE / FAN SITE',lead:'配信予定、プロフィール、グッズ、ファン導線をまとめて、世界観のある公式サイトとして見せます。',cta:'配信予定を見る',badge:'Live 21:00',liveTitle:'Tonight Stream',liveCopy:'配信予定、待機所、グッズ、ファンコミュニティをまとめます。',marquee:'AURORA LIVE / STREAM / PROFILE / GOODS / FAN CLUB',conceptTitle:'配信の外でも、世界観に触れられる場所。',conceptLead:'SNSだけでは流れてしまう情報を、プロフィール、予定、グッズ、ファン導線として整理します。',features:[['プロフィール','ビジュアル、声の雰囲気、活動内容を一目で伝えます。'],['配信予定','YouTube、Twitch、イベント予定を見やすく配置。'],['グッズ導線','BOOTH、EC、ファンクラブなど販売先へ案内します。'],['世界観演出','背景、動き、言葉のトーンをキャラクターに合わせます。']],chapters:[['Profile','キャラクターの魅力、設定、活動内容を短時間で伝えます。'],['Schedule','配信予定やイベントを、スクロールで気持ちよく確認できます。'],['Goods','グッズやファンクラブへの導線を、世界観を崩さず置きます。'],['Stream','配信待機所、SNS、アーカイブへ迷わず進める構成です。']],variant:'Vtuberや配信者では、公式感とファン導線を両立させ、SNSだけに情報が流れない形を作ります。',contactTitle:'配信前に、ファンが迷わない。',contactCopy:'SNS、動画プラットフォーム、グッズ販売、ファンコミュニティへの導線を一本化できます。'},
  talent:{images:['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=2000&q=82','https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=82','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=82'],brand:['AURORA','TALENT'],small:'AURORA TALENT',kicker:'TALENT / PROFILE / BOOKING',lead:'プロフィール、出演実績、写真、問い合わせを一つにまとめ、仕事につながる公式サイトにします。',cta:'出演相談',badge:'Booking Open',liveTitle:'Media Kit',liveCopy:'出演実績、写真、SNS実績、問い合わせを一つにまとめます。',marquee:'AURORA TALENT / PROFILE / WORKS / BOOKING / MEDIA KIT',conceptTitle:'印象、実績、問い合わせを一つに。',conceptLead:'活動内容を整理し、写真と実績で信頼感を作りながら、問い合わせまで迷わず進めます。',features:[['プロフィール','人物の魅力、肩書き、活動領域をわかりやすく見せます。'],['実績掲載','出演、受賞、制作実績、SNS実績を整理。'],['媒体資料','問い合わせ前に必要な情報をまとめて渡せます。'],['依頼導線','出演、広告、イベント、撮影など目的別に連絡できます。']],chapters:[['Identity','人物像と活動領域を、写真と短い言葉で強く出します。'],['Works','出演実績、写真、動画、SNS実績を整理して見せます。'],['Media Kit','依頼前に必要な資料へスムーズに誘導できます。'],['Booking','出演、撮影、広告相談を目的別に受け付けます。']],variant:'タレント系では、本人の世界観、実績、媒体資料、問い合わせを一本化して、仕事につながる公式感を作ります。',contactTitle:'仕事の相談まで、まっすぐ進める。',contactCopy:'企業案件、出演依頼、撮影、コラボなど、目的別の問い合わせ導線に差し替えられます。'}
};
const root=document.documentElement;
const body=document.body;
const q=(s)=>document.querySelector(s);
const qa=(s)=>document.querySelectorAll(s);
function setText(selector,value){qa(selector).forEach((node)=>{node.textContent=value})}
function setImageVars(images){images.forEach((image,index)=>{root.style.setProperty('--img'+(index+1),'url('+image+')')})}
function applyMode(modeName){
  const mode=modes[modeName];
  body.classList.add('is-changing');
  setImageVars(mode.images);
  setText('[data-brand-small]',mode.small);
  setText('[data-footer-brand]',mode.small);
  setText('[data-kicker]',mode.kicker);
  setText('[data-lead]',mode.lead);
  setText('[data-cta]',mode.cta);
  setText('[data-main-action]',mode.cta);
  setText('[data-variant-action]',mode.cta+'・制作相談');
  setText('[data-badge]',mode.badge);
  setText('[data-live-title]',mode.liveTitle);
  setText('[data-live-copy]',mode.liveCopy);
  setText('[data-marquee]',mode.marquee);
  setText('[data-concept-title]',mode.conceptTitle);
  setText('[data-concept-lead]',mode.conceptLead);
  setText('[data-variant-copy]',mode.variant);
  setText('[data-contact-title]',mode.contactTitle);
  setText('[data-contact-copy]',mode.contactCopy);
  q('[data-title]').innerHTML='<span>'+mode.brand[0]+'</span><span>'+mode.brand[1]+'</span>';
  mode.features.forEach((feature,index)=>{setText('[data-feature-'+(index+1)+'-title]',feature[0]);setText('[data-feature-'+(index+1)+'-copy]',feature[1])});
  mode.chapters.forEach((chapter,index)=>{setText('[data-chapter-'+(index+1)+'-title]',chapter[0]);setText('[data-chapter-'+(index+1)+'-copy]',chapter[1])});
  qa('[data-mode]').forEach((button)=>{button.setAttribute('aria-pressed',String(button.dataset.mode===modeName))});
  window.setTimeout(()=>body.classList.remove('is-changing'),560);
}
const canvas=q('.motion-canvas');
const ctx=canvas.getContext('2d');
let particles=[];
let width=0;
let height=0;
function resizeCanvas(){
  const ratio=Math.min(window.devicePixelRatio||1,2);
  width=canvas.clientWidth;
  height=canvas.clientHeight;
  canvas.width=width*ratio;
  canvas.height=height*ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  particles=Array.from({length:Math.round(Math.min(120,Math.max(56,width/14)))},()=>({x:Math.random()*width,y:Math.random()*height,z:Math.random()*.8+.2,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,r:Math.random()*1.8+.35}));
}
function drawCanvas(){
  ctx.clearRect(0,0,width,height);
  const gradient=ctx.createLinearGradient(0,0,width,height);
  gradient.addColorStop(0,'rgba(215,173,98,.58)');
  gradient.addColorStop(.5,'rgba(70,214,188,.48)');
  gradient.addColorStop(1,'rgba(227,95,134,.42)');
  ctx.fillStyle=gradient;
  ctx.strokeStyle='rgba(255,248,234,.1)';
  particles.forEach((p,index)=>{
    p.x+=p.vx*p.z;p.y+=p.vy*p.z;
    if(p.x<-20)p.x=width+20;if(p.x>width+20)p.x=-20;if(p.y<-20)p.y=height+20;if(p.y>height+20)p.y=-20;
    ctx.globalAlpha=p.z;ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.z,0,Math.PI*2);ctx.fill();
    for(let j=index+1;j<particles.length;j+=1){const n=particles[j];const d=Math.hypot(p.x-n.x,p.y-n.y);if(d<105){ctx.globalAlpha=(1-d/105)*.3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(n.x,n.y);ctx.stroke()}}
  });
  ctx.globalAlpha=1;
  requestAnimationFrame(drawCanvas);
}
const showreel=q('.showreel');
const reel=q('.reel');
function updateScroll(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const progress=max>0?window.scrollY/max:0;
  root.style.setProperty('--progress',(progress*100).toFixed(2));
  const rect=showreel.getBoundingClientRect();
  const total=showreel.offsetHeight-window.innerHeight;
  const scene=Math.min(1,Math.max(0,-rect.top/total));
  root.style.setProperty('--scene',scene.toFixed(4));
  const wrapWidth=Math.min(1180,window.innerWidth-36);
  const sideSpace=Math.max(18,(window.innerWidth-wrapWidth)/2);
  const maxShift=Math.max(0,reel.scrollWidth-window.innerWidth+sideSpace*2);
  reel.style.transform='translate3d('+(-scene*maxShift)+'px,0,0)';
}
function updatePointer(event){
  const x=event.clientX/window.innerWidth-.5;
  const y=event.clientY/window.innerHeight-.5;
  root.style.setProperty('--mx',x.toFixed(3));
  root.style.setProperty('--my',y.toFixed(3));
  root.style.setProperty('--px',event.clientX+'px');
  root.style.setProperty('--py',event.clientY+'px');
}
function runLoader(){
  const preloader=q('.loader');
  const line=q('.loader-line span');
  const count=q('.loader-count');
  let load=0;
  const timer=window.setInterval(()=>{
    load=Math.min(100,load+Math.round(Math.random()*16+9));
    line.style.setProperty('--load',load+'%');
    count.textContent=String(load).padStart(2,'0');
    if(load>=100){window.clearInterval(timer);window.setTimeout(()=>preloader.classList.add('is-done'),260)}
  },80);
}
const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting)entry.target.classList.add('is-visible')})},{threshold:.14});
qa('[data-reveal]').forEach((node)=>observer.observe(node));
qa('[data-mode]').forEach((button)=>{button.addEventListener('click',()=>applyMode(button.dataset.mode))});
q('.submit').addEventListener('click',()=>{alert('デモ送信です。実案件ではLINE、メール、スプレッドシート連携に差し替えます。')});
window.addEventListener('resize',()=>{resizeCanvas();updateScroll()});
window.addEventListener('scroll',updateScroll,{passive:true});
window.addEventListener('pointermove',updatePointer,{passive:true});
resizeCanvas();
drawCanvas();
applyMode('lounge');
updateScroll();
runLoader();
