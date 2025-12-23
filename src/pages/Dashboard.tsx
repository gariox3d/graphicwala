import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          <div className="bg-card rounded-xl shadow-soft p-6">
            <h2 className="font-semibold text-lg mb-4">Profile Information</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="font-medium text-foreground">Name:</span> {profile?.full_name || 'Not set'}</p>
              <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
              <p><span className="font-medium text-foreground">Phone:</span> {profile?.phone || 'Not set'}</p>
              <p><span className="font-medium text-foreground">Address:</span> {profile?.address || 'Not set'}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
