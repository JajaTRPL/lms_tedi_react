/**
 * AuthNotification — tampilan notifikasi identik dengan toast pengajuan surat,
 * muncul fixed di atas-tengah layar (sama persis posisinya dengan toast surat).
 * Tidak menggunakan Toastify.
 */

type AuthNotifType = 'success' | 'error' | 'warning' | 'info';

const CONTAINER_ID = 'auth-notif-container';

const getIcon = (type: AuthNotifType): string => {
    if (type === 'success') {
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"></circle><path d="M7.8 12.2l2.8 2.8 5.8-6.3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }
    if (type === 'error') {
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"></circle><path d="M12 6.8v7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M12 17.2h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"></circle><path d="M12 10.5v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M12 7.2h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>';
};

const getOrCreateContainer = (): HTMLElement => {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        // Sama persis dengan .toast-container di style.css
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
};

let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

export const showInlineNotification = (
    _containerId: string,   // diabaikan, tetap diterima agar tidak ada perubahan di caller
    title: string,
    message: string,
    type: AuthNotifType = 'error',
    duration = 4000,
): void => {
    const container = getOrCreateContainer();

    // Bersihkan timer sebelumnya
    if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        autoHideTimer = null;
    }

    // Hapus notif lama
    container.innerHTML = '';

    // Card wrapper — gunakan class .auth-notif (styling identik toast surat)
    const wrapper = document.createElement('div');
    wrapper.className = `auth-notif toast-${type}`;

    const layout = document.createElement('div');
    layout.className = 'toast-layout';

    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.innerHTML = getIcon(type);

    const contentEl = document.createElement('div');
    contentEl.className = 'toast-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    contentEl.append(titleEl, msgEl);
    layout.append(iconEl, contentEl);
    wrapper.appendChild(layout);
    container.appendChild(wrapper);

    // Auto-hide setelah `duration` ms
    if (duration > 0) {
        autoHideTimer = setTimeout(() => {
            hideInlineNotification(_containerId);
        }, duration);
    }
};

export const hideInlineNotification = (_containerId: string): void => {
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
        container.innerHTML = '';
    }
};
