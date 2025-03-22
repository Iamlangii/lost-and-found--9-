document.addEventListener("DOMContentLoaded", async () => {
  // Declare API and updateAuthUI
  const API = window.API || {} // Assuming API is exposed globally, or define it here
  function updateAuthUI(isAuthenticated, currentUser) {
    // Implement your UI update logic here based on authentication state
    // For example:
    if (isAuthenticated) {
      console.log("User is authenticated:", currentUser)
      // Update UI to show user info, logout button, etc.
    } else {
      console.log("User is not authenticated.")
      // Update UI to show login/register buttons, etc.
    }
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
    } else {
      // Redirect to login if not authenticated
      window.location.href = "index.html"
      return
    }
  } catch (error) {
    console.error("Authentication check error:", error)
    window.location.href = "index.html"
    return
  }

  // Update UI based on authentication state
  updateAuthUI(isAuthenticated, currentUser)

  // Populate user data
  populateUserData(currentUser)

  // Tab navigation
  const profileMenuLinks = document.querySelectorAll(".profile-menu a")
  const profileSections = document.querySelectorAll(".profile-section")

  profileMenuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all links
      profileMenuLinks.forEach((link) => link.classList.remove("active"))

      // Add active class to clicked link
      this.classList.add("active")

      // Hide all sections
      profileSections.forEach((section) => section.classList.remove("active"))

      // Show the target section
      const targetId = this.getAttribute("href").substring(1)
      document.getElementById(targetId).classList.add("active")
    })
  })

  // Edit Personal Information
  const editPersonalInfoBtn = document.getElementById("editPersonalInfoBtn")
  const cancelPersonalInfoBtn = document.getElementById("cancelPersonalInfoBtn")
  const personalInfoForm = document.getElementById("personalInfoForm")
  const formInputs = personalInfoForm.querySelectorAll("input")
  const formActions = personalInfoForm.querySelector(".form-actions")

  editPersonalInfoBtn.addEventListener("click", () => {
    // Enable form inputs
    formInputs.forEach((input) => (input.disabled = false))

    // Show form actions
    formActions.style.display = "flex"

    // Hide edit button
    editPersonalInfoBtn.style.display = "none"
  })

  cancelPersonalInfoBtn.addEventListener("click", () => {
    // Disable form inputs
    formInputs.forEach((input) => (input.disabled = true))

    // Hide form actions
    formActions.style.display = "none"

    // Show edit button
    editPersonalInfoBtn.style.display = "block"

    // Reset form to original values
    populateUserData(currentUser)
  })

  personalInfoForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    // Get form data
    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'

    try {
      // Update profile
      const response = await API.users.updateProfile(formData)

      // Update current user data
      currentUser = response.user

      // Disable form inputs
      formInputs.forEach((input) => (input.disabled = true))

      // Hide form actions
      formActions.style.display = "none"

      // Show edit button
      editPersonalInfoBtn.style.display = "block"

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Save Changes"

      // Show success message
      alert("Personal information updated successfully!")
    } catch (error) {
      alert(error.message || "Failed to update profile. Please try again.")

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Save Changes"
    }
  })

  // Change Password Modal
  const changePasswordBtn = document.getElementById("changePasswordBtn")
  const changePasswordModal = document.getElementById("changePasswordModal")
  const closeModalButtons = document.querySelectorAll(".close-modal")
  const cancelButtons = document.querySelectorAll(".cancel-btn")
  const changePasswordForm = document.getElementById("changePasswordForm")
  const newPasswordInput = document.getElementById("newPassword")
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword")
  const strengthMeter = document.getElementById("strengthMeter")
  const strengthText = document.getElementById("strengthText")
  const passwordMatch = document.getElementById("passwordMatch")
  const togglePasswordButtons = document.querySelectorAll(".toggle-password")

  // Open Change Password Modal
  changePasswordBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "block"
    document.body.style.overflow = "hidden" // Prevent scrolling
  })

  // Close modals when clicking the X button
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking the Cancel button
  cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === changePasswordModal) {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })

  // Toggle password visibility
  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target")
      const targetInput = document.getElementById(targetId)

      if (targetInput.type === "password") {
        targetInput.type = "text"
        this.classList.remove("fa-eye-slash")
        this.classList.add("fa-eye")
      } else {
        targetInput.type = "password"
        this.classList.remove("fa-eye")
        this.classList.add("fa-eye-slash")
      }
    })
  })

  // Check password strength
  newPasswordInput.addEventListener("input", function () {
    const password = this.value
    const strength = checkPasswordStrength(password)

    // Update strength meter
    strengthMeter.style.width = strength.score * 25 + "%"
    strengthMeter.style.backgroundColor = strength.color
    strengthText.textContent = strength.text
    strengthText.style.color = strength.color

    // Check if passwords match
    if (confirmNewPasswordInput.value) {
      checkPasswordsMatch()
    }
  })

  // Check if passwords match
  confirmNewPasswordInput.addEventListener("input", checkPasswordsMatch)

  function checkPasswordsMatch() {
    const password = newPasswordInput.value
    const confirmPassword = confirmNewPasswordInput.value

    if (!confirmPassword) {
      passwordMatch.textContent = ""
      passwordMatch.className = ""
      return
    }

    if (password === confirmPassword) {
      passwordMatch.textContent = "Passwords match"
      passwordMatch.className = "match-success"
    } else {
      passwordMatch.textContent = "Passwords do not match"
      passwordMatch.className = "match-error"
    }
  }

  // Check password strength
  function checkPasswordStrength(password) {
    // Default values
    let score = 0
    let color = "#e5e7eb"
    let text = "Password strength"

    if (!password) {
      return { score, color, text }
    }

    // Length check
    if (password.length >= 8) {
      score += 1
    }

    // Complexity checks
    if (/[A-Z]/.test(password)) {
      score += 1
    }

    if (/[0-9]/.test(password)) {
      score += 1
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    }

    // Set color and text based on score
    switch (score) {
      case 0:
      case 1:
        color = "#ef4444" // Red
        text = "Weak"
        break
      case 2:
        color = "#f59e0b" // Orange
        text = "Fair"
        break
      case 3:
        color = "#10b981" // Green
        text = "Good"
        break
      case 4:
        color = "#059669" // Dark green
        text = "Strong"
        break
    }

    return { score, color, text }
  }

  // Form submission for Change Password
  changePasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    // Get form values
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = newPasswordInput.value
    const confirmNewPassword = confirmNewPasswordInput.value

    // Validate form
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill in all fields")
      return
    }

    // Password validation
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }

    // Password match validation
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match")
      return
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...'

    try {
      // Change password
      await API.auth.changePassword({
        currentPassword,
        newPassword,
      })

      // Close modal
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto"

      // Reset form
      changePasswordForm.reset()

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Update Password"

      // Show success message
      alert("Password updated successfully!")
    } catch (error) {
      alert(error.message || "Failed to update password. Please try again.")

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Update Password"
    }
  })

  // Toggle two-factor authentication
  const twoFactorToggle = document.getElementById("twoFactorToggle")
  if (twoFactorToggle) {
    // Set initial state
    twoFactorToggle.checked = currentUser.twoFactorEnabled

    twoFactorToggle.addEventListener("change", async function () {
      try {
        await API.users.toggleTwoFactor(this.checked)
        alert(`Two-factor authentication ${this.checked ? "enabled" : "disabled"} successfully`)
      } catch (error) {
        alert(error.message || "Failed to update two-factor authentication. Please try again.")
        // Revert toggle state
        this.checked = !this.checked
      }
    })
  }

  // Update notification settings
  const emailNotifToggle = document.getElementById("emailNotifToggle")
  const pushNotifToggle = document.getElementById("pushNotifToggle")
  const matchAlertToggle = document.getElementById("matchAlertToggle")
  const digestToggle = document.getElementById("digestToggle")

  if (emailNotifToggle && pushNotifToggle && matchAlertToggle && digestToggle) {
    // Set initial states
    emailNotifToggle.checked = currentUser.notificationSettings?.email ?? true
    pushNotifToggle.checked = currentUser.notificationSettings?.push ?? true
    matchAlertToggle.checked = currentUser.notificationSettings?.itemMatch ?? true
    digestToggle.checked = currentUser.notificationSettings?.weeklyDigest ?? false

    // Add event listeners
    ;[emailNotifToggle, pushNotifToggle, matchAlertToggle, digestToggle].forEach((toggle) => {
      toggle.addEventListener("change", async function () {
        try {
          await API.users.updateNotificationSettings({
            email: emailNotifToggle.checked,
            push: pushNotifToggle.checked,
            itemMatch: matchAlertToggle.checked,
            weeklyDigest: digestToggle.checked,
          })
        } catch (error) {
          alert(error.message || "Failed to update notification settings. Please try again.")
          // Revert toggle state
          this.checked = !this.checked
        }
      })
    })
  }

  // Delete account
  const deleteAccountBtn = document.querySelector(".danger-btn")
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.")

      if (confirmed) {
        try {
          await API.users.deleteAccount()
          alert("Your account has been deleted successfully.")
          window.location.href = "index.html"
        } catch (error) {
          alert(error.message || "Failed to delete account. Please try again.")
        }
      }
    })
  }

  // Load user activity
  await loadUserActivity()

  // Connect Find Items and Report Item links to modals in dashboard
  const findItemsLink = document.getElementById("findItemsLink")
  const reportItemLink = document.getElementById("reportItemLink")

  if (findItemsLink) {
    findItemsLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "dashboard.html?modal=find"
    })
  }

  if (reportItemLink) {
    reportItemLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "dashboard.html?modal=report"
    })
  }

  // Function to populate user data in the form
  function populateUserData(user) {
    if (!user) return

    // Personal information
    document.getElementById("firstName").value = user.firstName || ""
    document.getElementById("lastName").value = user.lastName || ""
    document.getElementById("email").value = user.email || ""
    document.getElementById("phone").value = user.phone || ""
    document.getElementById("location").value = user.location || ""

    // Profile picture
    const profilePictures = document.querySelectorAll(".profile-picture img")
    profilePictures.forEach((img) => {
      if (user.profilePicture) {
        img.src = user.profilePicture
      }
    })
  }

  // Function to load user activity
  async function loadUserActivity() {
    try {
      const response = await API.users.getActivity()

      // Update stats
      updateActivityStats(response.stats)

      // Update timeline
      updateActivityTimeline(response.activities)
    } catch (error) {
      console.error("Error loading user activity:", error)
    }
  }

  // Function to update activity stats
  function updateActivityStats(stats) {
    if (!stats) return

    const lostCount = document.querySelector(".stat-card:nth-child(1) .stat-info h3")
    const foundCount = document.querySelector(".stat-card:nth-child(2) .stat-info h3")
    const recoveredCount = document.querySelector(".stat-card:nth-child(3) .stat-info h3")

    if (lostCount) lostCount.textContent = stats.lost || "0"
    if (foundCount) foundCount.textContent = stats.found || "0"
    if (recoveredCount) recoveredCount.textContent = stats.recovered || "0"
  }

  // Function to update activity timeline
  function updateActivityTimeline(activities) {
    if (!activities || activities.length === 0) return

    const timeline = document.querySelector(".timeline")
    if (!timeline) return

    // Clear existing timeline
    timeline.innerHTML = ""

    // Add activities to timeline
    activities.forEach((activity) => {
      const timelineItem = document.createElement("div")
      timelineItem.className = "timeline-item"

      let iconClass = ""
      let title = ""

      switch (activity.type) {
        case "lost":
          iconClass = "lost"
          title = `Reported Lost: ${activity.item?.name || "Item"}`
          break
        case "found":
          iconClass = "found"
          title = `Reported Found: ${activity.item?.name || "Item"}`
          break
        case "claimed":
        case "returned":
          iconClass = "recovered"
          title = `Item ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}: ${activity.item?.name || "Item"}`
          break
        default:
          iconClass = "lost"
          title = activity.description
      }

      timelineItem.innerHTML = `
                <div class="timeline-icon ${iconClass}">
                    <i class="fas fa-${iconClass === "lost" ? "search" : iconClass === "found" ? "box-open" : "check-circle"}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${title}</h4>
                    <p>${activity.description}</p>
                    <span class="timeline-date">${new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
            `

      timeline.appendChild(timelineItem)
    })
  }
})

