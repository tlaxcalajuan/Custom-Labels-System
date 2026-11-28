import { Injectable } from '@angular/core';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FUGAZ_ONE_B64 } from './fugaz-font';

/** Formatos de exportación soportados por la etiqueta. */
export type LabelExportFormat = 'png' | 'jpg' | 'pdf' | 'svg';

/** Opciones para exportar el DOM de la etiqueta. */
export interface LabelExportOptions {
  /** Nombre base del archivo, sin extensión. */
  fileName: string;
  /** Ancho de impresión en milímetros (para PDF). */
  widthMm: number;
  /** Alto de impresión en milímetros (para PDF). */
  heightMm: number;
  /** Color de fondo. Se aplica también al JPG que no soporta transparencia. */
  background: string;
  /**
   * Si es `true`, PNG y PDF se exportan con fondo transparente. Como JPG no
   * admite transparencia, se sustituye por blanco al exportar en ese formato.
   */
  transparent?: boolean;
  /** Multiplicador de resolución. 3 ≈ 300dpi a las medidas dadas. */
  pixelRatio?: number;
}

/**
 * Exporta el nodo DOM de la etiqueta a PNG, JPG o PDF.
 * El nodo debe representar la etiqueta a tamaño real (mm) para que la
 * conversión resulte en un archivo de alta resolución.
 */
@Injectable({ providedIn: 'root' })
export class LabelExportService {
  async export(
    node: HTMLElement,
    format: LabelExportFormat,
    options: LabelExportOptions,
  ): Promise<void> {
    const pixelRatio = options.pixelRatio ?? 4;
    // Cuando la etiqueta se exporta transparente, no pintamos fondo en PNG/PDF.
    // JPG no soporta transparencia: usamos blanco como fallback.
    const rasterBackground = options.transparent ? undefined : options.background;
    const jpgBackground = options.transparent ? '#ffffff' : options.background;

    switch (format) {
      case 'png': {
        await this.warmup(node, pixelRatio, rasterBackground);
        const dataUrl = await toPng(node, {
          pixelRatio,
          cacheBust: true,
          backgroundColor: rasterBackground,
        });
        this.download(dataUrl, `${options.fileName}.png`);
        return;
      }
      case 'jpg': {
        await this.warmup(node, pixelRatio, jpgBackground);
        const dataUrl = await toJpeg(node, {
          pixelRatio,
          cacheBust: true,
          quality: 0.98,
          backgroundColor: jpgBackground,
        });
        this.download(dataUrl, `${options.fileName}.jpg`);
        return;
      }
      case 'svg': {
        await this.warmup(node, pixelRatio, rasterBackground);
        const dataUrl = await toSvg(node, {
          backgroundColor: rasterBackground,
        });
        this.download(dataUrl, `${options.fileName}.svg`);
        return;
      }
      case 'pdf': {
        // Aumentamos el pixelRatio para PDF UltraHD (8 ≈ 600-800 dpi)
        const pdfPixelRatio = Math.max(pixelRatio, 8);
        await this.warmup(node, pdfPixelRatio, rasterBackground);
        const dataUrl = await toPng(node, {
          pixelRatio: pdfPixelRatio,
          cacheBust: true,
          backgroundColor: rasterBackground,
        });
        const orientation = options.widthMm >= options.heightMm ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'mm',
          format: [options.widthMm, options.heightMm],
          compress: true,
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, options.widthMm, options.heightMm);
        pdf.save(`${options.fileName}.pdf`);
        return;
      }
    }
  }

  /**
   * Inyecta las fuentes como @font-face base64 dentro del nodo antes de
   * capturar, para que html-to-image las embeba correctamente en la imagen.
   * Renderiza 2 veces para que el navegador termine de procesar las fuentes.
   */
  private async warmup(
    node: HTMLElement,
    pixelRatio: number,
    background: string | undefined,
  ): Promise<void> {
    // Inyecta un <style> con la fuente en base64 directamente en el nodo
    const styleId = '__label-export-fonts__';
    if (!node.querySelector(`#${styleId}`)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @font-face {
          font-family: 'Fugaz One';
          src: url('data:font/truetype;base64,${FUGAZ_ONE_B64}') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
      `;
      node.prepend(style);
    }
    // Dos pasadas para asegurar que el navegador procese la fuente
    await toPng(node, { pixelRatio, cacheBust: true, backgroundColor: background });
    await toPng(node, { pixelRatio, cacheBust: true, backgroundColor: background });
  }

  /** Descarga una data URL como archivo. */
  private download(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
