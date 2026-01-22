import React from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PersonalDashboard from '@/components/dashboard/PersonalDashboard'
import { Metadata } from 'next'

export const runtime = 'nodejs'

export const metadata: Metadata = {
    title: 'Dashboard Pribadi - Maskom',
    description: 'Kelola pengalaman bacaan, bookmark, dan preferensi Anda',
}

const DashboardPage: React.FC = () => {
    return (
        <ProtectedRoute>
            <PersonalDashboard />
        </ProtectedRoute>
    )
}

export default DashboardPage