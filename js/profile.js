let user_data;
let issues_data;
let commits_data = {
  total_count: 0,
  items: []
};
let prs_data = {
  items: []
};
let prs_data_merged = {
  items: []
};
let projects_data = {
  items: []
};
let projects_list;
let projects_list_filtered = {
  list: []
};

let contri_data = [];
let url_params;

// Change according to duration of GSSoC
let gssoc_start_date = "2021-03-08"; // 2021-03-08
let gssoc_end_date = "2021-06-01"; // 2021-06-01

// Get GitHub username from URL query string
let search = location.search.substring(1);
if(search != "") {
  url_params = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', (key, value) => key===""?value:decodeURIComponent(value));
}

// Fetch data from GitHub API
async function getUser(github_username) {
  const url = `https://api.github.com/users/${github_username}`;
  const response = await fetch(url);
  user_data = await response.json();
  
  // let errorText = document.querySelector('#errorText');
  if(user_data.hasOwnProperty('message')) {
    $('#profileContainer').css("display", "none");
    $('#searchContainer').css("display", "flex");
  } else {
    $('#searchContainer').css("display", "none");
    $('#profileContainer').css("display", "grid");
  }

  // console.log("User:\n", user_data);

  let gs_profile_pic_container = document.querySelector('.gs-profile-pic-container');
  let fullname = document.querySelector('.gs-fullname');
  let username = document.querySelector('.gs-username');
  let bio = document.querySelector('.gs-bio');
  let github = document.querySelector('.gs-profile-social .github');
  let followers = document.querySelector('.gs-user-stats .followers');
  let following = document.querySelector('.gs-user-stats .following');

  // Do something
  gs_profile_pic_container.innerHTML = `<img class="gs-profile-pic" src="${user_data.avatar_url}" alt="Profile Pic" />`;
  fullname.innerHTML = user_data.name;
  username.innerHTML = user_data.login;
  bio.innerHTML = user_data.bio;
  github.setAttribute('href', user_data.html_url);
  followers.innerHTML = `
    <div class="gs-user-stats-title">Followers</div>
    <div class="gs-user-stats-data">${user_data.followers}</div>
  `;
  following.innerHTML = `
    <div class="gs-user-stats-title">Following</div>
    <div class="gs-user-stats-data">${user_data.following}</div>
  `;
}

async function getCommits(github_username, start_date, end_date) {
  const headers = {
      "Accept" : "application/vnd.github.cloak-preview"
  }
  const params = {
    "method" : "GET",
    "headers" : headers
  }
  let temp_data;
  let page = 1;
  do {
    const url_commits = `https://api.github.com/search/commits?q=author:${github_username} author-date:${start_date}..${end_date} sort:committer-date&page=${page}&per_page=100`;
    const response = await fetch(url_commits, params);
    temp_data = await response.json();
    commits_data.total_count = temp_data.total_count;
    if(temp_data.items.length == 0) {
      break;
    }
    commits_data.items = [...commits_data.items, ...temp_data.items].unique();
    page++;
  } while (page <= 1);
  
  // store only commits that are in the project list
  commits_data.items = commits_data.items.filter((commit, index, arr) => {
    for(let i = 0; i < projects_list.list.length; i++) {
      if(commit.repository.full_name === projects_list.list[i]) {
        // create list of projects that user has committed to
        projects_list_filtered.list.includes(commit.repository.full_name) ? null : projects_list_filtered.list.push(commit.repository.full_name);
        return true;
      }
    }
    return false;
  });
  let total_commits = document.querySelector('.gs-profile-container-stats .total-commits');
  total_commits.innerHTML = commits_data.items.length;

  let commitsContainer = document.querySelector('#commitsContainer');
  commitsContainer.innerHTML = '';
  
  commits_data.items.forEach(element => {
    const sha = element.sha.substring(0, 7);
    const repo = element.repository.full_name;
    const repo_url = element.repository.html_url;
    const commit_url = element.html_url;
    const message = element.commit.message.length <= 165 ? element.commit.message.substring(0, 165) : element.commit.message.substring(0, 165) + '...';
    const date_str = element.commit.author.date;
    const date = new Date(date_str);

    commitsContainer.innerHTML = commitsContainer.innerHTML + `
      <div class="gs-commit">
        <div class="gs-commit-infobox">
          <div class="gs-commit-date">${date.toDateString() + " " + date.toLocaleTimeString()}</div>
          <div class="gs-commit-text">Committed <a class="gs-commit-url" href="${commit_url}" target="_blank"><b>${sha}</b></a> to <a href="${repo_url}" target="_blank">${repo}</a></div>
          <div class="gs-commit-message">${message}</div>
        </div>
      </div>
    `;
  });
}

