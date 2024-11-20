document.querySelectorAll(".delete-form").forEach(form => {
    form.addEventListener("submit", e => {
      if (!confirm("Are you sure you want to delete this item?")) {
        e.preventDefault();
      }
    });
  });
  