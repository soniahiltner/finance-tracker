import {
  format,
  addDays,
  subDays,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth
} from 'date-fns'

describe('Date Utilities', () => {
  const testDate = new Date('2024-01-15T12:00:00.000Z')

  it('should format dates correctly', () => {
    const formatted = format(testDate, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-15')
  })

  it('should add days correctly', () => {
    const futureDate = addDays(testDate, 7)
    const formatted = format(futureDate, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-22')
  })

  it('should subtract days correctly', () => {
    const pastDate = subDays(testDate, 5)
    const formatted = format(pastDate, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-10')
  })

  it('should compare dates correctly', () => {
    const futureDate = addDays(testDate, 1)
    const pastDate = subDays(testDate, 1)

    expect(isAfter(futureDate, testDate)).toBe(true)
    expect(isBefore(pastDate, testDate)).toBe(true)
    expect(isAfter(testDate, futureDate)).toBe(false)
  })

  it('should get start of month', () => {
    const monthStart = startOfMonth(testDate)
    const formatted = format(monthStart, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-01')
  })

  it('should get end of month', () => {
    const monthEnd = endOfMonth(testDate)
    const formatted = format(monthEnd, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-31')
  })

  it('should handle month boundaries correctly', () => {
    const febDate = new Date('2024-02-29T12:00:00.000Z') // Leap year
    const monthStart = startOfMonth(febDate)
    const monthEnd = endOfMonth(febDate)

    expect(format(monthStart, 'yyyy-MM-dd')).toBe('2024-02-01')
    expect(format(monthEnd, 'yyyy-MM-dd')).toBe('2024-02-29')
  })

  it('should handle year boundaries correctly', () => {
    const yearEnd = new Date('2024-12-31T00:00:00.000Z')
    const nextDay = addDays(yearEnd, 1)

    expect(format(nextDay, 'yyyy-MM-dd')).toBe('2025-01-01')
  })
})
