// display modal data
function displayModalData(ele) {
  

  let modalTitle = document.querySelector('.gs-modal-name');
  let modalDesc = document.querySelector('.gs-modal-desc');
  let modalProject = document.querySelector('.gs-modal-project');
  let modalProjectLink = document.querySelector('.gs-modal-project-link');
  let modalTech = document.querySelector('.gs-modal-tech');
  let modalRepo = document.querySelector('.gs-modal-repo');
  let modalRepoLink = document.querySelector('.gs-repo-link');
  let modalMentorsTitle = document.querySelector('.gs-modal-mentors-title');
  let modalMentors = document.querySelector('.gs-modal-mentors');
  let modalOwner = document.querySelector('.gs-modal-owner');
  let modalOwnerLink = document.querySelector('.gs-modal-owner-link');
  let modalSlack = document.querySelector('.gs-modal-slack');
  let modalSlackLink = document.querySelector('.gs-modal-slack-link');

  let p_data = project_list.list.find(item => item.repo_fullname == ele.getAttribute('data-repo'));
  
  modalTitle.innerText = p_data.project_name;
  modalDesc.innerText = p_data.project_description;
  modalTech.innerHTML = p_data.technology_used.map(ele => {
    return `
      <span class="gs-project-label">${ele}</span>
    `;
  }).join('');
  modalRepo.innerHTML = `${p_data.repo_fullname.search('/') == -1 ?`<span class="iconify" data-icon="octicon:organization" data-inline="false"></span>`:`<span class="iconify" data-icon="octicon:repo" data-inline="false"></span>`}&nbsp;&nbsp;${p_data.repo_fullname}`;
  modalRepoLink.setAttribute('href', `https://github.com/${p_data.repo_fullname}`);
  modalOwner.innerHTML = `<span class="iconify" data-icon="octicon:mark-github" data-inline="false"></span>${p_data.owner_name}`;
  modalOwnerLink.setAttribute('href', `https://github.com/${p_data.github_username}`);
  modalProject.innerText = `${p_data.project_video_link}`;
  modalProjectLink.setAttribute('href', `${p_data.project_video_link}`);
  modalMentorsTitle.innerText = `${p_data.mentors_id.length != 0? 'Mentors':''}`;
  modalMentors.innerHTML = p_data.mentors_id.map(ele => {
    return `
      <div class="gs-mentor">
        <span class="gs-mentor-name">${ele.name}</span>
        <!--<a href="${ele.github}" target="_blank">
          <span class="iconify" data-icon="logos:github-icon" data-inline="false"></span>
        </a>
        <a href="https://app.slack.com/client/TRN1H1V43/CRZ1UF82Y/user_profile/${ele.slackId}" target="_blank" class="gs-mentor-slack">
          <span class="iconify" data-icon="logos:slack-icon" data-inline="false"></span>
        </a>-->
        <a href="mailto:${ele.email}" style="font-size:1.5rem">
          <span class="iconify icon:mdi-light:email icon-inline:false"></span>
        </a>
      </div>
    `;
  }).join('');
  modalSlack.innerHTML = `<span class="iconify" data-icon="ion:mail-outline" data-inline="false"></span>${p_data.email}`;
  modalSlackLink.setAttribute('href', `mailto:${p_data.email}`);
}

(function() {
  // Display projects
  const displayProjects = (data) => {
    GridProject.innerHTML = '';

    data.forEach(async project => {
      const name = project.project_name;
      const repo_fullname = project.repo_fullname;
      const repo_link = `https://github.com/${repo_fullname}`;
      const technology_used = project.technology_used;
      const description = project.project_description;
      const description_short = description.length <= 80 ? description.substring(0, 80) : description.substring(0, 80) + '...';

      // fetch project details from GitHub API
      // const response = await fetch(`https://api.github.com/repos/${repo_fullname}`);
      // let github_data = await response.json();
      // console.log(github_data);

      let GridProject = document.querySelector('#GridProject');
      GridProject.innerHTML = GridProject.innerHTML + `
        <div class="gs-project">
          <div class="gs-project-info">
            <div class="gs-project-name"><a href="${repo_link}" target="_blank">${name}</a></div>
            <div class="gs-project-desc">${description_short}</div>
          </div>
          <div class="gs-project-labels-container">
            ${technology_used.map(ele => {
              return `
                <span class="gs-project-label">${ele}</span>
              `;
            }).join('')}
          </div>
          <div data-repo="${repo_fullname}" onclick="displayModalData(this);document.querySelector('.gs-modal-container').style.cssText = 'display: flex;';document.querySelector('html').style.cssText = 'overflow:hidden;'" class="gs-modal-link">
            <button><i class="far fa-expand-arrows"></i></button>
          </div>
        </div>
      `;
    });
  }

  // searches for given keyword in project_list
  const filterData = (keyword) => {
    let options = {
      shouldSort: true,
      threshold: 0.4,
      keys: [{
        name: 'project_name',
        weight: 0.1
      }, {
        name: 'project_description',
        weight: 0.15
      }, {
        name: 'technology_used',
        weight: 0.5
      }, {
        name: 'vision_for_project',
        weight: 0.05
      }, {
        name: 'repo_fullname',
        weight: 0.06
      }, {
        name: 'owner_name',
        weight: 0.04
      }, {
        name: 'github_username',
        weight: 0.05
      }, {
        name: 'mentors_id',
        weight: 0.05
      }]
    };

    let fuse = new Fuse(project_list.list, options);
    return fuse.search(keyword);
  }

  // Perform actions with projects data
  // Make technologies_used from string to array
  project_list.list = project_list.list.map(ele =>  {
    ele.technology_used = ele.technology_used.split(',').map(ele => ele.trim());
    return ele;
  });

  let search_box = document.querySelector(`.gs-search-box`);
  let search_button = document.querySelector(`.gs-search-button`);

  // Debounce search
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }, wait);
      if (callNow) func.apply(context, args);
    }
  }
  let searchWithDebounce = debounce(displayProjects, 300);

  search_button.addEventListener('click', () => {
    if(search_box.value != "" || search_box.value != null) {
      displayProjects(filterData(search_box.value));
    } else {
      displayProjects(project_list.list);
    }
  })
  search_box.addEventListener('keyup', (e) => {
    
    if(search_box.value.length <= 0 && e.key === 'Backspace') {
      
      displayProjects(project_list.list);
    }
    else if(e.target.value != "" || !e.target.value) {
      
      searchWithDebounce(filterData(e.target.value));
    }
  });

  // modal close
  $('.gs-modal-close').on('click', () => {
    $('.gs-modal-container').css("display", "none");
    $('html').css("overflow", "initial");
  });

  $('.gs-modal-container').on("click", event => {
    $('.gs-modal-container').css("display", "none");
    $('html').css("overflow", "initial");
  });
  $(".gs-modal").on("click", event => event.stopPropagation());

  displayProjects(project_list.list);
}());
