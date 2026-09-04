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

function imageHeader(imageLarge) {
  const imgHeaderOne = document.createElement("img");

  imgHeaderOne.src = imageLarge;
  imgHeaderOne.alt = "Photographie Lucile Guillo-Dalissier";
  imgHeaderOne.loading = "lazy";
  imgHeaderOne.decoding = "async";


}

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

function displayLarge(imageLarge) {
  const header = document.getElementById("top")

  header.appendChild(imageHeader(imageLarge));

  requestAnimationFrame(() => {
    init();
  });
}

// // Affichage initial
// displayImages(Object.values(imageModules));

// Affichage initial
window.addEventListener("load", () => {

  const allImages = Object.entries(imageModules)
    .filter(([path]) =>
        path.includes("/sport/") ||
        path.includes("/concert/")
      )
      .map(([, image]) => image);

    displayImages(allImages);
});

// Clic sur categories
picsAll.addEventListener("click", (event) => {
  event.preventDefault();

  const allImages = Object.entries(imageModules)
    .filter(([path]) =>
      path.includes("/sport/") ||
      path.includes("/concert/")
    )
    .map(([, image]) => image);

    const large = Object.entries(imageModules)
    .filter(([path]) =>
      path.includes("/large/") 
    )
    .map(([, imageLarge]) => imageLarge);

  displayImages(allImages);
  displayLarge(large);
});


picsSport.addEventListener("click", (event) => {
  event.preventDefault();

  const sportImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/sport/"))
    .map(([, image]) => image);

  displayImages(sportImages);
});

picsConcert.addEventListener("click", (event) => {
  event.preventDefault();

  const concertImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/concert/"))
    .map(([, image]) => image);

  displayImages(concertImages);
});

picsPortrait.addEventListener("click", (event) => {
  event.preventDefault();

  const portraitImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/portrait/"))
    .map(([, image]) => image);

  displayImages(portraitImages);
});

picsLandscape.addEventListener("click", (event) => {
  event.preventDefault();

  const landscapeImages = Object.entries(imageModules)
    .filter(([path]) => path.includes("/Paysages/"))
    .map(([, image]) => image);

  displayImages(landscapeImages);
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