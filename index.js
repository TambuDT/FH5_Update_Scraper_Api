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
    const fullTitle = $('h1.entry-title').text();
    const versionMatch = fullTitle.match(/v\d+\.\d+\.\d+\.\d+/); // Cerca "vX.X.X.X"
    const version = versionMatch ? versionMatch[0] : 'Versione non trovata';


    // Estrazione del link torrent o magnetico
    let linkHref = null;

    // Metodo 1: Cerca il link tramite selettore specifico
    const linkElement = $('#post-838 > div.entry-content-wrap.read-single > div.color-pad > div > div:nth-child(9) > a');
    if (linkElement.length > 0) {
      linkHref = linkElement.attr('href');
    }

    // Metodo 2: Cerca tutti i tag <a> con href che termina con ".torrent"
    if (!linkHref) {
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.endsWith('.torrent')) {
          linkHref = href;
        }
      });
    }

    // Metodo 3: Cerca tutti i tag <a> con href che inizia con "magnet:"
    if (!linkHref) {
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('magnet:')) {
          linkHref = href;
        }
      });
    }

    // Metodo 4: Usa regex generica per cercare pattern di link torrent nel contenuto HTML
    if (!linkHref) {
      const regex = /href="(https?:\/\/.*?\.torrent)"/gi;
      const matches = data.match(regex);
      if (matches && matches.length > 0) {
        linkHref = matches[0].replace('href="', '').replace('"', '');
      }
    }

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
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});