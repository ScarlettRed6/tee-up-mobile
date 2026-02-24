import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function UserHome() {
  const { user, logout } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Card className="w-full max-w-md border-0 shadow-[var(--shadow-modal)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-xl font-bold text-white">T</span>
            </div>
          </div>
          <CardTitle className="text-xl">You're signed in</CardTitle>
          <CardDescription>
            Hi, {user?.name ?? 'there'}! The full dashboard is for administrators. You can sign out below or use the TeeUp app to browse and sell.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
