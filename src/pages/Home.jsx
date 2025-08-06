import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpDown, Clock, ThumbsUp, Search } from 'lucide-react'
import { supabaseHelpers } from '../utils/supabase'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

const Home = () => {
	const [searchParams] = useSearchParams()
	const [sortBy, setSortBy] = useState('created_at')
	const searchQuery = searchParams.get('search') || ''

	// Fetch posts based on sort and search
	const { data: posts, isLoading, error } = useQuery({
		queryKey: ['posts', sortBy, searchQuery],
		queryFn: async () => {
			if (searchQuery) {
				const { data, error } = await supabaseHelpers.searchPosts(searchQuery)
				if (error) throw error
				return data
			} else {
				const { data, error } = await supabaseHelpers.getPosts(sortBy)
				if (error) throw error
				return data
			}
		}
	})

	useEffect(() => {
		if (error) {
			toast.error('Failed to load posts')
		}
	}, [error])

	const handleSortChange = (newSort) => {
		setSortBy(newSort)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="bg-concrete-900 text-concrete-100 px-8 py-4 border-5 border-black font-brutal text-xl">
					LOADING HYPE...
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header Section */}
			<div className="mb-8">
				<h1 className="font-brutal text-4xl text-concrete-900 mb-2">
					{searchQuery ? `SEARCH: "${searchQuery}"` : 'LATEST HYPE CHECKS'}
				</h1>
				<p className="font-mono text-concrete-600">
					{searchQuery 
						? `Found ${posts?.length || 0} discussions`
						: 'Movie trailer discussions from the community'
					}
				</p>
			</div>

			{/* Controls Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-concrete-200 border-3 border-black">
				<div className="flex items-center gap-2">
					<ArrowUpDown size={20} className="text-concrete-700" />
					<span className="font-mono font-bold text-concrete-900">SORT BY:</span>
				</div>
				
				<div className="flex gap-2">
					<button
						onClick={() => handleSortChange('created_at')}
						className={`px-4 py-2 font-mono font-bold border-3 border-black transition-all ${
							sortBy === 'created_at'
								? 'bg-theater-gold text-black shadow-brutal-sm'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-300'
						}`}
					>
						<Clock size={16} className="inline mr-2" />
						NEWEST
					</button>
					
					<button
						onClick={() => handleSortChange('upvotes')}
						className={`px-4 py-2 font-mono font-bold border-3 border-black transition-all ${
							sortBy === 'upvotes'
								? 'bg-theater-gold text-black shadow-brutal-sm'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-300'
						}`}
					>
						<ThumbsUp size={16} className="inline mr-2" />
						MOST HYPED
					</button>
				</div>
			</div>

			{/* Posts Section */}
			{posts && posts.length > 0 ? (
				<div className="space-y-6">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<div className="bg-concrete-300 border-3 border-black p-8 inline-block">
						{searchQuery ? (
							<>
								<Search size={48} className="mx-auto mb-4 text-concrete-600" />
								<h3 className="font-brutal text-xl text-concrete-800 mb-2">
									NO RESULTS FOUND
								</h3>
								<p className="font-mono text-concrete-600">
									Try searching for a different movie title
								</p>
							</>
						) : (
							<>
								<h3 className="font-brutal text-xl text-concrete-800 mb-2">
									NO HYPE CHECKS YET
								</h3>
								<p className="font-mono text-concrete-600 mb-4">
									Be the first to share a trailer reaction!
								</p>
								<a
									href="/create"
									className="inline-block px-6 py-3 bg-theater-red hover:bg-theater-gold text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all"
								>
									CREATE FIRST POST
								</a>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Home