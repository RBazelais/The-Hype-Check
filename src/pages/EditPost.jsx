import { useParams } from 'react-router-dom'

const EditPost = () => {
	const { id } = useParams()

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-street-yellow text-black p-6 border-5 border-black mb-6">
				<h1 className="font-brutal text-3xl">EDIT POST</h1>
				<p className="font-mono">Editing post ID: {id}</p>
			</div>

			<div className="bg-concrete-100 border-3 border-black p-6">
				<p className="font-mono text-concrete-800">
					This page will allow editing posts once the backend is connected.
				</p>
			</div>
		</div>
	)
}

export default EditPost