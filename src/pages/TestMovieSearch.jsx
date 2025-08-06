import React from 'react'
import MovieSearchForm from '../components/posts/MovieSearchForm'

const TestMovieSearch = () => {
	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="font-brutal text-4xl text-concrete-900 mb-8">
				TEST MOVIE SEARCH
			</h1>
			<div className="bg-white border-5 border-black shadow-brutal p-6">
				<MovieSearchForm 
					onPostCreated={() => console.log('Post would be created')}
				/>
			</div>
		</div>
	)
}

export default TestMovieSearch
