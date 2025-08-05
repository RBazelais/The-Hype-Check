import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

const CreatePost = () => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [rating, setRating] = useState(5)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!title.trim() || !content.trim()) {
			toast.error('Please fill in all fields')
			return
		}

		setIsLoading(true)
		try {
			// TODO: Add Supabase post creation logic here
			toast.success('Post created successfully!')
			navigate('/')
		} catch (error) {
			console.error('Error creating post:', error)
			toast.error('Failed to create post')
		} finally {
			setIsLoading(false)
		}
	}

	if (!user) {
		return (
			<div className="text-center py-12">
				<p className="font-mono text-concrete-800">Please log in to create a post.</p>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-street-yellow text-black p-6 border-5 border-black mb-6">
				<h1 className="font-brutal text-3xl">CREATE NEW POST</h1>
				<p className="font-mono">Share your thoughts on the latest entertainment!</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
						TITLE
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
						placeholder="What are you reviewing?"
					/>
				</div>

				<div>
					<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
						RATING (1-10)
					</label>
					<input
						type="number"
						min="1"
						max="10"
						value={rating}
						onChange={(e) => setRating(parseInt(e.target.value))}
						className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
					/>
				</div>

				<div>
					<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
						YOUR REVIEW
					</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={6}
						className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all resize-none"
						placeholder="Tell us what you think..."
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full px-6 py-3 bg-theater-red hover:bg-theater-gold text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'CREATING POST...' : 'CREATE POST'}
				</button>
			</form>
		</div>
	)
}

export default CreatePost