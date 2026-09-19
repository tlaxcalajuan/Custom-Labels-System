import { Injectable } from '@angular/core';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/** Formatos de exportación soportados por la etiqueta. */
export type LabelExportFormat = 'png' | 'jpg' | 'pdf';

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
    const pixelRatio = options.pixelRatio ?? 3;
    // Cuando la etiqueta se exporta transparente, no pintamos fondo en PNG/PDF.
    // JPG no soporta transparencia: usamos blanco como fallback.
    const rasterBackground = options.transparent ? undefined : options.background;
    const jpgBackground = options.transparent ? '#ffffff' : options.background;

    switch (format) {
      case 'png': {
        const dataUrl = await toPng(node, {
          pixelRatio,
          cacheBust: true,
          backgroundColor: rasterBackground,
        });
        this.download(dataUrl, `${options.fileName}.png`);
        return;
      }
      case 'jpg': {
        const dataUrl = await toJpeg(node, {
          pixelRatio,
          cacheBust: true,
          quality: 0.95,
          backgroundColor: jpgBackground,
        });
        this.download(dataUrl, `${options.fileName}.jpg`);
        return;
      }
      case 'pdf': {
        const dataUrl = await toPng(node, {
          pixelRatio,
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
