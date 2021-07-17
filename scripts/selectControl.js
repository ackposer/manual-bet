const meetings = document.querySelector('#meetings');
const firstMeeting = meetings.children[0].value;
const times = document.querySelector('#times');
const contestants = document.querySelector('#contestants');
const radio = document.getElementsByName('unnamed-favorite');
const addSelectionBtn = document.getElementById('add-selection');
const addBetBtn = document.getElementById('add-bet');
const sp = document.getElementById('sp');
const odds = document.getElementById('odds');
const stake = document.getElementById('stake');
const outcome = document.getElementById('outcome');
const betType = document.getElementById('bet-type');
const totalStake = document.getElementById('total-stake');
const generateManBetBtn = document.getElementById('generate');
const textArea = document.getElementById('slip');
const nextBtn = document.getElementById('next-bet-btn');
const bets = document.getElementById('bets');
const copy = document.getElementById('copy');
copy.addEventListener('click', copyManualBet);
let currentSlip = 0;
let selId = 0;
let betId = 0;

let listOfBets = `[{\"name\":\"Single\",\"symbol\":\"SGL\"},{\"name\":\"Double\",\"symbol\":\"DBL\"},{\"name\":\"Treble\",\"symbol\":\"TBL\"},{\"name\":\"Trixie\",\"symbol\":\"TRX\"},{\"name\":\"Patent\",\"symbol\":\"PAT\"},{\"name\":\"Round Robin\",\"symbol\":\"ROB\"},{\"name\":\"Yankee\",\"symbol\":\"YAN\"},{\"name\":\"Lucky15\",\"symbol\":\"L15\"},{\"name\":\"Flag\",\"symbol\":\"FLG\"},{\"name\":\"Canadian\",\"symbol\":\"CAN\"},{\"name\":\"Lucky31\",\"symbol\":\"L31\"},{\"name\":\"Heinz\",\"symbol\":\"HNZ\"},{\"name\":\"Lucky63\",\"symbol\":\"L63\"},{\"name\":\"Super Heinz\",\"symbol\":\"SHNZ\"},{\"name\":\"Goliath\",\"symbol\":\"GOL\"},{\"name\":\"Union Jack Treble\",\"symbol\":\"Union Jack TBL\"},
{\"name\":\"Union Jack Trixie\",\"symbol\":\"Union Jack TRX\"},{\"name\":\"Union Jack Patent\",\"symbol\":\"Union Jack PAT\"},
{\"name\":\"Union Jack Round Robin\",\"symbol\":\"Union Jack ROB\"},{\"name\":\"Single Stakes About\",\"symbol\":\"SS2\"},{\"name\":\"Double Stakes About\",\"symbol\":\"DS2\"},{\"name\":\"Doubles\",\"symbol\":\"P-23\"},{\"name\":\"Trebles\",\"symbol\":\"P-34\"},{\"name\":\"Fourfolds\",\"symbol\":\"ACC4\"},{\"name\":\"Fivefolds\",\"symbol\":\"ACC5\"},{\"name\":\"Sixfolds\",\"symbol\":\"ACC6\"},{\"name\":\"Sevenfolds\",\"symbol\":\"ACC7\"},{\"name\":\"Eightfolds\",\"symbol\":\"ACC8\"},{\"name\":\"Ninefolds\",\"symbol\":\"ACC9\"},{\"name\":\"Tenfolds\",\"symbol\":\"ACC10\"},{\"name\":\"ElevenFolds\",\"symbol\":\"ACC11\"},{\"name\":\"Twelvefolds\",\"symbol\":\"ACC12\"},{\"name\":\"Thirteenfolds\",\"symbol\":\"ACC13\"},{\"name\":\"Fourteenfolds\",\"symbol\":\"ACC14\"},{\"name\":\"3 by 4\",\"symbol\":\"3BY4\"},{\"name\":\"4 by 5\",\"symbol\":\"4BY5\"},{\"name\":\"Lucky6\",\"symbol\":\"LY6\"},{\"name\":\"Lucky10\",\"symbol\":\"LY10\"},{\"name\":\"Lucky11\",\"symbol\":\"LY11\"},{\"name\":\"Yap\",\"symbol\":\"YAP\"},{\"name\":\"Fivespot\",\"symbol\":\"FSP\"},{\"name\":\"Pontoon\",\"symbol\":\"PON\"},{\"name\":\"Lucky 7 Bingo\",\"symbol\":\"L7B\"},{\"name\":\"Magnificent7\",\"symbol\":\"MAG7\"}]`;


const slips = [{
  bet: [],
  selection: [],
  id: 0
}];

showSlips();
nextBtn.addEventListener('click', nextSlip);

function copyManualBet() {
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    console.log('Successfully copied to clipboard.');
  } catch (err) {
    console.log(err);
  }
}

function displayLength(text) {
  const slipLengthPara = document.getElementById('slip-length');
  let textColor = text.length >= 255 ? 'text-danger' : 'text-success';
  slipLengthPara.innerHTML = `The string is <span class=${textColor}>${text.length}</span> characters long.`;
}

