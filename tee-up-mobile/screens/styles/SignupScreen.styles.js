import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF1E6',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 28,
    color: '#121212',
    marginBottom: 8,
  },
  fieldGroup: {
    marginTop: 24,
  },
  label: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    paddingVertical: 6,
    color: '#0f0f0f',
  },
  underline: {
    height: 1,
    backgroundColor: '#1f1f1f',
    opacity: 0.9,
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: 'Exo_700Bold',
    color: '#111',
    fontSize: 18,
  },
  primaryButtonTextDisabled: {
    color: '#999',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMuted: {
    fontFamily: 'Exo_400Regular',
    color: '#2b2b2b',
    opacity: 0.9,
    fontSize: 13,
  },
  bottomLink: {
    fontFamily: 'Exo_700Bold',
    color: '#000',
    fontSize: 13,
  },
});

