// * Testing

// Search API
// async function searchShows(query) {
//   const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
//   console.log(res);
//   console.log(res.data); // [{}]
//   console.log(res.data[0]);
//   console.log(res.data[0].show.genres);
//   console.log(res.data[0].show.id); // 139
//   console.log(res.data[0].show.image);
//   console.log(res.data[0].show.image.medium);
//   console.log(res.data[0].show.name);
//   console.log(res.data[0].show.summary);
//   console.log(res.data[0].show.url);
// }

// * Testing Episodes
// searchShows('girls');

// async function getEpisodes(id) {
//   const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
//   console.log(res);
//   console.log(res.data); // [{}]
//   console.log(res.data[0]); //
//   console.log(res.data[0].id); // Specific id for that episode
//   console.log(res.data[0].season);
//   console.log(res.data[0].summary);
//   console.log(res.data[0].url);
// }

// getEpisodes(139);

// ***************************************************************************************

// * Search
$('#search-form').on('submit', handleSearch);

async function handleSearch(evt) {
  evt.preventDefault();

  let query = $('#search-query').val();
  if (!query) return;

  $('#episodes-area').hide();

  let shows = await searchShowsFromAPI(query);

  populateShows(shows);
}

async function searchShowsFromAPI(query) {
  {
    const res = await axios.get(
      `https://api.tvmaze.com/search/shows?q=${query}`
    );
    const shows = [];
    res.data.forEach((item) => {
      const show = {};
      //   console.log(item);

      show.id = item.show.id;
      show.name = item.show.name;
      show.summary = item.show.summary;
      show.genre = item.show.genres;
      show.url = item.show.url;
      if (show.genre === undefined) {
        show.genre = '';
      }
      if (item.show.image !== null && item.show.image.medium) {
        show.image = item.show.image.medium;
      } else show.image = '';
      shows.push(show);
    });
    // console.log(shows); // We'll get [{}, {}, {}]
    return shows;
  }
}

function populateShows(shows) {
  {
    const $showsList = $('#shows-list');
    $showsList.empty();

    for (let show of shows) {
      let $item = $(
        `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
             <div class="card" data-show-id="${show.id}">
               <div class="card-body">
               <img class="card-img-top" src="${show.image}">
               <a href="${show.url}" target="_blank"><h5 class="card-title">${show.name}</h5></a>
                <p class="card-text lead">${show.genre}</p>
                <p class="card-text">${show.summary}</p>
                <button class="btn btn-primary btn-lg episode-btn" data-bs-toggle="modal" data-bs-target="#episodes">View Episodes</button>
               </div>
             </div>
           </div>
          `
      );
      $showsList.append($item);
      makeEpisodeModal();
    }
  }
  $('search-query').val('');
}

// * Modal

function makeEpisodeModal() {
  const $episodesArea = $('#episodes-area');
  $episodesArea.html(
    `
          <div class="modal fade" id="episodes">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="episodes-label">Episodes</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p class="lead" id="episode-title">Episodes</p>
                <ol id="episode-list">
                </ol>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
        `
  );
}

// ************

// Click Event
$('.container').on('click', 'button.episode-btn', function (e) {
  let showId = $(this).parent().parent().attr('data-show-id');
  //   console.log(showId); // 139

  const showTitle = $(this).parent().parent().find('h5')[0].innerText;
  //   console.log(showTitle); // Girls

  getEpisodesFromAPI(showId, showTitle); // Now, we have showId(139) and title(Girls)
});

async function getEpisodesFromAPI(id, title) {
  $('#episodes-area').show();

  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = res.data;
  console.log(episodes); // We'll get [{}, {}, {}]

  displayEpisodes(episodes, title);
}

function displayEpisodes(episodes, title) {
  clearEpisodePage();

  const $episodeTitle = $('#episode-title');
  $episodeTitle.html(`Episodes: <b>${title}</b>`);

  const $episodeList = $('#episode-list');

  episodes.forEach((episode) => {
    const { name, number, summary, url, season } = episode;
    let $newEpisode = $(
      `<li class="episode"><a href="${url}" target="_blank">Season ${season}, Ep. ${number} - ${name}</a><br></li>`
    );

    $episodeList.append($newEpisode);

    if (summary) {
      $newEpisode.append(summary);
    }
    if (episode.image !== null) {
      const newImg = document.createElement('img');
      newImg.src = episode.image.medium;
      $newEpisode.append(newImg);
    }
  });
}

function clearEpisodePage(title) {
  // Clear episode info. Otherwise, we get same content for different show !!!
  const $episodeList = $('#episode-list');
  $episodeList.html('');
}
