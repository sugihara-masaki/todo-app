'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

type Task = {
  id: string
  text: string
  completed: boolean
  category_id: string
  assignee: 'me' | 'partner' | 'both'
  created_at: string
}

type Category = {
  id: string
  name: string
}

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  return data
}

const fetchTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('completed', false)

  if (error) {
    console.error(error)
    return
  }

  return data
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [input, setInput] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [assignee, setAssignee] = useState<'me' | 'partner' | 'both'>('both')

  useEffect(() => {
    const load = async () => {
      const categoriesData = await fetchCategories()
      const tasksData = await fetchTasks()

      if (categoriesData) setCategories(categoriesData)
      if (tasksData) setTasks(tasksData)
    }

    load()
  }, [])

  const addTask = async () => {
    if (!input || !activeCategory) return

    const { error } = await supabase.from('tasks').insert([
      {
        text: input,
        category_id: activeCategory,
        assignee,
      },
    ])

    if (error) {
      console.error(error)
      return
    }

    // 再取得
    const tasksData = await fetchTasks()
    if (tasksData) setTasks(tasksData)

    setInput('')
    setActiveCategory(null)
  }

  const toggleTask = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !current })
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !current } : t
      )
    )
  }

  const getAssigneeLabel = (a: Task['assignee']) => {
    if (a === 'me') return '🟢 自分'
    if (a === 'partner') return '🔵 相手'
    return '⚪️ どっちでも'
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-8">
      {categories.map(category => {
        const categoryTasks = tasks
          .filter(t => t.category_id === category.id)

        const sortedTasks = [...categoryTasks].sort((a, b) => {
          if (a.completed !== b.completed) {
            return Number(a.completed) - Number(b.completed)
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        return (
          <div key={category.id}>
            <h2 className="text-xl font-bold mb-2">[{category.name}]</h2>

            <ul className="space-y-1 mb-2">
              {sortedTasks.map(task => (
                <li key={task.id} className="flex justify-between">
                  <span
                    onClick={() => toggleTask(task.id, task.completed)}
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
