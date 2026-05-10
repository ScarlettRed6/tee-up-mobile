import { createContext, useContext } from 'react';

const LoginPromptContext = createContext(null);

export function LoginPromptProvider({ children, value }) {
  return (
    <LoginPromptContext.Provider value={value}>{children}</LoginPromptContext.Provider>
  );
}

/**
 * For guests: redirects to login/sign-up. Options: `{ fromBrowse?: boolean, tab?: 'login'|'signup' }`.
 */
export function useLoginPrompt() {
  const ctx = useContext(LoginPromptContext);
  return ctx ?? { openLogin: () => {} };
}
