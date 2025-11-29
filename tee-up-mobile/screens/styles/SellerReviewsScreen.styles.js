import { StyleSheet } from 'react-native';

const PRIMARY = '#FF6B35';
const BACKGROUND = '#F6EDE2';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BACKGROUND,
  },
  backButton: {
    padding: 6,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryRating: {
    fontSize: 40,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  summaryStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryCount: {
    marginLeft: 8,
    fontSize: 14,
    color: TEXT_MUTED,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4D6',
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  reviewDate: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  reviewBadgeText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#9A3412',
  },
  reviewText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: TEXT_MUTED,
    marginTop: 20,
  },
});

