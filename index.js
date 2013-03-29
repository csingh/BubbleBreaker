/*
 *
 *	CSC309 A2: Block Breaker
 *	By Chandeep Singh
 *
 */

var numCols = 15; // default: 15
var numRows = 8; // default: 8
var blockDimension = 40;
var blocks = new Array(numCols);
var blockColors = new Array(numCols);
var selected = new Array(numCols);
var numSelected = 0;
var score = 0;
var selectionScore = 0;
var colors = {
	0 : "empty",
	1 : "blue",
	2 : "green",
	3 : "purple",
	4 : "red",
	5 : "yellow"
}

// Timer stuff
var t;
var sec = 0;
var min = 0;

function createBoard() {

	// Start timer
	startTimer();

	// Initialize scores
	updateScore(0);
	updateSelectionScore(0);

	// Initialize board
	var board = document.getElementById("board");
	board.style.width=numCols*blockDimension+"px";
	board.style.height=numRows*blockDimension+"px";

	// Fill board with random bubbles
	for (var i = 0; i < numCols; i++) {
		blocks[i] = new Array(numRows);
		blockColors[i] = new Array(numRows);
		selected[i] = new Array(numRows);
		for (var j = 0; j < numRows; j++) {
			blocks[i][j] = document.createElement("div");
			blockColors[i][j] = Math.floor(Math.random()*5) + 1;
			// blockColors[i][j] = Math.floor(Math.random()*5) + 1;
			blocks[i][j].className=colors[blockColors[i][j]];
			blocks[i][j].style.top=blockDimension*j+"px";
			blocks[i][j].style.left=blockDimension*i+"px";
			blocks[i][j].setAttribute("onClick", "blockClicked(" + i + "," + j + ")");
			board.appendChild(blocks[i][j]);
			selected[i][j] = false;	
		}
	}
}

function restartGame(){
	// Clear and recreate board
	clearBoard();
	createBoard();
}

function clearBoard() {
	// Clear board of all blocks
	var board = document.getElementById("board");
	for (var x = 0; x < numCols; x++) {
		for (var y = 0; y < numRows; y++) {
 			board.removeChild(blocks[x][y]);
		}
	}
	// Set username form to hidden
	var popup = document.getElementById("pop");
	popup.style.visibility = "hidden";
}

function blockClicked(i, j) {
	// Remove borders from all blocks
	removeBorders();

	if (selected[i][j] && numSelected > 1) {
		// Clicked area already selected.. 
		// so clear blocks
		updateScore(score + numSelected * numSelected);
		for (var x = 0; x < numCols; x++) {
			for (var y = 0; y < numRows; y++) {
				if (selected[x][y]) {
					selected[x][y] = false;
					blocks[x][y].className=colors[0];
					blockColors[x][y]=0;
				}
			}
		}
		gravity();
		shiftColumns();
	} else {
		// Clicked area not already selected..
		// so unselect previously selected area
		for (var x = 0; x < numCols; x++) {
			for (var y = 0; y < numRows; y++) {
				selected[x][y] = false;
			}
		}

		// Expand selection if possible
		numSelected = 0;
		if (blockColors[i][j] != 0) {
			findSelected(i, j);
		}

		updateSelectionScore(numSelected * numSelected);
	}
	// Check if game done
	isGameDone();
}

function downSame(i, j) {
	// Check if block under (i,j) has same color as (i,j)
	if (j != numRows - 1 && blockColors[i][j+1] == blockColors[i][j]) {
		return true;
	}
	return false;
}

function upSame(i, j) {
	// Check if block on top of (i,j) has same color as (i,j)
	if (j != 0 && blockColors[i][j-1] == blockColors[i][j]) {
		return true;
	}
	return false;
}

function rightSame(i, j) {
	// Check if block to the right of (i,j) has same color as (i,j)
	if (i != numCols - 1 && blockColors[i+1][j] == blockColors[i][j]) {
		return true;
	}
	return false;
}

function leftSame(i, j) {
	// Check if block to the left of (i,j) has same color as (i,j)
	if (i != 0 && blockColors[i-1][j] == blockColors[i][j]) {
		return true;
	}
	return false;
}

function findSelected(i, j) {
	// Search area for possible selection only if block(i,j) has
	// at least 1 adjacent block of the same color
	if (downSame(i, j) || upSame(i, j) || rightSame(i, j) || leftSame(i, j)) {
		findSelectedHelper(i, j);
	}
}

function findSelectedHelper(i, j) {
	// Recursively search area from (i,j) in order to select all
	// adjacent blocks of the same color
	selected[i][j] = true;
	numSelected++;

	// Add "select_" classes for borders
	if (!(downSame(i, j))) {
		blocks[i][j].className+=" select_bottom";
	}
	if (!(upSame(i, j))) {
		blocks[i][j].className+=" select_top";	
	}
	if (!(leftSame(i, j))) {
		blocks[i][j].className+=" select_left";	
	}
	if (!(rightSame(i, j))) {
		blocks[i][j].className+=" select_right";	
	}

	// Recurse to find other paths
	if (downSame(i, j) && !selected[i][j+1]) {
		findSelectedHelper(i, j+1);
	}
	if (upSame(i, j) && !selected[i][j-1]) {
		findSelectedHelper(i, j-1);	
	}
	if (rightSame(i, j) && !selected[i+1][j]) {
		findSelectedHelper(i+1, j);
	}
	if (leftSame(i, j) && !selected[i-1][j]) {
		findSelectedHelper(i-1, j);
	}
}

