// src/context/AuthProvider.jsx
import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { supabase } from '../utils/supabase'

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null)
			if (session?.user) {
				fetchProfile(session.user.id)
			} else {
				setLoading(false)
			}
		})

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				setUser(session?.user ?? null)
				if (session?.user) {
					await fetchProfile(session.user.id)
				} else {
					setProfile(null)
					setLoading(false)
				}
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

			if (error) throw error
			setProfile(data)
		} catch (error) {
			console.error('Error fetching profile:', error)
		} finally {
			setLoading(false)
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