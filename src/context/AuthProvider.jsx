// src/context/AuthProvider.jsx
import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { supabase } from '../utils/supabase'

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Simple fetchProfile function
		const fetchProfile = async (userId) => {
			if (!userId) {
				console.warn('🔒 fetchProfile called without userId')
				setLoading(false)
				return
			}
			
			try {
				console.log('🔒 Fetching profile for user ID:', userId)
				
				// Allow the app to proceed while we fetch profile
				setLoading(false)
				
				// Get the profile from the database
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', userId)
					.single()

				if (error) {
					console.error('🔒 Profile fetch error:', error)
					
					// If the profile doesn't exist, create a default one
					if (error.code === 'PGRST116') {
						console.log('🔒 Profile not found, creating default profile')
						await createDefaultProfile(userId)
					}
				} else if (data) {
					console.log('🔒 Profile loaded successfully:', data.display_name)
					setProfile(data)
				} else {
					console.log('🔒 No profile data found, creating default profile')
					await createDefaultProfile(userId)
				}
			} catch (error) {
				console.error('🔒 Exception in fetchProfile:', error)
				// Don't fail completely - create a default profile
				await createDefaultProfile(userId)
			}
		}
		
// Helper to create a default profile if one doesn't exist
const createDefaultProfile = async (userId) => {
	try {
		// Get user info
		const { data: userData } = await supabase.auth.getUser();
		
		// Get display name from metadata or use default
		let displayName = userData?.user?.user_metadata?.display_name || 'Anonymous User';
		
		// Create a simple profile object
		const profileData = {
			id: userId,
			display_name: displayName,
			avatar_url: userData?.user?.user_metadata?.avatar_url || null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		console.log('🔒 Creating profile with display name:', displayName);
		
		// Try to save to database
		const { data, error } = await supabase
			.from('profiles')
			.upsert(profileData)
			.select()
			.single();
					
		// Update profile state regardless of success
		setProfile(error ? profileData : data);
		
		if (error) {
			console.error('🔒 Error creating default profile:', error);
		} else {
			console.log('🔒 Default profile created successfully');
		}
	} catch (error) {
		console.error('🔒 Exception in createDefaultProfile:', error);
		// Create a minimal profile as fallback
		setProfile({
			id: userId,
			display_name: 'Anonymous User',
			created_at: new Date().toISOString()
		});
	}
}
		
		// Initialize auth and set up listeners in a single function
		const setupAuth = async () => {
			console.log('🔒 Setting up authentication...')
			
			try {
				// Get initial session
				const { data } = await supabase.auth.getSession()
				const { session } = data
				
				if (session?.user) {
					console.log('🔒 Initial user found:', session.user.id)
					setUser(session.user)
					await fetchProfile(session.user.id)
				} else {
					console.log('🔒 No initial user found')
					setUser(null)
					setLoading(false)
				}
			} catch (error) {
				console.error('🔒 Error in initial auth:', error)
				setUser(null)
				setLoading(false)
			}
			
			// Set up auth state change listener
			return supabase.auth.onAuthStateChange(async (event, session) => {
				console.log('🔒 Auth state change:', event)
				
				if (session?.user) {
					// We have a user
					console.log('🔒 User session detected:', session.user.id)
					setUser(session.user)
					
					// Fetch profile when user signs in
					if (event === 'SIGNED_IN') {
						await fetchProfile(session.user.id)
					}
				} else {
					// No user - clear all state
					console.log('🔒 No user session')
					setUser(null)
					setProfile(null)
					setLoading(false)
				}
			})
		}
		
		// Set up auth and return the cleanup function
		let subscription;
		setupAuth().then(result => {
			subscription = result;
		});

		// Return cleanup function
		return () => {
			subscription?.unsubscribe?.();
		}
	}, [])



	const signUp = async (email, password, displayName) => {
		console.log('🔒 Signing up with display name:', displayName)
		
		try {
			// Sign up with user metadata including display name
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						display_name: displayName
					}
				}
			})
			
			if (error) {
				console.error('🔒 Sign up error:', error)
				return { data, error }
			}
			
			// The profile should be created by the database trigger
			// But we'll ensure it exists
			if (data?.user) {
				try {
					// Create profile record
					await supabase.from('profiles').upsert({
						id: data.user.id,
						display_name: displayName,
						updated_at: new Date().toISOString()
					})
				} catch (err) {
					console.error('🔒 Error creating profile:', err)
					// Non-fatal, continue with signup
				}
			}
			
			return { data, error: null }
		} catch (err) {
			console.error('🔒 Sign up exception:', err)
			return { data: null, error: err }
		}
	}

	const signIn = async (email, password) => {
		console.log('🔒 Signing in with email:', email)
		
		try {
			// Simple sign in approach
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})
			
			if (error) {
				console.error('🔒 Sign in error:', error)
				return { data, error }
			}
			
			// Update user state directly
			setUser(data?.user || null)
			
			return { data, error: null }
		} catch (err) {
			console.error('🔒 Sign in exception:', err)
			return { data: null, error: err }
		}
	}

	const signOut = async () => {
		console.log('🔒 Signing out user...')
		
		try {
			// Clear our local application state first for immediate UI feedback
			setUser(null)
			setProfile(null)
			
			// Simple approach: try global signout first
			try {
				await supabase.auth.signOut({ scope: 'global' })
				console.log('🔒 Global signout succeeded')
			} catch (e) {
				console.error('🔒 Global signout failed:', e)
				// Try regular signout as fallback
				await supabase.auth.signOut()
			}
			
			// Clear auth-related localStorage items
			try {
				Object.keys(localStorage).forEach(key => {
					if (key?.includes('supabase') || key?.includes('auth')) {
						localStorage.removeItem(key)
					}
				})
			} catch (e) {
				console.error('🔒 Error clearing localStorage:', e)
			}
			
			// Let the browser reload the page after sign out
			window.location.href = '/'
			
			return { error: null }
		} catch (error) {
			console.error('🔒 Sign out failed:', error)
			// Force reload as fallback
			window.location.href = '/'
			return { error }
		}
	}

	const updateProfile = async (updates) => {
		if (!user) return { error: 'No user logged in' }

		try {
			const { data, error } = await supabase
				.from('profiles')
				.update(updates)
				.eq('id', user.id)
				.select()
				.single()

			if (error) {
				console.error('🔒 Update profile error:', error)
				return { error }
			}
			
			// Update local profile state
			setProfile(data)
			return { data, error: null }
		} catch (err) {
			console.error('🔒 Update profile exception:', err)
			return { error: err }
		}
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