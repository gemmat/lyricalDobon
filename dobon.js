var idList = ["s", "w", "n", "e"]; //const
var dirs   = ["U", "R", "D", "L"]; //const
var suits  = ["C", "D", "H", "S"]; //const
var ranks  = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]; //const
var enemyWait = 1000; //const
var gameCount = 0;
var oya = 0;
var turn = 0;
var scoreVec = [0,0,0,0];
var nameVec = ["名無し","名無し","名無し","名無し"];
var cardVec = [];
var suitVec = [];
var rankVec = [];
var usedCard = 0;
var gameDirection = 1;
var dropOnly = false;
var numDraw = 0;
var state = 0;
var yamaSuit = -2;
var yamaRank = -2;
var baSuit = -2;
var baRank = -2;
var skip = false;
var messageMode = false;

function cardImage(aDirection, aSuit, aRank) {
  return "sprite-" + suits[aSuit] + ranks[aRank] + dirs[aDirection] + " card-" +  dirs[aDirection];
}

function uraImage(aDirection) {
  return "sprite-UR0" + dirs[aDirection] + " card-" + dirs[aDirection];
}

function nlImage(aDirection) {
  return "sprite-NL"  + dirs[aDirection] + " card-" + dirs[aDirection];
}

function charImage(aChar) {
  switch (aChar) {
  case 0: return "img/d_lico.png";
  case 1: return "img/d_suzu.png";
  case 2: return "img/d_wakana.png";
  case 3: return "img/d_rikka.png";
  default: return "";
  }
}

function updateScoreTable() {
  for (var i = 0; i < 4; i++) {
    document.getElementById("sc_" + idList[i]).innerHTML =
      "<small>" + nameVec[i] + "<br/>" + scoreVec[i] + "点</small>";
  }
  document.getElementById("sc_count").innerHTML =
    "<small>" +
    (gameCount <= 4) ? (gameCount + 1) + "回戦" : "結果" +
    "</small>";
}

function playerCard(aPlayer, aCard) {
  return aPlayer * 9 + aCard;
}

function cardIndex(aSuit, aRank) {
  return aSuit * 13 + aRank;
}

function takeACard() {
  var arr = [];
  for (var i = 0, len = cardVec.length; i < len; i++) {
    if (cardVec[i] == "yama") arr.push(i);
  }
  if (!arr.length) return null;
  var index = arr[Math.floor(Math.random() * arr.length)];
  cardVec[index] = "hand";
  usedCard++;
  return [Math.floor(index / 13), index % 13];
}

function dealCards() {
  var c;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 5; j++) {
      if ((j != 4) || (i != oya)) {
        var index = playerCard(i, j);
        c = takeACard();
        suitVec[index] = c[0];
        rankVec[index] = c[1];
      }
    }
  }
  c = takeACard();
  yamaSuit = c[0];
  yamaRank = c[1];
  c = takeACard();
  baSuit = c[0];
  baRank = c[1];
  document.getElementById("info").innerHTML = "<small><b>欲しいカードを選んでください</b></small>";
}

function updateCard() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 9; j++) {
      var elt = document.getElementById(idList[i] + j);
      var index = playerCard(i, j);
      if (suitVec[index] == -1) {
        elt.className = nlImage(i);
      } else if (i == 0) {
        elt.className = cardImage(i, suitVec[index], rankVec[index]);
      } else {
        elt.className = uraImage(i);
      }
    }
  }
  document.getElementById("yama").className = (yamaSuit == -2) ? uraImage(0) : cardImage(0, yamaSuit, yamaRank);
  document.getElementById("ba")  .className =   (baSuit == -2) ? uraImage(0) : cardImage(0,   baSuit,   baRank);
}

function showPlayerCard(aPlayer) {
  for (var i = 0; i < 9; i++) {
    var index = playerCard(aPlayer, i);
    var elt = document.getElementById(idList[aPlayer] + i);
    if (suitVec[index] == -1) {
      elt.className = nlImage(aPlayer);
    } else {
      elt.className = cardImage(aPlayer, suitVec[index], rankVec[index]);
    }
  }
}
function initOneGame() {
  var i = 0;
  for (i = 0; i < 4 * 13; i++) {
    cardVec[i] = "yama";
  }
  for (i = 0; i < 4 *  9; i++) {
    suitVec[i] = -1;
    rankVec[i] = -1;
  }
  usedCard = 0;
  gameDirection = 1;
  dropOnly = false;
  numDraw = 0;
  state = 0;
  dealCards();
  updateCard();
}
function init() {
  for (var i = 0; i < 4; i++) {
    nameVec[i] = document.getElementById("p" + i).value;
  }
  updateScoreTable();
  initOneGame();
}

