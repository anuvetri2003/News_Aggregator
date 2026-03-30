document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const newsCards = document.querySelectorAll(".news-card");
  function applyFilter(selectedCategory) {
    if (!filterButtons.length || !newsCards.length) return;
    filterButtons.forEach((btn) => {
      if (btn.getAttribute("data-category") === selectedCategory) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    newsCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");
      if (selectedCategory === "All" || cardCategory === selectedCategory) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.getAttribute("data-category");
      applyFilter(selectedCategory);
    });
  });
  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get("category");
  if (categoryFromUrl) {
    applyFilter(categoryFromUrl);
  } else {
    applyFilter("All");
  }
});
function shareDashboardWhatsApp() {
  const dashboardUrl = `${window.location.origin}/dashboard`;
  const text = `Renewable Energy News Dashboard\n\nCheck the latest categorized renewable energy news here:\n${dashboardUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank");
}
function shareDashboardEmail() {
  const dashboardUrl = `${window.location.origin}/dashboard`;
  const subject = encodeURIComponent("Renewable Energy News Dashboard");
  const body = encodeURIComponent(
    `Check the latest categorized renewable energy news here:\n${dashboardUrl}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}