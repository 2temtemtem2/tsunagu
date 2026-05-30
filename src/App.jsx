import { useState, useEffect, useRef } from 'react'
import { friends, initialChats, initial } from './data'
import './index.css'

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null
}

function FriendCard({ f, onIntroFrom }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fcard" onClick={() => setOpen(v => !v)}>
      <div className="fcard-top">
        <div className="avatar" style={{ background: f._c, width: 52, height: 52, fontSize: 20 }}>{initial(f.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="name">{f.name}</span>
            <span className="meta">{f.age}歳</span>
            {f.want && <span className="pill">紹介OK</span>}
          </div>
          <div style={{ marginTop: 5 }}>
            {f.tags.map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        </div>
        <span className="fcard-chevron">{open ? '∧' : '∨'}</span>
      </div>
      {open && (
        <div className="fcard-body" onClick={e => e.stopPropagation()}>
          {f.want && f.wantText && (
            <div className="fcard-want">"{f.wantText}"</div>
          )}
          <div className="fcard-latest">最近：{f.posts[0].cap}</div>
          <button className="btn primary sm" style={{ marginTop: 12 }} onClick={() => onIntroFrom(f)}>
            誰かに紹介する
          </button>
        </div>
      )}
    </div>
  )
}

function HomeScreen({ onToast, onIntroFrom }) {
  return (
    <>
      <div className="topbar">
        <h1>Tsuna<span>gu</span></h1>
        <div className="sub">「この2人、合いそう」をつなぎに変える</div>
      </div>
      <div className="home-section-label">友達リスト</div>
      <div className="wrap" style={{ paddingTop: 0 }}>
        {friends.map(f => (
          <FriendCard key={f.id} f={f} onIntroFrom={onIntroFrom} onToast={onToast} />
        ))}
      </div>
    </>
  )
}

function IntroScreen({ initialPickA, onToast, onSendIntro }) {
  const [pickA, setPickA] = useState(initialPickA || null)
  const [pickB, setPickB] = useState(null)
  const [note, setNote] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => { if (initialPickA) setPickA(initialPickA) }, [initialPickA])

  const openPicker = (which) => {
    const taken = which === 'A' ? pickB?.id : pickA?.id
    setModal({ which, list: friends.filter(f => f.id !== taken) })
  }

  const send = () => {
    if (!pickA || !pickB) { onToast('2人選んでね'); return }
    onSendIntro({ id: Date.now(), personA: pickA, personB: pickB, note, byMe: true })
  }

  const Slot = ({ p, which }) => p
    ? <div className="pick filled" onClick={() => which === 'A' ? setPickA(null) : setPickB(null)}>
        <div className="avatar lg" style={{ background: p._c, margin: '0 auto 8px' }}>{initial(p.name)}</div>
        <div className="name">{p.name}</div>
        <div className="ph">変更する</div>
      </div>
    : <div className="pick" onClick={() => openPicker(which)}>
        <div style={{ fontSize: 28, color: '#cfd6e2', marginBottom: 6 }}>＋</div>
        <div className="ph">友達を選ぶ</div>
      </div>

  return (
    <>
      <div className="topbar">
        <h1>紹介<span>する</span></h1>
        <div className="sub">「この2人、合いそう」と思ったらつなごう</div>
      </div>
      <div className="wrap">
        <div className="card">
          <div className="pickwrap">
            <Slot p={pickA} which="A" />
            <div className="heart">＋</div>
            <Slot p={pickB} which="B" />
          </div>
          <div className="section-title" style={{ marginLeft: 0 }}>一言そえる（任意）</div>
          <textarea placeholder="例：2人とも写真好きだから絶対合うと思う！" value={note} onChange={e => setNote(e.target.value)} />
          <div style={{ height: 14 }} />
          <button className="btn primary" onClick={send}>紹介する</button>
          <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>
            2人がそれぞれOKしたらチャットが始まります
          </div>
        </div>
      </div>
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="name" style={{ fontSize: 16, marginBottom: 12 }}>誰を紹介する？</div>
            {modal.list.map(f => (
              <div key={f.id} className="card" style={{ margin: '8px 0', cursor: 'pointer' }}
                onClick={() => { modal.which === 'A' ? setPickA(f) : setPickB(f); setModal(null) }}>
                <div className="row">
                  <div className="avatar" style={{ background: f._c, width: 44, height: 44 }}>{initial(f.name)}</div>
                  <div>
                    <div className="name">{f.name}</div>
                    <div className="meta">{f.tags.join(' · ')}</div>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn ghost" style={{ marginTop: 4 }} onClick={() => setModal(null)}>閉じる</button>
          </div>
        </div>
      )}
    </>
  )
}

function ChatsScreen({ chats, setChats, notifications, onLike, onPass }) {
  const [activeChat, setActiveChat] = useState(null)
  const [msg, setMsg] = useState('')
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [activeChat, chats])

  const sendMsg = () => {
    if (!msg.trim()) return
    const text = msg.trim()
    setMsg('')
    const replies = ["なるほど！","それ気になる☺️","週末わりと空いてるよ","わかる、好きそう！","おもしろい！"]
    setChats(cs => cs.map(c => c.id === activeChat.id ? { ...c, messages: [...c.messages, { who: 'me', text }] } : c))
    setTimeout(() => {
      setChats(cs => cs.map(c => c.id === activeChat.id
        ? { ...c, messages: [...c.messages, { who: 'me', text }, { who: 'them', text: replies[Math.floor(Math.random() * replies.length)] }] }
        : c))
    }, 900)
  }

  if (activeChat) {
    const c = chats.find(x => x.id === activeChat.id)
    return (
      <>
        <div className="chathead">
          <button className="back" onClick={() => setActiveChat(null)}>‹</button>
          <div className="avatar" style={{ background: c.color, width: 38, height: 38, fontSize: 15 }}>{initial(c.withName)}</div>
          <div>
            <div className="name">{c.withName}</div>
            <div className="meta">{c.byName}さんの紹介</div>
          </div>
        </div>
        <div className="chatbody" ref={bodyRef}>
          <div className="sysmsg">{c.intro}</div>
          {c.messages.map((m, i) => <div key={i} className={`bubble ${m.who}`}>{m.text}</div>)}
        </div>
        <div className="chatinput">
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="メッセージ…"
            onKeyDown={e => e.key === 'Enter' && sendMsg()} autoFocus />
          <button className="send" onClick={sendMsg}>↑</button>
        </div>
      </>
    )
  }

  const pending = notifications.filter(n => n.type === 'intro')
  const matched = notifications.filter(n => n.type === 'match')

  return (
    <>
      <div className="topbar">
        <h1>つな<span>がり</span></h1>
        <div className="sub">紹介・マッチ・やりとりをここで</div>
      </div>
      <div className="wrap">

        {pending.length > 0 && (
          <>
            <div className="section-title" style={{ color: 'var(--accent)' }}>紹介が届いています</div>
            {pending.map(n => (
              <div key={n.id} className="notif-card">
                <div className="notif-type">友達からの紹介</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <div className="avatar" style={{ background: n.person._c, width: 48, height: 48 }}>{initial(n.person.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{n.person.name} <span className="meta">{n.person.age}歳</span></div>
                    <div style={{ marginTop: 4 }}>{n.person.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>
                  </div>
                </div>
                {n.note && <div className="pending-note" style={{ marginTop: 10 }}>{n.note}</div>}
                <div className="pending-actions" style={{ marginTop: 12 }}>
                  <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => onPass(n.id)}>今回はパス</button>
                  <button className="btn primary sm" style={{ flex: 1 }} onClick={() => onLike(n.id)}>会ってみたい</button>
                </div>
              </div>
            ))}
          </>
        )}

        {matched.length > 0 && (
          <>
            <div className="section-title" style={{ color: 'var(--green)' }}>つながりました</div>
            {matched.map(n => (
              <div key={n.id} className="notif-card" style={{ borderColor: 'var(--green)' }}>
                <div className="row">
                  <div className="avatar" style={{ background: n.person._c, width: 44, height: 44 }}>{initial(n.person.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{n.person.name}さんとつながりました 🎉</div>
                    <div className="meta" style={{ marginTop: 3 }}>まずは気軽に話しかけてみよう</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {chats.length > 0 && (
          <>
            <div className="section-title">やりとり中</div>
            {chats.map(c => (
              <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveChat(c)}>
                <div className="row">
                  <div className="avatar" style={{ background: c.color, width: 48, height: 48 }}>{initial(c.withName)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{c.withName}</div>
                    <div className="meta">{c.byName}さんの紹介</div>
                    <div className="meta" style={{ marginTop: 3, color: '#9aa6b8' }}>{c.messages[c.messages.length - 1].text}</div>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 18 }}>›</div>
                </div>
              </div>
            ))}
          </>
        )}

        {pending.length === 0 && matched.length === 0 && chats.length === 0 && (
          <div className="empty" style={{ marginTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>まだつながりはありません</div>
            <div>友達タブから誰かを紹介してみよう</div>
          </div>
        )}
      </div>
    </>
  )
}

const ALL_TAGS = ['カフェ','写真','映画','音楽','旅行','料理','登山','読書','ゲーム','ランニング','スポーツ','アート','ファッション','スタートアップ']

function ProfileScreen({ profile, onSave, onToast }) {
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(profile.age)
  const [bio, setBio] = useState(profile.bio)
  const [tags, setTags] = useState(profile.tags)
  const [wantOn, setWantOn] = useState(profile.wantOn)
  const [wantText, setWantText] = useState(profile.wantText)

  const toggleTag = (t) => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : ts.length < 5 ? [...ts, t] : ts)

  const save = () => {
    onSave({ name, age, bio, tags, wantOn, wantText })
    onToast('保存しました')
  }

  return (
    <>
      <div className="topbar">
        <h1>プロ<span>フィール</span></h1>
        <div className="sub">友達があなたを紹介するときに表示されます</div>
      </div>
      <div className="wrap">
        <div className="card" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div className="avatar" style={{ background: '#E8743B', width: 72, height: 72, fontSize: 28, margin: '0 auto 16px' }}>
            {name.charAt(0) || '?'}
          </div>
          <div className="section-title" style={{ marginLeft: 0, textAlign: 'left' }}>名前</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="名前を入力" />
          <div className="section-title" style={{ marginLeft: 0, textAlign: 'left' }}>年齢</div>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="例：25" />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginLeft: 0 }}>ひとこと</div>
          <div className="meta" style={{ marginTop: 4 }}>どんな人か、一言で伝えよう</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder="例：週末はカフェ巡り。のんびり話せる人が好きです" style={{ height: 72, marginTop: 8 }} />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginLeft: 0 }}>興味・趣味（最大5つ）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
            {ALL_TAGS.map(t => (
              <span key={t} className={`tag ${tags.includes(t) ? 'selected-tag' : ''}`}
                style={{ cursor: 'pointer', padding: '5px 11px', fontSize: 12 }}
                onClick={() => toggleTag(t)}>#{t}</span>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 8 }}>{tags.length}/5 選択中</div>
        </div>

        <div className="card">
          <div className="toggle" style={{ margin: 0 }}>
            <div>
              <div className="name">紹介してもらう</div>
              <div className="meta">ONにすると友達があなたを紹介できます</div>
            </div>
            <div className={`switch ${wantOn ? 'on' : ''}`} onClick={() => setWantOn(v => !v)}><div className="knob" /></div>
          </div>
          {wantOn && (
            <>
              <div className="section-title" style={{ marginLeft: 0, marginTop: 14 }}>どんな人と会いたい？</div>
              <textarea value={wantText} onChange={e => setWantText(e.target.value)}
                placeholder="例：穏やかに話せる人がいいな" style={{ marginTop: 8 }} />
            </>
          )}
        </div>

        <button className="btn primary" style={{ marginTop: 4, marginBottom: 20 }} onClick={save}>保存する</button>
      </div>
    </>
  )
}

function InviteEntryScreen({ onEnter }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [inviterName, setInviterName] = useState(null)

  const VALID_CODES = { 'YUKI-2024': 'ユウキ', 'MIO-2024': 'ミオ', 'HARU-2024': 'ハル' }

  const tryCode = () => {
    const upper = code.trim().toUpperCase()
    if (VALID_CODES[upper]) { setInviterName(VALID_CODES[upper]); setError('') }
    else setError('招待コードが違うみたいです')
  }

  if (inviterName) return (
    <div className="invite-welcome">
      <div className="invite-icon">🎉</div>
      <div className="invite-from">{inviterName}さんからの招待です</div>
      <div className="invite-msg">
        Tsunaguは、友達が橋渡しするつながりアプリです。<br />
        自分でアピールしなくていい。<br />
        {inviterName}さんが紹介してくれます。
      </div>
      <button className="btn primary" style={{ marginTop: 28, width: '100%' }} onClick={() => onEnter(inviterName)}>
        参加する
      </button>
    </div>
  )

  return (
    <div className="invite-entry">
      <div className="invite-logo">Tsuna<span>gu</span></div>
      <div className="invite-catch">友達の紹介で、<br />出会う。</div>
      <div className="invite-sub">招待制です。友達からコードを受け取ってください。</div>
      <div className="invite-form">
        <input
          placeholder="招待コード（例: YUKI-2024）"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && tryCode()}
          style={{ textAlign: 'center', letterSpacing: '0.08em' }}
        />
        {error && <div className="invite-error">{error}</div>}
        <button className="btn primary" style={{ marginTop: 12 }} onClick={tryCode}>入る</button>
      </div>
    </div>
  )
}

function InviteScreen({ onToast }) {
  const [selected, setSelected] = useState(null)
  const myCode = 'ANATA-2024'

  const copy = () => {
    const msg = selected
      ? `${selected.name}、Tsunaguっていうアプリ使ってみて！\n招待コード: ${myCode}\nhttps://tsunagu.vercel.app`
      : `招待コード: ${myCode}\nhttps://tsunagu.vercel.app`
    navigator.clipboard?.writeText(msg).catch(() => {})
    onToast('コピーしました')
  }

  return (
    <>
      <div className="topbar">
        <h1>友達を<span>招待</span></h1>
        <div className="sub">招待した人があなたの友達になります</div>
      </div>
      <div className="wrap">
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="meta" style={{ marginBottom: 10 }}>あなたの招待コード</div>
          <div className="invite-code">{myCode}</div>
          <div className="meta" style={{ marginTop: 10 }}>友達に直接伝えてください</div>
        </div>

        <div className="section-title">誰を招待する？</div>
        <div className="meta" style={{ padding: '0 4px', marginBottom: 8 }}>選ぶと一緒にメッセージをコピーできます</div>
        <div className="invite-friend-list">
          {friends.map(f => (
            <div key={f.id} className={`invite-friend ${selected?.id === f.id ? 'selected' : ''}`}
              onClick={() => setSelected(s => s?.id === f.id ? null : f)}>
              <div className="avatar" style={{ background: f._c, width: 40, height: 40 }}>{initial(f.name)}</div>
              <span className="name" style={{ fontSize: 13 }}>{f.name}</span>
              {selected?.id === f.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <button className="btn primary" style={{ marginTop: 16 }} onClick={copy}>
          {selected ? `${selected.name}への招待メッセージをコピー` : '招待コードをコピー'}
        </button>
      </div>
    </>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [invitedBy, setInvitedBy] = useState(null)
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState('')
  const [introPickA, setIntroPickA] = useState(null)
  const [chats, setChats] = useState(initialChats)
  const [notifications, setNotifications] = useState([])
  const [profile, setProfile] = useState({ name: '', age: '', bio: '', tags: [], wantOn: false, wantText: '' })
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const handleEnter = (name) => { setInvitedBy(name); setEntered(true) }
  const handleIntroFrom = (f) => { setIntroPickA(f); setTab('intro') }

  const handleSendIntro = (intro) => {
    setNotifications(n => [
      { id: Date.now(), type: 'intro', person: intro.personA, note: intro.note, read: false },
      ...n
    ])
    setTab('chats')
    showToast(`${intro.personA.name}さんと${intro.personB.name}さんに紹介しました`)
  }

  const handleLike = (notifId) => {
    const notif = notifications.find(n => n.id === notifId)
    const newChat = {
      id: Date.now(),
      withName: notif.person.name,
      color: notif.person._c,
      byName: '友達',
      intro: `友達の紹介で${notif.person.name}さんとつながりました${notif.note ? '。「' + notif.note + '」' : ''}`,
      messages: [{ who: 'them', text: 'はじめまして！紹介してもらいました🙌' }]
    }
    setChats(c => [...c, newChat])
    setNotifications(n => [
      { id: Date.now(), type: 'match', person: notif.person, read: false },
      ...n.filter(x => x.id !== notifId)
    ])
    showToast(`${notif.person.name}さんとつながりました！`)
  }

  const handlePass = (notifId) => {
    setNotifications(n => n.filter(x => x.id !== notifId))
    showToast('パスしました')
  }

  const unreadCount = notifications.filter(n => !n.read && n.type === 'intro').length

  const tabs = [
    ["home",    "👥", "友達"],
    ["intro",   "🤝", "紹介する"],
    ["chats",   "💬", "つながり"],
    ["profile", "🙂", "マイページ"],
  ]

  if (!entered) return (
    <div className="phone">
      <div className="statusbar">9:41　　Tsunagu　　●●●</div>
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <InviteEntryScreen onEnter={handleEnter} />
      </div>
    </div>
  )

  return (
    <div className="phone">
      <div className="statusbar">9:41　　Tsunagu　　●●●</div>
      {invitedBy && (
        <div className="invited-by-bar">{invitedBy}さんの紹介で参加中</div>
      )}
      <div className="screen">
        {tab === 'home'    && <HomeScreen onToast={showToast} onIntroFrom={handleIntroFrom} onConnect={() => {}} pendingIntros={[]} onLike={() => {}} onPass={() => {}} />}
        {tab === 'intro'   && <IntroScreen initialPickA={introPickA} onToast={showToast} onSendIntro={handleSendIntro} />}
        {tab === 'chats'   && <ChatsScreen chats={chats} setChats={setChats} notifications={notifications} onLike={handleLike} onPass={handlePass} />}
        {tab === 'profile' && <ProfileScreen profile={profile} onSave={setProfile} onToast={showToast} />}
      </div>
      <div className="tabbar">
        {tabs.map(([k, ic, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`}
            onClick={() => { setTab(k); if (k !== 'intro') setIntroPickA(null) }}
            aria-label={l}>
            <span className="tab-ic">{ic}</span>
            {k === 'chats' && unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  )
}
