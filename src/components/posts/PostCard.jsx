import { Link } from 'react-router-dom'
import { Clock, ThumbsUp, MessageCircle, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const PostCard = ({ post }) => {
	const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
	const commentCount = post.comments?.length || 0

	return (
		<Link to={`/post/${post.id}`} className="block group">
			<article className="bg-concrete-100 border-5 border-black shadow-brutal hover:shadow-none transition-all group-hover:bg-concrete-200">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<h2 className="font-brutal text-xl text-concrete-900 mb-2 group-hover:text-theater-red transition-colors">
								{post.title}
							</h2>
							<div className="flex items-center gap-4 text-sm text-concrete-600">
								<div className="flex items-center gap-1">
									<User size={14} />
									<span className="font-mono">
										{post.profiles?.display_name || 'Anonymous'}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Clock size={14} />
									<span className="font-mono">{timeAgo}</span>
								</div>
							</div>
						</div>
						
						{/* Movie Poster */}
						{post.image_url && (
							<div className="ml-4 flex-shrink-0">
								<img
									src={post.image_url}
									alt={`${post.movie_title} poster`}
									className="w-16 h-24 object-cover border-3 border-black"
									onError={(e) => {
										e.target.style.display = 'none'
									}}
								/>
							</div>
						)}
					</div>

					{/* Content Preview */}
					{post.content && (
						<div className="mb-4">
							<p className="font-mono text-concrete-700 line-clamp-2">
								{post.content.length > 150 
									? `${post.content.substring(0, 150)}...`
									: post.content
								}
							</p>
						</div>
					)}

					{/* Movie Title Badge */}
					<div className="mb-4">
						<span className="inline-block px-3 py-1 bg-theater-gold text-black font-mono font-bold text-sm border-3 border-black">
							🎬 {post.movie_title}
						</span>
					</div>

					{/* Stats Footer */}
					<div className="flex items-center justify-between pt-4 border-t-3 border-concrete-300">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-theater-red">
								<ThumbsUp size={18} />
								<span className="font-mono font-bold">
									{post.upvotes} HYPE
								</span>
							</div>
							<div className="flex items-center gap-2 text-concrete-600">
								<MessageCircle size={18} />
								<span className="font-mono">
									{commentCount} {commentCount === 1 ? 'COMMENT' : 'COMMENTS'}
								</span>
							</div>
						</div>

						{/* Action Hint */}
						<div className="text-right">
							<span className="font-mono text-xs text-concrete-500 group-hover:text-concrete-700 transition-colors">
								CLICK TO VIEW →
							</span>
						</div>
					</div>
				</div>
			</article>
		</Link>
	)
}

export default PostCard