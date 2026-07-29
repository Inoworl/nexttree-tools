export type DestinationOption = {
  id: string
  label: string
}

export const DESTINATION_OPTIONS: readonly DestinationOption[] = [
  { id: 'central-market', label: '中央青果市場（デモ）' },
  { id: 'harbor-store', label: '港青果店（デモ）' },
  { id: 'direct-shop', label: '直売所（デモ）' },
]

export function getDestinationOption(
  destinationId: string,
): DestinationOption | null {
  return DESTINATION_OPTIONS.find(option => option.id === destinationId) ?? null
}
