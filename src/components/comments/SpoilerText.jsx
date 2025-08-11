// src/components/comments/SpoilerText.jsx
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const SpoilerText = ({ content, autoCloseDelay = 5000 }) => {
	const [isRevealed, setIsRevealed] = useState(false)

	const handleReveal = () => {
		setIsRevealed(true)
	}

	const handleHide = () => {
		setIsRevealed(false)
	}

	// Auto-close after delay
	useEffect(() => {
		if (isRevealed) {
			const timer = setTimeout(() => {
				setIsRevealed(false)
			}, autoCloseDelay)

			return () => clearTimeout(timer)
		}
	}, [isRevealed, autoCloseDelay])

	if (isRevealed) {
		return (
			<span 
				className="inline-flex items-center gap-1 bg-street-yellow text-black px-2 py-1 border-2 border-black font-bold cursor-pointer hover:bg-yellow-300 transition-colors"
				onClick={handleHide}
				title="Click to hide spoiler (auto-hides in 5s)"
			>
				<EyeOff size={14} />
				{content}
			</span>
		)
	}

	return (
		<button
			onClick={handleReveal}
			className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1 border-2 border-black font-bold hover:bg-red-700 transition-colors cursor-pointer"
		>
			<Eye size={14} />
			<span>SPOILER - CLICK TO REVEAL</span>
		</button>
	)
}

export default SpoilerText