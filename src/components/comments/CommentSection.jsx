// src/components/comments/CommentSection.jsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import CommentForm from './CommentForm'
import Comment from './Comment'

const CommentSection = ({ postId, comments }) => {
	const { user } = useAuth()
	const [allComments, setAllComments] = useState(comments || [])

	const handleCommentAdded = (newComment) => {
		setAllComments(prev => [newComment, ...prev])
	}

	const handleCommentUpdated = (updatedComment) => {
		setAllComments(prev => 
			prev.map(comment => 
				comment.id === updatedComment.id ? updatedComment : comment
			)
		)
	}

	const handleCommentDeleted = (deletedCommentId) => {
		setAllComments(prev => 
			prev.filter(comment => comment.id !== deletedCommentId)
		)
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
					{allComments.map((comment) => (
						<Comment 
							key={comment.id} 
							comment={comment}
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