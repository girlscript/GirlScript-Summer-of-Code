(function() {
  const table_data = document.querySelector('.table tbody');

  table_data.innerHTML = '';
  results.forEach(participant => {
    table_data.innerHTML += `
      <tr class="hover-color">
        <td class="table-data-id">${participant.id}</td> 
        <td class="table-data-rank">${participant.rank}</td>
        <td class="table-username">
          <a href="https://github.com/${participant.username}" target="_blank">${participant.username}</a>
        </td>
        <td class="table-score">${participant.score}</td>
      </tr>
    `;
  });
})();

tippy('[data-tippy-content]', {
  theme: 'translucent',
});

import { useState, useEffect} from "react";
import "./styles.css";

export default function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('https://api.github.com/repos/Vishal-raj-1/Awesome-JavaScript-Projects/pulls')
    .then((res) => res.json())
    .then((data) => setData(data));
  }, []);
  const PRsByUser = data.reduce((acc, pr) => {
    const labels = pr.labels.map((label) => label.name.toLowerCase());
      /* if(!participation_list.includes(pr.user.login)){
      return acc;
    } */
    if(!labels.includes("gssoc21") && !pr.merged_at){
      return acc;
    }
    if(!acc[pr.user.login]){
      acc[pr.user.login] = {
        Beginner: [],
        Easy: [],
        Medium: [],
        Hard: []
      };
    }
    let dificulty = "invalid";
    if(labels.includes("beginner")){
      dificulty = "Beginner";
    } else if(labels.includes("easy")){
      dificulty = "Easy";
    } else if(labels.includes("medium")){
      dificulty = "Medium";
    } else if(labels.includes("hard")){
      dificulty = "Hard";
    }
    acc[pr.user.login][dificulty].push(pr.number);
    return acc;
  }, {});
  
  const scoreBeginner = 2;
  const scoreEasy = 4;
  const scoreMedium = 7;
  const scoreHard = 10;
  const finalData = Object.keys(PRsByUser)
    .map(
      (user) => 
        `${user}\t${PRsByUser[user].Beginner.join(",")}
        \t${PRsByUser[user].Easy.join(",")}
        \t${PRsByUser[user].Medium.join(",")}
        \t${PRsByUser[user].Hard.join(",")}
        \t${
          PRsByUser[user].Beginner.length * scoreBeginner +
          PRsByUser[user].Easy.length * scoreEasy +
          PRsByUser[user].Medium.length * scoreMedium +
          PRsByUser[user].Hard.length * scoreHard
        }`
    )
  return (
    <div className="App">
      <h1>GirlScript Summer of Code</h1>
      <pre>{finalData}</pre>
      <pre>{JSON.stringify(PRsByUser, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
