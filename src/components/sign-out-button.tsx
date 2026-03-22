'use client';

import { DropdownMenuItem } from '@/components/ui';

interface SignOutButtonProps {
  signOutAction: () => Promise<void>;
}

export function SignOutButton({ signOutAction }: SignOutButtonProps) {
  return (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      className="p-0"
    >
      <form action={signOutAction} className="w-full">
        <button type="submit" className="w-full text-left px-2 py-1.5">
          Sign out
        </button>
      </form>
    </DropdownMenuItem>
  );
}
