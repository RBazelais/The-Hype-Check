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

import { usePosts } from "../hooks/usePosts";
import { getUpcomingMovies } from "../utils/tmdbApi";
import PostCard from "../components/posts/PostCard";
import toast from "react-hot-toast";

const Home = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [sortBy, setSortBy] = useState("created_at");
	const [displayedMovieCount, setDisplayedMovieCount] = useState(20); // How many to show
	const [allCachedMovies, setAllCachedMovies] = useState([]); // Cache all fetched movies as array
	const [displayedMovies, setDisplayedMovies] = useState([]); // Movies currently shown
	const [hasMoreMovies, setHasMoreMovies] = useState(true);
	const [displayedPostCount, setDisplayedPostCount] = useState(5); // Show 5 posts initially
	const searchQuery = searchParams.get("search") || "";

	const MOVIES_PER_PAGE = 20; // TMDB typical page size
	const POSTS_PER_PAGE = 5; // Posts to load at a time
	const MAX_PAGES = 25; // ~1 year of movies

	// Fetch posts based on sort and search
	const {
		data: posts,
		isLoading,
		error,
		refetch
	} = usePosts(sortBy, searchQuery);

	// Fetch ALL upcoming movies once and cache them
	const { data: upcomingMovies, error: moviesError, isLoading: moviesLoading } = useQuery({
		queryKey: ["upcoming-movies-all"],
		queryFn: async () => {
			try {
				let allMovies = [];
				let currentPage = 1;
				let shouldContinue = true;
				
				while (shouldContinue && currentPage <= MAX_PAGES) {
					const movies = await getUpcomingMovies(currentPage);
					
					if (!movies || movies.length === 0) {
						shouldContinue = false;
						break;
					}
					
					allMovies = [...allMovies, ...movies];
					currentPage++;
				}
				
				return allMovies;
			} catch (error) {
				console.error('Failed to fetch upcoming movies:', error);
				return [];
			}
		},
		staleTime: 1000 * 60 * 60, // 1 hour cache
		enabled: true,
		retry: 3,
		retryDelay: 1000,
	});

	// Update cache when all movies are fetched
	useEffect(() => {
		if (upcomingMovies && Array.isArray(upcomingMovies)) {
			setAllCachedMovies(upcomingMovies);
			setHasMoreMovies(upcomingMovies.length > MOVIES_PER_PAGE);
		}
	}, [upcomingMovies]);

	// Update displayed movies based on display count
	useEffect(() => {
		if (allCachedMovies.length > 0) {
			const slicedMovies = allCachedMovies.slice(0, displayedMovieCount);
			setDisplayedMovies(slicedMovies);
			setHasMoreMovies(allCachedMovies.length > displayedMovieCount);
		}
	}, [allCachedMovies, displayedMovieCount]);

	useEffect(() => {
		if (error) {
			console.error("Post loading error details:", error);
			toast.error("Failed to load posts: " + (error.message || "Unknown error"));
		}
		if (moviesError) {
			console.error("Movie loading error details:", moviesError);
			toast.error("Failed to load upcoming movies");
		}
	}, [error, moviesError]);
	
	// Add effect to refresh data when component mounts
	useEffect(() => {
		// This ensures fresh data on component mount
		const refreshData = async () => {
			try {
				// Explicitly refetch the data
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

	const handleLoadMoreMovies = () => {
		if (hasMoreMovies) {
			setDisplayedMovieCount(prev => prev + MOVIES_PER_PAGE);
		}
	};

	const handleLoadMorePosts = () => {
		setDisplayedPostCount(prev => prev + POSTS_PER_PAGE);
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
							: "HYPE CHECKPOINT"}
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
				<div className="flex flex-col xs:flex-row lg:flex-row gap-3 w-full lg:w-auto">
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

			{/* Posts Section */}
			{posts && Array.isArray(posts) && posts.length > 0 ? (
				<>
					<div className="space-y-4 lg:space-y-6 mb-8 lg:mb-12">
						{posts.filter(post => post && post.id).slice(0, displayedPostCount).map((post) => (
							<PostCard key={post.id} post={post} />
						))}
					</div>
					
					{/* Load More Posts Button */}
					{posts.length > displayedPostCount && (
						<div className="text-center mb-8 lg:mb-12">
							<button
								onClick={handleLoadMorePosts}
								className="px-6 py-3 lg:px-8 lg:py-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold border-2 lg:border-4 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all"
							>
								LOAD MORE HYPE CHECKS
							</button>
							<p className="font-mono text-xs text-concrete-600 mt-2">
								Showing {Math.min(displayedPostCount, posts.length)} of {posts.length} discussions
							</p>
						</div>
					)}
				</>
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
					<div className="bg-red-600 text-white border-2 lg:border-5 border-black p-6 lg:p-8 inline-block shadow-brutal-sm lg:shadow-brutal max-w-full">
						<h3 className="font-brutal text-xl lg:text-2xl mb-2">
							NO HYPE CHECKS YET
						</h3>
						<p className="font-mono text-sm lg:text-lg text-white mb-4">
							Check out these upcoming movies and start the hype!
						</p>
					</div>
				</div>
			)}

			{/* Upcoming Movies Section */}
			<div className="mb-6">
				<h2 className="font-brutal text-2xl lg:text-3xl text-concrete-900 mb-2">
					UPCOMING MOVIES
				</h2>
				<p className="font-mono text-sm lg:text-base text-concrete-600 mb-4">
					Is the hype legit?! Create the first review for any of these upcoming films.
				</p>

				{moviesLoading && (
					<div className="text-center py-8">
						<div className="bg-theater-gold text-black px-6 py-4 border-2 border-black font-bold text-lg">
							LOADING UPCOMING MOVIES...
						</div>
					</div>
				)}

				{/* Movies grid */}
				{displayedMovies && Array.isArray(displayedMovies) && displayedMovies.length > 0 ? (
					<>
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mt-4">
							{displayedMovies.map((movie) => (
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
						
						{/* Load More Button */}
						{hasMoreMovies && (
							<div className="mt-6 text-center">
								<button
									onClick={handleLoadMoreMovies}
									disabled={moviesLoading || !hasMoreMovies}
									className="px-6 py-3 lg:px-8 lg:py-4 bg-theater-gold hover:bg-street-yellow text-black font-mono font-bold border-2 lg:border-4 border-black shadow-brutal-sm lg:shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{moviesLoading ? (
										<span className="flex items-center gap-2">
											<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
											LOADING...
										</span>
									) : (
										'LOAD MORE MOVIES'
									)}
								</button>
								<p className="font-mono text-xs text-concrete-600 mt-2">
									Showing {displayedMovies.length} movies • Up to 1 year ahead
								</p>
							</div>
						)}
					</>
				) : !moviesLoading ? (
					<div className="text-center py-8">
						<div className="bg-red-600 text-white border-2 border-black p-6 inline-block">
							<h3 className="font-brutal text-xl mb-2">NO UPCOMING MOVIES FOUND</h3>
							<p className="font-mono text-sm">Check back later for new releases!</p>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Home;
