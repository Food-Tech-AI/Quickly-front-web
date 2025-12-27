'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRecipeRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the actual create recipe page
    router.replace('/recipe/create');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-textSecondary">Redirecting to recipe creation...</p>
      </div>
    </div>
  );
}

