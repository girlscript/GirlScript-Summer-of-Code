(function() {
  let year = "Team2020";

  // Parse team member data and output card for each member
  const load_data = () => {
    let teamGrid = document.querySelector(`#Grid${year}`);
    let only_year = year.substr(year.length - 4);
  
    teamGrid.innerHTML = '';
  
    campus_ambassadors.years[only_year].forEach(element => {
      teamGrid.innerHTML = teamGrid.innerHTML + `
        <div class="gs-team-member gs-team--${element.teamcode}">
          <div class="gs-team-member-image">
            <img src="${element.image}" />
          </div>
          <div class="gs-team-member-info">
            <div class="gs-fullname">${element.name}</div>
            <div class="gs-college">${element.college}</div>
            <div class="gs-city">${element.city}</div>
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
            ${element.social.twitter ?
            `<a href="${element.social.twitter}" target="_blank">
              <i class="fab fa-twitter"></i>
            </a>`:""}
            ${element.email ?
            `<a href="${'mailto:' + element.email}" class="gs-team-member-social-email">
              <i class="fas fa-envelope"></i>
            </a>`:""}
            
          </div>
        </div>
      `;
    });
  }
  
  load_data();  
})();
