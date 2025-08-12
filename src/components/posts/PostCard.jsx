import { Link } from 'react-router-dom'
import { Clock, ThumbsUp, MessageCircle, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const PostCard = ({ post }) => {
	const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
	// Handle the comment count from Supabase's count aggregation
	const commentCount = post.comments?.[0]?.count || 0

	return (
		<Link to={`/post/${post.id}`} className="block group">
			<article className="bg-concrete-100 border-2 lg:border-5 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all group-hover:bg-concrete-200">
				<div className="p-4 lg:p-6">
					{/* Header */}
					<div className="flex items-start justify-between mb-3 lg:mb-4">
						<div className="flex-1 min-w-0">
							<h2 className="font-brutal text-lg lg:text-xl text-concrete-900 mb-2 group-hover:text-theater-red transition-colors break-words">
								{post.title}
							</h2>
							<div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs lg:text-sm text-concrete-600">
								<div className="flex items-center gap-1">
									<User className="w-3 h-3 lg:w-[14px] lg:h-[14px]" />
									<span className="font-mono">
										{'User ' + (post.user_id ? post.user_id.substring(0, 6) : 'Anonymous')}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Clock className="w-3 h-3 lg:w-[14px] lg:h-[14px]" />
									<span className="font-mono">{timeAgo}</span>
								</div>
							</div>
						</div>
						
						{/* Movie Poster */}
						{post.image_url && (
							<div className="ml-3 lg:ml-4 flex-shrink-0">
								<img
									src={post.image_url}
									alt={`${post.movie_title || 'Movie'} poster`}
									className="w-12 h-16 lg:w-16 lg:h-24 object-cover border-2 lg:border-3 border-black"
									onError={(e) => {
										e.target.style.display = 'none'
									}}
								/>
							</div>
						)}
					</div>

					{/* Content Preview */}
					{post.content && (
						<div className="mb-3 lg:mb-4">
							<p className="font-mono text-sm lg:text-base text-concrete-700 line-clamp-2 break-words">
								{post.content.length > 120 
									? `${post.content.substring(0, 120)}...`
									: post.content
								}
							</p>
						</div>
					)}

					{/* Movie Title Badge */}
					<div className="mb-3 lg:mb-4">
						<span className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-theater-gold text-black font-mono font-bold text-xs lg:text-sm border-2 lg:border-3 border-black break-words">
							🎬 {post.movie_title}
						</span>
					</div>

					{/* Stats Footer */}
					<div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 pt-3 lg:pt-4 border-t-2 lg:border-t-3 border-concrete-300">
						<div className="flex items-center gap-3 lg:gap-4">
							<div className="flex items-center gap-1 lg:gap-2 text-theater-red">
								<ThumbsUp className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
								<span className="font-mono font-bold text-sm lg:text-base">
									{post.upvotes} HYPE
								</span>
							</div>
							<div className="flex items-center gap-1 lg:gap-2 text-concrete-600">
								<MessageCircle className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
								<span className="font-mono text-sm lg:text-base">
									{commentCount} {commentCount === 1 ? 'COMMENT' : 'COMMENTS'}
								</span>
							</div>
						</div>

						{/* Action Hint */}
						<div className="text-left xs:text-right">
							<span className="font-mono text-xs text-concrete-500 group-hover:text-concrete-700 transition-colors">
								<span className="hidden lg:inline">CLICK TO VIEW →</span>
								<span className="lg:hidden">VIEW →</span>
							</span>
						</div>
					</div>
				</div>
			</article>
		</Link>
	)
}

export default PostCard