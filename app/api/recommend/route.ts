import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function dateHash(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return hash
}

export async function GET() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: '맛집 데이터가 없습니다' }, { status: 404 })
  }

  // 오늘 날짜 기반 결정론적 추천
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const index = dateHash(dateStr) % data.length

  return NextResponse.json(data[index])
}
