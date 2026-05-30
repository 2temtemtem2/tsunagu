import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('signup') // login | signup | invite
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviter, setInviter] = useState(null)

  // 招待コードを確認
  const checkInviteCode = async () => {
    if (!inviteCode.trim()) { setError('招待コードを入力してください'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single()
    setLoading(false)
    if (error || !data) { setError('招待コードが正しくありません'); return }
    setInviter(data)
    setMode('signup')
  }

  // サインアップ
  const handleSignup = async () => {
    if (!name.trim()) { setError('名前を入力してください'); return }
    if (!email.trim()) { setError('メールアドレスを入力してください'); return }
    if (password.length < 6) { setError('パスワードは6文字以上で入力してください'); return }
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // プロフィール作成
    const myCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name: name.trim(),
      invite_code: myCode,
      invited_by: inviter?.id || null,
    })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    setLoading(false)
    onAuth(authData.user)
  }

  // ログイン
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('メールとパスワードを入力してください'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('メールまたはパスワードが違います'); return }
    onAuth(data.user)
  }

  return (
    <div className="auth-screen">
      <div className="invite-logo">Tsuna<span>gu</span></div>
      <div className="invite-catch">友達の紹介で、<br />出会う。</div>

      {mode === 'invite' && (
        <div className="auth-form">
          <div className="auth-label">招待コードを入力</div>
          <input placeholder="例: ABC123" value={inviteCode}
            onChange={e => { setInviteCode(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && checkInviteCode()}
            style={{ textAlign: 'center', letterSpacing: '0.1em' }} />
          {error && <div className="invite-error">{error}</div>}
          <button className="btn primary" style={{ marginTop: 12 }} onClick={checkInviteCode} disabled={loading}>
            {loading ? '確認中…' : '確認する'}
          </button>
          <button className="auth-switch" onClick={() => { setMode('login'); setError('') }}>
            すでにアカウントがある方はこちら
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <div className="auth-form">
          {inviter && <div className="invited-by-bar" style={{ borderRadius: 12, marginBottom: 12 }}>🎉 {inviter.name}さんからの招待</div>}
          <div className="auth-label">名前</div>
          <input placeholder="あなたの名前" value={name} onChange={e => { setName(e.target.value); setError('') }} />
          <div className="auth-label">メールアドレス</div>
          <input type="email" placeholder="example@mail.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
          <div className="auth-label">パスワード（6文字以上）</div>
          <input type="password" placeholder="パスワード" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
          {error && <div className="invite-error">{error}</div>}
          <button className="btn primary" style={{ marginTop: 12 }} onClick={handleSignup} disabled={loading}>
            {loading ? '登録中…' : '参加する'}
          </button>
        </div>
      )}

      {mode === 'login' && (
        <div className="auth-form">
          <div className="auth-label">メールアドレス</div>
          <input type="email" placeholder="example@mail.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
          <div className="auth-label">パスワード</div>
          <input type="password" placeholder="パスワード" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          {error && <div className="invite-error">{error}</div>}
          <button className="btn primary" style={{ marginTop: 12 }} onClick={handleLogin} disabled={loading}>
            {loading ? 'ログイン中…' : 'ログイン'}
          </button>
          <button className="auth-switch" onClick={() => { setMode('invite'); setError('') }}>
            招待コードをお持ちの方はこちら
          </button>
        </div>
      )}
    </div>
  )
}
