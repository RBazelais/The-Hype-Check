// src/components/auth/ProtectedRoute.jsx
import { useAuth } from '../../hooks/useAuth'
import LoginForm from './LoginForm'

const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth()

if (loading) {
	return (
		<div className="flex items-center justify-center min-h-64">
			<div className="bg-concrete-900 text-concrete-100 px-8 py-4 border-5 border-black font-brutal text-xl">
				LOADING...
			</div>
		</div>
	)
}

	if (!user) {
		return (
			<div className="max-w-md mx-auto">
				<div className="bg-theater-gold text-black p-6 border-5 border-black mb-6">
					<h2 className="font-brutal text-2xl mb-2">ACCESS DENIED</h2>
					<p className="font-mono">You need to log in to access this page.</p>
				</div>
				<LoginForm />
			</div>
		)
	}

	return children
}

export default ProtectedRoute