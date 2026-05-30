import { useState, useEffect, useRef } from 'react'
import { col, initial } from './data'
import { supabase } from './supabase'
import Auth from './Auth'
import './index.css'

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null
}

// プロフィールに色を付ける
function colorize(profiles) {
  return profiles.map((p, i) => ({ ...p, _c: col(i) }))
}

// 相手のプロフィールを取得
function getOther(intro, userId) {
  return intro.person_a_id === userId ? intro.person_b : intro.person_a
}

// 自分がいいねしたか
function didILike(intro, userId) {
  return intro.person_a_id === userId ? intro.a_liked : intro.b_liked
}

/* ---- 友達カード ---- */
function FriendCard({ f, onIntroFrom }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fcard" onClick={() => setOpen(v => !v)}>
      <div className="fcard-top">
        <div className="avatar" style={{ background: f._c, width: 52, height: 52, fontSize: 20 }}>{initial(f.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="name">{f.name}</span>
            {f.age && <span className="meta">{f.age}歳</span>}
            {f.want_on && <span className="pill">紹介OK</span>}
          </div>
          <div style={{ marginTop: 5 }}>
            {(f.tags || []).map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        </div>
        <span className="fcard-chevron">{open ? '∧' : '∨'}</span>
      </div>
      {open && (
        <div className="fcard-body" onClick={e => e.stopPropagation()}>
          {f.want_on && f.want_text && <div className="fcard-want">"{f.want_text}"</div>}
          {f.bio && <div className="fcard-latest">{f.bio}</div>}
          <button className="btn primary sm" style={{ marginTop: 12 }} onClick={() => onIntroFrom(f)}>
            誰かに紹介する
          </button>
        </div>
      )}
    </div>
  )
}

/* ---- ホーム ---- */
function HomeScreen({ profiles, onIntroFrom }) {
  if (profiles.length === 0) return (
    <>
      <div className="topbar"><h1>Tsuna<span>gu</span></h1><div className="sub">「この2人、合いそう」をつなぎに変える</div></div>
      <div className="empty" style={{ marginTop: 60 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
        <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>まだ友達がいません</div>
        <div>招待タブから友達を招待しよう</div>
      </div>
    </>
  )
  return (
    <>
      <div className="topbar"><h1>Tsuna<span>gu</span></h1><div className="sub">「この2人、合いそう」をつなぎに変える</div></div>
      <div className="home-section-label">友達リスト</div>
      <div className="wrap" style={{ paddingTop: 0 }}>
        {profiles.map(f => <FriendCard key={f.id} f={f} onIntroFrom={onIntroFrom} />)}
      </div>
    </>
  )
}

/* ---- 紹介する ---- */
function IntroScreen({ profiles, userId, onToast, onSendIntro }) {
  const [pickA, setPickA] = useState(null)
  const [pickB, setPickB] = useState(null)
  const [note, setNote] = useState('')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(false)

  const openPicker = (which) => {
    const taken = which === 'A' ? pickB?.id : pickA?.id
    setModal({ which, list: profiles.filter(f => f.id !== taken) })
  }

  const send = async () => {
    if (!pickA || !pickB) { onToast('2人選んでね'); return }
    setLoading(true)
    const { error } = await supabase.from('introductions').insert({
      introducer_id: userId,
      person_a_id: pickA.id,
      person_b_id: pickB.id,
      note: note.trim() || null,
      a_liked: false,
      b_liked: false,
    })
    setLoading(false)
    if (error) { onToast('エラーが発生しました'); return }
    onToast(`${pickA.name}さんと${pickB.name}さんに紹介しました`)
    onSendIntro()
    setPickA(null); setPickB(null); setNote('')
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
      <div className="topbar"><h1>紹介<span>する</span></h1><div className="sub">「この2人、合いそう」と思ったらつなごう</div></div>
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
          <button className="btn primary" onClick={send} disabled={loading}>{loading ? '送信中…' : '紹介する'}</button>
          <div className="meta" style={{ textAlign: 'center', marginTop: 10 }}>2人がそれぞれOKしたらチャットが始まります</div>
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
                  <div><div className="name">{f.name}</div><div className="meta">{(f.tags || []).join(' · ')}</div></div>
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

/* ---- つながり（通知＋チャット）---- */
function ChatsScreen({ introductions, userId, onLike, onPass, profiles }) {
  const [activeIntro, setActiveIntro] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [loadingMsg, setLoadingMsg] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  const openChat = async (intro) => {
    setActiveIntro(intro)
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(name)')
      .eq('intro_id', intro.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const sendMsg = async () => {
    if (!msg.trim() || loadingMsg) return
    const text = msg.trim()
    setMsg('')
    setLoadingMsg(true)
    const { data } = await supabase.from('messages').insert({
      intro_id: activeIntro.id,
      sender_id: userId,
      content: text,
    }).select('*, sender:sender_id(name)').single()
    if (data) setMessages(m => [...m, data])
    setLoadingMsg(false)
  }

  if (activeIntro) {
    const other = getOther(activeIntro, userId)
    const otherProfile = profiles.find(p => p.id === other?.id) || other
    const color = otherProfile?._c || '#ccc'
    return (
      <>
        <div className="chathead">
          <button className="back" onClick={() => setActiveIntro(null)}>‹</button>
          <div className="avatar" style={{ background: color, width: 38, height: 38, fontSize: 15 }}>{initial(other?.name)}</div>
          <div>
            <div className="name">{other?.name}</div>
            <div className="meta">{activeIntro.introducer?.name}さんの紹介</div>
          </div>
        </div>
        <div className="chatbody" ref={bodyRef}>
          <div className="sysmsg">{activeIntro.introducer?.name}さんの紹介でつながりました{activeIntro.note ? `「${activeIntro.note}」` : ''}</div>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.sender_id === userId ? 'me' : 'them'}`}>{m.content}</div>
          ))}
        </div>
        <div className="chatinput">
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="メッセージ…"
            onKeyDown={e => e.key === 'Enter' && sendMsg()} autoFocus />
          <button className="send" onClick={sendMsg}>↑</button>
        </div>
      </>
    )
  }

  const pending = introductions.filter(i => !didILike(i, userId) && !i.a_liked && !i.b_liked || !didILike(i, userId) && (i.a_liked || i.b_liked))
    .filter(i => !didILike(i, userId))
  const matched = introductions.filter(i => i.a_liked && i.b_liked)

  return (
    <>
      <div className="topbar"><h1>つな<span>がり</span></h1><div className="sub">紹介・マッチ・やりとりをここで</div></div>
      <div className="wrap">
        {pending.length > 0 && (
          <>
            <div className="section-title" style={{ color: 'var(--accent)' }}>紹介が届いています</div>
            {pending.map(intro => {
              const other = getOther(intro, userId)
              const otherProfile = profiles.find(p => p.id === other?.id) || other
              return (
                <div key={intro.id} className="notif-card">
                  <div className="notif-type">{intro.introducer?.name}さんからの紹介</div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <div className="avatar" style={{ background: otherProfile?._c || '#ccc', width: 48, height: 48 }}>{initial(other?.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div className="name">{other?.name} {other?.age && <span className="meta">{other.age}歳</span>}</div>
                      <div style={{ marginTop: 4 }}>{(other?.tags || []).map(t => <span key={t} className="tag">#{t}</span>)}</div>
                    </div>
                  </div>
                  {intro.note && <div className="pending-note" style={{ marginTop: 10 }}>{intro.note}</div>}
                  <div className="pending-actions" style={{ marginTop: 12 }}>
                    <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => onPass(intro)}>今回はパス</button>
                    <button className="btn primary sm" style={{ flex: 1 }} onClick={() => onLike(intro)}>会ってみたい</button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {matched.length > 0 && (
          <>
            <div className="section-title">やりとり中</div>
            {matched.map(intro => {
              const other = getOther(intro, userId)
              const otherProfile = profiles.find(p => p.id === other?.id) || other
              return (
                <div key={intro.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openChat(intro)}>
                  <div className="row">
                    <div className="avatar" style={{ background: otherProfile?._c || '#ccc', width: 48, height: 48 }}>{initial(other?.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div className="name">{other?.name}</div>
                      <div className="meta">{intro.introducer?.name}さんの紹介</div>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 18 }}>›</div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {pending.length === 0 && matched.length === 0 && (
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

/* ---- プロフィール ---- */
const ALL_TAGS = ['カフェ','写真','映画','音楽','旅行','料理','登山','読書','ゲーム','ランニング','スポーツ','アート','ファッション','スタートアップ']

function ProfileScreen({ profile, userId, onSave, onToast }) {
  const [name, setName] = useState(profile?.name || '')
  const [age, setAge] = useState(profile?.age || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [tags, setTags] = useState(profile?.tags || [])
  const [wantOn, setWantOn] = useState(profile?.want_on || false)
  const [wantText, setWantText] = useState(profile?.want_text || '')
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const toggleTag = (t) => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : ts.length < 5 ? [...ts, t] : ts)

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { onToast('アップロードに失敗しました'); setUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = data.publicUrl + '?t=' + Date.now()
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
    setAvatarUrl(url)
    setUploading(false)
    onToast('アイコンを変更しました')
  }

  const save = async () => {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      bio: bio.trim() || null,
      tags,
      want_on: wantOn,
      want_text: wantText.trim() || null,
    }).eq('id', userId)
    setLoading(false)
    if (error) { onToast('保存に失敗しました'); return }
    onSave({ name, age, bio, tags, want_on: wantOn, want_text: wantText, avatar_url: avatarUrl })
    onToast('保存しました')
  }

  return (
    <>
      <div className="topbar"><h1>プロ<span>フィール</span></h1><div className="sub">友達があなたを紹介するときに表示されます</div></div>
      <div className="wrap">
        <div className="card" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div style={{ position: 'relative', width: 80, margin: '0 auto 16px' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              : <div className="avatar" style={{ background: '#E8743B', width: 80, height: 80, fontSize: 30, margin: '0 auto' }}>{initial(name || '?')}</div>
            }
            <button onClick={() => fileRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', border: '2px solid #fff', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? '…' : '✎'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
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
        <button className="btn primary" style={{ marginTop: 4, marginBottom: 20 }} onClick={save} disabled={loading}>
          {loading ? '保存中…' : '保存する'}
        </button>
      </div>
    </>
  )
}

/* ---- 招待 ---- */
function InviteScreen({ profile, profiles, onToast }) {
  const [selected, setSelected] = useState(null)
  const myCode = profile?.invite_code || '...'

  const copy = () => {
    const msg = selected
      ? `${selected.name}、Tsunaguっていうアプリ使ってみて！\n招待コード: ${myCode}\nhttps://tsunagu-three.vercel.app`
      : `招待コード: ${myCode}\nhttps://tsunagu-three.vercel.app`
    navigator.clipboard?.writeText(msg).catch(() => {})
    onToast('コピーしました')
  }

  return (
    <>
      <div className="topbar"><h1>友達を<span>招待</span></h1><div className="sub">招待した人があなたの友達になります</div></div>
      <div className="wrap">
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="meta" style={{ marginBottom: 10 }}>あなたの招待コード</div>
          <div className="invite-code">{myCode}</div>
          <div className="meta" style={{ marginTop: 10 }}>友達に直接伝えてください</div>
        </div>
        <button className="btn primary" style={{ marginTop: 8 }} onClick={copy}>招待コードをコピー</button>
      </div>
    </>
  )
}

/* ---- App ---- */
export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState('')
  const [introPickA, setIntroPickA] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [introductions, setIntroductions] = useState([])
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  // 認証
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadAll(session.user.id) }
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadAll(session.user.id) }
      else { setUser(null); setProfile(null); setProfiles([]); setIntroductions([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadAll = async (userId) => {
    // プロフィール
    const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (p) setProfile(p)

    // 他のユーザー
    const { data: ps } = await supabase.from('profiles').select('*').neq('id', userId)
    if (ps) setProfiles(colorize(ps))

    // 紹介
    await loadIntroductions(userId)
  }

  const loadIntroductions = async (userId) => {
    const uid = userId || user?.id
    if (!uid) return
    const { data } = await supabase
      .from('introductions')
      .select('*, person_a:person_a_id(id,name,age,tags,bio,want_on,want_text), person_b:person_b_id(id,name,age,tags,bio,want_on,want_text), introducer:introducer_id(name)')
      .or(`person_a_id.eq.${uid},person_b_id.eq.${uid}`)
      .order('created_at', { ascending: false })
    if (data) setIntroductions(data)
  }

  const handleAuth = (authUser) => { setUser(authUser); loadAll(authUser.id) }

  const handleLike = async (intro) => {
    const field = intro.person_a_id === user.id ? { a_liked: true } : { b_liked: true }
    await supabase.from('introductions').update(field).eq('id', intro.id)
    await loadIntroductions()
    const other = getOther(intro, user.id)
    showToast(`${other?.name}さんに「会ってみたい」を送りました`)
  }

  const handlePass = async (intro) => {
    const field = intro.person_a_id === user.id ? { a_liked: false } : { b_liked: false }
    await supabase.from('introductions').update(field).eq('id', intro.id)
    setIntroductions(is => is.filter(i => i.id !== intro.id))
    showToast('パスしました')
  }

  const unreadCount = introductions.filter(i => !didILike(i, user?.id || '')).length

  const tabs = [
    ["home",    "👥", "友達"],
    ["intro",   "🤝", "紹介"],
    ["chats",   "💬", "つながり"],
    ["profile", "🙂", "マイページ"],
  ]

  if (authLoading) return (
    <div className="phone">
      <div className="statusbar">9:41　　Tsunagu　　●●●</div>
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>読み込み中…</div>
      </div>
    </div>
  )

  if (!user) return (
    <div className="phone">
      <div className="statusbar">9:41　　Tsunagu　　●●●</div>
      <div className="screen"><Auth onAuth={handleAuth} /></div>
    </div>
  )

  return (
    <div className="phone">
      <div className="statusbar">9:41　　Tsunagu　　●●●</div>
      <div className="screen">
        {tab === 'home'    && <HomeScreen profiles={profiles} onIntroFrom={f => { setIntroPickA(f); setTab('intro') }} />}
        {tab === 'intro'   && <IntroScreen profiles={profiles} userId={user.id} onToast={showToast} onSendIntro={() => { loadIntroductions(); setTab('chats') }} />}
        {tab === 'chats'   && <ChatsScreen introductions={introductions} userId={user.id} profiles={profiles} onLike={handleLike} onPass={handlePass} />}
        {tab === 'profile' && <ProfileScreen profile={profile} userId={user.id} onSave={setProfile} onToast={showToast} />}
      </div>
      <div className="tabbar">
        {tabs.map(([k, ic, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`}
            onClick={() => { setTab(k); if (k !== 'intro') setIntroPickA(null) }}>
            <span className="tab-ic">{ic}</span>
            {k === 'chats' && unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
        ))}
      </div>
      <Toast msg={toast} />
    </div>
  )
}
