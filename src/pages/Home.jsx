import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpDown,
	Clock,
	ThumbsUp,
	Search,
	Calendar,
	Star,
	Plus,
} from "lucide-react";
// Using hooks instead of direct supabase calls
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import { supabaseHelpers } from "../utils/supabase";
import { getUpcomingMovies } from "../utils/tmdbApi";
import PostCard from "../components/posts/PostCard";
import toast from "react-hot-toast";

const Home = () => {
	const { user } = useAuth();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [sortBy, setSortBy] = useState("created_at");
	const searchQuery = searchParams.get("search") || "";

	// Fetch posts based on sort and search
	const {
		data: posts,
		isLoading,
		error,
		refetch
	} = usePosts(sortBy, searchQuery);

	// Fetch upcoming movies from TMDB
	const { data: upcomingMovies, error: moviesError } = useQuery({
		queryKey: ["upcoming-movies"],
		queryFn: async () => {
			try {
				const movies = await getUpcomingMovies();
				console.log('🎬 Fetched upcoming movies count:', movies?.length || 0);
				return movies || [];
			} catch (error) {
				console.error('Failed to fetch upcoming movies:', error);
				return [];
			}
		},
		staleTime: 1000 * 60 * 30,
		enabled: true, // Always fetch upcoming movies
		retry: 3,
		retryDelay: 1000,
	});

	useEffect(() => {
		if (error) {
			console.error("Post loading error details:", error);
			toast.error("Failed to load posts: " + (error.message || "Unknown error"));
		}
		if (moviesError) {
			console.error("Movie loading error details:", moviesError);
			toast.error("Failed to load upcoming movies");
		}
		
		// Debug posts data
		console.log("🔍 Posts state debug:", {
			posts,
			postsType: typeof posts,
			postsIsArray: Array.isArray(posts),
			postsLength: posts?.length,
			isLoading,
			error: error?.message,
			searchQuery,
			sortBy
		});
	}, [error, moviesError, posts, isLoading, searchQuery, sortBy]);
	
	// Add effect to refresh data when component mounts
	useEffect(() => {
		// This ensures fresh data on component mount
		const refreshData = async () => {
			try {
				// Explicitly refetch the data
				console.log("Refreshing posts data on component mount");
				await refetch();
			} catch (err) {
				console.error("Error refreshing data:", err);
			}
		};
		
		refreshData();
	}, [refetch]);

	const handleSortChange = (newSort) => {
		setSortBy(newSort);
	};

	// Test function to create a dummy post
	const createTestPost = async () => {
		try {
			// Check if user is authenticated
			if (!user) {
				toast.error("Please log in to create a test post");
				return;
			}
			
			const testPostData = {
				title: "Test Post - " + new Date().toLocaleTimeString(),
				movie_title: "Test Movie",
				content: "This is a test post to check database connectivity", // Updated from description
				trailer_url: "https://www.youtube.com/watch?v=test",
				image_url: null, // Updated from poster_url
				user_id: user.id // Add required user_id field
			};
			
			console.log("Creating test post with data:", testPostData);
			
			const { data, error } = await supabaseHelpers.createPost(testPostData);
			
			if (error) {
				console.error("Test post creation error:", error);
				toast.error("Test post failed: " + error.message);
			} else {
				console.log("Test post created successfully:", data);
				toast.success("Test post created!");
				refetch(); // Refresh the posts list
			}
		} catch (err) {
			console.error("Test post exception:", err);
			toast.error("Test post exception: " + err.message);
		}
	};

	const handleMovieClick = (movie) => {
		// Navigate to create post with movie data
		navigate(`/create/${movie.id}`, { 
			state: { 
				prefilledMovie: {
					id: movie.id,
					title: movie.title,
					poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
					release_date: movie.release_date
				}
			}
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64 px-4">
				<div className="bg-red-600 text-white px-6 py-4 lg:px-12 lg:py-8 border-2 lg:border-5 border-black font-bold text-xl lg:text-3xl shadow-brutal-sm lg:shadow-brutal text-center">
					LOADING HYPE...
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-4xl mx-auto px-4 lg:px-8">
			{/* Header Section */}
			<div className="mb-6 lg:mb-8">
				<div className="bg-theater-gold text-black p-4 lg:p-6 border-2 lg:border-5 border-black shadow-brutal-sm lg:shadow-brutal">
					<h1 className="font-brutal text-2xl lg:text-4xl mb-2">
						{searchQuery
							? `SEARCH: "${searchQuery}"`
							: "LATEST HYPE CHECKS"}
					</h1>
					<p className="font-mono text-sm lg:text-lg">
						{searchQuery
							? `Found ${posts?.length || 0} discussions`
							: "Movie trailer discussions from the community"}
					</p>
				</div>
			</div>

			{/* Controls Section */}
			<div className="flex flex-col lg:flex-row gap-4 mb-6 lg:mb-8 p-4 lg:p-6 bg-concrete-800 border-2 lg:border-5 border-black shadow-brutal-sm lg:shadow-brutal">
				<div className="flex items-center gap-2">
					<ArrowUpDown className="w-5 h-5 text-theater-gold" />
					<span className="font-mono font-bold text-theater-gold text-base lg:text-lg">
						SORT BY:
					</span>
				</div>
				<div className="flex flex-col xs:flex-row gap-3 w-full lg:w-auto">
					<button
						onClick={() => handleSortChange("created_at")}
						className={`w-full xs:w-auto px-4 py-3 lg:px-6 lg:py-3 font-mono font-bold border-2 lg:border-5 border-black transition-all flex items-center justify-center gap-2 text-sm lg:text-base ${
							sortBy === "created_at"
								? "bg-street-yellow text-black shadow-brutal-sm lg:shadow-brutal"
								: "bg-concrete-300 text-black hover:bg-street-yellow shadow-none hover:shadow-brutal-sm lg:hover:shadow-brutal"
						}`}
					>
						<Clock className="w-4 h-4 text-black" />
						<span>NEWEST</span>
					</button>
					<button
						onClick={() => handleSortChange("upvotes")}
						className={`w-full xs:w-auto px-4 py-3 lg:px-6 lg:py-3 font-mono font-bold border-2 lg:border-5 border-black transition-all flex items-center justify-center gap-2 text-sm lg:text-base ${
							sortBy === "upvotes"
								? "bg-street-yellow text-black shadow-brutal-sm lg:shadow-brutal"
								: "bg-concrete-300 text-black hover:bg-street-yellow shadow-none hover:shadow-brutal-sm lg:hover:shadow-brutal"
						}`}
					>
						<ThumbsUp className="w-4 h-4 text-black" />
						<span>MOST HYPED</span>
					</button>
				</div>
			</div>

			{/* Debug Output */}
			{import.meta.env.DEV && (
				<div className="mb-4 p-4 bg-black text-white text-xs font-mono overflow-auto max-h-40">
					<details>
						<summary>Debug: Posts Data</summary>
						<pre>{JSON.stringify({postsData: posts}, null, 2)}</pre>
					</details>
					<button 
						onClick={createTestPost}
						className="mt-2 px-4 py-2 bg-red-600 text-white border border-white font-mono text-xs"
					>
						CREATE TEST POST
					</button>
				</div>
			)}

			{/* Posts Section */}
			{posts && Array.isArray(posts) && posts.length > 0 ? (
				<div className="space-y-4 lg:space-y-6 mb-8 lg:mb-12">
					{posts.filter(post => post && post.id).map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			) : searchQuery ? (
				<div className="text-center py-8 lg:py-12 px-4">
					<div className="bg-red-600 text-white border-2 lg:border-5 border-black p-6 lg:p-12 inline-block shadow-brutal-sm lg:shadow-brutal max-w-full">
						<Search className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 text-yellow-400 block" />
						<h3 className="font-brutal text-xl lg:text-3xl mb-2 lg:mb-4">
							NO RESULTS FOUND
						</h3>
						<p className="font-mono text-sm lg:text-xl text-gray-200">
							Try searching for a different movie title
						</p>
					</div>
				</div>
			) : (
				<div className="text-center py-6 lg:py-8 mb-6 lg:mb-8 px-4">
					<div className="bg-theater-red text-black border-2 lg:border-5 border-black p-6 lg:p-8 inline-block shadow-brutal-sm lg:shadow-brutal max-w-full">
						<h3 className="font-brutal text-xl lg:text-2xl mb-2">
							NO HYPE CHECKS YET
						</h3>
						<p className="font-mono text-sm lg:text-lg text-concrete-200 mb-4">
							Check out these upcoming movies and start the hype!
						</p>
					</div>
				</div>
			)}

			{/* Upcoming Movies Section */}
			{upcomingMovies &&
				Array.isArray(upcomingMovies) &&
				upcomingMovies.length > 0 && (
					<div className="mb-6">
						<h2 className="font-brutal text-2xl lg:text-3xl text-concrete-900 mb-2">
							UPCOMING MOVIES
						</h2>
						<p className="font-mono text-sm lg:text-base text-concrete-600 mb-4">
							Get ready for the hype! Create the first review for
							any of these upcoming films.
						</p>
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mt-4">
							{upcomingMovies.map((movie) => (
								<div
									key={movie.id}
									onClick={() => handleMovieClick(movie)}
									className="bg-gray-200 border-2 lg:border-4 border-black shadow-lg hover:shadow-xl transition-all hover:bg-gray-100 cursor-pointer group"
								>
									{/* Movie Poster */}
									<div className="relative overflow-hidden aspect-[2/3] bg-gray-300">
										<img
											src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
											alt={`${movie.title} poster`}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												e.target.style.display = 'none';
											}}
										/>
										
										{/* Overlay */}
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
											<div className="bg-red-600 text-white px-2 py-1 lg:px-4 lg:py-2 border-1 lg:border-2 border-white font-mono font-bold text-xs lg:text-sm flex items-center gap-1 lg:gap-2">
												<Plus className="w-3 h-3 lg:w-4 lg:h-4" />
												<span className="hidden lg:inline">CREATE HYPE CHECK</span>
												<span className="lg:hidden">CREATE</span>
											</div>
										</div>
									</div>
									
									{/* Movie Info */}
									<div className="p-2 lg:p-4">
										<h3 className="font-bold text-sm lg:text-lg text-gray-900 mb-1 lg:mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
											{movie.title}
										</h3>
										<div className="flex items-center justify-between">
											<span className="font-mono text-gray-700 text-xs lg:text-sm flex items-center gap-1">
												<Calendar className="w-3 h-3 lg:w-[14px] lg:h-[14px]" />
												<span className="hidden lg:inline">{movie.release_date}</span>
												<span className="lg:hidden">{movie.release_date?.split('-')[0]}</span>
											</span>
											<span className="font-mono text-xs text-gray-500 group-hover:text-red-600 transition-colors font-bold hidden lg:inline">
												CLICK TO HYPE →
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
		</div>
	);
};

export default Home;
