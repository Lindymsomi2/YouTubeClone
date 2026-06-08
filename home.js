// this whole page was created by cursor AI, this is the JavaScript
// part that handles the infinite scroll part as well as the video pop up feature

const LOAD_COUNT = 4;
const LOADER_DURATION = 1500;
const SCROLL_THRESHOLD = 200;

//retrieves the main video container that scrolls and all the videos inside it
const scrollContainer = document.querySelector(".videos");
const videoGrids = document.querySelectorAll(".video-grid");
//target the very last video grid row to append new content to it
const targetGrid = videoGrids[videoGrids.length - 1];

//state  trackers
let isLoading = false;
let lastScrollTop = 0;
//create a fake "skeleton" loading card with pulsing animation
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
//generates the skeleton placeholders
function showSkeletons() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < LOAD_COUNT; i++) {
    fragment.appendChild(createSkeleton());
  }

  targetGrid.appendChild(fragment);
}
//finds active skeleton loader and deletes them
function removeSkeletons() {
  targetGrid.querySelectorAll(".video-skeleton").forEach((skeleton) => {
    skeleton.remove();
  });
}
//grabs the real video cards in the grid to use as a template duplicate
function getSourceVideos() {
  return Array.from(
    targetGrid.querySelectorAll(".video:not(.video-skeleton)")
  ).slice(0, LOAD_COUNT);
}
//acts as a copying machine
function appendDuplicateVideos() {
  const fragment = document.createDocumentFragment();

  getSourceVideos().forEach((video) => {
    const clone = video.cloneNode(true);
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    fragment.appendChild(clone);
  });

  targetGrid.appendChild(fragment);
}
//coordinates the loading process
function loadMoreVideos() {
  if (isLoading) return;

  isLoading = true;
  showSkeletons();
  //this is the delay timeout for the videos to load like youtube
  setTimeout(() => {
    removeSkeletons();
    appendDuplicateVideos();
    isLoading = false;
  }, LOADER_DURATION);
}
//monitors the scroll behaviour
function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
  const nearBottom =
    scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
  const scrollingDown = scrollTop > lastScrollTop;

  lastScrollTop = scrollTop;

  if (nearBottom && scrollingDown) {
    loadMoreVideos();
  }
}

scrollContainer.addEventListener("scroll", handleScroll);

//fallback video source
const DEFAULT_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const videoModal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");
const modalTitle = document.getElementById("video-modal-title");
const modalChannel = document.getElementById("video-modal-channel");
const modalAvatar = document.getElementById("video-modal-avatar");

//opens the video player popup
function openVideoModal(videoCard) {
  const title = videoCard.querySelector(".video-details p")?.textContent.trim();
  const channel = videoCard
    .querySelector(".posted-by > span")
    ?.textContent.trim();
  const thumbnail = videoCard.querySelector(".thumbnail img")?.src;
  const avatar = videoCard.querySelector(".profile img")?.src;
  const videoSrc = videoCard.dataset.videoSrc || DEFAULT_VIDEO_SRC;

  modalTitle.textContent = title || "Video";
  modalChannel.textContent = channel || "";
  modalVideo.poster = thumbnail || "";
  modalVideo.src = videoSrc;

  if (avatar) {
    modalAvatar.src = avatar;
    modalAvatar.hidden = false;
  } else {
    modalAvatar.hidden = true;
    modalAvatar.removeAttribute("src");
  }

  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  modalVideo.play().catch(() => {});
}
//clones off the media stream, resets popup values, slides out the layout overlay
// panel and restores default scroll
function closeVideoModal() {
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.removeAttribute("poster");
  modalVideo.load();

  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
//main click handler
function handleVideoCardClick(event) {
  if (event.target.closest(".video-menu, #ad-btn, button")) return;

  const videoCard = event.target.closest(
    ".video-grid .video:not(.video-skeleton)"
  );
  if (!videoCard) return;

  openVideoModal(videoCard);
}

scrollContainer.addEventListener("click", handleVideoCardClick);

videoModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-modal-close]")) {
    closeVideoModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal.classList.contains("is-open")) {
    closeVideoModal();
  }
});
