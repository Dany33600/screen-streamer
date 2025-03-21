
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
        // Utiliser une approche directe d'intégration de PowerPoint
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
                display: flex;
                flex-direction: column;
                color: white;
                font-family: Arial, sans-serif;
              }
              .header {
                padding: 10px;
                background-color: #333;
                text-align: center;
              }
              .content {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
              embed {
                width: 100%;
                height: 100%;
              }
              object {
                width: 100%;
                height: 100%;
              }
              .error-message {
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .fallback-container {
                text-align: center;
                padding: 20px;
              }
              .fallback-container img {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
              }
              .controls {
                padding: 10px;
                background-color: #333;
                text-align: center;
              }
              button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${content.name}</h2>
            </div>
            <div class="content">
              <!-- Essai avec object -->
              <object 
                data="${contentUrl}" 
                type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
                width="100%" 
                height="100%"
                onerror="document.getElementById('fallback').style.display='block'; this.style.display='none';"
              >
                <!-- Fallback pour navigateurs qui ne supportent pas object -->
                <div id="fallback" class="fallback-container">
                  <p>Votre navigateur ne peut pas afficher ce fichier PowerPoint directement.</p>
                  <p>
                    <a href="${contentUrl}" download>Télécharger la présentation</a>
                  </p>
                  <div>
                    <p>Aperçu indisponible pour le fichier:</p>
                    <p>${contentUrl}</p>
                  </div>
                </div>
              </object>
            </div>
            <div class="controls">
              <a href="${contentUrl}" download>
                <button>Télécharger</button>
              </a>
              <button onclick="window.open('${contentUrl}', '_blank')">Ouvrir dans un nouvel onglet</button>
            </div>
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
