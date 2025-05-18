'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Post {
  id: string
  title: string
  content: string
  category: string
  user_id: string
  created_at: string
}

const categories = ['전체', '질문', '잡담', '업데이트']

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('질문')
  const [filter, setFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (postsData) setPosts(postsData)

      const { data: likeData } = await supabase.from('likes').select('*')
      const likeCounts: Record<string, number> = {}
      const likedSet: Set<string> = new Set()

      likeData?.forEach((like) => {
        likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1
        if (like.user_id === user?.id) {
          likedSet.add(like.post_id)
        }
      })

      setLikes(likeCounts)
      setLikedPosts(likedSet)

      const { data: bookmarkData } = await supabase.from('bookmarks').select('*')
      const bookmarkSet: Set<string> = new Set()
      bookmarkData?.forEach((b) => {
        if (b.user_id === user?.id) {
          bookmarkSet.add(b.post_id)
        }
      })
      setBookmarkedPosts(bookmarkSet)
    }

    fetchData()
  }, [])

  const handleLike = async (postId: string) => {
    if (!userId) return
    const alreadyLiked = likedPosts.has(postId)

    if (alreadyLiked) {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: userId })
      setLikes((prev) => ({ ...prev, [postId]: (prev[postId] || 1) - 1 }))
      setLikedPosts((prev) => {
        const updated = new Set(prev)
        updated.delete(postId)
        return updated
      })
    } else {
      await supabase.from('likes').insert([{ post_id: postId, user_id: userId }])
      setLikes((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      setLikedPosts((prev) => new Set(prev).add(postId))
    }
  }

  const handleBookmark = async (postId: string) => {
    if (!userId) return
    const alreadyBookmarked = bookmarkedPosts.has(postId)

    if (alreadyBookmarked) {
      await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: userId })
      setBookmarkedPosts((prev) => {
        const updated = new Set(prev)
        updated.delete(postId)
        return updated
      })
    } else {
      await supabase.from('bookmarks').insert([{ post_id: postId, user_id: userId }])
      setBookmarkedPosts((prev) => new Set(prev).add(postId))
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !userId) return

    const { data, error } = await supabase.from('posts').insert([
      {
        title,
        content,
        category,
        user_id: userId,
      },
    ]).select()

    if (!error && data && data[0]) {
      setPosts((prev) => [data[0], ...prev])
      setTitle('')
      setContent('')
      setCategory('질문')
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchCategory = filter === '전체' || post.category === filter
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">🧭 PromptSea 커뮤니티</h1>

      {/* 🔍 검색창 + 카테고리 필터 */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="검색어 입력"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* ✍️ 글쓰기 폼 */}
      <div className="mb-6 space-y-2">
        <Input
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="본문을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {categories.slice(1).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Button onClick={handleSubmit}>등록하기</Button>
      </div>

      {/* 📰 게시글 목록 */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-4">
            <Link href={`/community/${post.id}`} className="text-lg font-semibold hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{post.category}</span>
              <button
                onClick={() => handleLike(post.id)}
                className={`text-sm ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400'} hover:underline`}
              >
                ❤️ 좋아요
              </button>
              <span>• {likes[post.id] || 0}개</span>
              <button
                onClick={() => handleBookmark(post.id)}
                className={`text-sm ${bookmarkedPosts.has(post.id) ? 'text-yellow-500' : 'text-gray-400'} hover:underline`}
              >
                📌 북마크
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