function populateBetTypes() {
  listOfBets = JSON.parse(listOfBets);

  listOfBets.forEach(bet => {
    const option = document.createElement('option');
    option.value = bet.symbol;
    option.textContent = bet.name;
    betType.appendChild(option);
  });
}

// generate the bet options for the interface
populateBetTypes();

function nextSlip() {
  currentSlip++;
  clearEmptySlips();
  slips.push({
    bet: [],
    selection: [],
    id: currentSlip
  });

  showSlips();
}

function clearEmptySlips() {
  for (const [index, slip] of slips.entries()) {
    let {selection, bet} = slip;

    if(!selection.length && !bet.length && index !== currentSlip) {
      removeSlip(index);  

      // if the slip is before the current one
      // we need to decrement so that we stay on the same slip
      if(index < currentSlip) {
        currentSlip--;
      }
    }
  };
}

function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

function removeSlip(emptySlipIndex) {
  slips.splice(emptySlipIndex, 1);
}

generateManBetBtn.addEventListener('click', createTextString);

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function showSlips() {
  bets.innerHTML = '';
  for (let [index, slip] of slips.entries()) {
    const gridRows = findLongestElementRow(slip);
    const slipContainer = document.createElement('div');
    slipContainer.setAttribute('class', 'container-fluid slip-container');
    slipContainer.setAttribute('id', index);
    slipContainer.addEventListener('click', changeActiveSlip);
    const betDisplay = document.createElement('div');
    betDisplay.setAttribute('class', 'bet-body bet-display');
    const selDisplay = document.createElement('div');
    selDisplay.setAttribute('class', 'slip-body sel-display');
    betDisplay.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    selDisplay.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    slipContainer.appendChild(betDisplay);
    slipContainer.appendChild(selDisplay);
    bets.appendChild(slipContainer);
    const hr = document.createElement('hr');
    // check index instead of id, so that if the order changes
    // the selection is unaffected
    if (index === currentSlip) {
      hr.classList.add('active');
    }
    hr.classList.add('divider');
    bets.appendChild(hr);
    displaySelections(selDisplay, slip);
    displayBets(betDisplay, slip);
  }
}

function changeActiveSlip(e) {
  currentSlip = Number(e.currentTarget.getAttribute('id'));
  clearEmptySlips();
  showSlips();
}

function findLongestElementRow(slip) {
  const betLen = slip.bet.length;
  const selLen = slip.selection.length;

  return betLen-selLen < 0 ? selLen : betLen;
}

function createTextString() {
  textArea.innerHTML = '';
  textArea.value = '';
  let str = '';

  for (let [index, slip] of slips.entries()) {
    let unnamedFavorite = false;
    let unnamedFavorite2 = false;
    for (let selection of slip.selection) {
      if(selection.horseName === '1st Unnamed Favorite') {
        unnamedFavorite = true;
      } else if(selection.horseName === "2nd Unnamed Favorite") {
        unnamedFavorite2 = true;
      }
    }

    if(index > 0) {
      str+='\n\n';
    }

    for (let bet of slip.bet) {
      if(slip.bet.length > 0) {
        str+=`£${bet.stake} ${bet.betType} ${bet.outcome}\n`;
      } else {
        str+=`£${bet.stake} ${bet.betType} ${bet.outcome}`;
      }
    }

    if(unnamedFavorite) {
      str+='\n1st Unnamed Favorite';
    } else if(unnamedFavorite2) {
      str+='\n2nd Unnamed Favorite';
    }
    for (let selection of slip.selection) {
      if(unnamedFavorite || unnamedFavorite2) {
        str+=`\n${selection.meetingTime} ${selection.meetingName}`;
      } else {
        str+=`\n(${selection.horseNumber}) ${selection.horseName} ${selection.meetingTime} ${selection.meetingName} ${selection.selectedOdds}`;
      }
    }

    textArea.innerHTML = str;
    textArea.value = str;
    displayLength(str);
  }

  str+=`\n\nTotal stake: £${toSecondDecimal(totalStake.value || 0)}`;

  textArea.innerHTML = str;
  textArea.value = str;
  autoGrow(slip);
}

function toSecondDecimal(num) {
  return Number.parseFloat(num).toFixed(2);
}

activateQuickPriceBtn();
changeTimesVal(firstMeeting);

addSelectionBtn.addEventListener('click', addToSlipSel);
addBetBtn.addEventListener('click', addToSlipBet);

toggleOdds();
sp.addEventListener('change', toggleOdds);

function toggleOdds() {
  if(sp.checked) {
    odds.disabled = true;
  } else {
    odds.disabled = false;
  }
}

function activateQuickPriceBtn() {
  const quickPrices = document.getElementsByClassName('quick-price');
  for (let btn of quickPrices) {
    btn.addEventListener('click', quickPriceBtnAction);
  }
};

function quickPriceBtnAction(e) {
  const val = e.target.textContent;
  stake.value = val;
}

meetings.addEventListener('change', (e) => {
  const meeting = e.target.value;
  changeTimesVal(meeting);
  changeContestantsVal(meeting, times.value);
});

