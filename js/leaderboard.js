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