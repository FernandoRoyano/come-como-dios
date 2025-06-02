import PyPDF2

pdf_path = r'public/libros/PowerExplosive_entrenamiento_eficiente._Explota_tus_limites._David_Marchante_IA.pdf'
out_path = r'src/data/libro_powerexplosive.txt'

with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ''
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + '\n'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write(text)

print('¡Extracción completada!')