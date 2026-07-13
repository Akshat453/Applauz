import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout
      title="HR Analytics"
      description="This area is reserved for future analytics once the backend overview APIs are available."
      searchPlaceholder="Search analytics..."
    >
      <EmptyState
        title="Analytics backend not available yet"
        description="The previous charts on this screen were static mock data. This page now intentionally waits for real analytics endpoints before showing company metrics."
        actionLabel="Open HR catalog"
        onAction={() => navigate('/admin/catalog')}
        secondaryLabel="Review redemptions"
        onSecondary={() => navigate('/admin/redemptions')}
      >
        <div className="rounded-full bg-primary/10 p-5 text-primary">
          <BarChart3 className="h-10 w-10" />
        </div>
      </EmptyState>
    </AppLayout>
  );
}

export default AdminDashboard;