function oyaSelection() {
  function yamaOrBa() {
    if (yamaRank == 2 - 1) return true;
    if (  baRank == 2 - 1) return false;
    if (yamaRank == 8 - 1) return true;
    if (  baRank == 8 - 1) return false;
    if (yamaRank < baRank) return true;
    return false;
  }
  var index = playerCard(turn, 4);
  if (yamaOrBa()) {
    suitVec[index] = yamaSuit;
    rankVec[index] = yamaRank;
  } else {
    suitVec[index] = baSuit;
    rankVec[index] = baRank;
    baSuit = yamaSuit;
    baRank = yamaRank;
  }
  yamaSuit = -2;
  state = 1;
  document.getElementById("info").innerHTML = "";
  updateCard();
  nextTurn();
}

function countCard(aPlayer) {
  for (var i = 0; i < 9; i++) {
    if (suitVec[playerCard(aPlayer, i)] == -1) break;
  }
  return i;
}

function countNCard(aPlayer, aN) {
  var num = 0;
  for (var i = 0; i < 9; i++) {
    var index = playerCard(aPlayer, i);
    if (suitVec[index] == -1) break;
    if (rankVec[index] == aN - 1) num++;
  }
  return num;
}

function countSpecialCard(aPlayer) {
  return countNCard(aPlayer, 1) +
         countNCard(aPlayer, 2) +
         countNCard(aPlayer, 8) +
         countNCard(aPlayer, 9);
}

function dropCheck(aPlayer) {
  var numCards = countCard(aPlayer);
  var num8     = countNCard(aPlayer, 8);
  if (numCards == 1 || numCards == num8) return false;
  if (numCards == 2 && num8     == 1)    return "almost8";
  return true;
}

function find2Card(aPlayer) {
  for (var i = 0; i < 9; i++) {
    var index = playerCard(aPlayer, i);
    if (suitVec[index] != -1 && rankVec[index] == 2 - 1) {
      return i;
    }
  }
  return false;
}
function findDropCard(aPlayer, aAlmost8) {
  for (var i = 0; i < 9; i++) {
    var index = playerCard(aPlayer, i);
    var suit = suitVec[index];
    var rank = rankVec[index];
    if (suit == -1) break;
    if (aAlmost8 && rank == 8 - 1) continue;
    if (dropOnly || suit == baSuit || rank == baRank) return i;
  }
  return false;
}

function enemyTurn() {
  var check = dropCheck(turn);
  if (check === false) {
    if (drawCard(turn)) { //can't drop
      updateCard();
      nextTurn();
    }
  } else if (numDraw > 0) {
    var pos2 = find2Card(turn); //exist 2
    if (!pos2 || check === "almost8") {
      if (drawMultiCards(turn, numDraw)) {
        numDraw = 0;
        nextTurn();
      }
    } else {
      var index = playerCard(turn, pos2);
      dropCard(suitVec[index], rankVec[index]);
      shiftCard(turn, pos2);
      updateCard();
      if (!dobonCheck(turn)) nextTurn();
    }
  } else {
    var posDrop = findDropCard(turn, check === "almost8"); // normal state;
    if (posDrop === false) {
      if (drawCard(turn)) {
        updateCard();
        nextTurn();
      }
    } else {
      var index = playerCard(turn, posDrop);
      var drop = dropCard(suitVec[index], rankVec[index]); // can drop
      shiftCard(turn, posDrop);
      updateCard();
      if (!dobonCheck(turn)) {
        if (drop == 8) {
          dropOnly = true;
          setTimeout(enemyTurn, enemyWait);
        } else {
          nextTurn();
        }
      }
    }
  }
}

function nextTurn() {
  var arrow = ["↓", "←", "↑", "→"];
  turn += gameDirection * (skip ? 2 : 1);
  skip = false;
  if (turn > 3) {
    turn -= 4;
  } else if (turn < 0) {
    turn += 4;
  }
  if (turn != 0) setTimeout(enemyTurn, enemyWait);
  showHint();
  document.getElementById("info").innerHTML = arrow[turn];
}

function nextGame(aNextOya) {
  gameCount++;
  updateScoreTable();
  if (gameCount == 5) {
    var c = Math.floor(Math.random() * 4);
    showMessage(c,
                "<b>" + nameVec[c] + "</b>:<br/>「おつかれさま。<br/>再プレイは更新ボタンでのセルフサービスとなっております。」<br/>",
                function () {});
  } else {
    clearMessage();
    turn = aNextOya;
    oya  = aNextOya;
    initOneGame();
    if (oya != 0) oyaSelection();
  }
}

function dobonCheckOnce(aPlayer) {
  var sum = 0;
  for (var i = 0; i < 9; i++) {
    var index = playerCard(aPlayer, i);
    if (suitVec[index] == -1) break;
    sum += rankVec[index] + 1;
  }
  return sum == baRank + 1;
}

