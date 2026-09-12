import { jsPDF } from 'jspdf';
import { Analysis } from '../types/bioinformatics';

export const downloadPdfReport = (analysis: Analysis): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MutaTrack — Integrated Variant Calling Report', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DNA-Seq GATK Best Practices Automated Workflow Summary', 14, 18);
  doc.text(`Generated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`, pageWidth - 14, 18, { align: 'right' });

  y = 36;

  // Section: Metadata
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Sample & Execution Metadata', 14, y);
  y += 6;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const leftX = 18;
  const midX = 110;
  let metaY = y + 7;

  doc.text(`Analysis ID:`, leftX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.id, leftX + 30, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Status:`, midX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(analysis.status === 'Completed' ? 16 : 220, analysis.status === 'Completed' ? 149 : 38, 70);
  doc.text(analysis.status.toUpperCase(), midX + 28, metaY);

  metaY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Sample ID:`, leftX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.sampleId, leftX + 30, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Reference Genome:`, midX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.referenceGenome, midX + 32, metaY);

  metaY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Project Name:`, leftX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.projectName, leftX + 30, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Annotation DB:`, midX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.annotationDb, midX + 32, metaY);

  metaY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Pipeline Version:`, leftX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.pipelineVersion, leftX + 30, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Duration:`, midX, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.duration || 'N/A', midX + 32, metaY);

  y += 46;

  // Section 2: Quality & Alignment Metrics (Single Canvas)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Workflow & QC Metrics Summary', 14, y);
  y += 6;

  const colWidth = (pageWidth - 28 - 9) / 4;
  const metricsBoxY = y;
  const cardData = [
    { label: 'Q30 Quality Score', val: `${analysis.metrics.fastq.q30ScorePct}%`, sub: 'Target: > 85.0%' },
    { label: 'Alignment Rate', val: `${analysis.metrics.alignment.mappingPercentage}%`, sub: `${(analysis.metrics.alignment.mappedReads / 1e6).toFixed(1)}M reads` },
    { label: 'Mean Read Depth', val: `${analysis.metrics.bamProcessing.meanReadDepth}x`, sub: 'Target: >= 30x' },
    { label: 'Passed Variants', val: `${analysis.metrics.filtering.variantsAfter}`, sub: `${analysis.metrics.filtering.filterPassRatePct}% pass rate` }
  ];

  cardData.forEach((card, idx) => {
    const cardX = 14 + idx * (colWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, metricsBoxY, colWidth, 22, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, cardX + 3, metricsBoxY + 5);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(card.val, cardX + 3, metricsBoxY + 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(card.sub, cardX + 3, metricsBoxY + 18);
  });

  y += 28;

  // Section 3: Variant Distribution
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Variant Classification & Functional Impact', 14, y);
  y += 6;

  const varCardData = [
    { label: 'Total Variants', val: String(analysis.metrics.variantCalling.totalVariants), color: [15, 23, 42] },
    { label: 'SNPs', val: String(analysis.metrics.variantCalling.snps), color: [2, 132, 199] },
    { label: 'INDELs', val: String(analysis.metrics.variantCalling.indels), color: [147, 51, 234] },
    { label: 'High Impact', val: String(analysis.metrics.annotation.highImpact), color: [220, 38, 38] },
    { label: 'Moderate Impact', val: String(analysis.metrics.annotation.moderateImpact), color: [217, 119, 6] },
    { label: 'Low / Modifier', val: String(analysis.metrics.annotation.lowImpact + analysis.metrics.annotation.modifierImpact), color: [71, 85, 105] }
  ];

  const varColWidth = (pageWidth - 28 - 15) / 6;
  varCardData.forEach((vCard, idx) => {
    const cardX = 14 + idx * (varColWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, varColWidth, 18, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(vCard.label, cardX + 2.5, y + 5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(vCard.color[0], vCard.color[1], vCard.color[2]);
    doc.text(vCard.val, cardX + 2.5, y + 13);
  });

  y += 24;

  // Section 4: Key Identified Variants Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. High & Moderate Impact Variants Table', 14, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('Gene', 18, y + 4.8);
  doc.text('Location (Chr:Pos)', 36, y + 4.8);
  doc.text('Change', 74, y + 4.8);
  doc.text('Effect', 94, y + 4.8);
  doc.text('Impact', 130, y + 4.8);
  doc.text('Depth', 150, y + 4.8);
  doc.text('ClinVar / Classification', 165, y + 4.8);

  y += 7;

  // Variants rows (top 10)
  const topVariants = analysis.variants.slice(0, 10);
  topVariants.forEach((v, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, pageWidth - 14, y + 7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(v.gene, 18, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${v.chromosome}:${v.position}`, 36, y + 4.8);
    
    // change format
    const refDisplay = v.reference.length > 5 ? `${v.reference.substring(0, 4)}...` : v.reference;
    const altDisplay = v.alternate.length > 5 ? `${v.alternate.substring(0, 4)}...` : v.alternate;
    doc.text(`${refDisplay} > ${altDisplay}`, 74, y + 4.8);

    doc.text(v.effect.replace(/_/g, ' '), 94, y + 4.8);

    // Impact color
    if (v.impact === 'HIGH') doc.setTextColor(220, 38, 38);
    else if (v.impact === 'MODERATE') doc.setTextColor(217, 119, 6);
    else doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(v.impact, 130, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${v.depth}x`, 150, y + 4.8);

    const clinvarText = v.clinvar ? (v.clinvar.length > 20 ? `${v.clinvar.substring(0, 19)}...` : v.clinvar) : 'Unclassified';
    doc.text(clinvarText, 165, y + 4.8);

    y += 7;
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by MutaTrack Integrated Variant Calling Platform (GATK / Snakemake Best Practices Workflow Pipeline).', 14, 285);
  doc.text(`Page 1 of 1`, pageWidth - 14, 285, { align: 'right' });

  // Save
  doc.save(`${analysis.sampleId}_${analysis.id}_clinical_report.pdf`);
};
