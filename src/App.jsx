import React, { useState, useEffect } from "react";
import bgLines from "../src/assets/lines.svg";
import title from "../src/assets/title.svg";
import blueIcon from "../src/assets/blueicon.png";
import pinkIcon from "../src/assets/pinkicon.png";
import starIcon from "../src/assets/staricon.png";

const WORDS = ["ТОВАР", "МАГАЗИН", "СКИДКА", "КЭШБЕК", "КУПОН"];

const createGrid = (words) => {
  const size = 8;
  const grid = Array(size)
    .fill("")
    .map(() => Array(size).fill(""));
  const directions = [
    [0, 1], // right
    [1, 0], // down
    [1, 1], // diagonal down-right
    [1, -1], // diagonal down-left
    [-1, 1], // diagonal up-right
    [-1, -1], // diagonal up-left
  ];
  const letters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

  words.forEach((word) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);

      if (canPlaceWord(grid, word, startX, startY, direction)) {
        placeWord(grid, word, startX, startY, direction);
        placed = true;
      }
      attempts++;
    }
    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  });

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return grid;
};

const canPlaceWord = (grid, word, x, y, [dx, dy]) => {
  const size = grid.length;
  if (
    x + dx * (word.length - 1) < 0 ||
    x + dx * (word.length - 1) >= size ||
    y + dy * (word.length - 1) < 0 ||
    y + dy * (word.length - 1) >= size
  )
    return false;

  for (let i = 0; i < word.length; i++) {
    const currentX = x + dx * i;
    const currentY = y + dy * i;
    if (grid[currentX][currentY] && grid[currentX][currentY] !== word[i])
      return false;
  }

  return true;
};

const placeWord = (grid, word, x, y, [dx, dy]) => {
  for (let i = 0; i < word.length; i++) {
    grid[x + dx * i][y + dy * i] = word[i];
  }
};

