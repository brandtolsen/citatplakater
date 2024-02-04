import {
  getPossibleStartPositions,
  removeRowsUsedByElement,
  getSections,
  getIntersectionOffset,
  getRowsFromElements,
  getRandomSubsetSections,
  choice,
  flipCoin,
  randInt
} from "./utils.js";

import fontRegular from "./assets/PPObjectSans-Regular.otf";
import fontHeavy from "./assets/PPObjectSans-Heavy.otf";
import fontHeavySlanted from "./assets/PPObjectSans-HeavySlanted.otf";

export const handler = ({ inputs, mechanic, sketch }) => {
  const { width, height, citat, sæson, hvem, titel } =
    inputs;
  const hvemText = hvem.toUpperCase();
  const titelText = titel.toUpperCase();
  const citatText = citat.toLowerCase();
  const sæsonText = sæson.toUpperCase();

  let hvemElement;
  let citatElement;
  let titelElement;

  const rows = 32;
  const separation = height / rows;
  const availableRows = Array.from({ length: rows }, (_, k) => k);
  const defaultColor = "#E93036"; // Set default color

  let img;
  let imgGraphic;
  let objSansRegular;
  let objSansHeavy;
  let objSansHeavySlanted;

  const loadImageAndAddFilter = () => {
    imgGraphic = sketch.createGraphics(img.width, img.height);
    imgGraphic.image(img, 0, 0);
    imgGraphic.filter(imgGraphic.GRAY);
    imgGraphic.blendMode(imgGraphic.MULTIPLY);
    imgGraphic.noStroke();
    imgGraphic.fill(defaultColor);
    imgGraphic.rect(0, 0, img.width, img.height);
    imgGraphic.blendMode(imgGraphic.BLEND);
  };

  const drawGrid = () => {
    sketch.strokeWeight(width / (6 * 500));
    for (let i = 0; i <= 32; i++) {
      sketch.line(0, separation * i, width, separation * i);
    }
    sketch.strokeWeight(1);
  };

  const setStylingBase = () => {
    sketch.background("white");
    sketch.stroke(defaultColor);
    sketch.fill(defaultColor);
    sketch.textFont(objSansRegular);
  };

  const drawhvemElement = () => {
    const element = {};
    element.baseRowSize = randInt(3, 6);
    element.baseSize = element.baseRowSize * separation;

    const words = hvemText.split(" ");
    sketch.textSize(element.baseSize * 0.8);
    sketch.textFont(objSansHeavySlanted);
    const lengths = words.map(t => sketch.textWidth(t));
    element.length = Math.max(width / 3, ...lengths) + width / 20;

    element.startRow = choice(
      getPossibleStartPositions(
        availableRows,
        element.baseRowSize * words.length + 1
      )
    );
    element.endRow =
      element.startRow + words.length * (element.baseRowSize - 1);
    element.y = element.startRow * separation;
    element.x1 = 0;
    element.x2 = element.length + element.x1;

    let x = element.x1;
    while (x < width) {
      for (let i = 0; i < words.length; i++) {
        sketch.text(
          words[i],
          x,
          element.y + (i + 1) * (element.baseSize - separation)
        );
      }
      x += element.length;
    }

    return element;
  };

  const drawtitelElement = () => {
    const element = {};
    element.baseRowSize = 2;
    element.baseSize = element.baseRowSize * separation;

    sketch.textSize(element.baseSize);
    sketch.textStyle(sketch.NORMAL);
    element.length = sketch.textWidth(titelText) + width / 20;

    element.startRow = choice(
      getPossibleStartPositions(availableRows, element.baseRowSize + 1)
    );
    element.endRow = element.startRow + element.baseRowSize;
    element.y = element.startRow * separation;
    element.x1 = 0;
    element.x2 = element.x1 + element.length;

    sketch.text(titelText, 0, element.y + element.baseSize);

    return element;
  };

  const drawcitatElement = () => {
    const element = {};
    element.isSingleRow = flipCoin();
    element.baseRowSize = 1;
    element.baseSize = element.baseRowSize * separation;

    sketch.textSize(element.baseSize * 0.8);
    sketch.textFont(objSansRegular);
    const minLength =
      (element.isSingleRow
        ? sketch.textWidth(citatText) +
          width / 20 +
          sketch.textWidth(sæsonText)
        : Math.max(
            sketch.textWidth(citatText),
            sketch.textWidth(sæsonText)
          )) +
      width / 20;

    if (minLength + titelElement.length >= width) {
      const rowsWithoutDescription = [...availableRows];
      removeRowsUsedByElement(rowsWithoutDescription, titelElement);
      element.startRow = choice(
        getPossibleStartPositions(
          rowsWithoutDescription,
          (element.isSingleRow ? 1 : 2) * element.baseRowSize + 1
        )
      );
    } else {
      element.startRow = choice(
        getPossibleStartPositions(
          availableRows,
          (element.isSingleRow ? 1 : 2) * element.baseRowSize + 1
        )
      );
    }
    element.endRow =
      element.startRow + (element.isSingleRow ? 1 : 2) * element.baseRowSize;
    element.y = element.startRow * separation;
    const offset = getIntersectionOffset(element, [titelElement]);
    const leftWidth = width - offset;
    element.midDistance = randInt(
      Math.floor(leftWidth / 20),
      Math.floor(leftWidth / 4)
    );
    element.length =
      (element.isSingleRow
        ? Math.max(
            leftWidth / 2,
            sketch.textWidth(citatText) +
              element.midDistance +
              sketch.textWidth(sæsonText)
          )
        : Math.max(
            leftWidth / 4,
            Math.max(
              sketch.textWidth(citatText),
              sketch.textWidth(sæsonText)
            )
          )) +
      leftWidth / 20;
    element.x1 =
      offset +
      (flipCoin() ? 0 : randInt(0, Math.floor(leftWidth - element.length)));
    element.x2 = element.x1 + element.length;

    const [first, second] = flipCoin()
      ? [citatText, sæsonText]
      : [sæsonText, citatText];

    if (element.isSingleRow) {
      sketch.text(first, element.x1, element.y + element.baseSize);
      sketch.text(
        second,
        element.x1 + sketch.textWidth(first) + element.midDistance,
        element.y + element.baseSize
      );
    } else {
      const alignDateRight = flipCoin();
      if (alignDateRight) {
        sketch.textAlign(sketch.RIGHT);
      }
      sketch.text(
        first,
        alignDateRight ? element.x2 - leftWidth / 20 : element.x1,
        element.y + element.baseSize
      );
      sketch.text(
        second,
        alignDateRight ? element.x2 - leftWidth / 20 : element.x1,
        element.y + 2 * element.baseSize
      );
      if (alignDateRight) {
        sketch.textAlign(sketch.LEFT);
      }
    }

    return element;
  };

  const drawRectangle = ({ rx, ry, rw, rh }) => {
    if (img) {
      const rectRatio = rw / rh;
      const imageRatio = imgGraphic.width / imgGraphic.height;
      const sw =
        rectRatio > imageRatio
          ? imgGraphic.width
          : imgGraphic.height * rectRatio;
      const sh =
        rectRatio > imageRatio
          ? imgGraphic.width / rectRatio
          : imgGraphic.height;
      const sx = (imgGraphic.width - sw) / 2;
      const sy = (imgGraphic.height - sh) / 2;
      sketch.image(imgGraphic, rx, ry, rw, rh, sx, sy, sw, sh);
    } else {
      sketch.rect(rx, ry, rw, rh);
    }
  };

  const drawRectangles = () => {
    const maxUsedSpace = Math.max(
      hvemElement.x2,
      titelElement.x2,
      citatElement.x2
    );
    const canThereBeTwoColumns = width - maxUsedSpace > width / 4 + width / 20;
    const columnLength = width / 4;
    let bigColumnDrawn = false;
    if (canThereBeTwoColumns && flipCoin()) {
      bigColumnDrawn = true;
    }

    const elementRows = getRowsFromElements([titelElement, citatElement]);
    const usedSections = getSections(elementRows, 3);
    const freeSections = getSections(availableRows, 3);
    const sections = [
      ...getRandomSubsetSections(
        freeSections,
        freeSections.length > 2
          ? randInt(freeSections.length - 2, freeSections.length)
          : freeSections.length
      ),
      ...getRandomSubsetSections(usedSections, randInt(0, usedSections.length))
    ];

    for (const section of sections) {
      const [row, rowLength] = section;
      const rectRowHeight = rowLength;
      const separateInColumns = bigColumnDrawn || flipCoin();
      const offset = getIntersectionOffset(
        {
          startRow: row,
          endRow: row + rowLength - 1
        },
        [titelElement, citatElement]
      );
      const leftWidth = width - offset;
      const rectY = row * separation;
      const rectHeight = rectRowHeight * separation;
      if (separateInColumns) {
        drawRectangle({
          rx: offset,
          ry: rectY,
          rw: leftWidth - (columnLength + width / 20),
          rh: rectHeight
        });
        drawRectangle({
          rx: width - columnLength,
          ry: rectY,
          rw: columnLength,
          rh: rectHeight
        });
      } else {
        drawRectangle({
          rx: offset,
          ry: rectY,
          rw: leftWidth,
          rh: rectHeight
        });
      }
    }

    if (bigColumnDrawn) {
      drawRectangle({
        rx: width - columnLength,
        ry: 0,
        rw: width - columnLength,
        rh: height
      });
    }
  };

  sketch.preload = () => {
    objSansRegular = sketch.loadFont(fontRegular);
    objSansHeavy = sketch.loadFont(fontHeavy);
    objSansHeavySlanted = sketch.loadFont(fontHeavySlanted);
  };

  sketch.setup = () => {
    sketch.createCanvas(width, height);
  };

  sketch.draw = () => {
    setStylingBase();

    drawGrid();

    hvemElement = drawhvemElement();

    removeRowsUsedByElement(availableRows, hvemElement);

    titelElement = drawtitelElement();

    citatElement = drawcitatElement();

    removeRowsUsedByElement(availableRows, titelElement);
    removeRowsUsedByElement(availableRows, citatElement);

    drawRectangles();

    mechanic.done();
  };
};

export const inputs = {
  width: {
    type: "number",
    default: 595,
    editable: false
  },
  height: {
    type: "number",
    default: 842,
    editable: false
  },
  citat: {
    type: "text",
    default: "Jeg vil bare ikke spise noget der er blevet tøet op"
  },
  hvem: {
    type: "text",
    default: "Casper"
  },
  sæson: {
    type: "text",
    default: "Sæson 4"
  },
  titel: {
    type: "text",
    default: "Unge hjerter"
  }
  };
  
  export const presets = {
  A4: {
    width: 595,
    height: 842
  }
  };
  
  export const settings = {
  engine: require("@mechanic-design/engine-p5"),
  name: "Citatplakater",
  hidePresets: true,
  hideFeedback: true,
  hideAutoRefresh: true,
  hideScaleToFit: true,
  defaultPreset: "A4",
  customStyles: `
    body {
      background-color: #f0f0f0;
    }
  `
  };