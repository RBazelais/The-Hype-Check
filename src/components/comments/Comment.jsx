// src/components/comments/Comment.jsx
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { User, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { supabaseHelpers } from '../../utils/supabase'
import SpoilerText from './SpoilerText'
import toast from 'react-hot-toast'

const Comment = ({ comment, onCommentUpdated, onCommentDeleted }) => {
	const { user } = useAuth()
	const [isDeleting, setIsDeleting] = useState(false)
	
	const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
	const isOwner = user && user.id === comment.user_id

	const handleDelete = async () => {
		if (!window.confirm('Delete this comment?')) return

		setIsDeleting(true)
		try {
			const { error } = await supabaseHelpers.deleteComment(comment.id)
			
			if (error) {
				toast.error('Failed to delete comment')
			} else {
				toast.success('Comment deleted')
				onCommentDeleted?.(comment.id)
			}
		} catch (error) {
			toast.error('Something went wrong')
		} finally {
			setIsDeleting(false)
		}
	}

	// Parse comment content for spoilers
	const parseCommentContent = (content) => {
		const parts = []
		let lastIndex = 0
		const spoilerRegex = /\[spoiler\](.*?)\[\/spoiler\]/g
		let match

		while ((match = spoilerRegex.exec(content)) !== null) {
			// Add text before spoiler
			if (match.index > lastIndex) {
				parts.push({
					type: 'text',
					content: content.substring(lastIndex, match.index)
				})
			}
			
			// Add spoiler
			parts.push({
				type: 'spoiler',
				content: match[1]
			})
			
			lastIndex = spoilerRegex.lastIndex
		}
		
		// Add remaining text
		if (lastIndex < content.length) {
			parts.push({
				type: 'text',
				content: content.substring(lastIndex)
			})
		}
		
		return parts.length > 0 ? parts : [{ type: 'text', content }]
	}

	const contentParts = parseCommentContent(comment.content)

	return (
		<div className="bg-white border-3 border-black shadow-brutal-sm">
			<div className="p-4">
				{/* Comment Header */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<User size={16} className="text-concrete-600" />
							<span className="font-mono font-bold text-concrete-900">
								{comment.profiles?.display_name || 'Anonymous'}
							</span>
						</div>
						<div className="flex items-center gap-2 text-concrete-500">
							<Clock size={14} />
							<span className="font-mono text-sm">{timeAgo}</span>
						</div>
					</div>

					{/* Owner Actions */}
					{isOwner && (
						<div className="flex gap-1">
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="flex items-center gap-1 px-2 py-1 bg-theater-red hover:bg-red-700 text-white font-mono text-xs font-bold border-2 border-black shadow-brutal-sm hover:shadow-none transition-all disabled:opacity-50"
							>
								<Trash2 size={12} />
								DELETE
							</button>
						</div>
					)}
				</div>

				{/* Comment Content */}
				<div className="font-mono text-concrete-800 leading-relaxed">
					{contentParts.map((part, index) => (
						<span key={index}>
							{part.type === 'spoiler' ? (
								<SpoilerText content={part.content} />
							) : (
								<span className="whitespace-pre-wrap">{part.content}</span>
							)}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

export default Comment