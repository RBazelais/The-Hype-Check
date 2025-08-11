// src/pages/EditPost.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
// Using real Supabase integration
import { supabaseHelpers } from '../utils/supabase'
import toast from 'react-hot-toast'

const EditPost = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { user } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm()

	// Fetch post details
	const { data: post, isLoading, error } = useQuery({
		queryKey: ['post', id],
		queryFn: async () => {
			const { data, error } = await supabaseHelpers.getPostById(id)
			if (error) throw error
			return data
		},
		enabled: !!id
	})

	// Update post mutation
	const updateMutation = useMutation({
		mutationFn: async (updateData) => {
			const { data, error } = await supabaseHelpers.updatePost(id, updateData)
			if (error) throw error
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['post', id])
			queryClient.invalidateQueries(['posts'])
			toast.success('Hype check updated!')
			navigate(`/post/${id}`)
		},
		onError: (error) => {
			toast.error('Failed to update post')
			console.error('Update error:', error)
		}
	})

	// Populate form when post loads
	useEffect(() => {
		if (post) {
			setValue('title', post.title)
			setValue('content', post.content || '')
			setValue('image_url', post.image_url || '')
			setValue('trailer_url', post.trailer_url || '')
		}
	}, [post, setValue])

	// Check if user owns this post
	useEffect(() => {
		if (post && user && post.user_id !== user.id) {
			toast.error('You can only edit your own posts')
			navigate('/')
		}
	}, [post, user, navigate])

	const onSubmit = async (data) => {
		if (!post) return

		setIsSubmitting(true)
		try {
			const updateData = {
				title: data.title.trim(),
				content: data.content?.trim() || null,
				image_url: data.image_url?.trim() || null,
				trailer_url: data.trailer_url?.trim() || null,
				updated_at: new Date().toISOString()
			}

			await updateMutation.mutateAsync(updateData)
		} finally {
			setIsSubmitting(false)
		}
	}

	const validateTrailerUrl = (url) => {
		if (!url) return true // Optional field
		
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
		const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/
		
		if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
			return 'Please enter a valid YouTube or Vimeo URL'
		}
		return true
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64 px-4">
				<div className="bg-red-600 text-white px-6 py-4 lg:px-12 lg:py-6 border-2 lg:border-5 border-black font-brutal text-xl lg:text-2xl shadow-brutal-sm lg:shadow-brutal">
					LOADING EDITOR...
				</div>
			</div>
		)
	}

	if (error || !post) {
		return (
			<div className="w-full max-w-4xl mx-auto text-center py-8 lg:py-16 px-4">
				<div className="bg-concrete-800 border-2 lg:border-5 border-black p-6 lg:p-12 inline-block shadow-brutal-sm lg:shadow-brutal">
					<h2 className="font-brutal text-2xl lg:text-3xl text-white mb-4">
						POST NOT FOUND
					</h2>
					<p className="font-mono text-theater-gold text-sm lg:text-lg mb-6">
						This post might have been deleted or you don't have permission
					</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-4 py-3 lg:px-6 lg:py-3 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold border-2 lg:border-5 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all text-sm lg:text-base"
					>
						<ArrowLeft className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
						<span className="hidden xs:inline">BACK TO FEED</span>
						<span className="xs:hidden">BACK</span>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-2xl mx-auto px-4 lg:px-8">
			{/* Header */}
			<div className="mb-6 lg:mb-8">
				<div className="flex items-center justify-between mb-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-red-600 hover:bg-red-700 text-white font-mono font-bold border-2 lg:border-3 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all text-sm lg:text-base"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="hidden xs:inline">BACK TO FEED</span>
						<span className="xs:hidden">BACK</span>
					</Link>
				</div>

				<h1 className="font-brutal text-2xl lg:text-4xl text-concrete-900 mb-2">
					EDIT HYPE CHECK
				</h1>
				<p className="font-mono text-sm lg:text-base text-concrete-600">
					Update your thoughts about {post.movie_title}
				</p>
			</div>

			{/* Movie Info Banner */}
			<div className="bg-theater-gold border-2 lg:border-5 border-black p-4 lg:p-6 mb-6 lg:mb-8 shadow-brutal-sm lg:shadow-brutal">
				<div className="flex items-center gap-3">
					<span className="text-xl lg:text-2xl">🎬</span>
					<div className="min-w-0 flex-1">
						<h2 className="font-brutal text-lg lg:text-xl text-black truncate">
							{post.movie_title}
						</h2>
						<p className="font-mono text-xs lg:text-sm text-concrete-800">
							Originally posted {new Date(post.created_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>

			{/* Edit Form */}
			<div className="bg-white border-2 lg:border-5 border-black shadow-brutal-sm lg:shadow-brutal">
				<div className="p-4 lg:p-8">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
						{/* Post Title */}
						<div>
							<label className="block font-mono text-xs lg:text-sm font-bold text-concrete-800 mb-2">
								POST TITLE *
							</label>
							<input
								type="text"
								{...register('title', {
									required: 'Post title is required',
									minLength: {
										value: 5,
										message: 'Title must be at least 5 characters'
									},
									maxLength: {
										value: 200,
										message: 'Title must be less than 200 characters'
									}
								})}
								className="w-full min-w-0 px-3 py-2 lg:px-4 lg:py-3 bg-concrete-50 border-2 lg:border-3 border-black font-mono text-sm lg:text-base focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
								placeholder="Your take on this movie..."
							/>
							{errors.title && (
								<p className="mt-1 text-theater-red font-mono text-xs lg:text-sm">
									{errors.title.message}
								</p>
							)}
						</div>

						{/* Post Content */}
						<div>
							<label className="block font-mono text-xs lg:text-sm font-bold text-concrete-800 mb-2">
								YOUR UPDATED THOUGHTS
							</label>
							<textarea
								{...register('content')}
								rows={4}
								className="w-full min-w-0 px-3 py-2 lg:px-4 lg:py-3 bg-concrete-50 border-2 lg:border-3 border-black font-mono text-sm lg:text-base focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all resize-none"
								placeholder="Share your updated thoughts about this movie..."
							/>
							<p className="mt-2 text-xs font-mono text-concrete-600">
								Optional - your detailed reaction and thoughts
							</p>
						</div>

						{/* Trailer URL */}
						<div>
							<label className="block font-mono text-xs lg:text-sm font-bold text-concrete-800 mb-2">
								TRAILER URL
							</label>
							<input
								type="url"
								{...register('trailer_url', {
									validate: validateTrailerUrl
								})}
								className="w-full min-w-0 px-3 py-2 lg:px-4 lg:py-3 bg-concrete-50 border-2 lg:border-3 border-black font-mono text-sm lg:text-base focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
								placeholder="https://www.youtube.com/watch?v=..."
							/>
							{errors.trailer_url && (
								<p className="mt-1 text-theater-red font-mono text-xs lg:text-sm">
									{errors.trailer_url.message}
								</p>
							)}
							<p className="mt-2 text-xs font-mono text-concrete-600">
								Optional - YouTube or Vimeo trailer link
							</p>
						</div>

						{/* Poster URL */}
						<div>
							<label className="block font-mono text-xs lg:text-sm font-bold text-concrete-800 mb-2">
								MOVIE POSTER URL
							</label>
							<input
								type="url"
								{...register('image_url')}
								className="w-full min-w-0 px-3 py-2 lg:px-4 lg:py-3 bg-concrete-50 border-2 lg:border-3 border-black font-mono text-sm lg:text-base focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
								placeholder="https://image.tmdb.org/t/p/w500/..."
							/>
							<p className="mt-2 text-xs font-mono text-concrete-600">
								Optional - direct image URL for movie poster
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col lg:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6 border-t-2 lg:border-t-3 border-concrete-300">
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full lg:flex-1 flex items-center justify-center gap-2 px-4 py-3 lg:px-6 lg:py-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold border-2 lg:border-3 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
							>
								{isSubmitting ? (
									'SAVING CHANGES...'
								) : (
									<>
										<Save className="w-4 h-4 lg:w-5 lg:h-5" />
										<span className="hidden xs:inline">SAVE CHANGES</span>
										<span className="xs:hidden">SAVE</span>
									</>
								)}
							</button>

							<Link
								to="/"
								className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-3 lg:px-6 lg:py-4 bg-concrete-700 hover:bg-concrete-600 text-white font-mono font-bold border-2 lg:border-3 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all text-sm lg:text-base"
							>
								<X className="w-4 h-4 lg:w-5 lg:h-5" />
								<span className="hidden xs:inline">CANCEL</span>
								<span className="xs:hidden">×</span>
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default EditPost