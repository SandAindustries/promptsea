'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }

    getUser()
  }, [router])

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !userId) return

    const { error } = await supabase.from('posts').insert([
      {
        title,
        content,
        user_id: userId,
      },
    ])

    if (!error) {
      router.push('/community')
    } else {
      alert('게시글 저장에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>

      <Input
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      <Textarea
        placeholder="본문 내용을 작성하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="mb-4"
      />

      <Button onClick={handleSubmit}>등록하기</Button>
    </div>
  )
}