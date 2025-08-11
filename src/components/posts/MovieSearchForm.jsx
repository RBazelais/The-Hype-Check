// src/components/posts/MovieSearchForm.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Search, Plus, Film, ExternalLink, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCreatePost } from "../../hooks/usePosts";
import { searchMovies, getMovieDetails } from "../../utils/tmdbApi.js";
import { generatePostTitle } from "../../utils/titleUtils.js";
import { checkForDuplicates } from "../../utils/duplicateDetection.js";
import toast from "react-hot-toast";

// Helper function to extract YouTube video ID from various URL formats
const extractYoutubeVideoId = (url) => {
	if (!url) return null;

	// Handle various YouTube URL formats
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&\n?#]+)/,
		/(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) return match[1];
	}

	return null;
};

const MovieSearchForm = ({ onPostCreated, prefilledMovie }) => {
	const { user } = useAuth();
	const createPostMutation = useCreatePost();
	const [searchResults, setSearchResults] = useState([]);
	const [selectedMovie, setSelectedMovie] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [duplicateWarning, setDuplicateWarning] = useState(null);
	const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm(); // Initialize react-hook-form
	const [movieDataProcessed, setMovieDataProcessed] = useState(false);

	// Handle prefilled movie data from upcoming movies
	useEffect(() => {
		console.log(
			"🔍 MovieSearchForm - prefilledMovie:",
			prefilledMovie,
			"processed:",
			movieDataProcessed,
		);

		// Only process prefilled data once to avoid re-processing on re-renders
		if (prefilledMovie && !movieDataProcessed) {
			try {
				// Make sure we have the required fields
				if (!prefilledMovie.id || !prefilledMovie.title) {
					console.error(
						"🔍 Missing required fields in prefilledMovie:",
						prefilledMovie,
					);
					toast.error("Invalid movie data. Please try again.");
					setMovieDataProcessed(true); // Mark as processed to avoid repeated errors
					return;
				}

				// Fix the poster path to ensure proper handling regardless of format
				let posterPath = null;
				if (prefilledMovie.poster_path) {
					posterPath = prefilledMovie.poster_path.startsWith("http")
						? prefilledMovie.poster_path
						: `https://image.tmdb.org/t/p/w500${prefilledMovie.poster_path}`;
				}

				// Convert the upcoming movie format to our search result format
				// Store processed URLs to avoid recomputation
				const movieData = {
					id: prefilledMovie.id,
					title: prefilledMovie.title,
					poster_path: posterPath, // Use the processed path
					release_date: prefilledMovie.release_date || "TBA",
					overview: `Upcoming movie releasing on ${prefilledMovie.release_date || "TBA"}`,
				};

				console.log(
					"🔍 Setting selected movie from prefilled data:",
					movieData,
				);

				// Set all state at once to reduce renders
				setSelectedMovie(movieData);
				setValue("searchQuery", movieData.title);
				setMovieDataProcessed(true);

				// Process duplicates check in background
				setTimeout(() => {
					handleDuplicateCheck(movieData).catch((err) => {
						console.error(
							"🔍 Background duplicate check failed:",
							err,
						);
					});
				}, 100);

				// Fetch trailer details with a safety timeout
				setTimeout(() => {
					const loadingToast = toast.loading("Loading movie details...");
					
					// Set a safety timeout to prevent infinite loading
					const safetyTimeout = setTimeout(() => {
						toast.dismiss(loadingToast);
						console.warn("🎬 Trailer fetch timed out");
					}, 8000);
					
					getMovieDetails(movieData.id)
						.then(detailedMovie => {
							// Clear the safety timeout since we got data
							clearTimeout(safetyTimeout);
							toast.dismiss(loadingToast);
							
							// Process the trailer information
							let trailerUrl = null;
							if (
								detailedMovie.videos &&
								detailedMovie.videos.results &&
								detailedMovie.videos.results.length > 0
							) {
								// Find official trailer or teaser
								const trailers =
									detailedMovie.videos.results.filter(
										(video) =>
											video.site === "YouTube" &&
											(video.type === "Trailer" ||
												video.type === "Teaser") &&
											video.official,
									);

								// Prioritize official trailers over teasers
								const officialTrailer = trailers.find(
									(video) => video.type === "Trailer",
								);
								const officialTeaser = trailers.find(
									(video) => video.type === "Teaser",
								);

								// Select the best video
								const bestVideo =
									officialTrailer ||
									officialTeaser ||
									(trailers.length > 0 ? trailers[0] : null);

								if (bestVideo) {
									trailerUrl = `https://www.youtube.com/watch?v=${bestVideo.key}`;
									console.log(
										"🎬 Found trailer URL for prefilled movie:",
										trailerUrl,
									);

									// Populate the trailer URL field
									setValue("trailerUrl", trailerUrl);
								}
							}

							// Update selected movie with enhanced data
							setSelectedMovie((prevMovie) => ({
								...prevMovie,
								...detailedMovie,
								trailer_url: trailerUrl,
							}));
						})
						.catch(error => {
							// Clear safety timeout and dismiss toast on error
							clearTimeout(safetyTimeout);
							toast.dismiss(loadingToast);
							
							console.error(
								"🎬 Error fetching trailer for prefilled movie:",
								error,
							);
							// Continue with basic movie data if trailer fetch fails
						});
				}, 200);
			} catch (error) {
				console.error(
					"🔍 Error processing prefilled movie data:",
					error,
				);
				toast.error("Failed to load movie data");
				setMovieDataProcessed(true); // Mark as processed even on error to prevent infinite loops
			}
		}
	}, [prefilledMovie, setValue, movieDataProcessed]);

	const handleDuplicateCheck = async (movie) => {
		if (!movie || !movie.title) {
			console.log("🔍 No movie title to check for duplicates");
			setDuplicateWarning(null);
			return;
		}

		try {
			console.log("🔍 Checking for duplicates with title:", movie.title);
			const duplicates = await checkForDuplicates(movie.title);
			
			if (duplicates && duplicates.length > 0) {
				console.log("🔍 Found existing posts:", duplicates);
				setDuplicateWarning(duplicates[0]);
			} else {
				console.log("🔍 No duplicate posts found");
				setDuplicateWarning(null);
			}
		} catch (error) {
			console.error("🔍 Exception checking duplicates:", error);
			// Don't set duplicate warning if there was an error - better UX to continue
		}
	};

	const handleMovieSearch = async (query) => {
		if (!query || query.length < 2) {
			console.log("🚫 Search query too short or empty:", {
				query,
				length: query?.length,
			});
			setSearchResults([]);
			return;
		}

		console.log("🔎 Starting movie search for:", query);
		setIsSearching(true);
		try {
			const results = await searchMovies(query);
			console.log("✅ Search results received in component:", {
				results,
				resultsType: typeof results,
				isArray: Array.isArray(results),
				length: results?.length,
			});

			// Handle the API response format - results come wrapped in a results property
			const movieResults = results?.results || results;

			if (
				movieResults &&
				Array.isArray(movieResults) &&
				movieResults.length > 0
			) {
				const topResults = movieResults.slice(0, 5);
				console.log("🎬 Setting top 5 search results:", topResults);
				setSearchResults(topResults);
			} else {
				console.log("❌ No valid results found, setting empty array");
				setSearchResults([]);
			}
		} catch (error) {
			console.error("💥 Movie search error in component:", error);
			toast.error("Failed to search movies");
			setSearchResults([]);
		} finally {
			console.log("🏁 Search completed, setting isSearching to false");
			setIsSearching(false);
		}
	};

	const selectMovie = async (movie) => {
		// First set the movie data we already have to show immediate feedback
		setSelectedMovie(movie);
		setSearchResults([]);
		setValue("searchQuery", movie.title);
		
		// Create a loading toast that we'll dismiss when done
		const loadingToast = toast.loading(
			"Finding trailer and movie details...",
		);
		
		// Set a safety timeout to ensure we don't get stuck in loading state
		const toastTimeout = setTimeout(() => {
			toast.dismiss(loadingToast);
			toast.error("Loading movie details took too long. Please try again.");
		}, 10000); // 10 second safety timeout

		try {
			console.log(
				"🎬 Fetching detailed movie info with trailers for:",
				movie.id,
			);

			// Fetch detailed movie info including videos
			const detailedMovie = await getMovieDetails(movie.id);
			console.log("🎬 Detailed movie data received:", detailedMovie);

			// Extract trailer information
			let trailerUrl = null;
			let trailerType = null;
			let trailerFound = false;

			if (
				detailedMovie.videos &&
				detailedMovie.videos.results &&
				detailedMovie.videos.results.length > 0
			) {
				console.log(
					"🎬 Found videos:",
					detailedMovie.videos.results.length,
				);

				// Find official trailer or teaser
				const trailers = detailedMovie.videos.results.filter(
					(video) =>
						video.site === "YouTube" &&
						(video.type === "Trailer" || video.type === "Teaser") &&
						video.official,
				);

				console.log(
					"🎬 Filtered official YouTube trailers/teasers:",
					trailers.length,
				);

				// Prioritize official trailers over teasers
				const officialTrailer = trailers.find(
					(video) => video.type === "Trailer",
				);
				const officialTeaser = trailers.find(
					(video) => video.type === "Teaser",
				);

				// If no official trailers, look for any YouTube trailer/teaser
				const anyTrailers = detailedMovie.videos.results.filter(
					(video) =>
						video.site === "YouTube" &&
						(video.type === "Trailer" || video.type === "Teaser"),
				);

				// Select the best video (priority: official trailer > official teaser > any trailer > any teaser)
				const bestVideo =
					officialTrailer ||
					officialTeaser ||
					(anyTrailers.length > 0 ? anyTrailers[0] : null);

				if (bestVideo) {
					trailerUrl = `https://www.youtube.com/watch?v=${bestVideo.key}`;
					trailerType = bestVideo.type;
					trailerFound = true;

					console.log(
						`🎬 Found ${bestVideo.official ? "official" : "unofficial"} ${trailerType}:`,
						trailerUrl,
					);

					// Automatically populate the trailer URL field
					setValue("trailerUrl", trailerUrl);

					// Show success toast
					toast.success(
						`Found ${bestVideo.official ? "official" : ""} ${trailerType.toLowerCase()}!`,
						{
							duration: 2000,
							icon: "🎬",
						},
					);
				} else {
					console.log("🎬 No suitable trailers or teasers found");
					toast.error("No trailer available for this movie", {
						duration: 2000,
					});
				}
			} else {
				console.log("🎬 No videos found for this movie");
			}

			// Process available videos for display
			const availableVideos =
				detailedMovie.videos?.results?.filter(
					(video) => video.site === "YouTube",
				) || [];

			// Update the movie data with enhanced information
			setSelectedMovie({
				...movie,
				...detailedMovie,
				trailer_url: trailerUrl,
				trailer_type: trailerType,
				has_trailer: trailerFound,
				manually_entered_trailer: false,
				available_videos: availableVideos,
			});
		} catch (error) {
			console.error("🎬 Error fetching movie details:", error);
			toast.error("Could not load trailer information");
			// Keep using the basic movie data even if fetching details fails
		} finally {
			// Clear the safety timeout and dismiss the loading toast
			clearTimeout(toastTimeout);
			toast.dismiss(loadingToast);
		}

		// Check for duplicates
		await handleDuplicateCheck(movie);
	};

	const onSubmit = async (data) => {
		// Validate required data
		if (!selectedMovie) {
			toast.error("Please select a movie from search results");
			return;
		}

		if (!selectedMovie.title || !selectedMovie.title.trim()) {
			toast.error("Selected movie must have a title");
			return;
		}

		if (!data.content || !data.content.trim()) {
			toast.error("Please provide your reaction to the movie");
			return;
		}

		// Prevent double submissions
		if (isLoading) {
			return;
		}
		
		// Check authentication status
		if (!user) {
			toast.error("Please log in to create a post", {
				duration: 4000,
				icon: '🔒',
			});
			return;
		}
		
		// Verify active session
		try {
			if (!user) {
				toast.error("Your login session has expired. Please log in again.");
				return;
			}
		} catch (err) {
			console.error("Authentication error:", err);
			toast.error("Authentication error. Please try logging out and back in.");
			return;
		}

		setIsLoading(true);
		const loadingToast = toast.loading("Creating hype check...");
		
		try {
			// Prepare poster URL (ensure full path)
			let imageUrl = selectedMovie.poster_path;
			if (imageUrl && !imageUrl.startsWith("http")) {
				imageUrl = `https://image.tmdb.org/t/p/w500${imageUrl}`;
			}

			// Create post data with correct schema field names
			// Generate a default title using our utility function
			const defaultTitle = generatePostTitle(selectedMovie.title);
			
			// Make sure we have all required data
			if (!user?.id) {
				toast.error("User session appears invalid. Please try logging in again.");
				return;
			}
			
			const postData = {
				user_id: user.id,
				title: data.title?.trim() || defaultTitle,
				movie_title: selectedMovie.title.trim(), // Required and validated
				image_url: imageUrl || null, // Matches actual schema
				trailer_url: data.trailerUrl?.trim() || null,
				content: data.content.trim() // Required and validated - matches actual schema
			};
			
			console.log("Submitting post data:", postData);

			// Create the post using the mutation
			const newPost = await createPostMutation.mutateAsync(postData);
			
			// Handle successful creation
			console.log("Created post:", newPost);
			
			if (newPost?.id) {
				toast.success("Hype check created!");
				setTimeout(() => onPostCreated?.(newPost.id), 300);
			} else {
				toast.error("Post created but missing ID. Please check your posts.");
			}
		} catch (err) {
			console.error("Post creation error:", err);
			toast.error("Something went wrong creating your post");
		} finally {
			toast.dismiss(loadingToast);
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Movie Search */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					{prefilledMovie ? "SELECTED MOVIE" : "SEARCH FOR MOVIE *"}
				</label>
				<div className="relative">
					<input
						type="text"
						{...register("searchQuery", {
							required: "Please search and select a movie",
						})}
						onChange={(e) =>
							!prefilledMovie && handleMovieSearch(e.target.value)
						}
						disabled={!!prefilledMovie}
						className={`w-full px-4 py-3 pr-12 border-3 border-black font-mono focus:outline-none transition-all ${
							prefilledMovie
								? "bg-concrete-200 text-concrete-700 cursor-not-allowed"
								: "bg-concrete-50 focus:bg-white focus:shadow-brutal-sm"
						}`}
						placeholder={
							prefilledMovie
								? prefilledMovie.title
								: "Start typing a movie title..."
						}
					/>
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						{!prefilledMovie && isSearching ? (
							<div className="animate-spin">⟳</div>
						) : (
							<Search size={18} className="text-concrete-600" />
						)}
					</div>
				</div>
				{errors.searchQuery && !prefilledMovie && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.searchQuery.message}
					</p>
				)}
				{prefilledMovie && (
					<p className="mt-1 text-theater-gold font-mono text-sm font-bold">
						✨ Movie pre-selected from upcoming releases
					</p>
				)}

				{/* Search Results */}
				{!prefilledMovie && searchResults.length > 0 && (
					<div className="mt-2 border-3 border-black bg-white max-h-64 overflow-y-auto">
						{searchResults.map((movie) => (
							<button
								key={movie.id}
								type="button"
								onClick={() => selectMovie(movie)}
								className="w-full flex items-center gap-3 p-3 hover:bg-concrete-100 transition-colors text-left border-b border-concrete-200 last:border-b-0"
							>
								{movie.poster_path && (
									<img
										src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
										alt={movie.title}
										className="w-12 h-18 object-cover border border-black flex-shrink-0"
									/>
								)}
								<div className="flex-1 min-w-0">
									<h4 className="font-mono font-bold text-concrete-900 truncate">
										{movie.title}
									</h4>
									<p className="font-mono text-xs text-concrete-600">
										{movie.release_date
											? new Date(
													movie.release_date,
												).getFullYear()
											: "TBA"}
									</p>
									{movie.overview && (
										<p className="font-mono text-xs text-concrete-500 mt-1 line-clamp-2">
											{movie.overview.substring(0, 100)}
											...
										</p>
									)}
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Selected Movie Display */}
			{selectedMovie && (
				<div className="p-4 bg-theater-gold border-3 border-black">
					<div className="flex items-center gap-2 mb-2">
						<Film size={20} className="text-black" />
						<span className="font-mono font-bold text-black">
							SELECTED MOVIE
						</span>
					</div>
					<div className="flex items-start gap-3">
						{selectedMovie.poster_path && (
							<img
								src={
									selectedMovie.poster_path.startsWith("http")
										? selectedMovie.poster_path
										: `https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`
								}
								alt={selectedMovie.title}
								className="w-16 h-24 object-cover border-3 border-black"
								onError={(e) => {
									console.log(
										"🔍 Selected movie poster failed to load:",
										e.target.src,
									);
									e.target.style.opacity = "0.5";
								}}
							/>
						)}
						<div>
							<h3 className="font-brutal text-lg text-black">
								{selectedMovie.title}
							</h3>
							<p className="font-mono text-sm text-concrete-800">
								{selectedMovie.release_date
									? new Date(
											selectedMovie.release_date,
										).getFullYear()
									: "TBA"}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Duplicate Warning */}
			{duplicateWarning && (
				<div className="p-3 bg-street-yellow border-3 border-black">
					<div className="flex items-start gap-2">
						<AlertTriangle
							size={20}
							className="text-theater-red flex-shrink-0 mt-0.5"
						/>
						<div>
							<p className="font-mono font-bold text-black text-sm mb-1">
								DISCUSSION ALREADY EXISTS
							</p>
							<p className="font-mono text-xs text-concrete-800 mb-2">
								Someone already started a discussion about this
								movie
							</p>
							<a
								href={`/post/${duplicateWarning.id}`}
								className="inline-flex items-center gap-1 text-xs font-mono font-bold text-theater-red hover:text-theater-velvet"
							>
								<ExternalLink size={12} />
								JOIN EXISTING DISCUSSION
							</a>
						</div>
					</div>
				</div>
			)}

			{/* Trailer URL Field */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					{selectedMovie?.trailer_url
						? "TRAILER LINK (AUTO-POPULATED)"
						: "TRAILER URL (OPTIONAL)"}
				</label>
				<div className="relative">
					<input
						type="url"
						{...register("trailerUrl")}
						onChange={(e) => {
							// Reset playing state when URL changes
							if (isPlayingTrailer) {
								setIsPlayingTrailer(false);
							}

							// If the user manually changes the trailer URL, update the selectedMovie state
							if (
								e.target.value &&
								e.target.value !== selectedMovie?.trailer_url
							) {
								setSelectedMovie((prev) => ({
									...prev,
									trailer_url: e.target.value,
									manually_entered_trailer: true,
								}));
							} else if (!e.target.value) {
								// If the field is cleared
								setSelectedMovie((prev) => ({
									...prev,
									trailer_url: null,
									manually_entered_trailer: false,
								}));
							}
						}}
						className={`w-full px-4 py-3 bg-concrete-50 border-3 ${
							selectedMovie?.trailer_url
								? selectedMovie?.manually_entered_trailer
									? "border-concrete-500"
									: "border-theater-gold"
								: "border-black"
						} font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all`}
						placeholder="https://www.youtube.com/watch?v=..."
					/>
					{selectedMovie?.trailer_url &&
						!selectedMovie?.manually_entered_trailer && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theater-gold">
								✓
							</div>
						)}
				</div>
				{selectedMovie?.trailer_url ? (
					<p
						className={`mt-2 text-xs font-mono font-bold ${selectedMovie?.manually_entered_trailer ? "text-concrete-600" : "text-theater-gold"}`}
					>
						{selectedMovie?.manually_entered_trailer
							? "Manual trailer URL entered"
							: "✨ Official trailer automatically found from TMDB"}
					</p>
				) : (
					<p className="mt-2 text-xs font-mono text-concrete-600">
						Add a specific trailer link if you have one
					</p>
				)}

				{/* Available Videos Dropdown */}
				{selectedMovie?.available_videos?.length > 0 && (
					<div className="mt-3 bg-concrete-100 p-3 border-l-4 border-theater-gold">
						<label className="block font-mono text-sm text-concrete-800 mb-2 font-bold">
							{selectedMovie.available_videos.length} AVAILABLE
							VIDEOS:
						</label>
						<div className="relative">
							<select
								className="w-full px-4 py-3 bg-white border-2 border-concrete-400 font-mono text-sm appearance-none"
								value={
									selectedMovie.trailer_url
										? extractYoutubeVideoId(
												selectedMovie.trailer_url,
											) || ""
										: ""
								}
								onChange={(e) => {
									if (e.target.value) {
										// Reset playing state
										if (isPlayingTrailer)
											setIsPlayingTrailer(false);

										// Get the selected video
										const videoId = e.target.value;
										const selectedVideo =
											selectedMovie.available_videos.find(
												(v) => v.key === videoId,
											);

										if (selectedVideo) {
											const newTrailerUrl = `https://www.youtube.com/watch?v=${selectedVideo.key}`;
											// Update form and state
											setValue(
												"trailerUrl",
												newTrailerUrl,
											);
											setSelectedMovie((prev) => ({
												...prev,
												trailer_url: newTrailerUrl,
												trailer_type:
													selectedVideo.type,
												manually_entered_trailer: false,
											}));

											toast.success(
												`Selected: ${selectedVideo.type} - ${selectedVideo.name}`,
												{
													duration: 2000,
												},
											);
										}
									}
								}}
							>
								<option value="">
									-- Choose a different video --
								</option>
								{selectedMovie.available_videos.map((video) => (
									<option key={video.key} value={video.key}>
										{video.type}{" "}
										{video.official ? "(Official)" : ""}:{" "}
										{video.name}
									</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-concrete-600">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</div>
						</div>
						<p className="mt-2 text-xs font-mono text-concrete-600">
							Select from all available videos for this movie
						</p>
					</div>
				)}

				{/* Trailer Preview */}
				{selectedMovie?.trailer_url && (
					<div className="mt-4 border-3 border-black">
						<div className="aspect-video bg-black relative overflow-hidden">
							{/* Embedded YouTube player */}
							{isPlayingTrailer &&
							extractYoutubeVideoId(selectedMovie.trailer_url) ? (
								<iframe
									src={`https://www.youtube.com/embed/${extractYoutubeVideoId(selectedMovie.trailer_url)}?rel=0&autoplay=1`}
									title={`${selectedMovie.title} - ${selectedMovie.trailer_type || "Trailer"}`}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									className="absolute inset-0 w-full h-full"
								/>
							) : extractYoutubeVideoId(
									selectedMovie.trailer_url,
							  ) ? (
								<div className="absolute inset-0">
									<img
										src={`https://img.youtube.com/vi/${extractYoutubeVideoId(selectedMovie.trailer_url)}/maxresdefault.jpg`}
										alt="Trailer thumbnail"
										className="w-full h-full object-cover"
										onError={(e) => {
											// Fallback to medium quality thumbnail if HD is not available
											e.target.src = `https://img.youtube.com/vi/${extractYoutubeVideoId(selectedMovie.trailer_url)}/mqdefault.jpg`;
										}}
									/>
									<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
										<button
											onClick={() =>
												setIsPlayingTrailer(true)
											}
											className="bg-theater-red hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center transition-colors"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path d="M8 5v14l11-7z" />
											</svg>
										</button>
									</div>
								</div>
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-white font-mono">
									<p>Cannot preview this video format</p>
								</div>
							)}
						</div>
						<div className="bg-concrete-800 text-white p-3 font-mono text-sm flex justify-between items-center">
							<span
								className={`font-bold ${selectedMovie.manually_entered_trailer ? "text-white" : "text-theater-gold"}`}
							>
								{selectedMovie.manually_entered_trailer
									? "MANUAL VIDEO LINK"
									: selectedMovie.trailer_type === "Teaser"
										? "✓ OFFICIAL TEASER"
										: "✓ OFFICIAL TRAILER"}
							</span>
							<div className="flex gap-3">
								{isPlayingTrailer && (
									<button
										onClick={() =>
											setIsPlayingTrailer(false)
										}
										className="hover:underline inline-flex items-center justify-center gap-1 text-white"
									>
										Close Player
									</button>
								)}
								<a
									href={selectedMovie.trailer_url}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline inline-flex items-center justify-center gap-1 text-white"
								>
									Watch on YouTube
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
										<polyline points="15 3 21 3 21 9"></polyline>
										<line
											x1="10"
											y1="14"
											x2="21"
											y2="3"
										></line>
									</svg>
								</a>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Custom Title (Optional) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					CUSTOM POST TITLE (OPTIONAL)
				</label>
				<input
					type="text"
					{...register("title")}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all"
					placeholder={
						selectedMovie
							? `${selectedMovie.title} - Your take here`
							: "Leave blank for auto-generated title"
					}
				/>
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Leave blank to auto-generate from movie title
				</p>
			</div>

			{/* Your Reaction (Required) */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					YOUR REACTION *
				</label>
				<textarea
					{...register("content", {
						required: "Please share your thoughts about this movie"
					})}
					rows={4}
					className="w-full px-4 py-3 bg-concrete-50 border-3 border-black font-mono focus:outline-none focus:bg-white focus:shadow-brutal-sm transition-all resize-none"
					placeholder="What do you think about this movie? Excited for the trailer? Share your expectations..."
				/>
				{errors.content && (
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.content.message}
					</p>
				)}
				<p className="mt-2 text-xs font-mono text-concrete-600">
					Your thoughts and expectations about the movie
				</p>
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading || !selectedMovie}
				className={`w-full flex items-center justify-center gap-2 px-6 py-4 ${
					user ? "bg-black hover:bg-gray-800" : "bg-theater-red hover:bg-red-700"
				} text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				{isLoading ? (
					"CREATING HYPE CHECK..."
				) : (
					<>
						<Plus size={20} />
						{user ? "CREATE HYPE CHECK" : "LOGIN TO CREATE POST"}
					</>
				)}
			</button>
			{!user && selectedMovie && (
				<p className="mt-2 text-center font-mono text-sm text-theater-red">
					You need to be logged in to create a post
				</p>
			)}
		</form>
	);
};

export default MovieSearchForm;
