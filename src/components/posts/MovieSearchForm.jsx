// src/components/posts/MovieSearchForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Search, Plus, Film, ExternalLink, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseHelpers } from '../../utils/supabase.js'
import { searchMovies } from '../../utils/tmdbApi.js'
import { checkForDuplicates } from '../../utils/duplicateDetection.js'
import toast from 'react-hot-toast'

const MovieSearchForm = ({ onPostCreated }) => {
	const { user } = useAuth()
	const [searchResults, setSearchResults] = useState([])
	const [selectedMovie, setSelectedMovie] = useState(null)
	const [isSearching, setIsSearching] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [duplicateWarning, setDuplicateWarning] = useState(null)
	
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm()

	// Remove unused searchQuery variable since we handle search in onChange

	const handleMovieSearch = async (query) => {
		if (!query || query.length < 2) {
			console.log('🚫 Search query too short or empty:', { query, length: query?.length })
			setSearchResults([])
			return
		}

		console.log('🔎 Starting movie search for:', query)
		setIsSearching(true)
		try {
			const results = await searchMovies(query)
			console.log('✅ Search results received in component:', {
				results,
				resultsType: typeof results,
				isArray: Array.isArray(results),
				length: results?.length
			})
			
			if (results && Array.isArray(results) && results.length > 0) {
				const topResults = results.slice(0, 5)
				console.log('🎬 Setting top 5 search results:', topResults)
				setSearchResults(topResults)
			} else {
				console.log('❌ No valid results found, setting empty array')
				setSearchResults([])
			}
		} catch (error) {
			console.error('💥 Movie search error in component:', error)
			toast.error('Failed to search movies')
			setSearchResults([])
		} finally {
			console.log('🏁 Search completed, setting isSearching to false')
			setIsSearching(false)
		}
	}

	const selectMovie = async (movie) => {
		setSelectedMovie(movie)
		setSearchResults([])
		setValue('searchQuery', movie.title)

		// Check for duplicates
		const duplicates = await checkForDuplicates(movie.title)
		if (duplicates.length > 0) {
			setDuplicateWarning(duplicates[0])
		} else {
			setDuplicateWarning(null)
		}
	}

	const onSubmit = async (data) => {
		if (!selectedMovie) {
			toast.error('Please select a movie from search results')
			return
		}

		// Check if user exists (for testing purposes)
		if (!user) {
			toast.success('Movie search is working! (Test mode - no user logged in)')
			console.log('Would create post with data:', {
				movie: selectedMovie,
				formData: data
			})
			return
		}

		setIsLoading(true)
		try {
			const postData = {
				user_id: user.id,
				title: data.title || `${selectedMovie.title} - First Impressions`,
				content: data.content || null,
				image_url: selectedMovie.poster_path 
					? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` 
					: null,
				trailer_url: data.trailerUrl || null,
				movie_title: selectedMovie.title,
				upvotes: 0
			}

			const { data: newPost, error } = await supabaseHelpers.createPost(postData)
			
			if (error) {
				toast.error('Failed to create post')
				console.error('Error creating post:', error)
			} else {
				toast.success('Hype check created!')
				onPostCreated?.(newPost[0].id)
			}
		} catch (error) {
			toast.error('Something went wrong')
			console.error('Error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Movie Search */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					SEARCH FOR MOVIE *
				</label>
				<div className="relative">
					<input
						type="text"
						{...register('searchQuery', {
							required: 'Please search and select a movie'
						})}
						onChange={(e) => handleMovieSearch(e.target.value)}
						className="w-full px-4 py-3 pr-12 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
						placeholder="Start typing a movie title..."
					/>
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						{isSearching ? (
							<div className="animate-spin">⟳</div>
						) : (
							<Search size={18} className="text-concrete-600" />
						)}
					</div>
				</div>
				{errors.searchQuery && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.searchQuery.message}
					</p>
				)}

				{/* Search Results */}
				{searchResults.length > 0 && (
					<div className="mt-2 border-3 border-black bg-white max-h-64 overflow-y-auto">
						{searchResults.map((movie) => (
							<button
								key={movie.id}
								type="button"
								onClick={() => selectMovie(movie)}
								className="w-full flex items-center gap-3 p-3 hover:bg-concrete-100 transition-colors text-left border-b border-concrete-200 last:border-b-0"
							>
								{movie.poster_path && (
									<img
										src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
										alt={movie.title}
										className="w-12 h-18 object-cover border border-black flex-shrink-0"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h4 className="font-mono font-bold text-concrete-900 truncate">
										{movie.title}
									</h4>
									<p className="font-mono text-xs text-concrete-600">
										{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
									</p>
									{movie.overview && (
										<p className="font-mono text-xs text-concrete-500 mt-1 line-clamp-2">
											{movie.overview.substring(0, 100)}...
										</p>
									)}
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Selected Movie Display */}
			{selectedMovie && (
				<div className="p-4 bg-theater-gold border-3 border-black">
					<div className="flex items-center gap-2 mb-2">
						<Film size={20} className="text-black" />
						<span className="font-mono font-bold text-black">SELECTED MOVIE</span>
					</div>
					<div className="flex items-start gap-3">
						{selectedMovie.poster_path && (
							<img
								src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`}
								alt={selectedMovie.title}
								className="w-16 h-24 object-cover border-3 border-black"
							/>
						)}
						<div>
							<h3 className="font-brutal text-lg text-black">{selectedMovie.title}</h3>
							<p className="font-mono text-sm text-concrete-800">
								{selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'TBA'}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Duplicate Warning */}
			{duplicateWarning && (
				<div className="p-3 bg-street-yellow border-3 border-black">
					<div className="flex items-start gap-2">
						<AlertTriangle size={20} className="text-theater-red flex-shrink-0 mt-0.5" />
						<div>
							<p className="font-mono font-bold text-black text-sm mb-1">
								DISCUSSION ALREADY EXISTS
							</p>
							<p className="font-mono text-xs text-concrete-800 mb-2">
								Someone already started a discussion about this movie
							</p>
							<a
								href={`/post/${duplicateWarning.id}`}
								className="inline-flex items-center gap-1 text-xs font-mono font-bold text-theater-red hover:text-theater-velvet"
							>
								<ExternalLink size={12} />
								JOIN EXISTING DISCUSSION
							</a>
						</div>
					</div>
				</div>
			)}

			{/* Trailer URL (Optional) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					TRAILER URL (OPTIONAL)
				</label>
				<input
					type="url"
					{...register('trailerUrl')}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder="https://www.youtube.com/watch?v=..."
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Add a specific trailer link if you have one
				</p>
			</div>

			{/* Custom Title (Optional) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					CUSTOM POST TITLE (OPTIONAL)
				</label>
				<input
					type="text"
					{...register('title')}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder={selectedMovie ? `${selectedMovie.title} - Your take here` : "Leave blank for auto-generated title"}
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Leave blank to auto-generate from movie title
				</p>
			</div>

			{/* Your Reaction (Optional) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					YOUR REACTION (OPTIONAL)
				</label>
				<textarea
					{...register('content')}
					rows={4}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all resize-none"
					placeholder="What do you think about this movie? Excited for the trailer? Share your expectations..."
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Your thoughts and expectations about the movie
				</p>
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading || !selectedMovie}
				className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-theater-red hover:bg-theater-gold text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					'CREATING HYPE CHECK...'
				) : (
					<>
						<Plus size={20} />
						{user ? 'CREATE HYPE CHECK' : 'TEST MOVIE SEARCH'}
					</>
				)}
			</button>
		</form>
	)
}

export default MovieSearchForm