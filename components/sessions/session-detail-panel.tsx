'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SessionRow = {
  id: string;
  title: string;
  bpm: number | null;
  createdAt: string;
  updatedAt: string;
};

export function SessionDetailPanel({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = React.useState<SessionRow | null>(null);
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}`);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data?.error?.message ??
        (res.status === 404
          ? 'Session not found'
          : res.status === 401
            ? 'Not signed in'
            : 'Failed to load session');
      setError(message);
      setSession(null);
      setLoading(false);
      return;
    }

    const row = data?.session as SessionRow | undefined;
    if (row) {
      setSession(row);
      setTitle(row.title);
    } else {
      setError('Malformed response');
      setSession(null);
    }
    setLoading(false);
  }, [sessionId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSaveTitle = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message ?? 'Could not update title');
        return;
      }

      const row = data?.session as SessionRow | undefined;
      if (row) {
        setSession(row);
        setTitle(row.title);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error?.message ?? 'Could not delete session');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading session…</p>
    );
  }

  if (!session) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive" role="alert">
          {error ?? 'Session unavailable'}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">← Dashboard</Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Session</h2>
        <p className="text-sm text-muted-foreground">
          {session.bpm != null ? `${session.bpm} BPM` : 'No BPM set'}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <label className="text-sm font-medium" htmlFor="session-title">
          Title
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="session-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="sm:flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSaveTitle}
            disabled={
              saving ||
              title.trim().length === 0 ||
              title.trim() === session.title
            }
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm" disabled={deleting}>
              Delete session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this session?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. All session data for this record will be
                removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
