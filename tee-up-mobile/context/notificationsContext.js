import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { authContext } from './authContext';
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
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

const normalizeNotification = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const parsedData = (() => {
    if (!raw.data) return {};
    if (typeof raw.data === 'string') {
      try {
        return JSON.parse(raw.data);
      } catch (error) {
        console.log('Failed to parse notification data', error);
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
    (parsedData?.notificationId ?? null);

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
};

export function NotificationsProvider({ children }) {
  const { accessToken } = useContext(authContext);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const socketListenerRef = useRef(null);

  const hydrateNotifications = useCallback((items = []) => {
    const normalized = items
      .map(normalizeNotification)
      .filter((entry) => entry && entry.id !== null && entry.id !== undefined);
    const uniqueMap = new Map();
    normalized.forEach((notification) => {
      uniqueMap.set(notification.id, notification);
    });
    return Array.from(uniqueMap.values()).sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!accessToken) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const response = await fetchNotificationsApi();
      const list =
        response?.notifications ||
        response?.data ||
        response?.result ||
        [];
      setNotifications(hydrateNotifications(list));
    } catch (error) {
      console.error('Failed to fetch notifications:', error.response?.data || error.message);
    } finally {
      setNotificationsLoading(false);
    }
  }, [accessToken, hydrateNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }
    let isCancelled = false;
    let socketInstance = null;

    const handleIncomingNotification = (payload) => {
      const normalized = normalizeNotification(payload);
      if (!normalized || normalized.id === null || normalized.id === undefined) {
        return;
      }
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === normalized.id);
        if (exists) {
          return prev.map((item) =>
            item.id === normalized.id ? normalized : item
          );
        }
        return [normalized, ...prev];
      });
    };

    (async () => {
      try {
        socketInstance = await getSocket();
        if (!socketInstance || isCancelled) {
          return;
        }
        socketListenerRef.current = handleIncomingNotification;
        socketInstance.on('notification', handleIncomingNotification);
      } catch (error) {
        console.log('Unable to attach notification socket listener:', error.message || error);
      }
    })();

    return () => {
      isCancelled = true;
      if (socketInstance && socketListenerRef.current) {
        socketInstance.off('notification', socketListenerRef.current);
      }
      socketListenerRef.current = null;
    };
  }, [accessToken]);

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      try {
        await markNotificationAsReadApi(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error.response?.data || error.message);
      } finally {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
      }
    },
    []
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsReadApi();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error.response?.data || error.message);
      Alert.alert('Error', 'Unable to mark notifications as read right now.');
    } finally {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications]
  );

  const contextValue = useMemo(
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
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

