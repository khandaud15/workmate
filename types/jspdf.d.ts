declare module 'jspdf' {
  class jsPDF {
    constructor(options?: {
      orientation?: 'portrait' | 'landscape';
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
    });
    
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): jsPDF;
    
    save(filename?: string): jsPDF;
    output(type: string, options?: any): any;
    setFontSize(size: number): jsPDF;
    text(text: string, x: number, y: number, options?: any): jsPDF;
    html(element: HTMLElement | string, options?: any): Promise<jsPDF>;
    
    internal: any;
  }
  
  export default jsPDF;
}