function dobonCheck(aHurikomi) {
  var msg = "";
  var agariList = [];
  for (var i = 0; i < 4; i++) {
    if (i != aHurikomi && dobonCheckOnce(i)) {
      showPlayerCard(i);
      msg = "<b>" + nameVec[i] +  "</b>:<br/>「どぼん！」<br/>";
      agariList.unshift(i);
    }
  }
  if (agariList.length) {
    showMessage(agariList[0],
                msg,
                function() {
                  dobonGaeshiCheck(agariList, aHurikomi);
                });
    return true;
  }
  return false;
}

function dobonGaeshiCheck(aAgariList, aHurikomi) {
  if (dobonCheckOnce(aHurikomi)) {
    showPlayerCard(aHurikomi);
    showMessage(aHurikomi,
                "<b>" + nameVec[aHurikomi] + "</b>:<br/>「どぼん返し！」<br/>",
                function () {
                  dobonGaeshiCalc(aAgariList, aHurikomi);
                });
  } else {
    dobonCalc(aAgariList, aHurikomi);
  }
}

function dobonCalc(aAgariList, aHurikomi) {
  var msg = "";
  var baseScore = 0;
  var exScore = 0;
  var score = 0;
  for (var i = 0; i < aAgariList.length; i++) {
    var agari = aAgariList[i];
    baseScore = dobonBaseScore(agari, aHurikomi);
    exScore   = dobonExScore  (agari, aHurikomi);
    score = baseScore * (exScore + 1);
    scoreVec[agari]     += score;
    scoreVec[aHurikomi] -= score;
    msg = "<b>" +
          nameVec[agari] +
          "</b>へ<b>" +
          nameVec[aHurikomi] +
  		    "</b>から<b>" +
          score +
          "</b>点<br/>(基本点" +
          baseScore +
		      " * (1 + ドローカード" +
          exScore +
          "))<br/>";
  };
  updateScoreTable();
  showMessage(aAgariList[0],
              msg,
              function() {
                nextGame(aAgariList[0]);
              });
}

function dobonGaeshiCalc(aAgariList, aHurikomi) {
  var msg = "";
  var baseScore = 0;
  var exScore = 0;
  var score = 0;
  for (var i = 0; i < aAgariList.length; i++) {
    var agari = aAgariList[i];
    baseScore = dobonBaseScore(agari, aHurikomi);
    exScore   = dobonExScore  (agari, aHurikomi);
    score = baseScore * (exScore + 3);
    scoreVec[agari]     -= score;
    scoreVec[aHurikomi] += score;
    msg = "<b>" +
          nameVec[aHurikomi] +
          "</b>へ<b>" +
          nameVec[agari] +
  		    "</b>から<b>" +
          score +
          "</b>点<br/>(基本点" +
          baseScore +
		      " * (3 + ドローカード" +
          exScore +
          "))<br/>";
  };
  updateScoreTable();
  showMessage(aAgariList[0],
              msg,
              function() {
                nextGame(aHurikomi);
              });

}

function dobonBaseScore(aAgari, aHurikomi) {
  var acc = 0;
  for (var i = 0; i < 4; i++) {
    if (i == aAgari || i == aHurikomi) {
      acc += countSpecialCard(i);
    }
    acc += countCard(i);
  }
  return acc;
}

function dobonExScore(aAgari, aHurikomi) {
  return countNCard(aAgari, 2) + countNCard(aHurikomi, 2);
}

function showMessage(aChar, aMsg, aCont) {
  messageMode = true;
  document.getElementById("char").src =  charImage(aChar);
  document.getElementById("msgbox").innerHTML =
    aMsg + "<span class='next-game' id='next'>&gt;&gt;&gt;next&lt;&lt;&lt;</a>";
  document.getElementById("next").onclick = aCont;
}

function showHint() {
  var suitList = ["クローバー", "ダイヤ", "ハート", "スペード"];
  var numCard = countCard(0);
  var check = dropCheck(0);
  if (state == 1 && turn == 0) {
    document.getElementById("char").src = charImage(0);
    var msg = "<b>" + nameVec[0] + "</b>:<br/>";
    if (numDraw > 0) {
      msg += "(「２」が出せなかったら山札から" + numDraw + "枚取らないと...)";
    } else if (numCard == 1 || check === false) {
      msg += "(今はカードを出せないから山札から取らないと...)";
    } else {
      msg += "(「" + suitList[baSuit] + "」か「" + (baRank + 1) + "」のカードが出せる...)";
    }
    document.getElementById("msgbox").innerHTML = msg;
  } else {
    clearMessage();
  }
}

