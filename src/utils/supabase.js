// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const supabaseHelpers = {
    // Posts
    async createPost(post){
        const { data, error } = await supabase
            .from('posts')
            .insert([post])
            .select()
        return { data, error}
    },

    async getPosts(sortBy = 'created_at'){
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *, profiles:user_id (display_name)    
            `)
            .order(sortBy, { ascending: false })
        return { data, error }
    },

    async getPostById(id){
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *, profiles:user_id (display_name),
                comments ( *, profiles:user_id (display_name) )
            `)
            .eq('id', id)
            .single()
        return { data, error }
    },

    async updatePost(id, updates){
        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select()
        return { data, error }
    },

    async deletePost(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)
        return { error }
    },

    // Comments
    async createComment(comment) {
        const { data, error } = await supabase
            .from('comments')
            .insert([comment])
            .select(`  *, profiles:user_id (display_name) `)
        return { data, error }
    },

    // Upvotes
    async upvotePost(postId) {
        const { data, error } = await supabase
            .rpc('increment_upvotes', { post_id: postId })
        return { data, error }
    },

    // Search
    async searchPosts(query) {
        const { data, error } = await supabase
            .from('posts')
            .select (` *, profiles: user_id (display_name) `)
            .or (` title.ilike.%${query}%,movie_title.ilike.%${query}% `)
            .order ('created_at', { ascending: false })
        return { data, error }
    }
}