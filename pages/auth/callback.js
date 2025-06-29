import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getSupabaseClient } from '../../utils/supabaseClient'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = getSupabaseClient()

            if (!supabase) {
                router.push('/')
                return
            }

            try {
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error)
                    router.push('/?auth_error=' + encodeURIComponent(error.message))
                    return
                }

                if (data.session) {
                    // Store user data and redirect to home
                    localStorage.setItem('user', JSON.stringify(data.session.user))
                    router.push('/?auth_success=true')
                } else {
                    router.push('/')
                }
            } catch (error) {
                console.error('Auth callback error:', error)
                router.push('/?auth_error=' + encodeURIComponent(error.message))
            }
        }

        handleAuthCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Procesando autenticación...</p>
            </div>
        </div>
    )
}
