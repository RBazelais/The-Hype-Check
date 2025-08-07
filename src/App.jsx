import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
// Using mock auth for presentation
import { MockAuthProvider as AuthProvider } from './context/MockAuthProvider.jsx'
import Header from './components/layout/Header'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import EditPost from './pages/EditPost'
import Profile from './pages/Profile'
import TestMovieSearch from './pages/TestMovieSearch'
import TestTrailer from './pages/TestTrailer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			cacheTime: 10 * 60 * 10, // 10 minutes
		},
	},
})

function App() {
	return(
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Router>
					<div className="min-h-screen bg-concrete-100">
						<Header />
						<main className="container mx-auto px-4 py-8">
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/test-search" element={<TestMovieSearch />} />
								<Route path="/test-trailer" element={<TestTrailer />} />
								<Route path="/create" element={
									<ProtectedRoute>
										<CreatePost />
									</ProtectedRoute>
								} />
								<Route path="/create/:movieId" element={
									<ProtectedRoute>
										<CreatePost />
									</ProtectedRoute>
								} />
								<Route path="/post/:id" element={<PostDetail />} />
								<Route path="/post/:id/edit" element={
									<ProtectedRoute>
										<EditPost />
									</ProtectedRoute>
								} />
								<Route path="/profile" element={
									<ProtectedRoute>
										<Profile />
									</ProtectedRoute>
								} />
							</Routes>
						</main>
						<Toaster
							position="bottom-right"
							toastOptions={{
								duration: 3000,
								style: {
									background: '#212529',
									color: '#fff',
									border: '3px solid #000',
									borderRadius: '0',
									fontWeight: 'bold',
								}
							}}
						/>
					</div>
				</Router>
			</AuthProvider>
		</QueryClientProvider>
	)
}

export default App