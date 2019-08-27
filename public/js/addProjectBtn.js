var fileCountLookup = {};
var openedStackLookup = {};


function addProjectBtn(item, projectRef) {
  const div = document.createElement('div');
  const btnId = "".concat("btn_", item["dirname"])
  const cardId = "".concat("card_", item["dirname"])
  const loadId = "".concat("load_", item["dirname"])
  const titleId = "".concat("title_", item["dirname"])
  var titleFixed = item["flags"] + item["title"]

  fileCountLookup[item["dirname"]] = 0;
  openedStackLookup[item["dirname"]] = [];

  //🇯🇵🇫🇷🇩🇪🇬🇧🇺🇸🇷🇺🇰🇷🇮🇹🇸🇪🇪🇸🇹🇷
  div.innerHTML = `
  <p>
    <button class="btn btn-outline-dark btn-block" type="button" data-toggle="collapse" data-target="#${item["dirname"]}" aria-expanded="false">
      <div class"btn-title" id="${titleId}">
        ${titleFixed} 0
      </div>
    </button>
  <div class="collapse" id="${item["dirname"]}">
    <div class="card card-body" id="${cardId}">
      <p>
        <button type="button" class="btn btn-success" id="${btnId}">>></button>
        <button type="button" class="btn btn-success" id="vote">Vote</button>
      </p>
      <div id="${loadId}">
      </div>
    </div>
  </div>
  </p>
  `;
  document.getElementById('projects_top').appendChild(div);
  document.getElementById(btnId).addEventListener("click", function() {
    loadAudioBtn(projectRef, loadId, item["entries"])
  })

  projectRef.listAll().then(res => {
    var titleDiv = document.getElementById(titleId)
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            fileCountLookup[item["dirname"]] += res.prefixes.length;
            titleDiv.innerHTML = [
              titleFixed, fileCountLookup[item["dirname"]
            ].toString()].join(' ... ');
          })
        })
      })
    })
  })
}

function loadAudioBtn(projectRef, targetId, entries) {
  var loadCount = 0;
  const audioNumToShow = 4;
  
  removeAudioPlayers(targetId);

  projectRef.listAll().then(res => {
    res.prefixes.forEach(entryRef => {
      entryRef.listAll().then(res => {
        res.prefixes.forEach(keyRef => {
          keyRef.listAll().then(res => {
            res.prefixes.forEach(userRef => {
              userRef.listAll().then(res => {
                if (openedStackLookup[projectRef.name].length 
                  == fileCountLookup[projectRef.name]) {
                  openedStackLookup[projectRef.name] = [];
                }
                for(var wavRef of res.items) {
                  if (loadCount >= audioNumToShow) {
                    console.log("Skip the loop");
                    break;
                  }
                  if (wavRef.name.startsWith('n_d_') &&
                   !openedStackLookup[projectRef.name].includes(wavRef.fullPath) ) {
                    var script = entries[parseInt(entryRef.name, 10) - 1][keyRef.name];
                    addAudioPlayer(wavRef, targetId, script);
                    openedStackLookup[projectRef.name].push(wavRef.fullPath);
                    loadCount += 1;
                    isNewlyAdded = true;
                  }
                }
              })
            })    
          })
        })
      })
    })
  })
}