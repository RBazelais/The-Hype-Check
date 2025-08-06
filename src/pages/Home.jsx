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
				<div className="bg-theater-red text-white px-12 py-8 border-5 border-black font-brutal text-3xl shadow-brutal">
					LOADING HYPE...
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header Section */}
			<div className="mb-8">
				<div className="bg-theater-gold text-black p-6 border-5 border-black shadow-brutal">
					<h1 className="font-brutal text-4xl mb-2">
						{searchQuery ? `SEARCH: "${searchQuery}"` : 'LATEST HYPE CHECKS'}
					</h1>
					<p className="font-mono text-lg">
						{searchQuery 
							? `Found ${posts?.length || 0} discussions`
							: 'Movie trailer discussions from the community'
						}
					</p>
				</div>
			</div>

			{/* Controls Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-concrete-800 border-5 border-black shadow-brutal">
				<div className="flex items-center gap-2">
					<ArrowUpDown size={20} className="text-theater-gold" />
					<span className="font-mono font-bold text-theater-gold text-lg">SORT BY:</span>
				</div>
				
				<div className="flex gap-3">
					<button
						onClick={() => handleSortChange('created_at')}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === 'created_at'
								? 'bg-street-yellow text-black shadow-brutal'
								: 'bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal'
						}`}
					>
						<Clock size={16} className="text-black" />
						<span>NEWEST</span>
					</button>
					
					<button
						onClick={() => handleSortChange('upvotes')}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === 'upvotes'
								? 'bg-street-yellow text-black shadow-brutal'
								: 'bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal'
						}`}
					>
						<ThumbsUp size={16} className="text-black" />
						<span>MOST HYPED</span>
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
					<div className="bg-theater-red text-white border-5 border-black p-12 inline-block shadow-brutal">
						{searchQuery ? (
							<div className="text-center">
								<Search size={64} className="mx-auto mb-6 text-street-yellow block" />
								<h3 className="font-brutal text-3xl mb-4">
									NO RESULTS FOUND
								</h3>
								<p className="font-mono text-xl text-concrete-200">
									Try searching for a different movie title
								</p>
							</div>
						) : (
							<div className="text-center">
								<h3 className="font-brutal text-3xl mb-4">
									NO HYPE CHECKS YET
								</h3>
								<p className="font-mono text-xl text-concrete-200 mb-6">
									Be the first to share a trailer reaction!
								</p>
								<a
									href="/create"
									className="inline-block px-8 py-4 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold text-lg border-5 border-black shadow-brutal hover:shadow-none transition-all"
								>
									CREATE FIRST POST
								</a>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Home