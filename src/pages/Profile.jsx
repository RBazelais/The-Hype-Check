import { useAuth } from '../context/AuthContext.jsx'

const Profile = () => {
	const { user, profile } = useAuth()

	if (!user) {
		return (
			<div className="text-center py-12">
				<p className="font-mono text-concrete-800">Please log in to view your profile.</p>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-theater-red text-white p-6 border-5 border-black mb-6">
				<h1 className="font-brutal text-3xl">YOUR PROFILE</h1>
			</div>

			<div className="bg-concrete-100 border-3 border-black p-6 space-y-4">
				<div>
					<label className="font-mono font-bold text-concrete-800">EMAIL:</label>
					<p className="font-mono">{user.email}</p>
				</div>
				
				<div>
					<label className="font-mono font-bold text-concrete-800">DISPLAY NAME:</label>
					<p className="font-mono">{profile?.display_name || 'Not set'}</p>
				</div>

				<div>
					<label className="font-mono font-bold text-concrete-800">MEMBER SINCE:</label>
					<p className="font-mono">{new Date(user.created_at).toLocaleDateString()}</p>
				</div>
			</div>
		</div>
	)
}

export default Profile