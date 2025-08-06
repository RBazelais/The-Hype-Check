// src/utils/duplicateDetection.js
import { supabaseHelpers } from './supabase'

export const checkForDuplicates = async (movieTitle) => {
	try {
		// Normalize the title for better matching
		const normalizedTitle = normalizeMovieTitle(movieTitle)
		
		// Search for existing posts with similar titles
		const { data, error } = await supabaseHelpers.searchPosts(normalizedTitle)
		
		if (error) {
			console.error('Error checking duplicates:', error)
			return []
		}

		// Filter for close matches
		const duplicates = data.filter(post => {
			const postTitle = normalizeMovieTitle(post.movie_title)
			return postTitle === normalizedTitle || levenshteinDistance(postTitle, normalizedTitle) <= 2
		})

		return duplicates
	} catch (error) {
		console.error('Error in duplicate detection:', error)
		return []
	}
}

const normalizeMovieTitle = (title) => {
	return title
		.toLowerCase()
		.replace(/[^\w\s]/g, '') // Remove special characters
		.replace(/\s+/g, ' ')    // Normalize whitespace
		.trim()
}

// Simple Levenshtein distance calculation for fuzzy matching
const levenshteinDistance = (str1, str2) => {
	const matrix = []

	for (let i = 0; i <= str2.length; i++) {
		matrix[i] = [i]
	}

	for (let j = 0; j <= str1.length; j++) {
		matrix[0][j] = j
	}

	for (let i = 1; i <= str2.length; i++) {
		for (let j = 1; j <= str1.length; j++) {
			if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1]
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1,     // insertion
					matrix[i - 1][j] + 1      // deletion
				)
			}
		}
	}

	return matrix[str2.length][str1.length]
}