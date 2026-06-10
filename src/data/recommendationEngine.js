import graphsData from './graphs.json'
import treesData from './trees.json'
import problemsData from './problems.json'

// Unified topic map
const TOPIC_MAP = {
  'Graphs': graphsData,
  'Trees': treesData,
  'Arrays': problemsData.arrays,
  'Strings': problemsData.strings,
  'DP': problemsData.dp,
  'Dynamic Programming': problemsData.dp,
  'Heap': problemsData.heap,
  'Linked List': problemsData.linkedlist,
  'Binary Search': problemsData.binarysearch,
  'Greedy': problemsData.greedy,
  'Backtracking': problemsData.backtracking,
}

export const ALL_TOPICS = Object.keys(TOPIC_MAP)

/**
 * Get problems for selected topics, optionally filtered by company
 * Returns { easy: [], medium: [], hard: [] }
 */
export function getRecommendations(topics = [], company = null) {
  const all = topics.flatMap(t => TOPIC_MAP[t] || [])

  // Deduplicate by id
  const seen = new Set()
  const unique = all.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  // Company filter — if company provided, prioritize but don't exclude
  const sorted = company
    ? [...unique].sort((a, b) => {
        const aHas = a.companyTags?.includes(company) ? 0 : 1
        const bHas = b.companyTags?.includes(company) ? 0 : 1
        return aHas - bHas
      })
    : unique

  return {
    easy: sorted.filter(p => p.difficulty === 'Easy'),
    medium: sorted.filter(p => p.difficulty === 'Medium'),
    hard: sorted.filter(p => p.difficulty === 'Hard'),
  }
}

export function getTopicProblems(topic) {
  return TOPIC_MAP[topic] || []
}
