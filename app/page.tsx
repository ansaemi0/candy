'use client'

import { useState } from 'react'
import RestaurantCard from './components/RestaurantCard'
import AddRestaurantForm from './components/AddRestaurantForm'
import { Restaurant } from '@/lib/supabase'

export default function Home() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  const handleRecommend = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommend')
      if (!res.ok) throw new Error('추천을 불러오지 못했습니다')
      const data = await res.json()
      setRestaurant(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuccess = () => {
    setShowForm(false)
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col items-center justify-start px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🍽️</div>
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          오늘의 판교 맛집
        </h1>
        <p className="text-gray-400 mt-2 text-sm">매일 새로운 맛집을 추천해드려요</p>
      </div>

      {/* 추천받기 버튼 */}
      <button
        onClick={handleRecommend}
        disabled={loading}
        className="
          bg-gradient-to-r from-orange-400 to-red-500
          text-white text-xl font-bold
          px-12 py-5 rounded-2xl shadow-lg
          hover:shadow-xl hover:scale-105
          active:scale-100
          transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          mb-8
        "
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            추천 중...
          </span>
        ) : '🎯 추천받기'}
      </button>

      {/* 에러 */}
      {error && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}

      {/* 맛집 카드 */}
      {restaurant && (
        <div className="w-full max-w-lg mb-8">
          <RestaurantCard restaurant={restaurant} />
        </div>
      )}

      {/* 구분선 */}
      <div className="w-full max-w-lg border-t border-gray-100 my-4" />

      {/* 맛집 추가 버튼 */}
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
      >
        <span className="text-lg">+</span> 맛집 추가하기
      </button>

      {/* 성공 토스트 */}
      {addSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          ✅ 맛집이 추가되었습니다!
        </div>
      )}

      {/* 추가 폼 모달 */}
      {showForm && (
        <AddRestaurantForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </main>
  )
}
