import { useParams } from 'react-router-dom'

const PostDetail = () => {
	const { id } = useParams()

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-concrete-100 border-3 border-black p-6">
				<h1 className="font-brutal text-2xl mb-4">Post Detail</h1>
				<p className="font-mono text-concrete-800">
					Post ID: {id}
				</p>
				<p className="font-mono text-concrete-600 mt-4">
					This page will show detailed post information once the backend is connected.
				</p>
			</div>
		</div>
	)
}

export default PostDetail