import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 24,
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  optionRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.1,
    marginLeft: 24,
  },
  logoutContainer: {
    backgroundColor: '#FFF',
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  logoutRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  logoutLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#C24B3B',
    marginLeft: 16,
  },
});

