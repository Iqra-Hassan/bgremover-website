'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessions } from './use-sessions';
import { UAParser } from 'ua-parser-js';
import { Loader, XIcon } from 'lucide-react';
import { Session } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const UserSessions = ({ currentSession }: { currentSession?: Session['session'] }) => {
  const { sessions, isLoading, isLoggingOut, revokeSession } = useSessions();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          View and manage your active sessions across devices. You can log out of any session to
          secure your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions
              .sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((session) => {
                const parser = new UAParser(session.userAgent || '');
                const device = parser.getDevice();
                const os = parser.getOS();
                return (
                  <div
                    key={session.token}
                    className="flex max-h-[300px] items-center justify-between overflow-y-auto rounded-lg border p-3"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <p className="font-semibold">{device.vendor || 'Unknown Device'}</p>
                        {currentSession?.token === session.token && (
                          <span className="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 text-[10px] font-semibold">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {device.model || 'Unknown Model'} - {os.name} {os.version}
                      </p>
                    </div>
                    {currentSession?.token !== session.token && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        disabled={isLoggingOut}
                        onClick={() => revokeSession(session.token)}
                      >
                        <XIcon />
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <p>No active sessions found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSessions;
