'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function SubmitPromptPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    const user_id = userData?.user?.id

    if (!user_id) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('prompts').insert([
      {
        title,
        description,
        image_url: imageUrl,
        user_id,
      },
    ])

    if (error) {
      setError(error.message)
    } else {
      router.push('/profile')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">프롬프트 업로드</h1>

      <Input
        placeholder="프롬프트 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      <Textarea
        placeholder="프롬프트 설명"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
      />

      <Input
        placeholder="미리보기 이미지 URL (선택)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="mb-4"
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? '업로드 중...' : '프롬프트 업로드'}
      </Button>
    </div>
  )
}