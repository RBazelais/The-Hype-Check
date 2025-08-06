// src/hooks/useAuth.js
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

// Main useAuth hook
export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}

// Additional auth-related hooks for convenience
export const useUser = () => {
	const { user } = useAuth()
	return user
}

export const useProfile = () => {
	const { profile } = useAuth()
	return profile
}

export const useAuthLoading = () => {
	const { loading } = useAuth()
	return loading
}

export const useIsAuthenticated = () => {
	const { user } = useAuth()
	return !!user
}

export const useIsOwner = (resourceUserId) => {
	const { user } = useAuth()
	return user && user.id === resourceUserId
}

// Hook for checking if user can perform actions
export const usePermissions = () => {
	const { user } = useAuth()
	
	const canCreatePost = !!user
	const canComment = !!user
	const canUpvote = !!user
	const canEditPost = (postUserId) => user && user.id === postUserId
	const canDeletePost = (postUserId) => user && user.id === postUserId
	const canEditComment = (commentUserId) => user && user.id === commentUserId
	const canDeleteComment = (commentUserId) => user && user.id === commentUserId
	
	return {
		canCreatePost,
		canComment,
		canUpvote,
		canEditPost,
		canDeletePost,
		canEditComment,
		canDeleteComment
	}
}

export default useAuth