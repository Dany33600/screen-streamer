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
  generateHtml(content?: Content, displayOptions?: any): string {
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
        const autoplay = displayOptions?.autoplay !== false;
        const loop = displayOptions?.loop !== false;
        const controls = displayOptions?.controls !== false;
        const muted = displayOptions?.muted !== false;
        
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
            <video 
              src="${contentUrl}" 
              ${autoplay ? 'autoplay' : ''} 
              ${loop ? 'loop' : ''} 
              ${controls ? 'controls' : ''} 
              ${muted ? 'muted' : ''}
              onerror="this.style.display='none';document.body.innerHTML+='<div class=\\'error-message\\'><h2>Erreur de chargement de la vidéo</h2><p>URL: ${contentUrl}</p></div>';">
            </video>
          </body>
          </html>
        `;
        
      case 'powerpoint':
        const autoSlide = displayOptions?.autoSlide || 5000; // Default 5 seconds
        const powerPointLoop = displayOptions?.loop !== false;
        
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/theme/black.min.css">
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
              .reveal iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
              .reveal .slides {
                text-align: center;
              }
              .download-btn {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
                font-size: 16px;
              }
              .presentation-title {
                position: absolute;
                top: 10px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 18px;
                z-index: 1000;
                padding: 10px;
                background-color: rgba(0,0,0,0.5);
              }
              .reveal .slides > section {
                height: 90vh; /* Ensure slides take up most of the viewport height */
              }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.js"></script>
          </head>
          <body>
            <div class="presentation-title">${content.name}</div>
            
            <div class="reveal">
              <div class="slides">
                <section>
                  <h2>Présentation</h2>
                  <p>Votre présentation est en cours de chargement...</p>
                  <div class="ppt-container">
                    <iframe 
                      src="${contentUrl}" 
                      allowfullscreen
                      onload="this.style.display='block'"
                      onerror="handlePPTError()"
                    ></iframe>
                  </div>
                  <a href="${contentUrl}" class="download-btn" download>
                    Télécharger la présentation
                  </a>
                </section>
              </div>
            </div>
            
            <script>
              // Configuration et initialisation de reveal.js
              let deck = new Reveal({
                controls: true,
                progress: true,
                center: true,
                hash: false,
                // Configuration de l'auto-slide
                autoSlide: ${autoSlide},
                autoSlideStoppable: false,
                loop: ${powerPointLoop}, 
                transition: 'slide',
                showNotes: false,
              });
              
              // Initialiser reveal.js
              deck.initialize();
              
              // Fonction pour gérer l'erreur de chargement du PowerPoint
              function handlePPTError() {
                console.error("Erreur lors du chargement du fichier PowerPoint:", "${contentUrl}");
                document.querySelector('.ppt-container').innerHTML = \`
                  <div style="padding: 20px; background-color: rgba(0,0,0,0.6); border-radius: 8px; margin: 20px 0;">
                    <h3>Impossible d'afficher la présentation dans l'iframe</h3>
                    <p>Le format PowerPoint n'est pas directement visualisable dans le navigateur.</p>
                    <p>Veuillez télécharger la présentation pour la visualiser.</p>
                  </div>
                \`;
              }
              
              // Force start the auto-slide after initialization
              document.addEventListener('DOMContentLoaded', function() {
                // Ensure auto-slide is started
                deck.configure({ autoSlide: ${autoSlide} });
                // Start auto-slide
                deck.toggleAutoSlide(true);
                console.log("Auto-slide enabled with interval:", deck.getConfig().autoSlide);
              });
              
              // Additional event listeners to ensure auto-slide is working
              deck.on('ready', function() {
                console.log("Reveal.js is ready");
                deck.toggleAutoSlide(true);
              });
              
              deck.on('slidechanged', function() {
                console.log("Slide changed, auto-slide status:", deck.isAutoSliding());
              });
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
