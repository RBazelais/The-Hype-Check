// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User, Calendar, Film, MessageCircle, Edit3, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext.jsx'
import { supabaseHelpers } from '../utils/supabase'
import toast from 'react-hot-toast'

const Profile = () => {
	const { user, profile } = useAuth()
	const [activeTab, setActiveTab] = useState('posts') // 'posts' or 'activity'

	// Fetch user's posts
	const { data: userPosts, isLoading: postsLoading } = useQuery({
		queryKey: ['user-posts', user?.id],
		queryFn: async () => {
			if (!user) return []
			
			const { data, error } = await supabaseHelpers.getUserPosts(user.id)
			if (error) throw error
			return data
		},
		enabled: !!user
	})

	// Fetch user's comments
	const { data: userComments, isLoading: commentsLoading } = useQuery({
		queryKey: ['user-comments', user?.id],
		queryFn: async () => {
			if (!user) return []
			
			const { data, error } = await supabaseHelpers.getUserComments(user.id)
			if (error) throw error
			return data
		},
		enabled: !!user
	})

	if (!user || !profile) {
		return (
			<div className="max-w-4xl mx-auto text-center py-16">
				<div className="bg-theater-red border-5 border-black p-12 inline-block shadow-brutal">
					<h2 className="font-brutal text-3xl text-white mb-4">
						ACCESS DENIED
					</h2>
					<p className="font-mono text-theater-gold text-lg">
						You need to be logged in to view your profile
					</p>
				</div>
			</div>
		)
	}

	const totalPosts = userPosts?.length || 0
	const totalComments = userComments?.length || 0
	const totalUpvotes = userPosts?.reduce((sum, post) => sum + (post.upvotes || 0), 0) || 0
	const memberSince = new Date(profile.created_at).toLocaleDateString()

	return (
		<div className="max-w-4xl mx-auto">
			{/* Profile Header */}
			<div className="bg-concrete-100 border-5 border-black shadow-brutal mb-8">
				<div className="p-8">
					<div className="flex items-start justify-between mb-6">
						<div className="flex items-center gap-6">
							<div className="bg-theater-gold border-5 border-black p-6 shadow-brutal">
								<User size={48} className="text-black" />
							</div>
							<div>
								<h1 className="font-brutal text-3xl text-concrete-900 mb-2">
									{profile.display_name || 'Movie Fan'}
								</h1>
								<p className="font-mono text-concrete-600 mb-2">
									{profile.email}
								</p>
								<div className="flex items-center gap-2 text-concrete-500">
									<Calendar size={16} />
									<span className="font-mono text-sm">
										Member since {memberSince}
									</span>
								</div>
							</div>
						</div>

						{/* Edit Profile Button */}
						<button className="flex items-center gap-2 px-4 py-2 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all">
							<Edit3 size={16} />
							EDIT PROFILE
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-theater-red border-3 border-black p-4 text-center">
							<div className="text-2xl font-brutal text-white mb-1">
								{totalPosts}
							</div>
							<div className="font-mono text-sm text-theater-gold">
								HYPE CHECKS
							</div>
						</div>
						<div className="bg-concrete-800 border-3 border-black p-4 text-center">
							<div className="text-2xl font-brutal text-white mb-1">
								{totalComments}
							</div>
							<div className="font-mono text-sm text-theater-gold">
								COMMENTS
							</div>
						</div>
						<div className="bg-street-yellow border-3 border-black p-4 text-center">
							<div className="text-2xl font-brutal text-black mb-1">
								{totalUpvotes}
							</div>
							<div className="font-mono text-sm text-concrete-800">
								TOTAL HYPE
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content Tabs */}
			<div className="mb-8">
				<div className="flex border-5 border-black bg-concrete-200">
					<button
						onClick={() => setActiveTab('posts')}
						className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-mono font-bold transition-all ${
							activeTab === 'posts'
								? 'bg-theater-gold text-black border-r-3 border-black'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-200 border-r-3 border-black'
						}`}
					>
						<Film size={20} />
						MY POSTS ({totalPosts})
					</button>
					<button
						onClick={() => setActiveTab('activity')}
						className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-mono font-bold transition-all ${
							activeTab === 'activity'
								? 'bg-theater-gold text-black'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-200'
						}`}
					>
						<MessageCircle size={20} />
						MY COMMENTS ({totalComments})
					</button>
				</div>
			</div>

			{/* Tab Content */}
			{activeTab === 'posts' ? (
				<div className="space-y-6">
					{postsLoading ? (
						<div className="text-center py-12">
							<div className="bg-theater-red text-white px-8 py-4 border-5 border-black font-brutal text-xl shadow-brutal inline-block">
								LOADING YOUR POSTS...
							</div>
						</div>
					) : userPosts && userPosts.length > 0 ? (
						userPosts.map((post) => (
							<div key={post.id} className="bg-white border-3 border-black shadow-brutal-sm">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<Link
												to={`/post/${post.id}`}
												className="font-brutal text-xl text-concrete-900 hover:text-theater-red transition-colors block mb-2"
											>
												{post.title}
											</Link>
											<div className="flex items-center gap-4 text-sm text-concrete-600 mb-3">
												<span className="font-mono">
													🎬 {post.movie_title}
												</span>
												<span className="font-mono">
													{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
												</span>
											</div>
										</div>

										<div className="flex gap-2">
											<Link
												to={`/post/${post.id}/edit`}
												className="flex items-center gap-1 px-3 py-1 bg-street-yellow hover:bg-street-orange text-black font-mono text-sm font-bold border-2 border-black shadow-brutal-sm hover:shadow-none transition-all"
											>
												<Edit3 size={12} />
												EDIT
											</Link>
											<Link
												to={`/post/${post.id}`}
												className="flex items-center gap-1 px-3 py-1 bg-concrete-700 hover:bg-concrete-600 text-white font-mono text-sm font-bold border-2 border-black shadow-brutal-sm hover:shadow-none transition-all"
											>
												<Eye size={12} />
												VIEW
											</Link>
										</div>
									</div>

									{post.content && (
										<p className="font-mono text-concrete-700 text-sm mb-4 line-clamp-2">
											{post.content.length > 150 
												? `${post.content.substring(0, 150)}...`
												: post.content
											}
										</p>
									)}

									<div className="flex items-center justify-between pt-4 border-t-2 border-concrete-200">
										<div className="flex items-center gap-4">
											<span className="font-mono text-sm text-theater-red font-bold">
												{post.upvotes} HYPE
											</span>
											<span className="font-mono text-sm text-concrete-600">
												{post.comments?.length || 0} Comments
											</span>
										</div>
										<span className="font-mono text-xs text-concrete-500">
											Created {new Date(post.created_at).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="bg-concrete-200 border-3 border-black p-12 text-center">
							<h3 className="font-brutal text-2xl text-concrete-800 mb-4">
								NO POSTS YET
							</h3>
							<p className="font-mono text-concrete-600 mb-6">
								You haven't created any hype checks yet!
							</p>
							<Link
								to="/create"
								className="inline-block px-6 py-3 bg-theater-red hover:bg-red-700 text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all"
							>
								CREATE YOUR FIRST POST
							</Link>
						</div>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{commentsLoading ? (
						<div className="text-center py-12">
							<div className="bg-theater-red text-white px-8 py-4 border-5 border-black font-brutal text-xl shadow-brutal inline-block">
								LOADING YOUR COMMENTS...
							</div>
						</div>
					) : userComments && userComments.length > 0 ? (
						userComments.map((comment) => (
							<div key={comment.id} className="bg-white border-3 border-black shadow-brutal-sm">
								<div className="p-4">
									<div className="flex items-start justify-between mb-2">
										<Link
											to={`/post/${comment.post_id}`}
											className="font-mono font-bold text-theater-red hover:text-theater-velvet transition-colors text-sm"
										>
											→ Comment on: {comment.posts?.title || 'Movie Discussion'}
										</Link>
										<span className="font-mono text-xs text-concrete-500">
											{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
										</span>
									</div>
									<p className="font-mono text-concrete-700 text-sm leading-relaxed">
										{comment.content.length > 200 
											? `${comment.content.substring(0, 200)}...`
											: comment.content
										}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="bg-concrete-200 border-3 border-black p-12 text-center">
							<h3 className="font-brutal text-2xl text-concrete-800 mb-4">
								NO COMMENTS YET
							</h3>
							<p className="font-mono text-concrete-600">
								You haven't left any comments yet! Join some discussions.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Profile