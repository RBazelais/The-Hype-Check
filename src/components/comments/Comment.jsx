// src/components/comments/Comment.jsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseHelpers } from '../../utils/supabase'

const Comment = ({ comment, onCommentUpdated, onCommentDeleted }) => {
	const { user } = useAuth()
	const [isEditing, setIsEditing] = useState(false)
	const [editContent, setEditContent] = useState(comment.content)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleEdit = async () => {
		if (!editContent.trim()) return

		const { data, error } = await supabaseHelpers.updateComment(comment.id, {
			content: editContent.trim()
		})

		if (error) {
			console.error('Error updating comment:', error)
			return
		}

		onCommentUpdated(data[0])
		setIsEditing(false)
	}

	const handleDelete = async () => {
		setIsDeleting(true)
		const { error } = await supabaseHelpers.deleteComment(comment.id)

		if (error) {
			console.error('Error deleting comment:', error)
			setIsDeleting(false)
			return
		}

		onCommentDeleted(comment.id)
	}

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<div className="bg-concrete-100 border-3 border-black p-6">
			{/* Comment Header */}
			<div className="flex justify-between items-start mb-4">
				<div>
					<h4 className="font-brutal text-lg text-concrete-800">
						{comment.profiles?.display_name || 'Anonymous User'}
					</h4>
					<p className="font-mono text-sm text-concrete-600">
						{formatDate(comment.created_at)}
						{comment.updated_at !== comment.created_at && (
							<span className="ml-2 text-concrete-500">(edited)</span>
						)}
					</p>
				</div>

				{/* Edit/Delete buttons for comment owner */}
				{user?.id === comment.user_id && (
					<div className="flex gap-2">
						{!isEditing && (
							<>
								<button
									onClick={() => setIsEditing(true)}
									className="font-mono text-sm text-blue-600 hover:text-blue-800 underline"
								>
									Edit
								</button>
								<button
									onClick={handleDelete}
									disabled={isDeleting}
									className="font-mono text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</button>
							</>
						)}
					</div>
				)}
			</div>

			{/* Comment Content */}
			{isEditing ? (
				<div className="space-y-4">
					<textarea
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						className="w-full p-3 border-2 border-concrete-400 font-mono text-concrete-800 focus:border-theater-gold focus:outline-none resize-none"
						rows="3"
						placeholder="Edit your comment..."
					/>
					<div className="flex gap-2">
						<button
							onClick={handleEdit}
							disabled={!editContent.trim()}
							className="px-4 py-2 bg-theater-gold text-concrete-800 font-brutal text-sm border-3 border-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Save
						</button>
						<button
							onClick={() => {
								setIsEditing(false)
								setEditContent(comment.content)
							}}
							className="px-4 py-2 bg-concrete-300 text-concrete-800 font-brutal text-sm border-3 border-black hover:bg-concrete-400"
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<div className="font-mono text-concrete-700 whitespace-pre-wrap">
					{comment.content}
				</div>
			)}
		</div>
	)
}

export default Comment