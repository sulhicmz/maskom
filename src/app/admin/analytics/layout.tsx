import React from 'react'
import Footer from '@/layouts/FooterTwo'
import Menu from '@/layouts/Menu'

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