async function getIssues(github_username, start_date, end_date) {
  
  const url = `https://api.github.com/search/issues?q=author:${github_username} type:issue created:${start_date}..${end_date} sort:created&per_page=100`;
  const response = await fetch(url);
  issues_data = await response.json();
  
  // store only issues that are in the project list
  issues_data.items = issues_data.items.filter((issue, index, arr) => {
    const repo = issue.repository_url.substring(29);
    for(let i = 0; i < projects_list.list.length; i++) {
      if(repo === projects_list.list[i]) {
        return true;
      }
    }
    return false;
  });

  let total_issues = document.querySelector('.gs-profile-container-stats .total-issues');
  total_issues.innerHTML = issues_data.items.length;

  let issuesContainer = document.querySelector('#issuesContainer');
  issuesContainer.innerHTML = '';
  
  issues_data.items.forEach(element => {
    const id = element.id;
    const url = element.html_url;
    const title = element.title;
    const state = element.state;
    const stateCapital = element.state.charAt(0).toUpperCase() + element.state.substring(1);
    const labels = element.labels;
    // const body = element.body;
    // const number = element.number;
    const repo_url = element.repository_url.replace('api.', '').replace('repos/', '');
    const repo = repo_url.substring(19);
    const date_start = element.created_at;
    const date_end = element.closed_at ? element.closed_at : "";
    const date_s = new Date(date_start);
    const date_e = (date_end != "") ? new Date(date_end) : "";

    issuesContainer.innerHTML = issuesContainer.innerHTML + `
      <div class="gs-issue gs-issue-${id} gs-issue-${state}">
        <span class="iconify" data-icon="octicon:issue-${state=='open'?'opened':'closed'}" data-inline="false"></span>
        <div>
          <div class="gs-labels-container"></div>
          <div class="gs-issue-infobox">
            <div class="gs-issue-text">${stateCapital}: <a class="gs-issue-url" href="${url}" target="_blank"><b>${title}</b></a> in <a href="${repo_url}" target="_blank">${repo}</a></div>
            <div class="gs-issue-date">Opened:${date_s.toLocaleDateString() + (date_e != "" ? "&nbsp; | &nbsp;Closed: " + date_e.toLocaleDateString() : "")}</div>
          </div>
        </div>
      </div>
    `;

    let gs_labels_container = document.querySelector(`.gs-issue-${id} .gs-labels-container`);
    gs_labels_container.innerHTML = '';

    labels.forEach(label => {
      gs_labels_container.innerHTML = gs_labels_container.innerHTML + `<div class="gs-label" style="color:${isLight(label.color)?'#000':'#fff'};background-color:#${label.color}">${label.name}</div>`;
    });
  });
}

