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
      text: `${title} ${content}`, // ✅ Correct format
    },{ timeout: 5000 });

    // Extract and normalize the prediction
    const prediction = response.data?.prediction;

    if (prediction === undefined) {
      console.warn("Fake News API returned an unexpected response, defaulting to genuine.");
      return false; // Default to 'not fake' if invalid response
    }

    // Convert string to boolean
    return prediction === "true";
  } catch (error) {
    console.error("Fake News API Error:", error.message);
    console.warn("Unable to verify article authenticity, defaulting to genuine.");

    // Default to genuine if verification fails
    return false;
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
    console.log("Request Payload:", `${title} ${content}`);
    const response = await axios.post(CATEGORY_API, {
      text: `${title} ${content}`, // ✅ Send in the correct format
    });

    // Extract the predicted category properly
    const predictedCategory = response.data?.predicted_category;
    console.log(response);
    // Fallback to "General" if response is invalid
    if (!predictedCategory) {
      console.warn("Category API returned invalid response. Defaulting to 'General'.");
      return "General";
    }

    return predictedCategory;
  } catch (error) {
    console.error("Category Prediction API Error:", error.message);
    console.warn("Unable to predict article category. Defaulting to 'General'.");

    // Fallback to default category when API call fails
    return "General";
  }
};


