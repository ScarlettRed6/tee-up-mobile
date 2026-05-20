import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
} from '../api/notificationsApi';
import { getSocket } from '../utils/socketClient';

const defaultValue = {
  notifications: [],
  notificationsLoading: false,
  unreadCount: 0,
  refreshNotifications: () => Promise.resolve(),
  markNotificationAsRead: () => Promise.resolve(),
  markAllNotificationsAsRead: () => Promise.resolve(),
};

export const NotificationsContext = createContext(defaultValue);

function normalizeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const parsedData = (() => {
    if (!raw.data) return {};
    if (typeof raw.data === 'string') {
      try {
        return JSON.parse(raw.data);
      } catch {
        return {};
      }
    }
    return raw.data;
  })();

  const id =
    raw.id ??
    raw.notification_id ??
    raw.notificationId ??
    raw._id ??
    parsedData?.notificationId ??
    null;

  const createdAt = raw.created_at || raw.createdAt || raw.timestamp || null;
  const readAt = raw.read_at || raw.readAt || raw.seen_at || null;

  return {
    id,
    type: raw.type || parsedData?.type || 'general',
    message: raw.message || parsedData?.message || '',
    data: parsedData,
    created_at: createdAt,
    read_at: readAt,
  };
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const socketRef = useRef(null);

  const hydrateNotifications = useCallback((items = []) => {
    const normalized = items
      .map(normalizeNotification)
      .filter((n) => n && n.id != null);
    const byId = new Map();
    normalized.forEach((n) => byId.set(n.id, n));
    return Array.from(byId.values()).sort((a, b) => {
      const aT = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bT = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bT - aT;
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const res = await getNotifications();
      const list = res?.notifications ?? res?.data ?? res?.result ?? [];
      setNotifications(hydrateNotifications(list));
    } catch (err) {
      console.error('Failed to fetch notifications:', err?.response?.data || err?.message);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated, hydrateNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    let socket = null;

    const handleNotification = (payload) => {
      const n = normalizeNotification(payload);
      if (!n || n.id == null) return;
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === n.id);
        if (exists) {
          return prev.map((item) => (item.id === n.id ? n : item));
        }
        return [n, ...prev];
      });
    };

    (async () => {
      try {
        socket = await getSocket();
        if (!socket || cancelled) return;
        socketRef.current = socket;
        socket.on('notification', handleNotification);
      } catch (err) {
        console.log('Notifications socket:', err?.message || err);
      }
    })();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.off('notification', handleNotification);
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;
    try {
      await markAsReadApi(notificationId);
    } catch (err) {
      console.error('Mark notification read:', err?.response?.data || err?.message);
    }
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, read_at: n.read_at || new Date().toISOString() }
          : n
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsReadApi();
    } catch (err) {
      console.error('Mark all read:', err?.response?.data || err?.message);
    }
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString(),
      }))
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      notificationsLoading,
      unreadCount,
      refreshNotifications: loadNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    }),
    [
      notifications,
      notificationsLoading,
      unreadCount,
      loadNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  return ctx ?? defaultValue;
}
