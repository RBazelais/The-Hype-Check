// src/hooks/usePosts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseHelpers } from '../utils/supabase'
import toast from 'react-hot-toast'

// Hook for fetching posts with sorting and searching
export const usePosts = (sortBy = 'created_at', searchQuery = '') => {
	return useQuery({
		queryKey: ['posts', sortBy, searchQuery],
		queryFn: async () => {
			if (searchQuery) {
				const { data, error } = await supabaseHelpers.searchPosts(searchQuery);
				if (error) throw error;
				return data;
			} else {
				const { data, error } = await supabaseHelpers.getPosts(sortBy);
				if (error) throw error;
				return data;
			}
		}
	});
};

// Hook for fetching a single post
export const usePost = (postId) => {
	return useQuery({
		queryKey: ['post', postId],
		queryFn: async () => {
			const { data, error } = await supabaseHelpers.getPostById(postId)
			if (error) throw error
			return data
		},
		enabled: !!postId
	})
}

// Hook for creating posts
export const useCreatePost = () => {
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: async (postData) => {
			const { data, error } = await supabaseHelpers.createPost(postData);
			if (error) throw error;
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries(['posts']);
			// Don't duplicate toast - it's already shown in the component
			return data;
		},
		onError: (error) => {
			console.error('🚀 Post creation failed:', error);
			// Don't duplicate toast - let the component handle it
		}
	});
};

// Hook for updating posts
export const useUpdatePost = (postId) => {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (updateData) => {
			const { data, error } = await supabaseHelpers.updatePost(postId, updateData)
			if (error) throw error
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['post', postId])
			queryClient.invalidateQueries(['posts'])
			toast.success('Post updated!')
		},
		onError: (error) => {
			toast.error('Failed to update post')
			console.error('Update post error:', error)
		}
	})
}

// Hook for deleting posts
export const useDeletePost = () => {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (postId) => {
			const { error } = await supabaseHelpers.deletePost(postId)
			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['posts'])
			toast.success('Post deleted')
		},
		onError: (error) => {
			toast.error('Failed to delete post')
			console.error('Delete post error:', error)
		}
	})
}

// Hook for upvoting posts
export const useUpvotePost = (postId) => {
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: async () => {
			const { data, error } = await supabaseHelpers.upvotePost(postId);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['post', postId]);
			queryClient.invalidateQueries(['posts']);
			toast.success('Hyped!');
		},
		onError: (error) => {
			console.error('🚀 Upvote failed:', error);
			toast.error('Failed to upvote')
		}
	})
}

// Hook for user's posts
export const useUserPosts = (userId) => {
	return useQuery({
		queryKey: ['user-posts', userId],
		queryFn: async () => {
			if (!userId) return []
			const { data, error } = await supabaseHelpers.getUserPosts(userId)
			if (error) throw error
			return data
		},
		enabled: !!userId
	})
}