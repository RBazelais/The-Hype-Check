import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Link } from 'lucide-react'
import MovieSearchForm from '../components/posts/MovieSearchForm'
import TrailerLinkForm from '../components/posts/TrailerLinkForm'

const CreatePost = () => {
	const [activeTab, setActiveTab] = useState('search') // 'search' or 'manual'
	const navigate = useNavigate()

	const handlePostCreated = (postId) => {
		navigate(`/post/${postId}`, { replace: true })
	}
	
	return (
		<div className="max-w-2xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="font-brutal text-4xl text-concrete-900 mb-2">
					CREATE HYPE CHECKPOINT
				</h1>
				<p className="font-mono text-concrete-600">
					Share your reaction to a movie trailer
				</p>
			</div>

			{/* Tab Selection */}
			<div className="mb-8">
				<div className="flex border-3 border-black bg-concrete-200">
					<button
						onClick={() => setActiveTab('search')}
						className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-mono font-bold transition-all ${
							activeTab === 'search'
								? 'bg-theater-gold text-black border-r-3 border-black'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-200 border-r-3 border-black'
						}`}
					>
						<Search size={20} />
						SEARCH FOR MOVIE
					</button>
					<button
						onClick={() => setActiveTab('manual')}
						className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-mono font-bold transition-all ${
							activeTab === 'manual'
								? 'bg-theater-gold text-black'
								: 'bg-concrete-100 text-concrete-700 hover:bg-concrete-200'
						}`}
					>
						<Link size={20} />
						ADD TRAILER LINK
					</button>
				</div>
			</div>

			{/* Form Content */}
			<div className="bg-white border-5 border-black shadow-brutal p-6">
				{activeTab === 'search' ? (
					<MovieSearchForm onPostCreated={handlePostCreated} />
				) : (
					<TrailerLinkForm onPostCreated={handlePostCreated} />
				)}
			</div>
		</div>
	)
}

export default CreatePost