export interface AcademicOption {
    code?: unknown;
    name?: unknown;
}

export function isRuntimeAcademicOption(option: AcademicOption | null | undefined): boolean {
    const code = String(option?.code ?? '').trim().toLowerCase();
    const name = String(option?.name ?? '').trim().toLowerCase();
    const isProofCode = code === 'pdqjmszs85'
        || code.startsWith('proof')
        || code.startsWith('p2c1')
        || code.startsWith('p2c2')
        || code.startsWith('p2c3');

    return name !== '' && !name.startsWith('proof ') && !isProofCode;
}
