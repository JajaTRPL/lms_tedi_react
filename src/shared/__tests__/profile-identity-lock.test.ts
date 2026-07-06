import { describe, expect, it } from 'vitest'
import akademikProfileSource from '../../akademik/ProfilKaprodi.ts?raw'
import mahasiswaSsoSource from '../../mahasiswa/profil-mahasiswa/ui/SectionSSO.ts?raw'
import tendikProfileSource from '../../tendik/ProfilTendik.ts?raw'

describe('staff profile identity lock', () => {
  it('keeps NIP read-only and out of normal profile update payloads', () => {
    for (const source of [akademikProfileSource, tendikProfileSource]) {
      expect(source).toContain('NIP dikelola oleh Super Admin')
      expect(source).toMatch(/profil-(akademik|tendik)-nip[^>]+readonly disabled/)
      expect(source).not.toContain("formData.append('nip'")
    }
  })

  it('keeps Mahasiswa NIM and Program Studi read-only in the normal profile', () => {
    expect(mahasiswaSsoSource).toMatch(/id="sso_nim" readonly/)
    expect(mahasiswaSsoSource).toMatch(/id="sso_program_studi" readonly/)
  })
})