function removeBorders() {
	// Remove borders from all blocks
	updateSelectionScore(0);
	for (var x = 0; x < numCols; x++) {
		for (var y = 0; y < numRows; y++) {
			blocks[x][y].className=colors[blockColors[x][y]];
		}
	}
}

function gravity() {
	// Shift blocks down to fill any gaps
	for (var x = 0; x < numCols; x++) {
		for (var y = numRows - 2; y >= 0; y--) {
			if (blockColors[x][y] != 0) {
				for (var i = y; i < numRows - 1; i++) {
					if (blockColors[x][i+1] == 0) {
						swapBlocks(x, i, x, i+1);
					}
				}
			}
		}
	}
}

function swapBlocks(a, b, x, y) {
	// Swap block(a,b) with block(x,y)
	var temp;
	temp = blockColors[a][b];
	blockColors[a][b] = blockColors[x][y];
	blockColors[x][y] = temp;
	blocks[a][b].className=colors[blockColors[a][b]];
	blocks[x][y].className=colors[blockColors[x][y]];
}

function swapColumns(x1, x2) {
	// Swap column x1 with x2
	for (y = 0; y < numRows; y++) {
		swapBlocks(x1, y, x2, y);
	}
}

function isColumnEmpty(x) {
	// Return true if column x is empty
	for (var y = 0; y < numRows; y++) {
		if (blockColors[x][y] != 0) {
			return false;
		}
	}
	return true;
}

function shiftColumns() {
	// Shift columns to the left to fill up gaps from
	// empty columns
	for (var x = 1; x < numCols; x++) {
		for (var i = x; i > 0; i--) {
			if (isColumnEmpty(i-1)) {
				swapColumns(i, i-1);
			}
		}
	}
}

function updateScore(s) {
	// Update score with value s, and update display
	score = s;
	document.getElementById("score").innerHTML="Score: " + score;
}

function updateSelectionScore(s) {
	// Update selectionScore with value s, and update display
	selectionScore = s
	document.getElementById("selectionScore").innerHTML="Selection: " + selectionScore;
}

function viewTopScores(username, score) {
	// Open iframe to show scores
	var div = document.getElementById("topScores");
	var frame = document.createElement("iframe");

	// iframe will show results of topScore.pl
	// if parameters username and score given, it will run the script
	// with those parameters to add the score to the list
	url = "/cgi-bin/topScore.pl";
	if (username != null && score != null) {
		url = url + "?name=" + encodeURIComponent(username) + "&score=" + encodeURIComponent(score);
	}
	frame.src=url;
	frame.id="scoresFrame"
	div.appendChild(frame);

	// Change button value to hideTopScores()
	var button = document.getElementById("viewScores"); 
	button.innerHTML="Hide Scores";
	button.onclick=hideTopScores;
}

function hideTopScores() {
	// Delete iframe
	try {
		var div = document.getElementById("topScores");
		div.removeChild(document.getElementById("scoresFrame"));
	} catch (error) {
		console.log("id 'topScores' not found");
	}

	// Change button value viewTopScores()
	var button = document.getElementById("viewScores"); 
	button.innerHTML="View Scores";
	button.onclick=viewTopScores;
}

function submitScore() {
	var username = document.getElementById("nameform").value;
	viewTopScores(username, score);
	restartGame();
}

function startTimer() {
	sec = 0;
	min = 0;
	window.clearTimeout(t);
	updateTimer();
}

function updateTimer() {
	sec++;
	if (sec == 60) {
		sec = 0;
		min++;
	}
	document.getElementById("timer").innerHTML=getTimeString();
	t = window.setTimeout("updateTimer();", 1000);
}

function stopTimer() {
	window.clearTimeout(t);
}

function getTimeString() {
	var secStr, minStr;

	if (min < 10) {
		minStr = "0" + min;
	} else {
		minStr = "" + min;
	}

	if (sec < 10) {
		secStr = "0" + sec;
	} else {
		secStr = "" + sec;
	}

	return(minStr + ":" + secStr);
}

function isGameDone() {
	// Return true if game is done
	// Game is done if all blocks left on screen have
	// no block adjacent to them of the same color

	for (var x = 0; x < numCols; x++) {
		for (var y = 0; y < numRows; y++) {
			if (blockColors[x][y] != 0) {
				if (upSame(x,y) || downSame(x,y) || leftSame(x,y) || rightSame(x,y)) {
					return false;
				}
			}
		}
	}

	// Game is done, so stop timer and prompt for username
	console.log("The game is done!");
	stopTimer();
	hideTopScores();
	var popup = document.getElementById("pop");
	popup.style.visibility = "visible";

	return true;
}
