// src/components/posts/TrailerPlayer.jsx
import { ExternalLink } from 'lucide-react'

const TrailerPlayer = ({ url }) => {
	if (!url) {
		return (
			<div className="bg-concrete-800 border-3 border-black p-8 text-center">
				<div className="text-4xl mb-4">🎬</div>
				<p className="font-mono text-theater-gold">
					No trailer link provided
				</p>
			</div>
		)
	}

	// Extract YouTube video ID from URL
	const getYouTubeId = (url) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
		const match = url.match(regExp)
		return (match && match[2].length === 11) ? match[2] : null
	}

	// Clean up the URL
	const cleanUrl = url.trim()
	const youtubeId = getYouTubeId(cleanUrl)

	// extract a YouTube ID, show embedded player
	if (youtubeId) {
		const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0`
		
		return (
			<div className="relative">
				{/* YouTube Embed */}
				<div className="bg-black border-3 border-black overflow-hidden">
					<iframe
						src={embedUrl}
						width="100%"
						height="400"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						className="w-full h-96"
						title="Movie Trailer"
					/>
				</div>

				{/* Fallback link */}
				<div className="mt-4 text-center">
					<a
						href={cleanUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 font-mono text-sm text-theater-gold hover:text-street-yellow transition-colors"
					>
						<ExternalLink size={14} />
						Open in YouTube
					</a>
				</div>
			</div>
		)
	}

	// Fallback for non-YouTube URLs or if we can't extract the ID
	return (
		<div className="bg-concrete-800 border-3 border-black p-6">
			<div className="flex items-center gap-3 mb-4">
				<div className="text-2xl">🎬</div>
				<p className="font-mono text-theater-gold font-bold">
					WATCH TRAILER
				</p>
			</div>
			<p className="font-mono text-concrete-300 mb-4 text-sm">
				Click below to watch the trailer:
			</p>
			<a
				href={cleanUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="btn-primary inline-flex items-center gap-2"
			>
				<ExternalLink size={18} />
				OPEN TRAILER
			</a>
		</div>
	)
}

export default TrailerPlayer