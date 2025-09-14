import axios from "axios";

// ML model API endpoints
const FAKE_NEWS_API = process.env.FAKE_NEWS_API; // Example: "http://ml-server.com/api/fake-detection"
const CATEGORY_API = process.env.CATEGORY_API;   // Example: "http://ml-server.com/api/category-prediction"

/**
 * Check if an article is fake using ML API
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<boolean>} - Returns true if fake, false if genuine
 */
export const checkIfFakeArticle = async (title, content) => {
  try {
    const response = await axios.post(FAKE_NEWS_API, {
      title,
      content,
    });

    if (response.data?.isFake === undefined) {
      throw new Error("Invalid response from Fake News API");
    }

    return response.data.isFake;
  } catch (error) {
    console.error("Fake News API Error:", error.message);
    throw new Error("Unable to verify article authenticity");
  }
};

/**
 * Predict the category of the article using ML API
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<string>} - Predicted category
 */
export const predictCategory = async (title, content) => {
  try {
    const response = await axios.post(CATEGORY_API, {
      title,
      content,
    });

    if (!response.data?.category) {
      throw new Error("Invalid response from Category API");
    }

    return response.data.category;
  } catch (error) {
    console.error("Category Prediction API Error:", error.message);
    throw new Error("Unable to predict article category");
  }
};
