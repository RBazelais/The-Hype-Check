import { useState } from 'react'

const Home = () => {
	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-street-yellow text-black p-6 border-5 border-black mb-6">
				<h1 className="font-brutal text-4xl mb-2">THE HYPE CHECK</h1>
				<p className="font-mono text-lg">
					Rate and review the latest movies, TV shows, and entertainment!
				</p>
			</div>

			<div className="text-center py-12">
				<h2 className="font-brutal text-2xl mb-4">Welcome to The Hype Check</h2>
				<p className="font-mono text-concrete-800 mb-6">
					Discover what's worth the hype and what's not. Share your thoughts and read reviews from fellow entertainment enthusiasts.
				</p>
				<div className="bg-concrete-100 border-3 border-black p-6">
					<p className="font-mono">Posts and reviews will appear here once you log in and start creating content!</p>
				</div>
			</div>
		</div>
	)
}

export default Home