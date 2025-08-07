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
// Using mock data for presentation
import { mockSupabaseHelpers as supabaseHelpers } from "../utils/mockSupabaseHelpers";
import { getUpcomingMovies } from "../utils/mockTmdbApi";
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
				if (searchQuery) {
					const { data, error } =
						await supabaseHelpers.searchPosts(searchQuery);
					if (error) throw error;
					return data;
				} else {
					const { data, error } =
						await supabaseHelpers.getPosts(sortBy);
					if (error) throw error;
					return data;
				}
			} catch (error) { // eslint-disable-line no-unused-vars
				return [];
			}
		},
		retry: false,
	});

	// Fetch upcoming movies from TMDB
	const { data: upcomingMovies, error: moviesError } = useQuery({
		queryKey: ["upcoming-movies"],
		queryFn: getUpcomingMovies,
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
					poster_path: movie.poster_path,
					release_date: movie.release_date
				}
			}
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="bg-theater-red text-black px-12 py-8 border-5 border-black font-brutal text-3xl shadow-brutal">
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
				Array.isArray(upcomingMovies.results) &&
				upcomingMovies.results.length > 0 && (
					<div className="mb-6">
						<h2 className="font-brutal text-3xl text-concrete-900 mb-2">
							UPCOMING MOVIES
						</h2>
						<p className="font-mono text-concrete-600">
							Get ready for the hype! Create the first review for
							any of these upcoming films.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
							{upcomingMovies.results.map((movie) => (
								<div
									key={movie.id}
									onClick={() => handleMovieClick(movie)}
									className="bg-concrete-200 border-3 border-black shadow-brutal hover:shadow-brutal-lg transition-all hover:bg-concrete-100 cursor-pointer group"
								>
									{/* Movie Poster */}
									<div className="relative overflow-hidden h-64">
										<img
											src={movie.poster_path}
											alt={`${movie.title} poster`}
											className="w-full h-64 object-cover border-b-3 border-black group-hover:scale-105 transition-transform duration-300"
											onError={(e) => {
												// Hide the broken image and show placeholder
												e.target.style.display = 'none';
												const placeholder = e.target.nextElementSibling;
												if (placeholder && placeholder.classList.contains('poster-placeholder')) {
													placeholder.style.display = 'flex';
												}
											}}
											onLoad={(e) => {
												// Hide placeholder if image loads successfully
												const placeholder = e.target.nextElementSibling;
												if (placeholder && placeholder.classList.contains('poster-placeholder')) {
													placeholder.style.display = 'none';
												}
											}}
										/>
										{/* Styled Placeholder */}
										<div className="poster-placeholder absolute inset-0 bg-gradient-to-br from-theater-red to-theater-gold border-b-3 border-black flex items-center justify-center text-center p-4">
											<div>
												<div className="text-4xl mb-3">🎬</div>
												<div className="font-brutal text-white text-lg leading-tight mb-2">
													{movie.title}
												</div>
												<div className="font-mono text-white text-sm opacity-80">
													Coming {new Date(movie.release_date).getFullYear()}
												</div>
											</div>
										</div>
										<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
										
										{/* Create Hype Check Overlay */}
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
											<div className="bg-theater-red text-white px-4 py-2 border-2 border-white font-mono font-bold text-sm flex items-center gap-2">
												<Plus size={16} />
												CREATE HYPE CHECK
											</div>
										</div>
									</div>
									
									{/* Movie Info */}
									<div className="p-4">
										<h3 className="font-brutal text-lg text-concrete-900 mb-2 line-clamp-2 group-hover:text-theater-red transition-colors">
											{movie.title}
										</h3>
										<div className="flex items-center justify-between">
											<span className="font-mono text-concrete-700 text-sm flex items-center gap-1">
												<Calendar size={14} />
												{movie.release_date}
											</span>
											<span className="font-mono text-xs text-concrete-500 group-hover:text-theater-red transition-colors font-bold">
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
