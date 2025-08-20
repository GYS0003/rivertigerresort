'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReceptionRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('reception-token');

    if (!token) {
      // 🚫 No token, redirect to home
      router.replace('/');
    } else {
      // ✅ Token found, allow access
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null; // Or a loader/spinner

  return <>{children}</>;
}
