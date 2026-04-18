'use client'
import { useState } from 'react'

type Task = {
  id: string
  text: string
  completed: boolean
  categoryId: string
  assignee: 'me' | 'partner' | 'both'
}

type Category = {
  id: string
  name: string
}

const initialCategories: Category[] = [
  { id: 'shopping', name: '買い物' },
  { id: 'payment', name: '支払い' },
]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: crypto.randomUUID(),
      text: '牛乳',
      completed: false,
      categoryId: 'shopping',
      assignee: 'both',
    },
    {
      id: crypto.randomUUID(),
      text: '卵',
      completed: false,
      categoryId: 'shopping',
      assignee: 'me',
    },
    {
      id: crypto.randomUUID(),
      text: '家賃',
      completed: false,
      categoryId: 'payment',
      assignee: 'partner',
    },
  ])

  const [input, setInput] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [assignee, setAssignee] = useState<'me' | 'partner' | 'both'>('both')

  const addTask = () => {
    if (!input || !activeCategory) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: input,
      completed: false,
      categoryId: activeCategory,
      assignee,
    }

    setTasks([...tasks, newTask])
    setInput('')
    setActiveCategory(null)
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const getAssigneeLabel = (a: Task['assignee']) => {
    if (a === 'me') return '🟢 自分'
    if (a === 'partner') return '🔵 相手'
    return '⚪️ どっちでも'
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-8">
      {initialCategories.map(category => {
        const categoryTasks = tasks.filter(t => t.categoryId === category.id)

        return (
          <div key={category.id}>
            <h2 className="text-xl font-bold mb-2">[{category.name}]</h2>

            <ul className="space-y-1 mb-2">
              {categoryTasks.map(task => (
                <li key={task.id} className="flex justify-between">
                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`cursor-pointer ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    ・{task.text}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getAssigneeLabel(task.assignee)}
                  </span>
                </li>
              ))}
            </ul>

            {/* 追加ボタン */}
            <button
              onClick={() => setActiveCategory(category.id)}
              className="text-sm text-blue-500"
            >
              +追加
            </button>

            {/* 入力欄（そのカテゴリだけ出る） */}
            {activeCategory === category.id && (
              <div className="mt-2 space-y-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="タスク入力"
                  className="border p-2 w-full rounded"
                />

                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value as any)}
                  className="border p-2 w-full rounded"
                >
                  <option value="both">どっちでも</option>
                  <option value="me">自分</option>
                  <option value="partner">相手</option>
                </select>

                <button
                  onClick={addTask}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  追加
                </button>
              </div>
            )}
          </div>
        )
      })}
    </main>
  )
}
