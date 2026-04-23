'use client'

import { Restaurant } from '@/lib/supabase'

interface Props {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-card-in">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            {restaurant.category && (
              <span className="inline-block bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                {restaurant.category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-white leading-tight">{restaurant.name}</h2>
            {restaurant.genre && (
              <p className="text-orange-100 text-sm mt-1">{restaurant.genre}</p>
            )}
          </div>
          {restaurant.link && (
            <a
              href={restaurant.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white text-orange-500 text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              지도 보기 →
            </a>
          )}
        </div>
      </div>

      {/* 바디 */}
      <div className="px-6 py-5 space-y-3">
        {restaurant.location && (
          <Row icon="📍" label="위치" value={restaurant.location} />
        )}
        {restaurant.notes && (
          <Row icon="💰" label="비고" value={restaurant.notes} />
        )}
        {restaurant.review && (
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-orange-400 mb-1">리뷰</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{restaurant.review}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {restaurant.solo_possible && (
            <Badge
              active={restaurant.solo_possible === 'O'}
              label={`혼밥 ${restaurant.solo_possible === 'O' ? '가능' : '불가'}`}
            />
          )}
          {restaurant.payco && (
            <Badge
              active={restaurant.payco === 'O'}
              label={`페이코 ${restaurant.payco === 'O' ? '가능' : '불가'}`}
            />
          )}
          {restaurant.verifier && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ✅ {restaurant.verifier}
            </span>
          )}
        </div>

        {restaurant.recommender && (
          <p className="text-xs text-gray-400">추천인: {restaurant.recommender}</p>
        )}
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span>{icon}</span>
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {label}
    </span>
  )
}
