'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Prompt = {
  id: string
  title: string
  description: string
  image_url: string | null
  likes: number
}

export default function UserProfilePage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [likedPromptIds, setLikedPromptIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || null)
      setUserId(user.id)

      const { data: promptData } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: likeData } = await supabase
        .from('likes')
        .select('prompt_id')
        .eq('user_id', user.id)

      if (promptData) setPrompts(promptData)
      if (likeData) setLikedPromptIds(likeData.map((like) => like.prompt_id))

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleToggleLike = async (promptId: string, alreadyLiked: boolean) => {
    if (!userId) return

    if (alreadyLiked) {
      // 좋아요 취소
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('prompt_id', promptId)

      await supabase.rpc('decrement_likes', { row_id: promptId })

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, likes: p.likes - 1 } : p
        )
      )
      setLikedPromptIds((prev) => prev.filter((id) => id !== promptId))
    } else {
      // 좋아요 등록
      await supabase.from('likes').insert([{ user_id: userId, prompt_id: promptId }])
      await supabase.rpc('increment_likes', { row_id: promptId })

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, likes: p.likes + 1 } : p
        )
      )
      setLikedPromptIds((prev) => [...prev, promptId])
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4 border-r">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
          <h2 className="text-xl font-semibold">내 프로필</h2>
          <p className="text-sm text-gray-600 text-center">
            {userEmail || '로그인 정보 없음'}
          </p>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Tools & Visualizations</h3>
          <div className="w-full h-32 bg-gray-200 rounded" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList>
            <TabsTrigger value="prompts">나의 프롬포트</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts">
            {loading ? (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            ) : prompts.length === 0 ? (
              <p className="text-sm text-gray-400">등록한 프롬프트가 없습니다.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {prompts.map((prompt) => {
                  const alreadyLiked = likedPromptIds.includes(prompt.id)
                  return (
                    <Card key={prompt.id} className="p-4 flex space-x-4 items-start">
                      <div className="w-24 h-24 bg-gray-300 rounded" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{prompt.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                        <Button
                          variant={alreadyLiked ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleToggleLike(prompt.id, alreadyLiked)}
                        >
                          ★ {prompt.likes}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <p className="text-sm text-gray-400">아직 댓글 기능은 구현되지 않았습니다.</p>
          </TabsContent>
        </Tabs>
      </main>

      {/* Community */}
      <aside className="w-1/4 bg-gray-50 p-4 border-l">
        <h3 className="text-lg font-semibold mb-4">Community</h3>
        <Input placeholder="Search posts" className="mb-4" />
        <div className="space-y-3 text-sm text-gray-600">
          <p># 프롬프트 작성 꿀팁</p>
          <p># GPT 추천 프롬프트</p>
          <p># 가이드</p>
        </div>
      </aside>
    </div>
  )
}