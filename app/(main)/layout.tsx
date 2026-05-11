import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SubscribeButton from '@/components/notifications/SubscribeButton'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">{children}</main>
      <Footer />
      {/* Floating "Get Alerts" button — mobile only, hides once subscribed */}
      <SubscribeButton variant="float" />
    </>
  )
}
