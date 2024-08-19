let gridSize = 3;
let tiles = [];
let blankTile;
let imageSrc;
let timer;
let startTime;
let leaderboard = [];

document
  .getElementById("image-input")
  .addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageSrc = e.target.result;
      initializePuzzle(gridSize);
    };
    reader.readAsDataURL(file);
  }
}

function selectPredefinedImage(imagePath) {
  imageSrc = imagePath;
  initializePuzzle(gridSize);
}

function initializePuzzle(size) {
  gridSize = size;
  generatePuzzle();
  renderPuzzle();
  startTimer();
}

function generatePuzzle() {
  tiles = [];
  for (let i = 0; i < gridSize * gridSize - 1; i++) {
    tiles.push(i + 1);
  }
  tiles.push(null); // 빈 타일 추가
  shuffle(tiles);

  console.log("Generated tiles:", tiles); // tiles 배열의 초기 상태를 확인
}

function renderPuzzle() {
  const puzzleContainer = document.getElementById("puzzle-container");
  if (!puzzleContainer) {
    console.error("Puzzle container not found!");
    return;
  }

  puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  puzzleContainer.innerHTML = "";

  const tileWidth = puzzleContainer.clientWidth / gridSize;
  const tileHeight = puzzleContainer.clientHeight / gridSize;

  tiles.forEach((tile, index) => {
    console.log("Processing tile:", tile, "at index:", index); // 타일과 인덱스를 확인

    const tileElement = document.createElement("div");
    tileElement.classList.add("tile");

    if (tile === null) {
      tileElement.classList.add("blank");
      blankTile = index;
    } else {
      const x = (tile - 1) % gridSize;
      const y = Math.floor((tile - 1) / gridSize);

      if (imageSrc) {
        tileElement.style.backgroundImage = `url(${imageSrc})`;
        tileElement.style.backgroundPosition = `-${x * tileWidth}px -${
          y * tileHeight
        }px`;
        tileElement.style.width = `${tileWidth}px`;
        tileElement.style.height = `${tileHeight}px`;
        tileElement.style.backgroundSize = `${gridSize * tileWidth}px ${
          gridSize * tileHeight
        }px`;
        tileElement.style.backgroundRepeat = "no-repeat";
      } else {
        // 빈 타일이 아닌 경우에만 textContent를 설정
        if (tileElement !== null && tile !== null) {
          tileElement.textContent = tile.toString();
        }
      }
    }

    tileElement.addEventListener("click", () => moveTile(index));
    puzzleContainer.appendChild(tileElement);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  console.log("Shuffled tiles:", array);
}

function moveTile(index) {
  const [x1, y1] = [index % gridSize, Math.floor(index / gridSize)];
  const [x2, y2] = [blankTile % gridSize, Math.floor(blankTile / gridSize)];

  const distance = Math.abs(x1 - x2) + Math.abs(y1 - y2);

  if (distance === 1) {
    [tiles[index], tiles[blankTile]] = [tiles[blankTile], tiles[index]];
    blankTile = index;
    renderPuzzle();
    checkPuzzleCompletion();
  } else {
    console.log("Invalid move: Tile is not adjacent to the blank space.");
  }
}

function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = formatTime(elapsedTime);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function checkPuzzleCompletion() {
  const correctOrder = Array.from(
    { length: gridSize * gridSize - 1 },
    (_, i) => i + 1
  ).concat(null);
  if (tiles.every((tile, index) => tile === correctOrder[index])) {
    console.log("Puzzle completed!");
    stopTimer();
    updateLeaderboard(Date.now() - startTime);
  }
}

function updateLeaderboard(time) {
  leaderboard.push(time);
  leaderboard.sort((a, b) => a - b); // 오름차순 정렬
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboardElement = document.getElementById("leaderboard");
  leaderboardElement.innerHTML = "<h2>Leaderboard</h2>";
  leaderboard.forEach((time, index) => {
    leaderboardElement.innerHTML += `<p>${index + 1}. Time: ${formatTime(
      time
    )}</p>`;
  });
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function loadPuzzleFromLink() {
  const params = new URLSearchParams(window.location.search);
  const puzzleState = params.get("puzzle");
  if (puzzleState) {
    const decodedState = JSON.parse(decodeURIComponent(puzzleState));
    gridSize = decodedState.gridSize;
    tiles = decodedState.tiles;
    blankTile = decodedState.blankTile;
    imageSrc = decodedState.imageSrc
      ? decodeURIComponent(decodedState.imageSrc)
      : null;
    renderPuzzle();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPuzzleFromLink();
  initializePuzzle(gridSize);
});
