import { StyleSheet } from 'react-native';

export const resetPasswordStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topNav: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'flex-start',
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginLeft: 0,
  },
  backArrow: {
    fontSize: 24,
    color: '#0A84FF',
    marginRight: 4,
  },
  backText: {
    fontSize: 17,
    color: '#0A84FF',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  codeInput: {
    width: 48,
    height: 58,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  codeInputFilled: {
    borderColor: '#0A84FF',
    backgroundColor: '#F0F8FF',
  },
  codeHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#0A84FF',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  linkText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
