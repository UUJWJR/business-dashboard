import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPNG(element: HTMLElement, filename = 'page-builder') {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportToPDF(element: HTMLElement, filename = 'page-builder') {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 297; // A4 landscape width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('l', 'mm', 'a4');
  const pageHeight = 210; // A4 landscape height in mm

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}
