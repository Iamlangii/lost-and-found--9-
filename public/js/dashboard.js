document.addEventListener("DOMContentLoaded", async () => {
  // Mock API object (replace with actual API import)
  const API = {
    auth: {
      checkAuth: async () => {
        // Replace with actual authentication check logic
        return { isAuthenticated: true }
      },
      getCurrentUser: async () => {
        // Replace with actual user data retrieval logic
        return { user: { name: "Test User" } }
      },
    },
    items: {
      reportItem: async (formData) => {
        // Simulate reporting an item
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
      },
      getItems: async (searchData) => {
        // Simulate getting items
        const items = [
          {
            name: "Item 1",
            location: "Location 1",
            date: new Date(),
            category: "clothes",
            status: "lost",
            image: null,
          },
          { name: "Item 2", location: "Location 2", date: new Date(), category: "ids", status: "found", image: null },
        ]
        return new Promise((resolve) =>
          setTimeout(() => resolve({ items: items, pagination: { total: items.length } }), 500),
        )
      },
    },
  }

  // Mock updateAuthUI function (replace with actual implementation)
  function updateAuthUI(isAuthenticated, currentUser) {
    // Replace with actual UI update logic based on authentication state
    console.log("isAuthenticated:", isAuthenticated)
    console.log("currentUser:", currentUser)
  }

  // Check if user is authenticated
  let isAuthenticated = false
  let currentUser = null

  try {
    const authCheck = await API.auth.checkAuth()
    isAuthenticated = authCheck.isAuthenticated

    if (isAuthenticated) {
      const userData = await API.auth.getCurrentUser()
      currentUser = userData.user
    }
  } catch (error) {
    console.error("Authentication check error:", error)
  }

  // Update UI based on authentication state
  updateAuthUI(isAuthenticated, currentUser)

  // Modal functionality
  const reportItemBtn = document.getElementById("reportItemBtn")
  const findItemBtn = document.getElementById("findItemBtn")
  const reportItemModal = document.getElementById("reportItemModal")
  const findItemModal = document.getElementById("findItemModal")
  const closeModalButtons = document.querySelectorAll(".close-modal")
  const cancelButtons = document.querySelectorAll(".cancel-btn")

  // Set today's date as the default for date inputs
  const today = new Date().toISOString().split("T")[0]
  const itemDateInput = document.getElementById("itemDate")
  if (itemDateInput) {
    itemDateInput.value = today
  }

  // Check URL parameters to see if we should open a modal
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("modal") === "find") {
    findItemModal.style.display = "block"
    document.body.style.overflow = "hidden"
  } else if (urlParams.get("modal") === "report") {
    reportItemModal.style.display = "block"
    document.body.style.overflow = "hidden"
  }

  // Open Report Item Modal
  if (reportItemBtn) {
    reportItemBtn.addEventListener("click", () => {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = "index.html"
        return
      }
      reportItemModal.style.display = "block"
      document.body.style.overflow = "hidden" // Prevent scrolling
    })
  }

  // Open Find Item Modal
  if (findItemBtn) {
    findItemBtn.addEventListener("click", () => {
      findItemModal.style.display = "block"
      document.body.style.overflow = "hidden" // Prevent scrolling
    })
  }

  // Close modals when clicking the X button
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      reportItemModal.style.display = "none"
      findItemModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking the Cancel button
  cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      reportItemModal.style.display = "none"
      findItemModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === reportItemModal) {
      reportItemModal.style.display = "none"
      document.body.style.overflow = "auto"
    }
    if (event.target === findItemModal) {
      findItemModal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })

  // Form submission for Report Item
  const reportItemForm = document.getElementById("reportItemForm")
  if (reportItemForm) {
    reportItemForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      if (!isAuthenticated) {
        window.location.href = "index.html"
        return
      }

      // Get form data
      const formData = new FormData(reportItemForm)

      try {
        // Submit the report
        const response = await API.items.reportItem(formData)

        // Show success message
        alert("Item reported successfully!")

        // Close modal and reset form
        reportItemModal.style.display = "none"
        document.body.style.overflow = "auto"
        reportItemForm.reset()
        if (itemDateInput) {
          itemDateInput.value = today
        }

        // Reload the page to show the new item
        window.location.reload()
      } catch (error) {
        alert(error.message || "Failed to report item. Please try again.")
      }
    })
  }

  // Form submission for Find Item
  const findItemForm = document.getElementById("findItemForm")
  if (findItemForm) {
    findItemForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      // Get form data
      const formData = new FormData(findItemForm)
      const searchData = {}

      for (const [key, value] of formData.entries()) {
        searchData[key] = value
      }

      try {
        // Search for items
        const response = await API.items.getItems(searchData)

        // In a real application, you would display the results
        // For now, just show a message
        alert(`Found ${response.items.length} items matching your criteria.`)

        // Close modal
        findItemModal.style.display = "none"
        document.body.style.overflow = "auto"
      } catch (error) {
        alert(error.message || "Search failed. Please try again.")
      }
    })
  }

  // Category cards click event
  const categoryCards = document.querySelectorAll(".category-card")
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.querySelector("h4").textContent

      // Open find modal with pre-selected category
      findItemModal.style.display = "block"
      document.body.style.overflow = "hidden"

      // Set the category in the search form
      const categorySelect = document.getElementById("searchCategory")
      for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].text === category) {
          categorySelect.selectedIndex = i
          break
        }
      }
    })
  })

  // Load recent items
  await loadRecentItems()

  // Load category counts
  await loadCategoryCounts()

  // Responsive sidebar toggle (for mobile)
  const createMobileMenuToggle = () => {
    // Create mobile menu toggle button
    const toggleBtn = document.createElement("button")
    toggleBtn.className = "mobile-menu-toggle"
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>'
    document.querySelector(".top-header").prepend(toggleBtn)

    // Toggle sidebar on click
    toggleBtn.addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar")
      sidebar.classList.toggle("active")
    })

    // Add styles for the toggle button
    const style = document.createElement("style")
    style.textContent = `
      .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
      }
      
      @media (max-width: 768px) {
          .mobile-menu-toggle {
              display: block;
          }
          
          .sidebar {
              transform: translateX(-100%);
              z-index: 20;
          }
          
          .sidebar.active {
              transform: translateX(0);
          }
          
          .main-content {
              margin-left: 0;
              width: 100%;
          }
      }
    `
    document.head.appendChild(style)
  }

  // Initialize mobile menu for smaller screens
  if (window.innerWidth <= 768) {
    createMobileMenuToggle()
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768 && !document.querySelector(".mobile-menu-toggle")) {
      createMobileMenuToggle()
    }
  })

  // Function to load recent items from the API
  async function loadRecentItems() {
    try {
      const itemsGrid = document.querySelector(".items-grid")
      if (!itemsGrid) return

      const response = await API.items.getItems({ limit: 4 })
      const items = response.items

      // Clear existing items
      itemsGrid.innerHTML = ""

      if (items.length === 0) {
        itemsGrid.innerHTML = '<p class="no-items">No items found</p>'
        return
      }

      // Add items to the grid
      items.forEach((item) => {
        const itemCard = createItemCard(item)
        itemsGrid.appendChild(itemCard)
      })
    } catch (error) {
      console.error("Error loading recent items:", error)
    }
  }

  // Function to create an item card
  function createItemCard(item) {
    const card = document.createElement("div")
    card.className = "item-card"

    const statusClass = item.status === "lost" ? "lost" : "found"

    card.innerHTML = `
      <div class="item-status ${statusClass}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</div>
      <div class="item-image">
        <img src="${item.image || `https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}`}" alt="${item.name}">
      </div>
      <div class="item-details">
        <h4>${item.name}</h4>
        <p class="item-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
        <p class="item-date"><i class="fas fa-calendar-alt"></i> ${new Date(item.date).toLocaleDateString()}</p>
        <div class="item-category"><span>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span></div>
      </div>
    `

    return card
  }

  // Function to load category counts
  async function loadCategoryCounts() {
    try {
      const categoryCards = document.querySelectorAll(".category-card")
      if (categoryCards.length === 0) return

      // Get counts for each category
      const categories = ["clothes", "ids", "phones", "keys", "books", "laptops", "documents", "others"]

      for (const category of categories) {
        const response = await API.items.getItems({ category })
        const count = response.pagination.total

        // Find the corresponding category card and update the count
        const card = Array.from(categoryCards).find(
          (card) => card.querySelector("h4").textContent.toLowerCase() === category,
        )

        if (card) {
          const countSpan = card.querySelector(".item-count")
          if (countSpan) {
            countSpan.textContent = `${count} items`
          }
        }
      }
    } catch (error) {
      console.error("Error loading category counts:", error)
    }
  }
})

