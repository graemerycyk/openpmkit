'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Users } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Configure how completed jobs and artifacts are delivered to you.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
              <Mail className="h-5 w-5 text-cobalt-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Email</CardTitle>
              <CardDescription>Receive notifications via email</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Job Completion Emails</p>
              <p className="text-sm text-muted-foreground">
                Get notified when your agents complete their runs
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slack Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Slack</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription className="sr-only">Receive notifications in Slack</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60">
            <div>
              <p className="font-medium">Slack Channel Delivery</p>
              <p className="text-sm text-muted-foreground">
                Send completed briefs and artifacts to a Slack channel
              </p>
            </div>
            <Button variant="outline" disabled>
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Microsoft Teams Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Microsoft Teams</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription className="sr-only">Receive notifications in Teams</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60">
            <div>
              <p className="font-medium">Teams Channel Delivery</p>
              <p className="text-sm text-muted-foreground">
                Send completed briefs and artifacts to a Teams channel
              </p>
            </div>
            <Button variant="outline" disabled>
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
