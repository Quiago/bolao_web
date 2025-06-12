import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { initGA, logPageView, GA_TRACKING_ID } from '../utils/analytics'
import { ProductProvider } from '../contexts/ProductContext'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Initialize Google Analytics
    if (GA_TRACKING_ID) {
      initGA()
    }
  }, [])

  useEffect(() => {
    // Log page views on route changes
    const handleRouteChange = (url) => {
      if (GA_TRACKING_ID) {
        logPageView(url)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <ProductProvider>
      <Component {...pageProps} />
    </ProductProvider>
  )
}

export default MyApp