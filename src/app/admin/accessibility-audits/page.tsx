import AccessibilityDashboard from '@/components/admin/AccessibilityDashboard';

export const metadata = {
  title: 'Audit Aksesibilitas - Maskom',
  description: 'Dashboard audit aksesibilitas dengan laporan kepatuhan WCAG 2.1 AA',
};

export default function AccessibilityAuditsPage() {
  return <AccessibilityDashboard />;
}
