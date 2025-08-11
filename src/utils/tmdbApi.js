import axios from 'axios'

const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

// Check if API key is a JWT token (Bearer) or regular API key
const isJWTToken = TMDB_API_KEY && TMDB_API_KEY.startsWith('eyJ')

const tmdbApi = axios.create({
	baseURL: TMDB_BASE_URL || 'https://api.themoviedb.org/3',
	...(isJWTToken ? {
		headers: {
			'Authorization': `Bearer ${TMDB_API_KEY}`,
			'Content-Type': 'application/json'
		}
	} : {
		params: {
			api_key: TMDB_API_KEY
		}
	})
})

export const searchMovies = async (query) => {
	try {
		const response = await tmdbApi.get('/search/movie', {
			params: {
				query: query,
				include_adult: false,
				language: 'en-US',
				page: 1
			}
		})
		
		return response.data.results || []
	} catch (error) {
		console.error('TMDB API error:', error)
		throw error
	}
}

export const getUpcomingMovies = async () => {
	try {
		const response = await tmdbApi.get('/movie/upcoming', {
			params: {
				language: 'en-US',
				page: 1
			}
		})
		
		return response.data.results || []
	} catch (error) {
		console.error('TMDB API error:', error)
		throw error
	}
}

export const getMovieDetails = async (movieId) => {
	try {
		const response = await tmdbApi.get(`/movie/${movieId}`, {
			params: {
				language: 'en-US',
				append_to_response: 'videos'
			}
		})
		return response.data
	} catch (error) {
		console.error('TMDB API error:', error)
		throw error
	}
}