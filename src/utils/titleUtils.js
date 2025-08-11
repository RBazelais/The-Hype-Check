/**
 * Utility functions for generating consistent post titles throughout the application
 */

/**
 * Generates a standardized post title based on a movie title
 * @param {string} movieTitle - The title of the movie
 * @returns {string} A formatted post title
 */
export const generatePostTitle = (movieTitle) => {
  if (!movieTitle) return "Movie Discussion";
  return `${movieTitle} - First Impressions`;
};
