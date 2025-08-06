// src/hooks/useComments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseHelpers } from '../utils/supabase'
import toast from 'react-hot-toast'

// Hook for creating comments
export const useCreateComment = (postId) => {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (commentData) => {
			const { data, error } = await supabaseHelpers.createComment(commentData)
			if (error) throw error
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries(['post', postId])
			toast.success('Comment posted!')
			return data[0]
		},
		onError: (error) => {
			toast.error('Failed to post comment')
			console.error('Create comment error:', error)
		}
	})
}

// Hook for deleting comments
export const useDeleteComment = (postId) => {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (commentId) => {
			const { error } = await supabaseHelpers.deleteComment(commentId)
			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['post', postId])
			queryClient.invalidateQueries(['user-comments'])
			toast.success('Comment deleted')
		},
		onError: (error) => {
			toast.error('Failed to delete comment')
			console.error('Delete comment error:', error)
		}
	})
}

// Hook for user's comments
export const useUserComments = (userId) => {
	return useQuery({
		queryKey: ['user-comments', userId],
		queryFn: async () => {
			if (!userId) return []
			const { data, error } = await supabaseHelpers.getUserComments(userId)
			if (error) throw error
			return data
		},
		enabled: !!userId
	})
}