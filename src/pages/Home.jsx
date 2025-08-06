import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpDown, Clock, ThumbsUp, Search, Calendar, Star } from 'lucide-react'
import { supabaseHelpers } from '../utils/supabase'
import { getUpcomingMovies } from '../utils/tmdbApi'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

const Home = () => {
	const [searchParams] = useSearchParams()
	const [sortBy, setSortBy] = useState('created_at')
	const searchQuery = searchParams.get('search') || ''

	// Fetch posts based on sort and search
	const { data: posts, isLoading, error } = useQuery({
		queryKey: ['posts', sortBy, searchQuery],
		queryFn: async () => {
			try {
				if (searchQuery) {
					const { data, error } = await supabaseHelpers.searchPosts(searchQuery)
					if (error) throw error
					return data
				} else {
					const { data, error } = await supabaseHelpers.getPosts(sortBy)
					if (error) throw error
					return data
				}
			} catch (error) {
				console.warn('Posts query failed (probably no database setup yet):', error)
				return [] // Return empty array instead of throwing
			}
		},
		retry: false // Don't retry failed queries
	})

	// Fetch upcoming movies from TMDB
	const { data: upcomingMovies, isLoading: moviesLoading, error: moviesError } = useQuery({
		queryKey: ['upcoming-movies'],
		queryFn: async () => {
			console.log('🎬 Fetching upcoming movies...')
			try {
				const movies = await getUpcomingMovies()
				console.log('🎬 Upcoming movies result:', movies)
				return movies
			} catch (error) {
				console.error('🎬 Upcoming movies error:', error)
				throw error
			}
		},
		staleTime: 1000 * 60 * 30, // Cache for 30 minutes
		enabled: !searchQuery, // Only fetch when not searching
		retry: 3,
		retryDelay: 1000
	})

	useEffect(() => {
		if (error) {
			toast.error('Failed to load posts')
		}
		if (moviesError) {
			console.error('🎬 Movies error:', moviesError)
			toast.error('Failed to load upcoming movies')
		}
	}, [error, moviesError])

	const handleSortChange = (newSort) => {
		setSortBy(newSort)
	}

	if (isLoading && !posts) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="bg-theater-red text-white px-12 py-8 border-5 border-black font-brutal text-3xl shadow-brutal">
					LOADING HYPE...
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header Section */}
			<div className="mb-8">
				<div className="bg-theater-gold text-black p-6 border-5 border-black shadow-brutal">
					<h1 className="font-brutal text-4xl mb-2">
						{searchQuery ? `SEARCH: "${searchQuery}"` : 'LATEST HYPE CHECKS'}
					</h1>
					<p className="font-mono text-lg">
						{searchQuery 
							? `Found ${posts?.length || 0} discussions`
							: 'Movie trailer discussions from the community'
						}
					</p>
				</div>
			</div>

			{/* Controls Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-concrete-800 border-5 border-black shadow-brutal">
				<div className="flex items-center gap-2">
					<ArrowUpDown size={20} className="text-theater-gold" />
					<span className="font-mono font-bold text-theater-gold text-lg">SORT BY:</span>
				</div>
				
				<div className="flex gap-3">
					<button
						onClick={() => handleSortChange('created_at')}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === 'created_at'
								? 'bg-street-yellow text-black shadow-brutal'
								: 'bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal'
						}`}
					>
						<Clock size={16} className="text-black" />
						<span>NEWEST</span>
					</button>
					
					<button
						onClick={() => handleSortChange('upvotes')}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === 'upvotes'
								? 'bg-street-yellow text-black shadow-brutal'
								: 'bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal'
						}`}
					>
						<ThumbsUp size={16} className="text-black" />
						<span>MOST HYPED</span>
					</button>
				</div>
			</div>

			{/* Posts Section */}
			{(() => {
				console.log('🔍 Posts debug:', { posts, postsLength: posts?.length, postsType: typeof posts, isLoading });
				return null;
			})()}
			{posts && Array.isArray(posts) && posts.length > 0 ? (
				<div className="space-y-6">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			) : (
				<div>
					{searchQuery ? (
						<div className="text-center py-12">
							<div className="bg-theater-red text-white border-5 border-black p-12 inline-block shadow-brutal">
								<Search size={64} className="mx-auto mb-6 text-street-yellow block" />
								<h3 className="font-brutal text-3xl mb-4">
									NO RESULTS FOUND
								</h3>
								<p className="font-mono text-xl text-concrete-200">
									Try searching for a different movie title
								</p>
							</div>
						</div>
					) : (
						<div>
							{/* No Posts - Show upcoming movies */}
							<div className="text-center py-8 mb-8">
								<div className="bg-theater-red text-white border-5 border-black p-8 inline-block shadow-brutal">
									<h3 className="font-brutal text-2xl mb-2">
										NO HYPE CHECKS YET
									</h3>
									<p className="font-mono text-lg text-concrete-200 mb-4">
										Check out these upcoming movies and start the hype!
									</p>
								</div>
							</div>

							{/* Upcoming Movies Section - DEBUGGING */}
							<div>
								<div className="mb-6">
									<h2 className="font-brutal text-3xl text-concrete-900 mb-2">
										UPCOMING MOVIES
									</h2>
									<p className="font-mono text-concrete-600">
										Get ready for the hype! Create the first review for any of these upcoming films.
									</p>
								</div>

								{(() => {
									console.log('🎬 Debug - upcomingMovies:', upcomingMovies, 'moviesLoading:', moviesLoading, 'moviesError:', moviesError);
									console.log('🎬 Debug - upcomingMovies length:', upcomingMovies?.length);
									console.log('🎬 Debug - Will render movies?', !moviesLoading && upcomingMovies && upcomingMovies.length > 0);
									console.log('🎬 Debug - moviesLoading type:', typeof moviesLoading, moviesLoading);
									console.log('🎬 Debug - upcomingMovies type:', typeof upcomingMovies, Array.isArray(upcomingMovies));
									return null;
								})()}

								{/* FORCE RENDER FOR DEBUGGING */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ backgroundColor: 'red', minHeight: '200px', border: '5px solid black' }}>
									<div style={{ backgroundColor: 'blue', color: 'yellow', padding: '20px', fontSize: '16px', fontWeight: 'bold' }}>
										DEBUG: Force render - moviesLoading: {String(moviesLoading)}, movies: {upcomingMovies ? upcomingMovies.length : 'null/undefined'}, error: {String(!!moviesError)}
									</div>
									{upcomingMovies && upcomingMovies.map && upcomingMovies.slice(0, 3).map((movie) => (
										<div key={movie.id} style={{ backgroundColor: 'green', color: 'yellow', padding: '10px', fontSize: '14px', fontWeight: 'bold' }}>
											{movie.title}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Home