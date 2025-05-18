'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  user_id: string
  created_at: string
  views: number
}

export default function FeedPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')

  useEffect(() => {
    const fetchPrompts = async () => {
      const { data } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setPrompts(data)
      }
    }

    fetchPrompts()
  }, [])

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === '전체' || prompt.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">🚀 최신 프롬프트 피드</h1>

      {/* 🔍 검색 + 카테고리 필터 */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="프롬프트 검색 (예: GPT-4, 마케팅, 이미지)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="전체">전체</option>
          <option value="텍스트 생성">텍스트 생성</option>
          <option value="이미지 생성">이미지 생성</option>
          <option value="코드 생성">코드 생성</option>
          <option value="분석 및 요약">분석 및 요약</option>
          <option value="마케팅">마케팅</option>
          <option value="교육">교육</option>
          <option value="감성">감성</option>
          <option value="실험용">실험용</option>
        </select>
      </div>

      {/* 📦 프롬프트 카드 목록 */}
      <div className="space-y-4">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="p-4">
            <Link href={`/prompts/${prompt.id}`} className="text-xl font-semibold hover:underline">
              {prompt.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {prompt.description.length > 100
                ? `${prompt.description.slice(0, 100)}...`
                : prompt.description}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              카테고리: {prompt.category} • 조회수: {prompt.views}
            </div>
          </Card>
        ))}

        {filteredPrompts.length === 0 && (
          <p className="text-sm text-gray-500">조건에 맞는 프롬프트가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
