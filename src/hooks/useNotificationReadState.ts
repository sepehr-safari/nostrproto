import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const STORAGE_KEY_PREFIX = 'nostr-notifications-read-';

export function useNotificationReadState() {
  const { user } = useCurrentUser();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const storageKey = user?.pubkey ? `${STORAGE_KEY_PREFIX}${user.pubkey}` : null;

  // Load read notifications from localStorage on mount
  useEffect(() => {
    if (!storageKey) {
      setReadNotifications(new Set());
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const readIds = JSON.parse(stored) as string[];
        setReadNotifications(new Set(readIds));
      } else {
        setReadNotifications(new Set());
      }
    } catch (error) {
      console.warn('Failed to load read notifications from localStorage:', error);
      setReadNotifications(new Set());
    }
  }, [storageKey]);

  // Save read notifications to localStorage
  const saveToStorage = useCallback((readIds: Set<string>) => {
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(readIds)));
    } catch (error) {
      console.warn('Failed to save read notifications to localStorage:', error);
    }
  }, [storageKey]);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      saveToStorage(newSet);
      return newSet;
    });
  }, [saveToStorage]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback((notificationIds: string[]) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      notificationIds.forEach(id => newSet.add(id));
      saveToStorage(newSet);
      return newSet;
    });
  }, [saveToStorage]);

  // Mark all notifications as read
  const markAllAsRead = useCallback((allNotificationIds: string[]) => {
    const newSet = new Set(allNotificationIds);
    setReadNotifications(newSet);
    saveToStorage(newSet);
  }, [saveToStorage]);

  // Check if a notification is read
  const isRead = useCallback((notificationId: string) => {
    return readNotifications.has(notificationId);
  }, [readNotifications]);

  // Get count of unread notifications
  const getUnreadCount = useCallback((allNotificationIds: string[]) => {
    return allNotificationIds.filter(id => !readNotifications.has(id)).length;
  }, [readNotifications]);

  return {
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    isRead,
    getUnreadCount,
    readNotifications,
  };
}