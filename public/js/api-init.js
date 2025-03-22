// This script ensures the API is available globally
// Include this script before any other scripts that use the API

// Base URL for API requests - automatically detect if we're in production or development
const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api"

// Generic fetch function with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    // Set default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Include cookies for session
    })

    // Parse the JSON response
    const data = await response.json()

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Authentication API functions
const auth = {
  // Register a new user
  register: async (userData) => {
    return await fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  // Login user
  login: async (credentials) => {
    return await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  // Logout user
  logout: async () => {
    return await fetchAPI("/auth/logout", {
      method: "POST",
    })
  },

  // Check if user is authenticated
  checkAuth: async () => {
    return await fetchAPI("/auth/check")
  },

  // Get current user
  getCurrentUser: async () => {
    return await fetchAPI("/auth/me")
  },

  // Change password
  changePassword: async (passwordData) => {
    return await fetchAPI("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    })
  },
}

// User API functions
const users = {
  // Get user profile
  getProfile: async () => {
    return await fetchAPI("/users/profile")
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await fetchAPI("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  },

  // Update profile picture
  updateProfilePicture: async (formData) => {
    return await fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then((response) => response.json())
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    return await fetchAPI("/users/notification-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  },

  // Toggle two-factor authentication
  toggleTwoFactor: async (enabled) => {
    return await fetchAPI("/users/two-factor", {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    })
  },

  // Get user activity
  getActivity: async () => {
    return await fetchAPI("/users/activity")
  },

  // Delete account
  deleteAccount: async () => {
    return await fetchAPI("/users/account", {
      method: "DELETE",
    })
  },
}

// Item API functions
const items = {
  // Report a lost or found item
  reportItem: async (formData) => {
    return await fetch(`${API_BASE_URL}/items`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then((response) => response.json())
  },

  // Get all items with filtering
  getItems: async (filters = {}) => {
    // Build query string from filters
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    return await fetchAPI(`/items?${queryParams.toString()}`)
  },

  // Get item by ID
  getItemById: async (id) => {
    return await fetchAPI(`/items/${id}`)
  },

  // Update item
  updateItem: async (id, itemData) => {
    return await fetchAPI(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    })
  },

  // Mark item as claimed/returned
  updateItemStatus: async (id, status) => {
    return await fetchAPI(`/items/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },

  // Delete item
  deleteItem: async (id) => {
    return await fetchAPI(`/items/${id}`, {
      method: "DELETE",
    })
  },

  // Get user's items
  getUserItems: async () => {
    return await fetchAPI("/items/user/me")
  },
}

// Export the API functions globally
window.API = {
  auth,
  users,
  items,
}

// Define updateAuthUI globally
window.updateAuthUI = (isAuthenticated, user) => {
  const loginButtons = document.querySelectorAll(".login-btn, .header-login-btn")
  const logoutButtons = document.querySelectorAll(".logout-btn")
  const userProfile = document.querySelector(".user-profile")
  const welcomeMessage = document.querySelector(".welcome-message")

  if (isAuthenticated && user) {
    // User is logged in
    loginButtons.forEach((btn) => (btn.style.display = "none"))
    logoutButtons.forEach((btn) => (btn.style.display = "flex"))

    if (userProfile) {
      userProfile.style.display = "flex"
      const userImage = userProfile.querySelector("img")
      const userName = userProfile.querySelector("span")

      if (userImage && user.profilePicture) {
        userImage.src = user.profilePicture
      }

      if (userName) {
        userName.textContent = `${user.firstName} ${user.lastName}`
      }
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome back, ${user.firstName}! Here's what's happening with your lost and found items.`
    }
  } else {
    // User is logged out
    loginButtons.forEach((btn) => (btn.style.display = "flex"))
    logoutButtons.forEach((btn) => (btn.style.display = "none"))

    if (userProfile) {
      userProfile.style.display = "none"
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = "Welcome to Lost & Found! Sign in to report or find lost items."
    }
  }
}

