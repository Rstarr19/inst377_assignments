// Voice Commands
if (annyang) {

  const commands = {

    // Hello
    'hello': function () {
      alert('Hello World');
    },

    // Change background color
    'change the color to *color': function (color) {
      document.body.style.backgroundColor = color;
    },

    // Navigation
    'navigate to *page': function (page) {

      page = page.toLowerCase().trim();

      if (page === 'home') {
        window.location.href = 'assignment3_index.html';
      } else if (page === 'stocks') {
        window.location.href = 'assignment3_stocks.html';
      } else if (page === 'dogs') {
        window.location.href = 'assignment3_dogs.html';
      }
    },

    // Stock lookup
    'lookup *ticker': function (ticker) {

      const input = document.getElementById('ticker');
      if (!input) return;

      input.value = ticker.toUpperCase();

      if (typeof getStock === "function") {
        getStock();
      }
    },

    // Dog breed lookup
    'load dog breed *breed': function (breedName) {

      if (!window.breedsList || window.breedsList.length === 0) {
        alert("Dog data not loaded yet.");
        return;
      }

      breedName = breedName.toLowerCase().trim();

      const found = window.breedsList.find(b =>
        b.name.toLowerCase().includes(breedName)
      );

      if (found) {
        showBreed(found);
      } else {
        alert("Breed not found.");
      }
    }

  };

  annyang.addCommands(commands);
}



// Home page

if (window.location.pathname.includes('index')) {

  fetch('https://api.quotable.io/random')
    .then(res => res.json())
    .then(data => {
      const q = document.getElementById('quote');
      if (q) q.innerText = data.content;
    });

}



// Stocks page
async function getStock() {

  const tickerInput = document.getElementById('ticker');
  const daysSelect = document.getElementById('days');

  if (!tickerInput || !daysSelect) return;

  const ticker = tickerInput.value.trim().toUpperCase();
  const days = parseInt(daysSelect.value);

  if (!ticker) {
    alert("Please enter a ticker.");
    return;
  }

  const apiKey = "xampqX349UgUpJnRDpB1ARApHo22cbH5"; 

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const from = formatDate(startDate);
  const to = formatDate(endDate);

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!data.results || data.results.length === 0) {
      alert("No data found for this ticker.");
      return;
    }

    const prices = data.results.map(d => d.c);
    const dates = data.results.map(d =>
      new Date(d.t).toLocaleDateString()
    );

    renderChart(dates, prices);

  } catch (err) {
    console.error(err);
    alert("Error fetching stock data.");
  }
}


// Chart
let stockChart = null;

function renderChart(labels, data) {

  const canvas = document.getElementById('stockChart');
  if (!canvas) return;

  if (stockChart) {
    stockChart.destroy();
  }

  stockChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Closing Price',
        data: data
      }]
    }
  });
}



// Reddit Stock table

if (window.location.pathname.includes('stocks')) {

  fetch('https://apewisdom.io/api/v1.0/filter/all-stocks/page/4')
    .then(res => res.json())
    .then(data => {

      const table = document.getElementById('stockTable');
      if (!table) return;

      const top5 = data.results.slice(0, 5);

      top5.forEach(stock => {

        const row = `
          <tr>
            <td>
              <a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">
                ${stock.ticker}
              </a>
            </td>
            <td>${stock.mentions}</td>
            <td>${stock.sentiment}</td>
            <td>${stock.upvotes > 1 ? '🐂' : '🐻'}</td>
          </tr>
        `;

        table.innerHTML += row;
      });

    });

}




// Dogs page

if (window.location.pathname.includes('assignment3_dogs')) {

  document.addEventListener("DOMContentLoaded", async function () {


    // Dog pictures in carosel 
    const container = document.getElementById('dogImages');

    if (container) {

      for (let i = 0; i < 10; i++) {

        try {
          const res = await fetch('https://dog.ceo/api/breeds/image/random');
          const data = await res.json();

          const slide = document.createElement('div');
          slide.classList.add('swiper-slide');

          const img = document.createElement('img');
          img.src = data.message;

          slide.appendChild(img);
          container.appendChild(slide);

        } catch (err) {
          console.error("Dog image error:", err);
        }
      }

      new Swiper('.swiper', {
        loop: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      });
    }



    // Dog Breeds

    try {

      const res = await fetch('https://api.thedogapi.com/v1/breeds');
      const data = await res.json();

      window.breedsList = data;

      const btnContainer = document.getElementById('breedButtons');

      if (!btnContainer) {
        console.error("breedButtons container missing");
        return;
      }

      const randomBreeds = data
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      randomBreeds.forEach(breed => {

        const btn = document.createElement('button');
        btn.innerText = breed.name;

        btn.setAttribute("class", "breed-btn");

        btn.addEventListener("click", function () {
          showBreed(breed);
        });

        btnContainer.appendChild(btn);
      });

    } catch (err) {
      console.error("Breed API error:", err);
    }

  });
}


function showBreed(breed) {

  const div = document.getElementById('breedInfo');
  if (!div) return;

  div.innerHTML = `
    <h2>${breed.name}</h2>
    <p>${breed.temperament || "No description available"}</p>
    <p><strong>Life Span:</strong> ${breed.life_span}</p>
  `;
}
