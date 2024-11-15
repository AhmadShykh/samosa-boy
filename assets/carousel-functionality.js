document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".carousel-container").forEach((container) => {
    let isDragging = false;
    let startX;
    let scrollStartX;

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX;
      scrollStartX = container.scrollLeft;
      container.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        container.style.cursor = "grab";
        isDragging = false;
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const currentX = e.pageX;
      const dx = (currentX - startX) * 2; // Adjust multiplier as needed
      container.scrollLeft = scrollStartX - dx;
    });
  });
});
