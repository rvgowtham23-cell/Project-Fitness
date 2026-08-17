import { useEffect, useState } from 'react';
import { getRefreshToken } from '../lib/auth-storage';
import { apiClient, ApiError } from '../lib/api-client';

export type BootstrapStatus = 'loading' | 'unauthenticated' | 'needs-onboarding' | 'ready';

// Runs once at app launch to decide where to land the user. Previously `app/index.tsx` decided
// this from an in-memory-only `isOnboarded` flag that reset to false on every JS reload/cold
// start, forcing a real login+full-onboarding replay every single app open even though the
// refresh token (and the user's already-completed profile) were sitting untouched in
// SecureStore the whole time.
export function useAppBootstrap(): BootstrapStatus {
  const [status, setStatus] = useState<BootstrapStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      try {
        const { profile } = await apiClient.getProfile();
        if (!cancelled) setStatus(profile.onboardingCompletedAt ? 'ready' : 'needs-onboarding');
      } catch (err) {
        // 404 = authenticated but never finished onboarding (e.g. app was closed mid-flow) —
        // resume onboarding rather than treating it as a login failure. Any other error
        // (expired/revoked refresh token, network) falls back to a fresh login.
        if (err instanceof ApiError && err.status === 404) {
          if (!cancelled) setStatus('needs-onboarding');
        } else if (!cancelled) {
          setStatus('unauthenticated');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
