'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api, type Session } from '@/lib/api-client';

export function DashboardClient({
  initialSessions,
  userEmail,
}: {
  initialSessions: Session[];
  userEmail: string;
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      const { session } = await api.sessions.create({ title: title.trim() });
      const created: Session = {
        id: session.id,
        title: session.title,
        bpm: session.bpm,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
      setSessions((prev) => [
        created,
        ...prev.filter((s) => s.id !== created.id),
      ]);
      setDialogOpen(false);
      setTitle('');
      toast.success('Session created');
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6E9] p-6 md:p-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2A5E]">Mic Buddy</h1>
          <p className="text-sm text-[#1E2A5E]/70">{userEmail}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E2A5E] hover:bg-[#1E2A5E]/90">
              + New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Session title (e.g. 'Midnight Moves')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                maxLength={100}
              />
              <DialogFooter>
                <Button type="submit" disabled={creating || !title.trim()}>
                  {creating ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {sessions.length === 0 ? (
        <EmptyState onNew={() => setDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <Link key={s.id} href={`/sessions/${s.id}`}>
              <Card className="p-5 hover:border-[#1E2A5E] transition-colors cursor-pointer">
                <h3 className="font-semibold text-[#1E2A5E] truncate">{s.title}</h3>
                <p className="text-xs text-[#1E2A5E]/60 mt-2">
                  {s.bpm ? `${Math.round(s.bpm)} BPM` : 'No BPM yet'} ·{' '}
                  {new Date(s.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[#1E2A5E]/70 mb-4">
        No sessions yet. Start your first one.
      </p>
      <Button onClick={onNew} className="bg-[#1E2A5E] hover:bg-[#1E2A5E]/90">
        + New Session
      </Button>
    </div>
  );
}
