/* globals clearHighlights, highlightFromDescriptions, initializeClock, ChessBoard, $, problems, renderFeature */

'use strict';

var boardEl = $('#board');
var fenEl = $('#fen');
var problem;
var problemIndex = 0;
var score = 0;
var filter=['loose pieces'];

/**
 * Callbacks for chessboard.
 */

// always snapback, we just want the square clicked.
var onDrop = function (source, target) {
    updateProblemState(target);
    return 'snapback';
};

function clickOnSquare(evt) {
    var target = $(this).data("square");
    updateProblemState(target);
}

$("#board").on("click", ".square-55d63", clickOnSquare);

/**
 * Config for chessboard.js
 */

var cfg = {
    draggable: true,
    onDrop: onDrop,
    moveSpeed: 'slow',
    showErrors: 'alert'
};

var board = new ChessBoard('board', cfg);

var moveToNextProblem = function () {
    clearHighlights(boardEl);
    getNextProblem();
    board.position(problem.fen);
    problem.features.forEach(renderFeature);
    updateStatus();
};

/**
 * Show status of game on screen.
 */
var updateStatus = function () {
    fenEl.html(board.fen());
    console.log(JSON.stringify(problem));
};



/**
 * pick problems in random order
 */
var getNextProblem = function () {
    problemIndex = Math.floor(Math.random() * problems.length);
    console.log("Problem : #" + problemIndex);
    problem = problems[problemIndex++];
    problem.features.forEach((feature, i) => {
        problem.features[i].todo = feature.targets.slice();
        problem.features[i].completed = [];
    });
    return problem;
};

/**
 * update the problem if target is valid and move to next puzzle if all found.
 */
function updateProblemState(target) {
    var descriptions = updateProblemFeatures(problem, target);
    if (descriptions.length === 0) {
        score--;
    }
    else {
        score++;
        highlightFromDescriptions(boardEl, target, descriptions);
        problem.features.forEach(renderFeature);
    }

    if (overallProblemTargetsRemaining(problem) === 0) {
        //move to next problem
        console.log("All targets found");
        setTimeout(moveToNextProblem, 1000);
    }
    updateStatus();
}

/**
 * Scan through all features and move matched targets into completed.
 */
function updateProblemFeatures(problem, target) {
    var identified = [];
    problem.features.forEach(feature => {
        var index = feature.todo.indexOf(target);
        if (index !== -1) {
            feature.todo.splice(index, 1);
            feature.completed.push(target);
            identified.push(feature.side + '-' + feature.description.replace(" ", "-"));
        }
    });
    return identified;
}

function overallProblemTargetsRemaining(problem) {
    var total = 0;
    problem.features.forEach(feature => {
        total += feature.todo.length;
    });
    return total;
}

/**
 * Entry point
 *
 */
$(document).ready(function () {
    console.log("Loaded " + problems.length + " problems.");
    initializeClock('clock', Date.now() + 5 * 60 * 1000);
    getNextProblem();
    console.log(JSON.stringify(problem));
    problem.features.forEach(renderFeature);
    board.position(problem.fen);
    updateStatus();
});