async function getPRs(github_username, start_date, end_date) {
  // if(projects_list_filtered.list.length != 0) {
  //   const url = `https://api.github.com/search/issues?q=author:${github_username} type:pr created:${start_date}..${end_date} sort:created&per_page=100`;
  //   const url_merged = `https://api.github.com/search/issues?q=author:${github_username} type:pr is:merged created:${start_date}..${end_date} sort:created&per_page=100`;
  //   const response = await fetch(url);
  //   prs_data = await response.json();
  //   const response_merged = await fetch(url_merged);
  //   prs_data_merged = await response_merged.json();
  // } else {
  //   prs_data = {
  //     total_count: 0,
  //     items: []
  //   };
  //   prs_data_merged = {
  //     total_count: 0,
  //     items: []
  //   };
  // }

  // const url = `https://api.github.com/search/issues?q=author:${github_username} type:pr updated:${start_date}..${end_date} sort:created&page=1&per_page=100`;
  // const url_merged = `https://api.github.com/search/issues?q=author:${github_username} type:pr is:merged updated:${start_date}..${end_date} sort:updated&page=1&per_page=100`;
  // const response = await fetch(url);
  // prs_data = await response.json();
  // const response_merged = await fetch(url_merged);
  // prs_data_merged = await response_merged.json();

  let temp_data;
  let page;

  page = 1;
  do {
    const url = `https://api.github.com/search/issues?q=author:${github_username} type:pr updated:${start_date}..${end_date} sort:created&page=${page}&per_page=100`;
    const response = await fetch(url);
    temp_data = await response.json();
    
    prs_data.total_count = temp_data.total_count;
    if(temp_data.items.length == 0) {
      break;
    }
    prs_data.items = [...prs_data.items, ...temp_data.items].unique();

    page++;
  } while (page <= 3);

  page = 1;
  do {
    const url_merged = `https://api.github.com/search/issues?q=author:${github_username} type:pr is:merged updated:${start_date}..${end_date} sort:updated&page=${page}&per_page=100`;
    const response_merged = await fetch(url_merged);
    temp_data = await response_merged.json();
    
    prs_data_merged.total_count = temp_data.total_count;
    if(temp_data.items.length == 0) {
      break;
    }
    prs_data_merged.items = [...prs_data_merged.items, ...temp_data.items].unique();
    page++;
  } while (page <= 3);

  // console.log("PRs:\n", prs_data);
  // console.log("Merged PRs:\n", prs_data_merged);
  
  // store only PRs that are in the project list
  prs_data.items = prs_data.items.filter((pr, index, arr) => {
    const repo = pr.repository_url.substring(29);
    for(let i = 0; i < projects_list.list.length; i++) {
      if(repo === projects_list.list[i]) {
        return true;
      }
    }
    return false;
  });
  prs_data_merged.items = prs_data_merged.items.filter((pr, index, arr) => {
    const repo = pr.repository_url.substring(29);
    for(let i = 0; i < projects_list.list.length; i++) {
      if(repo === projects_list.list[i]) {
        return true;
      }
    }
    return false;
  });

  // change PR state to 'merged' for those that are merged
  prs_data.items = prs_data.items.map(element => {
    prs_data_merged.items.forEach((ele) => {
      if(JSON.stringify(ele) === JSON.stringify(element)) {
        element.state = "merged";
      }
    });
    return element;
  });

  // console.log("PRs:\n", prs_data);
  // console.log("Merged PRs:\n", prs_data_merged);

  // filter merged PRs so that only the ones with the label 'gssoc' are left
  prs_data_merged.items = prs_data_merged.items.filter(element => {
    if(element.labels.map(label => label.name.toLowerCase()).includes('gssoc21') || element.labels.map(label => label.name.toLowerCase()).includes('gssoc-21') || element.labels.map(label => label.name.toLowerCase()).includes(`gssoc'21`) ) {
      return true;
    } else {
      return false;
    }
  });

  // SCORE CALCULATION
  let possible_scores = {"level0": 5, "level1": 10, "level2": 25, "level3": 45};
  
  // combine all labels from all merged PRs into an array
  let merged_labels = [];
  prs_data_merged.items.forEach(element => {
    const labels = element.labels;
    merged_labels = merged_labels.concat(labels);
  });
  console.log(merged_labels);

  // keep only the scoring labels from possible_labels in the array
  const merged_labels_scoring = merged_labels.filter(label => {
    if(Object.keys(possible_scores).includes(label.name.replace(/\s/g,'').toLowerCase())) {
      return true;
    } else {
      return false;
    }
  });
  // console.log("MERGED LABELS SCORING\n", merged_labels_scoring);

  // convert scoring labels into respective numbers
  const scores_array = merged_labels_scoring.map(label => {
    return possible_scores[label.name.replace(/\s/g,'').toLowerCase()];
  });
  // console.log("SCORES ARRAY\n", scores_array);

  // add all scores
  const total_score = scores_array.reduce((prev, curr) => {
    return prev + curr;
  }, 0);
  // console.log("TOTAL SCORE\n", total_score);

  // Do something
  let userScoreContainer = document.querySelector('#userScoreContainer');
  userScoreContainer.innerHTML = `<div id="userScore"><span id="userScoreTitle">Score</span><span id="userScoreOutput">${total_score}</span></div>`;

  let total_prs = document.querySelector('.gs-profile-container-stats .total-prs');
  total_prs.innerHTML = prs_data.items.length;

  let prsContainer = document.querySelector('#prsContainer');
  prsContainer.innerHTML = '';
  
  prs_data.items.forEach(element => {
    const id = element.id;
    const url = element.html_url;
    const title = element.title;
    const state = element.state;
    const stateCapital = element.state.charAt(0).toUpperCase() + element.state.substring(1);
    // const labels = element.labels;
    const repo_url = element.repository_url.replace('api.', '').replace('repos/', '');
    const repo = repo_url.substring(19);
    const date_start = element.created_at;
    const date_end = element.closed_at ? element.closed_at : "";
    const date_s = new Date(date_start);
    const date_e = (date_end != "") ? new Date(date_end) : "";

    prsContainer.innerHTML = prsContainer.innerHTML + `
      <div class="gs-pr gs-pr-${id} gs-pr-${state}">
        <span class="iconify" data-icon="octicon:git-${state=='merged'?'merge':'pull-request'}" data-inline="false"></span>
        <div class="gs-pr-infobox">
          <div class="gs-pr-text">${stateCapital}: <a class="gs-pr-url" href="${url}" target="_blank"><b>${title}</b></a> in <a href="${repo_url}" target="_blank">${repo}</a></div>
          <div class="gs-pr-date"><b>Opened:</b> ${date_s.toDateString() + " " + date_s.toLocaleTimeString()}</div>
          <div class="gs-pr-date">${(date_e != "" ? "<b>Closed:</b> " + date_e.toDateString() + " " + date_e.toLocaleTimeString() : "")}</div>
        </div>
      </div>
    `;
  });
}

