document.addEventListener("DOMContentLoaded", () => {
  // Modal functionality
  const reportItemBtn = document.getElementById("reportItemBtn")
  const findItemBtn = document.getElementById("findItemBtn")
  const reportItemModal = document.getElementById("reportItemModal")
  const findItemModal = document.getElementById("findItemModal")
  const closeModalButtons = document.querySelectorAll(".close-modal")
  const cancelButtons = document.querySelectorAll(".cancel-btn")

  // Set today's date as the default for date inputs
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("itemDate").value = today

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
  reportItemBtn.addEventListener("click", () => {
    reportItemModal.style.display = "block"
    document.body.style.overflow = "hidden" // Prevent scrolling
  })

  // Open Find Item Modal
  findItemBtn.addEventListener("click", () => {
    findItemModal.style.display = "block"
    document.body.style.overflow = "hidden" // Prevent scrolling
  })

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
  reportItemForm.addEventListener("submit", (event) => {
    event.preventDefault()

    // Get form data
    const formData = new FormData(reportItemForm)
    const itemData = {}

    for (const [key, value] of formData.entries()) {
      itemData[key] = value
    }

    // In a real application, you would send this data to a server
    console.log("Reported Item Data:", itemData)

    // Show success message (in a real app, you'd wait for server response)
    alert("Item reported successfully!")

    // Close modal and reset form
    reportItemModal.style.display = "none"
    document.body.style.overflow = "auto"
    reportItemForm.reset()
    document.getElementById("itemDate").value = today
  })

  // Form submission for Find Item
  const findItemForm = document.getElementById("findItemForm")
  findItemForm.addEventListener("submit", (event) => {
    event.preventDefault()

    // Get form data
    const formData = new FormData(findItemForm)
    const searchData = {}

    for (const [key, value] of formData.entries()) {
      searchData[key] = value
    }

    // In a real application, you would send this data to a server and display results
    console.log("Search Criteria:", searchData)

    // Show success message (in a real app, you'd display search results)
    alert("Search completed! In a real application, results would be displayed here.")

    // Close modal
    findItemModal.style.display = "none"
    document.body.style.overflow = "auto"
  })

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
})

