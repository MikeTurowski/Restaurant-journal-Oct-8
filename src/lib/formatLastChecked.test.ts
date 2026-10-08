import { describeLastChecked, formatCheckedDate } from './formatLastChecked'

const now = new Date(2026, 9, 8) // Oct 8, 2026

describe('describeLastChecked', () => {
  it('handles missing or invalid dates', () => {
    expect(describeLastChecked(undefined, now)).toEqual({
      label: 'Not yet checked',
      stale: true,
    })
    expect(describeLastChecked('garbage', now).stale).toBe(true)
  })

  it('describes recent checks', () => {
    expect(describeLastChecked('2026-10-08', now).label).toBe('Checked today')
    expect(describeLastChecked('2026-10-07', now).label).toBe('Checked yesterday')
    expect(describeLastChecked('2026-09-28', now).label).toBe('Checked 10 days ago')
  })

  it('switches to months and flags stale data after 90 days', () => {
    expect(describeLastChecked('2026-08-08', now)).toEqual({
      label: 'Checked 2 months ago',
      stale: false,
    })
    expect(describeLastChecked('2026-06-01', now).stale).toBe(true)
  })

  it('never reports negative days for future dates', () => {
    expect(describeLastChecked('2027-01-01', now).label).toBe('Checked today')
  })
})

describe('formatCheckedDate', () => {
  it('formats a full date', () => {
    expect(formatCheckedDate('2026-09-20')).toBe('September 20, 2026')
    expect(formatCheckedDate(undefined)).toBeNull()
  })
})
