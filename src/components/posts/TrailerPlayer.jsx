// src/components/posts/TrailerPlayer.jsx
import ReactPlayer from 'react-player'

const TrailerPlayer = ({ url }) => {
	if (!url) {
		return (
			<div className="bg-concrete-800 border-3 border-black p-8 text-center">
				<p className="font-mono text-theater-gold">
					No trailer link provided
				</p>
			</div>
		)
	}

	// Check if the URL is supported by ReactPlayer
	if (!ReactPlayer.canPlay(url)) {
		return (
			<div className="bg-concrete-800 border-3 border-black p-6">
				<p className="font-mono text-theater-gold mb-4">
					Can't play this trailer link directly, but you can watch it here:
				</p>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-block px-4 py-2 bg-theater-red hover:bg-red-700 text-white font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all"
				>
					WATCH TRAILER →
				</a>
			</div>
		)
	}

	return (
		<div className="relative bg-black border-3 border-black overflow-hidden">
			<ReactPlayer
				url={url}
				width="100%"
				height="400px"
				controls={true}
				config={{
					youtube: {
						playerVars: {
							showinfo: 1,
							rel: 0,
							modestbranding: 1
						}
					},
					vimeo: {
						playerOptions: {
							byline: false,
							portrait: false,
							title: false
						}
					}
				}}
			/>
		</div>
	)
}

export default TrailerPlayer