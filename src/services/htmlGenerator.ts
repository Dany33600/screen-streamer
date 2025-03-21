
import { Content } from '@/types';
import { useAppStore } from '@/store';

/**
 * Service pour générer du HTML pour l'affichage de contenu
 */
class HtmlGeneratorService {
  /**
   * Vérifie si une URL est complète (commence par http:// ou https://)
   */
  private isFullUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Génère le HTML pour afficher le contenu sur l'écran
   */
  generateHtml(content?: Content): string {
    if (!content) {
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Écran - Aucun contenu</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #111;
              color: #fff;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            .container {
              max-width: 80%;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            p {
              font-size: 1.2rem;
              color: #aaa;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Aucun contenu assigné</h1>
            <p>Veuillez assigner du contenu à cet écran pour l'afficher.</p>
          </div>
        </body>
        </html>
      `;
    }
    
    // S'assurer que l'URL est une URL complète
    const contentUrl = content.url;
    
    // Déterminer le type de contenu
    switch (content.type) {
      case 'image':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
              .error-message {
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <img src="${contentUrl}" alt="${content.name}" onerror="this.style.display='none';document.body.innerHTML+='<div class=\\'error-message\\'><h2>Erreur de chargement de l\\'image</h2><p>URL: ${contentUrl}</p></div>';" />
          </body>
          </html>
        `;
        
      case 'video':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              video {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
              .error-message {
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <video src="${contentUrl}" autoplay loop controls onerror="this.style.display='none';document.body.innerHTML+='<div class=\\'error-message\\'><h2>Erreur de chargement de la vidéo</h2><p>URL: ${contentUrl}</p></div>';"></video>
          </body>
          </html>
        `;
        
      case 'powerpoint':
        // Utiliser reveal.js pour afficher les présentations
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <link rel="stylesheet" href="/node_modules/reveal.js/dist/reveal.css">
            <link rel="stylesheet" href="/node_modules/reveal.js/dist/theme/black.css">
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                overflow: hidden;
                background-color: #000;
                color: white;
                font-family: Arial, sans-serif;
              }
              .header {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                padding: 10px;
                background-color: rgba(0,0,0,0.7);
                z-index: 100;
                text-align: center;
              }
              .file-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 10px;
                background-color: rgba(0,0,0,0.7);
                z-index: 100;
                text-align: center;
                font-size: 14px;
              }
              .reveal {
                height: 100vh;
              }
              .error-message {
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
              .fallback-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 20px;
                text-align: center;
              }
              .download-btn {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 10px 2px;
                cursor: pointer;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${content.name}</h2>
            </div>
            
            <div class="reveal">
              <div class="slides">
                <section data-markdown="${contentUrl}"
                  data-separator="^\\n---\\n"
                  data-separator-vertical="^\\n--\\n"
                  data-separator-notes="^Note:"
                  data-charset="utf-8">
                </section>
              </div>
            </div>
            
            <div class="file-info">
              Présentation: ${content.name}
            </div>

            <script src="/node_modules/reveal.js/dist/reveal.js"></script>
            <script src="/node_modules/reveal.js/plugin/markdown/markdown.js"></script>
            <script src="/node_modules/reveal.js/plugin/highlight/highlight.js"></script>
            <script src="/node_modules/reveal.js/plugin/notes/notes.js"></script>
            <script>
              // Fonction pour vérifier si la présentation a chargé correctement
              function checkPresentationLoaded() {
                const slides = document.querySelector('.slides');
                if (slides && slides.children.length === 0) {
                  // Aucune diapositive n'a été chargée, afficher le fallback
                  document.body.innerHTML = \`
                    <div class="fallback-container">
                      <h2>Impossible de charger la présentation avec reveal.js</h2>
                      <p>Le fichier peut ne pas être dans un format compatible (Markdown).</p>
                      <p>URL: ${contentUrl}</p>
                      <a href="${contentUrl}" download class="download-btn">Télécharger la présentation</a>
                    </div>
                  \`;
                }
              }
              
              // Initialiser reveal.js
              Reveal.initialize({
                hash: true,
                autoSlide: 5000,
                loop: true,
                transition: 'slide',
                plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
              }).then(checkPresentationLoaded);
              
              // Vérifier après 5 secondes si la présentation a chargé
              setTimeout(checkPresentationLoaded, 5000);
            </script>
          </body>
          </html>
        `;
        
      case 'pdf':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                overflow: hidden;
                background-color: #000;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe src="${contentUrl}" width="100%" height="100%" frameborder="0"></iframe>
          </body>
          </html>
        `;
        
      case 'html':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                overflow: hidden;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe src="${contentUrl}" width="100%" height="100%" frameborder="0"></iframe>
          </body>
          </html>
        `;
        
      default:
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #111;
                color: #fff;
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .container {
                max-width: 80%;
              }
              h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
              }
              p {
                font-size: 1.2rem;
                color: #aaa;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${content.name}</h1>
              <p>Type de contenu non pris en charge: ${content.type}</p>
            </div>
          </body>
          </html>
        `;
    }
  }
}

// Exporter une instance unique du service
export const htmlGenerator = new HtmlGeneratorService();
