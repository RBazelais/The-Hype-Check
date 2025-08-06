
// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			const { data: { session } } = await supabase.auth.getSession()
			setUser(session?.user ?? null)
			
			if (session?.user) {
				await fetchProfile(session.user.id)
			}
			
			setLoading(false)
		}

		getInitialSession()

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				setUser(session?.user ?? null)
				
				if (session?.user) {
					await fetchProfile(session.user.id)
				} else {
					setProfile(null)
				}
				
				setLoading(false)
			}
		)

		return () => subscription.unsubscribe()
	}, [])

	const fetchProfile = async (userId) => {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single()

			if (error && error.code !== 'PGRST116') {
				console.error('Error fetching profile:', error)
				return
			}

			setProfile(data)
		} catch (error) {
			console.error('Error fetching profile:', error)
		}
	}

	const signIn = async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		return { data, error }
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

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()
		return { error }
	}

	const updateProfile = async (updates) => {
		if (!user) return { error: 'No user logged in' }

		const { data, error } = await supabase
			.from('profiles')
			.upsert({ id: user.id, ...updates })
			.select()

		if (!error && data) {
			setProfile(data[0])
		}

		return { data, error }
	}

	const value = {
		user,
		profile,
		loading,
		signIn,
		signUp,
		signOut,
		updateProfile,
		fetchProfile
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}