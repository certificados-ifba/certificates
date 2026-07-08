export interface PdfPage {
  backgroundImageUrl?: string
  contentHtml: string
  validationCode?: string
}

export interface GenerateCertificatePdfOptions {
  pages: PdfPage[]
  filename: string
}


export async function generateCertificatePdf(
  options: GenerateCertificatePdfOptions
): Promise<void> {
  if (typeof window === 'undefined') return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const { pages, filename } = options
  const MM_W = 297
  const MM_H = 210
  const SCALE = 2
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  for (let i = 0; i < pages.length; i++) {
    const { backgroundImageUrl, contentHtml, validationCode } = pages[i]
    const container = document.createElement('div')
    Object.assign(container.style, {
      position: 'absolute',
      left: '-9999px',
      top: '0px',
      width: `${MM_W}mm`,
      height: `${MM_H}mm`,
      overflow: 'hidden',
      boxSizing: 'border-box',
      margin: '0',
      padding: '0',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#1f2933',
      backgroundColor: '#fff',
    })

    container.innerHTML = `
      <div style="position:relative;width:100%;height:100%;overflow:hidden;">
        ${backgroundImageUrl
          ? `<img
              src="${backgroundImageUrl}"
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
              crossorigin="anonymous"
            />`
          : ''}
        <div style="
          position:relative;
          z-index:1;
          display:flex;
          align-items:center;
          justify-content:center;
          height:100%;
          padding:15mm;
          text-align:center;
        ">
          <div style="width:100%;">${contentHtml}</div>
        </div>
        ${validationCode
          ? `<div style="
              position:absolute;
              bottom:8mm;
              left:0;
              right:0;
              text-align:center;
              font-family:Arial,sans-serif;
              font-size:9px;
              z-index:2;
            ">Código: <strong>${validationCode}</strong></div>`
          : ''}
      </div>
    `

    document.body.appendChild(container)

    try {
      const imgs = Array.from(container.querySelectorAll('img'))
      await Promise.all(
        imgs.map(
          img =>
            new Promise<void>(resolve => {
              if (img.complete) {
                resolve()
              } else {
                img.onload = () => resolve()
                img.onerror = () => resolve()
              }
            })
        )
      )

      const canvas = await html2canvas(container, {
        scale: SCALE,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: container.offsetWidth,
        height: container.offsetHeight,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, 0, MM_W, MM_H)
    } finally {
      document.body.removeChild(container)
    }
  }

  pdf.save(`${filename}.pdf`)
}
