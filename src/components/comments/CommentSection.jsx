// src/components/comments/CommentSection.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import CommentForm from './CommentForm'
import Comment from './Comment'

const CommentSection = ({ postId, comments }) => {
	const { user } = useAuth()
	const [allComments, setAllComments] = useState(
		(comments || []).filter(comment => comment && comment.id)
	)

	// Sync local state with props when comments change
	useEffect(() => {
		const validComments = (comments || []).filter(comment => comment && comment.id)
		setAllComments(validComments)
	}, [comments])

	const handleCommentAdded = (newComment) => {
		if (newComment && newComment.id) {
			setAllComments(prev => [newComment, ...prev])
		}
	}

	const handleCommentUpdated = (updatedComment) => {
		if (updatedComment && updatedComment.id) {
			setAllComments(prev => 
				prev.map(comment => 
					comment && comment.id === updatedComment.id ? updatedComment : comment
				)
			)
		}
	}

	const handleCommentDeleted = (deletedCommentId) => {
		if (deletedCommentId) {
			setAllComments(prev => 
				prev.filter(comment => comment && comment.id !== deletedCommentId)
			)
		}
	}

	return (
		<div className="space-y-6">
			{/* Comment Form */}
			{user ? (
				<CommentForm 
					postId={postId} 
					onCommentAdded={handleCommentAdded} 
				/>
			) : (
				<div className="bg-concrete-800 border-3 border-black p-6 text-center">
					<p className="font-mono text-theater-gold text-lg mb-4">
						Join the discussion!
					</p>
					<p className="font-mono text-concrete-300">
						You need to be logged in to comment
					</p>
				</div>
			)}

			{/* Comments List */}
			{allComments.length > 0 ? (
				<div className="space-y-4">
					{allComments.filter(comment => comment && comment.id).map((comment) => (
						<Comment 
							key={comment.id} 
							comment={comment}
							postId={postId}
							onCommentUpdated={handleCommentUpdated}
							onCommentDeleted={handleCommentDeleted}
						/>
					))}
				</div>
			) : (
				<div className="bg-concrete-200 border-3 border-black p-8 text-center">
					<h3 className="font-brutal text-xl text-concrete-800 mb-2">
						NO COMMENTS YET
					</h3>
					<p className="font-mono text-concrete-600">
						{user 
							? "Be the first to share your thoughts!"
							: "Login to start the discussion!"
						}
					</p>
				</div>
			)}
		</div>
	)
}

export default CommentSection