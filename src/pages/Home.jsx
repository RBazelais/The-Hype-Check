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
// Using real Supabase integration
import { supabaseHelpers } from "../utils/supabase";
import { getUpcomingMovies } from "../utils/tmdbApi";
import PostCard from "../components/posts/PostCard";
import toast from "react-hot-toast";

const Home = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [sortBy, setSortBy] = useState("created_at");
	const searchQuery = searchParams.get("search") || "";

	// Fetch posts based on sort and search
	const {
		data: posts,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["posts", sortBy, searchQuery],
		queryFn: async () => {
			try {
				console.log('🔍 Fetching posts with query:', searchQuery, 'sortBy:', sortBy);
				if (searchQuery) {
					const { data, error } =
						await supabaseHelpers.searchPosts(searchQuery);
					if (error) {
						console.error('❌ Posts search error:', error);
						throw error;
					}
					console.log('✅ Posts search results:', data);
					return data;
				} else {
					const { data, error } =
						await supabaseHelpers.getPosts(sortBy);
					if (error) {
						console.error('❌ Posts fetch error:', error);
						throw error;
					}
					console.log('✅ Posts fetch results:', data);
					return data;
				}
			} catch (error) {
				console.error('❌ Posts query failed:', error);
				return [];
			}
		},
		retry: false,
	});

	// Fetch upcoming movies from TMDB
	const { data: upcomingMovies, error: moviesError } = useQuery({
		queryKey: ["upcoming-movies"],
		queryFn: async () => {
			const movies = await getUpcomingMovies();
			console.log('🎬 Fetched upcoming movies:', movies);
			console.log('🎬 First movie poster_path:', movies[0]?.poster_path);
			console.log('🎬 Sample image URL:', `https://image.tmdb.org/t/p/w500${movies[0]?.poster_path}`);
			return movies;
		},
		staleTime: 1000 * 60 * 30,
		enabled: !searchQuery,
		retry: 3,
		retryDelay: 1000,
	});

	useEffect(() => {
		if (error) {
			toast.error("Failed to load posts");
		}
		if (moviesError) {
			toast.error("Failed to load upcoming movies");
		}
	}, [error, moviesError]);

	const handleSortChange = (newSort) => {
		setSortBy(newSort);
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

	if (isLoading && searchQuery) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="bg-red-600 text-white px-12 py-8 border-5 border-black font-bold text-3xl shadow-brutal">
					LOADING HYPE...
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header Section */}
			<div className="mb-8">
				<div className="bg-theater-gold text-black p-6 border-5 border-black shadow-brutal">
					<h1 className="font-brutal text-4xl mb-2">
						{searchQuery
							? `SEARCH: "${searchQuery}"`
							: "LATEST HYPE CHECKS"}
					</h1>
					<p className="font-mono text-lg">
						{searchQuery
							? `Found ${posts?.length || 0} discussions`
							: "Movie trailer discussions from the community"}
					</p>
				</div>
			</div>

			{/* Controls Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-concrete-800 border-5 border-black shadow-brutal">
				<div className="flex items-center gap-2">
					<ArrowUpDown size={20} className="text-theater-gold" />
					<span className="font-mono font-bold text-theater-gold text-lg">
						SORT BY:
					</span>
				</div>
				<div className="flex gap-3">
					<button
						onClick={() => handleSortChange("created_at")}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === "created_at"
								? "bg-street-yellow text-black shadow-brutal"
								: "bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal"
						}`}
					>
						<Clock size={16} className="text-black" />
						<span>NEWEST</span>
					</button>
					<button
						onClick={() => handleSortChange("upvotes")}
						className={`px-6 py-3 font-mono font-bold border-5 border-black transition-all flex items-center gap-2 ${
							sortBy === "upvotes"
								? "bg-street-yellow text-black shadow-brutal"
								: "bg-concrete-300 text-black hover:bg-street-yellow hover:text-black shadow-brutal-sm hover:shadow-brutal"
						}`}
					>
						<ThumbsUp size={16} className="text-black" />
						<span>MOST HYPED</span>
					</button>
				</div>
			</div>

			{/* Posts Section */}
			{posts && Array.isArray(posts) && posts.length > 0 ? (
				<div className="space-y-6 mb-12">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			) : searchQuery ? (
				<div className="text-center py-12">
					<div className="bg-red-600 text-white border-5 border-black p-12 inline-block shadow-brutal">
						<Search
							size={64}
							className="mx-auto mb-6 text-yellow-400 block"
						/>
						<h3 className="font-brutal text-3xl mb-4">
							NO RESULTS FOUND
						</h3>
						<p className="font-mono text-xl text-gray-200">
							Try searching for a different movie title
						</p>
					</div>
				</div>
			) : (
				<div className="text-center py-8 mb-8">
					<div className="bg-theater-red text-black border-5 border-black p-8 inline-block shadow-brutal">
						<h3 className="font-brutal text-2xl mb-2">
							NO HYPE CHECKS YET
						</h3>
						<p className="font-mono text-lg text-concrete-200 mb-4">
							Check out these upcoming movies and start the hype!
						</p>
					</div>
				</div>
			)}

			{/* Upcoming Movies Section: always show if available */}
			{upcomingMovies &&
				Array.isArray(upcomingMovies) &&
				upcomingMovies.length > 0 && (
					<div className="mb-6">
						<h2 className="font-brutal text-3xl text-concrete-900 mb-2">
							UPCOMING MOVIES
						</h2>
						<p className="font-mono text-concrete-600">
							Get ready for the hype! Create the first review for
							any of these upcoming films.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
							{upcomingMovies.map((movie) => (
								<div
									key={movie.id}
									onClick={() => handleMovieClick(movie)}
									className="bg-gray-200 border-4 border-black shadow-lg hover:shadow-xl transition-all hover:bg-gray-100 cursor-pointer group"
								>
									{/* Movie Poster */}
									<div className="relative overflow-hidden aspect-[2/3] bg-gray-300">
										<img
											src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
											alt={`${movie.title} poster`}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												console.log('Image failed to load:', e.target.src);
												e.target.style.display = 'none';
											}}
											onLoad={(e) => {
												console.log('Image loaded successfully:', e.target.src);
											}}
										/>
										
										{/* Create Hype Check Overlay */}
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
											<div className="bg-red-600 text-white px-4 py-2 border-2 border-white font-mono font-bold text-sm flex items-center gap-2">
												<Plus size={16} />
												CREATE HYPE CHECK
											</div>
										</div>
									</div>
									
									{/* Movie Info */}
									<div className="p-4">
										<h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
											{movie.title}
										</h3>
										<div className="flex items-center justify-between">
											<span className="font-mono text-gray-700 text-sm flex items-center gap-1">
												<Calendar size={14} />
												{movie.release_date}
											</span>
											<span className="font-mono text-xs text-gray-500 group-hover:text-red-600 transition-colors font-bold">
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