async function loadProjectList() {
  projects_list = Object.assign({}, project_list);
  projects_list.list = projects_list.list.map(item => item.repo_fullname);
  let org_arr = projects_list.list.filter(item => !item.includes('/'));
  
  const fetchOrgPromises = org_arr.map(async org => {
    const url = `https://api.github.com/orgs/${org}/repos`;
    const response = await fetch(url);
    let data = await response.json();
    return data;
  });

  org_arr = await Promise.all(fetchOrgPromises);
  org_arr = [].concat(...org_arr);
  org_arr = org_arr.map(item => item.full_name);
  projects_list.list = projects_list.list.filter(item => item.includes('/'));
  projects_list.list = projects_list.list.concat(org_arr);

  // console.log("Projects List:\n", projects_list);
}

async function getProjects(github_username) { 
  // loop through each project in the project list
  const fetchProjectPromises = projects_list_filtered.list.map(async project => {
    const url = `https://api.github.com/repos/${project}`;
    const response = await fetch(url);
    let p_data = await response.json();

    // fetch contributors of project
    // const url_contributors = `https://api.github.com/repos/${project}/contributors?q=per_page=100`;
    // const response_contributors = await fetch(url_contributors);
    // let c_data = await response_contributors.json();
    // p_data.contributors = c_data.slice();
    
    return p_data;
  });

  projects_data.items = await Promise.all(fetchProjectPromises);
  // store only projects that are in the project list
  // projects_data.items = projects_data.items.filter((project, index, arr) => {
  //   for(let i = 0; i < project.contributors.length; i++) {
  //     if(arr[index].contributors[i].login === github_username) {
  //       return true;
  //     }
  //   }
  //   return false;
  // });

  // console.log("Projects:\n", projects_data.items);

  // Do something
  let total_projects = document.querySelector('.gs-profile-container-stats .total-projects');
  total_projects.innerHTML = projects_data.items.length;

  let projectsContainer = document.querySelector('#projectsContainer');
  projectsContainer.innerHTML = '';
  
  projects_data.items.forEach(element => {
    const id = element.id;
    const url = element.html_url;
    const full_name = element.full_name;
    const description = element.description;
    const homepage = element.homepage ? element.homepage : '';
    const stars_count = element.stargazers_count;
    const forks_count = element.forks_count;
    const open_issues_count = element.open_issues_count;
    const language = element.language;
    // const date_start = element.created_at;
    // const date_s = new Date(date_start);

    projectsContainer.innerHTML = projectsContainer.innerHTML + `
      <div class="gs-project gs-project-${id}">
        <span class="iconify iconify-main" data-icon="octicon:repo" data-inline="false"></span>
        <div class="gs-project-infobox">
          <div class="gs-project-text"><a class="gs-project-url" href="${url}" target="_blank"><b>${full_name}</b></a></div>
          <div class="gs-project-description">${description ? (description.length <= 165 ? description.substring(0, 165) : description.substring(0, 165) + '...') : ''}</div>
          <div class="gs-project-extra">
            <div class="gs-project-extra-item gs-project-lang">${language} </div>
            <div class="gs-project-extra-item">
              ${stars_count != "0" ? '<div class="gs-project-extra-stat"><span class="iconify" data-icon="octicon:star" data-inline="false"></span>' + stars_count + '</div>' : ""}
              ${forks_count != "0" ? '<div class="gs-project-extra-stat"><span class="iconify" data-icon="octicon:repo-forked" data-inline="false"></span>' + forks_count + '</div>' : ""}
            </div>
          </div>
          ${homepage != '' ? '<a href="' + homepage + '" target="_blank"><div class="gs-project-link"><span class="iconify" data-icon="octicon:link" data-inline="false"></span></div></a>' : ''}
        </div>
      </div>
    `;
  });
}