function clearMessage() {
  messageMode = false;
  document.getElementById("char").src = charImage(0);
  document.getElementById("msgbox").innerHTML = "";
}

function dropCard(aSuit, aRank) {
  if (dropOnly || baSuit == aSuit || baRank == aRank) {
    dropOnly = false;
    cardVec[cardIndex(aSuit, aRank)] = "drop";
    baSuit = aSuit;
    baRank = aRank;
    switch (aRank) {
    case 8 - 1:
      document.getElementById("info").innerHTML = "<small>もう一枚カードを選んで下さい</small>";
      return 8;
    case 9 - 1:
      gameDirection *= -1;
      break;
    case 1 - 1:
      skip = true;
      break;
    case 2 - 1:
      numDraw += 2;
      break;
    }
    return true;
  }
  return false;
}

function shiftCard(aPlayer, aPos) {
  for (var i = aPos + 1; i < 9; i++) {
    if (suitVec[playerCard(aPlayer, 1)] == -1) break;
    var index0 = playerCard(aPlayer, i - 1);
    var index1 = playerCard(aPlayer, i);
    suitVec[index0] = suitVec[index1];
    rankVec[index0] = rankVec[index1];
  }
  var index2 = playerCard(aPlayer, 8);
  suitVec[index2] = -1;
  rankVec[index2] = -1;
}

function resetCard() {
  for (var i = 0, len = 4 * 13; i < len; i++) {
    if (cardVec[i] == "drop") {
      cardVec[i] = "yama";
      usedCard--;
    }
  }
}

function drawCard(aPlayer) {
  if (countCard(aPlayer) == 9) {
    //over 10
    scoreVec[aPlayer] -= 80;
    scoreVec[0]       += 20;
    scoreVec[1]       += 20;
    scoreVec[2]       += 20;
    scoreVec[3]       += 20;
    showMessage(aPlayer,
                "<b>" + nameVec[aPlayer] + "</b>:<br/>「カードが10枚をこえちゃった...」<br/>",
                function () {
                  nextGame(turn);
                });
    return false;
  }
  if (usedCard == 52) resetCard();
  var index = playerCard(aPlayer, countCard(aPlayer));
  var c = takeACard();
  suitVec[index] = c[0];
  rankVec[index] = c[1];
  return true;
}

function drawMultiCards(aPlayer, aDraw) {
  for (var i = 0; i < aDraw; i++) {
    if (!drawCard(aPlayer)) break;
  }
  updateCard();
  return i == aDraw;
}

function yamaClick() {
  if (state == 0) {
    if (!messageMode && oya == 0) {
      var index = playerCard(0, 4);
      suitVec[index] = yamaSuit;
      rankVec[index] = yamaRank;
      yamaSuit = -2;
      state = 1;
      document.getElementById("info").innerHTML = "";
      updateCard();
      nextTurn();
    }
  } else {
    if (!messageMode && turn == 0 && !dropOnly) {
      if (numDraw == 0) {
        if (drawCard(0)) {
          updateCard();
          nextTurn();
        }
      } else {
        if (drawMultiCards(0, numDraw)) {
          numDraw = 0;
          updateCard();
          nextTurn();
        }
      }
    }
  }
}

function baClick() {
  if (!messageMode && state == 0 && oya == 0) {
    var index = playerCard(0, 4);
    suitVec[index] = baSuit;
    rankVec[index] = baRank;
    baSuit = yamaSuit;
    baRank = yamaRank;
    yamaSuit = -2;
    state = 1;
    document.getElementById("info").innerHTML = "";
    updateCard();
    nextTurn();
  }
}

function cardClick(aN) {
  if (!messageMode && state == 1 && turn == 0) {
    var check = dropCheck(0);
    var index = playerCard(0, aN);
    var suit = suitVec[index];
    var rank = rankVec[index];
    if (numDraw > 0 && rank != 2 - 1) {
      if (drawMultiCards(0, numDraw)) {
        numDraw = 0;
        nextTurn();
      }
    } else {
      if (check === false) return;
      if (check === "almost8" && rank == 8 - 1) return;
      if (dropOnly || suit == baSuit || rank == baRank) {
        var drop = dropCard(suit, rank);
        shiftCard(0, aN);
        updateCard();
        if (!dobonCheck(0)) {
          if (drop == 8) {
            dropOnly = true;
          } else {
            nextTurn();
          }
        }
      }
    }
  }
}

function main() {
  for (var i = 0; i < 9; i++) {
    document.getElementById("s" + i).onclick = (function(x) {
      return function(e) {cardClick(x);};
    })(i);
  }
  document.getElementById("ba")  .onclick = baClick;
  document.getElementById("yama").onclick = yamaClick;
  init();
}

window.onload = main;