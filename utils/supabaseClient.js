import { createClient } from '@supabase/supabase-js'

let supabase = null

export function getSupabaseClient() {
    if (!supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase configuration not found. Social logins will not be available.')
            return null
        }

        supabase = createClient(supabaseUrl, supabaseAnonKey)
    }

    return supabase
}

export async function signInWithProvider(provider) {
    const supabase = getSupabaseClient()
    if (!supabase) {
        throw new Error('Supabase client not configured')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    })

    if (error) {
        throw error
    }

    return data
}

export async function getSession() {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function signOut() {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) {
        throw error
    }
}