async function getContributions(github_username, start_date, end_date) {
  // get GitHub data
  // const url = `https://github-contributions-api.now.sh/v1/${github_username}`;
  // const response = await fetch(url);
  // contri_data_api = await response.json();
  // console.log(contri_data_api);

  // // filter by date
  // contri_data.contributions = contri_data.contributions.filter(ele => {
  //   if(ele.date >= start_date && ele.date <= end_date) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // });

  // create initial array of contributions with dates and initial values that will later be filled with data
  let start_date_iso = new Date(start_date);
  let end_date_iso = new Date(end_date);
  let today_date = new Date();
  today_date = `${today_date.getFullYear()}-${(today_date.getMonth().toString().length == 1 ? '0' : '') + (today_date.getMonth() + 1)}-${(today_date.getDate().toString().length == 1 ? '0' : '') + today_date.getDate()}`;

  for(let d = start_date_iso; d <= end_date_iso; d.setDate(d.getDate() + 1)) {
    const new_date = d.toISOString().substring(0, 10);
    contri_data.push({
      contributions: 0,
      intensity: 0,
      date: new_date
    });
  }

  // add Commit contributions
  commits_data.items.forEach(ele => {
    const commit_date = ele.commit.author.date.substring(0, 10);

    contri_data = contri_data.map(square => {
      if(square.date == commit_date) {
        square.contributions++;
        return square;
      }
      return square;
    });
  });

  // add PRs contributions
  prs_data.items.forEach(ele => {
    const commit_date = ele.created_at.substring(0, 10);

    contri_data = contri_data.map(square => {
      if(square.date == commit_date) {
        square.contributions++;
        return square;
      }
      return square;
    });
  });

  // add Issues contributions
  issues_data.items.forEach(ele => {
    const commit_date = ele.created_at.substring(0, 10);

    contri_data = contri_data.map(square => {
      if(square.date == commit_date) {
        square.contributions++;
        return square;
      }
      return square;
    });
  });

  // calculate intensity [0-4]
  // const max = contri_data.map(ele => ele.contributions).reduce((prev, curr, i, arr) => {
  //   return (curr > prev) ? curr : prev;
  // }, 0);
  const total_contri_days = contri_data.map(ele => ele.contributions).reduce((prev, curr, i, arr) => {
    return curr < 1 ? prev : prev + 1;
  }, 0);
  const total_contri = contri_data.map(ele => ele.contributions).reduce((prev, curr, i, arr) => {
    return prev + curr;
  }, 0);
  const avg = total_contri / total_contri_days;
  const avg_sq = avg ** 2;
  const l0 = 1;
  const l1 = (avg_sq / 100) * 30;
  const l2 = (avg_sq / 100) * 55;
  const l3 = (avg_sq / 100) * 80;
  // console.table(max, total_contri_days, total_contri, avg, avg_sq);
  // console.table(l0,l1,l2,l3);

  contri_data = contri_data.map(square => {
    if(square.contributions > l3) {
      square.intensity = 4;
    }
    else if(square.contributions > l2) {
      square.intensity = 3;
    }
    else if(square.contributions > l1) {
      square.intensity = 2;
    }
    else if(square.contributions > l0) {
      square.intensity = 1;
    }
    else {
      square.intensity = 0;
    }
    return square;
  });

  // console.table(contri_data);

  // get intensity and make squares
  const squares = document.querySelector('.squares');
  contri_data.forEach(ele => {
    if(ele.date > today_date) {
      return;
    }
    squares.insertAdjacentHTML('beforeend', `
      <li class="square" data-level="${ele.intensity}">
        <div class="gs-tooltip-container">
          <div class="gs-tooltip">
            <span class="gs-tooltip-white-text">${ele.contributions == 0 ? 'No' : ele.contributions} contributions</span><span> on ${(new Date(ele.date)).toDateString().substring(4)}</span>
          </div>
        </div>
      </li>`);
  });
  
  // make random squares for display purpose
  // for (var i = 0; i < 91; i++) {
  //   const level = Math.floor(Math.random() * 5);
  //   squares.insertAdjacentHTML('beforeend', `<li data-level="${level}"></li>`);
  // }
}

