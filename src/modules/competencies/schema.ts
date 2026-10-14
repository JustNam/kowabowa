export function validateTitle(title: string): string | null {
  const trimmed = title.trim()

  if (!trimmed) return 'Title is required'
  if (trimmed.length > 60) return 'Keep it under 60 characters'

  return null
}
