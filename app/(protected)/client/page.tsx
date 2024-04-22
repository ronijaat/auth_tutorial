'use client';

import { UserInfo } from '@/components/user-info';
import { useCurrentUser } from '@/hooks/use-current-user';

const Server = () => {
  const user = useCurrentUser();
  return <UserInfo user={user} label="📳Client component" />;
};

export default Server;
