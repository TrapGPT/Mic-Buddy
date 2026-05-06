'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { api, type Session } from '@/lib/api-client';

export function SessionDetailClient({ session }: { session: Session }) {
  const router = useRouter();
  const [title, setTitle] = useState(session.title);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setTitle(session.title);
    setEditing(false);
  }, [session.id]);

  useEffect(() => {
    if (!editing) {
      setTitle(session.title);
    }
  }, [session.title, session.updatedAt, editing]);

  async function saveTitle() {
    if (title.trim() === session.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await api.sessions.update(session.id, { title: title.trim() });
      toast.success('Renamed');
      setEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
      setTitle(session.title);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.sessions.delete(session.id);
      toast.success('Session deleted');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6E9]">
      <header className="border-b border-[#1E2A5E]/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#1E2A5E]/70 hover:text-[#1E2A5E]">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-64"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') {
                    setTitle(session.title);
                    setEditing(false);
                  }
                }}
              />
              <Button onClick={saveTitle} disabled={saving} size="sm">
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-lg font-semibold text-[#1E2A5E] hover:underline"
            >
              {session.title}
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </header>

      <main className="p-6 md:p-10">
        {/* Audio upload + player lands here on Day 3 */}
        <div className="rounded-lg border-2 border-dashed border-[#1E2A5E]/20 p-12 text-center">
          <p className="text-[#1E2A5E]/60">Beat upload and bar counter coming Day 3.</p>
        </div>
      </main>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this session?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#1E2A5E]/70">
            This can&apos;t be undone. All markers, notes, and recordings for this session will be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
