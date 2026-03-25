const filterButtons = document.querySelectorAll(".filter-btn");
const newsCards = document.querySelectorAll(".news-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedCategory = button.getAttribute("data-category");

    newsCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");

      if (selectedCategory === "All" || cardCategory === selectedCategory) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

function scrollToNews() {
  const newsSection = document.getElementById("news-section");
  if (newsSection) {
    newsSection.scrollIntoView({ behavior: "smooth" });
  }
}