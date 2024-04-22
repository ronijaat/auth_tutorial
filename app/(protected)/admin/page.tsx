'use client';

import { admin } from '@/actions/admin';
import { RoleGate } from '@/components/auth/role-gate';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserRole } from '@prisma/client';
import { toast } from 'sonner';

const AdminPage = () => {
  const onServerActionClick = async () => {
    await admin().then((response) => {
      if (response.success) {
        toast.success('You are alloweded');
      } else {
        toast.error('You are not alloweded');
      }
    });
  };

  const onAPiRouteClick = async () => {
    const response = await fetch('/api/admin');
    if (response.status === 200) {
      toast.success('You are alloweded');
    } else {
      toast.error('You are not alloweded');
    }
  };
  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">🔐 Admin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message="You are alloweded" />
        </RoleGate>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-xl font-semibold">Admin only Api Route</p>
          <Button onClick={onAPiRouteClick}>Click to test</Button>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-xl font-semibold">Admin only Server Action</p>
          <Button onClick={onServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
