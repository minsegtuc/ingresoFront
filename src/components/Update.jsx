import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export const usePwaUpdater = () => {
    const [showReload, setShowReload] = useState(false);
    const [reloadSW, setReloadSW] = useState(null);

    useEffect(() => {
        const sw = registerSW({
            onNeedRefresh() {
                setShowReload(true);
            },
            onOfflineReady() {
                console.log('App lista para trabajar offline');
            },
        });
        setReloadSW(() => sw);
    }, []);

    const update = () => {
        // Evitar múltiples recargas en Safari iOS
        if (sessionStorage.getItem('pwa-reloaded')) return;

        if (reloadSW) {
            reloadSW(true).then(() => {
                sessionStorage.setItem('pwa-reloaded', 'true');
                window.location.reload();
            });
        }
    };

    return { showReload, update };
};