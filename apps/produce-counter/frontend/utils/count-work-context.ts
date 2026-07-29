import type { CountWorkContext } from '@nexttree/shared'
import { getDestinationOption } from './destination-catalog'

type RouteQuery = Record<string, unknown>

export type WorkContextSelection = {
  destinationId: string
  recordDate: string
}

export type WorkContextErrors = {
  destinationId: string | null
  recordDate: string | null
}

export function isValidRecordDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1000) return false

  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
}

export function validateWorkContextSelection(
  selection: WorkContextSelection,
): WorkContextErrors {
  return {
    destinationId: getDestinationOption(selection.destinationId)
      ? null
      : '卸先を選択してください。',
    recordDate: !selection.recordDate
      ? '記録日を入力してください。'
      : !isValidRecordDate(selection.recordDate)
        ? '正しい日付を入力してください。'
        : null,
  }
}

export function resolveCountWorkContext(
  query: RouteQuery,
): CountWorkContext | null {
  if (
    typeof query.destinationId !== 'string'
    || typeof query.recordDate !== 'string'
  ) {
    return null
  }

  const errors = validateWorkContextSelection({
    destinationId: query.destinationId,
    recordDate: query.recordDate,
  })
  const destination = getDestinationOption(query.destinationId)
  if (errors.destinationId || errors.recordDate || !destination) return null

  return {
    destinationId: destination.id,
    destinationName: destination.label,
    recordDate: query.recordDate,
  }
}

export function createCountEntryLocation(selection: WorkContextSelection) {
  return {
    path: '/count/entry',
    query: {
      destinationId: selection.destinationId,
      recordDate: selection.recordDate,
    },
  }
}
