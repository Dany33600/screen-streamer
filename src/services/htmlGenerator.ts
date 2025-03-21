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
              .reveal .slides {
                text-align: center;
              }
              .reveal .slides > section {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
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
              
              /* Styles Reveal.js embarqués */
              .reveal {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                touch-action: pinch-zoom;
              }
              .reveal.embedded {
                height: 100vh;
              }
              .reveal .slides {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
                pointer-events: none;
                overflow: visible;
                z-index: 1;
                text-align: center;
                perspective: 600px;
                perspective-origin: 50% 40%;
              }
              .reveal .slides > section {
                perspective: 600px;
              }
              .reveal .slides > section,
              .reveal .slides > section > section {
                display: none;
                position: absolute;
                width: 100%;
                padding: 20px 0;
                z-index: 10;
                line-height: 1.2;
                font-weight: normal;
                transform-style: flat;
                transition: transform-origin 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985),
                            transform 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985),
                            visibility 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985),
                            opacity 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985);
              }
              .reveal .slides > section.present,
              .reveal .slides > section > section.present {
                display: block;
                z-index: 11;
                opacity: 1;
              }
              .reveal.center .slides > section {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
              .reveal .controls {
                position: absolute;
                bottom: 20px;
                right: 20px;
                color: #fff;
                z-index: 1000;
              }
              .reveal .progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background-color: rgba(0,0,0,0.2);
                z-index: 1000;
              }
              .reveal .progress span {
                display: block;
                height: 100%;
                width: 0;
                background-color: #42affa;
                transition: width 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985);
              }
              /* Thème noir pour reveal.js */
              .reveal {
                color: #fff;
                background-color: #111;
              }
              .reveal h1,
              .reveal h2,
              .reveal h3,
              .reveal h4,
              .reveal h5,
              .reveal h6 {
                color: #fff;
                font-weight: 600;
                line-height: 1.2;
                letter-spacing: normal;
                text-shadow: none;
                word-wrap: break-word;
              }
              .reveal h1 { font-size: 3.77em; }
              .reveal h2 { font-size: 2.11em; }
              .reveal h3 { font-size: 1.55em; }
              .reveal h4 { font-size: 1em; }
              
              .reveal a {
                color: #42affa;
                text-decoration: none;
              }
              .reveal a:hover {
                color: #8dcffc;
                text-shadow: none;
                border: none;
              }
              .reveal strong,
              .reveal b {
                font-weight: bold;
              }
              .reveal em,
              .reveal i {
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="reveal">
              <div class="slides">
                <section>
                  <h2>${content.name}</h2>
                  <p>Présentation en cours de chargement...</p>
                  <div>
                    <a href="${contentUrl}" class="download-btn" download target="_blank">
                      Télécharger la présentation
                    </a>
                  </div>
                </section>
              </div>
              
              <div class="progress">
                <span></span>
              </div>
            </div>
            
            <script>
              // Version simplifiée de Reveal.js pour l'affichage basique des slides
              document.addEventListener('DOMContentLoaded', function() {
                // Configuration de base de Reveal.js
                const config = {
                  autoSlide: 5000,
                  loop: true,
                  transition: 'slide',
                  controls: true,
                  progress: true,
                  center: true,
                  hash: false,
                  slideNumber: false
                };
                
                // Variables de navigation
                let currentSlide = 0;
                let totalSlides = 1;
                
                // Créer des slides basiques à partir du fichier PowerPoint
                function loadPresentation() {
                  const slidesContainer = document.querySelector('.slides');
                  const currentSection = slidesContainer.querySelector('section');
                  
                  // Ajouter un iframe qui tente de charger le fichier PowerPoint
                  const iframe = document.createElement('iframe');
                  iframe.src = "${contentUrl}";
                  iframe.width = "100%";
                  iframe.height = "100%";
                  iframe.style.border = "none";
                  iframe.style.margin = "0";
                  iframe.style.padding = "0";
                  iframe.style.boxSizing = "border-box";
                  
                  // Nettoyer la section actuelle et ajouter l'iframe
                  currentSection.innerHTML = '';
                  currentSection.appendChild(iframe);
                  
                  // Marquer ce slide comme présent (visible)
                  currentSection.classList.add('present');
                  
                  // Démarrer le diaporama automatique
                  startAutoSlide();
                }

                // Tenter de charger la présentation
                loadPresentation();
                
                // Fonction d'autoplay
                function startAutoSlide() {
                  if (config.autoSlide && config.autoSlide > 0) {
                    setTimeout(function() {
                      // Pour l'instant, nous n'avons qu'un seul slide, donc on simule juste le rechargement
                      if (config.loop) {
                        const progressBar = document.querySelector('.progress span');
                        // Animation de la barre de progression
                        progressBar.style.width = '0%';
                        setTimeout(() => {
                          progressBar.style.transition = 'width ' + config.autoSlide + 'ms linear';
                          progressBar.style.width = '100%';
                        }, 100);
                        
                        startAutoSlide();
                      }
                    }, config.autoSlide);
                    
                    // Initialiser la barre de progression
                    const progressBar = document.querySelector('.progress span');
                    progressBar.style.transition = 'width ' + config.autoSlide + 'ms linear';
                    progressBar.style.width = '100%';
                  }
                }
                
                // Ajouter un gestionnaire d'erreur pour l'iframe
                document.querySelector('iframe').onerror = function() {
                  document.querySelector('.slides').innerHTML = \`
                    <section class="present">
                      <div class="fallback-container">
                        <h2>Impossible de charger la présentation</h2>
                        <p>Le format peut ne pas être compatible avec l'affichage direct.</p>
                        <p>URL: ${contentUrl}</p>
                        <a href="${contentUrl}" download class="download-btn">Télécharger la présentation</a>
                      </div>
                    </section>
                  \`;
                };
                
                // Log le statut d'initialisation
                console.log('Présentation initialisée avec autoSlide =', config.autoSlide, 'ms');
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

