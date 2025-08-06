// src/components/comments/SpoilerText.jsx
import { useState } from 'react'
import { Eye } from 'lucide-react'

const SpoilerText = ({ content }) => {
	const [isRevealed, setIsRevealed] = useState(false)

	const handleReveal = () => {
		setIsRevealed(true)
	}

	if (isRevealed) {
		return (
			<span className="bg-street-yellow text-black px-2 py-1 border-2 border-black font-bold">
				{content}
			</span>
		)
	}

	return (
		<button
			onClick={handleReveal}
			className="inline-flex items-center gap-1 bg-theater-red text-white px-2 py-1 border-2 border-black font-bold hover:bg-red-700 transition-colors cursor-pointer"
		>
			<Eye size={14} />
			<span>SPOILER - CLICK TO REVEAL</span>
		</button>
	)
}

export default SpoilerText