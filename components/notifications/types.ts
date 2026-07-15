export type NotificationCenterItem = {
    id: string;
    title: string;
    body?: string;
    url: string;
    relativeTime: string;
    readAt: string | null;
};

export type NotificationCenterCopy = {
    title: string;
    triggerLabel: string;
    unreadLabel: (count: number) => string;
    archiveLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    loadOlderLabel: string;
    loadingLabel: string;
};

export const defaultNotificationCenterCopy: NotificationCenterCopy = {
    title: 'Notificaciones',
    triggerLabel: 'Notificaciones',
    unreadLabel: (count) => `${count} sin leer`,
    archiveLabel: 'Archivar',
    emptyTitle: 'Sin notificaciones',
    emptyDescription: 'Las notificaciones nuevas aparecerán aquí.',
    loadOlderLabel: 'Cargar anteriores',
    loadingLabel: 'Cargando notificaciones',
};
