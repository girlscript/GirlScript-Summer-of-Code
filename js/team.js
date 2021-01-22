(function() {
  let year = $('.button-active').attr("id");
  
  // Parse team member data and output card for each member
  const load_data = () => {
    let teamGrid = document.querySelector(`#Grid${year}`);
    let only_year = year.substr(year.length - 4);
  
    teamGrid.innerHTML = '';
  
    team_data.years[only_year].forEach(element => {
      teamGrid.innerHTML = teamGrid.innerHTML + `
        <div class="gs-team-member gs-team--${element.teamcode}">
          <div class="gs-team-member-image">
            <img src="${element.image}" />
          </div>
          <div class="gs-team-member-info">
            <div class="gs-fullname">${element.fullname}</div>
            <div class="gs-position">${element.position}</div>
          </div>
          <div class="gs-team-member-social">
            ${element.social.github ?
            `<a href="${element.social.github}" target="_blank">
              <i class="fab fa-github"></i>
            </a>`:""}
            ${element.social.linkedin ? 
            `<a href="${element.social.linkedin}" target="_blank">
              <i class="fab fa-linkedin"></i>
            </a>`:""}
            ${element.social.facebook ? 
            `<a href="${element.social.facebook}" target="_blank">
              <i class="fab fa-facebook"></i>
            </a>`:""}
          </div>
        </div>
      `;
    });
  }
  
  // Change between years
  $('.gs-button-container').click(function(){
    let new_year = year = this.id;
    let old_year = $('.button-active').attr("id");
  
    $(`#Grid${old_year}`).hide();
    $(`#Grid${new_year}`).show();
    $(`#${old_year}`).removeClass('button-active');
    $(`#${new_year}`).addClass('button-active');
  
    load_data();
  });
  
  load_data();
})();