// initiate data fetching
if(url_params != undefined) {
  getUser(url_params.id).catch(() => {
    $('#errorFetchUser').html('Error fetching user.');
    $('#errorFetchUser').effect("shake");
  });
  let loadProjectListPromise = new Promise(async (resolve, reject) => {
    await loadProjectList().then(() => {
      resolve();
    }).catch(() => {
      reject();
    });
  });
  loadProjectListPromise.then(() => {
    let loadFilteredProjectListPromise = new Promise(async (resolve, reject) => {
      await getCommits(url_params.id, gssoc_start_date, gssoc_end_date)
        .then(() => resolve())
        .catch(() => {
          $('#commitsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
          $('.total-commits').html('<span class="fetch_error">Unable to fetch.</span>');
        });
      reject();
    });
    loadFilteredProjectListPromise.then(async () => {
      await getIssues(url_params.id, gssoc_start_date, gssoc_end_date)
        .catch(() => {
          $('#issuesContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
          $('.total-issues').html('<span class="fetch_error">Unable to fetch.</span>');
        });
      // performScoreCalc(url_params.id, gssoc_start_date, gssoc_end_date);
      await getPRs(url_params.id, gssoc_start_date, gssoc_end_date)
        .catch(() => {
          $('#prsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
          $('.total-prs').html('<span class="fetch_error">Unable to fetch.</span>');
        });
      getProjects(url_params.id);
      
      // Add GitHub contribution squares
      await getContributions(url_params.id, gssoc_start_date, gssoc_end_date);
    });
    loadFilteredProjectListPromise.catch(() => {
      $('#issuesContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
      $('#prsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
      $('#projectsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
      $('.total-prs').html('<span class="fetch_error">Unable to fetch.</span>');
      $('.total-issues').html('<span class="fetch_error">Unable to fetch.</span>');
      $('.total-projects').html('<span class="fetch_error">Unable to fetch.</span>');
    });
  });
  loadProjectListPromise.catch(() => {
    $('#issuesContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
    $('#prsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
    $('#projectsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
    $('#commitsContainer').html('<span class="fetch_error">Unable to fetch. Wait 1 minute, then try again.</span>');
    $('.total-prs').html('<span class="fetch_error">Unable to fetch.</span>');
    $('.total-issues').html('<span class="fetch_error">Unable to fetch.</span>');
    $('.total-projects').html('<span class="fetch_error">Unable to fetch.</span>');
    $('.total-commits').html('<span class="fetch_error">Unable to fetch.</span>');
  });
}


// Check if color is Light or Not, used for text color of labels
function isLight(color) {
  // Variables for red, green, blue values
  var r, g, b, hsp;
  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    r = color[1];
    g = color[2];
    b = color[3];
  } 
  else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace( 
    color.length < 5 && /./g, '$&$&'));
    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;
  }
  
  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(
  0.299 * (r * r) +
  0.587 * (g * g) +
  0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  return (hsp>127.5) ? true : false;
}

// add array method to remove duplicate items from array
Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }
  return a;
};

// Only Unique function
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

// update query string in url
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}


$(document).ready(function(){
  if(url_params == undefined) {
    $('#profileContainer').css("display", "none");
    $('#searchContainer').css("display", "flex");
  } else {
    $('#searchContainer').css("display", "none");
    $('#profileContainer').css("display", "grid");
  }

  let usernameSearchInput = document.querySelector('#usernameSearchInput');
  let usernameSearchButton = document.querySelector('#usernameSearchButton');
  let errorText = document.querySelector('#errorText');
  let backButton = document.querySelector('#backButton');
  let fixedActionBtn = document.querySelector('.fixed-action-btn');

  const checkUsername = () => {
    let getUserPromise = new Promise(async (resolve, reject) => {
      // console.log("Requesting User...");
      await getUser(usernameSearchInput.value);
      if(user_data.hasOwnProperty('message')) {
        reject();
      } else {
        resolve();
      }
    }) 
    getUserPromise.then(() => {
      window.location = updateQueryStringParameter(window.location.href, "id", usernameSearchInput.value);
    }).catch(() => {
      errorText.innerHTML = "Username not found.";
    });
  }

  usernameSearchButton.addEventListener('click', () => {
    if(usernameSearchInput.value != "") {
      checkUsername();
    }
  })
  usernameSearchInput.addEventListener('keypress', (e) => {
    if(usernameSearchInput.value != "" && e.key === 'Enter') {
      checkUsername();
    }
  });

  backButton.addEventListener('click', () => {
    window.location = window.location.href.split("?")[0];
  });
  fixedActionBtn.addEventListener('click', () => {
    window.location = window.location.href.split("?")[0];
  });

   // Change tabs
  $('.gs-selector-items').click(function(){
    $(`.selected`).removeClass('selected');
    $(this).addClass('selected');

    $(`.selected-container`).removeClass('selected').hide();
    $(`#${this.id}Container`).addClass('selected-container').show();

    $(`.gs-profile-container-activity .gs-container-subtitle`).html(`${$(this).html()}`);
  });

  // add floating button for mobile users
  $('.fixed-action-btn').floatingActionButton();
});
