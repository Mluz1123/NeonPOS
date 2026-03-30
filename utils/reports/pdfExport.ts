import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportData {
  stats: any;
  categorySales: { name: string; value: number }[];
  growth: { growth: number; diff: number };
  recentSales: any[];
}

export async function exportReportToPDF(data: ReportData) {
  const doc = new jsPDF();
  const today = format(new Date(), "d 'de' MMMM, yyyy HH:mm", { locale: es });

  // Header - Neon Style Simulation
  doc.setFillColor(15, 23, 42); // background-dark
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(158, 255, 0); // primary
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('NeonPOS', 15, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('REPORTE DE INTELIGENCIA DE NEGOCIOS', 15, 33);
  doc.text(`Fecha: ${today}`, 195, 33, { align: 'right' });

  // Section 1: Business Overview
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen de KPIs', 15, 50);
  
  autoTable(doc, {
    startY: 55,
    head: [['Indicador', 'Valor']],
    body: [
      ['Ventas de Hoy', `$${data.stats.today_sales.toFixed(2)}`],
      ['Total de Pedidos Hoy', `${data.stats.today_orders}`],
      ['Crecimiento Mensual', `${data.growth.growth >= 0 ? '+' : ''}${data.growth.growth}%`],
      ['Diferencia vs Mes Anterior', `${data.growth.diff >= 0 ? '+' : '-'}$${Math.abs(data.growth.diff).toFixed(2)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Section 2: Distribution Chart simulation
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('2. Distribución de Ventas por Categoría', 15, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Categoría', 'Porcentaje (%)']],
    body: data.categorySales.map(c => [c.name, `${c.value}%`]),
    theme: 'striped',
    headStyles: { fillColor: [158, 255, 0], textColor: [15, 23, 42] },
  });

  // Section 3: Detailed Sales Log
  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('3. Registro Reciente de Ventas', 15, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['ID', 'Fecha', 'Pago', 'Artículos', 'Total']],
    body: data.recentSales.slice(0, 50).map(s => [
      s.id.split('-')[0].toUpperCase(),
      format(new Date(s.created_at), 'dd/MM/yy HH:mm'),
      s.payment_method === 'cash' ? 'EFECTIVO' : 
      s.payment_method === 'card' ? 'TARJETA' : 
      'TRANSFERENCIA',
      s.items.length,
      `$${Number(s.total_amount).toFixed(2)}`
    ]),
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} - Generado por NeonPOS Cloud Engine`, 105, 285, { align: 'center' });
  }

  doc.save(`NeonPOS_Reporte_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}
