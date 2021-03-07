/*
To use this one may create a new react app and copy this code to
the App.js file, and add 

.App pre {
  font-family: monospace;
  border: 1px solid #cccccc;
  background-color: #f5f5f5;
  line-height: 1;
  padding: 3px;
  border-radius: 4px;
}
to the style.css file.

Instead of making an altogether new App one may use codesandbox.io
as well.

This code is courtesy to Praveen Kr. Purshottam's YouTube video 
here - https://youtu.be/6JGWJQ_l9fU
*/

import { useState, useEffect } from "react";
import "./styles.css";

//const data = require("../public/pulls.json");

export default function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(
      "https://api.github.com/repos/praveenscience/Internship-LMS-FrontEnd/pulls?state=all"
    )
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);
  const PRsByUser = data.reduce((acc, pr) => {
    const labels = pr.labels.map((l) => l.name.toLowerCase());

    if (pr.user.login === "praveenscience") {
      return acc;
    }

    if (!labels.includes("swoc") || !pr.merged_at) {
      return acc;
    }

    if (!acc[pr.user.login]) {
      acc[pr.user.login] = {
        Beginner: [],
        Easy: [],
        Medium: [],
        Hard: [],
        Invalid: []
      };
    }
    let difficulty = "Invalid";
    if (labels.includes("beginner")) {
      difficulty = "Beginner";
    } else if (labels.includes("easy")) {
      difficulty = "Easy";
    } else if (labels.includes("medium")) {
      difficulty = "Medium";
    } else if (labels.includes("hard")) {
      difficulty = "Hard";
    }

    acc[pr.user.login][difficulty].push(pr.number);

    return acc;
  }, {});
  const scoreBeginner = 2;
  const scoreEasy = 4;
  const scoreMedium = 7;
  const scoreHard = 10;
  const FinalData = Object.keys(PRsByUser)
    .map(
      (user) =>
        `${user}\t${user}\t${PRsByUser[user].Beginner.reverse().join(
          ",  "
        )}\t${PRsByUser[user].Easy.reverse().join(",  ")}\t${PRsByUser[
          user
        ].Medium.reverse().join(",  ")}\t${PRsByUser[user].Hard.reverse().join(
          ",  "
        )}\t${
          PRsByUser[user].Beginner.length * scoreBeginner +
          PRsByUser[user].Easy.length * scoreEasy +
          PRsByUser[user].Medium.length * scoreMedium +
          PRsByUser[user].Hard.length * scoreHard
        }`
    )
    .join("\n");

  return (
    <div className="App">
      <h1>Girlscript Summer of Code</h1>
      <pre>{`Username\tFull Name\tBeginner Issue Nums\tEasy Issue Nums`}</pre>
      <pre>{FinalData}</pre>
      <pre>{JSON.stringify(PRsByUser, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
