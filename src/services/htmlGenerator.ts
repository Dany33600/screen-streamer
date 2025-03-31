
import { Content, ContentType } from '@/types';

interface DisplayOptions {
  autoplay?: boolean;      // Pour les vidéos
  loop?: boolean;          // Pour les vidéos et présentations
  controls?: boolean;      // Pour les vidéos
  interval?: number;       // Pour les diaporamas (en ms)
  muted?: boolean;         // Pour les vidéos
  autoSlide?: number;      // Pour les présentations (en ms)
}

class HtmlGenerator {
  /**
   * Génère le HTML pour l'affichage d'un contenu
   * @param content Le contenu à afficher
   * @param options Options d'affichage
   */
  generateHtml(content: Content, options?: DisplayOptions): string {
    console.log(`Génération du HTML pour le contenu de type ${content.type}`);
    
    // Vérifier si l'URL commence par http:// ou https://
    const isExternalUrl = content.url.startsWith('http://') || content.url.startsWith('https://');
    
    switch (content.type) {
      case 'image':
        return this.generateImageHtml(content.url, isExternalUrl, options);
      case 'video':
        return this.generateVideoHtml(content.url, isExternalUrl, options);
      case 'pdf':
        return this.generatePdfHtml(content.url, isExternalUrl);
      case 'powerpoint':
        return this.generatePowerpointHtml(content.url, isExternalUrl, options);
      case 'html':
        if (isExternalUrl) {
          return this.generateIframeHtml(content.url);
        } else {
          return this.generateHtmlFileHtml(content.url);
        }
      case 'google-slides':
        return this.generateGoogleSlidesHtml(content.url);
      default:
        return this.generateDefaultHtml(content.url, content.type, isExternalUrl);
    }
  }
  
  /**
   * Génère le HTML pour l'affichage d'une image
   */
  private generateImageHtml(url: string, isExternal: boolean, options?: DisplayOptions): string {
    const imageUrl = isExternal ? url : `/api${url}`;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="${imageUrl}" alt="Image">
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'une vidéo
   */
  private generateVideoHtml(url: string, isExternal: boolean, options?: DisplayOptions): string {
    const videoUrl = isExternal ? url : `/api${url}`;
    const autoplay = options?.autoplay ? 'autoplay' : '';
    const loop = options?.loop ? 'loop' : '';
    const controls = options?.controls !== false ? 'controls' : '';
    const muted = options?.muted || options?.autoplay ? 'muted' : '';
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vidéo</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    video {
      max-width: 100%;
      max-height: 100%;
    }
  </style>
</head>
<body>
  <video src="${videoUrl}" ${autoplay} ${loop} ${controls} ${muted}></video>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'un PDF
   */
  private generatePdfHtml(url: string, isExternal: boolean): string {
    const pdfUrl = isExternal ? url : `/api${url}`;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
  <iframe src="${pdfUrl}" type="application/pdf"></iframe>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'un PowerPoint
   */
  private generatePowerpointHtml(url: string, isExternal: boolean, options?: DisplayOptions): string {
    const pptUrl = isExternal ? url : `/api${url}`;
    
    // Si c'est un lien externe vers Office Online ou Google Slides
    if (isExternal && (pptUrl.includes('office.com') || pptUrl.includes('docs.google.com'))) {
      return this.generateIframeHtml(pptUrl);
    }
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Présentation</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
  <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}"></iframe>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'un fichier HTML
   */
  private generateHtmlFileHtml(url: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contenu HTML</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
  <iframe src="/api${url}"></iframe>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'une présentation Google Slides
   */
  private generateGoogleSlidesHtml(url: string): string {
    // Extraire l'ID de la présentation Google Slides
    let slideId = url;
    
    if (url.includes('docs.google.com/presentation')) {
      // Format: https://docs.google.com/presentation/d/e/[ID]/pub
      const matches = url.match(/presentation\/d\/(.*?)(\/|$)/);
      if (matches && matches[1]) {
        slideId = matches[1];
      }
    }
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Slides</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
  <iframe src="https://docs.google.com/presentation/d/${slideId}/embed?start=true&loop=true&delayms=3000" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML pour l'affichage d'une iframe
   */
  private generateIframeHtml(url: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contenu intégré</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
  <iframe src="${url}" frameborder="0" allowfullscreen></iframe>
</body>
</html>`;
  }
  
  /**
   * Génère le HTML par défaut pour l'affichage d'un contenu
   */
  private generateDefaultHtml(url: string, type: ContentType, isExternal: boolean): string {
    const contentUrl = isExternal ? url : `/api${url}`;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contenu</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      color: #333;
      font-family: Arial, sans-serif;
    }
    .content {
      text-align: center;
      padding: 20px;
    }
    .content a {
      color: #0066cc;
      text-decoration: none;
    }
    .content a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Type de contenu: ${type}</h1>
    <p>Ce type de contenu n'est pas pris en charge pour l'affichage direct.</p>
    <p><a href="${contentUrl}" target="_blank">Ouvrir le contenu</a></p>
  </div>
</body>
</html>`;
  }
}

export const htmlGenerator = new HtmlGenerator();
