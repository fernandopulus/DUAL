
import { StudentEvaluation, RubricItem, GroundingMetadata } from '../types'; // Updated import

// This tells TypeScript that html2canvas is a global variable, loaded via CDN.
// This is appropriate because html2canvas is used directly as `html2canvas(...)`.
declare var html2canvas: any;

// This tells TypeScript about the structure of window.jspdf
// which is how the jsPDF library (version 2.x.x umd) exposes itself when loaded via CDN.
declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => any; // Defines jsPDF as a constructor
    };
  }
}

interface ReportData {
  studentName: string;
  course: string;
  evaluationDate: string;
  scores: StudentEvaluation;
  totalScore: number;
  finalGrade: number | null;
  aiFeedback: string;
  rubricData: RubricItem[];
  groundingMetadata?: GroundingMetadata; // Updated type
}

export async function downloadReportAsPDF(reportData: ReportData): Promise<void> {
  const { studentName, course, evaluationDate, scores, totalScore, finalGrade, aiFeedback, rubricData, groundingMetadata } = reportData;

  const reportElementId = 'pdf-report-content-dynamic'; 
  let reportElement = document.getElementById(reportElementId);

  if (!reportElement) {
    reportElement = document.createElement('div');
    reportElement.id = reportElementId;
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    reportElement.style.width = '210mm'; 
    reportElement.style.padding = '20px';
    reportElement.style.backgroundColor = 'white';
    reportElement.style.color = 'black';
    reportElement.style.fontSize = '10pt'; 
    reportElement.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(reportElement);
  }
  
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 10pt;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 18pt; font-weight: bold; margin:0;">Liceo Industrial de Recoleta</h1>
        <h2 style="font-size: 14pt; margin:5px 0;">Informe de Evaluación de Presentación Dual</h2>
      </div>
      <div style="margin-bottom: 15px;">
        <p><strong>Nombre del Estudiante:</strong> ${studentName}</p>
        <p><strong>Curso:</strong> ${course}</p>
        <p><strong>Fecha de Evaluación:</strong> ${evaluationDate}</p>
      </div>
      <h3 style="font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Resultados de la Evaluación</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 6px; text-align: left; background-color: #f2f2f2;">Indicador</th>
            <th style="border: 1px solid #ddd; padding: 6px; text-align: center; background-color: #f2f2f2;">Puntaje</th>
            <th style="border: 1px solid #ddd; padding: 6px; text-align: left; background-color: #f2f2f2;">Nivel Alcanzado</th>
          </tr>
        </thead>
        <tbody>
  `;

  rubricData.forEach(item => {
    const scoreValue = scores[item.id];
    const level = scoreValue ? item.levels.find(l => l.points === scoreValue) : null;
    htmlContent += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 6px;">${item.title}</td>
            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${scoreValue !== undefined ? scoreValue : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${level ? level.levelName : 'N/A'}</td>
          </tr>
    `;
  });

  htmlContent += `
        </tbody>
      </table>
      <div style="margin-bottom: 20px; font-size: 10pt;">
        <p><strong>Puntaje Total Obtenido:</strong> ${totalScore} de ${rubricData.length * 4}</p>
        <p><strong>Nota Final Calculada:</strong> ${finalGrade !== null ? finalGrade.toFixed(1) : 'N/A'}</p>
      </div>
      <h3 style="font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Retroalimentación de profesores</h3>
      <div style="white-space: pre-wrap; word-wrap: break-word; font-size: 9pt; line-height: 1.5;">${aiFeedback.replace(/\n/g, '<br/>')}</div>
  `;

  const attributions = groundingMetadata?.groundingAttributions;
  if (attributions && attributions.length > 0) {
    htmlContent += `
      <h3 style="font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Fuentes Consultadas por IA (Google Search)</h3>
    `;
    if (groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0) {
        htmlContent += `<p style="font-size: 8pt; margin-bottom: 5px;">Consultas: ${groundingMetadata.webSearchQueries.join(', ')}</p>`;
    }
    htmlContent += `<ul style="font-size: 9pt; list-style-type: disc; padding-left: 20px;">`;
    attributions.forEach(attr => {
      const source = attr.web || attr.retrievedContext;
      if (source && source.uri) {
        htmlContent += `<li style="margin-bottom: 5px;"><a href="${source.uri}" target="_blank" style="color: blue; text-decoration: underline;">${source.title || source.uri}</a></li>`;
      }
    });
    htmlContent += `</ul>`;
  }

  htmlContent += `</div>`;
  reportElement.innerHTML = htmlContent;
  
  try {
    const { jsPDF: JSPDFConstructor } = window.jspdf;
    const canvas = await html2canvas(reportElement, {
      scale: 2, 
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new JSPDFConstructor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`Informe_${studentName.replace(/\s+/g, '_')}_${evaluationDate}.pdf`);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
  } finally {
    if (reportElement && reportElement.parentElement === document.body) {
       document.body.removeChild(reportElement); 
    }
  }
}