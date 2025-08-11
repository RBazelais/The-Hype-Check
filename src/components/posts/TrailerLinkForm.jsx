import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, AlertTriangle, ExternalLink } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCreatePost } from '../../hooks/usePosts'
import { generatePostTitle } from "../../utils/titleUtils.js"
import { checkForDuplicates } from '../../utils/duplicateDetection.js'
import toast from 'react-hot-toast'

const TrailerLinkForm = ({ onPostCreated }) => {
	const { user } = useAuth()
	const createPostMutation = useCreatePost()
	const [isLoading, setIsLoading] = useState(false)
	const [duplicateWarning, setDuplicateWarning] = useState(null)
	
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm()

	const trailerUrl = watch('trailerUrl')
	const movieTitle = watch('movieTitle')

	// Check for duplicates when movie title changes
	const handleTitleChange = async (title) => {
		if (title && title.length > 2) {
			try {
				const duplicates = await checkForDuplicates(title)
				if (duplicates.length > 0) {
					setDuplicateWarning(duplicates[0])
				} else {
					setDuplicateWarning(null)
				}
			} catch (error) {
				console.error('Duplicate check exception:', error)
				setDuplicateWarning(null)
			}
		} else {
			setDuplicateWarning(null)
		}
	}

	const onSubmit = async (data) => {
		// Validate required fields
		if (!data.movieTitle || !data.movieTitle.trim()) {
			toast.error("Movie title is required");
			return;
		}

		if (!data.content || !data.content.trim()) {
			toast.error("Please provide your reaction to the trailer");
			return;
		}

		if (!data.trailerUrl || !data.trailerUrl.trim()) {
			toast.error("Trailer URL is required");
			return;
		}

		// Check authentication
		if (!user?.id) {
			toast.error("Please log in to create a post");
			return;
		}

		setIsLoading(true)
		const loadingToast = toast.loading("Creating hype check...")
		
		try {
			// Create post data with database schema field names
			const defaultTitle = generatePostTitle(data.movieTitle.trim());
				
			const postData = {
				user_id: user.id,
				title: data.title?.trim() || defaultTitle,
				movie_title: data.movieTitle.trim(), // Required
				trailer_url: data.trailerUrl.trim(),
				content: data.content.trim(), // Required - matches actual schema
				image_url: data.posterUrl?.trim() || null // Matches actual schema
			}
			
			const newPost = await createPostMutation.mutateAsync(postData);
			
			toast.success('Hype check created!')
				
			if (newPost?.id) {
				setTimeout(() => onPostCreated?.(newPost.id), 300);
			} else {
				toast.error("Post created but missing ID. Please check your posts.");
			}
		} catch (err) {
			console.error('Error creating post:', err)
			toast.error('Something went wrong: ' + (err.message || 'Unknown error'))
		} finally {
			toast.dismiss(loadingToast)
			setIsLoading(false)
		}
	}

	const validateTrailerUrl = (url) => {
		if (!url) return 'Trailer URL is required'
		
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
		const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/
		
		if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
			return 'Please enter a valid YouTube or Vimeo URL'
		}
		return true
	}

	// Helper function to get video ID from URL for preview
	const getVideoId = (url) => {
		if (!url) return null
		
		// YouTube video ID extraction
		const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
		if (youtubeMatch) {
			return { platform: 'youtube', id: youtubeMatch[1] }
		}
		
		// Vimeo video ID extraction
		const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
		if (vimeoMatch) {
			return { platform: 'vimeo', id: vimeoMatch[1] }
		}
		
		return null
	}

	const videoInfo = getVideoId(trailerUrl)

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Trailer URL */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					TRAILER URL *
				</label>
				<input
					type="url"
					{...register('trailerUrl', {
						required: 'Trailer URL is required',
						validate: validateTrailerUrl
					})}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder="https://www.youtube.com/watch?v=..."
				/>
				{errors.trailerUrl && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.trailerUrl.message}
					</p>
				)}
				<p className="mt-2 text-xs font-mono text-concrete-600">
					YouTube or Vimeo links only
				</p>
				
				{/* Trailer Preview */}
				{videoInfo && (
					<div className="mt-3 p-3 bg-concrete-100 border-2 border-concrete-400">
						<div className="flex items-center gap-2 mb-2">
							<ExternalLink size={16} className="text-theater-red" />
							<span className="font-mono font-bold text-sm text-concrete-800">
								TRAILER PREVIEW
							</span>
						</div>
						{videoInfo.platform === 'youtube' ? (
							<div className="aspect-video bg-black rounded border border-concrete-300">
								<img
									src={`https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`}
									alt="YouTube thumbnail"
									className="w-full h-full object-cover rounded"
									onError={(e) => {
										e.target.src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`
									}}
								/>
							</div>
						) : (
							<div className="aspect-video bg-concrete-200 rounded border border-concrete-300 flex items-center justify-center">
								<div className="text-center">
									<div className="text-2xl mb-2">🎬</div>
									<p className="font-mono text-sm text-concrete-600">Vimeo Video</p>
								</div>
							</div>
						)}
						<p className="mt-2 text-xs font-mono text-concrete-600">
							Platform: {videoInfo.platform.toUpperCase()} • ID: {videoInfo.id}
						</p>
					</div>
				)}
			</div>

			{/* Movie Title */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					MOVIE TITLE *
				</label>
				<input
					type="text"
					{...register('movieTitle', {
						required: 'Movie title is required',
						minLength: {
							value: 2,
							message: 'Movie title must be at least 2 characters'
						},
						onChange: (e) => handleTitleChange(e.target.value)
					})}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder="Top Gun: Maverick"
				/>
				{errors.movieTitle && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.movieTitle.message}
					</p>
				)}

				{/* Duplicate Warning */}
				{duplicateWarning && (
					<div className="mt-3 p-3 bg-street-yellow border-3 border-black">
						<div className="flex items-start gap-2">
							<AlertTriangle size={20} className="text-theater-red flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-mono font-bold text-black text-sm mb-1">
									SIMILAR DISCUSSION FOUND
								</p>
								<p className="font-mono text-xs text-concrete-800 mb-2">
									"{duplicateWarning.title}" already exists
								</p>
								<a
									href={`/post/${duplicateWarning.id}`}
									className="inline-flex items-center gap-1 text-xs font-mono font-bold text-theater-red hover:text-theater-velvet"
								>
									<ExternalLink size={12} />
									VIEW EXISTING DISCUSSION
								</a>
							</div>
						</div>
					</div>
				)}
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
					placeholder={movieTitle ? `${movieTitle} - Your take here` : "Leave blank for auto-generated title"}
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Leave blank to auto-generate from movie title
				</p>
			</div>

			{/* Poster URL (Optional) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					MOVIE POSTER URL (OPTIONAL)
				</label>
				<input
					type="url"
					{...register('posterUrl')}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder="https://image.tmdb.org/t/p/w500/..."
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Direct image URL for the movie poster
				</p>
			</div>

			{/* Your Reaction (Required) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					YOUR REACTION *
				</label>
				<textarea
					{...register('content', {
						required: "Please share your thoughts about this trailer"
					})}
					rows={4}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all resize-none"
					placeholder="What did you think of the trailer? Excited? Skeptical? Share your first impressions..."
				/>
				{errors.content && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.content.message}
					</p>
				)}
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Your initial thoughts about the trailer
				</p>
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading || !user}
				className={`w-full flex items-center justify-center gap-2 px-6 py-4 ${
					user ? "bg-theater-red hover:bg-theater-gold" : "bg-concrete-400"
				} text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				{isLoading ? (
					'CREATING HYPE...'
				) : (
					<>
						<Plus size={20} />
						{user ? "CREATE NEW HYPE" : "LOGIN TO CREATE POST"}
					</>
				)}
			</button>
			{!user && (
				<p className="mt-2 text-center font-mono text-sm text-theater-red">
					You need to be logged in to create a post
				</p>
			)}
		</form>
	)
}

export default TrailerLinkForm