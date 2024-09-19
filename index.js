const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    // URL della pagina da cui fare scraping
    const url = 'https://teamkong.tk/forza-horizon-5/';

    // Richiesta HTTP per ottenere il contenuto della pagina
    const { data } = await axios.get(url);

    // Carica i dati HTML con cheerio
    const $ = cheerio.load(data);

    // Estrazione della versione del gioco
    const fullTitle = $('#post-838 > div:nth-child(1) > div:nth-child(1) > header > div > div > h1').text();
    const versionMatch = fullTitle.match(/v\d+\.\d+\.\d+\.\d+/); // Cerca "vX.X.X.X"
    const version = versionMatch ? versionMatch[0] : 'Versione non trovata';

    // Estrazione del link
    const linkElement = $('#post-838 > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(7) > a');
    const linkHref = linkElement.attr('href'); // URL del link

    // Restituisci versione e link in formato JSON
    res.json({
      success: true,
      data: {
        version: version,
        link: linkHref || 'URL del link non trovato'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante lo scraping',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
