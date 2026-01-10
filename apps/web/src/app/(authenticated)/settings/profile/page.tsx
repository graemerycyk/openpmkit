'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-20 w-20 rounded-full"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cobalt-100 text-cobalt-600">
                <User className="h-10 w-10" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{session?.user?.name || 'User'}</h3>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <Badge variant="cobalt" className="mt-2">
                Free Plan
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Account Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session?.user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">Product Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">January 2026</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your pmkit experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your jobs and artifacts
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
