// src/utils/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    console.log("VITE_SUPABASE_URL:", supabaseUrl);
    console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "present" : "missing");
}

// Configure the Supabase client with enhanced auth options
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'hype-check-auth',
        flowType: 'implicit',
        debug: false, // Disabled debug mode to reduce console logging
        storage: {
            getItem: (key) => {
                try {
                    const value = window.localStorage.getItem(key);
                    // Removed excessive logging
                    return value;
                } catch (e) {
                    console.error('🔑 Error reading from storage:', e);
                    return null;
                }
            },
            setItem: (key, value) => {
                try {
                    window.localStorage.setItem(key, value);
                    // Removed excessive logging
                } catch (e) {
                    console.error('🔑 Error writing to storage:', e);
                }
            },
            removeItem: (key) => {
                try {
                    window.localStorage.removeItem(key);
                    // Removed excessive logging
                } catch (e) {
                    console.error('🔑 Error removing from storage:', e);
                }
            },
        }
    },
});

// Database helpers
export const supabaseHelpers = {
    // Posts
    async getPosts(sortBy = "created_at") {
        try {
            console.log('🔍 getPosts called with sortBy:', sortBy);
            // Match the actual schema: content and image_url
            let query = supabase.from("posts").select(`
                id,
                title,
                movie_title,
                trailer_url,
                image_url,
                content,
                created_at,
                updated_at,
                user_id,
                upvotes
            `);

            if (sortBy === "upvotes") {
                query = query.order("upvotes", { ascending: false });
            } else {
                query = query.order("created_at", { ascending: false });
            }

            const { data, error } = await query;
            
            console.log('🔍 getPosts query result:', { 
                data, 
                error, 
                dataType: typeof data, 
                dataIsArray: Array.isArray(data),
                dataLength: data?.length 
            });
            
            if (error) {
                console.error("Error fetching posts:", error);
            }
            
            return { data, error };
        } catch (error) {
            console.error("Exception in getPosts:", error);
            return { data: null, error };
        }
    },

    async getPostById(id) {
        try {
            // Updated to match your schema
            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    image_url,
                    content,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes
                `,
                )
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching post by ID:", error);
            }

            return { data, error };
        } catch (error) {
            console.error("Exception in getPostById:", error);
            return { data: null, error };
        }
    },

    async createPost(postData) {
        console.log("🚀 CreatePost called with data:", postData);
        
        // Validate required fields - using 'content' to match actual schema
        if (!postData.content || !postData.content.trim()) {
            return {
                data: null,
                error: { message: "Content is required" }
            };
        }
        
        if (!postData.movie_title || !postData.movie_title.trim()) {
            return {
                data: null,
                error: { message: "Movie title is required" }
            };
        }

        try {
            // Verify user is authenticated with detailed logging
            const { data: authData, error: authError } = await supabase.auth.getSession();
            console.log("🔐 Auth session check:", { 
                hasSession: !!authData?.session,
                hasUser: !!authData?.session?.user,
                userId: authData?.session?.user?.id,
                hasAccessToken: !!authData?.session?.access_token,
                userRole: authData?.session?.user?.role,
                authError 
            });
            
            if (!authData?.session?.user?.id) {
                return {
                    data: null,
                    error: { message: "You must be logged in to create posts" }
                };
            }
            
            // Create simplified post data matching actual schema exactly
            const postPayload = {
                title: postData.title || `${postData.movie_title} - First Impressions`,
                movie_title: postData.movie_title, // Required field
                content: postData.content, // Required field - matches actual schema
                user_id: postData.user_id,
                trailer_url: postData.trailer_url || null,
                image_url: postData.image_url || null // Matches actual schema
            };
            
            console.log("🚀 Creating post with payload:", postPayload);
            console.log("🚀 User session user_id:", authData.session.user.id);
            console.log("🚀 Payload user_id:", postPayload.user_id);

            // Test auth.uid() function availability
            const { data: uidTest, error: uidError } = await supabase.rpc('auth.uid');
            console.log("🔐 auth.uid() test:", { uidTest, uidError });

            const { data, error } = await supabase
                .from("posts")
                .insert(postPayload)
                .select('*')
                .single();

            console.log("🔍 Supabase insert response:", { 
                data, 
                error,
                dataType: typeof data,
                hasData: !!data,
                errorCode: error?.code,
                errorMessage: error?.message,
                errorDetails: error?.details,
                errorHint: error?.hint
            });

            if (error) {
                console.error("❌ Post creation error:", error);
                return { data: null, error };
            }
            
            console.log("✅ Post created successfully:", data);
            
            // Double-check: Try to fetch the post we just created
            if (data?.id) {
                console.log("🔍 Verifying post exists in database...");
                const { data: verifyData, error: verifyError } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("id", data.id)
                    .single();
                console.log("🔍 Verification result:", { verifyData, verifyError });
            }
            
            return { data, error: null };
            
        } catch (error) {
            console.error("💥 Post creation exception:", error);
            return { data: null, error: { message: error.message || "Failed to create post" } };
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
                    image_url,
                    content,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes
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
            // Updated to match your schema: content instead of description, image_url instead of poster_url
            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    movie_title,
                    trailer_url,
                    image_url,
                    content,
                    created_at,
                    updated_at,
                    user_id,
                    upvotes
                `,
                )
                .or(
                    `title.ilike.%${query}%,movie_title.ilike.%${query}%,content.ilike.%${query}%`,
                )
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error searching posts:", error);
            }

            return { data, error };
        } catch (error) {
            console.error("Exception in searchPosts:", error);
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
                            display_name
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
        console.log("🚀 CreateComment called with data:", commentData);
        
        try {
            // Verify user is authenticated
            const { data: authData, error: authError } = await supabase.auth.getSession();
            console.log("🔐 Comment auth session check:", { 
                hasSession: !!authData?.session,
                hasUser: !!authData?.session?.user,
                userId: authData?.session?.user?.id,
                authError 
            });
            
            if (!authData?.session?.user?.id) {
                return {
                    data: null,
                    error: { message: "You must be logged in to create comments" }
                };
            }

            console.log("🚀 Creating comment with payload:", commentData);

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
                            display_name
                        )
                    `,
                )
                .single();

            console.log("🔍 Comment insert response:", { 
                data, 
                error,
                errorCode: error?.code,
                errorMessage: error?.message,
                errorDetails: error?.details
            });

            if (error) {
                console.error("❌ Comment creation error:", error);
                return { data: null, error };
            }
            
            console.log("✅ Comment created successfully:", data);
            
            // Verify comment exists in database
            if (data?.id) {
                console.log("🔍 Verifying comment exists in database...");
                const { data: verifyData, error: verifyError } = await supabase
                    .from("comments")
                    .select("*")
                    .eq("id", data.id)
                    .single();
                console.log("🔍 Comment verification result:", { verifyData, verifyError });
            }

            return { data, error: null };
        } catch (error) {
            console.error("💥 Comment creation exception:", error);
            return { data: null, error: { message: error.message || "Failed to create comment" } };
        }
    },

    async updateComment(id, updates) {
        try {
            const { data, error } = await supabase
                .from("comments")
                .update(updates)
                .eq("id", id)
                .select(
                    `
                        id,
                        content,
                        created_at,
                        user_id,
                        post_id,
                        profiles:user_id (
                            id,
                            display_name
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
        console.log("🗑️ DeleteComment called with id:", id);
        
        try {
            // Verify user is authenticated
            const { data: authData, error: authError } = await supabase.auth.getSession();
            console.log("🔐 Delete comment auth check:", { 
                hasSession: !!authData?.session,
                hasUser: !!authData?.session?.user,
                userId: authData?.session?.user?.id,
                authError 
            });
            
            if (!authData?.session?.user?.id) {
                return {
                    error: { message: "You must be logged in to delete comments" }
                };
            }

            console.log("🗑️ Attempting to delete comment:", id);

            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", id);

            console.log("🔍 Delete comment response:", { 
                error,
                errorCode: error?.code,
                errorMessage: error?.message,
                errorDetails: error?.details
            });

            if (error) {
                console.error("❌ Comment deletion error:", error);
                return { error };
            }
            
            console.log("✅ Comment deleted successfully");
            return { error: null };
        } catch (error) {
            console.error("💥 Comment deletion exception:", error);
            return { error: { message: error.message || "Failed to delete comment" } };
        }
    },

    // Upvotes - Updated for direct upvotes column in posts table
    async upvotePost(postId) {
        try {
            // First get the current upvote count
            const { data: currentPost, error: fetchError } = await supabase
                .from('posts')
                .select('upvotes')
                .eq('id', postId)
                .single();

            if (fetchError) {
                console.error('Error fetching current upvotes:', fetchError);
                return { data: null, error: fetchError };
            }

            // Increment the upvotes count
            const newUpvoteCount = (currentPost.upvotes || 0) + 1;

            // Update the post with the new upvote count
            const { data, error } = await supabase
                .from('posts')
                .update({ upvotes: newUpvoteCount })
                .eq('id', postId)
                .select('upvotes')
                .single();

            if (error) {
                console.error('Error updating upvotes:', error);
                return { data: null, error };
            }

            console.log('Upvote successful:', { postId, newUpvoteCount });
            return { data, error: null };
        } catch (error) {
            console.error('Upvote error:', error);
            return { data: null, error };
        }
    },

    // Legacy upvote functions kept for compatibility (these assume a separate upvotes table)
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
                        image_url,
                        content,
                        created_at,
                        updated_at,
                        user_id,
                        upvotes,
                        profiles:user_id (
                            id,
                            display_name
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