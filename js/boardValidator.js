import { Trie } from "../src/trie-prefix-tree/index.js";

function zip(arrays) {
  return arrays[0].map((_, i) => arrays.map((array) => array[i]));
}

let rowWordStack = [];
let columnWordStack = [];
let potentialPoints = [];
let wordMultiplier = [];
let potentialZipPoints = [];
let zipWordMultiplier = [];

function push2(point, multi, index) {
  potentialPoints[index].push(point);
  wordMultiplier[index].push(multi);
}
function push2Zip(point, multi, index) {
  potentialZipPoints[index].push(point);
  zipWordMultiplier[index].push(multi);
}
function isHot() {
  $("#passPlay").html("Play").attr("class", "btn btn-primary");
  $("#swapRecall").html(
    '<svg data-src="https://s.svgbox.net/materialui.svg?ic=undo" width="25" height="25" fill="currentColor"></svg> Recall'
  );
}

function isNot() {
  $("#passPlay").html("Pass").attr("class", "btn btn-primary");
  $("#swapRecall").html(
    '<svg data-src="https://s.svgbox.net/materialui.svg?ic=swap_vertical_circle" width="25" height="25" fill="currentColor"></svg> Swap'
  );
}

function playError() {
  setTimeout(() => {
    if ($("#passPlay").text() === "Pass") return;
    $("#passPlay")
      .html(
        "<svg data-src='https://s.svgbox.net/materialui.svg?ic=block' width='25' height='25' fill='currentColor'></svg> Play"
      )
      .attr("class", "btn btn-danger");
  }, 0);
}

