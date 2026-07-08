// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    apiFetch: vi.fn(),
}));

vi.mock('../../../shared/api-client', () => ({
    apiFetch: m.apiFetch,
    loadProtectedImageObjectUrl: vi.fn(async () => null),
    revokeProtectedImageObjectUrl: vi.fn(),
}));

// The admin page transitively imports the shared PDF.js viewer; pdfjs-dist
// cannot load under jsdom (no DOMMatrix), so stub the viewer module.
vi.mock('../../../shared/protected-pdf-viewer', () => ({
    renderProtectedPdfViewer: () => '<div data-protected-pdf-viewer></div>',
    attachProtectedPdfViewer: () => () => {},
}));

import { renderSidebar } from '../../../components/Sidebar';
import { renderDashboardLayout } from '../../../dashboard/DashboardLayout';

const response = (payload: unknown, status = 200): Response =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    localStorage.setItem('auth_role', 'super_admin');
    localStorage.setItem('auth_name', 'Admin');
    m.apiFetch.mockReset();
    m.apiFetch.mockImplementation(async (url: string) => {
        if (url === '/api/laboratories') return response([]);
        if (url.includes('/rooms')) {
            return response({ message: 'ok', count: 0, data: [] });
        }
        if (url.includes('/requests')) {
            return response({
                message: 'ok',
                data: [],
                meta: {
                    current_page: 1,
                    per_page: 10,
                    total: 0,
                    last_page: 1,
                },
            });
        }
        return response({});
    });
});

describe('Super Admin Peminjaman navigation', () => {
    it('adds Peminjaman only to Super Admin while preserving existing menus', () => {
        const sidebar = renderSidebar('super_admin');
        expect(sidebar).toContain('sidebar-peminjaman-admin-link');
        expect(sidebar).toContain('Peminjaman Ruangan');
        expect(sidebar).toContain('sidebar-users-link');
        expect(sidebar).toContain('sidebar-monitoring-link');
        expect(sidebar).toContain('sidebar-template-link');
        expect(sidebar).toContain('sidebar-retention-link');
        expect(sidebar).toContain('sidebar-academic-periods-link');

        expect(renderSidebar('mahasiswa')).not.toContain('sidebar-peminjaman-admin-link');
        expect(renderSidebar('tendik')).not.toContain('sidebar-peminjaman-admin-link');
        expect(renderSidebar('akademik')).not.toContain('sidebar-peminjaman-admin-link');
    });

    it('dispatches the sidebar link to the Super Admin Peminjaman page', async () => {
        renderDashboardLayout('Dashboard', '<p>Awal</p>', 'super_admin');
        document.getElementById('sidebar-peminjaman-admin-link')?.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true }),
        );

        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('Master Ruangan');
            expect(document.body.textContent).toContain('Belum ada ruangan');
        });
        expect(document.querySelector('#sidebar-peminjaman-admin-link')?.className)
            .toContain('bg-white/20');
    });
});
