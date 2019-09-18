var fileCountLookup = {};
var openIndexLookup = {};
var cardPallete = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94",
                   "#ebf4f6", "#bdeaee", "#90cdd6", "#fff6e9", "#ffefd7", 
                   "#fffef9", "#e3f0ff", "#d2e7ff"];
const moreThanWarning = "You are reviewing more than 50 entires. Please VOTE first and load audio :)"


function addProject(item, projectRef) {
  const div = document.createElement('div');
  const projectName = item["dirname"]
  const loadBtnId = "".concat("loadBtn_", projectName)
  const voteBtnId = "".concat("voteBtn_", projectName)
  const controlId = "".concat("control_", projectName)
  const autoBtnId = "".concat("auto_", projectName)
  const voteClass = "".concat("vote_", projectName);
  const pickId = "".concat("pick_", projectName)
  const cardId = "".concat("card_", projectName)
  const audioId = "".concat("audio_", projectName)
  const spinId = "".concat("spin_", projectName)
  const titleId = "".concat("title_", projectName)
  const doneProgId = "".concat("done", titleId)
  const reviewProgId = "".concat("review", titleId)
  const availProgId = "".concat("avail", titleId)
  const totalEntries = item["entries"].length;
  var titleFixed = item["flags"] + item["title"]

  fileCountLookup[projectName] = 0;
  openIndexLookup[projectName] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <br />
    <button class="btn btn-outline-dark btn-block text-left" type="button" 
      data-toggle="collapse" data-target="#${projectName}" aria-expanded="false" id="${titleId}">
      <i class="fa fa-chevron-down pull-right"></i>
      <div class"btn-title" >
          ${titleFixed}
      </div>
      
      <div class="progress">
        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
          role="progressbar" style="width: 0%; height: 100%" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${doneProgId}"></div>
        <div class="progress-bar bg-warning" 
          role="progressbar" style="width: 0%; height: 90%;" aria-valuenow="10" 
          aria-valuemin="0" aria-valuemax="100" id="${reviewProgId}"></div>
        <div class="progress-bar bg-info" role="progressbar" 
          style="width: 0%; height: 80%;" aria-valuenow="30"
          aria-valuemin="0" aria-valuemax="100" id="${availProgId}"></div>
      </div>
    </button>
  <div class="collapse" id="${projectName}" data-parent="#projectsTop">
    <div class="card card-body" id="${cardId}">
      <div id="${spinId}">
        <div class="spinning">
        </div>
      </div>
      <div id="${controlId}">
        <button type="button" class="btn btn-success" id="${loadBtnId}">Load</button>
        <select class="form-control picker" id="${pickId}">
        </select>
        <button type="button" class="btn btn-success auto-play" id="${autoBtnId}" value="off">Auto <a class="fa fa-volume-up"></a></button>
      </div>
      <br />
      <div id="${audioId}" style="display: inline-block;">
      </div>
      <button type="button" id="${voteBtnId}" class="btn btn-secondary btn-vote"
        style="display: inline-block;">Vote & Next</button>
    </div>
  </div>
  `;
  // TODO: Audio auto-play
  document.getElementById('projectsTop').appendChild(div);
  updateProgressBar(true);

  var availProg = document.getElementById(availProgId);
  var reviewProg = document.getElementById(reviewProgId);
  var doneProg = document.getElementById(doneProgId);
  reviewProg.style.color = "black";

  var picker = document.getElementById(pickId);
  var audioDiv = document.getElementById(audioId)
  
  function updateProgressBar(toInitialize) {
    projectRef.listAll().then(res => {
      fileCountLookup[projectName] = res.prefixes.length;
      firebase.database().ref("votes").child(projectName).once('value').then(snapshotVote => {
        firebase.database().ref("users/3fG1zIUGn1hAf8JkDGd500uNuIi1/done/projects").child(projectName).once('value').then(snapshotDone => {
          var reviewRatio = 0
          var doneRatio = 0
          if (snapshotDone.val()) {
            doneRatio = 100 * Object.keys(snapshotDone.val()).length / totalEntries
          }
          if (snapshotVote.val()) {
            reviewRatio = 100 * Object.keys(snapshotVote.val()).length / totalEntries
          }
          availRatio = (100 * fileCountLookup[projectName] / totalEntries)

          doneProg.style.width = doneRatio.toString() + "%";
          reviewProg.style.width = (reviewRatio - doneRatio).toString() + "%";
          availProg.style.width = (availRatio - reviewRatio - doneRatio).toString() + "%";

          if (doneRatio > 5) {
            doneProg.innerText = Object.keys(snapshotDone.val()).length;
          }
          if ((reviewRatio - doneRatio) > 5) {
            reviewProg.innerText = Object.keys(snapshotVote.val()).length;
          }
          if ((availRatio - reviewRatio - doneRatio) > 5) {
            availProg.innerText = fileCountLookup[projectName];
          }
        })
      })

      res.prefixes.forEach(entryRef => {
        if (toInitialize) {
          var index = parseInt(entryRef.name, 10)
          picker.innerHTML += `<option value="${index}" onchange="pickerIndexChanged()">${index}</option>`
    
          var selectList = $('#' + pickId + ' option');
          selectList.sort((a, b) => {
              return b.value - a.value;
          });
          $('#' + pickId).html(selectList); 
        }
      })
    })
  }

  function pickerIndexChanged() {
    currentIndex = picker.value - 1;
    if (openIndexLookup[projectName].includes(currentIndex)) {
      // If the new index is already opened, ignore it
      // otherwise the id duplication error occurs.
      return
    } else {
      openIndexLookup[projectName].push(currentIndex)
    }

    // Maybe this is not an optimal way to pass parameters
    // but this is very convinient for this specific part
    entryRef = projectRef.child(("0000" + picker.value).slice(-5));
    entries = item["entries"]
    currentWanted = item["wanted"]
    upperNote = item["upn"]
    lowerNote = item["lon"]
    randomColor = cardPallete[Math.floor(Math.random() * cardPallete.length)];
    appendAudio(audioId, item["dirname"]);
    /////////  //////////  ///////////  ////

    // Show spinner and this will be removed in addPlayer.js
    $("#" + spinId).removeClass("hide-loader");
    // Remove the spin class in case of faild loading.
    setTimeout(() => {
      $("#" + spinId).addClass("hide-loader");
      document.getElementById(controlId).style.display = "block";
      document.getElementById(voteBtnId).style.display = "inline-block";
    }, 5000);
    document.getElementById(controlId).style.display = "none"
    document.getElementById(voteBtnId).style.display = "none"
  }
  $('#' + pickId).on('focus', () => {
    prevVal = $('#' + pickId).val()
  }).change(() => {
    // If more than 10 entries are open, let users do the vote first.
    if (openIndexLookup[projectName].length >= 50) {
      alert(moreThanWarning)
      $('#' + pickId).val(prevVal)
      return false
    } else {
      pickerIndexChanged();
    }
  })

  document.getElementById(titleId).addEventListener("click", (e) => {
    if (picker.value <= 0) {
      // Stop when picker is NOT ready!
      // TODO: Probably there is a better way to do this.
      e.stopPropagation();
    } else if (audioDiv.innerHTML.trim() == "" && document.getElementById(projectName).className == "collapse") {
      // MAYBE: To prevent double loading which induce the unplayable player error
      removeAllPlayers(audioId)
      pickerIndexChanged();
    }
  })
  document.getElementById(loadBtnId).addEventListener("click", () => {
    // If more than 50 entries are open, let users do the vote first.
    if (openIndexLookup[projectName].length >= 50) {
      alert(moreThanWarning)
      return
    }
    picker.selectedIndex -= 1;
    if (picker.selectedIndex < 0) {
      picker.selectedIndex = picker.length - 1;
    }
    pickerIndexChanged();
  })
  document.getElementById(voteBtnId).addEventListener("click", () => {
    getVotes(voteClass);
    removeAllPlayers(audioId);
    openIndexLookup[projectName] = [];

    picker.selectedIndex -= 1;
    if (picker.selectedIndex < 0) {
      picker.selectedIndex = picker.length - 1;
    }
    pickerIndexChanged();
    updateProgressBar(false);
  })
  document.getElementById(autoBtnId).addEventListener('click', () => {
    var autoBtn = document.getElementById(autoBtnId)
    var playBtns = audioDiv.getElementsByClassName("fa fa-play ml-2");
    if (autoBtn.value == "off" && playBtns.length > 0) {
      autoBtn.value = "on"
      autoBtn.innerHTML = `Auto <a class="fa fa-pause">`

      // FIXME: Considerably messy...
      var players = document.getElementsByClassName("card-player")
      var pauseBtns = audioDiv.getElementsByClassName("fa fa-pause ml-2");
      while(pauseBtns.length > 0) {
        pauseBtns[0].classList.replace('fa-pause', 'fa-play');
      }
      // Stop currently playing audio because it activates multiple auto threads
      for (var i = 0; i < players.length; i++) {
        if (!players[i].paused) {
          players[i].load()
        }
      }
      playBtns[0].click();
    } else if (autoBtn.value == "on") {
      autoBtn.value = "off"
      autoBtn.innerHTML = `Auto <a class="fa fa-volume-up">`
    }
  })
}

function appendAudio(idToAppend, projectName) {
  entryRef.listAll().then(res => {
    res.prefixes.forEach(userRef => {
      userRef.listAll().then(res => {
        for (var wavRef of res.items) {
          if (wavRef.name.startsWith('n_d_')) {
            addPlayer(wavRef, idToAppend, projectName);
          }
        }
      })
    })
  })
}
function playNext(audioDiv, justEnded, autoBtnId) {
  var players = audioDiv.getElementsByClassName("fa fa-play ml-2");
  var arrayOfId = [];
  for (var i = 0; i < players.length; i++) {
    arrayOfId.push(players[i].id)
  }
  var indexJustEnded = arrayOfId.indexOf(justEnded)
  if (indexJustEnded < arrayOfId.length - 1) {
    document.getElementById(arrayOfId[indexJustEnded + 1]).click()
  } else {
    // Turn off the auto playing if there is nothing to play anymore
    var autoBtn = document.getElementById(autoBtnId)
    autoBtn.value = "off"
    autoBtn.innerHTML = `Auto <a class="fa fa-volume-up">`
  }
}