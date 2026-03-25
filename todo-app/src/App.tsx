import { useState, useEffect, useCallback } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
}

interface Project {
  id: string
  name: string
  color: string
  todos: Todo[]
}

const PRIO_LABEL: Record<Todo['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const PRIO_CLASS: Record<Todo['priority'], string> = {
  high: 'p-high',
  medium: 'p-medium',
  low: 'p-low',
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

const ESCOLORS = ['#58a6ff','#bc8cff','#3fb950','#d29600','#f85149','#ff7b72','#79c0ff','#56d364']

const DEMO: Project[] = [
  {
    id: uid(), name: 'AI 影像辨識專案', color: '#58a6ff',
    todos: [
      { id: uid(), text: '收集訓練資料集', done: true, priority: 'high' },
      { id: uid(), text: '設計模型架構', done: true, priority: 'high' },
      { id: uid(), text: '訓練模型並驗證準確率', done: false, priority: 'high' },
      { id: uid(), text: '撰寫技術文件', done: false, priority: 'medium' },
    ]
  },
  {
    id: uid(), name: '科內 AI 監測系統', color: '#bc8cff',
    todos: [
      { id: uid(), text: '規劃監測指標', done: true, priority: 'high' },
      { id: uid(), text: '建立 Dashboard', done: false, priority: 'medium' },
      { id: uid(), text: '設定警報閾值', done: false, priority: 'medium' },
      { id: uid(), text: '訓練同仁使用', done: false, priority: 'low' },
    ]
  },
  {
    id: uid(), name: '個人學習', color: '#3fb950',
    todos: [
      { id: uid(), text: '閱讀 RSNA 最新論文', done: false, priority: 'medium' },
      { id: uid(), text: '完成 Python 課程', done: false, priority: 'low' },
    ]
  }
]

type Filter = 'all' | 'active' | 'done' | 'high' | 'medium' | 'low'

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem('todo-projects')
    return stored ? JSON.parse(stored) : DEMO
  })
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')

  const save = useCallback((data: Project[]) => {
    localStorage.setItem('todo-projects', JSON.stringify(data))
  }, [])

  useEffect(() => {
    save(projects)
  }, [projects, save])

  const addProject = () => {
    if (!newProjectName.trim()) return
    const p: Project = {
      id: uid(),
      name: newProjectName.trim(),
      color: ESCOLORS[projects.length % ESCOLORS.length],
      todos: [],
    }
    setProjects(prev => [...prev, p])
    setNewProjectName('')
  }

  const deleteProject = (id: string) => {
    if (!confirm('確定刪除此專案及所有待辦事項？')) return
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const saveEdit = () => {
    if (!editing) return
    setProjects(prev => prev.map(p => p.id === editing.id ? editing : p))
    setEditing(null)
  }

  const addTodo = (projectId: string, text: string, priority: Todo['priority']) => {
    if (!text.trim()) return
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, todos: [...p.todos, { id: uid(), text: text.trim(), done: false, priority }] }
        : p
    ))
  }

  const toggleTodo = (projectId: string, todoId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, todos: p.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t) }
        : p
    ))
  }

  const deleteTodo = (projectId: string, todoId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, todos: p.todos.filter(t => t.id !== todoId) } : p
    ))
  }

  const filterTodos = (todos: Todo[]) => {
    return todos.filter(t => {
      if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'active') return !t.done
      if (filter === 'done') return t.done
      if (filter === 'high') return t.priority === 'high'
      if (filter === 'medium') return t.priority === 'medium'
      if (filter === 'low') return t.priority === 'low'
      return true
    })
  }

  const allTodos = projects.flatMap(p => p.todos)
  const totalDone = allTodos.filter(t => t.done).length

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, background: 'linear-gradient(135deg, #58a6ff, #bc8cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📋 專案待辦事項
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
            <input
              type="text"
              placeholder="搜尋待辦..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#e6edf3', fontSize: '13px', outline: 'none' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#8b949e' }}>
            <span>專案 <b style={{ color: '#58a6ff' }}>{projects.length}</b></span>
            <span>待辦 <b style={{ color: '#58a6ff' }}>{allTodos.length}</b></span>
            <span>完成 <b style={{ color: '#58a6ff' }}>{totalDone}</b></span>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {([
          ['all','全部'],['active','未完成'],['done','已完成'],
          ['high','🔴 高優先'],['medium','🟡 中優先'],['low','🟢 低優先']
        ] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: `1px solid ${filter === f ? '#58a6ff' : '#30363d'}`,
              background: filter === f ? '#58a6ff22' : 'transparent',
              color: filter === f ? '#58a6ff' : '#8b949e',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >{label}</button>
        ))}
      </div>

      {/* Add project */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="新增專案名稱..."
          value={newProjectName}
          onChange={e => setNewProjectName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addProject()}
          style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 14px', color: '#e6edf3', fontSize: '14px', outline: 'none' }}
        />
        <button onClick={addProject} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#238636', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          ＋ 新增專案
        </button>
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#484f58' }}>
          <div style={{ fontSize: '48px' }}>📂</div>
          <div style={{ marginTop: '12px' }}>還沒有專案，新增一個開始吧！</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(p => {
            const filtered = filterTodos(p.todos)
            const total = p.todos.length
            const done = p.todos.filter(t => t.done).length
            const pct = total ? Math.round(done / total * 100) : 0

            return (
              <div key={p.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #21262d', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8b949e', flexShrink: 0 }}>{done}/{total}</span>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => setEditing({ ...p })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px', color: '#8b949e' }}>✏️</button>
                    <button onClick={() => deleteProject(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px', color: '#8b949e' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ height: '3px', background: '#21262d' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 12px' }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#484f58', fontSize: '13px' }}>
                      {search ? '沒有符合的待辦' : '還沒有待辦事項'}
                    </div>
                  ) : filtered.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', borderRadius: '6px', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <input type="checkbox" checked={t.done} onChange={() => toggleTodo(p.id, t.id)} style={{ width: '16px', height: '16px', accentColor: '#238636', cursor: 'pointer', flexShrink: 0 }} />
                      <span onClick={() => toggleTodo(p.id, t.id)} style={{ flex: 1, fontSize: '14px', lineHeight: 1.4, cursor: 'pointer', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#484f58' : '#e6edf3', wordBreak: 'break-word' }}>
                        {t.text}
                      </span>
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '10px', flexShrink: 0, fontWeight: 500, background: `${PRIO_CLASS[t.priority]}22`, color: PRIO_LABEL[t.priority] === '高' ? '#f85149' : PRIO_LABEL[t.priority] === '中' ? '#d29600' : '#3fb950', border: `1px solid ${PRIO_CLASS[t.priority]}44` }}>
                        {PRIO_LABEL[t.priority]}
                      </span>
                      <button onClick={() => deleteTodo(p.id, t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#30363d', fontSize: '14px', padding: '2px 4px', borderRadius: '4px', flexShrink: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f85149')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#30363d')}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <TodoInput onAdd={(text, prio) => addTodo(p.id, text, prio)} />
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, background: '#00000088', zIndex: 100, alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', width: '380px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>✏️ 編輯專案</h3>
            <label style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px', display: 'block' }}>專案名稱</label>
            <input
              type="text"
              value={editing.name}
              onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 12px', color: '#e6edf3', fontSize: '14px', outline: 'none', marginBottom: '14px' }}
            />
            <label style={{ fontSize: '13px', color: '#8b949e', marginBottom: '8px', display: 'block' }}>顏色</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              {ESCOLORS.map(c => (
                <div key={c} onClick={() => setEditing(prev => prev ? { ...prev, color: c } : null)}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', border: `2px solid ${editing.color === c ? '#fff' : 'transparent'}`, transition: 'border-color 0.2s, transform 0.2s', transform: editing.color === c ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setEditing(null)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #30363d', background: '#21262d', color: '#8b949e', fontSize: '14px', cursor: 'pointer' }}>取消</button>
              <button onClick={saveEdit} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#238636', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TodoInput({ onAdd }: { onAdd: (text: string, prio: Todo['priority']) => void }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Todo['priority']>('medium')

  return (
    <div style={{ display: 'flex', gap: '6px', padding: '10px 12px', borderTop: '1px solid #21262d', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="新增待辦..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onAdd(text, priority); setText('') }
        }}
        style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '7px 10px', color: '#e6edf3', fontSize: '13px', outline: 'none' }}
      />
      <select value={priority} onChange={e => setPriority(e.target.value as Todo['priority'])}
        style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '7px 6px', color: '#8b949e', fontSize: '12px', outline: 'none' }}>
        <option value="medium">中</option>
        <option value="high">高</option>
        <option value="low">低</option>
      </select>
      <button onClick={() => { if (text.trim()) { onAdd(text, priority); setText('') } }}
        style={{ padding: '7px 12px', background: '#238636', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>＋</button>
    </div>
  )
}
