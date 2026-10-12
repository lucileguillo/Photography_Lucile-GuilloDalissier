import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

//add images
const picsAll = document.getElementById("pics-all")
const picsSport = document.getElementById("pics-sport");
const picsConcert = document.getElementById("pics-concert");
const picsPortrait = document.getElementById("pics-portrait");
const picsLandscape = document.getElementById("pics-landscape");

const imageModules = import.meta.glob(
  "/**/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default"
  }
);

const largeImages = {
  sport: [
    "large/sport/bretagne-classic26-6.webp",
    "large/sport/bretagne-classic26.webp",
  ],
  concert: [
    "large/concert/WLG (47).webp",
    "large/concert/wlg-large.webp",
  ],
  portrait: [
    "large/portrait/portrait-large.webp",
    "large/portrait/portrait-large2.webp",
  ],
  landscape: [
    "large/paysage/BelleIle (8).webp",
    "large/paysage/paysage-large.webp",
  ],
};

function createImage(image) {
 const contentGrid = document.createElement("div");
  contentGrid.classList.add("grid__item");

  const img = document.createElement("img");

  img.className = "grid__item-img";
  img.src = image;
  img.alt = "Photographie Lucile Guillo-Dalissier";
  img.decoding = "async";

  contentGrid.appendChild(img);

  return contentGrid;
}

function shuffle(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

function displayImages(images) {
  const grid = document.querySelector(".grid");

  killColumnEffects();

  // On vide la grille
  grid.innerHTML = "";

  // On mélange puis on affiche
  shuffle(images).forEach((image) => {
    grid.appendChild(createImage(image));
  });

  requestAnimationFrame(() => {
    init();
  });
}

function displayLarge(category) {
  const header = document.getElementById("top");

  header.innerHTML = "";

  const images = largeImages[category] || [];

  images.forEach((src) => {
    const img = document.createElement("img");

    img.src = src;
    img.alt = "Photographie Lucile Guillo-Dalissier";
    img.loading = "lazy";
    img.decoding = "async";

    header.appendChild(img);
  });
}

// Affichage initial
window.addEventListener("load", () => {

  const allImages = Object.entries(imageModules)
    .filter(([path]) =>
        path.includes("/sports/") ||
        path.includes("/concerts/")
      )
      .map(([, image]) => image);

    displayImages(allImages);
    displayLarge("sport");
});

// Clic sur categories
picsAll.addEventListener("click", (event) => {
  event.preventDefault();

  const allImages = Object.entries(imageModules)
    .filter(([path]) =>
      path.includes("/sports/") ||
      path.includes("/concerts/")
    )
    .map(([, image]) => image);

    scroll(0,0)

  displayImages(allImages);
  displayLarge("sport");
});


picsSport.addEventListener("click", (event) => {
  event.preventDefault();

  const sportImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/sports/"))
    .map(([, image]) => image);

  scroll(0,0)

  displayImages(sportImages);
  displayLarge("sport");
});

picsConcert.addEventListener("click", (event) => {
  event.preventDefault();

  const concertImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/concerts/"))
    .map(([, image]) => image);

  scroll(0,0)

  displayImages(concertImages);
  displayLarge("concert");
});

picsPortrait.addEventListener("click", (event) => {
  event.preventDefault();

  const portraitImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/portraits/"))
    .map(([, image]) => image);

  scroll(0,0)

  displayImages(portraitImages);
  displayLarge("portrait");
});

picsLandscape.addEventListener("click", (event) => {
  event.preventDefault();

  const landscapeImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/Paysages/"))
    .map(([, image]) => image);

  scroll(0,0)

  displayImages(landscapeImages);
  displayLarge("landscape");
});


const smoother = ScrollSmoother.create({
  smooth: 0.6,
  effects: false,
  normalizeScroll: false,
});

const grid = document.querySelector('.grid');

const clearColumns = () => {
  grid.querySelectorAll(".grid__column").forEach((column) => {
    while (column.firstChild) {
      grid.appendChild(column.firstChild);
    }

    column.remove();
  });
};

const baseLag = 0.3;
const lagFactor = 0.15;

/**
 * Group grid items into columns based on computed CSS grid-template-columns
 * @returns {Object} An object containing the grouped columns and total column count
 */
const groupItemsByColumn = () => {
  const gridStyles = window.getComputedStyle(grid);
  const columnsRaw = gridStyles.getPropertyValue('grid-template-columns');
  const numColumns = columnsRaw.split(' ').filter(Boolean).length;

  const columns = Array.from({ length: numColumns }, () => []); 


  grid.querySelectorAll('.grid__item').forEach((item, index) => {
    columns[index % numColumns].push(item);
  });

  return { columns, numColumns };
};

/**
 * Build the DOM layout with column wrappers and grid items
 * @param {Array[]} columns - Array of item groups per column
 * @param {number} numColumns - Total number of columns
 * @returns {Array} Array of objects containing column elements and lag values
 */
const buildGrid = (columns, numColumns) => {
  const fragment = document.createDocumentFragment(); 
  const mid = -2; 
  const maxDistance = numColumns % 2 === 1 ? Math.floor(numColumns / 2) : numColumns / 2;

  const columnContainers = [];

  // Loop over each column
  columns.forEach((column, i) => {
    const distance = Math.abs(i - mid);
    const lag = baseLag + (maxDistance - distance + 1) * lagFactor; 

    const columnContainer = document.createElement('div');
    columnContainer.className = 'grid__column';

  
    column.forEach((item) => columnContainer.appendChild(item));

    fragment.appendChild(columnContainer); 
    columnContainers.push({ element: columnContainer, lag }); 
  });

  grid.appendChild(fragment); 
  return columnContainers;
};

/**
 * Apply ScrollSmoother lag effects to each column
 * @param {Array} columnContainers - Array of column elements and lag values
 */
const applyLagEffects = (columnContainers) => {
  columnContainers.forEach(({ element, lag }) => {
    smoother.effects(element, { speed: 1, lag });
  });
};

const killColumnEffects = () => {
  smoother.effects().forEach((trigger) => trigger.kill());
};

/**
 * Initialize layout and scroll effects
 */
const init = () => {
  killColumnEffects();
  clearColumns();

  const { columns, numColumns } = groupItemsByColumn();

  currentColumnCount = numColumns;

  const columnContainers = buildGrid(columns, numColumns);

  applyLagEffects(columnContainers);

  ScrollTrigger.refresh();
};

/**
 * Helper to get current column count from computed CSS
 * @returns {number} Number of columns
 */
const getColumnCount = () => {
  const styles = getComputedStyle(grid);
  return styles.getPropertyValue('grid-template-columns').split(' ').filter(Boolean).length;
};

let currentColumnCount = null;

let resizeRAF;

window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeRAF);

  resizeRAF = requestAnimationFrame(() => {
    const newColumnCount = getColumnCount();

    if (newColumnCount !== currentColumnCount) {
      init();
    }
  });
});