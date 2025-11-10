import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Search Bar
  searchBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
  },
  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
  },
  sectionHeaderBold: {
    fontFamily: 'Exo_700Bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  clearButton: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#999',
  },
  // Recent Searches
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  searchItemText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 15,
    color: '#000',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 0,
  },
  emptyStateText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  // Categories
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#666',
    shadowOpacity: 0.12,
  },
  categoryText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#222',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  // Filter By Section
  filterLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 24,
  },
  // Price Filters
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
  },
  // Filter Pills
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  filterPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterPillActive: {
    backgroundColor: '#666',
    shadowOpacity: 0.12,
  },
  filterPillText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#222',
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  // Flex Pills
  flexPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  flexPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flexPillActive: {
    backgroundColor: '#666',
    shadowOpacity: 0.12,
  },
  flexPillText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 13,
    color: '#222',
  },
  flexPillTextActive: {
    color: '#FFF',
  },
  // Location
  locationPill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#000',
  },
  // Apply Button
  applyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#F6EDE2',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  applyButtonText: {
    fontFamily: 'Exo_700Bold',
    fontSize: 16,
    color: '#000',
  },
  bottomSpacer: {
    height: 20,
  },
});

