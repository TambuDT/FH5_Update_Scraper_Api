const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
// const cors = require('cors'); // se ti serve per richieste da frontend

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors()); // opzionale

app.get('/scrape', async (req, res) => {
  try {
    const url = 'https://teamkong.tk/forza-horizon-5/';

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const $ = cheerio.load(data);

    // Estrazione della versione
    const fullTitle = $('h1.entry-title').text().trim();
    if (!fullTitle) throw new Error('Titolo non trovato');

    const versionMatch = fullTitle.match(/\d+(\.\d+){2,3}/);
    const version = versionMatch ? versionMatch[0] : 'Versione non trovata';

    // Estrazione del link .torrent o magnetico
    let linkHref = null;

    // Metodo 1: cerca un link con classe specifica o struttura più semplice
    const possibleLinks = $('a');
    possibleLinks.each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        if (href.endsWith('.torrent') || href.startsWith('magnet:')) {
          linkHref = href;
          return false; // interrompe il ciclo each
        }
      }
    });

    // Metodo 2: regex fallback su HTML grezzo
    if (!linkHref) {
      const match = data.match(/href="(https?:\/\/[^"]+\.torrent)"/i);
      if (match && match[1]) {
        linkHref = match[1];
      }
    }

    // Risposta finale
    res.json({
      success: true,
      data: {
        version,
        link: linkHref || null
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
