'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

/**
 * BackButton component for navigation
 * 
 * @param href - Optional specific URL to navigate to. If not provided, uses browser back()
 * @param label - Button text label (default: "Back")
 * @param variant - Button variant style (default: "ghost")
 * @param className - Additional CSS classes
 * 
 * @example
 * // Navigate to specific page
 * <BackButton href="/dashboard" label="Back to Dashboard" />
 * 
 * @example
 * // Use browser history
 * <BackButton />
 */
export function BackButton({ 
  href, 
  label = 'Back',
  variant = 'ghost',
  className = ''
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
