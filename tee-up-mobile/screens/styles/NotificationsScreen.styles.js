import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  // Header Section
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markAllRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFE1D4',
  },
  markAllText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 6,
  },
  markAllTextDisabled: {
    color: '#BDBDBD',
  },
  headerIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageTitle: {
    fontFamily: 'Exo_700Bold',
    fontSize: 26,
    color: '#000',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    borderRadius: 14,
    marginBottom: 12,
  },
  notificationItemUnread: {
    backgroundColor: '#FFF8F3',
  },
  notificationItemEven: {
    backgroundColor: '#FFFFFF',
  },
  notificationItemOdd: {
    backgroundColor: '#F9F3EC',
  },
  // Avatar Container
  avatarContainer: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  // Notification Content
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationMessage: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'Exo_400Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingState: {
    paddingVertical: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
    minWidth: 44,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 18,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontFamily: 'Exo_700Bold',
    fontSize: 10,
  },
  navLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  navLabelActive: {
    fontFamily: 'Exo_700Bold',
    fontSize: 10,
    color: '#000',
    marginTop: 4,
  },
});

