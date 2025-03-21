
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
