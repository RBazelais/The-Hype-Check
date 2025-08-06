// src/hooks/useSupabase.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

// Hook for managing Supabase connection status
export const useSupabaseConnection = () => {
	const [isConnected, setIsConnected] = useState(false)
	const [connectionError, setConnectionError] = useState(null)

	useEffect(() => {
		const checkConnection = async () => {
			try {
				const { error } = await supabase
					.from('profiles')
					.select('id')
					.limit(1)
				
				if (error) {
					setConnectionError(error.message)
					setIsConnected(false)
				} else {
					setIsConnected(true)
					setConnectionError(null)
				}
			} catch (error) {
				setConnectionError(error.message)
				setIsConnected(false)
			}
		}

		checkConnection()
	}, [])

	return { isConnected, connectionError }
}

// Hook for real-time subscriptions
export const useRealtimeSubscription = (table, callback) => {
	useEffect(() => {
		const subscription = supabase
			.channel(`public:${table}`)
			.on('postgres_changes', 
				{ event: '*', schema: 'public', table }, 
				callback
			)
			.subscribe()

		return () => {
			subscription.unsubscribe()
		}
	}, [table, callback])
}

// Hook for handling Supabase storage operations
export const useSupabaseStorage = (bucket) => {
	const [isUploading, setIsUploading] = useState(false)
	const [uploadError, setUploadError] = useState(null)

	const uploadFile = async (file, path) => {
		setIsUploading(true)
		setUploadError(null)

		try {
			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(path, file)

			if (error) throw error

			const { data: { publicUrl } } = supabase.storage
				.from(bucket)
				.getPublicUrl(path)

			return { data, publicUrl }
		} catch (error) {
			setUploadError(error.message)
			throw error
		} finally {
			setIsUploading(false)
		}
	}

	const deleteFile = async (path) => {
		try {
			const { error } = await supabase.storage
				.from(bucket)
				.remove([path])

			if (error) throw error
		} catch (error) {
			setUploadError(error.message)
			throw error
		}
	}

	return {
		uploadFile,
		deleteFile,
		isUploading,
		uploadError
	}
}

// Hook for database operations with error handling
export const useSupabaseQuery = () => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const execute = async (queryFn) => {
		setLoading(true)
		setError(null)

		try {
			const result = await queryFn()
			return result
		} catch (err) {
			setError(err.message)
			throw err
		} finally {
			setLoading(false)
		}
	}

	return { execute, loading, error }
}