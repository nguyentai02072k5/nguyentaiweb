'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLoginAction, type LoginState } from './actions';

const initialState: LoginState = { ok: false };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-text-secondary text-sm font-medium">
          Mật khẩu admin
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          placeholder="Nhập mật khẩu của owner"
          className="h-11 rounded-lg bg-white/80 px-4 text-base"
        />
      </div>

      {state.message && !state.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <SubmitButton />

      <p className="text-text-tertiary text-center text-xs leading-relaxed">
        Trang dành riêng cho chủ sở hữu. Mọi truy cập đều được ghi log phía server.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="h-11 w-full rounded-lg bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md transition hover:opacity-95 disabled:opacity-70"
    >
      <Lock className="h-4 w-4" aria-hidden />
      {pending ? 'Đang xác thực…' : 'Vào dashboard'}
    </Button>
  );
}
