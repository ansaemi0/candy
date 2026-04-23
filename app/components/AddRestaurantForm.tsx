'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = ['점심 식사', '디저트', '회식', '기타']

export default function AddRestaurantForm({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    category: '점심 식사',
    name: '',
    genre: '',
    location: '',
    recommender: '',
    notes: '',
    link: '',
    payco: '',
    review: '',
    solo_possible: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('가게 이름은 필수입니다')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          genre: form.genre.trim() || null,
          location: form.location.trim() || null,
          recommender: form.recommender.trim() || null,
          notes: form.notes.trim() || null,
          link: form.link.trim() || null,
          payco: form.payco || null,
          review: form.review.trim() || null,
          solo_possible: form.solo_possible || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '저장에 실패했습니다')
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">맛집 추가하기</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}

          <Field label="분류">
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="가게 이름 *">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: 규카츠정 판교점"
              className={inputClass}
              required
            />
          </Field>

          <Field label="장르">
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="예: 규카츠, 쌀국수, 파스타"
              className={inputClass}
            />
          </Field>

          <Field label="위치">
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="예: 하이펙스 B동 지하1층"
              className={inputClass}
            />
          </Field>

          <Field label="추천인">
            <input
              type="text"
              name="recommender"
              value={form.recommender}
              onChange={handleChange}
              placeholder="이름"
              className={inputClass}
            />
          </Field>

          <Field label="비고 (가격 등)">
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="예: 16000원"
              className={inputClass}
            />
          </Field>

          <Field label="네이버 지도 링크">
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="https://naver.me/..."
              className={inputClass}
            />
          </Field>

          <div className="flex gap-6">
            <Field label="페이코 유무">
              <select name="payco" value={form.payco} onChange={handleChange} className={inputClass}>
                <option value="">미입력</option>
                <option value="O">O (가능)</option>
                <option value="X">X (불가)</option>
              </select>
            </Field>
            <Field label="혼밥 가능여부">
              <select name="solo_possible" value={form.solo_possible} onChange={handleChange} className={inputClass}>
                <option value="">미입력</option>
                <option value="O">O (가능)</option>
                <option value="X">X (불가)</option>
              </select>
            </Field>
          </div>

          <Field label="리뷰">
            <textarea
              name="review"
              value={form.review}
              onChange={handleChange}
              placeholder="맛, 분위기, 가격 등 자유롭게 작성해주세요"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
