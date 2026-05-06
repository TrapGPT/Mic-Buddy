'use client';

import * as React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import { Loader2, Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMicMonitor } from '@/hooks/use-mic-monitor';
import { cn } from '@/lib/utils';

const DEFAULT_DEVICE_VALUE = '__default__';

export function MicBuddyDashboard() {
  const [muted, setMuted] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const {
    level,
    active,
    error,
    inputs,
    selectedDeviceId,
    selectDevice,
    start,
    stop,
  } = useMicMonitor();

  const selectedLabel = React.useMemo(() => {
    if (!selectedDeviceId) return 'System default';
    return (
      inputs.find((i) => i.deviceId === selectedDeviceId)?.label ??
      'Saved microphone'
    );
  }, [inputs, selectedDeviceId]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await start();
    } finally {
      setStarting(false);
    }
  };

  const meterLevel = muted || !active ? 0 : level;
  const displayLevel = muted ? null : Math.round(meterLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/35">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mic className="h-5 w-5" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">MicBuddy</p>
              <p className="text-xs text-muted-foreground">Local mic companion</p>
            </div>
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
              {active ? 'Live mic' : 'Local'}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" aria-hidden />
            Pick an input, meter live audio — stays local in your browser
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Hear your mic before they do
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground md:mx-0 md:text-lg">
            MicBuddy is your place for levels, mute sanity checks, and quick device
            context—built so streamers and callers stop guessing how they sound.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Volume2 className="h-5 w-5 opacity-80" aria-hidden />
                  Live monitor
                </CardTitle>
                <CardDescription>
                  Choose an input below, then enable capture. Labels appear after the
                  first permission grant; your choice is remembered on this device.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium">Mute</span>
                <Switch
                  checked={muted}
                  onCheckedChange={setMuted}
                  aria-label="Hide meter (does not mute your OS microphone)"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mic-input">Microphone</Label>
                <Select
                  value={
                    selectedDeviceId ? selectedDeviceId : DEFAULT_DEVICE_VALUE
                  }
                  onValueChange={(value) =>
                    selectDevice(value === DEFAULT_DEVICE_VALUE ? '' : value)
                  }
                  disabled={starting}
                >
                  <SelectTrigger id="mic-input" className="max-w-md">
                    <SelectValue placeholder="Choose microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_DEVICE_VALUE}>
                      System default
                    </SelectItem>
                    {inputs.map((d) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Plugged or unplugged a mic? The list refreshes automatically.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStart}
                  disabled={starting || active}
                >
                  {starting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Starting…
                    </>
                  ) : (
                    'Enable microphone'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => stop()}
                  disabled={!active}
                >
                  Stop
                </Button>
              </div>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Input level
                  </p>
                  <p
                    className={cn(
                      'font-mono text-4xl font-semibold tabular-nums tracking-tight',
                      (muted || !active) && 'text-muted-foreground'
                    )}
                    aria-live="polite"
                  >
                    {!active ? '—' : muted ? '—' : `${displayLevel}%`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {muted || !active ? (
                    <MicOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Mic className="h-4 w-4" aria-hidden />
                  )}
                  <span>
                    {!active
                      ? 'Mic idle — enable to meter'
                      : muted
                        ? 'Meter hidden'
                        : 'Live signal'}
                  </span>
                </div>
              </div>
              <Progress value={meterLevel} className="h-3" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="max-w-[220px] truncate">
                  {active ? selectedLabel : 'No capture active'}
                </Badge>
                <Badge variant="outline">Browser-only · no upload</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next UI beats</CardTitle>
              <CardDescription>
                Live metering is in — keep iterating from here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-foreground">·</span>
                  Noise gate / EQ presets exposed as simple toggles
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">·</span>
                  Tray-friendly compact mode for always-on monitoring
                </li>
              </ul>
              <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Input selection uses{' '}
                <code className="rounded bg-muted px-1">localStorage</code> on this
                browser only.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Levels first',
              body: 'Big, calm metering so clipping is obvious at a glance.',
            },
            {
              title: 'Mute you trust',
              body: 'Hardware-feeling mute that mirrors what callers hear.',
            },
            {
              title: 'Device clarity',
              body: 'Know which mic is live—no more wrong-input mysteries.',
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.body}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
