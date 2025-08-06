// src/components/comments/CommentForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { supabaseHelpers } from '../../utils/supabase'
import toast from 'react-hot-toast'

const CommentForm = ({ postId, onCommentAdded }) => {
	const { user } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)
	
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const commentText = watch('content', '')

	const onSubmit = async (data) => {
		if (!user) return

		setIsSubmitting(true)
		try {
			const commentData = {
				post_id: postId,
				user_id: user.id,
				content: data.content.trim()
			}

			const { data: newComment, error } = await supabaseHelpers.createComment(commentData)
			
			if (error) {
				toast.error('Failed to post comment')
				console.error('Error posting comment:', error)
			} else {
				toast.success('Comment posted!')
				reset()
				onCommentAdded?.(newComment[0])
			}
		} catch (error) {
			toast.error('Something went wrong')
			console.error('Error:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Check if comment contains spoiler tags
	const containsSpoilers = commentText.includes('[spoiler]') && commentText.includes('[/spoiler]')

	return (
		<div className="bg-white border-5 border-black shadow-brutal-sm">
			<div className="p-6">
				<div className="flex items-center gap-2 mb-4">
					<MessageCircle size={24} className="text-theater-red" />
					<h3 className="font-mono font-bold text-lg text-concrete-900">
						ADD YOUR TAKE
					</h3>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Comment Textarea */}
					<div>
						<textarea
							{...register('content', {
								required: 'Comment cannot be empty',
								minLength: {
									value: 3,
									message: 'Comment must be at least 3 characters'
								},
								maxLength: {
									value: 1000,
									message: 'Comment must be less than 1000 characters'
								}
							})}
							rows={4}
							className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all resize-none"
							placeholder="Share your thoughts... Use [spoiler]text[/spoiler] to hide spoilers"
						/>
						{errors.content && (
							<p className="mt-1 text-theater-red font-mono text-sm">
								{errors.content.message}
							</p>
						)}
					</div>

					{/* Character Count */}
					<div className="flex justify-between items-center">
						<div className="text-xs font-mono text-concrete-600">
							{commentText.length}/1000 characters
						</div>
						
						{/* Spoiler Warning */}
						{containsSpoilers && (
							<div className="flex items-center gap-1 text-xs font-mono text-theater-red">
								<AlertCircle size={14} />
								<span>Contains spoilers</span>
							</div>
						)}
					</div>

					{/* Spoiler Help Text */}
					<div className="bg-concrete-100 border-3 border-concrete-300 p-4">
						<p className="font-mono text-xs text-concrete-700 mb-2">
							<strong>Spoiler Protection:</strong>
						</p>
						<p className="font-mono text-xs text-concrete-600">
							Use <code className="bg-concrete-200 px-1">[spoiler]your spoiler text[/spoiler]</code> to hide spoilers from other users
						</p>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isSubmitting || !commentText.trim()}
						className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-theater-red hover:bg-red-700 text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							'POSTING...'
						) : (
							<>
								<MessageCircle size={18} />
								POST COMMENT
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}

export default CommentForm