// src/pages/TestTrailer.jsx
import { useState } from 'react'
import TrailerPlayer from '../components/posts/TrailerPlayer'

const TestTrailer = () => {
	const [testUrl, setTestUrl] = useState('')

	// Test URLs for different platforms
	const testUrls = [
		{
			name: 'YouTube (Top Gun: Maverick)',
			url: 'https://www.youtube.com/watch?v=qSqVVswa420'
		},
		{
			name: 'YouTube (The Batman)',
			url: 'https://www.youtube.com/watch?v=mqqft2x_Aa4'
		},
		{
			name: 'Vimeo Test',
			url: 'https://vimeo.com/148751763'
		}
	]

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-8 text-center">
				<h1 className="font-brutal text-4xl text-concrete-900 mb-4">
					TRAILER PLAYER TEST
				</h1>
				<p className="font-mono text-concrete-600">
					Testing video playback functionality
				</p>
			</div>

			<div className="space-y-8">
				{testUrls.map((test, index) => (
					<div key={index} className="bg-white border-3 border-black p-6 shadow-brutal">
						<h2 className="font-brutal text-xl mb-4 text-concrete-900">
							{test.name}
						</h2>
						<p className="font-mono text-sm text-concrete-600 mb-4">
							URL: {test.url}
						</p>
						<TrailerPlayer url={test.url} />
					</div>
				))}
			</div>

			{/* Manual URL Test */}
			<div className="bg-theater-gold border-3 border-black p-6 shadow-brutal mt-8">
				<h2 className="font-brutal text-xl mb-4 text-black">
					MANUAL URL TEST
				</h2>
				<div className="space-y-4">
					<input
						type="url"
						placeholder="Paste a YouTube or Vimeo URL here..."
						className="w-full px-4 py-3 border-3 border-black font-mono"
						value={testUrl}
						onChange={(e) => setTestUrl(e.target.value)}
					/>
					{testUrl && (
						<div className="bg-white border-2 border-black p-4">
							<TrailerPlayer url={testUrl} />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default TestTrailer