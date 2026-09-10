import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import { buildDynamicTableOfContents, buildDynamicTableOfFigures } from './reportSynchronizer';
import { analyticsService } from './analyticsService';

export async function exportDITReportToDocx(reportData) {
  const { metadata = {}, preliminaries = {}, chapters = [] } = reportData || {};
  const uniName = metadata.universityName || 'DAR ES SALAAM INSTITUTE OF TECHNOLOGY (DIT)';
  const uniAcronym = metadata.universityId ? metadata.universityId.toUpperCase() : 'DIT';
  const moduleTitle = metadata.module ? `${metadata.module} TECHNICAL REPORT` : 'INDUSTRIAL PRACTICAL TRAINING (IPT) TECHNICAL REPORT';
  const dynamicTOC = buildDynamicTableOfContents(reportData);
  const dynamicFigures = buildDynamicTableOfFigures(reportData);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
            color: '000000'
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              after: 120
            },
            alignment: AlignmentType.JUSTIFIED
          }
        }
      }
    },
    sections: [
      // ================= SECTION 1: COVER PAGE (1 Page) =================
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.5), // 1.5" standard left margin for binding
              right: convertInchesToTwip(1.0)
            }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: String(uniName).toUpperCase(),
                bold: true,
                size: 28
              })
            ]
          }),

          // Logo / Crest Box
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 180 },
            children: [
              new TextRun({
                text: `[ ${uniAcronym} OFFICIAL EMBLEM / CREST ]`,
                bold: true,
                size: 22,
                color: '444444'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 360 },
            children: [
              new TextRun({
                text: String(moduleTitle).toUpperCase(),
                bold: true,
                size: 26
              })
            ]
          }),

          // Cover Metadata Table with explicit column widths
          buildCoverFieldsTable(metadata)
        ]
      },

      // ================= SECTION 2: PRELIMINARY PAGES (i, ii, iii, iv, v, vi) =================
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.LOWER_ROMAN
            },
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.5),
              right: convertInchesToTwip(1.0)
            }
          }
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT]
                  })
                ]
              })
            ]
          })
        },
        children: [
          // i. ABSTRACT
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'ABSTRACT', bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 300 },
            children: [
              new TextRun({ 
                text: String(preliminaries.abstract || preliminaries.executiveSummary || 'This report documents the industrial practical training undertaken in the field, detailing operations performed, tools utilized, skills acquired, technical gaps identified, and recommendations formulated.').trim() 
              })
            ]
          }),

          // ii. ACKNOWLEDGEMENT
          new PageBreak(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'ACKNOWLEDGEMENT', bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 300 },
            children: [
              new TextRun({ 
                text: String(preliminaries.acknowledgement || `I express my sincere gratitude to Almighty God for guidance and good health throughout the practical training period. Special appreciation goes to the management and staff of ${metadata.firm || 'the host company'}, as well as academic supervisors at ${uniName} for their continuous support and professional mentorship.`).trim() 
              })
            ]
          }),

          // iii. DECLARATION
          new PageBreak(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'DECLARATION', bold: true, size: 28 })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
            children: [
              new TextRun({ 
                text: String(preliminaries.declaration || `I, ${metadata.studentName || 'the student'}, declare that this practical training technical report is my own original work conducted under supervision, and that it has not been submitted for any other academic award at ${uniName} or any other institution.`).trim() 
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: 'Signature: __________________________', bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'Date: ______________________________' })]
          }),

          // iv. LIST OF ABBREVIATIONS
          new PageBreak(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'LIST OF ABBREVIATIONS', bold: true, size: 28 })]
          }),
          buildAbbreviationsTable(preliminaries.abbreviations, uniAcronym, uniName),

          // v. TABLE OF FIGURES
          new PageBreak(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'TABLE OF FIGURES', bold: true, size: 28 })]
          }),
          buildTableOfFiguresTable(dynamicFigures),

          // vi. TABLE OF CONTENTS
          new PageBreak(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: 'TABLE OF CONTENTS', bold: true, size: 28 })]
          }),
          buildTableOfContentsTable(dynamicTOC)
        ]
      },

      // ================= SECTION 3: BODY CHAPTERS (1, 2, 3, 4, 5 + REFERENCES) =================
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL
            },
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.5),
              right: convertInchesToTwip(1.0)
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${uniAcronym} Technical Report | ${metadata.studentName || 'Student Report'}`,
                    italics: true,
                    size: 18,
                    color: '666666'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT]
                  })
                ]
              })
            ]
          })
        },
        children: buildChaptersParagraphs(chapters, metadata)
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanStudent = (metadata.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanFilename = `${uniAcronym}_Report_${cleanStudent}.docx`;
  saveAs(blob, cleanFilename);

  // Record analytics telemetry
  try {
    analyticsService.recordDocxExport({
      studentName: metadata.studentName || 'Student',
      university: uniAcronym || 'DIT',
      pages: 32
    });
  } catch (err) {
    console.warn('Failed to record docx export telemetry:', err);
  }
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
};

const lightCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }
};

function buildCoverFieldsTable(metadata = {}) {
  const isIFM = metadata.universityId === 'ifm';

  const fields = isIFM ? [
    { label: 'FACULTY:', value: metadata.faculty || 'FACULTY OF INSURANCE AND BANKING' },
    { label: 'DEPARTMENT:', value: metadata.department?.toUpperCase() || 'DEPARTMENT OF INSURANCE' },
    { label: 'PROGRAMME:', value: metadata.program || metadata.courseName?.toUpperCase() || 'BACHELOR OF SCIENCE IN INSURANCE AND RISK MANAGEMENT' },
    { label: 'YEAR OF STUDY:', value: metadata.yearOfStudy || metadata.classCode || 'YEAR THREE' },
    { label: 'ACADEMIC YEAR:', value: metadata.academicYear || '2025/2026' },
    { label: 'COURSE CODE:', value: metadata.courseCode || 'IRU08505: FIELD AND PROJECT WORK PRACTICE' },
    { label: 'HOST ORGANIZATION:', value: metadata.firm || metadata.companyName?.toUpperCase() || 'NATIONAL SOCIAL SECURITY FUND (NSSF)' },
    { label: 'CANDIDATE NAME:', value: metadata.studentName || 'CANDIDATE NAME' },
    { label: 'REGISTRATION NO:', value: metadata.admissionNo || metadata.regNumber || 'IMC/BIRM/2312472' },
    { label: 'SUPERVISION DATE:', value: metadata.supervisionDate || '18th FEBRUARY 2026' },
    { label: 'SUPERVISOR:', value: metadata.instituteSupervisor || metadata.academicSupervisor || 'SUPERVISOR' }
  ] : [
    { label: 'STUDENT NAME:', value: metadata.studentName || 'STUDENT NAME' },
    { label: 'DEPARTMENT:', value: metadata.department?.toUpperCase() || 'COMPUTER STUDIES' },
    { label: 'ADMISSION NUMBER:', value: metadata.admissionNo || metadata.regNumber || '21023022415' },
    { label: 'PROGRAM:', value: metadata.program || metadata.courseName?.toUpperCase() || 'BACHELOR OF ENGINEERING' },
    { label: 'NTA LEVEL:', value: metadata.ntaLevel || 'NTA LEVEL 7' },
    { label: 'CLASS:', value: metadata.classCode || 'BENG23COE' },
    { label: 'MODULE:', value: metadata.module || 'INDUSTRIAL PRACTICAL TRAINING (IPT)' },
    { label: 'FIRM:', value: metadata.firm || metadata.companyName?.toUpperCase() || 'HOST INDUSTRIAL ENTERPRISE' },
    { label: "FIRM'S SUPERVISOR:", value: metadata.firmSupervisor || metadata.industrialSupervisor || 'Eng. Field Supervisor' },
    { label: 'INSTITUTE SUPERVISOR:', value: metadata.instituteSupervisor || metadata.academicSupervisor || 'Dr. Institute Supervisor' },
    { label: 'ACADEMIC YEAR:', value: metadata.academicYear || '2024/2025' },
    { label: 'FIELD SPAN:', value: metadata.fieldSpan || 'FROM 5 AUGUST 2024 TO 5 OCTOBER 2024' }
  ];

  const col1Width = isIFM ? 3400 : 3600;
  const col2Width = isIFM ? 5600 : 5400;

  const rows = fields.map(f => (
    new TableRow({
      children: [
        new TableCell({
          width: { size: col1Width, type: WidthType.DXA },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { after: 70 },
              children: [new TextRun({ text: f.label, bold: true, size: 21 })]
            })
          ]
        }),
        new TableCell({
          width: { size: col2Width, type: WidthType.DXA },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { after: 70 },
              children: [new TextRun({ text: String(f.value || ' '), bold: true, size: 21 })]
            })
          ]
        })
      ]
    })
  ));

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [col1Width, col2Width],
    rows
  });
}

function buildAbbreviationsTable(abbreviations, uniAcronym = 'DIT', uniName = 'Dar es Salaam Institute of Technology') {
  const items = Array.isArray(abbreviations) && abbreviations.length > 0 ? abbreviations : [
    { term: uniAcronym, definition: uniName },
    { term: 'IPT', definition: 'Industrial Practical Training' },
    { term: 'LAN', definition: 'Local Area Network' },
    { term: 'VLAN', definition: 'Virtual Local Area Network' },
    { term: 'UTP', definition: 'Unshielded Twisted Pair' },
    { term: 'CLI', definition: 'Command Line Interface' }
  ];

  const col1 = 2500;
  const col2 = 6500;

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: col1, type: WidthType.DXA },
          borders: lightCellBorders,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Abbreviation', bold: true, size: 22 })] })]
        }),
        new TableCell({
          width: { size: col2, type: WidthType.DXA },
          borders: lightCellBorders,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Full Description', bold: true, size: 22 })] })]
        })
      ]
    }),
    ...items.map(item => (
      new TableRow({
        children: [
          new TableCell({
            width: { size: col1, type: WidthType.DXA },
            borders: lightCellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: String(item.term || ' '), bold: true, size: 22 })] })]
          }),
          new TableCell({
            width: { size: col2, type: WidthType.DXA },
            borders: lightCellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: String(item.definition || ' '), size: 22 })] })]
          })
        ]
      })
    ))
  ];

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [col1, col2],
    rows
  });
}

function buildTableOfFiguresTable(figures = []) {
  const col1 = 2500;
  const col2 = 5300;
  const col3 = 1200;

  if (!figures || figures.length === 0) {
    return new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [9000],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 9000, type: WidthType.DXA },
              borders: lightCellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'No figures recorded in this report.', italics: true, size: 22 })] })]
            })
          ]
        })
      ]
    });
  }

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: col1, type: WidthType.DXA },
          borders: lightCellBorders,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Figure No.', bold: true, size: 22 })] })]
        }),
        new TableCell({
          width: { size: col2, type: WidthType.DXA },
          borders: lightCellBorders,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Title / Description', bold: true, size: 22 })] })]
        }),
        new TableCell({
          width: { size: col3, type: WidthType.DXA },
          borders: lightCellBorders,
          shading: { fill: 'F2F2F2' },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Page', bold: true, size: 22 })] })]
        })
      ]
    }),
    ...figures.map(fig => (
      new TableRow({
        children: [
          new TableCell({
            width: { size: col1, type: WidthType.DXA },
            borders: lightCellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: String(fig.figureNo || ' '), bold: true, size: 22 })] })]
          }),
          new TableCell({
            width: { size: col2, type: WidthType.DXA },
            borders: lightCellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: String(fig.title || ' '), size: 22 })] })]
          }),
          new TableCell({
            width: { size: col3, type: WidthType.DXA },
            borders: lightCellBorders,
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(fig.page || ' '), size: 22 })] })]
          })
        ]
      })
    ))
  ];

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [col1, col2, col3],
    rows
  });
}

function buildTableOfContentsTable(toc = []) {
  const col1 = 7600;
  const col2 = 1400;

  if (!toc || toc.length === 0) {
    return new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [9000],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 9000, type: WidthType.DXA },
              borders: lightCellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Table of contents will be generated upon chapter completion.', italics: true, size: 22 })] })]
            })
          ]
        })
      ]
    });
  }

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: col1, type: WidthType.DXA },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text: 'Section / Chapter Heading', bold: true, size: 22 })]
            })
          ]
        }),
        new TableCell({
          width: { size: col2, type: WidthType.DXA },
          borders: noBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [new TextRun({ text: 'Page', bold: true, size: 22 })]
            })
          ]
        })
      ]
    }),
    ...toc.map(item => (
      new TableRow({
        children: [
          new TableCell({
            width: { size: col1, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: `${item.level > 1 ? '      ' : ''}${item.code}   ${item.title}`,
                    bold: item.level === 1,
                    size: 22
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: col2, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60 },
                children: [
                  new TextRun({ 
                    text: String(item.page || ' '), 
                    bold: item.level === 1, 
                    size: 22 
                  })
                ]
              })
            ]
          })
        ]
      })
    ))
  ];

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [col1, col2],
    rows
  });
}

function buildChaptersParagraphs(chapters = [], metadata = {}) {
  const elements = [];
  const uniName = metadata.universityName || 'Dar es Salaam Institute of Technology (DIT)';

  chapters.forEach((chap, idx) => {
    if (idx > 0) {
      elements.push(new PageBreak());
    }

    // Chapter Header
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: `CHAPTER ${chap.number === 1 ? 'ONE' : chap.number === 2 ? 'TWO' : chap.number === 3 ? 'THREE' : chap.number === 4 ? 'FOUR' : 'FIVE'}`,
            bold: true,
            size: 28
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({
            text: String(chap.title || '').toUpperCase(),
            bold: true,
            size: 26
          })
        ]
      })
    );

    // Chapter Sections
    (chap.sections || []).forEach(sec => {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: `${sec.code}  ${sec.title}`,
              bold: true,
              size: 24
            })
          ]
        })
      );

      // Section Body Content
      const lines = String(sec.content || '').split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          elements.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 140 },
              children: [
                new TextRun({
                  text: trimmed,
                  size: 24
                })
              ]
            })
          );
        }
      });

      // Section Figure caption
      if (sec.imageCaption || sec.image) {
        elements.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 160 },
            children: [
              new TextRun({
                text: `[ Figure: ${sec.imageCaption || `${sec.title} Execution and Testing`} ]`,
                italics: true,
                bold: true,
                size: 22,
                color: '333333'
              })
            ]
          })
        );
      }
    });
  });

  // References Section
  elements.push(
    new PageBreak(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 360 },
      children: [
        new TextRun({
          text: 'REFERENCES',
          bold: true,
          size: 28
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `[1] ${uniName}, "Practical Training Guidelines for Engineering and Technology Programmes", Academic Press, 2024.`
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: '[2] IEEE Standards Association, "IEEE Standards for Information Technology and Telecommunications Systems", IEEE Computer Society, 2023.'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: '[3] Occupational Safety and Health Authority (OSHA) Tanzania, "General Guidelines on Safety in Engineering Workplaces", 2023.'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: '[4] Engineers Registration Board (ERB) / TCRA Tanzania, "National Technical Guidelines on Engineering Infrastructure & Systems", 2023.'
        })
      ]
    })
  );

  return elements;
}
