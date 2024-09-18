document.addEventListener('DOMContentLoaded', function() {
  // Event handlers for buttons
  document.getElementById('ilPostButton').addEventListener('click', ilPost);
  document.getElementById('ansaButton').addEventListener('click', ansa);
  document.getElementById('gazzettaButton').addEventListener('click', gazzetta);
  document.getElementById('headTable').style.display = 'none';

  function showHeadTableTitle() {
    document.getElementById('intro-text').style.display = 'none';
    const headTableTitle = document.getElementById('headTabletitle');
    headTableTitle.style.opacity = '1'; // Rende visibile l'elemento con una transizione
  }

  function clearTable() {
    document.getElementById('headTable').style.display = 'none';
    const newsTableBody = document.getElementById('newsTableBody');
    while (newsTableBody.firstChild) {
      newsTableBody.removeChild(newsTableBody.firstChild);
    }
  }

  function convertToDateAgo(input) {
    const now = new Date();
    const timeUnits = {
        "giorni": 24 * 60 * 60 * 1000,
        "giorno": 24 * 60 * 60 * 1000,
        "ore": 60 * 60 * 1000,
        "ora": 60 * 60 * 1000,
        "minuti": 60 * 1000,
        "minuto": 60 * 1000
    };

    if (typeof input === 'number') {
        const targetDate = new Date(now.getTime() - input * 24 * 60 * 60 * 1000);
        const day = targetDate.getDate();
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    let [value, unit] = input.split(" ");
    value = parseInt(value);

    if (isNaN(value) || !timeUnits[unit]) return "Formato non valido";

    const targetDate = new Date(now - value * timeUnits[unit]);
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function ilPost() {
    showHeadTableTitle()
    clearTable();
    fetch('https://news-chrome-extentiom.fly.dev/politica/ilpost')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const articles = Array.from(doc.querySelectorAll('._taxonomy-item_al3wh_1._opener_al3wh_14'));

            const news = articles.map(article => {
                const title = article.querySelector('._article-title_1aaqi_4').textContent;
                const publishedTime = article.querySelector('._taxonomy-item__time_al3wh_37.col-lg-1.col-sm-12').textContent;
                const publicationDate = convertToDateAgo(publishedTime);
                const contentElement = article.querySelector('._taxonomy-item__content_al3wh_53.col-lg-7.col-8');
                const paragraphs = Array.from(contentElement.querySelectorAll('._article-paragraph_e98aq_1')).map(p => p.textContent).join('\n');
                const articleUrl = article.querySelector('._taxonomy-item_al3wh_1._opener_al3wh_14 a').getAttribute('href');
                return { title, date: publicationDate, paragraphs, articleUrl };
            });
            news.sort((a, b) => new Date(b.date) - new Date(a.date));

            const newsTableBody = document.getElementById('newsTableBody');
            news.forEach(item => {
                const row = document.createElement('tr');
                const dateCell = document.createElement('td');
                const contentCell = document.createElement('td');

                dateCell.textContent = item.date;
                dateCell.classList.add('date-cell'); // Add class for smaller font size

                contentCell.innerHTML = `<b>${item.title}</b><br>${item.paragraphs}<br><a href="${item.articleUrl}" target="_blank">Vai alla notizia</a>`;

                row.appendChild(dateCell);
                row.appendChild(contentCell);
                newsTableBody.appendChild(row);
            });

            document.getElementById('headTable').style.display = 'table';
        })
        .catch(error => console.error('Error fetching news:', error));
  }

  function convertDate(dateString) {
    const months = {
      "gennaio": "01",
      "febbraio": "02",
      "marzo": "03",
      "aprile": "04",
      "maggio": "05",
      "giugno": "06",
      "luglio": "07",
      "agosto": "08",
      "settembre": "09",
      "ottobre": "10",
      "novembre": "11",
      "dicembre": "12"
    };

    const parts = dateString.split(' ');
    const day = parts[0];
    const month = months[parts[1].toLowerCase()];
    const year = parts[2];

    return `${day}/${month}/${year}`;
  }

  function ansa() {
    showHeadTableTitle()
    clearTable();
    const fetchPromises = [];

    for (let i = 0; i <= 1; i++) {
        const fetchPromise = fetch('https://news-chrome-extentiom.fly.dev/politica/ansa/' + i)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                const container = doc.querySelector('.articles-list');
                if (!container) {
                    console.error('Container not found');
                    return [];
                }

                const articles = Array.from(container.querySelectorAll('.article-teaser'));

                return articles.map(article => {
                    const titleElement = article.querySelector('.title');
                    const title = titleElement ? titleElement.textContent : 'No title';

                    const dateElement = article.querySelector('.date');
                    const completeDate = dateElement ? dateElement.textContent.trim() : '';
                    const publicationDate = convertDate(completeDate);

                    const summaryElement = article.querySelector('.summary');
                    const paragraphs = summaryElement ? summaryElement.textContent : '';

                    const linkElement = article.querySelector('.title a');
                    let articleUrl = linkElement ? linkElement.getAttribute('href') : '#';
                    if (!articleUrl.startsWith('http')) {
                        articleUrl = 'https://www.ansa.it' + articleUrl;
                    }

                    return { title, date: publicationDate, paragraphs, articleUrl };
                });
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                return [];
            });

        fetchPromises.push(fetchPromise);
    }

    Promise.all(fetchPromises)
        .then(results => {
            const allNews = results.flat();
            allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

            const newsTableBody = document.getElementById('newsTableBody');
            allNews.forEach(item => {
                const row = document.createElement('tr');
                const dateCell = document.createElement('td');
                const contentCell = document.createElement('td');

                dateCell.textContent = item.date;
                dateCell.classList.add('date-cell'); // Add class for smaller font size

                contentCell.innerHTML = `<b>${item.title}</b><br>${item.paragraphs}<br><a href="${item.articleUrl}" target="_blank">Vai alla notizia</a>`;

                row.appendChild(dateCell);
                row.appendChild(contentCell);
                newsTableBody.appendChild(row);
            });

            document.getElementById('headTable').style.display = 'table';
        });
  }

  function gazzetta() {
    showHeadTableTitle()
    clearTable();

    const fetchPromises = [];
  
    for (let i = 1; i < 10; i++) {
      const fetchPromise = fetch(`https://news-chrome-extentiom.fly.dev/politica/gazzetta/${i}`)
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, 'text/html');

          const articles = Array.from(doc.querySelectorAll('.grid_16_notizia'));
          return articles.map(article => {
            const title = article.querySelector('h6').textContent;
            const publicationDate = convertDate(article.querySelector('.subtitolo_grid').textContent.trim());
            const paragraphs = article.querySelector('.corpo_notizia').textContent;

            const articleUrl = article.querySelector('.corpo_notizia p a').getAttribute('href');

            return { title, date: publicationDate, paragraphs, articleUrl };
          });
        })
        .catch(error => {
          console.error('Error fetching news:', error);
          return [];
        });

      fetchPromises.push(fetchPromise);
    }
  
    Promise.all(fetchPromises)
      .then(results => {
        const allNews = results.flat();
        allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

        const newsTableBody = document.getElementById('newsTableBody');
        allNews.forEach(item => {
          const row = document.createElement('tr');
          const dateCell = document.createElement('td');
          const contentCell = document.createElement('td');

          dateCell.textContent = item.date;
          dateCell.classList.add('date-cell'); // Add class for smaller font size

          contentCell.innerHTML = `<b>${item.title}</b><br>${item.paragraphs}<br><a href="${item.articleUrl}" target="_blank">Vai alla notizia</a>`;

          row.appendChild(dateCell);
          row.appendChild(contentCell);
          newsTableBody.appendChild(row);
        });

        document.getElementById('headTable').style.display = 'table';
      });
  }
});
