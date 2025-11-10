import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  notificationItemEven: {
    backgroundColor: '#FFFFFF',
  },
  notificationItemOdd: {
    backgroundColor: '#F6EDE2',
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
  // Notification Content
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    marginBottom: 4,
  },
  username: {
    fontFamily: 'Exo_700Bold',
    fontSize: 15,
    color: '#000',
  },
  actionText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#000',
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
  },
  navLabel: {
    fontFamily: 'Exo_300Light',
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  navLabelActive: {
    fontFamily: 'Exo_300Light',
    fontSize: 10,
    color: '#000',
    marginTop: 4,
  },
});

