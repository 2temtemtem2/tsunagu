import { useState, useEffect, useRef } from 'react'
import { friends, initialChats, initial } from './data'
import './index.css'

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null
}

function StoryViewer({ user, onClose, onIntro, onConnect }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      if (idx < user.stories.length - 1) setIdx(i => i + 1)
      else onClose()
    }, 4000)
    return () => clearTimeout(t)
  }, [idx, user])

  const st = user.stories[idx]
  return (
    <div className="viewer">
      <div className="vbars">
        {user.stories.map((_, i) => (
          <div key={i} className={`vbar ${i < idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}><i /></div>
        ))}
      </div>
      <div className="vhead">
        <div className="avatar" style={{ background: user._c, width: 34, height: 34, fontSize: 14 }}>{initial(user.name)}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
          <div style={{ fontSize: 11, opacity: .8 }}>{user.tags.map(t => '#' + t).join(' ')}</div>
        </div>
        <button className="vx" onClick={onClose}>×</button>
      </div>
      <div className="vbody" style={{ background: st.bg }}>
        {st.txt.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
        <div className="vnav">
          <div onClick={() => setIdx(i => Math.max(0, i - 1))} />
          <div onClick={() => { if (idx < user.stories.length - 1) setIdx(i => i + 1); else onClose() }} />
        </div>
      </div>
      <div className="vfoot">
        <div className="vcap">{user.name}さんのリアルが伝わってきますね</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary sm" style={{ flex: 1 }} onClick={() => { onIntro(user); onClose() }}>この人を紹介する</button>
          <button className="btn ghost sm" style={{ flex: 1, background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
            onClick={() => { onConnect(user); onClose() }}>つなぎたい</button>
        </div>
      </div>
    </div>
  )
}

function FriendCard({ f, onIntroFrom, onToast }) {
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
          <div style={{ marginTop: 4 }}>
            {f.tags.map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 18 }}>{open ? '︿' : '﹀'}</span>
      </div>
      {open && (
        <div className="fcard-body" onClick={e => e.stopPropagation()}>
          {f.want && f.wantText && (
            <div className="fcard-want">💬 "{f.wantText}"</div>
          )}
          <div className="fcard-latest">{f.posts[0].cap}</div>
          <button className="btn primary sm" style={{ marginTop: 10 }} onClick={() => onIntroFrom(f)}>
            この人を誰かに紹介する 🤝
          </button>
        </div>
      )}
    </div>
  )
}

function PendingIntroCard({ intro, onLike, onPass }) {
  const other = intro.personA
  return (
    <div className="pending-card">
      <div className="pending-label">🤝 紹介が届いています</div>
      <div className="pending-from">あなたと{other.name}さんを紹介したい友達がいます</div>
      <div className="pending-person">
        <div className="avatar" style={{ background: other._c, width: 56, height: 56, fontSize: 22 }}>{initial(other.name)}</div>
        <div>
          <div className="name">{other.name} <span className="meta">{other.age}歳</span></div>
          <div style={{ marginTop: 4 }}>{other.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>
          {other.wantText && <div className="meta" style={{ marginTop: 6 }}>"{other.wantText}"</div>}
        </div>
      </div>
      {intro.note && <div className="pending-note">💬 {intro.note}</div>}
      <div className="pending-actions">
        <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => onPass(intro.id)}>パス</button>
        <button className="btn primary sm" style={{ flex: 1 }} onClick={() => onLike(intro.id)}>いいね 💛</button>
      </div>
    </div>
  )
}

function HomeScreen({ onToast, onIntroFrom, onConnect, pendingIntros, onLike, onPass }) {
  return (
    <>
      <div className="topbar">
        <h1>Tsuna<span>gu</span></h1>
        <div className="sub">友達を紹介して、つながりを広げよう</div>
      </div>

      {pendingIntros.length > 0 && (
        <>
          <div className="home-section-label" style={{ color: 'var(--accent)' }}>届いた紹介 {pendingIntros.length}</div>
          <div className="wrap" style={{ paddingTop: 0 }}>
            {pendingIntros.map(intro => (
              <PendingIntroCard key={intro.id} intro={intro} onLike={onLike} onPass={onPass} />
            ))}
          </div>
        </>
      )}

      <div className="home-section-label">紹介できる友達</div>
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
    if (!pickA || !pickB) { onToast('友達を2人選んでね'); return }
    onSendIntro({ id: Date.now(), personA: pickA, personB: pickB, note, byMe: true })
    onToast(`${pickA.name}さんと${pickB.name}さんに紹介を送りました`)
    setPickA(null); setPickB(null); setNote('')
  }

  const Slot = ({ p, which }) => p
    ? <div className="pick filled" onClick={() => which === 'A' ? setPickA(null) : setPickB(null)}>
        <div className="avatar lg" style={{ background: p._c, margin: '0 auto 6px' }}>{initial(p.name)}</div>
        <div className="name">{p.name}</div><div className="ph">タップで変更</div>
      </div>
    : <div className="pick" onClick={() => openPicker(which)}>
        <div style={{ fontSize: 30, color: '#cfd6e2' }}>＋</div>
        <div className="ph">友達を選ぶ</div>
      </div>

  return (
    <>
      <div className="topbar"><h1>友達を<span>紹介</span></h1><div className="sub">「この2人、合いそう」と思ったらつなげる</div></div>
      <div className="wrap">
        <div className="card">
          <div className="pickwrap">
            <Slot p={pickA} which="A" />
            <div className="heart">♡</div>
            <Slot p={pickB} which="B" />
          </div>
          <div className="section-title" style={{ marginLeft: 0 }}>ひとことメッセージ（任意）</div>
          <textarea placeholder="例：2人とも写真好きだから合うと思って！" value={note} onChange={e => setNote(e.target.value)} />
          <div style={{ height: 12 }} />
          <button className="btn primary" onClick={send}>この2人を紹介する</button>
          <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>✓ 双方が「いいね」したらチャットが始まります</div>
        </div>
      </div>
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="name" style={{ fontSize: 16, marginBottom: 10 }}>紹介する友達を選ぶ</div>
            {modal.list.map(f => (
              <div key={f.id} className="card" style={{ margin: '8px 0', cursor: 'pointer' }}
                onClick={() => { modal.which === 'A' ? setPickA(f) : setPickB(f); setModal(null) }}>
                <div className="row">
                  <div className="avatar" style={{ background: f._c, width: 44, height: 44 }}>{initial(f.name)}</div>
                  <div><div className="name">{f.name}</div><div className="meta">{f.tags.join('・')}</div></div>
                </div>
              </div>
            ))}
            <button className="btn ghost" onClick={() => setModal(null)}>閉じる</button>
          </div>
        </div>
      )}
    </>
  )
}

function WantScreen({ onIntroFrom, onToast }) {
  const [on, setOn] = useState(false)
  const [purpose, setPurpose] = useState('恋愛')
  const [text, setText] = useState('')
  const cand = friends.filter(f => f.want)

  return (
    <>
      <div className="topbar"><h1>紹介して<span>ほしい</span></h1><div className="sub">受け身でOK。友達があなたに合う人をつないでくれる</div></div>
      <div className="wrap">
        <div className="toggle">
          <div>
            <div className="name">紹介を受け付ける</div>
            <div className="meta">ONにすると友達があなたを紹介できます</div>
          </div>
          <div className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(v => !v)}><div className="knob" /></div>
        </div>
        {on ? (
          <div className="card">
            <div className="section-title" style={{ marginLeft: 0 }}>どんな繋がり？</div>
            <select value={purpose} onChange={e => setPurpose(e.target.value)}>
              {["恋愛","友達","趣味","人脈"].map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="section-title" style={{ marginLeft: 0 }}>希望をひとこと</div>
            <textarea placeholder="例：穏やかに話せる人がいいな" value={text} onChange={e => setText(e.target.value)} />
            <div style={{ height: 10 }} />
            <button className="btn primary" onClick={() => onToast('紹介待ちの設定を保存しました')}>保存する</button>
          </div>
        ) : <div className="empty">トグルをONにして、希望を設定しましょう。</div>}
        <div className="section-title">紹介待ちの友達（あなたがつなげる）</div>
        {cand.map(f => (
          <div key={f.id} className="card">
            <div className="row">
              <div className="avatar" style={{ background: f._c, width: 48, height: 48 }}>{initial(f.name)}</div>
              <div style={{ flex: 1 }}>
                <div className="name">{f.name} <span className="meta">{f.age}</span></div>
                <span className="tag want">{f.purpose}</span>
                <div className="meta" style={{ marginTop: 4 }}>"{f.wantText}"</div>
              </div>
            </div>
            <div style={{ height: 10 }} />
            <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => onIntroFrom(f)}>この人に誰かを紹介する</button>
          </div>
        ))}
      </div>
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
    const replies = ["なるほど！","いいね、それ気になる☺️","週末わりと空いてるよ〜","わかる、それ好き！"]
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
          <div><div className="name">{c.withName}</div><div className="meta">{c.byName}さんの紹介でつながりました</div></div>
        </div>
        <div className="chatbody" ref={bodyRef}>
          <div className="sysmsg">🤝 {c.intro}</div>
          {c.messages.map((m, i) => <div key={i} className={`bubble ${m.who}`}>{m.text}</div>)}
        </div>
        <div className="chatinput">
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="メッセージを入力…"
            onKeyDown={e => e.key === 'Enter' && sendMsg()} autoFocus />
          <button className="send" onClick={sendMsg}>➤</button>
        </div>
      </>
    )
  }

  const pending = notifications.filter(n => n.type === 'intro')
  const matched = notifications.filter(n => n.type === 'match')

  return (
    <>
      <div className="topbar"><h1>つな<span>がり</span></h1><div className="sub">紹介・マッチ・チャットをまとめて確認</div></div>
      <div className="wrap">

        {pending.length > 0 && (
          <>
            <div className="section-title" style={{ color: 'var(--accent)' }}>届いた紹介</div>
            {pending.map(n => (
              <div key={n.id} className="notif-card">
                <div className="notif-type">🤝 紹介が届きました</div>
                <div className="row" style={{ marginTop: 8 }}>
                  <div className="avatar" style={{ background: n.person._c, width: 44, height: 44 }}>{initial(n.person.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{n.person.name} <span className="meta">{n.person.age}歳</span></div>
                    <div style={{ marginTop: 3 }}>{n.person.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>
                  </div>
                </div>
                {n.note && <div className="pending-note" style={{ marginTop: 8 }}>💬 {n.note}</div>}
                <div className="pending-actions" style={{ marginTop: 10 }}>
                  <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => onPass(n.id)}>パス</button>
                  <button className="btn primary sm" style={{ flex: 1 }} onClick={() => onLike(n.id)}>いいね 💛</button>
                </div>
              </div>
            ))}
          </>
        )}

        {matched.length > 0 && (
          <>
            <div className="section-title" style={{ color: 'var(--green)' }}>マッチしました</div>
            {matched.map(n => (
              <div key={n.id} className="notif-card" style={{ borderColor: 'var(--green)', borderWidth: 1.5 }}>
                <div className="row">
                  <div className="avatar" style={{ background: n.person._c, width: 44, height: 44 }}>{initial(n.person.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">🎉 {n.person.name}さんとつながりました</div>
                    <div className="meta" style={{ marginTop: 3 }}>下のチャット欄から話しかけよう</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {chats.length > 0 && (
          <>
            <div className="section-title">チャット中</div>
            {chats.map(c => (
              <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setActiveChat(c)}>
                <div className="row">
                  <div className="avatar" style={{ background: c.color, width: 48, height: 48 }}>{initial(c.withName)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{c.withName}</div>
                    <div className="meta">{c.byName}さんの紹介</div>
                    <div className="meta" style={{ marginTop: 3, color: '#9aa6b8' }}>{c.messages[c.messages.length - 1].text}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {pending.length === 0 && matched.length === 0 && chats.length === 0 && (
          <div className="empty" style={{ marginTop: 40 }}>まだつながりはありません。<br />友達を紹介してみよう！</div>
        )}
      </div>
    </>
  )
}


// プロフィール画面
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
    onToast('プロフィールを保存しました')
  }

  return (
    <>
      <div className="topbar"><h1>プロ<span>フィール</span></h1><div className="sub">友達があなたを紹介するときに使います</div></div>
      <div className="wrap">
        <div className="card" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div className="avatar" style={{ background: '#E8743B', width: 72, height: 72, fontSize: 28, margin: '0 auto 12px' }}>
            {name.charAt(0) || '?'}
          </div>
          <div className="section-title" style={{ marginLeft: 0, textAlign: 'left' }}>名前</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="名前" />
          <div className="section-title" style={{ marginLeft: 0, textAlign: 'left' }}>年齢</div>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="年齢" />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginLeft: 0 }}>ひとこと自己紹介</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="例：週末はカフェ巡りしてます。穏やかに話せる人が好きです。" style={{ height: 72 }} />
        </div>

        <div className="card">
          <div className="section-title" style={{ marginLeft: 0 }}>タグ（最大5つ）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {ALL_TAGS.map(t => (
              <span key={t} className={`tag ${tags.includes(t) ? 'selected-tag' : ''}`}
                style={{ cursor: 'pointer', opacity: tags.includes(t) ? 1 : 0.5 }}
                onClick={() => toggleTag(t)}>#{t}</span>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 8 }}>選択中: {tags.length}/5</div>
        </div>

        <div className="card">
          <div className="toggle" style={{ margin: 0 }}>
            <div>
              <div className="name">紹介を受け付ける</div>
              <div className="meta">ONで友達があなたを紹介できます</div>
            </div>
            <div className={`switch ${wantOn ? 'on' : ''}`} onClick={() => setWantOn(v => !v)}><div className="knob" /></div>
          </div>
          {wantOn && (
            <>
              <div className="section-title" style={{ marginLeft: 0 }}>希望をひとこと</div>
              <textarea value={wantText} onChange={e => setWantText(e.target.value)} placeholder="例：穏やかに話せる人がいいな" />
            </>
          )}
        </div>

        <button className="btn primary" style={{ marginTop: 4, marginBottom: 16 }} onClick={save}>保存する</button>
      </div>
    </>
  )
}

// 招待コード入力画面（新規ユーザー）
function InviteEntryScreen({ onEnter }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [inviterName, setInviterName] = useState(null)

  const VALID_CODES = { 'YUKI-2024': 'ユウキ', 'MIO-2024': 'ミオ', 'HARU-2024': 'ハル' }

  const tryCode = () => {
    const upper = code.trim().toUpperCase()
    if (VALID_CODES[upper]) {
      setInviterName(VALID_CODES[upper])
      setError('')
    } else {
      setError('招待コードが正しくありません')
    }
  }

  if (inviterName) return (
    <div className="invite-welcome">
      <div className="invite-icon">🎉</div>
      <div className="invite-from">{inviterName}さんから招待が届いています</div>
      <div className="invite-msg">Tsunaguは友達の紹介でつながるアプリです。{inviterName}さんの友達として参加しましょう。</div>
      <button className="btn primary" style={{ marginTop: 24 }} onClick={() => onEnter(inviterName)}>参加する</button>
    </div>
  )

  return (
    <div className="invite-entry">
      <div className="invite-logo">Tsuna<span>gu</span></div>
      <div className="invite-catch">友達の紹介で、つながる。</div>
      <div className="invite-sub">参加するには友達からの招待コードが必要です</div>
      <div className="invite-form">
        <input
          placeholder="招待コードを入力（例: YUKI-2024）"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && tryCode()}
          style={{ textAlign: 'center', letterSpacing: '0.1em' }}
        />
        {error && <div className="invite-error">{error}</div>}
        <button className="btn primary" style={{ marginTop: 12 }} onClick={tryCode}>確認する</button>
      </div>
      <div className="invite-hint">招待コードは友達から直接受け取ってください</div>
    </div>
  )
}

// 招待コードを送る画面（既存ユーザー）
function InviteScreen({ onToast }) {
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  const myCode = 'ANATA-2024'

  const copy = () => {
    const msg = selected
      ? `${selected.name}さん、Tsunaguに招待するよ！\nコード: ${myCode}`
      : `招待コード: ${myCode}`
    navigator.clipboard?.writeText(msg).catch(() => {})
    setCopied(true)
    onToast('招待メッセージをコピーしました')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="topbar"><h1>友達を<span>招待</span></h1><div className="sub">招待した人があなたの友達になります</div></div>
      <div className="wrap">

        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="meta" style={{ marginBottom: 8 }}>あなたの招待コード</div>
          <div className="invite-code">{myCode}</div>
          <div className="meta" style={{ marginTop: 8 }}>このコードを友達に伝えてください</div>
        </div>

        <div className="section-title">誰に送る？（任意）</div>
        <div className="invite-friend-list">
          {friends.map(f => (
            <div key={f.id} className={`invite-friend ${selected?.id === f.id ? 'selected' : ''}`}
              onClick={() => setSelected(s => s?.id === f.id ? null : f)}>
              <div className="avatar" style={{ background: f._c, width: 40, height: 40 }}>{initial(f.name)}</div>
              <span className="name" style={{ fontSize: 13 }}>{f.name}</span>
              {selected?.id === f.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
            </div>
          ))}
        </div>

        <button className="btn primary" style={{ marginTop: 16 }} onClick={copy}>
          {selected ? `${selected.name}さんへの招待メッセージをコピー` : '招待コードをコピー'}
        </button>
        <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>
          招待した人が参加するとあなたの友達リストに追加されます
        </div>
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
  const [profile, setProfile] = useState({ name: 'あなた', age: '', bio: '', tags: [], wantOn: false, wantText: '' })
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const handleEnter = (name) => { setInvitedBy(name); setEntered(true) }
  const handleIntroFrom = (f) => { setIntroPickA(f); setTab('intro') }
  const handleConnect = (f) => showToast(`共通の友達に「${f.name}さんを紹介して」と依頼しました`)

  const handleSendIntro = (intro) => {
    setNotifications(n => [
      { id: Date.now(), type: 'intro', person: intro.personA, note: intro.note, read: false },
      ...n
    ])
    setTab('chats')
    showToast(`${intro.personA.name}さんと${intro.personB.name}さんに紹介を送りました`)
  }

  const handleLike = (notifId) => {
    const notif = notifications.find(n => n.id === notifId)
    const newChat = {
      id: Date.now(),
      withName: notif.person.name,
      color: notif.person._c,
      byName: '友達',
      intro: `友達の紹介で${notif.person.name}さんとつながりました${notif.note ? '「' + notif.note + '」' : ''}`,
      messages: [{ who: 'them', text: 'はじめまして！紹介してもらって…🙌' }]
    }
    setChats(c => [...c, newChat])
    setNotifications(n => [
      { id: Date.now(), type: 'match', person: notif.person, read: false },
      ...n.filter(x => x.id !== notifId)
    ])
    showToast(`${notif.person.name}さんとマッチしました！`)
  }

  const handlePass = (notifId) => {
    setNotifications(n => n.filter(x => x.id !== notifId))
    showToast('パスしました')
  }

  const unreadCount = notifications.filter(n => !n.read && n.type === 'intro').length

  const tabs = [
    ["home","🏠","ホーム"],
    ["intro","🤝","紹介する"],
    ["chats","💬","つながり"],
    ["profile","👤","プロフィール"],
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
        <div className="invited-by-bar">🤝 {invitedBy}さんの招待で参加中</div>
      )}
      <div className="screen">
        {tab === 'home'    && <HomeScreen onToast={showToast} onIntroFrom={handleIntroFrom} onConnect={handleConnect} pendingIntros={[]} onLike={() => {}} onPass={() => {}} />}
        {tab === 'intro'   && <IntroScreen initialPickA={introPickA} onToast={showToast} onSendIntro={handleSendIntro} />}
        {tab === 'chats'   && <ChatsScreen chats={chats} setChats={setChats} notifications={notifications} onLike={handleLike} onPass={handlePass} />}
        {tab === 'profile' && <ProfileScreen profile={profile} onSave={setProfile} onToast={showToast} />}
      </div>
      <div className="tabbar">
        {tabs.map(([k, ic, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`}
            onClick={() => { setTab(k); if (k !== 'intro') setIntroPickA(null) }}>
            <span className="ic">{ic}</span>
            <span>
              {l}
              {k === 'chats' && unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            </span>
          </button>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  )
}
