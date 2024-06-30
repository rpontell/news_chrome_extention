document.addEventListener('DOMContentLoaded', function() {
  fetch('https://estensione-chrome.fly.dev/politica')
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      
      // Seleziona tutti gli articoli con la classe specificata
      const articles = Array.from(doc.querySelectorAll('._taxonomy-item_al3wh_1._opener_al3wh_14'));

      // Mappa per ottenere titolo, data e contenuto dell'articolo
      const today = new Date();
      const news = articles.map(article => {
        const title = article.querySelector('._article-title_1aaqi_4').textContent;
        const publishedDaysAgo = parseInt(article.querySelector('._taxonomy-item__time_al3wh_37.col-lg-1.col-sm-12').textContent);
        const publicationDate = new Date(today);
        publicationDate.setDate(today.getDate() - publishedDaysAgo); // Sottrai giorni dalla data corrente
        const contentElement = article.querySelector('._taxonomy-item__content_al3wh_53.col-lg-7.col-8');
        const paragraphs = Array.from(contentElement.querySelectorAll('._article-paragraph_e98aq_1')).map(p => p.textContent).join('\n');
        const articleUrl = article.querySelector('._taxonomy-item_al3wh_1._opener_al3wh_14 a').getAttribute('href'); // URL dell'articolo completo
        return { title, date: publicationDate, paragraphs, articleUrl };
      });

      // Ordina le notizie per data
      news.sort((a, b) => b.date - a.date);

      const newsTableBody = document.getElementById('newsTableBody');
      news.forEach(item => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const contentCell = document.createElement('td');

        dateCell.textContent = item.date.toLocaleDateString();

        // Aggiungi il titolo con paragrafi
        contentCell.innerHTML = `<b>${item.title}</b><br>${item.paragraphs}<br><a href="${item.articleUrl}" target="_blank">Vai alla notizia</a>`;

        row.appendChild(dateCell);
        row.appendChild(contentCell);
        newsTableBody.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching news:', error));
});
