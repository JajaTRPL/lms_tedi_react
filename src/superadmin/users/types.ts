export type TabType = 'tendik' | 'akademik' | 'mahasiswa';

export interface UserState {
    activeTab: TabType;
    allUsers: any[];
}

export const state: UserState = {
    activeTab: 'tendik',
    allUsers: []
};

export const tabConfig: Record<TabType, { label: string; roles: string[]; icon: string; title: string; subtitle: string }> = {
    tendik: {
        label: 'Tenaga Pendidik',
        roles: ['tendik'],
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
        title: 'Daftar Akun Tenaga Pendidik',
        subtitle: 'Kelola Penugasan Tenaga Pendidik',
    },
    akademik: {
        label: 'Akademik',
        roles: ['kadep', 'kaprodi', 'sekdep', 'sekprodi', 'akademik'],
        icon: '<path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"></path>',
        title: 'Daftar Akun Akademik',
        subtitle: 'Kelola Akun Staf Akademik & Pimpinan',
    },
    mahasiswa: {
        label: 'Mahasiswa',
        roles: ['mahasiswa'],
        icon: '<path d="M12 14l9-5-9-5-9 5 9 5zm0 7V9"></path>',
        title: 'Daftar Akun Mahasiswa',
        subtitle: 'Kelola Akun Mahasiswa Terdaftar',
    },
};
