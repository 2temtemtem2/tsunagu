const palette = ["#E8743B","#1F3A5F","#2BB673","#E84B7C","#7C5CE8","#3B9AE8","#E8B53B","#11998e"];
const grad = (a, b) => `linear-gradient(150deg,${a},${b})`;
export const col = (i) => palette[i % palette.length];
export const initial = (n) => n.charAt(0);

export const friends = [
  { id:1, name:"ユウキ", age:26, tags:["カフェ","写真"], want:true, wantText:"穏やかに話せる友達がほしい", purpose:"友達",
    stories:[{bg:grad("#f6d365","#fda085"),txt:"朝のカフェでまったり☕️\n新しいお店開拓中"},
             {bg:grad("#a1c4fd","#c2e9fb"),txt:"今日撮った1枚📷"}],
    posts:[{bg:grad("#f6d365","#fda085"),cap:"週末は写真散歩。光がきれいだった",likes:34},
           {bg:grad("#84fab0","#8fd3f4"),cap:"豆を変えたら世界が変わった",likes:21}]},
  { id:2, name:"ミオ", age:24, tags:["映画","ボルダリング"], want:true, wantText:"恋愛、ゆっくり始めたい", purpose:"恋愛",
    stories:[{bg:grad("#667eea","#764ba2"),txt:"ボルダリング3級いけた🧗‍♀️"},
             {bg:grad("#ee9ca7","#ffdde1"),txt:"今夜は映画ナイト🎬"}],
    posts:[{bg:grad("#667eea","#764ba2"),cap:"登りきった時の達成感がすき",likes:48},
           {bg:grad("#ee9ca7","#ffdde1"),cap:"今月観た映画ベスト3",likes:30}]},
  { id:3, name:"ハル", age:28, tags:["スタートアップ","登山"], want:false, purpose:"人脈",
    stories:[{bg:grad("#30cfd0","#330867"),txt:"山頂からの景色⛰️"}],
    posts:[{bg:grad("#30cfd0","#330867"),cap:"早朝の登山。頭が冴える",likes:55}]},
  { id:4, name:"ソウタ", age:27, tags:["音楽","ゲーム"], want:true, wantText:"趣味が合う人募集", purpose:"趣味",
    stories:[{bg:grad("#f093fb","#f5576c"),txt:"宅録してる🎧"}],
    posts:[{bg:grad("#f093fb","#f5576c"),cap:"新しい曲、作ってます",likes:27}]},
  { id:5, name:"アヤ", age:25, tags:["旅行","料理"], want:false, purpose:"友達",
    stories:[{bg:grad("#fbc2eb","#a6c1ee"),txt:"作りおきの日🍳"}],
    posts:[{bg:grad("#fbc2eb","#a6c1ee"),cap:"今週の作りおき。映え狙ってない",likes:40}]},
  { id:6, name:"レン", age:29, tags:["ランニング","読書"], want:true, wantText:"フラットに話せる相手", purpose:"恋愛",
    stories:[{bg:grad("#c79081","#dfa579"),txt:"朝ラン10km🏃"}],
    posts:[{bg:grad("#c79081","#dfa579"),cap:"読了。静かな小説が沁みる",likes:33}]},
].map((f, i) => ({ ...f, _c: col(i) }));

export const initialChats = [
  { id:1, withName:"カナ", color:col(3), byName:"ミオ",
    intro:"ミオさんが紹介：「2人ともボルダリング好きだから合うと思う！」",
    messages:[{who:'them',text:"はじめまして！ミオから紹介で…🙌"},{who:'them',text:"ボルダリングいつ頃から？"}]},
];
