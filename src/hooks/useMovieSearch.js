// src/hooks/useMovieSearch.js
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchMovies, getMovieDetails } from '../utils/tmdbApi'
import { checkForDuplicates } from '../utils/duplicateDetection'
import toast from 'react-hot-toast'

// Hook for searching movies via TMDB API
export const useMovieSearch = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [isSearching, setIsSearching] = useState(false)

	const searchMoviesQuery = useQuery({
		queryKey: ['movie-search', searchQuery],
		queryFn: async () => {
			if (!searchQuery || searchQuery.length < 2) return []
			
			try {
				setIsSearching(true)
				const results = await searchMovies(searchQuery)
				return results.slice(0, 5) // Return top 5 results
			} catch (error) {
				toast.error('Failed to search movies')
				throw error
			} finally {
				setIsSearching(false)
			}
		},
		enabled: searchQuery.length >= 2,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	const performSearch = (query) => {
		setSearchQuery(query)
	}

	return {
		searchQuery,
		searchResults: searchMoviesQuery.data || [],
		isSearching: searchMoviesQuery.isLoading || isSearching,
		searchError: searchMoviesQuery.error,
		performSearch
	}
}

// Hook for getting movie details
export const useMovieDetails = (movieId) => {
	return useQuery({
		queryKey: ['movie-details', movieId],
		queryFn: async () => {
			const details = await getMovieDetails(movieId)
			return details
		},
		enabled: !!movieId,
		staleTime: 1000 * 60 * 30, // 30 minutes
	})
}

// Hook for checking duplicate posts
export const useDuplicateCheck = () => {
	const [duplicateWarning, setDuplicateWarning] = useState(null)
	const [isChecking, setIsChecking] = useState(false)

	const checkDuplicates = async (movieTitle) => {
		if (!movieTitle || movieTitle.length < 2) {
			setDuplicateWarning(null)
			return
		}

		setIsChecking(true)
		try {
			const duplicates = await checkForDuplicates(movieTitle)
			if (duplicates.length > 0) {
				setDuplicateWarning(duplicates[0])
			} else {
				setDuplicateWarning(null)
			}
		} catch (error) {
			console.error('Error checking duplicates:', error)
		} finally {
			setIsChecking(false)
		}
	}

	const clearDuplicateWarning = () => {
		setDuplicateWarning(null)
	}

	return {
		duplicateWarning,
		isChecking,
		checkDuplicates,
		clearDuplicateWarning
	}
}