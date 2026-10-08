export function validateName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) return 'Name is required'
  if (trimmed.length > 60) return 'Keep it under 60 characters'

  return null
}
