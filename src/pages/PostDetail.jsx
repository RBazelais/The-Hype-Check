// src/pages/PostDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ThumbsUp, Edit3, Trash2, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
// Using real Supabase integration
import { supabaseHelpers } from '../utils/supabase'
import CommentForm from '../components/comments/CommentForm'
import TrailerPlayer from '../components/posts/TrailerPlayer'
import CommentSection from '../components/comments/CommentSection'
import toast from 'react-hot-toast'

const PostDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { user } = useAuth()
	const [isUpvoting, setIsUpvoting] = useState(false)

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

	// Upvote mutation
	const upvoteMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabaseHelpers.upvotePost(id)
			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['post', id])
			toast.success('Hyped!')
		},
		onError: () => {
			toast.error('Failed to upvote')
		}
	})

	// Delete post mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabaseHelpers.deletePost(id)
			if (error) throw error
		},
		onSuccess: () => {
			toast.success('Post deleted')
			navigate('/')
		},
		onError: () => {
			toast.error('Failed to delete post')
		}
	})

	const handleUpvote = async () => {
		if (isUpvoting) return
		setIsUpvoting(true)
		try {
			await upvoteMutation.mutateAsync()
		} finally {
			setIsUpvoting(false)
		}
	}

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this hype check?')) {
			deleteMutation.mutate()
		}
	}

	useEffect(() => {
		if (error) {
			toast.error('Failed to load post')
		}
	}, [error])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="bg-theater-red text-white px-12 py-6 border-5 border-black font-brutal text-2xl shadow-brutal">
					LOADING HYPE CHECK...
				</div>
			</div>
		)
	}

	if (!post) {
		return (
			<div className="max-w-4xl mx-auto text-center py-16">
				<div className="bg-concrete-800 border-5 border-black p-12 inline-block shadow-brutal">
					<h2 className="font-brutal text-3xl text-white mb-4">
						HYPE CHECK NOT FOUND
					</h2>
					<p className="font-mono text-theater-gold text-lg mb-6">
						This discussion might have been deleted
					</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-6 py-3 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold border-5 border-black shadow-brutal hover:shadow-none transition-all"
					>
						<ArrowLeft size={18} />
						BACK TO FEED
					</Link>
				</div>
			</div>
		)
	}

	const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
	const isOwner = user && user.id === post.user_id

	return (
		<div className="max-w-4xl mx-auto">
			{/* Back Button */}
			<div className="mb-6">
				<Link
					to="/"
					className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white font-mono border-3 border-black shadow-brutal-sm hover:shadow-none transition-all"
				>
					<ArrowLeft size={16} />
					BACK TO FEED
				</Link>
			</div>

			{/* Post Header */}
			<div className="bg-concrete-100 border-5 border-black shadow-brutal mb-8">
				<div className="p-8">
					<div className="flex items-start justify-between mb-6">
						<div className="flex-1">
							<h1 className="font-brutal text-3xl text-concrete-900 mb-4">
								{post.title}
							</h1>
							<div className="flex items-center gap-6 text-concrete-600">
								<div className="flex items-center gap-2">
									<User size={18} />
									<span className="font-mono font-bold">
										{post.profiles?.display_name || 'Anonymous'}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Clock size={18} />
									<span className="font-mono">{timeAgo}</span>
								</div>
							</div>
						</div>

						{/* Owner Actions */}
						{isOwner && (
							<div className="flex gap-2">
								<Link
									to={`/post/${id}/edit`}
									className="flex items-center gap-1 px-3 py-2 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all"
								>
									<Edit3 size={16} />
									EDIT
								</Link>
								<button
									onClick={handleDelete}
									disabled={deleteMutation.isLoading}
									className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all disabled:opacity-50"
								>
									<Trash2 size={16} />
									DELETE
								</button>
							</div>
						)}
					</div>

					{/* Movie Badge */}
					<div className="mb-6">
						<span className="inline-block px-4 py-2 bg-theater-gold text-black font-mono font-bold text-lg border-3 border-black">
							🎬 {post.movie_title}
						</span>
					</div>

					{/* Post Content */}
					{post.content && (
						<div className="mb-6 p-6 bg-white border-3 border-concrete-300">
							<p className="font-mono text-concrete-800 text-lg leading-relaxed whitespace-pre-wrap">
								{post.content}
							</p>
						</div>
					)}

					{/* Movie Poster */}
					{post.image_url && (
						<div className="mb-6">
							<img
								src={post.image_url}
								alt={`${post.movie_title} poster`}
								className="max-w-xs border-5 border-black shadow-brutal"
								onError={(e) => {
									e.target.style.display = 'none'
								}}
							/>
						</div>
					)}

					{/* Upvote Section */}
					<div className="flex items-center gap-6 pt-6 border-t-5 border-concrete-300">
						<button
							onClick={handleUpvote}
							disabled={isUpvoting || !user}
							className="flex items-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold border-5 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ThumbsUp size={24} />
							<span className="text-xl">
								{post.upvotes} HYPE
							</span>
						</button>

						{!user && (
							<p className="font-mono text-concrete-600">
								Login to upvote and comment
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Trailer Section */}
			{post.trailer_url && (
				<div className="bg-concrete-900 border-5 border-black shadow-brutal mb-8">
					<div className="p-6">
						<h2 className="font-brutal text-2xl text-theater-gold mb-4">
							WATCH TRAILER
						</h2>
						<TrailerPlayer url={post.trailer_url} />
					</div>
				</div>
			)}

			{/* Comments Section */}
			<div className="bg-concrete-100 border-5 border-black shadow-brutal">
				<div className="p-6">
					<h2 className="font-brutal text-2xl text-concrete-900 mb-6">
						DISCUSSION ({post.comments?.length || 0})
					</h2>
					<CommentSection 
						postId={id} 
						comments={post.comments || []} 
					/>
				</div>
			</div>
		</div>
	)
}

export default PostDetail