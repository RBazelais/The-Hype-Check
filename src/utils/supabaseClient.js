// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Database helpers
export const supabaseHelpers = {
    // Posts
    async getPosts(sortBy = "created_at") {
        try {
            let query = supabase.from("posts").select(`
                id,
                title,
                movie_title,
                trailer_url,
                poster_url,
                description,
                created_at,
                updated_at,
                user_id,
                upvotes,
                profiles:user_id (
                    id,
                    display_name,
                    avatar_url
                )
            `);

            if (sortBy === "upvotes") {
                query = query.order("upvotes", { ascending: false });
            } else {
                query = query.order("created_at", { ascending: false });
            }

            const { data, error } = await query;
            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getPostById(id) {
        try {
            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    poster_url,
                    description,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes,
                    profiles:user_id (
                        id,
                        display_name,
                        avatar_url
                    )
                `,
                )
                .eq("id", id)
                .single();

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async createPost(postData) {
        try {
            const { data, error } = await supabase
                .from("posts")
                .insert([postData])
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    poster_url,
                    description,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes,
                    profiles:user_id (
                        id,
                        display_name,
                        avatar_url
                    )
                `,
                )
                .single();

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async updatePost(id, updates) {
        try {
            const { data, error } = await supabase
                .from("posts")
                .update(updates)
                .eq("id", id)
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    poster_url,
                    description,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes,
                    profiles:user_id (
                        id,
                        display_name,
                        avatar_url
                    )
                `,
                )
                .single();

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async deletePost(id) {
        try {
            const { error } = await supabase
                .from("posts")
                .delete()
                .eq("id", id);

            return { error };
        } catch (error) {
            return { error };
        }
    },

    async searchPosts(query) {
        try {
            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    poster_url,
                    description,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes,
                    profiles:user_id (
                        id,
                        display_name,
                        avatar_url
                    )
                `,
                )
                .or(
                    `title.ilike.%${query}%,movie_title.ilike.%${query}%,description.ilike.%${query}%`,
                )
                .order("created_at", { ascending: false });

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Comments
    async getComments(postId) {
        try {
            const { data, error } = await supabase
                .from("comments")
                .select(
                    `
                        id,
                        content,
                        created_at,
                        user_id,
                        post_id,
                        profiles:user_id (
                            id,
                            display_name,
                            avatar_url
                        )
                    `,
                )
                .eq("post_id", postId)
                .order("created_at", { ascending: true });

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async createComment(commentData) {
        try {
            const { data, error } = await supabase
                .from("comments")
                .insert([commentData])
                .select(
                    `
                        id,
                        content,
                        created_at,
                        user_id,
                        post_id,
                        profiles:user_id (
                            id,
                            display_name,
                            avatar_url
                        )
                    `,
                )
                .single();

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async deleteComment(id) {
        try {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", id);

            return { error };
        } catch (error) {
            return { error };
        }
    },

    // Upvotes
    async getUpvote(userId, postId) {
        try {
            const { data, error } = await supabase
                .from("upvotes")
                .select("*")
                .eq("user_id", userId)
                .eq("post_id", postId)
                .single();

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async addUpvote(userId, postId) {
        try {
            const { data, error } = await supabase
                .from("upvotes")
                .insert([{ user_id: userId, post_id: postId }]);

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },

    async removeUpvote(userId, postId) {
        try {
            const { error } = await supabase
                .from("upvotes")
                .delete()
                .eq("user_id", userId)
                .eq("post_id", postId);

            return { error };
        } catch (error) {
            return { error };
        }
    },

    // User profiles
    async getUserPosts(userId) {
        try {
            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                        id,
                        title,
                        movie_title,
                        trailer_url,
                        poster_url,
                        description,
                        created_at,
                        updated_at,
                        user_id,
                        upvotes,
                        profiles:user_id (
                            id,
                            display_name,
                            avatar_url
                        )
                    `,
                )
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },
};
