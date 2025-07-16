const stars = document.querySelectorAll('#ratingStars .fa-star');
const ratingInput = document.getElementById('rating');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackList = document.getElementById('feedbackList');
const complainForm = document.getElementById('complainForm');
const complainThanks = document.getElementById('complainThanks');

let selectedRating = 0;

// Star hover + click logic
stars.forEach((star, index) => {
  star.addEventListener('mouseover', () => {
    updateStars(index + 1, 'highlight');
  });

  star.addEventListener('mouseout', () => {
    updateStars(selectedRating, 'selected');
  });

  star.addEventListener('click', () => {
    selectedRating = index + 1;
    ratingInput.value = selectedRating;
    updateStars(selectedRating, 'selected');
  });
});