times.addEventListener('change', e => {
  const time = e.target.value;
  changeContestantsVal(meetings.value, time);
});

function changeTimesVal(meeting) {
  let first;

  for(let i = 0; i < times.length; i++) {
    times[i].classList.add('hidden');
    times[i].disabled = true;
    if(times[i].classList.contains(meeting)) {
      first = !first && first !== 0 ? i : first;
      times[i].classList.remove('hidden');
      times[i].disabled = false;
    }
  }

  changeContestantsVal(meeting, times.value);
  times.selectedIndex = first;
};

function changeContestantsVal(meeting, time) {
  let first;

  for(let i = 0; i < contestants.length; i++) {
    contestants[i].classList.add('hidden');
    contestants[i].disabled = true;
    if(contestants[i].classList.contains(meeting) && contestants[i].classList.contains(time)) {
      first = !first && first !== 0 ? i : first;
      contestants[i].classList.remove('hidden');
      contestants[i].disabled = false;
    }

    if(contestants[i].classList.contains('constant')) {
      contestants[i].classList.remove('hidden');
      contestants[i].disabled = false;
    }
  }

  if(contestants.value !== '1st Unnamed Favorite' && contestants.value !== '2nd Unnamed Favorite') {
    contestants.selectedIndex = first;
  }
}

function displaySelections(slipBody, slip) {
  slip.selection.forEach(selection => {
    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-primary');
    const btnText = document.createTextNode('\u00D7');
    btn.appendChild(btnText);
    // creates table row and table data
    for(let prop in selection) {
      if(prop !== 'id') {
        const div = document.createElement('div');
        const divContent = document.createTextNode(selection[prop]);
        div.appendChild(divContent);
        slipBody.appendChild(div);
      }
    }

    btn.addEventListener('click', () => removeItem(slip, selection.id, 'selection'));
    slipBody.appendChild(btn);
    // const tbodyStr = `<td>${selection.horseNumber}</td>
    // <td>${selection.horseName}</td>
    // <td>${selection.meetingTime}</td>
    // <td>${selection.meetingName}</td>
    // <td>${selection.selectedOdds}</td>`;
  });
}

function removeItem(targetSlip, id, type) {
  let src = type === 'bet' ? targetSlip.bet : targetSlip.selection;

  for(let [index, selection] of src.entries()) {
    if(selection.id === id) {
      src.splice(index, 1);
    }
  }
  
  const emptySlipIndex = slips.findIndex(slip => slip.id === targetSlip.id);
  if(targetSlip.bet.length === 0 && targetSlip.selection.length === 0 && currentSlip !== emptySlipIndex) {
    removeSlip(emptySlipIndex);
    if(emptySlipIndex <= currentSlip) {
      currentSlip--;
    }
  }

  // if(src === slips[currentSlip].selection) {
  //   displaySelections();
  // } else {
  //   displayBets();
  // }
  showSlips();
}

function displayBets(betBody, slip) {
  slip.bet.forEach(bet => {
    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-primary');
    const btnText = document.createTextNode('\u00D7');
    btn.appendChild(btnText);
    // creates table row and table data
    for(let prop in bet) {
      if(prop !== 'id') {
        const div = document.createElement('div');
        const divContent = document.createTextNode(bet[prop]);
        div.appendChild(divContent);
        betBody.appendChild(div);
      }
    }

    btn.addEventListener('click', () => removeItem(slip, bet.id, 'bet'));
    betBody.appendChild(btn);
    // const tbodyStr = `<td>${selection.horseNumber}</td>
    // <td>${selection.horseName}</td>
    // <td>${selection.meetingTime}</td>
    // <td>${selection.meetingName}</td>
    // <td>${selection.selectedOdds}</td>`;
  });
}

function addToSlipBet() {
  let stakeVal = toSecondDecimal(stake.value || 0);
  let outcomeVal = outcome.value;
  let betTypeVal = betType.value;

  slips[currentSlip].bet.push({
    stake: stakeVal,
    betType: betTypeVal,
    outcome: outcomeVal,
    id: betId++
  });

  showSlips();
}

function addToSlipSel() {
  console.log(slips);
  console.log(currentSlip);
  let checkedSP = sp.checked;
  let meetingName = meetings.value;
  let meetingTime = times.value;
  let horseName = contestants.value;
  let horseNumber = '';
  if (horseName === '1st Unnamed Favorite' || horseName === '2nd Unnamed Favorite') {
    horseName = contestants.value.trim();
  } else {
    horseName = horseName.split(' ');
    horseName.splice(0, 1);
    horseName = horseName.join(' ');
    horseNumber = contestants.value.split(' ')[0];
  }
  let selectedOdds = !sp.checked && odds.value ? odds.value : sp.value;

  slips[currentSlip].selection.push({
    id: selId++,
    horseNumber,
    meetingTime,
    horseName,
    meetingName,
    selectedOdds
  });

  showSlips();
}

function checkRadio() {
  for(let i = 0; i < radio.length; i++) {
    if(radio[i].checked) {
      return radio[i].value;
    }
  }
}