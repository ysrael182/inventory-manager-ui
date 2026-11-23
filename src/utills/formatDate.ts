export function formatDate(value: string | null): string {
  if (value === null) return '—'

  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value)
  if (!match) return value

  const [, year, month, day] = match
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day))

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return value
  }

  return `${day}-${month}-${year}`
}

export function parseDateFilter(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  const isoDate = value
  const date = new Date(`${isoDate}T00:00:00.000Z`)

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === isoDate
    ? isoDate
    : null
}