function App() {
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [lastFoundWord, setLastFoundWord] = useState(null);
  const [animatedCells, setAnimatedCells] = useState([]);
  const [showLastWord, setShowLastWord] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  // Эффект для анимации последнего найденного слова
  useEffect(() => {
    if (lastFoundWord) {
      setShowLastWord(false); // Сначала скрываем, чтобы сбросить анимацию
      // Небольшая задержка перед повторным показом для перезапуска анимации
      setTimeout(() => {
        setShowLastWord(true);
      }, 10);
    }
  }, [lastFoundWord]);

  const resetGame = () => {
    setGrid(createGrid(WORDS));
    setFoundWords([]);
    setSelectedCells([]);
    setStartCell(null);
    setLastFoundWord(null);
    setAnimatedCells([]);
    setShowLastWord(false);
  };

  const handleStart = (x, y) => {
    setIsSelecting(true);
    const cellKey = `${x},${y}`;
    setStartCell(cellKey);
    setSelectedCells([cellKey]);
  };

  const handleMove = (x, y) => {
    if (!isSelecting || !startCell) return;

    const [startX, startY] = startCell.split(",").map(Number);

    // Allow selection in straight and diagonal lines
    const dx = x - startX;
    const dy = y - startY;

    // Check if the selection is a straight line or diagonal
    if (
      dx === 0 || // vertical
      dy === 0 || // horizontal
      Math.abs(dx) === Math.abs(dy) // diagonal
    ) {
      let newSelection = [];
      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      for (let i = 0; i <= steps; i++) {
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        const nx = startX + stepX * i;
        const ny = startY + stepY * i;
        newSelection.push(`${nx},${ny}`);
      }

      setSelectedCells(newSelection);
    }
  };

  const handleEnd = () => {
    setIsSelecting(false);
    setStartCell(null);
    const selectedWord = getSelectedWord();
    if (
      WORDS.includes(selectedWord) &&
      !foundWords.find((fw) => fw.word === selectedWord)
    ) {
      const newFoundWord = {
        word: selectedWord,
        cells: [...selectedCells],
        found: Date.now(),
      };
      setFoundWords((prev) => [...prev, newFoundWord]);
      setLastFoundWord(selectedWord); // Устанавливаем новое найденное слово

      // Animate found word cells
      setAnimatedCells([...selectedCells]);

      // Reset animated cells after animation
      setTimeout(() => {
        setAnimatedCells([]);
      }, 600);
    }
    setSelectedCells([]);
  };

  const getSelectedWord = () => {
    return selectedCells
      .map((cell) => {
        const [x, y] = cell.split(",").map(Number);
        return grid[x][y];
      })
      .join("");
  };

  const isCellSelected = (x, y) => {
    return selectedCells.includes(`${x},${y}`);
  };

  const isCellInFoundWord = (x, y) => {
    return foundWords.some((word) => word.cells.includes(`${x},${y}`));
  };

  const isCellAnimated = (x, y) => {
    return animatedCells.includes(`${x},${y}`);
  };

  // Новая функция для определения нужной анимации для ячейки
  const getCellClassName = (x, y, letter) => {
    const isFound = isCellInFoundWord(x, y);
    const isSelected = isCellSelected(x, y);
    const isAnimated = isCellAnimated(x, y);

    let classes =
      "w-8 h-8 flex items-center justify-center font-bold text-lg rounded cursor-pointer select-none transition-all";

    if (isAnimated) {
      classes += " animate-cell-pop";
    }

    if (isSelected && !isFound) {
      classes += " cell-highlight";
    }

    return classes;
  };

  // Функция для получения стиля ячейки
  const getCellStyle = (x, y) => {
    const isFound = isCellInFoundWord(x, y);
    const isSelected = isCellSelected(x, y);

    return {
      backgroundColor:
        isSelected || isFound ? "white" : "rgba(255, 255, 255, 0.4)",
      transition: "background-color 0.3s ease, transform 0.3s ease",
    };
  };

  return (
    <div
      className="min-h-screen relative bg-[#B3C0FE] flex justify-center pt-20 touch-none"
      style={{ userSelect: "none" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={bgLines}
          className="w-full h-full object-cover opacity-20"
          alt=""
        />
      </div>
      <div className="relative rounded-lg p-6 max-w-[360px] w-100">
        <img
          src={title}
          alt="Title"
          className="block mx-auto max-w-[240px] w-100 h-[100px]"
        />

        <img src={blueIcon} alt="" className="absolute top-0 right-0 z-10" />
        <img src={pinkIcon} alt="" className="absolute top-25 left-0 z-10" />
        <img
          src={starIcon}
          alt=""
          className="absolute bottom-[15%] left-50 translate-x-[-50%] z-10 "
        />

        <div className="text-white text-center h-[28px] mb-2">
          <span
            className={`text-xl ${
              foundWords.length > 0 ? "animate-counter-appear" : "opacity-0"
            }`}
          >
            {foundWords.length > 0
              ? `${foundWords.length}/${WORDS.length}`
              : "0/0"}
          </span>
        </div>

        <h1
          key={lastFoundWord} // Добавил key для перерисовки компонента
          className={`
    text-xl font-bold text-white text-center h-[56px]
    ${lastFoundWord ? "animate-word-appear !text-4xl" : ""}
  `}
        >
          {lastFoundWord || "Найдите ассоциации с Едадилом"}
        </h1>

        <div
          className="grid grid-cols-8 w-[320px] gap-1 p-4 rounded-lg"
          onMouseLeave={() => {
            setIsSelecting(false);
            setSelectedCells([]);
            setStartCell(null);
          }}
        >
          {grid.map((row, x) =>
            row.map((letter, y) => (
              <div
                key={`${x}-${y}`}
                data-coords={`${x},${y}`}
                className={getCellClassName(x, y, letter)}
                style={getCellStyle(x, y)}
                onMouseDown={() => handleStart(x, y)}
                onMouseEnter={() => handleMove(x, y)}
                onMouseUp={handleEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleStart(x, y);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                  );
                  if (element && element.getAttribute("data-coords")) {
                    const coords = element
                      .getAttribute("data-coords")
                      .split(",")
                      .map(Number);
                    handleMove(coords[0], coords[1]);
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleEnd();
                }}
              >
                <span
                  className={`
                    ${
                      isCellInFoundWord(x, y) || isCellSelected(x, y)
                        ? "opacity-100 text-black"
                        : "opacity-100 text-gray-900"
                    }
                  `}
                >
                  {letter}
                </span>
              </div>
            ))
          )}
        </div>

        {/* <div className="mt-4 text-center text-white">
          <h2 className="text-xl mb-2">Найденные слова:</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {foundWords.map((fw, index) => (
              <span
                key={fw.word}
                className="bg-white text-black px-2 py-1 rounded animate-word-tag"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {fw.word}
              </span>
            ))}
          </div>
        </div> */}

        {/* <div className="text-center mt-4">
          <button
            onClick={resetGame}
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Новая игра
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default App;
