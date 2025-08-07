// src/context/AuthProvider.jsx
import { useEffect, useState, useRef } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { supabase } from '../utils/supabase'

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	// Track if initial auth check has been completed
	const initialAuthCheckComplete = useRef(false)
	// Track if profile fetch is in progress
	const profileFetchInProgress = useRef(false)

	useEffect(() => {
		console.log('🔒 AuthProvider initializing...')
		
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			console.log('🔒 Initial auth session:', session ? 'Session found' : 'No session')
			setUser(session?.user ?? null)
			if (session?.user) {
				fetchProfile(session.user.id)
			} else {
				initialAuthCheckComplete.current = true
				setLoading(false)
			}
		}).catch(error => {
			console.error('🔒 Error getting session:', error)
			initialAuthCheckComplete.current = true
			setLoading(false)
		})

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log('🔒 Auth state change:', event, session ? 'Session exists' : 'No session')
				
				// Don't set loading back to true if we've already completed initial auth
				// This prevents the loading cycle issue
				if (initialAuthCheckComplete.current && event !== 'SIGNED_OUT' && event !== 'SIGNED_IN') {
					console.log('🔒 Ignoring minor auth state change to prevent loading flicker')
				}
				
				setUser(session?.user ?? null)
				
				if (session?.user) {
					// Only fetch profile if we're not already fetching it and it's a significant event
					if (!profileFetchInProgress.current || event === 'SIGNED_IN') {
						await fetchProfile(session.user.id)
					}
				} else {
					setProfile(null)
					// Only set loading to false if we're not already logged in or this is a sign-out
					if (!initialAuthCheckComplete.current || event === 'SIGNED_OUT') {
						setLoading(false)
					}
				}
			}
		)

		return () => subscription.unsubscribe()
	}, [])

const fetchProfile = async (userId) => {
	if (!userId) {
		console.warn('🔒 fetchProfile called without userId')
		setLoading(false)
		return
	}
	
	// Mark that we're fetching a profile
	profileFetchInProgress.current = true
	
	try {
		console.log('🔒 Fetching profile for user ID:', userId)
		
		// Critical change: as soon as we have a user ID, let the app proceed
		// This prevents the loading cycle since we know the user is authenticated
		// Even if profile fetch fails, the app can still function
		setLoading(false)
		initialAuthCheckComplete.current = true
		
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single()

		if (error) {
			console.error('🔒 Profile fetch error:', error)
			
			// If the profile doesn't exist, create a default profile
			if (error.code === 'PGRST116') {
				console.log('🔒 Creating default profile for user')
				await createDefaultProfile(userId)
				return
			}
			
			setProfile(null)
		} else if (!data) {
			console.log('🔒 No profile data found, creating default profile')
			await createDefaultProfile(userId)
		} else {
			console.log('🔒 Profile loaded successfully')
			setProfile(data)
		}
	} catch (error) {
		console.error('🔒 Exception in fetchProfile:', error)
		setProfile(null)
	} finally {
		// Mark that profile fetch is complete
		profileFetchInProgress.current = false
	}
}

// Helper to create a default profile if one doesn't exist
const createDefaultProfile = async (userId) => {
	try {
		const userDetails = await supabase.auth.getUser()
		const email = userDetails?.data?.user?.email || ''
		const defaultName = email.split('@')[0] || 'User'
		
		const defaultProfile = {
			id: userId,
			display_name: defaultName,
			avatar_url: null,
			updated_at: new Date().toISOString()
		}
		
		const { data, error } = await supabase
			.from('profiles')
			.upsert(defaultProfile)
			.select()
			.single()
			
		if (error) {
			console.error('🔒 Error creating default profile:', error)
			setProfile(null)
		} else {
			console.log('🔒 Default profile created:', data)
			setProfile(data)
		}
	} catch (error) {
		console.error('🔒 Exception in createDefaultProfile:', error)
		setProfile(null)
	}
}

	const signUp = async (email, password, displayName) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: displayName
				}
			}
		})
		return { data, error }
	}

	const signIn = async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		return { data, error }
	}

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()
		return { error }
	}

	const updateProfile = async (updates) => {
		if (!user) return { error: 'No user logged in' }

		const { data, error } = await supabase
			.from('profiles')
			.update(updates)
			.eq('id', user.id)
			.select()
			.single()

		if (!error) {
			setProfile(data)
		}
		return { data, error }
	}

	const value = {
		user,
		profile,
		loading,
		signUp,
		signIn,
		signOut,
		updateProfile
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}