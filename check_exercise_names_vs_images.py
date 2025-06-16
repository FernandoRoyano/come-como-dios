import json
import os
import unicodedata

def normalizar_nombre(nombre):
    nombre = nombre.lower()
    nombre = unicodedata.normalize('NFD', nombre).encode('ascii', 'ignore').decode('utf-8')
    nombre = nombre.replace('°', '')
    nombre = nombre.replace(' ', '-')
    nombre = nombre.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n')
    nombre = ''.join(c for c in nombre if c.isalnum() or c == '-')
    nombre = nombre.replace('--', '-')
    return nombre.strip('-')

json_path = './src/data/ejercicios.json'
imagenes_path = './public/ejercicios/'

with open(json_path, encoding='utf-8') as f:
    ejercicios = json.load(f)

archivos_imagen = set(os.listdir(imagenes_path))

print('--- REPORTE DE COINCIDENCIAS ---')
for ej in ejercicios:
    nombre = ej['nombre']
    img = ej.get('imagen', '').strip()
    nombre_norm = normalizar_nombre(nombre) + '.png'
    if img:
        if img in archivos_imagen:
            print(f'✔ {nombre} => {img} (existe)')
        else:
            print(f'✗ {nombre} => {img} (NO existe)')
    else:
        if nombre_norm in archivos_imagen:
            print(f'⚠ {nombre} (sin imagen en JSON, pero existe {nombre_norm})')
        else:
            print(f'✗ {nombre} (sin imagen y sin archivo {nombre_norm})')
