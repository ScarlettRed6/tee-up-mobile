import { StyleSheet } from 'react-native';

const PRIMARY = '#FF6B35';
const BACKGROUND = '#F6EDE2';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: PRIMARY,
  },
  errorText: {
    color: PRIMARY,
    fontSize: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#F9A885',
  },
});

