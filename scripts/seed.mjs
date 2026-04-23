import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const SUPABASE_URL = 'https://lgabgemxkvmcokbqdnma.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYWJnZW14a3ZtY29rYnFkbm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzU4MjgsImV4cCI6MjA5MjUxMTgyOH0.sE53vLHeoFZiwve6ZAM0u84PvikcPhDrnq1RskBDBT0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const EXCEL_PATH = 'C:\\git\\candy\\mamma\\toprest.xlsx'

function parseExcel() {
  const buf = readFileSync(EXCEL_PATH)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]

  // 엑셀 구조: 1행=제목, 2~3행=빈/병합, 4행=헤더, 5행~=데이터
  // sheet_to_json으로 raw 배열로 읽기
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // 헤더 행 찾기 (분류, 추천인, 위치, 가게 이름 이 있는 행)
  let headerRowIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (Array.isArray(row) && row.includes('가게 이름')) {
      headerRowIdx = i
      break
    }
  }

  if (headerRowIdx === -1) {
    console.error('헤더 행을 찾을 수 없습니다')
    process.exit(1)
  }

  const headers = rows[headerRowIdx]
  console.log('헤더:', headers)

  // 컬럼 인덱스 매핑
  const colIdx = {
    category: headers.indexOf('분류'),
    recommender: headers.indexOf('추천인'),
    location: headers.indexOf('위치'),
    name: headers.indexOf('가게 이름'),
    genre: headers.indexOf('장르'),
    notes: headers.indexOf('비고'),
    link: headers.indexOf('링크'),
    payco: headers.indexOf('페이코 유무'),
    verified: headers.indexOf('검증'),
    verifier: headers.indexOf('검증인 (동의 하시면 이름 기입)'),
    review: headers.indexOf('리뷰'),
    solo_possible: headers.indexOf('혼밥가능여부'),
  }

  // verifier 컬럼 못찾으면 대안 시도
  if (colIdx.verifier === -1) {
    colIdx.verifier = headers.findIndex(h => h && h.toString().includes('검증인'))
  }

  console.log('컬럼 인덱스:', colIdx)

  const restaurants = []
  let currentCategory = null

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(cell => cell === null || cell === '')) continue

    // 분류 컬럼이 있으면 현재 카테고리 업데이트
    const catVal = colIdx.category >= 0 ? row[colIdx.category] : null
    if (catVal && catVal.toString().trim()) {
      currentCategory = catVal.toString().trim()
    }

    const name = colIdx.name >= 0 ? row[colIdx.name] : null
    if (!name || name.toString().trim() === '') continue

    const cleanStr = (val) => {
      if (val === null || val === undefined) return null
      const s = val.toString().trim()
      return s === '' ? null : s
    }

    restaurants.push({
      category: currentCategory,
      recommender: cleanStr(colIdx.recommender >= 0 ? row[colIdx.recommender] : null),
      location: cleanStr(colIdx.location >= 0 ? row[colIdx.location] : null),
      name: name.toString().trim(),
      genre: cleanStr(colIdx.genre >= 0 ? row[colIdx.genre] : null),
      notes: cleanStr(colIdx.notes >= 0 ? row[colIdx.notes] : null),
      link: cleanStr(colIdx.link >= 0 ? row[colIdx.link] : null),
      payco: cleanStr(colIdx.payco >= 0 ? row[colIdx.payco] : null),
      verified: cleanStr(colIdx.verified >= 0 ? row[colIdx.verified] : null),
      verifier: cleanStr(colIdx.verifier >= 0 ? row[colIdx.verifier] : null),
      review: cleanStr(colIdx.review >= 0 ? row[colIdx.review] : null),
      solo_possible: cleanStr(colIdx.solo_possible >= 0 ? row[colIdx.solo_possible] : null),
    })
  }

  return restaurants
}

async function seed() {
  console.log('엑셀 파일 읽는 중...')
  const restaurants = parseExcel()
  console.log(`총 ${restaurants.length}개 맛집 데이터 파싱 완료`)

  if (restaurants.length === 0) {
    console.error('데이터가 없습니다')
    process.exit(1)
  }

  // 기존 데이터 삭제
  const { error: delError } = await supabase.from('restaurants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delError) {
    console.warn('기존 데이터 삭제 오류 (무시):', delError.message)
  }

  // 배치 삽입 (50개씩)
  const BATCH_SIZE = 50
  let inserted = 0
  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('restaurants').insert(batch)
    if (error) {
      console.error('삽입 오류:', error.message, JSON.stringify(batch[0]))
      process.exit(1)
    }
    inserted += batch.length
    console.log(`${inserted}/${restaurants.length} 삽입 완료`)
  }

  console.log('시드 완료!')
}

seed().catch(console.error)
