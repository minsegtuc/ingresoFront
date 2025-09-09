// src/PwaUpdater.jsx
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
                // Opcional: Puedes mostrar un mensaje de "listo para usar offline"
                console.log('App lista para trabajar offline');
            },
        });
        setReloadSW(() => sw);
    }, []);

    const update = () => {
        if (reloadSW) {
            reloadSW(true);
        }
    };

    return { showReload, update };
};