function validate(gridState, firstTurn, wordsLogged, isPlayer) {
  let { gridLetters: board, gridMultipliers: multiplierMatrix } = gridState;
  try {
    let hasWords = true;

    !$(".column .hot").length ? isNot() : isHot();
    if (isPlayer) {
      if (firstTurn && !board[7][7].letter.trim()) {
        if (!$("#board .hot").length) return isNot();
        playError();
        throw "(45) Your word must touch an existing word or the center star";
      }

      let hotPivot;
      let hotCompare;
      let hotArr = $("#board .hot").parent().toArray();
      if (hotArr.length > 1) {
        hotArr.forEach((tile, index) => {
          hotCompare = tile.getAttribute("data-location").split(",");

          if (index === 0) hotPivot = tile.getAttribute("data-location").split(",");

          if (hotCompare[0] !== hotPivot[0] && hotCompare[1] !== hotPivot[1]) {
            if (!$("#board .hot").length) return isNot();
            playError();
            throw "(59) The letters you play must lie on the same row or column, and must be connected to each other";
          }
        });
      }
    }

    let letter = board.map((row) => row.map((obj) => obj.letter));
    let id = board.map((row) => row.map((obj) => obj.id));
    let hot = board.map((row) => row.map((obj) => obj.hot));
    let pointVal = board.map((row) => row.map((obj) => obj.pointVal));
    let multiplier = multiplierMatrix;

    let fullMatrix = {
      letterRows: letter,
      idRows: id,
      hotRows: hot,
      pointValRows: pointVal,
      multiplierRows: multiplier,
    };

    let fullMatrixZip = {
      letterColumns: zip(letter),
      idColumns: zip(id),
      hotColumns: zip(hot),
      pointValColumns: zip(pointVal),
      multiplierColumns: zip(multiplier),
    };

    let { letterRows, idRows, hotRows, pointValRows, multiplierRows } = fullMatrix;
    let { letterColumns, idColumns, hotColumns, pointValColumns, multiplierColumns } = fullMatrixZip;

    letterRows = letterRows.map((row) => row.join(""));
    letterColumns = letterColumns.map((column) => column.join(""));

    // idRows = idRows.map((row) => row.join(""));
    // idColumns = idColumns.map((column) => column.join(""));

    hotRows = hotRows.map((row) => row.join(""));
    hotColumns = hotColumns.map((column) => column.join(""));

    multiplierRows = multiplierRows.map((row) => row.join(""));
    multiplierColumns = multiplierColumns.map((column) => column.join(""));

    pointValRows = pointValRows.map((row) => row.join(""));
    pointValColumns = pointValColumns.map((column) => column.join(""));

    let words = [];
    let ids = [];
    let hotLetters = [];

    [...letterRows, ...letterColumns].map((line) =>
      line.split(" ").map((word) => {
        if (word.length > 1) return words.push(word);
      })
    );

    if (isPlayer) {
      let suspectId = [];
      [...idRows, ...idColumns].map((line) =>
        line.map((id, index) => {
          if (id === " ") return;
          let prev = line[index - 1] === " " || line[index - 1] === undefined ? true : false;
          let next = line[index + 1] === " " || line[index + 1] === undefined ? true : false;
          if (suspectId.includes(id) && id !== board[7][7].id.trim() && prev && next) {
            if (!$("#board .hot").length) return isNot();
            playError();
            throw "(37) The letters you play must lie on the same row or column, and must be connected to each other";
          }
          //prettier-ignore
          !suspectId.includes(id) && 
        prev && 
        next ? 
        suspectId.push(id) : undefined;

          if (id.length > 0) return ids.push(id);
        })
      );

      if (ids.length == 2) {
        if (!$("#board .hot").length) return isNot();
        playError();
        throw `138) Word must contain at least two letters`;
      }
    }
    let touching = false;
    let singleHot = 0;
    [...hotRows, ...hotColumns].map((line, index) =>
      line.split(" ").map((bool) => {
        if (bool === "true" && index < 15) singleHot = 1;
        if (bool === "true" && index >= 15) singleHot ? singleHot++ : undefined;
        if (bool.includes("falsetrue") || bool.includes("truefalse")) touching = true;
        if (_.without(hotLetters, "", "true").length > 1) {
          if (isPlayer) {
            if (!$("#board .hot").length) return isNot();
            playError();
            throw "(47) The letters you play must lie on the same row or column, and must be connected to each other";
          } else {
            // console.log({
            //   message: "AI error happened",
            //   board: { letters: fullMatrix.letterRows, hot: fullMatrix.hotRows },
            // });
            hasWords = false;
          }
        }
        if (bool.length > 7) return hotLetters.push(bool.replaceAll("false", ""));
      })
    );

    if ((!touching && !firstTurn) || singleHot > 1) {
      if (isPlayer) {
        if (!$("#board .hot").length) return isNot();
        playError();
        throw "(48) The letters you play must lie on the same row or column, and must be connected to each other";
      } else {
        // console.log({
        //   message: "AI error happened",
        //   board: { letters: fullMatrix.letterRows, hot: fullMatrix.hotRows },
        // });
        hasWords = false;
      }
    }

    rowWordStack = [];
    columnWordStack = [];
    potentialPoints = [];
    wordMultiplier = [];
    potentialZipPoints = [];
    zipWordMultiplier = [];
    let coords = [];
    let zipCoords = [];
    let done = false;

    fullMatrix.hotRows.forEach((row, rowIndex) => {
      if (_.without(row, " ").length > 1 && row.includes(true)) {
        row.forEach((cell, index) => {
          if (done) return;
          let prev = row[index - 1] === undefined || row[index - 1] === " " ? true : false;
          let next = row[index + 1] === undefined || row[index + 1] === " " ? true : false;
          let skip = !_.drop(row, index + 1).includes(true);
          if (cell !== " ") {
            if (prev && !skip) coords = [];
            if (cell === true && prev) {
              coords = [];
              if (!skip && prev && next && isPlayer) {
                if (!$("#board .hot").length) return isNot();
                playError();
                throw "(51) The letters you play must lie on the same row or column, and must be connected to each other";
              }
              if (prev && next) return (done = true);
            }
            if (prev && next) return;
            if (next && skip) done = true;
            coords.push([rowIndex, index]);
          }
        });
        done = false;
        if (coords.length > 1) {
          rowWordStack.push(coords);
          coords = [];
        }
      }
    });

    fullMatrixZip.hotColumns.forEach((column, columnIndex) => {
      if (_.without(column, " ").length > 1 && column.includes(true)) {
        column.forEach((cell, index) => {
          if (done) return;
          let prev = column[index - 1] === undefined || column[index - 1] === " " ? true : false;
          let next = column[index + 1] === undefined || column[index + 1] === " " ? true : false;
          let skip = !_.drop(column, index + 1).includes(true);
          if (cell !== " ") {
            if (prev && !skip) zipCoords = [];
            if (cell === true && prev) {
              zipCoords = [];
              if (!skip && prev && next && isPlayer) {
                if (!$("#board .hot").length) return isNot();
                playError();
                throw "(52) The letters you play must lie on the same row or column, and must be connected to each other";
              }
              if (prev && next) return (done = true);
            }
            if (prev && next) return;
            if (next && skip) done = true;
            zipCoords.push([columnIndex, index]);
          }
        });
        done = false;
        if (zipCoords.length > 1) {
          columnWordStack.push(zipCoords);
          zipCoords = [];
        }
      }
    });

    //prettier-ignore
    rowWordStack.forEach((coords, index) => {
      potentialPoints.push([]);
      wordMultiplier.push([]);
      coords.forEach(coord => {
        let point = +fullMatrix.pointValRows[coord[0]][coord[1]];
        let multiplier = fullMatrix.multiplierRows[coord[0]][coord[1]];
        multiplier === " " ? potentialPoints[index].push(point) : 
        multiplier === "dl" ? potentialPoints[index].push(point * 2) :
        multiplier === "tl" ? potentialPoints[index].push(point * 3) :
        multiplier === "dw" ? push2(point, 2, index) :
        multiplier === "tw" ? push2(point, 3, index) : "";
      });
    });

    //prettier-ignore
    columnWordStack.forEach((zipCoords, index) => {
      potentialZipPoints.push([]);
      zipWordMultiplier.push([]);
      zipCoords.forEach(coord => {
        let point = +fullMatrixZip.pointValColumns[coord[0]][coord[1]];
        let multiplier = fullMatrixZip.multiplierColumns[coord[0]][coord[1]];
        multiplier === " " ? potentialZipPoints[index].push(point) : 
        multiplier === "dl" ? potentialZipPoints[index].push(point * 2) :
        multiplier === "tl" ? potentialZipPoints[index].push(point * 3) :
        multiplier === "dw" ? push2Zip(point, 2, index) :
        multiplier === "tw" ? push2Zip(point, 3, index) : "";
      });
    });

    let numHot = _.without(hotLetters, "").length ? _.without(hotLetters, "").sort().reverse()[0].length / 4 : 0;
    if (isPlayer) {
      // console.log(hotLetters);
      if (_.without(hotLetters, "").length > potentialPoints.length + potentialZipPoints.length) {
        if (!$("#board .hot").length) return isNot();
        playError();
        throw "(57) The letters you play must lie on the same row or column, and must be connected to each other";
      }
    }

    _.without(words, ...wordsLogged).forEach((word) => {
      if (!Trie().hasWord(word)) {
        if (isPlayer) {
          if (!$("#board .hot").length) return isNot();
          playError();
          throw `290) The word: '${word}' is INVALID `;
        } else {
          hasWords = false;
        }
      }
      //check words validity
    }); // passing in everything but words that have already been played to make sure we are only checking new words ->faster Trie check

    let pointTally = [];

    potentialPoints.forEach((word, index) => {
      let isEmpty = wordMultiplier[index] === undefined || wordMultiplier[index] == 0 ? true : false;
      if (numHot > 6 && isPlayer) pointTally.push(50);
      if (isEmpty) return pointTally.push(_.sum(word));
      pointTally.push(_.sum(word) * _.sum(wordMultiplier[index]));
    });

    potentialZipPoints.forEach((word, index) => {
      let isEmpty = zipWordMultiplier[index] === undefined || zipWordMultiplier[index] == 0 ? true : false;
      if (numHot > 6 && isPlayer) pointTally.push(50);
      if (isEmpty) return pointTally.push(_.sum(word));
      pointTally.push(_.sum(word) * _.sum(zipWordMultiplier[index]));
    });

    pointTally = _.sum(pointTally);

    if (isPlayer) {
      !$(".column .hot").length ? isNot() : $("#passPlay").text(`Play ${pointTally}`);
    }

    if (hasWords) {
      return { words, pointTally, bestWord: _.without(words, ...wordsLogged) }; //return wordsToBeLogged, totalPotentialPoints
    } else {
      return { words, pointTally: 0 };
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}

export default validate;
