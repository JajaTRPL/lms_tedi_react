// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}))

vi.mock('../api-client', () => ({
  apiFetch: mocks.apiFetch,
}))

import { populateDepartmentSelect, clearDepartmentCache } from '../department-select'
import { populateStudyProgramSelect, clearStudyProgramCache } from '../study-program-select'

beforeEach(() => {
  mocks.apiFetch.mockReset()
  clearDepartmentCache()
  clearStudyProgramCache()
})

describe('runtime academic option visibility', () => {
  it('removes proof departments and programs from user-facing selects', async () => {
    mocks.apiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            department: { id: 1, code: 'DTEDI', name: 'Departemen Teknik Elektro dan Informatika' },
            programs: [
              { id: 1, code: 'TRPL', name: 'Teknologi Rekayasa Perangkat Lunak' },
              { id: 29, code: 'P2C1P202605211725528194', name: 'Proof Study Program Phase 2C1' },
              { id: 30, code: 'P2C2P202605211736396859', name: 'Proof Study Program Phase 2C2' },
              { id: 31, code: 'P2C3P202605211746078638', name: 'Temporary Study Program' },
            ],
          },
          {
            department: { id: 10, code: 'P2C1D202605211725528194', name: 'Proof Department Phase 2C1' },
            programs: [
              { id: 30, code: 'P2C1P202605211725528194', name: 'Proof Study Program Phase 2C1' },
            ],
          },
        ]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, code: 'DTEDI', name: 'Departemen Teknik Elektro dan Informatika' },
          { id: 9, code: 'PDQJMSZS85', name: 'Proof Department QJMSZS85' },
          { id: 10, code: 'P2C3D202605211746078638', name: 'Temporary Department' },
        ]),
      } as Response)

    const programSelect = document.createElement('select')
    await populateStudyProgramSelect(programSelect)
    expect(programSelect.textContent).toContain('TRPL')
    expect(programSelect.textContent).not.toContain('Proof')
    expect(programSelect.textContent).not.toContain('P2C1')
    expect(programSelect.textContent).not.toContain('P2C2')
    expect(programSelect.textContent).not.toContain('P2C3')
    expect(programSelect.textContent).not.toContain('PDQJMSZS85')
    expect(programSelect.textContent).not.toContain('Temporary Study Program')

    const departmentSelect = document.createElement('select')
    await populateDepartmentSelect(departmentSelect)
    expect(departmentSelect.textContent).toContain('DTEDI')
    expect(departmentSelect.textContent).not.toContain('Proof')
    expect(departmentSelect.textContent).not.toContain('PDQJMSZS85')
    expect(departmentSelect.textContent).not.toContain('Temporary Department')
  })

  it('renders an explicit empty state when only proof programs are returned', async () => {
    mocks.apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          department: { id: 10, code: 'P2C1D202605211725528194', name: 'Proof Department' },
          programs: [
            { id: 29, code: 'P2C1P202605211725528194', name: 'Proof Study Program' },
          ],
        },
      ]),
    } as Response)

    const programSelect = document.createElement('select')
    await populateStudyProgramSelect(programSelect)

    expect(programSelect.options).toHaveLength(1)
    expect(programSelect.options[0].value).toBe('')
    expect(programSelect.options[0].textContent).toBe('Program studi tidak tersedia.')
  })
})
