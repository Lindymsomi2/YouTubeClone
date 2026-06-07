const LOAD_COUNT = 4;
const LOADER_DURATION = 1500;
const SCROLL_THRESHOLD = 200;

const scrollContainer = document.querySelector(".videos");
const videoGrids = document.querySelectorAll(".video-grid");
const targetGrid = videoGrids[videoGrids.length - 1];

let isLoading = false;
let lastScrollTop = 0;

function createSkeleton() {
  const skeleton = document.createElement("div");
  skeleton.className = "video video-skeleton";
  skeleton.innerHTML = `
    <div class="skeleton-thumbnail skeleton-pulse"></div>
    <div class="details">
      <div class="skeleton-avatar skeleton-pulse"></div>
      <div class="skeleton-text">
        <div class="skeleton-line skeleton-pulse"></div>
        <div class="skeleton-line skeleton-line--short skeleton-pulse"></div>
      </div>
    </div>
  `;
  return skeleton;
}

function showSkeletons() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < LOAD_COUNT; i++) {
    fragment.appendChild(createSkeleton());
  }

  targetGrid.appendChild(fragment);
}

function removeSkeletons() {
  targetGrid.querySelectorAll(".video-skeleton").forEach((skeleton) => {
    skeleton.remove();
  });
}

function getSourceVideos() {
  return Array.from(
    targetGrid.querySelectorAll(".video:not(.video-skeleton)")
  ).slice(0, LOAD_COUNT);
}

function appendDuplicateVideos() {
  const fragment = document.createDocumentFragment();

  getSourceVideos().forEach((video) => {
    const clone = video.cloneNode(true);
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    fragment.appendChild(clone);
  });

  targetGrid.appendChild(fragment);
}

function loadMoreVideos() {
  if (isLoading) return;

  isLoading = true;
  showSkeletons();

  setTimeout(() => {
    removeSkeletons();
    appendDuplicateVideos();
    isLoading = false;
  }, LOADER_DURATION);
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
  const nearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
  const scrollingDown = scrollTop > lastScrollTop;

  lastScrollTop = scrollTop;

  if (nearBottom && scrollingDown) {
    loadMoreVideos();
  }
}

scrollContainer.addEventListener("scroll", handleScroll);
