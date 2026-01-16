import React from 'react'
import Footer from '@/layouts/footers/FooterTwo'
import Menu from '@/layouts/headers/Menu/NavMenu'

export default function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Menu />
      <main>{children}</main>
      <Footer />
    </>
  )
}
