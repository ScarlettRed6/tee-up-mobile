import { StyleSheet } from 'react-native';

const PRIMARY = '#FF6B35';
const TEXT_DARK = '#1C1C1E';
const TEXT_MUTED = '#6B7280';
const BORDER = '#E5E7EB';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginBottom: 32,
    lineHeight: 22,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 12,
    color: TEXT_DARK,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#FBD3C7',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  resendPrompt: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  resendText: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#F9A885',
  },
  backButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  backButtonText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
});

